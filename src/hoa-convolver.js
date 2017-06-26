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
 * @fileOverview A collection of convolvers. Can be used for the optimized HOA
 *               binaural rendering. (e.g. SH-MaxRe HRTFs)
 */

'use strict';


/**
 * @class HOAConvolver
 * @description A collection of convolvers for N-channel HOA stream.
 * @param {AudioContext} context          Associated AudioContext.
 * @param {Object} options                Options for speaker.
 * @param {Array} options.IR              Array of buffers for HRTF convolution.
 * @param {Number} options.gain           Post-gain for the speaker.
 * @param {Number} options.ambisonicOrder Ambisonic order (2 or 3).
*/
function HOAConvolver (context, options) {
  this._active = false;

  this._context = context;

  var num_channels = (options.ambisonicOrder + 1) * (options.ambisonicOrder + 1);
  this._input = this._context.createChannelSplitter(num_channels);

  this._symmetrics = this._context.createGain();
  this._antisymmetrics = this._context.createGain();

  this._inverter = this._context.createGain();
  this._inverter.gain.value = -1;

  this._binaural = this._context.createChannelMerger(2);
  this._outputGain = this._context.createGain();

  this._convolvers = new Array(num_channels);
  for (var l = 0; l <= options.ambisonicOrder; l++) {
    for (var m = -l; m <= l; m++) {
      var acn = l * l + l + m;
      this._convolvers[acn] = this._context.createConvolver();
      this._convolvers[acn].normalize = false;
      this._input.connect(this._convolvers[acn], acn, 0);
      if (m >= 0) {
        this._convolvers[acn].connect(this._symmetrics);
      } else {
        this._convolvers[acn].connect(this._antisymmetrics);
      }
    }
  }

  this._symmetrics.connect(this._binaural, 0, 0);
  this._symmetrics.connect(this._binaural, 0, 1);
  this._antisymmetrics.connect(this._binaural, 0, 0);
  this._antisymmetrics.connect(this._inverter);
  this._inverter.connect(this._binaural, 0, 1);

  // Generate 2 stereo buffers from a 4-channel IR.
  this._setHRIRBuffers(options.IR);
  this.enable();

  // Input/Output proxy.
  this.input = this._input;
  this.output = this._outputGain;
}

HOAConvolver.prototype._setHRIRBuffers = function (hrirBuffers) {
  this._hrirs = new Array(hrirBuffers.numberOfChannels);
  for (var i = 0; i < hrirBuffers.numberOfChannels; i++) {
    this._hrirs[i] = this._context.createBuffer(1, hrirBuffers.length, hrirBuffers.sampleRate);
    this._hrirs[i].getChannelData(0).set(hrirBuffers.getChannelData(i));
    this._convolvers[i].buffer = this._hrirs[i];
  }
};

HOAConvolver.prototype.enable = function () {
  this._binaural.connect(this._outputGain);
  this._active = true;
};

HOAConvolver.prototype.disable = function () {
  this._binaural.disconnect();
  this._active = false;
};

module.exports = HOAConvolver;
