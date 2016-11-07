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


describe('FOAPhaseMatchedFilter', function () {
  // Test threshold. Approximately -140dBFS.
  var TEST_THRESHOLD = 1.0e-7;

  // Parameters for the FOA phase matched filter.
  var crossoverFrequency = 690;
  var hipassGainCompensation = [-1.4142, -0.8166, -0.8166, -0.8166];

  var sampleRate = 48000;
  var renderLength = 128;
  var context;
  var testAudioBus;

  // A common task for router tests. Create an OAC for rendering.
  beforeEach(function (done) {
    context = new OfflineAudioContext(4, renderLength, sampleRate);
    testAudioBus = new AudioBus(4, renderLength, sampleRate);
    testAudioBus.fillChannelData([0.25, 0.5, 0.75, 1]);
    done();
  });


  // Testing IIR filter implementation in the browser. (if applicable)
  it('Testing the IIR filter implementation.', function (done) {
      expect(typeof context.createIIRFilter).to.equal('function');

      var filterCoefs = getDualBandFilterCoefs(
          crossoverFrequency, sampleRate);

      var expectedBus = new AudioBus(4, renderLength, sampleRate);
      expectedBus.copyFrom(testAudioBus);
      expectedBus.processIIRFilter(
          filterCoefs.lowpassB, filterCoefs.lowpassA);

      var source = context.createBufferSource();
      source.buffer = testAudioBus.getAudioBuffer(context);
      var filter = context.createIIRFilter(
          filterCoefs.lowpassB, filterCoefs.lowpassA);

      source.connect(filter);
      filter.connect(context.destination);
      source.start();

      context.startRendering().then(function (renderedBuffer) {
        var actualBus = new AudioBus(4, renderLength, sampleRate);
        actualBus.copyFromAudioBuffer(renderedBuffer);
        var result = expectedBus.compareWith(actualBus, 0.0);
        expect(result).to.equal(true);

        done();
      });
    }
  );


  // Create the expected result from the JS-version of dual band filter, and
  // compare with the FOAPhaseMatchedFilter result.
  it('Simulate and verify the phase-matched filter implementation.',
      function (done) {
        // Generate the expected filter result.
        var filterCoefs = getDualBandFilterCoefs(
            crossoverFrequency, sampleRate);

        var hipassBus = new AudioBus(4, renderLength, sampleRate);
        hipassBus.copyFrom(testAudioBus);
        hipassBus.processIIRFilter(filterCoefs.hipassB, filterCoefs.hipassA);
        hipassBus.processGain(hipassGainCompensation);

        var lowpassBus = new AudioBus(4, renderLength, sampleRate);
        lowpassBus.copyFrom(testAudioBus);
        lowpassBus.processIIRFilter(filterCoefs.lowpassB, filterCoefs.lowpassA);

        hipassBus.sumFrom(lowpassBus);

        // Generate the actual filter result.
        var source = context.createBufferSource();
        source.buffer = testAudioBus.getAudioBuffer(context);

        var dualbandFilter = Omnitone.createFOAPhaseMatchedFilter(context);

        source.connect(dualbandFilter.input);
        dualbandFilter.output.connect(context.destination);

        source.start();

        context.startRendering().then(function (renderedBuffer) {
          var actualBus = new AudioBus(4, renderLength, sampleRate);
          actualBus.copyFromAudioBuffer(renderedBuffer);
          var result = hipassBus.compareWith(actualBus, TEST_THRESHOLD);
          expect(result).to.equal(true);

          done();
        });
      }
  );


});
