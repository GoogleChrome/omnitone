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
 * @fileOverview Omnitone HOA decoder.
 */

// Internal dependencies.
var AudioBufferManager = require('./audiobuffer-manager.js');
var HOARotator = require('./hoa-rotator.js');
var HOAConvolver = require('./hoa-convolver.js');
var Utils = require('./utils.js');
var SystemVersion = require('./version.js');

// HRIRs for optimized HOA rendering.
// TODO(hongchan): change this with the absolute URL.
var SH_MAXRE_HRIR_URLS = [
  'resources/sh_hrir_o_3_ch0-ch7.wav',
  'resources/sh_hrir_o_3_ch8-ch15.wav'];

/**
 * @class Omnitone FOA renderer class. Uses the optimized convolution technique.
 * @param {AudioContext} context            Associated AudioContext.
 * @param {Object} options
 * @param {String} options.HRIRUrls         Optional HRIR URL.
 * @param {String} options.renderingMode    Rendering mode.
 * @param {Number} options.ambisonicOrder   Ambisonic order (default is 3).
 */
function HOARenderer(context, options) {
  this._context = context;

  // Priming internal setting with |options|.
  this._HRIRUrls = SH_MAXRE_HRIR_URLS;
  this._renderingMode = 'ambisonic';
  this._ambisonicOrder = 3;
  if (options) {
    if (options.HRIRUrl)
      this._HRIRUrls = options.HRIRUrl;
    if (options.renderingMode)
      this._renderingMode = options.renderingMode;
    if (options.ambisonicOrder)
      this._ambisonicOrder = options.ambisonicOrder;
  }

  this._isRendererReady = false;
}


/**
 * Initialize and load the resources for the decode.
 * @return {Promise}
 */
HOARenderer.prototype.initialize = function () {
  Utils.log('Version: ' + SystemVersion);
  Utils.log('Initializing... (mode: ' + this._renderingMode + ')');
  Utils.log('Rendering via SH-MaxRE convolution.');

  this._tempMatrix4 = new Float32Array(16);
  this._buffersLoaded = 0;
  this._buffers = [];

  return new Promise(this._initializeCallback.bind(this));
};


/**
 * Internal callback handler for |initialize| method.
 * @param {Function} resolve Promise resolution.
 * @param {Function} reject Promise rejection.
 */
HOARenderer.prototype._initializeCallback = function (resolve, reject) {
  var key = 'HOA_HRIR_AUDIOBUFFER';
  var buffer;
  var totalChannels = 0;
  for (var i = 0; i < this._HRIRUrls.length; i++) {
    new AudioBufferManager(
      this._context,
      [{ name: i, url: this._HRIRUrls[i] }],
      function (result) {
        var val = result.keys().next().value;

        // Allocate buffers when loading first file in list.
        // This assumes all files have the same length and sampleRate.
        if (this._buffersLoaded == 0) {
          var acn_channels =
            (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);
          var length = result.get(val).length;
          var sampleRate = result.get(val).sampleRate;
          buffer =
            this._context.createBuffer(acn_channels, length, sampleRate);
        }

        // Tally the number of channels in each file, confirm counts match.
        var numberOfChannels = result.get(val).numberOfChannels;
        totalChannels += numberOfChannels;

        // Assign file contents to appropriate buffer channel.
        var offset = val * numberOfChannels;
        for (var j = 0; j < numberOfChannels; j++) {
          buffer.getChannelData(j + offset)
            .set(result.get(val).getChannelData(j));
        }

        this._buffersLoaded++;
        // All files have been loaded into buffer object.
        if (this._buffersLoaded == this._HRIRUrls.length) {
          // Create AudioNodes.
          this.input = this._context.createGain();
          this._bypass = this._context.createGain();
          this._hoaRotator =
            new HOARotator(this._context, this._ambisonicOrder);
          var conv_options =
            { IR: buffer, ambisonicOrder: this._ambisonicOrder };
          this._hoaConvolver = new HOAConvolver(this._context, conv_options);
          this.output = this._context.createGain();

          this.input.connect(this._hoaRotator.input);
          this.input.connect(this._bypass);
          this._hoaRotator.output.connect(this._hoaConvolver.input);
          this._hoaConvolver.output.connect(this.output);

          this.setRenderingMode(this._renderingMode);

          this._isRendererReady = true;

          // Ensure the correct number of channels. Warn otherwise.
          if (totalChannels != buffer.numberOfChannels) {
            Utils.log(['Warning: Only ' + totalChannels +
              ' HRIRs were loaded (expected ' + buffer.numberOfChannels +
              '). The renderer will not function as expected.']);
          } else {
            Utils
              .log('HRIRs are loaded successfully. The renderer is ready.');
          }
          resolve();
        }
      }.bind(this),
      function (buffers) {
        var errorMessage = 'Initialization failed: ' + key + ' is '
          + buffers.get(0) + '.';
        Utils.log(errorMessage);
        reject(errorMessage);
      });
  }
};


/**
 * Set the rotation matrix for the sound field rotation.
 * @param {Array} rotationMatrix      3x3 rotation matrix (row-major
 *                                    representation)
 */
HOARenderer.prototype.setRotationMatrix = function (rotationMatrix) {
  if (!this._isRendererReady)
    return;

  this._hoaRotator.setRotationMatrix(rotationMatrix);
};


/**
 * Update the rotation matrix from a Three.js camera object.
 * @param  {Object} cameraMatrix      The Matrix4 obejct of Three.js the camera.
 */
HOARenderer.prototype.setRotationMatrixFromCamera = function (cameraMatrix) {
  if (!this._isRendererReady)
    return;

  // Extract the inner array elements and inverse. (The actual view rotation is
  // the opposite of the camera movement.)
  Utils.invertMatrix4(this._tempMatrix4, cameraMatrix.elements);
  this._hoaRotator.setRotationMatrix4(this._tempMatrix4);
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
HOARenderer.prototype.setRenderingMode = function (mode) {
  if (mode === this._renderingMode)
    return;

  switch (mode) {
    // Bypass mode: The convolution path is disabled, disconnected (thus consume
    // no CPU). Use bypass gain node to pass-through the input stream.
    case 'bypass':
      this._renderingMode = 'bypass';
      this._hoaConvolver.disable();
      this._bypass.connect(this.output);
      break;

    // Ambisonic mode: Use the convolution and shut down the bypass path.
    case 'ambisonic':
      this._renderingMode = 'ambisonic';
      this._hoaConvolver.enable();
      this._bypass.disconnect();
      break;

    // Off mode: Shut down all sound from the renderer.
    case 'off':
      this._renderingMode = 'off';
      this._hoaConvolver.disable();
      this._bypass.disconnect();
      break;

    default:
      // Unsupported mode. Ignore it.
      Utils.log('Rendering mode "' + mode + '" is not supported.');
      return;
  }

  Utils.log('Rendering mode changed. (' + mode + ')');
};


module.exports = HOARenderer;