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
 * Test HOAColvoler object.
 *
 * Load HRIR (SH MaxRE, the new optimized IRs) and shoot an impulse to generate
 * a buffer of binaural rendering. Then compare it with the JS-calculated
 * result. Thresholding the comparison is necessary because of truncation error.
 */
describe('HOAConvolver', function () {
  // This test is async, override timeout threshold to 5 sec.
  this.timeout(5000);

  // Threshold for sample comparison.
  var THRESHOLD = 2.9802322387695312e-8;

  // SH MaxRe HRIRs are 48Khz and 256 samples.
  var sampleRate = 48000;
  var renderLength = 256;

  var context;
  var hoaImpulseBuffer;
  var hoaSHMaxREBuffer;

  /**
   * Calculate the expected binaural rendering (based on SH-maxRE algorithm)
   * result from the impulse input and generate an AudioBus instance.
   * @param  {AudioBuffer} buffer     FOA SH-maxRE HRIR buffer.
   * @return {AudioBus}
   */
  function generateExpectedBusFromHOAIRBuffer (buffer) {
    var generatedBus = new AudioBus(2, buffer.length, buffer.sampleRate);

    // Get pointers to each buffer.
    var ACN = [];
    for (var i = 0; i < buffer.numberOfChannels; i++) {
      ACN[i] = buffer.getChannelData(i);
    }
    var L = generatedBus.getChannelData(0);
    var R = generatedBus.getChannelData(1);

    // Derive ambisonic order from number of channels.
    var ambisonicOrder = Math.floor(Math.sqrt(buffer.numberOfChannels)) - 1;

    /**
     * We wish to exploit front-axis symmetry, hence the left output will be
     * the sum of all spherical harmonics while the right output is the
     * difference between the positive-m spherical harmonics and the negative-m
     * spherical harmonics.
     */
    for (var i = 0; i < buffer.length; ++i) {
      L[i] = 0;
      R[i] = 0;
      for (var l = 0; l <= ambisonicOrder; l++) {
        for (var m = -l; m <= l; m++) {
          var acnIndex = l * l + l + m;
          L[i] += ACN[acnIndex];
          if (m >= 0) {
            R[i] += ACN[acnIndex];
          } else {
            R[i] -= ACN[acnIndex];
          }
        }
      }
    }
    return generatedBus;
  }

  beforeEach(function (done) {
    context = new OfflineAudioContext(16, renderLength, sampleRate);
    hoaImpulseBuffer = createImpulseBuffer(context, 16, renderLength);

    Omnitone.loadAudioBuffers(context, [{
        name: 'SH-MaxRe',
        url: 'base/build/resources/sh_hrir_o_3_ch0-ch7.wav'
      }]).then(function (buffers_ch0_ch7) {
        hoaSHMaxREBuffer = context.createBufferSource(16,
          buffers_ch0_ch7.get('SH-MaxRe').length,
          buffers_ch0_ch7.get('SH-MaxRe').sampleRate);
        for (var i = 0; i < 8; i++) {
          hoaSHMaxREBuffer.getChannelData(i)
            .set(buffers_ch0_ch7.get('SH-MaxRe').getChannelData(i));
        }
        Omnitone.loadAudioBuffers(context, [{
          name: 'SH-MaxRe',
          url: 'base/build/resources/sh_hrir_o_3_ch8-ch15.wav'
        }]).then(function (buffers_ch8_ch15) {
          for (var i = 0; i < 8; i++) {
            hoaSHMaxREBuffer.getChannelData(i + 8)
              .set(buffers_ch8_ch15.get('SH-MaxRe').getChannelData(i));
          }
          done();
        });
      });
  });

  it('inject impulse buffer and verify convolution result.',
      function (done) {
        var impulseSource = context.createBufferSource();
        var hoaConvolver = Omnitone.createHOAConvolver(context, {
          IR: hoaSHMaxREBuffer
        });

        impulseSource.buffer = hoaImpulseBuffer;

        impulseSource.connect(hoaConvolver.input);
        hoaConvolver.output.connect(context.destination);
        impulseSource.start();

        context.startRendering().then(function (renderedBuffer) {
          var actualBus = new AudioBus(2, renderLength, sampleRate);
          actualBus.copyFromAudioBuffer(renderedBuffer);
          var expectedBus =
              generateExpectedBusFromHOAIRBuffer(hoaSHMaxREBuffer);
          expect(actualBus.compareWith(expectedBus, THRESHOLD)).to.equal(true);
          done();
        });
      }
  );
});
