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
 * Test BufferList and convolver buffer validation.
 */
describe('BufferList and Convolver validation', function() {
  it('rejects cleanly with an Error on decode failure instead of resolving ' +
      'with null', function(done) {
    var context = new OfflineAudioContext(2, 16, 48000);
    var corrupt = btoa('not-a-valid-audio-file');
    // Note: createBufferList() already invokes load() and returns its promise.
    var loading = Omnitone.createBufferList(
        context, [corrupt], {dataType: 'base64'});

    var resolved = false;
    loading.then(
        function() {
          resolved = true;
          done(new Error('Expected rejection, but load() resolved'));
        },
        function(error) {
          expect(resolved).to.equal(false);
          expect(error).to.be.an.instanceof(Error);
          expect(error.message).to.include('BufferList');
          done();
        });
  });

  it('does not emit an unhandledrejection when decoding fails',
      function(done) {
    var context = new OfflineAudioContext(2, 16, 48000);
    var corrupt = btoa('not-a-valid-audio-file');
    var unhandled = [];
    var onUnhandled = function(event) {
      unhandled.push(String(event.reason));
    };

    window.addEventListener('unhandledrejection', onUnhandled);

    Omnitone.createBufferList(context, [corrupt], {dataType: 'base64'})
        .catch(function() {
          // The BufferList promise rejected as expected. Modern browsers
          // also return a promise from the callback form of
          // decodeAudioData; if that one is left unhandled the event fires
          // on a later task, so yield before asserting.
          setTimeout(function() {
            window.removeEventListener('unhandledrejection', onUnhandled);
            try {
              expect(unhandled).to.deep.equal([]);
              done();
            } catch (assertionError) {
              done(assertionError);
            }
          }, 100);
        });
  });

  it('rejects FOAConvolver and HOAConvolver when passed null or invalid ' +
      'AudioBuffers', function() {
    var context = new OfflineAudioContext(2, 16, 48000);
    var validBuffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 16,
      sampleRate: 48000,
    });

    var foaConvolver = Omnitone.createFOAConvolver(context);
    expect(function() {
      foaConvolver.setHRIRBufferList([validBuffer, null]);
    }).to.throw();

    var hoaConvolver = Omnitone.createHOAConvolver(context, 2);
    expect(function() {
      hoaConvolver.setHRIRBufferList(
          [validBuffer, validBuffer, null, validBuffer, validBuffer]);
    }).to.throw();
  });
});
