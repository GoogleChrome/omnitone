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
 * @fileOverview Omnitone library name space and common utilities.
 */

'use strict';

/**
 * @class Omnitone main namespace.
 */
var Omnitone = {};

// Internal dependencies.
var AudioBufferManager = require('./audiobuffer-manager.js');
var FOAConvolver = require('./foa-convolver.js');
var FOARouter = require('./foa-router.js');
var FOARotator = require('./foa-rotator.js');
var FOAPhaseMatchedFilter = require('./foa-phase-matched-filter.js');
var FOAVirtualSpeaker = require('./foa-virtual-speaker.js');
var FOADecoder = require('./foa-decoder.js');
var FOARenderer = require('./foa-renderer.js');
var HOARotator = require('./hoa-rotator.js');
var HOAConvolver = require('./hoa-convolver.js');
var HOARenderer = require('./hoa-renderer.js');

/**
 * Load audio buffers based on the speaker configuration map data.
 * @param {AudioContext} context      The associated AudioContext.
 * @param {Map} speakerData           The speaker configuration map data.
 *                                    { name, url, coef }
 * @return {Promise}
 */
Omnitone.loadAudioBuffers = function (context, speakerData) {
  return new Promise(function (resolve, reject) {
    new AudioBufferManager(context, speakerData, function (buffers) {
      resolve(buffers);
    }, reject);
  });
};

/**
 * Create an instance of FOA Convolver. For parameters, refer the definition of
 * Router class.
 * @return {FOAConvolver}
 */
Omnitone.createFOAConvolver = function (context, options) {
  return new FOAConvolver(context, options);
};

/**
 * Create an instance of FOA Router. For parameters, refer the definition of
 * Router class.
 * @return {FOARouter}
 */
Omnitone.createFOARouter = function (context, channelMap) {
  return new FOARouter(context, channelMap);
};

/**
 * Create an instance of FOA Rotator. For parameters, refer the definition of
 * Rotator class.
 * @return {FOARotator}
 */
Omnitone.createFOARotator = function (context) {
  return new FOARotator(context);
};

/**
 * Create an instance of FOAPhaseMatchedFilter. For parameters, refer the
 * definition of PhaseMatchedFilter class.
 * @return {FOAPhaseMatchedFilter}
 */
Omnitone.createFOAPhaseMatchedFilter = function (context) {
  return new FOAPhaseMatchedFilter(context);
};

/**
 * Create an instance of FOAVirtualSpeaker. For parameters, refer the
 * definition of VirtualSpeaker class.
 * @return {FOAVirtualSpeaker}
 */
Omnitone.createFOAVirtualSpeaker = function (context, options) {
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
Omnitone.createFOADecoder = function (context, videoElement, options) {
  return new FOADecoder(context, videoElement, options);
};

/**
 * Create a FOARenderer.
 * @param {AudioContext} context      Associated AudioContext.
 * @param {Object} options            Options.
 * @param {String} options.HRIRUrl    Optional HRIR URL.
 * @param {Number} options.postGainDB Optional post-decoding gain in dB.
 * @param {Array} options.channelMap  Optional custom channel map.
 * @return {FOARenderer}
 */
Omnitone.createFOARenderer = function (context, options) {
  return new FOARenderer(context, options);
};

/**
 * Creates HOARotator for higher-order ambisonics rotation.
 * @param {AudioContext} context    Associated AudioContext.
 * @param {Number} ambisonicOrder   Ambisonic order.
 */
Omnitone.createHOARotator = function (context, ambisonicOrder) {
  return new HOARotator(context, ambisonicOrder);
};

/**
 * Creates HOAConvolver performs the multi-channel convolution for binaural
 * rendering.
 * @param {AudioContext} context          Associated AudioContext.
 * @param {Object} options
 * @param {Number} options.ambisonicOrder Ambisonic order (default is 3).
 * @param {AudioBuffer} options.IRBuffer  IR Audiobuffer for convolution. The
 *                                        number of channels must be (N+1)^2
 *                                        where N is the ambisonic order.
 */
Omnitone.createHOAConvolver = function (context, options) {
  return new HOAConvolver(context, options);
};

/**
 * Creates HOARenderer for higher-order ambisonic decoding and binaural
 * binaural rendering. 
 * @param {AudioContext} context            Associated AudioContext.
 * @param {Object} options
 * @param {Array} options.HRIRUrl           Optional HRIR URLs in an array.
 * @param {String} options.renderingMode    Rendering mode.
 * @param {Number} options.ambisonicOrder   Ambisonic order (default is 3).
 */
Omnitone.createHOARenderer = function (context, options) {
  return new HOARenderer(context, options);
};


module.exports = Omnitone;
