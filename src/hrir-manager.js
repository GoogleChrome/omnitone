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
 * @fileOverview Static data manager for HRIR sets and URLs. For Omnitone's
 *               HRIR set structure, see src/resources/README.md for the detail.
 */

'use strict';

var Utils = require('./utils.js');


// HRIR file set structure.
var HRIRSets = {
  FOA: [
    'omnitone-foa-1.wav',
    'omnitone-foa-2.wav'
  ],
  SOA: [
    'omnitone-soa-1.wav',
    'omnitone-soa-2.wav',
    'omnitone-soa-3.wav',
    'omnitone-soa-4.wav',
    'omnitone-soa-5.wav'
  ],
  TOA: [
    'omnitone-toa-1.wav',
    'omnitone-toa-2.wav',
    'omnitone-toa-3.wav',
    'omnitone-toa-4.wav',
    'omnitone-toa-5.wav',
    'omnitone-toa-6.wav',
    'omnitone-toa-7.wav',
    'omnitone-toa-8.wav'
  ]
};

// 3 different types of base URL.
var ResourceURL = {
  GSTATIC:
      'https://www.gstatic.com/external_hosted/omnitone/build/resources/',
  GITHUB:
      'https://cdn.rawgit.com/GoogleChrome/omnitone/master/build/resources/',
  LOCAL:
      'build/resources/',
};


/**
 * @object HRIRMananger
 * @description Manages HRIR set database. Also does URL checking and resource
 *              loading.
 */
var HRIRManager = {};


// TODO: sniffing URLs, make decision on how to load resources
// TODO: load resource -> return a set of AudioBuffers

/**
 * Generate path data for HRIR sets based on the requested location.
 * @param  {String} location Location specifier. 'gstatic', 'github', 'local'.
 * @return {Object} pathSet HRIR path set.
 * @return {Array} pashSet.FOA FOA HRIR paths. (2 paths)
 * @return {Array} pashSet.SOA SOA HRIR paths. (5 paths)
 * @return {Array} pashSet.TOA TOA HRIR paths. (8 paths)
 */
HRIRManager.generatePathSet = function (location) {
  var prefixURL;
  switch (location) {
    case 'gstatic':
      prefixURL = ResourceURL.GSTATIC;
      break;
    case 'local':
      prefixURL = ResourceURL.LOCAL;
      break;
    case 'github':
    default:
      // By default, use GitHub's CDN until Gstatic setup is completed.
      prefixURL = ResourceURL.GITHUB;
      break;
  }

  var pathSet = {};
  for (var ambisonicOrder in HRIRSets) {
    pathSet[ambisonicOrder] = [];
    HRIRSets[ambisonicOrder].forEach(function (filename) {
      pathSet[ambisonicOrder].push(prefixURL + filename);
    });
  }
  return pathSet;
};


module.exports = HRIRManager;
