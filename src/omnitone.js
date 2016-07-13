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
var FOARouter = require('./foa-router.js');
var FOARotator = require('./foa-rotator.js');
var FOAPhaseMatchedFilter = require('./foa-phase-matched-filter.js');
var FOAVirtualSpeaker = require('./foa-virtual-speaker.js');
var FOADecoder = require('./foa-decoder.js');

/**
 * Omnitone library version
 * @type {String}
 */
Omnitone.VERSION = '0.1.2';

// Omnitone library-wide log utility.
// @param {any}                       Messages to be printed out.
Omnitone.LOG = function () {
  window.console.log.apply(window.console, [
    '%c[Omnitone]%c '
      + Array.prototype.slice.call(arguments).join(' ') + ' %c(@'
      + performance.now().toFixed(2) + 'ms)',
    'background: #BBDEFB; color: #FF5722; font-weight: 700',
    'font-weight: 400',
    'color: #AAA'
  ]);
};

/**
 * Create an instance of FOA Router. For parameters, refer the definition of
 * Router class.
 * @return {Object}
 */
Omnitone.createFOARouter = function (context, options) {
  return new FOARouter(context, options);
};

/**
 * Create an instance of FOA Rotator. For parameters, refer the definition of
 * Rotator class.
 * @return {Object}
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

module.exports = Omnitone;
