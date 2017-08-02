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


// Test HOAConvolver object as TOA(third-order ambisonic).
//
// Load HRIR (SH MaxRE, the new optimized IRs) and shoot an impulse to generate
// a buffer of binaural rendering. Then compare it with the JS-calculated
// result.
describe('HOAConvolver (3rd order ambisonic)', function() {
  // This test is async, override timeout threshold to 5 sec.
  this.timeout(5000);

  // Threshold for sample comparison. It is necessary because of truncation
  // error.
  var THRESHOLD = 2.9802322387695312e-8;

  // SH MaxRe HRIRs are 48Khz and 256 samples.
  var sampleRate = 48000;
  var renderLength = 256;

  var context;
  var toaImpulseBuffer;
  var toaSHMaxREBuffer;

  /**
   * Generate the expected binaural rendering (based on SH-maxRE algorithm)
   * result from the impulse response and generate an AudioBus instance.
   * @param  {AudioBuffer} buffer     TOA SH-maxRE HRIR buffer.
   * @return {AudioBus}
   */
  function generateExpectedBusFromTOAIRBuffer(buffer) {
    // TOA IR set is 16 channels.
    expect(buffer.numberOfChannels).to.equal(16);

    // Derive ambisonic order from number of channels.
    var ambisonicOrder = Math.floor(Math.sqrt(buffer.numberOfChannels)) - 1;

    // Get pointers to each buffer.
    var acnChannelData = [];
    for (var i = 0; i < buffer.numberOfChannels; i++)
      acnChannelData[i] = buffer.getChannelData(i);

    var generatedBus = new AudioBus(2, buffer.length, buffer.sampleRate);
    var L = generatedBus.getChannelData(0);
    var R = generatedBus.getChannelData(1);

    // We wish to exploit front-axis symmetry, hence the left output will be
    // the sum of all spherical harmonics while the right output is the
    // difference between the positive-m spherical harmonics and the negative-m
    // spherical harmonics.
    for (var i = 0; i < buffer.length; ++i) {
      L[i] = 0;
      R[i] = 0;
      for (var l = 0; l <= ambisonicOrder; l++) {
        for (var m = -l; m <= l; m++) {
          var channelValue = acnChannelData[l * l + l + m];
          L[i] += channelValue;
          R[i] += m >= 0 ? channelValue : -channelValue;
        }
      }
    }

    return generatedBus;
  }

  beforeEach(function(done) {
    var ambisonicOrder = 3;
    var numberOfChannels = (ambisonicOrder + 1) * (ambisonicOrder + 1);

    context =
        new OfflineAudioContext(numberOfChannels, renderLength, sampleRate);
    toaImpulseBuffer =
        createImpulseBuffer(context, numberOfChannels, renderLength);
    toaSHMaxREBuffer =
        context.createBuffer(numberOfChannels, renderLength, sampleRate);

    // Load 3rd order IR files (16 channels) to |toaSHMaxREBuffer|.
    Omnitone
        .loadAudioBuffers(
            context,
            [
              {
                name: 'SH-MaxRe-part1',
                url: 'base/build/resources/sh_hrir_o_3_ch0-ch7.wav'
              },
              {
                name: 'SH-MaxRe-part2',
                url: 'base/build/resources/sh_hrir_o_3_ch8-ch15.wav'
              }
            ])
        .then(function(buffers) {
          for (var i = 0; i < 8; ++i) {
            toaSHMaxREBuffer.copyToChannel(
                buffers.get('SH-MaxRe-part1').getChannelData(i), i);
            toaSHMaxREBuffer.copyToChannel(
                buffers.get('SH-MaxRe-part2').getChannelData(i), i + 8);
          }

          done();
        });
  });

  it('inject impulse buffer and verify convolution result.', function(done) {
    var impulseSource = context.createBufferSource();
    var hoaConvolver =
        Omnitone.createHOAConvolver(context, {IRBuffer: toaSHMaxREBuffer});

    impulseSource.buffer = toaImpulseBuffer;

    impulseSource.connect(hoaConvolver.input);
    hoaConvolver.output.connect(context.destination);
    impulseSource.start();

    context.startRendering().then(function(renderedBuffer) {
      var actualBus = new AudioBus(2, renderLength, sampleRate);
      actualBus.copyFromAudioBuffer(renderedBuffer);
      var expectedBus = generateExpectedBusFromTOAIRBuffer(toaSHMaxREBuffer);
      expect(actualBus.compareWith(expectedBus, THRESHOLD)).to.equal(true);
      done();
    });
  });
});
