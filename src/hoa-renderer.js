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
var SH_MAXRE_HRIR_URLS =
    ['resources/sh_hrir_o_3_ch0-ch7.wav', 'resources/sh_hrir_o_3_ch8-ch15.wav'];


/**
 * @class Omnitone HOA renderer class. Uses the optimized convolution technique.
 * @param {AudioContext} context            Associated AudioContext.
 * @param {Object} options
 * @param {Array} options.HRIRUrl           Optional HRIR URLs in an array.
 * @param {String} options.renderingMode    Rendering mode.
 * @param {Number} options.ambisonicOrder   Ambisonic order (default is 3).
 */
function HOARenderer(context, options) {
  this._context = context;

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

  this._numberOfChannels =
      (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);

  this._isRendererReady = false;
}


/**
 * Initialize and load the resources for the decode.
 * @return {Promise}
 */
HOARenderer.prototype.initialize = function() {
  Utils.log('Version: ' + SystemVersion);
  Utils.log(
      'Initializing... (mode: ' + this._renderingMode +
      ', order: ' + this._ambisonicOrder + ')');

  return new Promise(this._initializeCallback.bind(this));
};


/**
 * Internal callback handler for |initialize| method.
 * @param {Function} resolve Promise resolution.
 * @param {Function} reject Promise rejection.
 */
HOARenderer.prototype._initializeCallback = function(resolve, reject) {
  var hoaHRIRBuffer;

  // Constrcut a consolidated HOA HRIR (e.g. 16 channels for TOA).
  // Handle multiple chunks of HRIR buffer data splitted by 8 channels each.
  // This is because Chrome cannot decode the audio file >8 channels.
  var audioBufferData = [];
  this._HRIRUrls.forEach(function(key, index, urls) {
    audioBufferData.push({name: key, url: urls[index]});
  });

  new AudioBufferManager(
      this._context, audioBufferData,
      function(buffers) {
        var accumulatedChannelCount = 0;
        // The iteration order of buffer in |buffers| might be flaky because it
        // is a Map. Thus, iterate based on the |audioBufferData| array instead
        // of the |buffers| map.
        audioBufferData.forEach(function (data) {
          var buffer = buffers.get(data.name);

          // Create a K channel buffer to integrate individual IR buffers.
          if (!hoaHRIRBuffer) {
            hoaHRIRBuffer = this._context.createBuffer(
                this._numberOfChannels, buffer.length, buffer.sampleRate);
          }

          for (var channel = 0; channel < buffer.numberOfChannels; ++channel) {
            hoaHRIRBuffer.getChannelData(accumulatedChannelCount + channel)
                .set(buffer.getChannelData(channel));
          }

          accumulatedChannelCount += buffer.numberOfChannels;
        }.bind(this));

        if (accumulatedChannelCount === this._numberOfChannels) {
          this._buildAudioGraph(hoaHRIRBuffer);
          this._isRendererReady = true;
          Utils.log('Rendering via SH-MaxRE convolution.');
          resolve();
        } else {
          var errorMessage = 'Only ' + accumulatedChannelCount +
              ' HRIR channels were loaded (expected ' + this._numberOfChannels +
              '). The renderer will not function correctly.';
          Utils.log(errorMessage);
          reject(errorMessage);
        }
      }.bind(this),
      function(buffers) {
        // TODO: Deiliver more descriptive error message.
        var errorMessage = 'Initialization failed.';
        Utils.log(errorMessage);
        reject(errorMessage);
      });
};


/**
 * Internal method that builds the audio graph.
 */
HOARenderer.prototype._buildAudioGraph = function(hoaHRIRBuffer) {
  this.input = this._context.createGain();
  this.output = this._context.createGain();
  this._bypass = this._context.createGain();

  this._hoaRotator = new HOARotator(this._context, this._ambisonicOrder);
  this._hoaConvolver = new HOAConvolver(
      this._context,
      {IRBuffer: hoaHRIRBuffer, ambisonicOrder: this._ambisonicOrder});

  this.input.connect(this._hoaRotator.input);
  this.input.connect(this._bypass);
  this._hoaRotator.output.connect(this._hoaConvolver.input);
  this._hoaConvolver.output.connect(this.output);

  this.setRenderingMode(this._renderingMode);
};


/**
 * Set the rotation matrix for the sound field rotation.
 * @param {Array} rotationMatrix3           A 3x3 rotation matrix (col-major)
 */
HOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  if (!this._isRendererReady)
    return;

  this._hoaRotator.setRotationMatrix3(rotationMatrix3);
};


/**
 * Update the rotation from a 4x4 matrix. This expects the model matrix of
 * Camera object. For example, Three.js offers |Object3D.matrixWorld| for this
 * purpose.
 * @param {Float32Array} rotationMatrix4    A 4x4 rotation matrix (col-major)
 */
HOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {
  if (!this._isRendererReady)
    return;

  this._hoaRotator.setRotationMatrix4(rotationMatrix4);
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
HOARenderer.prototype.setRenderingMode = function(mode) {
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
