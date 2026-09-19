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
 * Test Utils helper functions.
 */
describe('Utils.splitBufferByChannel', function() {
  // Split an 8-channel AudioBuffer (filled with constant channel index values
  // 1..8) into four 2-channel stereo AudioBuffers and verify channel data.
  it('splits an 8-channel buffer into four stereo buffers', function() {
    var context = new OfflineAudioContext(2, 16, 48000);
    var src = new AudioBuffer({
      numberOfChannels: 8,
      length: 16,
      sampleRate: 48000,
    });
    for (var c = 0; c < 8; ++c) {
      src.getChannelData(c).fill(c + 1);
    }

    var split = Omnitone.splitBufferByChannel(context, src, 2);
    expect(split.length).to.equal(4);
    for (var i = 0; i < 4; ++i) {
      expect(split[i].numberOfChannels).to.equal(2);
      expect(split[i].getChannelData(0)[0]).to.equal(2 * i + 1);
      expect(split[i].getChannelData(1)[0]).to.equal(2 * i + 2);
    }
  });
});

describe('Module exports and browserInfo', function() {
  it('exposes the Omnitone API on the ESM and UMD builds', function(done) {
    expect(Omnitone.browserInfo.name).to.be.a('string');
    expect(Omnitone.browserInfo.version).to.be.a('string');

    import('/build/omnitone.esm.js').then(function(mod) {
      expect(mod.default).to.be.an('object');
      expect(mod.default.createFOARenderer).to.be.a('function');
      expect(mod.default.createHOARenderer).to.be.a('function');
      done();
    }).catch(done);
  });
});

