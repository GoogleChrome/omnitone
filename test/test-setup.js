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
 * @param {AudioContext}  context     AudioContext.
 * @param {Array}         contents    User-defined value for each channel.
 * @return {AudioBuffer}              A created buffer.
 */
function createTestBuffer(context, contents, length) {
  var testBuffer = context.createBuffer(
      contents.length, length, context.sampleRate);

  for (var channel = 0; channel < testBuffer.numberOfChannels; channel++) {
    var channelData = testBuffer.getChannelData(channel);
    for (var index = 0; index < channelData.length; index++)
      channelData[index] = contents[channel];
  }

  return testBuffer;
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
