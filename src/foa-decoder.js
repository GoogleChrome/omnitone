/**
 * @license
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
 * @fileOverview Omnitone FOA decoder.
 */

'use strict';

// Post gain compensation value, empirically determined.
var POST_GAIN = 26.0;

// Dependencies.
var AudioBufferManager = require('./audiobuffer-manager.js');
var FOARotator = require('./foa-rotator.js');
var FOAPhaseMatchedFilter = require('./foa-phase-matched-filter.js');
var FOAVirtualSpeaker = require('./foa-virtual-speaker.js');
var FOASpeakerData = require('./foa-speaker-data.js');

/**
 * @class Omnitone FOA decoder class.
 * @param {AudioContext} context      Associated AudioContext.
 * @param {VideoElement} videoElement Target video (or audio) element for
 *                                    streaming.
 * @param {Object} options
 * @param {String} options.baseResourceUrl  Base URL for resources.
 *                                          (HRTF IR files)
 * @param {Number} options.postGain   Post-decoding gain compensation.
 *                                    (By default, this is 26.0.)
 */
function FOADecoder (context, videoElement, options) {
  this._isDecoderReady = false;
  this._context = context;
  this._videoElement = videoElement;
  this._decodingMode = 'ambisonic';

  var _baseResourceUrl = options.baseResourceUrl || '';

  // Rearrange speaker data based on |options.baseResourceUrl|.
  this._speakerData = [];
  for (var i = 0; i < FOASpeakerData.length; ++i) {
    this._speakerData.push({
      name: FOASpeakerData[i].name,
      url: _baseResourceUrl + '/' + FOASpeakerData[i].url,
      coef: FOASpeakerData[i].coef
    });
  }
}

/**
 * Initialize and load the resources for the decode.
 * @return {Promise}
 */
FOADecoder.prototype.initialize = function () {

  Omnitone.LOG('Initializing... (mode: ' + this._decodingMode + ')');

  this._audioElementSource = this._context.createMediaElementSource(
    this._videoElement);
  this._foaRotator = new FOARotator(this._context);
  this._foaPhaseMatchedFilter = new FOAPhaseMatchedFilter(this._context);

  this._audioElementSource.connect(this._foaRotator.input);
  this._foaRotator.output.connect(this._foaPhaseMatchedFilter.input);

  this._foaVirtualSpeakers = [];

  // Bypass signal path.
  this._bypass = this._context.createGain();
  this._audioElementSource.connect(this._bypass);

  // This returns a promise so developers can use the decoder when it is ready.
  var me = this;
  return new Promise(function (resolve, reject) {
    new AudioBufferManager(me._context, me._speakerData,
      function (buffers) {
        for (var i = 0; i < me._speakerData.length; ++i) {
          me._foaVirtualSpeakers[i] = new FOAVirtualSpeaker(me._context, {
            coefficients: me._speakerData[i].coef,
            IR: buffers.get(me._speakerData[i].name),
            gain: POST_GAIN
          });

          me._foaPhaseMatchedFilter.output.connect(
            me._foaVirtualSpeakers[i].input);
        }

        // Set the decoding mode.
        me.setMode(me._decodingMode);
        me._isDecoderReady = true;

        Omnitone.LOG('Initialized and active.');

        resolve();
      }, reject);
  });
};

/**
 * Set the rotation matrix for the sound field rotation.
 * @param {Array} rotationMatrix      3x3 rotation matrix (row-major
 *                                    representation)
 */
FOADecoder.prototype.setRotationMatrix = function (rotationMatrix) {
  this._foaRotator.setRotationMatrix(rotationMatrix);
};

/**
 * Set the decoding mode.
 * @param {String} mode               Decoding mode. When the mode is 'plain'
 *                                    the decoder is disabled and bypass the
 *                                    input stream to the output. Setting the
 *                                    mode to 'ambisonic' activates the decoder.
 *                                    When the mode is 'none', all the
 *                                    processing is completely turned off saving
 *                                    the CPU power.
 */
FOADecoder.prototype.setMode = function (mode) {
  if (mode === this._decodingMode)
    return;

  switch (mode) {

    case 'plain':
      this._decodingMode = 'plain';
      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
        this._foaVirtualSpeakers[i].disable();
      this._bypass.connect(this._context.destination);
      break;

    case 'ambisonic':
      this._decodingMode = 'ambisonic';
      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
        this._foaVirtualSpeakers[i].enable();
      this._bypass.disconnect();
      break;

    case 'none':
      this._decodingMode = 'none';
      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
        this._foaVirtualSpeakers[i].disable();
      this._bypass.disconnect();
      break;

    default:
      break;
  }

  Omnitone.LOG('Decoding mode changed. (' + mode + ')');
};

module.exports = FOADecoder;
