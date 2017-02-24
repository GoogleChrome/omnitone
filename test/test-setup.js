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

var expect = chai.expect;
var should = chai.should();


/**
 * Create a buffer for testing. Each channel contains a stream of single,
 * user-defined value.
 * @param {AudioContext} context    AudioContext.
 * @param {Array} values            User-defined constant value for each
 *                                  channel.
 * @param {Number} length           Buffer length in samples.
 * @return {AudioBuffer}
 */
function createConstantBuffer(context, values, length) {
  var constantBuffer = context.createBuffer(
      values.length, length, context.sampleRate);

  for (var channel = 0; channel < constantBuffer.numberOfChannels; channel++) {
    var channelData = constantBuffer.getChannelData(channel);
    for (var index = 0; index < channelData.length; index++)
      channelData[index] = values[channel];
  }

  return constantBuffer;
}


/**
 * Create a impulse buffer for testing. Each channel contains a single unity
 * value (1.0) at the beginning and the rest of content is all zero.
 * @param  {AudioContext} context     AudioContext
 * @param  {Number} numberOfChannels  Channel count.
 * @param  {Number} length            Buffer length in samples.
 * @return {AudioBuffer}
 */
function createImpulseBuffer(context, numberOfChannels, length) {
  var impulseBuffer = context.createBuffer(
      numberOfChannels, length, context.sampleRate);

  for (var channel = 0; channel < impulseBuffer.numberOfChannels; channel++) {
    var channelData = impulseBuffer.getChannelData(channel);
    channelData[0] = 1.0;
  }

  return impulseBuffer;
}


/**
 * Check if the array is filled with the specified value only.
 * @param  {Float32Array} channelData The target array for testing.
 * @param  {Number} value             A value for the testing.
 * @return {Boolean}
 */
function isConstantValueOf(channelData, value) {
  var mismatches = {};
  for (var i = 0; i < channelData.length; i++) {
      if (channelData[i] !== value)
      mismatches[i] = channelData[i];
  }

  return Object.keys(mismatches).length === 0;
};


/**
 * Generate the filter coefficients for the phase matched dual band filter.
 * @param  {NUmber} crossoverFrequency Filter crossover frequency.
 * @param  {NUmber} sampleRate         Operating sample rate.
 * @return {Object}                    Filter coefficients.
 *                                     { lowpassA, lowpassB, hipassA, hipassB }
 *                                     (where B is feedforward, A is feedback.)
 */
function getDualBandFilterCoefs(crossoverFrequency, sampleRate) {
  var k = Math.tan(Math.PI * crossoverFrequency / sampleRate),
      k2 = k * k,
      denominator = k2 + 2 * k + 1;

  return {
    lowpassA: [1, 2 * (k2 - 1) / denominator, (k2 - 2 * k + 1) / denominator],
    lowpassB: [k2 / denominator, 2 * k2 / denominator, k2 / denominator],
    hipassA: [1, 2 * (k2 - 1) / denominator, (k2 - 2 * k + 1) / denominator],
    hipassB: [1 / denominator, -2 * 1 / denominator, 1 / denominator]
  };
}

/**
 * Kernel processor for IIR filter. (in-place processing)
 * @param  {Float32Array} channelData A channel data.
 * @param  {Float32Array} feedforward Feedforward coefficients.
 * @param  {Float32Array} feedback    Feedback coefficients.
 */
function kernel_IIRFIlter (channelData, feedforward, feedback) {
  var paddingSize = Math.max(feedforward.length, feedback.length);
  var workSize = channelData.length + paddingSize;
  var x = new Float32Array(workSize);
  var y = new Float64Array(workSize);

  x.set(channelData, paddingSize);

  for (var index = paddingSize; index < workSize; ++index) {
    var yn = 0;
    for (k = 0; k < feedforward.length; ++k)
      yn += feedforward[k] * x[index - k];
    for (k = 0; k < feedback.length; ++k)
      yn -= feedback[k] * y[index - k];
    y[index] = yn;
  }

  channelData.set(y.slice(paddingSize).map(Math.fround));
}


/**
 * A collection of Float32Array as AudioBus abstraction.
 * @param {Number} numberOfChannels   Number of channels.
 * @param {Number} length             Buffer length in samples.
 * @param {Number} sampleRate         Operating sample rate.
 */
function AudioBus (numberOfChannels, length, sampleRate) {
  this.numberOfChannels = numberOfChannels;
  this.sampleRate = sampleRate;
  this.length = length;
  this.duration = this.length / this.sampleRate;

  this._channelData = [];
  for (var i = 0; i < this.numberOfChannels; ++i) {
    this._channelData[i] = new Float32Array(length);
  }
}

AudioBus.prototype.getChannelData = function (channel) {
  return this._channelData[channel];
};

AudioBus.prototype.getAudioBuffer = function (context) {
  var audioBuffer = context.createBuffer(
      this.numberOfChannels, this.length, this.sampleRate);

  for (var channel = 0; channel < this.numberOfChannels; ++channel)
    audioBuffer.getChannelData(channel).set(this._channelData[channel]);

  return audioBuffer;
};

AudioBus.prototype.fillChannelData = function (samples) {
  for (var channel = 0; channel < this.numberOfChannels; ++channel)
    this._channelData[channel].fill(samples[channel]);
};

AudioBus.prototype.copyFrom = function (otherAudioBus) {
  for (var channel = 0; channel < this.numberOfChannels; ++channel)
    this._channelData[channel].set(otherAudioBus.getChannelData(channel));
};

AudioBus.prototype.copyFromAudioBuffer = function (audioBuffer) {
  for (var channel = 0; channel < this.numberOfChannels; ++channel)
    this._channelData[channel].set(audioBuffer.getChannelData(channel));
};

AudioBus.prototype.sumFrom = function (otherAudioBus) {
  for (var channel = 0; channel < this.numberOfChannels; ++channel) {
    var channelDataA = this._channelData[channel];
    var channelDataB = otherAudioBus.getChannelData(channel);
    for (var i = 0; i < this.length; ++i)
      channelDataA[i] += channelDataB[i];
  }
};

AudioBus.prototype.processGain = function (coefficents) {
  for (var channel = 0; channel < this.numberOfChannels; ++channel) {
    var channelData = this._channelData[channel];
    for (var i = 0; i < this.length; ++i)
      channelData[i] *= coefficents[channel];
  }
};

AudioBus.prototype.processIIRFilter = function (feedforward, feedback) {
  for (var channel = 0; channel < this.numberOfChannels; ++channel)
    kernel_IIRFIlter(this._channelData[channel], feedforward, feedback);
};

AudioBus.prototype.compareWith = function (otherAudioBus, threshold) {
  var passed = true;

  for (var channel = 0; channel < this.numberOfChannels; ++channel) {
    var channelDataA = this._channelData[channel];
    var channelDataB = otherAudioBus.getChannelData(channel);

    for (var i = 0; i < this.length; ++i) {
      var absDiff = Math.abs(channelDataA[i] - channelDataB[i]);
      if (absDiff > threshold) {
        console.log('ERROR: [index ' + i + '] this = ' + channelDataA[i]
            + ' other = ' +  channelDataB[i]
            + ' (absDiff = ' + absDiff + ', threshold = ' + threshold + ').');
        passed = false;
      }
    }
  }

  return passed;
};

AudioBus.prototype.print = function (begin, end) {
  begin = (begin || 0);
  end = (end || this.length);
  console.log('AudioBus: <' + begin + ' ~ ' + end + '>');
  for (var channel = 0; channel < this.numberOfChannels; ++channel) {
    console.log(channel
        + ' => [' + this._channelData[channel].subarray(begin, end) + ']');
  }
}
