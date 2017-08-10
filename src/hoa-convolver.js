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


/**
 * @class HOAConvolver
 * @description A collection of convolvers for N-channel HOA stream.
 * @param {AudioContext} context          Associated AudioContext.
 * @param {Object} options
 * @param {Number} options.ambisonicOrder Ambisonic order (default is 3).
 * @param {AudioBuffer} options.IRBuffer  IR Audiobuffer for convolution. The
 *                                        number of channels must be (N+1)^2
 *                                        where N is the ambisonic order.
 */
function HOAConvolver(context, options) {
  this._active = false;
  this._context = context;

  // If unspecified, the default ambisonic mode is third order.
  this._ambisonicOrder = options.ambisonicOrder ? options.ambisonicOrder : 3;

  // We need to determine the number of channels K based on the ambisonic
  // order N where K = (N+1)^2.
  this._numberOfChannels =
      (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);

  // Ensure that the ambisonic order matches the IR channel count.
  // TODO(hoch): Error reporting should be unified. Don't use |throw|.
  if (options.IRBuffer.numberOfChannels !== this._numberOfChannels) {
    throw 'The order of ambisonic (' + ambisonicOrder + ') requires ' +
        numberOfChannels + '-channel IR buffer. The given IR buffer has ' +
        options.IRBuffer.numberOfChannels + ' channels.';
  }

  this._buildAudioGraph();
  this._setHRIRBuffer(options.IRBuffer);

  this.enable();
}


// Build the audio graph for HOA processing.
//
// For TOA convolution:
// input -> splitter(16) -[0,1]-> merger(2) -> convolver(2) -> splitter(2)
//                       -[2,3]-> merger(2) -> convolver(2) -> splitter(2)
//                       -[4,5]-> ... (6 more, 8 branches total)
HOAConvolver.prototype._buildAudioGraph = function(options) {
  // Compute the number of stereo convolvers needed.
  var numberOfStereoChannels = Math.ceil(this._numberOfChannels / 2);

  this._inputSplitter =
      this._context.createChannelSplitter(this._numberOfChannels);
  this._stereoMergers = [];
  this._convolvers = [];
  this._stereoSplitters = [];
  this._positiveIndexSphericalHarmonics = this._context.createGain();
  this._negativeIndexSphericalHarmonics = this._context.createGain();
  this._inverter = this._context.createGain();
  this._binauralMerger = this._context.createChannelMerger(2);
  this._outputGain = this._context.createGain();

  for (var i = 0; i < numberOfStereoChannels; ++i) {
    this._stereoMergers[i] = this._context.createChannelMerger(2);
    this._convolvers[i] = this._context.createConvolver();
    this._stereoSplitters[i] = this._context.createChannelSplitter(2);

    this._convolvers[i].normalize = false;
  }

  for (var l = 0; l <= this._ambisonicOrder; ++l) {
    for (var m = -l; m <= l; m++) {
      // We compute the ACN index (k) of ambisonics channel using the degree (l)
      // and index (m): k = l^2 + l + m
      var acnIndex = l * l + l + m;
      var stereoIndex = Math.floor(acnIndex / 2);

      // Split channels from input into array of stereo convolvers.
      // Then create a network of mergers that produces the stereo output.
      this._inputSplitter.connect(
          this._stereoMergers[stereoIndex], acnIndex, acnIndex % 2);
      this._stereoMergers[stereoIndex].connect(this._convolvers[stereoIndex]);
      this._convolvers[stereoIndex].connect(this._stereoSplitters[stereoIndex]);

      // Positive index (m >= 0) spherical harmonics are symmetrical around the
      // front axis, while negative index (m < 0) spherical harmonics are
      // anti-symmetrical around the front axis. We will exploit this symmetry
      // to reduce the number of convolutions required when rendering to a
      // symmetrical binaural renderer.
      if (m >= 0) {
        this._stereoSplitters[stereoIndex].connect(
            this._positiveIndexSphericalHarmonics, acnIndex % 2);
      } else {
        this._stereoSplitters[stereoIndex].connect(
            this._negativeIndexSphericalHarmonics, acnIndex % 2);
      }
    }
  }
  this._positiveIndexSphericalHarmonics.connect(this._binauralMerger, 0, 0);
  this._positiveIndexSphericalHarmonics.connect(this._binauralMerger, 0, 1);
  this._negativeIndexSphericalHarmonics.connect(this._binauralMerger, 0, 0);
  this._negativeIndexSphericalHarmonics.connect(this._inverter);
  this._inverter.connect(this._binauralMerger, 0, 1);

  // For asymmetric index.
  this._inverter.gain.value = -1;

  // Input/Output proxy.
  this.input = this._inputSplitter;
  this.output = this._outputGain;
};


HOAConvolver.prototype._setHRIRBuffer = function(buffer) {
  // For the optimum performance/resource usage, we use stereo convolvers
  // instead of mono convolvers. In Web Audio API, the convolution on
  // >3 channels activates the "true stereo" mode in theconvolver, which is not
  // compatible to HOA convolution.

  // Compute the number of stereo buffers to create from a given buffer.
  var numberOfStereoBuffers = Math.ceil(buffer.numberOfChannels / 2);

  // Generate Math.ceil(K/2) stereo buffers from a K-channel IR buffer.
  for (var i = 0; i < numberOfStereoBuffers; ++i) {
    var leftIndex = i * 2;
    var rightIndex = i * 2 + 1;
    var stereoHRIRBuffer =
        this._context.createBuffer(2, buffer.length, buffer.sampleRate);
    stereoHRIRBuffer.copyToChannel(buffer.getChannelData(leftIndex), 0);
    if (rightIndex < buffer.numberOfChannels) {
      stereoHRIRBuffer.copyToChannel(buffer.getChannelData(rightIndex), 1);
    }
    this._convolvers[i].buffer = stereoHRIRBuffer;
  }
};


HOAConvolver.prototype.enable = function() {
  if (this._active)
    return;
  this._binauralMerger.connect(this._outputGain);
  this._active = true;
};


HOAConvolver.prototype.disable = function() {
  if (!this._active)
    return;
  this._binauralMerger.disconnect();
  this._active = false;
};


module.exports = HOAConvolver;
