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
 * @param {Array} options.IR              Multichannel HRTF convolution buffer.
 * @param {Number} options.ambisonicOrder Ambisonic order (default is 3).
 * @param {Number} options.gain           Post-gain for the speaker (optional).
 */
function HOAConvolver(context, options) {
  this._active = false;

  this._context = context;

  // We need to determine the number of channels K based on the ambisonic
  // order N where K = (N + 1)^2
  var ambisonicOrder = options.ambisonicOrder ? options.ambisonicOrder : 3;
  var numberOfChannels = (ambisonicOrder + 1) * (ambisonicOrder + 1);

  // Ensure that the ambisonic order matches the IR channel count.
  if (options.IR.numberOfChannels !== numberOfChannels) {
    throw 'Ambisonic order and IR channel count do not match. Cannot proceed.';
  }

  // Compute the number of stereo convolvers needed.
  var numStereoChannels = Math.round(numberOfChannels / 2);

  this._input = this._context.createChannelSplitter(numberOfChannels);
  this._mergers = [];
  this._convolvers = [];
  this._splitters = [];
  for (var i = 0; i < numStereoChannels; i++) {
    this._mergers[i] = this._context.createChannelMerger(2);
    this._convolvers[i] = this._context.createConvolver();
    this._splitters[i] = this._context.createChannelSplitter(2);
  }

  // Positive index (m >= 0) spherical harmonics are symmetrical around the
  // front axis, while negative index (m < 0) spherical harmonics are
  // anti-symmetrical around the front axis. We will exploit this symmetry to
  // reduce the number of convolutions required when rendering to a symmetrical
  // binaural renderer.
  this._positiveIndexSphericalHarmonics = this._context.createGain();
  this._negativeIndexSphericalHarmonics = this._context.createGain();
  this._inverter = this._context.createGain();
  this._mergerBinaural = this._context.createChannelMerger(2);
  this._outputGain = this._context.createGain();

  // Split channels from input into array of stereo convolvers.
  // Then create a network of mergers that produces the stereo output.
  for (var l = 0; l <= ambisonicOrder; l++) {
    for (var m = -l; m <= l; m++) {
      // We compute the ACN index (k) of ambisonics channel using the degree (l)
      // and index (m): k = l^2 + l + m
      var acnIndex = l * l + l + m;
      var stereoIndex = Math.floor(acnIndex / 2);

      this._input.connect(this._mergers[stereoIndex], acnIndex, acnIndex % 2);
      this._mergers[stereoIndex].connect(this._convolvers[stereoIndex]);
      this._convolvers[stereoIndex].connect(this._splitters[stereoIndex]);
      if (m >= 0) {
        this._splitters[stereoIndex]
          .connect(this._positiveIndexSphericalHarmonics, acnIndex % 2);
      } else {
        this._splitters[stereoIndex]
          .connect(this._negativeIndexSphericalHarmonics, acnIndex % 2);
      }
    }
  }
  this._positiveIndexSphericalHarmonics.connect(this._mergerBinaural, 0, 0);
  this._positiveIndexSphericalHarmonics.connect(this._mergerBinaural, 0, 1);
  this._negativeIndexSphericalHarmonics.connect(this._mergerBinaural, 0, 0);
  this._negativeIndexSphericalHarmonics.connect(this._inverter);
  this._inverter.connect(this._mergerBinaural, 0, 1);

  // For asymmetric index.
  this._inverter.gain.value = -1;

  // Set desired output gain.
  if (options.gain) {
    this._outputGain.gain.value = options.gain;
  }

  // Generate Math.round(K/2) stereo buffers from a K-channel IR.
  this._setHRIRBuffers(options.IR);

  // Input/Output proxy.
  this.input = this._input;
  this.output = this._outputGain;

  this.enable();
}

HOAConvolver.prototype._setHRIRBuffers = function (hrirBuffers) {
  // Compute the number of stereo buffers to create from the hrirBuffers.
  var numStereoChannels = Math.round(hrirBuffers.numberOfChannels / 2);

  this._stereoHrirs = [];
  for (var i = 0; i < numStereoChannels; i++) {
    this._stereoHrirs[i] =
      this._context.createBuffer(2, hrirBuffers.length, hrirBuffers.sampleRate);

    this._stereoHrirs[i]
      .getChannelData(0).set(hrirBuffers.getChannelData(i * 2));
    this._stereoHrirs[i]
      .getChannelData(1).set(hrirBuffers.getChannelData(i * 2 + 1));
    this._convolvers[i].buffer = this._stereoHrirs[i];
  }
};

HOAConvolver.prototype.enable = function () {
  this._mergerBinaural.connect(this._outputGain);
  this._active = true;
};

HOAConvolver.prototype.disable = function () {
  this._mergerBinaural.disconnect();
  this._active = false;
};

module.exports = HOAConvolver;
