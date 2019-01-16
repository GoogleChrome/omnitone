/**
 * @license
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

/**
 * @file Omnitone library name space and user-facing APIs.
 */


'use strict';

import BufferList from './buffer-list.js';
import FOARouter from './foa-router.js';
import FOARotator from './foa-rotator.js';
import FOAConvolver from './foa-convolver.js';
import FOARenderer from './foa-renderer.js';
import HOAConvolver from './hoa-convolver.js';
import HOARenderer from './hoa-renderer.js';
import HOARotator from './hoa-rotator.js';
import Polyfill from './polyfill.js';
import Version from './version.js';
import Utils from './utils.js';


/**
 * Omnitone namespace.
 * @namespace
 */
const Omnitone = {};


/**
 * @typedef {Object} BrowserInfo
 * @property {string} name - Browser name.
 * @property {string} version - Browser version.
 */

/**
 * An object contains the detected browser name and version.
 * @memberOf Omnitone
 * @static {BrowserInfo}
 */
Omnitone.browserInfo = Polyfill.getBrowserInfo();


/**
 * Performs the async loading/decoding of multiple AudioBuffers from multiple
 * URLs.
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {string[]} bufferData - An ordered list of URLs.
 * @param {Object} [options] - BufferList options.
 * @param {String} [options.dataType='url'] - BufferList data type.
 * @return {Promise<AudioBuffer[]>} - The promise resolves with an array of
 * AudioBuffer.
 */
Omnitone.createBufferList = function(context, bufferData, options) {
  const bufferList =
      new BufferList(context, bufferData, options || {dataType: 'url'});
  return bufferList.load();
};


/**
 * Perform channel-wise merge on multiple AudioBuffers. The sample rate and
 * the length of buffers to be merged must be identical.
 * @static
 * @function
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {AudioBuffer[]} bufferList - An array of AudioBuffers to be merged
 * channel-wise.
 * @return {AudioBuffer} - A single merged AudioBuffer.
 */
Omnitone.mergeBufferListByChannel = Utils.mergeBufferListByChannel;


/**
 * Perform channel-wise split by the given channel count. For example,
 * 1 x AudioBuffer(8) -> splitBuffer(context, buffer, 2) -> 4 x AudioBuffer(2).
 * @static
 * @function
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {AudioBuffer} audioBuffer - An AudioBuffer to be splitted.
 * @param {Number} splitBy - Number of channels to be splitted.
 * @return {AudioBuffer[]} - An array of splitted AudioBuffers.
 */
Omnitone.splitBufferbyChannel = Utils.splitBufferbyChannel;


/**
 * Creates an instance of FOA Convolver.
 * @see FOAConvolver
 * @param {BaseAudioContext} context The associated AudioContext.
 * @param {AudioBuffer[]} [hrirBufferList] - An ordered-list of stereo
 * @return {FOAConvolver}
 */
Omnitone.createFOAConvolver = function(context, hrirBufferList) {
  return new FOAConvolver(context, hrirBufferList);
};


/**
 * Create an instance of FOA Router.
 * @see FOARouter
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number[]} channelMap - Routing destination array.
 * @return {FOARouter}
 */
Omnitone.createFOARouter = function(context, channelMap) {
  return new FOARouter(context, channelMap);
};


/**
 * Create an instance of FOA Rotator.
 * @see FOARotator
 * @param {AudioContext} context - Associated AudioContext.
 * @return {FOARotator}
 */
Omnitone.createFOARotator = function(context) {
  return new FOARotator(context);
};


/**
 * Creates HOARotator for higher-order ambisonics rotation.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number} ambisonicOrder - Ambisonic order.
 * @return {HOARotator}
 */
Omnitone.createHOARotator = function(context, ambisonicOrder) {
  return new HOARotator(context, ambisonicOrder);
};


/**
 * Creates HOAConvolver performs the multi-channel convolution for the optmized
 * binaural rendering.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number} ambisonicOrder - Ambisonic order. (2 or 3)
 * @param {AudioBuffer[]} [hrirBufferList] - An ordered-list of stereo
 * AudioBuffers for convolution. (SOA: 5 AudioBuffers, TOA: 8 AudioBuffers)
 * @return {HOAConvovler}
 */
Omnitone.createHOAConvolver = function(
    context, ambisonicOrder, hrirBufferList) {
  return new HOAConvolver(context, ambisonicOrder, hrirBufferList);
};


/**
 * Create a FOARenderer, the first-order ambisonic decoder and the optimized
 * binaural renderer.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} config
 * @param {Array} [config.channelMap] - Custom channel routing map. Useful for
 * handling the inconsistency in browser's multichannel audio decoding.
 * @param {Array} [config.hrirPathList] - A list of paths to HRIR files. It
 * overrides the internal HRIR list if given.
 * @param {RenderingMode} [config.renderingMode='ambisonic'] - Rendering mode.
 * @return {FOARenderer}
 */
Omnitone.createFOARenderer = function(context, config) {
  return new FOARenderer(context, config);
};


/**
 * Creates HOARenderer for higher-order ambisonic decoding and the optimized
 * binaural rendering.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} config
 * @param {Number} [config.ambisonicOrder=3] - Ambisonic order.
 * @param {Array} [config.hrirPathList] - A list of paths to HRIR files. It
 * overrides the internal HRIR list if given.
 * @param {RenderingMode} [config.renderingMode='ambisonic'] - Rendering mode.
 * @return {HOARenderer}
 */
Omnitone.createHOARenderer = function(context, config) {
  return new HOARenderer(context, config);
};


// Handle Pre-load Tasks: detects the browser information and prints out the
// version number. If the browser is Safari, patch prefixed interfaces.
(function() {
  Utils.log(`Version ${Version} (running ${Omnitone.browserInfo.name} \
${Omnitone.browserInfo.version} on ${Omnitone.browserInfo.platform})`);
  if (Omnitone.browserInfo.name.toLowerCase() === 'safari') {
    Polyfill.patchSafari();
    Utils.log(`${Omnitone.browserInfo.name} detected. Polyfill applied.`);
  }
})();

export default Omnitone;
