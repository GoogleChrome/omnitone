/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * @fileOverview Omnitone FOA decoder.
 */
var AudioBufferManager = require('./audiobuffer-manager.js');
var FOARouter = require('./foa-router.js');
var FOARotator = require('./foa-rotator.js');
var FOAConvolver = require('./foa-convolver.js');
var Utils = require('./utils.js');
var SystemVersion = require('./version.js');

// HRIR for optimized FOA rendering.
// TODO(hongchan): change this with the absolute URL.
var SH_MAXRE_HRIR_URL = 'resources/sh_hrir_o_1.wav';


/**
 * @class Omnitone FOA renderer class. Uses the optimized convolution technique.
 * @param {AudioContext} context          Associated AudioContext.
 * @param {Object} options
 * @param {String} options.HRIRUrl        Optional HRIR URL.
 * @param {String} options.renderingMode  Rendering mode.
 * @param {Array} options.channelMap      Custom channel map.
 */
function FOARenderer (context, options) {
  this._context = context;

  // Priming internal setting with |options|.
  this._HRIRUrl = SH_MAXRE_HRIR_URL;
  this._channelMap = FOARouter.CHANNEL_MAP.DEFAULT;
  this._renderingMode = 'ambisonic';
  if (options) {
    if (options.HRIRUrl)
      this._HRIRUrl = options.HRIRUrl;
    if (options.renderingMode)
      this._renderingMode = options.renderingMode;
    if (options.channelMap)
      this._channelMap = options.channelMap;
  }

  this._isRendererReady = false;
}


/**
 * Initialize and load the resources for the decode.
 * @return {Promise}
 */
FOARenderer.prototype.initialize = function () {
  Utils.log('Version: ' + SystemVersion);
  Utils.log('Initializing... (mode: ' + this._renderingMode + ')');
  Utils.log('Rendering via SH-MaxRE convolution.');

  this._tempMatrix4 = new Float32Array(16);

  return new Promise(this._initializeCallback.bind(this));
};


/**
 * Internal callback handler for |initialize| method.
 * @param {Function} resolve Promise resolution.
 * @param {Function} reject Promise rejection.
 */
FOARenderer.prototype._initializeCallback = function (resolve, reject) {
  var key = 'FOA_HRIR_AUDIOBUFFER';
  new AudioBufferManager(
      this._context,
      [{ name: key, url: this._HRIRUrl }],
      function (buffers) {
        this.input = this._context.createGain();
        this._bypass = this._context.createGain();
        this._foaRouter = new FOARouter(this._context, this._channelMap);
        this._foaRotator = new FOARotator(this._context);
        this._foaConvolver = new FOAConvolver(this._context, {
            IR: buffers.get(key)
          });
        this.output = this._context.createGain();

        this.input.connect(this._foaRouter.input);
        this.input.connect(this._bypass);
        this._foaRouter.output.connect(this._foaRotator.input);
        this._foaRotator.output.connect(this._foaConvolver.input);
        this._foaConvolver.output.connect(this.output);

        this.setChannelMap(this._channelMap);
        this.setRenderingMode(this._renderingMode);

        this._isRendererReady = true;
        Utils.log('HRIRs are loaded successfully. The renderer is ready.');
        resolve();
      }.bind(this),
      function (buffers) {
        var errorMessage = 'Initialization failed: ' + key + ' is ' 
            + buffers.get(0) + '.';
        Utils.log(errorMessage);
        reject(errorMessage);
      });
};

/**
 * Set the channel map.
 * @param {Array} channelMap          A custom channel map for FOA stream.
 */
FOARenderer.prototype.setChannelMap = function (channelMap) {
  if (!this._isRendererReady)
    return;

  if (channelMap.toString() !== this._channelMap.toString()) {
    Utils.log('Remapping channels ([' + this._channelMap.toString() + '] -> ['
      + channelMap.toString() + ']).');
    this._channelMap = channelMap.slice();
    this._foaRouter.setChannelMap(this._channelMap);
  }
};

/**
 * Set the rotation matrix for the sound field rotation.
 * @param {Array} rotationMatrix3     A 3x3 rotation matrix.
 */
FOARenderer.prototype.setRotationMatrix = function (rotationMatrix3) {
  if (!this._isRendererReady)
    return;

  this._foaRotator.setRotationMatrix3(rotationMatrix3);
};

/**
 * Update the rotation matrix from a Three.js camera object.
 * @param  {Object} cameraMatrix      Matrix4 object from Three.js camera.
 */
FOARenderer.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {
  if (!this._isRendererReady)
    return;

  // Extract the inner array elements and inverse. (The actual view rotation is
  // the opposite of the camera movement.)
  Utils.invertMatrix4(this._tempMatrix4, cameraMatrix.elements);
  this._foaRotator.setRotationMatrix4(this._tempMatrix4);
};


/**
 * Set the decoding mode.
 * @param {String} mode               Decoding mode. When the mode is 'bypass'
 *                                    the decoder is disabled and bypass the
 *                                    input stream to the output. Setting the
 *                                    mode to 'ambisonic' activates the decoder.
 *                                    When the mode is 'off', all the
 *                                    processing is completely turned off saving
 *                                    the CPU power.
 */
FOARenderer.prototype.setRenderingMode = function (mode) {
  if (mode === this._renderingMode)
    return;

  switch (mode) {
    // Bypass mode: The convolution path is disabled, disconnected (thus consume
    // no CPU). Use bypass gain node to pass-through the input stream.
    case 'bypass':
      this._renderingMode = 'bypass';
      this._foaConvolver.disable();
      this._bypass.connect(this.output);
      break;

    // Ambisonic mode: Use the convolution and shut down the bypass path.
    case 'ambisonic':
      this._renderingMode = 'ambisonic';
      this._foaConvolver.enable();
      this._bypass.disconnect();
      break;

    // Off mode: Shut down all sound from the renderer.
    case 'off':
      this._renderingMode = 'off';
      this._foaConvolver.disable();
      this._bypass.disconnect();
      break;

    default:
      // Unsupported mode. Ignore it.
      Utils.log('Rendering mode "' + mode + '" is not supported.');
      return;
  }

  Utils.log('Rendering mode changed. (' + mode + ')');
};


module.exports = FOARenderer;
