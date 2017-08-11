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
 * @fileOverview Omnitone library common utilities.
 */

'use strict';

/**
 * Omnitone library logging function.
 * @type {Function}
 * @param {any} Message to be printed out.
 */
exports.log = function() {
  window.console.log.apply(window.console, [
    '%c[Omnitone]%c ' + Array.prototype.slice.call(arguments).join(' ') +
        ' %c(@' + performance.now().toFixed(2) + 'ms)',
    'background: #BBDEFB; color: #FF5722; font-weight: 700', 'font-weight: 400',
    'color: #AAA'
  ]);
};


/**
 * Get a total number of channels for a given ambisonic order.
 * @param {Number} order Ambisonic order
 * @return {Number}
 */
exports.getNumberOfChannelsFromAmbisonicOrder = function(order) {
  return (order + 1) * (order + 1);
};
