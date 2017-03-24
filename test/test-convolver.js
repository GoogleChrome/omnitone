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
 * Test FOAColvoler object.
 *
 * Load HRIR (SH MaxRE, the new optimized IRs) and shoot an impulse to generate
 * a buffer of binaural rendering. Then compare it with the JS-calculated
 * result. Thresholding the comparison is necessary because
 */
describe('FOAConvolver', function () {
  // This test is async, override timeout threshold to 5 sec.
  this.timeout(5000);

  // Threshold for sample comparison.
  var THRESHOLD = 2.9802322387695312e-8;

  // SH MaxRe HRIRs are 48Khz and 256 samples.
  var sampleRate = 48000;
  var renderLength = 256;

  var context;
  var foaImpulseBuffer;
  var foaSHMaxREBuffer;

  /**
   * Calculate the expected binaural rendering (based on SH-maxRE algorithm)
   * result from the impulse input and generate an AudioBus instance.
   * @param  {AudioBuffer} buffer     FOA SH-maxRE HRIR buffer.
   * @return {AudioBus}
   */
  function generateExpectedBusFromFOAIRBuffer (buffer) {
    var generatedBus = new AudioBus(2, buffer.length, buffer.sampleRate);
    var W = buffer.getChannelData(0);
    var Y = buffer.getChannelData(1);
    var Z = buffer.getChannelData(2);
    var X = buffer.getChannelData(3);
    var L = generatedBus.getChannelData(0);
    var R = generatedBus.getChannelData(1);

    for (var i = 0; i < buffer.length; ++i) {
      L[i] = W[i] + Y[i] + Z[i] + X[i];
      R[i] = W[i] - Y[i] + Z[i] + X[i];
    }
    return generatedBus;
  }

  beforeEach(function (done) {
    context = new OfflineAudioContext(4, renderLength, sampleRate);
    foaImpulseBuffer = createImpulseBuffer(context, 4, renderLength);

    Omnitone.loadAudioBuffers(context, [{
        name: 'SH-MaxRe',
        url: 'base/build/resources/sh_hrir_o_1.wav'
      }]).then(function (buffers) {
        foaSHMaxREBuffer = buffers.get('SH-MaxRe');
        done();
      });
  });

  it('inject impulse buffer and verify convolution result.',
      function (done) {
        var impulseSource = context.createBufferSource();
        var foaConvolver = Omnitone.createFOAConvolver(context, {
          IR: foaSHMaxREBuffer
        });

        impulseSource.buffer = foaImpulseBuffer;

        impulseSource.connect(foaConvolver.input);
        foaConvolver.output.connect(context.destination);
        impulseSource.start();

        context.startRendering().then(function (renderedBuffer) {
          var actualBus = new AudioBus(2, renderLength, sampleRate);
          actualBus.copyFromAudioBuffer(renderedBuffer);
          var expectedBus =
              generateExpectedBusFromFOAIRBuffer(foaSHMaxREBuffer);
          expect(actualBus.compareWith(expectedBus, THRESHOLD)).to.equal(true);
          done();
        });
      }
  );
});
