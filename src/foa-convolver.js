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
 * @fileOverview A collection of convolvers. Can be used for the optimized FOA
 *               binaural rendering. (e.g. SH-MaxRe HRTFs)
 */

'use strict';

/**
 * @class FOAConvolver
 * @description A collection of 2 stereo convolvers for 4-channel FOA stream.
 * @param {AudioContext} context        Associated AudioContext.
 * @param {Object} options              Options for speaker.
 * @param {AudioBuffer} options.IR      Stereo IR buffer for HRTF convolution.
 * @param {Number} options.gain         Post-gain for the speaker.
 */
function FOAConvolver (context, options) {
  if (options.IR.numberOfChannels !== 4)
    throw 'IR does not have 4 channels. cannot proceed.';

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

  // Generate 2 stereo buffers from a 4-channel IR.
  this._setHRIRBuffers(options.IR);

  // For asymmetric degree.
  this._inverter.gain.value = -1;

  // Input/Output proxy.
  this.input = this._input;
  this.output = this._summingBus;

  this.enable();
}

FOAConvolver.prototype._setHRIRBuffers = function (hrirBuffer) {
  // Use 2 stereo convolutions. This is because the mono convolution wastefully
  // produces the stereo output with the same content.
  this._hrirWY = this._context.createBuffer(2, hrirBuffer.length,
                                            hrirBuffer.sampleRate);
  this._hrirZX = this._context.createBuffer(2, hrirBuffer.length,
                                            hrirBuffer.sampleRate);

  // We do this because Safari does not support copyFromChannel/copyToChannel.
  this._hrirWY.getChannelData(0).set(hrirBuffer.getChannelData(0));
  this._hrirWY.getChannelData(1).set(hrirBuffer.getChannelData(1));
  this._hrirZX.getChannelData(0).set(hrirBuffer.getChannelData(2));
  this._hrirZX.getChannelData(1).set(hrirBuffer.getChannelData(3));

  // After these assignments, the channel data in the buffer is immutable in
  // FireFox. (i.e. neutered)
  this._convolverWY.buffer = this._hrirWY;
  this._convolverZX.buffer = this._hrirZX;
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
