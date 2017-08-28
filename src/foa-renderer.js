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


/**
 * @file Omnitone FOARenderer. This is user-facing API for the first-order
 * ambisonic decoder and the optimized binaural renderer.
 */


'use strict';

var AudioBufferManager = require('./audiobuffer-manager.js');
var FOAConvolver = require('./foa-convolver.js');
var FOARotator = require('./foa-rotator.js');
var FOARouter = require('./foa-router.js');
var HRIRManager = require('./hrir-manager.js');
var Utils = require('./utils.js');
var Version = require('./version.js');


/**
 * @typedef {string} RenderingMode
 */

/**
 * Rendering mode ENUM.
 * @enum {RenderingMode}
 */
var RenderingMode = {
  /** @type {string} Use ambisonic rendering. */
  AMBISONIC: 'ambisonic',
  /** @type {string} Bypass. No ambisonic rendering. */
  BYPASS: 'bypass',
  /** @type {string} Disable audio output. */
  OFF: 'off'
};


/**
 * Omnitone FOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} config
 * @param {Array} [config.channelMap] - Custom channel routing map. Useful for
 * handling the inconsistency in browser's multichannel audio decoding.
 * @param {Array} [config.hrirPathList] - A list of paths to HRIR files. It
 * overrides the internal HRIR list if given.
 * @param {RenderingMode} [config.renderingMode='ambisonic'] - Rendering mode.
 */
function FOARenderer (context, config) {
  this._context = Utils.isAudioContext(context)
      ? context
      : Utils.throw('FOARenderer: Invalid BaseAudioContext.');

  this._config = {};

  if (config.channelMap &&
      Array.isArray(config.channelMap)) {
    this._config.channelMap = config.channelMap;
  } else {
    this._config.channelMap = FOARouter.CHANNEL_MAP.DEFAULT;
  }

  if (config.renderingMode &&
      Object.values(RenderingMode).includes(config.renderingMode))) {
    this._config.renderingMode = config.renderingMode;
  } else {
    this._config.renderingMode = RenderingMode.AMBISONIC;
  }

  if (config.hrirPathList) {
    if (Array.isArray(config.hrirPathList) &&
        config.hrirPathList.length === 2) {
      this._config.pathList = config.hrirPathList;
    } else {
      Utils.throw('FOARenderer: Invalid HRIR URLs. It must be an array with ' +
          '2 URLs to HRIR files. (got ' + config.hrirPathList + ')');
    }
  } else {
    // By default, the path list points to GitHub CDN with FOA files.
    // TODO(hoch): update this to Gstatic server when it's available.
    this._config.pathList = HRIRManager.getPathList();
  }

  this._tempMatrix4 = new Float32Array(16);
  this._isRendererReady = false;
}


/**
 * Builds the internal audio graph.
 * @private
 */
FOARenderer.prototype._buildAudioGraph = function() {
  this.input = this._context.createGain();
  this.output = this._context.createGain();
  this._bypass = this._context.createGain();
  this._foaRouter = new FOARouter(this._context, this._channelMap);
  this._foaRotator = new FOARotator(this._context);
  this._foaConvolver = new FOAConvolver(this._context);
  this.input.connect(this._foaRouter.input);
  this.input.connect(this._bypass);
  this._foaRouter.output.connect(this._foaRotator.input);
  this._foaRotator.output.connect(this._foaConvolver.input);
  this._foaConvolver.output.connect(this.output);
};


/**
 * Internal callback handler for |initialize| method.
 * @private
 * @param {function} resolve - Resolution handler.
 * @param {function} reject - Rejection handler.
 */
FOARenderer.prototype._initializeCallback = function (resolve, reject) {
  var bufferLoaderData = [];
  for (var i = 0; i < this._config.pathList.length; ++i)
    bufferLoaderData.push({ name: i, url: this._config.pathList[i] });

  new AudioBufferManager(
      this._context,
      bufferLoaderData,
      function (buffers) {
        this._buildAudioGraph();
        this._foaConvolver.setHRIRBufferList([buffers.get(0), buffers.get(1)]);
        this.setChannelMap(this._config.channelMap);
        this.setRenderingMode(this._config.renderingMode);
        this._isRendererReady = true;
        Utils.log('FOARenderer: HRIRs loaded successfully. Ready.');
        resolve();
      }.bind(this),
      function (buffers) {
        var errorMessage = 'FOARenderer: HRIR loading/decoding failed.';
        Utils.throw(errorMessage);
        reject(errorMessage);
      });
};


/**
 * Initializes and loads the resource for the renderer.
 * @return {Promise}
 */
FOARenderer.prototype.initialize = function () {
  Utils.log('Version: ' + Version + ' (SH-MaxRE convolution)');
  Utils.log('Initializing... (mode: ' + this._config.renderingMode + ')');

  return new Promise(this._initializeCallback.bind(this), function (error) {
    Utils.throw('FOARenderer: Initialization failed.');
  });
};


/**
 * Set the channel map.
 * @param {number[]} channelMap - Custom channel routing for FOA stream.
 */
FOARenderer.prototype.setChannelMap = function (channelMap) {
  if (!this._isRendererReady)
    return;

  if (channelMap.toString() !== this._config.channelMap.toString()) {
    Utils.log('Remapping channels ([' + this._config.channelMap.toString() +
        '] -> [' + channelMap.toString() + ']).');
    this._config.channelMap = channelMap.slice();
    this._foaRouter.setChannelMap(this._config.channelMap);
  }
};


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix3 = function (rotationMatrix3) {
  if (!this._isRendererReady)
    return;

  this._foaRotator.setRotationMatrix3(rotationMatrix3);
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix4 = function (rotationMatrix4) {
  if (!this._isRendererReady)
    return;

  this._foaRotator.setRotationMatrix4(rotationMatrix4);
};


/**
 * Set the rotation matrix from a Three.js camera object. Depreated in V1, and
 * this exists only for the backward compatiblity. Instead, use
 * |setRotatationMatrix4()| with Three.js |camera.worldMatrix.elements|.
 * @deprecated
 * @param {Object} cameraMatrix - Matrix4 from Three.js |camera.matrix|.
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
 * @param {RenderingMode} renderingMode - Decoding mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
FOARenderer.prototype.setRenderingMode = function (mode) {
  if (mode === this._config.renderingMode)
    return;

  switch (mode) {
    case RenderingMode.AMBISONIC:
      this._foaConvolver.enable();
      this._bypass.disconnect();
      break;
    case RenderingMode.BYPASS:
      this._foaConvolver.disable();
      this._bypass.connect(this.output);
      break;
    case RenderingMode.OFF:
      this._foaConvolver.disable();
      this._bypass.disconnect();
      break;
    default:
      Utils.log('FOARenderer: Rendering mode "' + mode + '" is not ' +
          'supported.');
      return;
  }

  this._config.renderingMode = mode;
  Utils.log('FOARenderer: Rendering mode changed. (' + mode + ')');
};


module.exports = FOARenderer;
