(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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

	'use strict';

	// Primary namespace for Omnitone library.
	exports.Omnitone = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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
	var AudioBufferManager = __webpack_require__(2);
	var FOAConvolver = __webpack_require__(4);
	var FOARouter = __webpack_require__(5);
	var FOARotator = __webpack_require__(6);
	var FOAPhaseMatchedFilter = __webpack_require__(7);
	var FOAVirtualSpeaker = __webpack_require__(8);
	var FOADecoder = __webpack_require__(9);
	var FOARenderer = __webpack_require__(12);

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
	 * @return {Object}
	 */
	Omnitone.createFOAConvolver = function (context, options) {
	  return new FOAConvolver(context, options);
	};

	/**
	 * Create an instance of FOA Router. For parameters, refer the definition of
	 * Router class.
	 * @return {Object}
	 */
	Omnitone.createFOARouter = function (context, channelMap) {
	  return new FOARouter(context, channelMap);
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

	/**
	 * Create a singleton FOARenderer instance.
	 * @param {AudioContext} context      Associated AudioContext.
	 * @param {Object} options            Options.
	 * @param {String} options.HRIRUrl    Optional HRIR URL.
	 * @param {Number} options.postGainDB Optional post-decoding gain in dB.
	 * @param {Array} options.channelMap  Optional custom channel map.
	 */
	Omnitone.createFOARenderer = function (context, options) {
	  return new FOARenderer(context, options);
	};

	module.exports = Omnitone;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

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
	 * @fileOverview Audio buffer loading utility.
	 */

	'use strict';

	var Utils = __webpack_require__(3);

	/**
	 * Streamlined audio file loader supports Promise.
	 * @param {Object} context          AudioContext
	 * @param {Object} audioFileData    Audio file info as [{name, url}]
	 * @param {Function} resolve        Resolution handler for promise.
	 * @param {Function} reject         Rejection handler for promise.
	 * @param {Function} progress       Progress event handler.
	 */
	function AudioBufferManager(context, audioFileData, resolve, reject, progress) {
	  this._context = context;

	  this._buffers = new Map();
	  this._loadingTasks = {};

	  this._resolve = resolve;
	  this._reject = reject;
	  this._progress = progress;

	  // Iterating file loading.
	  for (var i = 0; i < audioFileData.length; i++) {
	    var fileInfo = audioFileData[i];

	    // Check for duplicates filename and quit if it happens.
	    if (this._loadingTasks.hasOwnProperty(fileInfo.name)) {
	      Utils.log('Duplicated filename when loading: ' + fileInfo.name);
	      return;
	    }

	    // Mark it as pending (0)
	    this._loadingTasks[fileInfo.name] = 0;
	    this._loadAudioFile(fileInfo);
	  }
	}

	AudioBufferManager.prototype._loadAudioFile = function (fileInfo) {
	  var xhr = new XMLHttpRequest();
	  xhr.open('GET', fileInfo.url);
	  xhr.responseType = 'arraybuffer';

	  var that = this;
	  xhr.onload = function () {
	    if (xhr.status === 200) {
	      that._context.decodeAudioData(xhr.response,
	        function (buffer) {
	          // Utils.log('File loaded: ' + fileInfo.url);
	          that._done(fileInfo.name, buffer);
	        },
	        function (message) {
	          Utils.log('Decoding failure: '
	            + fileInfo.url + ' (' + message + ')');
	          that._done(fileInfo.name, null);
	        });
	    } else {
	      Utils.log('XHR Error: ' + fileInfo.url + ' (' + xhr.statusText 
	        + ')');
	      that._done(fileInfo.name, null);
	    }
	  };

	  // TODO: fetch local resources if XHR fails.
	  xhr.onerror = function (event) {
	    Utils.log('XHR Network failure: ' + fileInfo.url);
	    that._done(fileInfo.name, null);
	  };

	  xhr.send();
	};

	AudioBufferManager.prototype._done = function (filename, buffer) {
	  // Label the loading task.
	  this._loadingTasks[filename] = buffer !== null ? 'loaded' : 'failed';

	  // A failed task will be a null buffer.
	  this._buffers.set(filename, buffer);

	  this._updateProgress(filename);
	};

	AudioBufferManager.prototype._updateProgress = function (filename) {
	  var numberOfFinishedTasks = 0, numberOfFailedTask = 0;
	  var numberOfTasks = 0;

	  for (var task in this._loadingTasks) {
	    numberOfTasks++;
	    if (this._loadingTasks[task] === 'loaded')
	      numberOfFinishedTasks++;
	    else if (this._loadingTasks[task] === 'failed')
	      numberOfFailedTask++;
	  }

	  if (typeof this._progress === 'function') {
	    this._progress(filename, numberOfFinishedTasks, numberOfTasks);
	    return;
	  }

	  if (numberOfFinishedTasks === numberOfTasks) {
	    this._resolve(this._buffers);
	    return;
	  }

	  if (numberOfFinishedTasks + numberOfFailedTask === numberOfTasks) {
	    this._reject(this._buffers);
	    return;
	  }
	};

	module.exports = AudioBufferManager;


/***/ },
/* 3 */
/***/ function(module, exports) {

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
	exports.log = function () {
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
	 * A 4x4 matrix inversion utility.
	 * @param {Array} out   the receiving matrix.
	 * @param {Array} a     the source matrix.
	 * @returns {Array} out
	 */
	exports.invertMatrix4 = function (out, a) {
	  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	      b00 = a00 * a11 - a01 * a10,
	      b01 = a00 * a12 - a02 * a10,
	      b02 = a00 * a13 - a03 * a10,
	      b03 = a01 * a12 - a02 * a11,
	      b04 = a01 * a13 - a03 * a11,
	      b05 = a02 * a13 - a03 * a12,
	      b06 = a20 * a31 - a21 * a30,
	      b07 = a20 * a32 - a22 * a30,
	      b08 = a20 * a33 - a23 * a30,
	      b09 = a21 * a32 - a22 * a31,
	      b10 = a21 * a33 - a23 * a31,
	      b11 = a22 * a33 - a23 * a32,

	      det = b00 * b11 - b01 * b10 + b02 * b09 +
	            b03 * b08 - b04 * b07 + b05 * b06;

	  if (!det)
	    return null;
	  det = 1.0 / det;

	  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	  return out;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

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
	 * @fileOverview A collection of convolvers. Can be used for the optimized FOA
	 *               binaural rendering. (e.g. SH-MaxRe HRTFs)
	 */

	'use strict';

	/**
	 * @class FOAConvolver
	 * @description A collection of 2 stereo convolvers for 4-channel FOA stream.
	 * @param {AudioContext} context        Associated AudioContext.
	 * @param {Object} options              Options for speaker.
	 * @param {AudioBuffer} options.IR      Stereo IR buffer for HRTF convolution.
	 * @param {Number} options.gain         Post-gain for the speaker.
	 */
	function FOAConvolver (context, options) {
	  if (options.IR.numberOfChannels !== 4)
	    throw 'IR does not have 4 channels. cannot proceed.';

	  this._active = false;

	  this._context = context;

	  this._input = this._context.createChannelSplitter(4);
	  this._mergerWY = this._context.createChannelMerger(2);
	  this._mergerZX = this._context.createChannelMerger(2);
	  this._convolverWY = this._context.createConvolver();
	  this._convolverZX = this._context.createConvolver();
	  this._splitterWY = this._context.createChannelSplitter(2);
	  this._splitterZX = this._context.createChannelSplitter(2);
	  this._inverter = this._context.createGain();
	  this._mergerBinaural = this._context.createChannelMerger(2);
	  this._summingBus = this._context.createGain();

	  // Group W and Y, then Z and X.
	  this._input.connect(this._mergerWY, 0, 0);
	  this._input.connect(this._mergerWY, 1, 1);
	  this._input.connect(this._mergerZX, 2, 0);
	  this._input.connect(this._mergerZX, 3, 1);

	  // Create a network of convolvers using splitter/merger.
	  this._mergerWY.connect(this._convolverWY);
	  this._mergerZX.connect(this._convolverZX);
	  this._convolverWY.connect(this._splitterWY);
	  this._convolverZX.connect(this._splitterZX);
	  this._splitterWY.connect(this._mergerBinaural, 0, 0);
	  this._splitterWY.connect(this._mergerBinaural, 0, 1);
	  this._splitterWY.connect(this._mergerBinaural, 1, 0);
	  this._splitterWY.connect(this._inverter, 1, 0);
	  this._inverter.connect(this._mergerBinaural, 0, 1);
	  this._splitterZX.connect(this._mergerBinaural, 0, 0);
	  this._splitterZX.connect(this._mergerBinaural, 0, 1);
	  this._splitterZX.connect(this._mergerBinaural, 1, 0);
	  this._splitterZX.connect(this._mergerBinaural, 1, 1);

	  this._convolverWY.normalize = false;
	  this._convolverZX.normalize = false;

	  // Generate 2 stereo buffers from a 4-channel IR.
	  this._setHRIRBuffers(options.IR);

	  // For asymmetric degree.
	  this._inverter.gain.value = -1;

	  // Input/Output proxy.
	  this.input = this._input;
	  this.output = this._summingBus;

	  this.enable();
	}

	FOAConvolver.prototype._setHRIRBuffers = function (hrirBuffer) {
	  // Use 2 stereo convolutions. This is because the mono convolution wastefully
	  // produces the stereo output with the same content.
	  this._hrirWY = this._context.createBuffer(2, hrirBuffer.length,
	                                            hrirBuffer.sampleRate);
	  this._hrirZX = this._context.createBuffer(2, hrirBuffer.length,
	                                            hrirBuffer.sampleRate);

	  // We do this because Safari does not support copyFromChannel/copyToChannel.
	  this._hrirWY.getChannelData(0).set(hrirBuffer.getChannelData(0));
	  this._hrirWY.getChannelData(1).set(hrirBuffer.getChannelData(1));
	  this._hrirZX.getChannelData(0).set(hrirBuffer.getChannelData(2));
	  this._hrirZX.getChannelData(1).set(hrirBuffer.getChannelData(3));

	  // After these assignments, the channel data in the buffer is immutable in
	  // FireFox. (i.e. neutered)
	  this._convolverWY.buffer = this._hrirWY;
	  this._convolverZX.buffer = this._hrirZX;
	};

	FOAConvolver.prototype.enable = function () {
	  this._mergerBinaural.connect(this._summingBus);
	  this._active = true;
	};

	FOAConvolver.prototype.disable = function () {
	  this._mergerBinaural.disconnect();
	  this._active = false;
	};

	module.exports = FOAConvolver;


/***/ },
/* 5 */
/***/ function(module, exports) {

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

	'use strict';

	/**
	 * @fileOverview An audio channel re-router to resolve different channel layouts
	 *               between various platforms.
	 */


	/**
	 * Channel map dictionary for various mapping scheme.
	 *
	 * @type {Object}
	 */
	var CHANNEL_MAP = {
	  // ACN, default channel map. Works correctly on Chrome and FireFox. (FFMpeg)
	  DEFAULT: [0, 1, 2, 3],
	  // Safari's decoder works differently on 4-channel stream.
	  APPLE: [2, 0, 1, 3],
	  // ACN -> FuMa conversion.
	  FUMA: [0, 3, 1, 2]
	};


	/**
	 * @class A simple channel re-router.
	 * @param {AudioContext} context Associated AudioContext.
	 * @param {Array} channelMap  Routing destination array.
	 *                                    e.g.) Chrome: [0, 1, 2, 3],
	 *                                    Apple(Safari): [2, 0, 1, 3]
	 */
	function FOARouter (context, channelMap) {
	  this._context = context;

	  this._splitter = this._context.createChannelSplitter(4);
	  this._merger = this._context.createChannelMerger(4);

	  this._channelMap = channelMap || CHANNEL_MAP.DEFAULT;

	  this._splitter.connect(this._merger, 0, this._channelMap[0]);
	  this._splitter.connect(this._merger, 1, this._channelMap[1]);
	  this._splitter.connect(this._merger, 2, this._channelMap[2]);
	  this._splitter.connect(this._merger, 3, this._channelMap[3]);

	  // input/output proxy.
	  this.input = this._splitter;
	  this.output = this._merger;
	}


	/**
	 * Set a channel map array.
	 *
	 * @param {Array} channelMap A custom channel map for FOA stream.
	 */
	FOARouter.prototype.setChannelMap = function (channelMap) {
	  if (!channelMap)
	    return;

	  this._channelMap = channelMap;
	  this._splitter.disconnect();
	  this._splitter.connect(this._merger, 0, this._channelMap[0]);
	  this._splitter.connect(this._merger, 1, this._channelMap[1]);
	  this._splitter.connect(this._merger, 2, this._channelMap[2]);
	  this._splitter.connect(this._merger, 3, this._channelMap[3]);
	}


	/**
	 * Static channel map dictionary.
	 *
	 * @static
	 * @type {Object}
	 */
	FOARouter.CHANNEL_MAP = CHANNEL_MAP;


	module.exports = FOARouter;


/***/ },
/* 6 */
/***/ function(module, exports) {

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

	'use strict';


	/**
	 * @fileOverview Sound field rotator for first-order-ambisonics decoding.
	 */


	/**
	 * @class First-order-ambisonic decoder based on gain node network.
	 * @param {AudioContext} context    Associated AudioContext.
	 */
	function FOARotator (context) {
	  this._context = context;

	  this._splitter = this._context.createChannelSplitter(4);
	  this._inY = this._context.createGain();
	  this._inZ = this._context.createGain();
	  this._inX = this._context.createGain();
	  this._m0 = this._context.createGain();
	  this._m1 = this._context.createGain();
	  this._m2 = this._context.createGain();
	  this._m3 = this._context.createGain();
	  this._m4 = this._context.createGain();
	  this._m5 = this._context.createGain();
	  this._m6 = this._context.createGain();
	  this._m7 = this._context.createGain();
	  this._m8 = this._context.createGain();
	  this._outY = this._context.createGain();
	  this._outZ = this._context.createGain();
	  this._outX = this._context.createGain();
	  this._merger = this._context.createChannelMerger(4);

	    // ACN channel ordering: [1, 2, 3] => [-Y, Z, -X]
	  this._splitter.connect(this._inY, 1); // Y (from channel 1)
	  this._splitter.connect(this._inZ, 2); // Z (from channel 2)
	  this._splitter.connect(this._inX, 3); // X (from channel 3)
	  this._inY.gain.value = -1;
	  this._inX.gain.value = -1;

	  // Apply the rotation in the world space.
	  // |Y|   | m0  m3  m6 |   | Y * m0 + Z * m3 + X * m6 |   | Yr |
	  // |Z| * | m1  m4  m7 | = | Y * m1 + Z * m4 + X * m7 | = | Zr |
	  // |X|   | m2  m5  m8 |   | Y * m2 + Z * m5 + X * m8 |   | Xr |
	  this._inY.connect(this._m0);
	  this._inY.connect(this._m1);
	  this._inY.connect(this._m2);
	  this._inZ.connect(this._m3);
	  this._inZ.connect(this._m4);
	  this._inZ.connect(this._m5);
	  this._inX.connect(this._m6);
	  this._inX.connect(this._m7);
	  this._inX.connect(this._m8);
	  this._m0.connect(this._outY);
	  this._m1.connect(this._outZ);
	  this._m2.connect(this._outX);
	  this._m3.connect(this._outY);
	  this._m4.connect(this._outZ);
	  this._m5.connect(this._outX);
	  this._m6.connect(this._outY);
	  this._m7.connect(this._outZ);
	  this._m8.connect(this._outX);

	  // Transform 3: world space to audio space.
	  this._splitter.connect(this._merger, 0, 0); // W -> W (to channel 0)
	  this._outY.connect(this._merger, 0, 1); // Y (to channel 1)
	  this._outZ.connect(this._merger, 0, 2); // Z (to channel 2)
	  this._outX.connect(this._merger, 0, 3); // X (to channel 3)
	  this._outY.gain.value = -1;
	  this._outX.gain.value = -1;

	  this.setRotationMatrix(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));

	  // input/output proxy.
	  this.input = this._splitter;
	  this.output = this._merger;
	}


	/**
	 * Set 3x3 matrix for soundfield rotation. (gl-matrix.js style)
	 * @param {Array} rotationMatrix    A 3x3 matrix of soundfield rotation. The
	 *                                  matrix is in the row-major representation.
	 */
	FOARotator.prototype.setRotationMatrix = function (rotationMatrix) {
	  this._m0.gain.value = rotationMatrix[0];
	  this._m1.gain.value = rotationMatrix[1];
	  this._m2.gain.value = rotationMatrix[2];
	  this._m3.gain.value = rotationMatrix[3];
	  this._m4.gain.value = rotationMatrix[4];
	  this._m5.gain.value = rotationMatrix[5];
	  this._m6.gain.value = rotationMatrix[6];
	  this._m7.gain.value = rotationMatrix[7];
	  this._m8.gain.value = rotationMatrix[8];
	};

	/**
	 * Set 4x4 matrix for soundfield rotation. (Three.js style)
	 * @param {Array} rotationMatrix4   A 4x4 matrix of soundfield rotation.
	 */
	FOARotator.prototype.setRotationMatrix4 = function (rotationMatrix4) {
	  this._m0.gain.value = rotationMatrix4[0];
	  this._m1.gain.value = rotationMatrix4[1];
	  this._m2.gain.value = rotationMatrix4[2];
	  this._m3.gain.value = rotationMatrix4[4];
	  this._m4.gain.value = rotationMatrix4[5];
	  this._m5.gain.value = rotationMatrix4[6];
	  this._m6.gain.value = rotationMatrix4[8];
	  this._m7.gain.value = rotationMatrix4[9];
	  this._m8.gain.value = rotationMatrix4[10];
	};

	/**
	 * Returns the current rotation matrix.
	 * @return {Array}                  A 3x3 matrix of soundfield rotation. The
	 *                                  matrix is in the row-major representation.
	 */
	FOARotator.prototype.getRotationMatrix = function () {
	  return [
	    this._m0.gain.value, this._m1.gain.value, this._m2.gain.value,
	    this._m3.gain.value, this._m4.gain.value, this._m5.gain.value,
	    this._m6.gain.value, this._m7.gain.value, this._m8.gain.value
	  ];
	};


	module.exports = FOARotator;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

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
	 * @fileOverview Phase matched filter for first-order-ambisonics decoding.
	 */

	'use strict';

	var Utils = __webpack_require__(3);

	// Static parameters.
	var CROSSOVER_FREQUENCY = 690;
	var GAIN_COEFFICIENTS = [1.4142, 0.8166, 0.8166, 0.8166];

	// Helper: generate the coefficients for dual band filter.
	function generateDualBandCoefficients(crossoverFrequency, sampleRate) {
	  var k = Math.tan(Math.PI * crossoverFrequency / sampleRate),
	      k2 = k * k,
	      denominator = k2 + 2 * k + 1;

	  return {
	    lowpassA: [1, 2 * (k2 - 1) / denominator, (k2 - 2 * k + 1) / denominator],
	    lowpassB: [k2 / denominator, 2 * k2 / denominator, k2 / denominator],
	    hipassA: [1, 2 * (k2 - 1) / denominator, (k2 - 2 * k + 1) / denominator],
	    hipassB: [1 / denominator, -2 * 1 / denominator, 1 / denominator]
	  };
	}

	/**
	 * @class FOAPhaseMatchedFilter
	 * @description A set of filters (LP/HP) with a crossover frequency to
	 *              compensate the gain of high frequency contents without a phase
	 *              difference.
	 * @param {AudioContext} context        Associated AudioContext.
	 */
	function FOAPhaseMatchedFilter (context) {
	  this._context = context;

	  this._input = this._context.createGain();

	  if (!this._context.createIIRFilter) {
	    Utils.log('IIR filter is missing. Using Biquad filter instead.');
	    this._lpf = this._context.createBiquadFilter();
	    this._hpf = this._context.createBiquadFilter();
	    this._lpf.frequency.value = CROSSOVER_FREQUENCY;
	    this._hpf.frequency.value = CROSSOVER_FREQUENCY;
	    this._hpf.type = 'highpass';
	  } else {
	    var coef = generateDualBandCoefficients(
	        CROSSOVER_FREQUENCY, this._context.sampleRate);
	    this._lpf = this._context.createIIRFilter(coef.lowpassB, coef.lowpassA);
	    this._hpf = this._context.createIIRFilter(coef.hipassB, coef.hipassA);
	  }

	  this._splitterLow = this._context.createChannelSplitter(4);
	  this._splitterHigh = this._context.createChannelSplitter(4);
	  this._gainHighW = this._context.createGain();
	  this._gainHighY = this._context.createGain();
	  this._gainHighZ = this._context.createGain();
	  this._gainHighX = this._context.createGain();
	  this._merger = this._context.createChannelMerger(4);

	  this._input.connect(this._hpf);
	  this._hpf.connect(this._splitterHigh);
	  this._splitterHigh.connect(this._gainHighW, 0);
	  this._splitterHigh.connect(this._gainHighY, 1);
	  this._splitterHigh.connect(this._gainHighZ, 2);
	  this._splitterHigh.connect(this._gainHighX, 3);
	  this._gainHighW.connect(this._merger, 0, 0);
	  this._gainHighY.connect(this._merger, 0, 1);
	  this._gainHighZ.connect(this._merger, 0, 2);
	  this._gainHighX.connect(this._merger, 0, 3);

	  this._input.connect(this._lpf);
	  this._lpf.connect(this._splitterLow);
	  this._splitterLow.connect(this._merger, 0, 0);
	  this._splitterLow.connect(this._merger, 1, 1);
	  this._splitterLow.connect(this._merger, 2, 2);
	  this._splitterLow.connect(this._merger, 3, 3);

	  // Apply gain correction to hi-passed pressure and velocity components:
	  // Inverting sign is necessary as the low-passed and high-passed portion are
	  // out-of-phase after the filtering.
	  var now = this._context.currentTime;
	  this._gainHighW.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[0], now);
	  this._gainHighY.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[1], now);
	  this._gainHighZ.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[2], now);
	  this._gainHighX.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[3], now);

	  // Input/output Proxy.
	  this.input = this._input;
	  this.output = this._merger;
	}

	module.exports = FOAPhaseMatchedFilter;


/***/ },
/* 8 */
/***/ function(module, exports) {

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
	 * @fileOverview Virtual speaker abstraction for first-order-ambisonics
	 *               decoding.
	 */

	'use strict';

	/**
	 * @class FOAVirtualSpeaker
	 * @description A virtual speaker with ambisonic decoding gain coefficients
	 *              and HRTF convolution for first-order-ambisonics stream.
	 *              Note that the subgraph directly connects to context's
	 *              destination.
	 * @param {AudioContext} context        Associated AudioContext.
	 * @param {Object} options              Options for speaker.
	 * @param {Array} options.coefficients  Decoding coefficients for (W,Y,Z,X).
	 * @param {AudioBuffer} options.IR      Stereo IR buffer for HRTF convolution.
	 * @param {Number} options.gain         Post-gain for the speaker.
	 */
	function FOAVirtualSpeaker (context, options) {
	  if (options.IR.numberOfChannels !== 2)
	    throw 'IR does not have 2 channels. cannot proceed.';

	  this._active = false;
	  
	  this._context = context;

	  this._input = this._context.createChannelSplitter(4);
	  this._cW = this._context.createGain();
	  this._cY = this._context.createGain();
	  this._cZ = this._context.createGain();
	  this._cX = this._context.createGain();
	  this._convolver = this._context.createConvolver();
	  this._gain = this._context.createGain();

	  this._input.connect(this._cW, 0);
	  this._input.connect(this._cY, 1);
	  this._input.connect(this._cZ, 2);
	  this._input.connect(this._cX, 3);
	  this._cW.connect(this._convolver);
	  this._cY.connect(this._convolver);
	  this._cZ.connect(this._convolver);
	  this._cX.connect(this._convolver);
	  this._convolver.connect(this._gain);
	  this._gain.connect(this._context.destination);

	  this.enable();

	  this._convolver.normalize = false;
	  this._convolver.buffer = options.IR;
	  this._gain.gain.value = options.gain;

	  // Set gain coefficients for FOA ambisonic streams.
	  this._cW.gain.value = options.coefficients[0];
	  this._cY.gain.value = options.coefficients[1];
	  this._cZ.gain.value = options.coefficients[2];
	  this._cX.gain.value = options.coefficients[3];

	  // Input proxy. Output directly connects to the destination.
	  this.input = this._input;
	}

	FOAVirtualSpeaker.prototype.enable = function () {
	  this._gain.connect(this._context.destination);
	  this._active = true;
	};

	FOAVirtualSpeaker.prototype.disable = function () {
	  this._gain.disconnect();
	  this._active = false;
	};

	module.exports = FOAVirtualSpeaker;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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
	 * @fileOverview Omnitone FOA decoder.
	 */

	'use strict';

	var AudioBufferManager = __webpack_require__(2);
	var FOARouter = __webpack_require__(5);
	var FOARotator = __webpack_require__(6);
	var FOAPhaseMatchedFilter = __webpack_require__(7);
	var FOAVirtualSpeaker = __webpack_require__(8);
	var FOASpeakerData = __webpack_require__(10);
	var Utils = __webpack_require__(3);
	var SystemVersion = __webpack_require__(11);

	// By default, Omnitone fetches IR from the spatial media repository.
	var HRTFSET_URL = 'https://raw.githubusercontent.com/GoogleChrome/omnitone/master/build/resources/';

	// Post gain compensation value.
	var POST_GAIN_DB = 0;


	/**
	 * @class Omnitone FOA decoder class.
	 * @param {AudioContext} context      Associated AudioContext.
	 * @param {VideoElement} videoElement Target video (or audio) element for
	 *                                    streaming.
	 * @param {Object} options
	 * @param {String} options.HRTFSetUrl Base URL for the cube HRTF sets.
	 * @param {Number} options.postGainDB Post-decoding gain compensation in dB.
	 * @param {Array} options.channelMap  Custom channel map.
	 */
	function FOADecoder (context, videoElement, options) {
	  this._isDecoderReady = false;
	  this._context = context;
	  this._videoElement = videoElement;
	  this._decodingMode = 'ambisonic';

	  this._postGainDB = POST_GAIN_DB;
	  this._HRTFSetUrl = HRTFSET_URL;
	  this._channelMap = FOARouter.CHANNEL_MAP.DEFAULT; // ACN

	  if (options) {
	    if (options.postGainDB)
	      this._postGainDB = options.postGainDB;

	    if (options.HRTFSetUrl)
	      this._HRTFSetUrl = options.HRTFSetUrl;

	    if (options.channelMap)
	      this._channelMap = options.channelMap;
	  }

	  // Rearrange speaker data based on |options.HRTFSetUrl|.
	  this._speakerData = [];
	  for (var i = 0; i < FOASpeakerData.length; ++i) {
	    this._speakerData.push({
	      name: FOASpeakerData[i].name,
	      url: this._HRTFSetUrl + '/' + FOASpeakerData[i].url,
	      coef: FOASpeakerData[i].coef
	    });
	  }

	  this._tempMatrix4 = new Float32Array(16);
	}

	/**
	 * Initialize and load the resources for the decode.
	 * @return {Promise}
	 */
	FOADecoder.prototype.initialize = function () {
	  Utils.log('Version: ' + SystemVersion);
	  Utils.log('Initializing... (mode: ' + this._decodingMode + ')');

	  // Rerouting channels if necessary.
	  var channelMapString = this._channelMap.toString();
	  var defaultChannelMapString = FOARouter.CHANNEL_MAP.DEFAULT.toString();
	  if (channelMapString !== defaultChannelMapString) {
	    Utils.log('Remapping channels ([' + defaultChannelMapString + '] -> ['
	      + channelMapString + '])');
	  }

	  this._audioElementSource = this._context.createMediaElementSource(
	    this._videoElement);
	  this._foaRouter = new FOARouter(this._context, this._channelMap);
	  this._foaRotator = new FOARotator(this._context);
	  this._foaPhaseMatchedFilter = new FOAPhaseMatchedFilter(this._context);

	  this._audioElementSource.connect(this._foaRouter.input);
	  this._foaRouter.output.connect(this._foaRotator.input);
	  this._foaRotator.output.connect(this._foaPhaseMatchedFilter.input);

	  this._foaVirtualSpeakers = [];

	  // Bypass signal path.
	  this._bypass = this._context.createGain();
	  this._audioElementSource.connect(this._bypass);

	  // Get the linear amplitude from the post gain option, which is in decibel.
	  var postGainLinear = Math.pow(10, this._postGainDB/20);
	  Utils.log('Gain compensation: ' + postGainLinear + ' (' + this._postGainDB
	    + 'dB)');

	  // This returns a promise so developers can use the decoder when it is ready.
	  var me = this;
	  return new Promise(function (resolve, reject) {
	    new AudioBufferManager(me._context, me._speakerData,
	      function (buffers) {
	        for (var i = 0; i < me._speakerData.length; ++i) {
	          me._foaVirtualSpeakers[i] = new FOAVirtualSpeaker(me._context, {
	            coefficients: me._speakerData[i].coef,
	            IR: buffers.get(me._speakerData[i].name),
	            gain: postGainLinear
	          });

	          me._foaPhaseMatchedFilter.output.connect(
	            me._foaVirtualSpeakers[i].input);
	        }

	        // Set the decoding mode.
	        me.setMode(me._decodingMode);
	        me._isDecoderReady = true;
	        Utils.log('HRTF IRs are loaded successfully. The decoder is ready.');

	        resolve();
	      }, reject);
	  });
	};

	/**
	 * Set the rotation matrix for the sound field rotation.
	 * @param {Array} rotationMatrix      3x3 rotation matrix (row-major
	 *                                    representation)
	 */
	FOADecoder.prototype.setRotationMatrix = function (rotationMatrix) {
	  this._foaRotator.setRotationMatrix(rotationMatrix);
	};


	/**
	 * Update the rotation matrix from a Three.js camera object.
	 * @param  {Object} cameraMatrix      The Matrix4 obejct of Three.js the camera.
	 */
	FOADecoder.prototype.setRotationMatrixFromCamera = function (cameraMatrix) {
	  // Extract the inner array elements and inverse. (The actual view rotation is
	  // the opposite of the camera movement.)
	  Utils.invertMatrix4(this._tempMatrix4, cameraMatrix.elements);
	  this._foaRotator.setRotationMatrix4(this._tempMatrix4);
	};

	/**
	 * Set the decoding mode.
	 * @param {String} mode               Decoding mode. When the mode is 'bypass'
	 *                                    the decoder is disabled and bypass the
	 *                                    input stream to the output. Setting the
	 *                                    mode to 'ambisonic' activates the decoder.
	 *                                    When the mode is 'off', all the
	 *                                    processing is completely turned off saving
	 *                                    the CPU power.
	 */
	FOADecoder.prototype.setMode = function (mode) {
	  if (mode === this._decodingMode)
	    return;

	  switch (mode) {

	    case 'bypass':
	      this._decodingMode = 'bypass';
	      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
	        this._foaVirtualSpeakers[i].disable();
	      this._bypass.connect(this._context.destination);
	      break;

	    case 'ambisonic':
	      this._decodingMode = 'ambisonic';
	      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
	        this._foaVirtualSpeakers[i].enable();
	      this._bypass.disconnect();
	      break;

	    case 'off':
	      this._decodingMode = 'off';
	      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
	        this._foaVirtualSpeakers[i].disable();
	      this._bypass.disconnect();
	      break;

	    default:
	      break;
	  }

	  Utils.log('Decoding mode changed. (' + mode + ')');
	};

	module.exports = FOADecoder;


/***/ },
/* 10 */
/***/ function(module, exports) {

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
	 * See also:
	 * https://github.com/google/spatial-media/tree/master/spatial-audio
	 */

	/**
	 * The data for FOAVirtualSpeaker. Each entry contains the URL for IR files and
	 * the gain coefficients for the associated IR files. Note that the order of
	 * coefficients follows the ACN channel ordering. (W,Y,Z,X)
	 * @type {Array}
	 */
	var FOASpeakerData = [{
	  name: 'E35_A135',
	  url: 'E35_A135.wav',
	  gainFactor: 1,
	  coef: [.1250, 0.216495, 0.21653, -0.216495]
	}, {
	  name: 'E35_A-135',
	  url: 'E35_A-135.wav',
	  gainFactor: 1,
	  coef: [.1250, -0.216495, 0.21653, -0.216495]
	}, {
	  name: 'E-35_A135',
	  url: 'E-35_A135.wav',
	  gainFactor: 1,
	  coef: [.1250, 0.216495, -0.21653, -0.216495]
	}, {
	  name: 'E-35_A-135',
	  url: 'E-35_A-135.wav',
	  gainFactor: 1,
	  coef: [.1250, -0.216495, -0.21653, -0.216495]
	}, {
	  name: 'E35_A45',
	  url: 'E35_A45.wav',
	  gainFactor: 1,
	  coef: [.1250, 0.216495, 0.21653, 0.216495]
	}, {
	  name: 'E35_A-45',
	  url: 'E35_A-45.wav',
	  gainFactor: 1,
	  coef: [.1250, -0.216495, 0.21653, 0.216495]
	}, {
	  name: 'E-35_A45',
	  url: 'E-35_A45.wav',
	  gainFactor: 1,
	  coef: [.1250, 0.216495, -0.21653, 0.216495]
	}, {
	  name: 'E-35_A-45',
	  url: 'E-35_A-45.wav',
	  gainFactor: 1,
	  coef: [.1250, -0.216495, -0.21653, 0.216495]
	}];

	module.exports = FOASpeakerData;


/***/ },
/* 11 */
/***/ function(module, exports) {

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
	 * @fileOverview Omnitone version.
	 */

	'use strict';

	/**
	 * Omnitone library version
	 * @type {String}
	 */
	module.exports = '0.2.2';


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

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

	'use strict';

	/**
	 * @fileOverview Omnitone FOA decoder.
	 */
	var AudioBufferManager = __webpack_require__(2);
	var FOARouter = __webpack_require__(5);
	var FOARotator = __webpack_require__(6);
	var FOAConvolver = __webpack_require__(4);
	var Utils = __webpack_require__(3);
	var SystemVersion = __webpack_require__(11);

	// HRIR for optimized FOA rendering.
	// TODO(hongchan): change this with the absolute URL.
	var SH_MAXRE_HRIR_URL = 'resources/sh_hrir_o_1.wav';


	/**
	 * @class Omnitone FOA renderer class. Uses the optimized convolution technique.
	 * @param {AudioContext} context          Associated AudioContext.
	 * @param {Object} options
	 * @param {String} options.HRIRUrl        Optional HRIR URL.
	 * @param {String} options.renderingMode  Rendering mode.
	 * @param {Array} options.channelMap      Custom channel map.
	 */
	function FOARenderer (context, options) {
	  this._context = context;

	  // Priming internal setting with |options|.
	  this._HRIRUrl = SH_MAXRE_HRIR_URL;
	  this._channelMap = FOARouter.CHANNEL_MAP.DEFAULT;
	  this._renderingMode = 'ambisonic';
	  if (options) {
	    if (options.HRIRUrl)
	      this._HRIRUrl = options.HRIRUrl;
	    if (options.renderingMode)
	      this._renderingMode = options.renderingMode;
	    if (options.channelMap)
	      this._channelMap = options.channelMap;
	  }

	  this._isRendererReady = false;
	}


	/**
	 * Initialize and load the resources for the decode.
	 * @return {Promise}
	 */
	FOARenderer.prototype.initialize = function () {
	  Utils.log('Version: ' + SystemVersion);
	  Utils.log('Initializing... (mode: ' + this._renderingMode + ')');
	  Utils.log('Rendering via SH-MaxRE convolution.');

	  this._tempMatrix4 = new Float32Array(16);

	  return new Promise(this._initializeCallback.bind(this));
	};


	/**
	 * Internal callback handler for |initialize| method.
	 * @param {Function} resolve Promise resolution.
	 * @param {Function} reject Promise rejection.
	 */
	FOARenderer.prototype._initializeCallback = function (resolve, reject) {
	  var key = 'FOA_HRIR_AUDIOBUFFER';
	  new AudioBufferManager(
	      this._context,
	      [{ name: key, url: this._HRIRUrl }],
	      function (buffers) {
	        this.input = this._context.createGain();
	        this._bypass = this._context.createGain();
	        this._foaRouter = new FOARouter(this._context, this._channelMap);
	        this._foaRotator = new FOARotator(this._context);
	        this._foaConvolver = new FOAConvolver(this._context, {
	            IR: buffers.get(key)
	          });
	        this.output = this._context.createGain();

	        this.input.connect(this._foaRouter.input);
	        this.input.connect(this._bypass);
	        this._foaRouter.output.connect(this._foaRotator.input);
	        this._foaRotator.output.connect(this._foaConvolver.input);
	        this._foaConvolver.output.connect(this.output);

	        this.setChannelMap(this._channelMap);
	        this.setRenderingMode(this._renderingMode);

	        this._isRendererReady = true;
	        Utils.log('HRIRs are loaded successfully. The renderer is ready.');
	        resolve();
	      }.bind(this),
	      function (buffers) {
	        var errorMessage = 'Initialization failed: ' + key + ' is ' 
	            + buffers.get(0) + '.';
	        Utils.log(errorMessage);
	        reject(errorMessage);
	      });
	};

	/**
	 * Set the channel map.
	 * @param {Array} channelMap          A custom channel map for FOA stream.
	 */
	FOARenderer.prototype.setChannelMap = function (channelMap) {
	  if (!this._isRendererReady)
	    return;

	  if (channelMap.toString() !== this._channelMap.toString()) {
	    Utils.log('Remapping channels ([' + this._channelMap.toString() + '] -> ['
	      + channelMap.toString() + ']).');
	    this._channelMap = channelMap.slice();
	    this._foaRouter.setChannelMap(this._channelMap);
	  }
	};

	/**
	 * Set the rotation matrix for the sound field rotation.
	 * @param {Array} rotationMatrix      3x3 rotation matrix (row-major
	 *                                    representation)
	 */
	FOARenderer.prototype.setRotationMatrix = function (rotationMatrix) {
	  if (!this._isRendererReady)
	    return;

	  this._foaRotator.setRotationMatrix(rotationMatrix);
	};


	/**
	 * Update the rotation matrix from a Three.js camera object.
	 * @param  {Object} cameraMatrix      The Matrix4 obejct of Three.js the camera.
	 */
	FOARenderer.prototype.setRotationMatrixFromCamera = function (cameraMatrix) {
	  if (!this._isRendererReady)
	    return;

	  // Extract the inner array elements and inverse. (The actual view rotation is
	  // the opposite of the camera movement.)
	  Utils.invertMatrix4(this._tempMatrix4, cameraMatrix.elements);
	  this._foaRotator.setRotationMatrix4(this._tempMatrix4);
	};


	/**
	 * Set the decoding mode.
	 * @param {String} mode               Decoding mode. When the mode is 'bypass'
	 *                                    the decoder is disabled and bypass the
	 *                                    input stream to the output. Setting the
	 *                                    mode to 'ambisonic' activates the decoder.
	 *                                    When the mode is 'off', all the
	 *                                    processing is completely turned off saving
	 *                                    the CPU power.
	 */
	FOARenderer.prototype.setRenderingMode = function (mode) {
	  if (mode === this._renderingMode)
	    return;

	  switch (mode) {
	    // Bypass mode: The convolution path is disabled, disconnected (thus consume
	    // no CPU). Use bypass gain node to pass-through the input stream.
	    case 'bypass':
	      this._renderingMode = 'bypass';
	      this._foaConvolver.disable();
	      this._bypass.connect(this.output);
	      break;

	    // Ambisonic mode: Use the convolution and shut down the bypass path.
	    case 'ambisonic':
	      this._renderingMode = 'ambisonic';
	      this._foaConvolver.enable();
	      this._bypass.disconnect();
	      break;

	    // Off mode: Shut down all sound from the renderer.
	    case 'off':
	      this._renderingMode = 'off';
	      this._foaConvolver.disable();
	      this._bypass.disconnect();
	      break;

	    default:
	      // Unsupported mode. Ignore it.
	      Utils.log('Rendering mode "' + mode + '" is not supported.');
	      return;
	  }

	  Utils.log('Rendering mode changed. (' + mode + ')');
	};


	module.exports = FOARenderer;


/***/ }
/******/ ])
});
;