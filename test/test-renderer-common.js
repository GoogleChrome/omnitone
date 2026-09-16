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
 * Test FOA/HOARenderer common functions.
 */

describe('Constructor', () => {

  // Test invalid URLs in constructor options. Verify that initialize() rejects
  // with an Error instance and does not leak an unhandledrejection event.
  // ISSUE: https://github.com/GoogleChrome/omnitone/issues/80
  it('FOARenderer with invalid hrirPathList URL must be rejected.', (done) => {
    let context = new AudioContext();
    let foaRenderer =
        Omnitone.createFOARenderer(context, {hrirPathList: ['foo', 'bar']});
    let leaked = false;
    const onUnhandled = () => {
      leaked = true;
    };
    window.addEventListener('unhandledrejection', onUnhandled);

    foaRenderer.initialize().then(() => {
      window.removeEventListener('unhandledrejection', onUnhandled);
      assert.isNotOk({}, 'The promise should have been rejected.');
      done();
    }, (error) => {
      setTimeout(() => {
        window.removeEventListener('unhandledrejection', onUnhandled);
        expect(error).to.be.an.instanceof(Error);
        expect(leaked).to.equal(false);
        done();
      }, 0);
    });
  });

  it('HOARenderer with invalid hrirPathList URL must be rejected.', (done) => {
    let context = new AudioContext();
    let hoaRenderer =
        Omnitone.createHOARenderer(context, {
          hrirPathList: ['0', '1', '2', '3', '4', '5', '6', '7']
        });
    let leaked = false;
    const onUnhandled = () => {
      leaked = true;
    };
    window.addEventListener('unhandledrejection', onUnhandled);

    hoaRenderer.initialize().then(() => {
      window.removeEventListener('unhandledrejection', onUnhandled);
      assert.isNotOk({}, 'The promise should have been rejected.');
      done();
    }, (error) => {
      setTimeout(() => {
        window.removeEventListener('unhandledrejection', onUnhandled);
        expect(error).to.be.an.instanceof(Error);
        expect(leaked).to.equal(false);
        done();
      }, 0);
    });
  });

});

// Verify that passing renderingMode ('off' or 'bypass') in the constructor
// options disables the convolver upon initialization, rather than being
// skipped by setRenderingMode's early-return guard.
describe('RenderingMode (constructor-supplied)', () => {
  it('FOARenderer honors renderingMode: "off" and "bypass"', (done) => {
    const context = new AudioContext();
    const offRenderer =
        Omnitone.createFOARenderer(context, {renderingMode: 'off'});
    const bypassRenderer =
        Omnitone.createFOARenderer(context, {renderingMode: 'bypass'});

    Promise.all([offRenderer.initialize(), bypassRenderer.initialize()])
        .then(() => {
          expect(offRenderer._foaConvolver._active).to.equal(false);
          expect(bypassRenderer._foaConvolver._active).to.equal(false);

          // Re-applying the same mode must remain idempotent.
          bypassRenderer.setRenderingMode('bypass');
          expect(bypassRenderer._foaConvolver._active).to.equal(false);
          done();
        })
        .catch(done);
  });

  it('HOARenderer honors renderingMode: "off"', (done) => {
    const context = new AudioContext();
    const renderer =
        Omnitone.createHOARenderer(context, {renderingMode: 'off'});

    renderer.initialize().then(() => {
      expect(renderer._hoaConvolver._active).to.equal(false);
      done();
    }).catch(done);
  });
});
