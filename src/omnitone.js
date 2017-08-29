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

/**
 * @file Omnitone library name space and user-facing APIs.
 */


'use strict';

var AudioBufferManager = require('./audiobuffer-manager.js');
var FOAConvolver = require('./foa-convolver.js');
var FOADecoder = require('./foa-decoder.js');
var FOAPhaseMatchedFilter = require('./foa-phase-matched-filter.js');
var FOARenderer = require('./foa-renderer.js');
var FOARotator = require('./foa-rotator.js');
var FOARouter = require('./foa-router.js');
var FOAVirtualSpeaker = require('./foa-virtual-speaker.js');
var HOAConvolver = require('./hoa-convolver.js');
var HOARenderer = require('./hoa-renderer.js');
var HOARotator = require('./hoa-rotator.js');
var Utils = require('./utils.js');
var Version = require('./version.js');


/**
 * @class Omnitone namespace.
 */
var Omnitone = {};


/**
 * Load audio buffers based on the speaker configuration map data.
 * @param {AudioContext} context      The associated AudioContext.
 * @param {Map} speakerData           The speaker configuration map data.
 *                                    { name, url, coef }
 * @return {Promise}
 */
Omnitone.loadAudioBuffers = function(context, speakerData) {
  return new Promise(function(resolve, reject) {
    new AudioBufferManager(context, speakerData, function(buffers) {
      resolve(buffers);
    }, reject);
  });
};


/**
 * Create an instance of FOA Convolver. For parameters, refer the definition of
 * Router class.
 * @return {FOAConvolver}
 */
Omnitone.createFOAConvolver = function(context, options) {
  return new FOAConvolver(context, options);
};


/**
 * Create an instance of FOA Router. For parameters, refer the definition of
 * Router class.
 * @return {FOARouter}
 */
Omnitone.createFOARouter = function(context, channelMap) {
  return new FOARouter(context, channelMap);
};


/**
 * Create an instance of FOA Rotator. For parameters, refer the definition of
 * Rotator class.
 * @return {FOARotator}
 */
Omnitone.createFOARotator = function(context) {
  return new FOARotator(context);
};


/**
 * Create an instance of FOAPhaseMatchedFilter. For parameters, refer the
 * definition of PhaseMatchedFilter class.
 * @return {FOAPhaseMatchedFilter}
 */
Omnitone.createFOAPhaseMatchedFilter = function(context) {
  return new FOAPhaseMatchedFilter(context);
};


/**
 * Create an instance of FOAVirtualSpeaker. For parameters, refer the
 * definition of VirtualSpeaker class.
 * @return {FOAVirtualSpeaker}
 */
Omnitone.createFOAVirtualSpeaker = function(context, options) {
  return new FOAVirtualSpeaker(context, options);
};


/**
 * Create a singleton FOADecoder instance.
 * @param {AudioContext} context      Associated AudioContext.
 * @param {DOMElement} videoElement   Video or Audio DOM element to be streamed.
 * @param {Object} options            Options for FOA decoder.
 * @param {String} options.baseResourceUrl    Base URL for resources.
 *                                            (HRTF IR files)
 * @param {Number} options.postGain           Post-decoding gain compensation.
 *                                            (Default = 26.0)
 * @param {Array} options.routingDestination  Custom channel layout.
 * @return {FOADecoder}
 */
Omnitone.createFOADecoder = function(context, videoElement, options) {
  return new FOADecoder(context, videoElement, options);
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
 * Creates HOARotator for higher-order ambisonics rotation.
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number} ambisonicOrder - Ambisonic order.
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
 */
Omnitone.createHOAConvolver =
    function(context, ambisonicOrder, hrirBufferList) {
  return new HOAConvolver(context, ambisonicOrder, hrirBufferList);
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
 */
Omnitone.createHOARenderer = function(context, config) {
  return new HOARenderer(context, config);
};


Utils.log('Omnitone: Version ' + Version);


module.exports = Omnitone;
