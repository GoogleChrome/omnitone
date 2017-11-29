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

const BufferList = require('./buffer-list.js');
const FOAConvolver = require('./foa-convolver.js');
const FOAHrirBase64 = require('./resources/omnitone-foa-hrir-base64.js');
const FOARotator = require('./foa-rotator.js');
const FOARouter = require('./foa-router.js');
const Utils = require('./utils.js');


/**
 * @typedef {string} RenderingMode
 */

/**
 * Rendering mode ENUM.
 * @enum {RenderingMode}
 */
const RenderingMode = {
  /** @type {string} Use ambisonic rendering. */
  AMBISONIC: 'ambisonic',
  /** @type {string} Bypass. No ambisonic rendering. */
  BYPASS: 'bypass',
  /** @type {string} Disable audio output. */
  OFF: 'off',
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
function FOARenderer(context, config) {
  this._context = Utils.isAudioContext(context) ?
      context :
      Utils.throw('FOARenderer: Invalid BaseAudioContext.');

  this._config = {
    channelMap: FOARouter.ChannelMap.DEFAULT,
    renderingMode: RenderingMode.AMBISONIC,
  };

  if (config) {
    if (config.channelMap) {
      if (Array.isArray(config.channelMap) && config.channelMap.length === 4) {
        this._config.channelMap = config.channelMap;
      } else {
        Utils.throw(
            'FOARenderer: Invalid channel map. (got ' + config.channelMap
            + ')');
      }
    }

    if (config.hrirPathList) {
      if (Array.isArray(config.hrirPathList) &&
          config.hrirPathList.length === 2) {
        this._config.pathList = config.hrirPathList;
      } else {
        Utils.throw(
            'FOARenderer: Invalid HRIR URLs. It must be an array with ' +
            '2 URLs to HRIR files. (got ' + config.hrirPathList + ')');
      }
    }

    if (config.renderingMode) {
      if (Object.values(RenderingMode).includes(config.renderingMode)) {
        this._config.renderingMode = config.renderingMode;
      } else {
        Utils.log(
            'FOARenderer: Invalid rendering mode order. (got' +
            config.renderingMode + ') Fallbacks to the mode "ambisonic".');
      }
    }
  }

  this._buildAudioGraph();

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
  this._foaRouter = new FOARouter(this._context, this._config.channelMap);
  this._foaRotator = new FOARotator(this._context);
  this._foaConvolver = new FOAConvolver(this._context);
  this.input.connect(this._foaRouter.input);
  this.input.connect(this._bypass);
  this._foaRouter.output.connect(this._foaRotator.input);
  this._foaRotator.output.connect(this._foaConvolver.input);
  this._foaConvolver.output.connect(this.output);

  this.input.channelCount = 4;
  this.input.channelCountMode = 'explicit';
  this.input.channelInterpretation = 'discrete';
};


/**
 * Internal callback handler for |initialize| method.
 * @private
 * @param {function} resolve - Resolution handler.
 * @param {function} reject - Rejection handler.
 */
FOARenderer.prototype._initializeCallback = function(resolve, reject) {
  const bufferList = this._config.pathList
      ? new BufferList(this._context, this._config.pathList, {dataType: 'url'})
      : new BufferList(this._context, FOAHrirBase64);
  bufferList.load().then(
      function(hrirBufferList) {
        this._foaConvolver.setHRIRBufferList(hrirBufferList);
        this.setRenderingMode(this._config.renderingMode);
        this._isRendererReady = true;
        Utils.log('FOARenderer: HRIRs loaded successfully. Ready.');
        resolve();
      }.bind(this),
      function() {
        const errorMessage = 'FOARenderer: HRIR loading/decoding failed.';
        reject(errorMessage);
        Utils.throw(errorMessage);
      });
};


/**
 * Initializes and loads the resource for the renderer.
 * @return {Promise}
 */
FOARenderer.prototype.initialize = function() {
  Utils.log(
      'FOARenderer: Initializing... (mode: ' + this._config.renderingMode +
      ')');

  return new Promise(this._initializeCallback.bind(this));
};


/**
 * Set the channel map.
 * @param {Number[]} channelMap - Custom channel routing for FOA stream.
 */
FOARenderer.prototype.setChannelMap = function(channelMap) {
  if (!this._isRendererReady) {
    return;
  }

  if (channelMap.toString() !== this._config.channelMap.toString()) {
    Utils.log(
        'Remapping channels ([' + this._config.channelMap.toString() +
        '] -> [' + channelMap.toString() + ']).');
    this._config.channelMap = channelMap.slice();
    this._foaRouter.setChannelMap(this._config.channelMap);
  }
};


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  if (!this._isRendererReady) {
    return;
  }

  this._foaRotator.setRotationMatrix3(rotationMatrix3);
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {
  if (!this._isRendererReady) {
    return;
  }

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
  if (!this._isRendererReady) {
    return;
  }

  // Extract the inner array elements and inverse. (The actual view rotation is
  // the opposite of the camera movement.)
  Utils.invertMatrix4(this._tempMatrix4, cameraMatrix.elements);
  this._foaRotator.setRotationMatrix4(this._tempMatrix4);
};


/**
 * Set the rendering mode.
 * @param {RenderingMode} mode - Rendering mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
FOARenderer.prototype.setRenderingMode = function(mode) {
  if (mode === this._config.renderingMode) {
    return;
  }

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
      Utils.log(
          'FOARenderer: Rendering mode "' + mode + '" is not ' +
          'supported.');
      return;
  }

  this._config.renderingMode = mode;
  Utils.log('FOARenderer: Rendering mode changed. (' + mode + ')');
};


module.exports = FOARenderer;
