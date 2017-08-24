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
 * @fileOverview A collection of convolvers. Can be used for the optimized FOA
 *               binaural rendering. (e.g. SH-MaxRe HRTFs)
 */
var Utils = require('./utils.js');


/**
 * @class FOAConvolver
 * @description A collection of 2 stereo convolvers for 4-channel FOA stream.
 * @param {AudioContext} context        Associated AudioContext.
 * @param {Object} options              Options for speaker.
 * @param {AudioBuffer} options.IR      Stereo IR buffer for HRTF convolution.
 * @param {Array} options.HRIRBuffers   An array of AudioBuffers contains 2 
 *                                      stereo HRIR files. (4-channel)
 * @param {Number} options.gain         Post-gain for the speaker.
 */
function FOAConvolver (context, options) {
  if (!options.HRIRBuffers)
    Utils.throw('FOAConvolver: HRIR AudioBuffers are not specified.');

  if (options.HRIRBuffers.length !== 2)
    Utils.throw('FOAConvolver: Insufficient HRIR AudioBuffers. (got ' + 
        options.HRIRBuffers.length + ', but expected 2.)');

  for (var i = 0; i < options.HRIRBuffers.length; ++i) {
    if (!(options.HRIRBuffers[i] instanceof AudioBuffer) ||
        options.HRIRBuffers[i].numberOfChannels !== 2) {
      Utils.throw('FOAConvolver: HRIR AudioBuffer (' + i + ') is not a valid' +
          ' AudioBuffer or not stereo.');
    }
  }

  this._active = false;
  this._context = context;

  this._input = this._context.createChannelSplitter(4);
  this._mergerWY = this._context.createChannelMerger(2);
  this._mergerZX = this._context.createChannelMerger(2);
  this._convolverWY = this._context.createConvolver();
  this._convolverZX = this._context.createConvolver();
  this._splitterWY = this._context.createChannelSplitter(2);
  this._splitterZX = this._context.createChannelSplitter(2);
  this._inverter = this._context.createGain();
  this._mergerBinaural = this._context.createChannelMerger(2);
  this._summingBus = this._context.createGain();

  // Group W and Y, then Z and X.
  this._input.connect(this._mergerWY, 0, 0);
  this._input.connect(this._mergerWY, 1, 1);
  this._input.connect(this._mergerZX, 2, 0);
  this._input.connect(this._mergerZX, 3, 1);

  // Create a network of convolvers using splitter/merger.
  this._mergerWY.connect(this._convolverWY);
  this._mergerZX.connect(this._convolverZX);
  this._convolverWY.connect(this._splitterWY);
  this._convolverZX.connect(this._splitterZX);
  this._splitterWY.connect(this._mergerBinaural, 0, 0);
  this._splitterWY.connect(this._mergerBinaural, 0, 1);
  this._splitterWY.connect(this._mergerBinaural, 1, 0);
  this._splitterWY.connect(this._inverter, 1, 0);
  this._inverter.connect(this._mergerBinaural, 0, 1);
  this._splitterZX.connect(this._mergerBinaural, 0, 0);
  this._splitterZX.connect(this._mergerBinaural, 0, 1);
  this._splitterZX.connect(this._mergerBinaural, 1, 0);
  this._splitterZX.connect(this._mergerBinaural, 1, 1);

  this._convolverWY.normalize = false;
  this._convolverZX.normalize = false;

  this._setHRIRBuffers(options.HRIRBuffers);

  // For asymmetric degree.
  this._inverter.gain.value = -1;

  // Input/Output proxy.
  this.input = this._input;
  this.output = this._summingBus;

  this.enable();
}


/**
 * Assigns 2 HRIR AudioBuffers to 2 convolvers. Note that we use 2 stereo
 * convolutions for 4-channel direct convolution. Using mono convolver or
 * 4-channel convolver is not possible. Because mono convolution wastefully
 * produces the stereo outputs, and the 4-ch convolver does cross-channel
 * convolution.
 * 
 * @param {Array} HRIRBuffers An array of stereo AudioBuffers for convolvers.
 */
FOAConvolver.prototype._setHRIRBuffers = function (HRIRBuffers) {
  // After these assignments, the channel data in the buffer is immutable in
  // FireFox. (i.e. neutered)
  this._convolverWY.buffer = HRIRBuffers[0];
  this._convolverZX.buffer = HRIRBuffers[1];
};

FOAConvolver.prototype.enable = function () {
  this._mergerBinaural.connect(this._summingBus);
  this._active = true;
};

FOAConvolver.prototype.disable = function () {
  this._mergerBinaural.disconnect();
  this._active = false;
};


module.exports = FOAConvolver;
