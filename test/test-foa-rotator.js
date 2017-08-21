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


describe('FOARotator', function () {

  var sampleRate = 48000;
  var renderLength = 0.1 * sampleRate;
  var context;
  var testBuffer;

  // A common task for router tests. Create OAC for rendering.
  beforeEach(function (done) {
    context = new OfflineAudioContext(4, renderLength, sampleRate);
    testBuffer = createConstantBuffer(context, [0, 1, 2, 3], renderLength);
    done();
  });


  it('#setRotationMatrix: rotate the incoming stream with a 3x3 matrix.',
      function (done) {
        var source = context.createBufferSource();
        source.buffer = testBuffer;

        var rotator = Omnitone.createFOARotator(context);

        source.connect(rotator.input);
        rotator.output.connect(context.destination);
        source.start();

        // 90 degree clockwise along z-axis. (row-major representation)
        rotator.setRotationMatrix3([
            0, -1,  0,
            1,  0,  0,
            0,  0,  1
          ]);

        // Note that there are some conversions due to the ACN channel ordering
        // and world-audio space transformation.
        var expectedValues = [0, -2, 1, 3];

        context.startRendering().then(function (renderedBuffer) {
          for (c = 0; c < renderedBuffer.numberOfChannels; c++) {
            passed = isConstantValueOf(
              renderedBuffer.getChannelData(c), expectedValues[c]);
            expect(passed).to.equal(true);
          }
          done();
        });
      }
  );


  it('#setRotationMatrix4: rotate the incoming stream with a 4x4 matrix.',
      function (done) {
        var source = context.createBufferSource();
        source.buffer = testBuffer;

        var rotator = Omnitone.createFOARotator(context);

        source.connect(rotator.input);
        rotator.output.connect(context.destination);
        source.start();

        // 90 degree counter-clockwise along z-axis. (row-major representation)
        rotator.setRotationMatrix4([
            0,  1, 0, 0,
            -1, 0, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
          ]);

        // Note that there are some conversions due to the ACN channel ordering
        // and world-audio space transformation.
        var expectedValues = [0, 2, -1, 3];

        context.startRendering().then(function (renderedBuffer) {
          for (c = 0; c < renderedBuffer.numberOfChannels; c++) {
            passed = isConstantValueOf(
              renderedBuffer.getChannelData(c), expectedValues[c]);
            expect(passed).to.equal(true);
          }
          done();
        });

      }
  );


});
