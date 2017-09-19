/**
 * Copyright 2016 Google Inc. All Rights Reserved.
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
 * @file Omnitone FOA decoder, DEPRECATED in favor of FOARenderer.
 */

'use strict';

const AudioBufferManager = require('./audiobuffer-manager.js');
const FOARouter = require('./foa-router.js');
const FOARotator = require('./foa-rotator.js');
const FOAPhaseMatchedFilter = require('./foa-phase-matched-filter.js');
const FOAVirtualSpeaker = require('./foa-virtual-speaker.js');
const FOASpeakerData = require('./foa-speaker-data.js');
const Utils = require('./utils.js');

// By default, Omnitone fetches IR from the spatial media repository.
const HRTFSET_URL = 'https://raw.githubusercontent.com/GoogleChrome/omnitone/master/build/resources/';

// Post gain compensation value.
let POST_GAIN_DB = 0;


/**
 * Omnitone FOA decoder.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {VideoElement} videoElement - Target video (or audio) element for
 * streaming.
 * @param {Object} options
 * @param {String} options.HRTFSetUrl - Base URL for the cube HRTF sets.
 * @param {Number} options.postGainDB - Post-decoding gain compensation in dB.
 * @param {Number[]} options.channelMap - Custom channel map.
 */
function FOADecoder(context, videoElement, options) {
  this._isDecoderReady = false;
  this._context = context;
  this._videoElement = videoElement;
  this._decodingMode = 'ambisonic';

  this._postGainDB = POST_GAIN_DB;
  this._HRTFSetUrl = HRTFSET_URL;
  this._channelMap = FOARouter.ChannelMap.DEFAULT; // ACN

  if (options) {
    if (options.postGainDB) {
      this._postGainDB = options.postGainDB;
    }
    if (options.HRTFSetUrl) {
      this._HRTFSetUrl = options.HRTFSetUrl;
    }
    if (options.channelMap) {
      this._channelMap = options.channelMap;
    }
  }

  // Rearrange speaker data based on |options.HRTFSetUrl|.
  this._speakerData = [];
  for (let i = 0; i < FOASpeakerData.length; ++i) {
    this._speakerData.push({
      name: FOASpeakerData[i].name,
      url: this._HRTFSetUrl + '/' + FOASpeakerData[i].url,
      coef: FOASpeakerData[i].coef,
    });
  }

  this._tempMatrix4 = new Float32Array(16);
}


/**
 * Initialize and load the resources for the decode.
 * @return {Promise}
 */
FOADecoder.prototype.initialize = function() {
  Utils.log('Initializing... (mode: ' + this._decodingMode + ')');

  // Rerouting channels if necessary.
  let channelMapString = this._channelMap.toString();
  let defaultChannelMapString = FOARouter.ChannelMap.DEFAULT.toString();
  if (channelMapString !== defaultChannelMapString) {
    Utils.log('Remapping channels ([' + defaultChannelMapString + '] -> ['
      + channelMapString + '])');
  }

  this._audioElementSource =
      this._context.createMediaElementSource(this._videoElement);
  this._foaRouter = new FOARouter(this._context, this._channelMap);
  this._foaRotator = new FOARotator(this._context);
  this._foaPhaseMatchedFilter = new FOAPhaseMatchedFilter(this._context);

  this._audioElementSource.connect(this._foaRouter.input);
  this._foaRouter.output.connect(this._foaRotator.input);
  this._foaRotator.output.connect(this._foaPhaseMatchedFilter.input);

  this._foaVirtualSpeakers = [];

  // Bypass signal path.
  this._bypass = this._context.createGain();
  this._audioElementSource.connect(this._bypass);

  // Get the linear amplitude from the post gain option, which is in decibel.
  const postGainLinear = Math.pow(10, this._postGainDB/20);
  Utils.log('Gain compensation: ' + postGainLinear + ' (' + this._postGainDB
    + 'dB)');

  // This returns a promise so developers can use the decoder when it is ready.
  const that = this;
  return new Promise(function(resolve, reject) {
    new AudioBufferManager(that._context, that._speakerData,
      function(buffers) {
        for (let i = 0; i < that._speakerData.length; ++i) {
          that._foaVirtualSpeakers[i] = new FOAVirtualSpeaker(that._context, {
            coefficients: that._speakerData[i].coef,
            IR: buffers.get(that._speakerData[i].name),
            gain: postGainLinear,
          });

          that._foaPhaseMatchedFilter.output.connect(
            that._foaVirtualSpeakers[i].input);
        }

        // Set the decoding mode.
        that.setMode(that._decodingMode);
        that._isDecoderReady = true;
        Utils.log('HRTF IRs are loaded successfully. The decoder is ready.');
        resolve();
      }, reject);
  });
};

/**
 * Set the rotation matrix for the sound field rotation.
 * @param {Array} rotationMatrix      3x3 rotation matrix (row-major
 *                                    representation)
 */
FOADecoder.prototype.setRotationMatrix = function(rotationMatrix) {
  this._foaRotator.setRotationMatrix(rotationMatrix);
};


/**
 * Update the rotation matrix from a Three.js camera object.
 * @param  {Object} cameraMatrix      The Matrix4 obejct of Three.js the camera.
 */
FOADecoder.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {
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
FOADecoder.prototype.setMode = function(mode) {
  if (mode === this._decodingMode) {
    return;
  }

  switch (mode) {
    case 'bypass':
      this._decodingMode = 'bypass';
      for (let i = 0; i < this._foaVirtualSpeakers.length; ++i) {
        this._foaVirtualSpeakers[i].disable();
      }
      this._bypass.connect(this._context.destination);
      break;

    case 'ambisonic':
      this._decodingMode = 'ambisonic';
      for (let i = 0; i < this._foaVirtualSpeakers.length; ++i) {
        this._foaVirtualSpeakers[i].enable();
      }
      this._bypass.disconnect();
      break;

    case 'off':
      this._decodingMode = 'off';
      for (let i = 0; i < this._foaVirtualSpeakers.length; ++i) {
        this._foaVirtualSpeakers[i].disable();
      }
      this._bypass.disconnect();
      break;

    default:
      break;
  }

  Utils.log('Decoding mode changed. (' + mode + ')');
};

module.exports = FOADecoder;
