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

  // Test invalid URLs in constructor options. Check if the promise rejection
  // occurs correctly.
  // ISSUE: https://github.com/GoogleChrome/omnitone/issues/80
  it('FOARenderer with invalid hrirPathList URL must be rejected.', (done) => {
    let context = new AudioContext();
    let foaRenderer =
        Omnitone.createFOARenderer(context, {hrirPathList: ['foo', 'bar']});
    
    foaRenderer.initialize().then(() => {
      assert.isNotOk({}, 'The promise should have been rejected.');
      done();
    }, (errorMessage) => {
      assert.isOk(errorMessage, 'The promise is rejected as expected.');
      done();
    });
  });

  it('HOARenderer with invalid hrirPathList URL must be rejected.', (done) => {
    let context = new AudioContext();
    let hoaRenderer =
        Omnitone.createHOARenderer(context, {
          hrirPathList: ['0', '1', '2', '3', '4', '5', '6', '7']
        });

    hoaRenderer.initialize().then(() => {
      assert.isNotOk({}, 'The promise should have been rejected.');
      done();
    }, (errorMessage) => {
      assert.isOk(errorMessage, 'The promise is rejected as expected.');
      done();
    });
  });

});
