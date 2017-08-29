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
 * @file Omnitone HOA decoder.
 */

'use strict';

var AudioBufferManager = require('./audiobuffer-manager.js');
var HOAConvolver = require('./hoa-convolver.js');
var HOARotator = require('./hoa-rotator.js');
var HRIRManager = require('./hrir-manager.js');
var Utils = require('./utils.js');


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


// Currently SOA and TOA are only supported.
var SupportedAmbisonicOrder = [2, 3];


// HRIRs for optimized HOA rendering.
// TODO(hongchan): change this with the absolute URL.
// var SH_MAXRE_HRIR_URLS =
//     ['resources/sh_hrir_o_3_ch0-ch7.wav',
//     'resources/sh_hrir_o_3_ch8-ch15.wav'];


/**
 * Omnitone HOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} config
 * @param {Number} [config.ambisonicOrder=3] - Ambisonic order.
 * @param {Array} [config.hrirPathList] - A list of paths to HRIR files. It
 * overrides the internal HRIR list if given.
 * @param {RenderingMode} [config.renderingMode='ambisonic'] - Rendering mode.
 */
function HOARenderer(context, config) {
  this._context = Utils.isBaseAudioContext(context) ?
      context :
      Utils.throw('FOARenderer: Invalid BaseAudioContext.');

  this._config = {};

  if (config.ambisonicOrder &&
      SupportedAmbisonicOrder.includes(config.ambisonicOrder)) {
    this._config.ambisonicOrder = config.ambisonicOrder;
  } else {
    this._config.ambisonicOrder = 3;
    Utils.log(
        'HOARenderer: Invalid ambisonic order. (got' + config.ambisonicOrder +
        ') Fallbacks to 3rd-order ambisonic.');
  }

  this._config.numberOfChannels =
      (this._config.ambisonicOrder + 1) * (this._config.ambisonicOrder + 1);
  this._config.numberOfStereoChannels =
      Math.ceil(this._config.numberOfChannels / 2);

  if (config.hrirPathList) {
    if (Array.isArray(config.hrirPathList) &&
        config.hrirPathList.length === this._config.numberOfStereoChannels) {
      this._config.pathList = config.hrirPathList;
    } else {
      Utils.throw(
          'HOARenderer: Invalid HRIR URLs. It must be an array with ' +
          this._config.numberOfStereoChannels + ' URLs to HRIR files.' +
          ' (got ' + config.hrirPathList + ')');
    }
  } else {
    // By default, the path list points to GitHub CDN with FOA files.
    // TODO(hoch): update this to Gstatic server when it's available.
    this._config.pathList =
        HRIRManager.getPathList({ambisonicOrder: this._config.ambisonicOrder});
  }


  if (config.renderingMode &&
      Object.values(RenderingMode).includes(config.renderingMode)) {
    this._config.renderingMode = config.renderingMode;
  } else {
    this._config.renderingMode = RenderingMode.AMBISONIC;
    Utils.log(
        'HOARenderer: Invalid rendering mode order. (got' +
        config.renderingMode + ') Fallbacks to the mode "ambisonic".');
  }

  // this._HRIRUrls = SH_MAXRE_HRIR_URLS;
  // this._renderingMode = 'ambisonic';
  // this._ambisonicOrder = 3;



  // if (config) {
  //   if (config.HRIRUrl)
  //     this._HRIRUrls = options.HRIRUrl;
  //   if (options.renderingMode)
  //     this._renderingMode = options.renderingMode;
  //   if (options.ambisonicOrder)
  //     this._ambisonicOrder = options.ambisonicOrder;
}

// this._numberOfChannels =
//     (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);

this._buildAudioGraph();

this._isRendererReady = false;
}


/**
 * Builds the internal audio graph.
 * @private
 */
HOARenderer.prototype._buildAudioGraph = function() {
  this.input = this._context.createGain();
  this.output = this._context.createGain();
  this._bypass = this._context.createGain();
  this._hoaRotator = new HOARotator(this._context, this._config.ambisonicOrder);
  this._hoaConvolver =
      new HOAConvolver(this._context, this._config.ambisonicOrder);
  this.input.connect(this._hoaRotator.input);
  this.input.connect(this._bypass);
  this._hoaRotator.output.connect(this._hoaConvolver.input);
  this._hoaConvolver.output.connect(this.output);
};


/**
 * Internal callback handler for |initialize| method.
 * @private
 * @param {function} resolve - Resolution handler.
 * @param {function} reject - Rejection handler.
 */
HOARenderer.prototype._initializeCallback = function(resolve, reject) {
  var bufferLoaderData = [];
  for (var i = 0; i < this._config.pathList.length; ++i)
    bufferLoaderData.push({name: i, url: this._config.pathList[i]});

  var hrirBufferList = [];
  new AudioBufferManager(
      this._context, bufferLoaderData,
      function(bufferMap) {
        for (var i = 0; i < bufferLoaderData.length; ++i)
          hrirBufferList.push(bufferMap.get(i));
        this._hoaConvolver.setHRIRBufferList(hrirBufferList);
        this.setRenderingMode(this._renderingMode);
        this._isRendererReady = true;
        Utils.log('HOARenderer: HRIRs loaded successfully. Ready.');
        resolve();
        // var accumulatedChannelCount = 0;
        // The iteration order of buffer in |buffers| might be flaky because it
        // is a Map. Thus, iterate based on the |audioBufferData| array instead
        // of the |buffers| map.
        // audioBufferData.forEach(function (data) {
        //   var buffer = buffers.get(data.name);

        //   // Create a K channel buffer to integrate individual IR buffers.
        //   if (!hoaHRIRBuffer) {
        //     hoaHRIRBuffer = this._context.createBuffer(
        //         this._numberOfChannels, buffer.length, buffer.sampleRate);
        //   }

        //   for (var channel = 0; channel < buffer.numberOfChannels; ++channel)
        //   {
        //     hoaHRIRBuffer.getChannelData(accumulatedChannelCount + channel)
        //         .set(buffer.getChannelData(channel));
        //   }

        //   accumulatedChannelCount += buffer.numberOfChannels;
        // }.bind(this));

        // if (accumulatedChannelCount === this._numberOfChannels) {
        // } else {
        //   var errorMessage = 'Only ' + accumulatedChannelCount +
        //       ' HRIR channels were loaded (expected ' +
        //       this._numberOfChannels +
        //       '). The renderer will not function correctly.';
        //   Utils.log(errorMessage);
        //   reject(errorMessage);
        // }
      }.bind(this),
      function(bufferMap) {
        var errorMessage = 'HOARenderer: HRIR loading/decoding failed. (' +
            Array.from(bufferMap) + ')';
        Utils.throw(errorMessage);
        reject(errorMessage);
      });
};


/**
 * Initializes and loads the resource for the renderer.
 * @return {Promise}
 */
HOARenderer.prototype.initialize = function() {
  Utils.log(
      'HOARenderer: Initializing... (mode: ' + this._config.renderingMode +
      ', ambisonic order: ' + this._config.ambisonicOrder + ')');

  return new Promise(this._initializeCallback.bind(this), , function(error) {
    Utils.throw('FOARenderer: Initialization failed. (' + error + ')');
  });
};


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
HOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  if (!this._isRendererReady)
    return;

  this._hoaRotator.setRotationMatrix3(rotationMatrix3);
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
HOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {
  if (!this._isRendererReady)
    return;

  this._hoaRotator.setRotationMatrix4(rotationMatrix4);
};


/**
 * Set the decoding mode.
 * @param {RenderingMode} renderingMode - Decoding mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
HOARenderer.prototype.setRenderingMode = function(mode) {
  if (mode === this._config.renderingMode)
    return;

  switch (mode) {
    case RenderingMode.AMBISONIC:
      this._hoaConvolver.enable();
      this._bypass.disconnect();
      break;
    case RenderingMode.BYPASS:
      this._hoaConvolver.disable();
      this._bypass.connect(this.output);
      break;
    case RenderingMode.OFF:
      this._hoaConvolver.disable();
      this._bypass.disconnect();
      break;
    default:
      Utils.log(
          'HOARenderer: Rendering mode "' + mode + '" is not ' +
          'supported.');
      return;
  }

  this._config.renderingMode = mode;
  Utils.log('HOARenderer: Rendering mode changed. (' + mode + ')');
};


module.exports = HOARenderer;
