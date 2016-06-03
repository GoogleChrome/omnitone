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
	 * @fileOverview Omnitone library name space and common utilities.
	 */

	'use strict';

	/**
	 * @class Omnitone main namespace.
	 */
	var Omnitone = {};

	// Internal dependencies.
	var FOARotator = __webpack_require__(2);
	var FOAPhaseMatchedFilter = __webpack_require__(3);
	var FOAVirtualSpeaker = __webpack_require__(4);
	var FOADecoder = __webpack_require__(5);

	/**
	 * Omnitone library version
	 * @type {String}
	 */
	Omnitone.VERSION = '0.1.0';

	/**
	 * Create an instance of FOA Rotator. For parameters, refer the definition of
	 * Rotator class.
	 * @return {Object}
	 */
	Omnitone.createFOARotator = function (context) {
	  return new FOARotator(context);
	};

	/**
	 * Create an instance of FOARotator. For parameters, refer the definition of
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
	 * @param {String} baseResourceUrl    Base URL for resources. (HRTF IR files)
	 * @return {FOADecoder}
	 */
	Omnitone.createFOADecoder = function (context, videoElement, baseResourceUrl) {
	  return new FOADecoder(context, videoElement, baseResourceUrl);
	};

	module.exports = Omnitone;


/***/ },
/* 2 */
/***/ function(module, exports) {

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
	 * @fileOverview Sound field rotator for first-order-ambisonics decoding.
	 */

	'use strict';

	/**
	 * @class First-order-ambisonic decoder based on gain node network.
	 * @param {AudioContext} context    Associated AudioContext.
	 * @param {AudioNode} source        FOA ambisonic stream source.
	 *                                  (i.e. MediaElementSourceNode with
	 *                                  ambisonic audio stream.)
	 */
	function FOARotator (context) {
	  this._context = context;

	  this._splitter = this._context.createChannelSplitter(4);
	  this._inX = this._context.createGain();
	  this._inY = this._context.createGain();
	  this._inZ = this._context.createGain();
	  this._m0 = this._context.createGain();
	  this._m1 = this._context.createGain();
	  this._m2 = this._context.createGain();
	  this._m3 = this._context.createGain();
	  this._m4 = this._context.createGain();
	  this._m5 = this._context.createGain();
	  this._m6 = this._context.createGain();
	  this._m7 = this._context.createGain();
	  this._m8 = this._context.createGain();
	  this._outX = this._context.createGain();
	  this._outY = this._context.createGain();
	  this._outZ = this._context.createGain();
	  this._merger = this._context.createChannelMerger(4);

	  // Transform 1: audio space to world space.
	  this._splitter.connect(this._inZ, 1); // X (1) -> -Z
	  this._splitter.connect(this._inX, 2); // Y (2) -> -X
	  this._splitter.connect(this._inY, 3); // Z (3) ->  Y
	  this._inX.gain.value = -1;
	  this._inZ.gain.value = -1;

	  // Transform 2: 3x3 rotation matrix.
	  // |X|   | m0  m3  m6 |   | X * m0 + Y * m3 + Z * m6 |   | X |
	  // |Y| * | m1  m4  m7 | = | X * m1 + Y * m4 + Z * m7 | = | Y |
	  // |Z|   | m2  m5  m8 |   | X * m2 + Y * m5 + Z * m8 |   | Z |
	  this._inX.connect(this._m0);
	  this._inX.connect(this._m1);
	  this._inX.connect(this._m2);
	  this._inY.connect(this._m3);
	  this._inY.connect(this._m4);
	  this._inY.connect(this._m5);
	  this._inZ.connect(this._m6);
	  this._inZ.connect(this._m7);
	  this._inZ.connect(this._m8);
	  this._m0.connect(this._outX);
	  this._m1.connect(this._outY);
	  this._m2.connect(this._outZ);
	  this._m3.connect(this._outX);
	  this._m4.connect(this._outY);
	  this._m5.connect(this._outZ);
	  this._m6.connect(this._outX);
	  this._m7.connect(this._outY);
	  this._m8.connect(this._outZ);

	  // Transform 3: world space to audio space.
	  this._splitter.connect(this._merger, 0, 0); // W -> W (0)
	  this._outX.connect(this._merger, 0, 2); // outX -> -Y (2)
	  this._outY.connect(this._merger, 0, 3); // outY ->  Z (3)
	  this._outZ.connect(this._merger, 0, 1); // outZ -> -X (1)
	  this._outX.gain.value = -1;
	  this._outZ.gain.value = -1;

	  this.setRotationMatrix(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));

	  // input/output proxy.
	  this.input = this._splitter;
	  this.output = this._merger;
	}

	/**
	 * Set 3x3 matrix for soundfield rotation.
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

	module.exports = FOARotator;


/***/ },
/* 3 */
/***/ function(module, exports) {

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
	 * @fileOverview Phase matched filter for first-order-ambisonics decoding.
	 */

	'use strict';

	// Static parameters.
	var FREQUENCY = 700;
	var COEFFICIENTS = [1.4142, 0.8166, 0.8166, 0.8166];

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

	  // TODO: calculate the freq/reso based on the context sample rate.
	  if (!this._context.createIIRFilter) {
	    this._lpf = this._context.createBiquadFilter();
	    this._hpf = this._context.createBiquadFilter();
	    this._lpf.frequency.value = FREQUENCY;
	    this._hpf.frequency.value = FREQUENCY;
	    this._hpf.type = 'highpass';
	  } else {
	    this._lpf = this._context.createIIRFilter(
	      [0.00058914319, 0.0011782864, 0.00058914319],
	      [1, -1.9029109, 0.90526748]
	    );
	    this._hpf = this._context.createIIRFilter(
	      [0.95204461, -1.9040892, 0.95204461],
	      [1, -1.9029109, 0.90526748]
	    );  
	  }

	  this._splitterLow = this._context.createChannelSplitter(4);
	  this._splitterHigh = this._context.createChannelSplitter(4);
	  this._gainHighW = this._context.createGain();
	  this._gainHighX = this._context.createGain();
	  this._gainHighY = this._context.createGain();
	  this._gainHighZ = this._context.createGain();
	  this._merger = this._context.createChannelMerger(4);

	  this._input.connect(this._hpf);
	  this._hpf.connect(this._splitterHigh);
	  this._splitterHigh.connect(this._gainHighW, 0);
	  this._splitterHigh.connect(this._gainHighX, 1);
	  this._splitterHigh.connect(this._gainHighY, 2);
	  this._splitterHigh.connect(this._gainHighZ, 3);
	  this._gainHighW.connect(this._merger, 0, 0);
	  this._gainHighX.connect(this._merger, 0, 1);
	  this._gainHighY.connect(this._merger, 0, 2);
	  this._gainHighZ.connect(this._merger, 0, 3);

	  this._input.connect(this._lpf);
	  this._lpf.connect(this._splitterLow);
	  this._splitterLow.connect(this._merger, 0, 0);
	  this._splitterLow.connect(this._merger, 0, 1);
	  this._splitterLow.connect(this._merger, 0, 2);
	  this._splitterLow.connect(this._merger, 0, 3);

	  // Apply gain correction to hi-passed pressure and velocity components:
	  // Inverting sign is necessary as the low-passed and high-passed portion are
	  // out-of-phase after the filtering.
	  this._gainHighW.gain.value = -1 * COEFFICIENTS[0];
	  this._gainHighX.gain.value = -1 * COEFFICIENTS[1];
	  this._gainHighY.gain.value = -1 * COEFFICIENTS[2];
	  this._gainHighZ.gain.value = -1 * COEFFICIENTS[3];

	  // Input/output Proxy.
	  this.input = this._input;
	  this.output = this._merger;
	}

	module.exports = FOAPhaseMatchedFilter;


/***/ },
/* 4 */
/***/ function(module, exports) {

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
	 * @param {Array} options.coefficients  Decoding coefficients for (W,X,Y,Z).
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
	  this._cX = this._context.createGain();
	  this._cY = this._context.createGain();
	  this._cZ = this._context.createGain();
	  this._convolver = this._context.createConvolver();
	  this._gain = this._context.createGain();

	  this._input.connect(this._cW, 0);
	  this._input.connect(this._cX, 1);
	  this._input.connect(this._cY, 2);
	  this._input.connect(this._cZ, 3);
	  this._cW.connect(this._convolver);
	  this._cX.connect(this._convolver);
	  this._cY.connect(this._convolver);
	  this._cZ.connect(this._convolver);
	  this._convolver.connect(this._gain);
	  this._gain.connect(this._context.destination);

	  this.enable();

	  this._convolver.buffer = options.IR;
	  this._gain.gain.value = options.gain;

	  // Set gain coefficients for FOA ambisonic streams.
	  this._cW.gain.value = options.coefficients[0];
	  this._cX.gain.value = options.coefficients[1];
	  this._cY.gain.value = options.coefficients[2];
	  this._cZ.gain.value = options.coefficients[3];

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
/* 5 */
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

	/**
	 * @fileOverview Omnitone FOA decoder.
	 */

	'use strict';

	// Post gain compensation value.
	var POST_GAIN = 26.0;

	// Dependencies.
	var AudioBufferManager = __webpack_require__(6);
	var FOARotator = __webpack_require__(2);
	var FOAPhaseMatchedFilter = __webpack_require__(3);
	var FOAVirtualSpeaker = __webpack_require__(4);
	var FOASpeakerData = __webpack_require__(7);

	/**
	 * @class Omnitone FOA decoder class.
	 * @param {AudioContext} context      Associated AudioContext.
	 * @param {VideoElement} videoElement Target video (or audio) element for
	 *                                    streaming.
	 * @param {Object} options
	 * @param {String} options.baseResourceUrl  Base URL for resources.
	 *                                          (HRTF IR files)
	 * @param {Number} options.postGain         Post-decoding gain compensation.
	 *                                          (By default, this is 26.0.)
	 */
	function FOADecoder (context, videoElement, options) {
	  this._isDecoderReady = false;
	  this._context = context;
	  this._videoElement = videoElement;
	  this._decodingMode = 'ambisonic';

	  var _baseResourceUrl = options.baseResourceUrl || '';

	  // Rearrange speaker data based on |options.baseResourceUrl|.
	  this._speakerData = [];
	  for (var i = 0; i < FOASpeakerData.length; ++i) {
	    this._speakerData.push({
	      name: FOASpeakerData[i].name,
	      url: _baseResourceUrl + '/' + FOASpeakerData[i].url,
	      coef: FOASpeakerData[i].coef
	    });
	  }
	}

	/**
	 * Initialize and load the resources for the decode.
	 * @return {Promise}
	 */
	FOADecoder.prototype.initialize = function () {
	  this._audioElementSource = this._context.createMediaElementSource(
	    this._videoElement);
	  this._foaRotator = new FOARotator(this._context);
	  this._foaPhaseMatchedFilter = new FOAPhaseMatchedFilter(this._context);

	  this._audioElementSource.connect(this._foaRotator.input);
	  this._foaRotator.output.connect(this._foaPhaseMatchedFilter.input);

	  this._foaVirtualSpeakers = [];

	  // This returns a promise so developers can use the decoder when it is ready.
	  var me = this;
	  return new Promise(function (resolve, reject) {
	    new AudioBufferManager(me._context, me._speakerData,
	      function (buffers) {
	        for (var i = 0; i < me._speakerData.length; ++i) {
	          me._foaVirtualSpeakers[i] = new FOAVirtualSpeaker(me._context, {
	            coefficients: me._speakerData[i].coef,
	            IR: buffers.get(me._speakerData[i].name),
	            gain: POST_GAIN
	          });

	          me._foaPhaseMatchedFilter.output.connect(
	            me._foaVirtualSpeakers[i].input);
	        }
	        
	        me._isDecoderReady = true;
	        resolve();
	      }, reject);
	  });

	  // Bypass signal path.
	  this._bypass = this._context.createGain();
	  this._audioElementSource.connect(this._bypass);
	  
	  this.setMode(this._decodingMode);
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
	 * Set the decoding mode.
	 * @param {String} mode               Decoding mode. When the mode is 'plain'
	 *                                    the decoder produces a plain audio stream
	 *                                    (non-spatialized). Setting the mode to 
	 *                                    'ambisonic' activates the decoder.
	 */
	FOADecoder.prototype.setMode = function (mode) {
	  if (mode === this._decodingMode)
	    return;

	  switch (mode) {

	    case 'plain':
	      this._decodingMode = 'plain';
	      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
	        me._foaVirtualSpeakers[i].disable();
	      this._bypass.connect(this._context.destination);
	      break;

	    case 'ambisonic':
	      this._decodingMode = 'ambisonic';
	      for (var i = 0; i < this._foaVirtualSpeakers.length; ++i)
	        me._foaVirtualSpeakers[i].enable();
	      this._bypass.gain.disconnect();
	      break;
	      
	    default:
	      return;
	      break;
	  }
	};

	module.exports = FOADecoder;


/***/ },
/* 6 */
/***/ function(module, exports) {

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

	/**
	 * Print buffer loading message.
	 * @param {any}                       Messages to be printed out.
	 */
	var _print = function () {
	  window.console.log.apply(window.console, [
	    '%c[Omnitone:AudioBufferManager]%c ' 
	      + Array.prototype.slice.call(arguments).join(' '), 
	    'background: #BBDEFB; color: #FF5722; font-weight: 700',
	    'font-weight: 400'
	  ]);
	};

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
	      _print('Duplicated filename when loading: ' + fileInfo.name);
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
	          _print('File loaded: ' + fileInfo.url);
	          that._done(fileInfo.name, buffer);
	        },
	        function (message) {
	          _print('Decoding failure: '
	            + fileInfo.url + ' (' + message + ')');
	          that._done(fileInfo.name, null);
	        });
	    } else {
	      _print('XHR Error: ' + fileInfo.url + ' (' + xhr.statusText 
	        + ')');
	      that._done(fileInfo.name, null);
	    }
	  };

	  xhr.onerror = function (event) {
	    _print('XHR Network failure: ' + fileInfo.url);
	    me._done(fileInfo.name, null);
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

	  if (typeof this._progress === 'function')
	    this._progress(filename, numberOfFinishedTasks, numberOfTasks);

	  if (numberOfFinishedTasks === numberOfTasks)
	    this._resolve(this._buffers);

	  if (numberOfFinishedTasks + numberOfFailedTask === numberOfTasks)
	    this._reject(this._buffers);
	};

	module.exports = AudioBufferManager;


/***/ },
/* 7 */
/***/ function(module, exports) {

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
	NOTES
	=====
	sampling rate: 48kHz
	bit depth: 16
	length: 512 samples
	normalization: -3.76 dBFS peak
	tapering: half-hann (128 samples)
	subject: gorzel@
	microphones: Audio Technica BMC-10 (open ear canal)
	loudspeakers: Equator D5
	venue: Interactive Media Lab, TFTV, University of York, UK
	remarks: Low frequencies re-modelled below 500Hz.

	FOA Decoding coefficients 
	=========================
	    EL      AZ    W                 X                  Y                  Z
	1   35.26   45    0.125000000000000 0.216494623077544  0.216529812402237  0.216494623077545
	2   35.26   -45   0.125000000000000 -0.216494623077544 0.216529812402236  0.216494623077545
	3   35.26   -135  0.125000000000000 -0.216494623077544 0.216529812402237  -0.216494623077545
	4   35.26   135   0.125000000000000 0.216494623077544  0.216529812402237  -0.216494623077545
	5   -35.26  45    0.125000000000000 0.216494623077544  -0.216529812402237 0.216494623077545
	6   -35.26  -45   0.125000000000000 -0.216494623077544 -0.216529812402237 0.216494623077545
	7   -35.26  -135  0.125000000000000 -0.216494623077544 -0.216529812402237 -0.216494623077545
	8   -35.26  135   0.125000000000000 0.216494623077544  -0.216529812402237 -0.216494623077545
	*/

	// TODO: why these are different from the coefs above?
	var FOASpeakerData = [{
	  name: 'E35.26_A45',  // <0.5774,0.5774,-0.5774>
	  url: 'E35.26_A45_D1.4.wav',
	  coef: [.1250, 0.216494623077544, 0.216529812402237, -0.216494623077545]
	}, {
	  name: 'E35.26_A-45', // <0.5774,-0.5774,-0.5774>
	  url: 'E35.26_A-45_D1.4.wav',
	  coef: [.1250, 0.216494623077544, -0.216529812402236, -0.216494623077544],
	}, {
	  name: 'E35.26_A-135', // <-0.5774,-0.5774,-0.5774>
	  url: 'E35.26_A-135_D1.4.wav',
	  coef: [.1250, -0.216494623077544, -0.216529812402236, -0.216494623077545],
	}, {
	  name: 'E35.26_A135', // <-0.5774,0.5774,-0.5774>
	  url: 'E35.26_A135_D1.4.wav',
	  coef: [.1250, -0.216494623077545, 0.216529812402237, -0.216494623077545],
	}, {
	  name: 'E-35.26_A45', // <0.5774,0.5774,0.5774>
	  url: 'E-35.26_A45_D1.4.wav',
	  coef: [.1250, 0.216494623077544, 0.216529812402237, 0.216494623077545],
	}, {
	  name: 'E-35.26_A-45', // <0.5774,-0.5774,0.5774>
	  url: 'E-35.26_A-45_D1.4.wav',
	  coef: [.1250, 0.216494623077544, -0.216529812402236, 0.216494623077545],
	}, {
	  name: 'E-35.26_A-135', // <-0.5774,-0.5774,0.5774>
	  url: 'E-35.26_A-135_D1.4.wav',
	  coef: [.1250, -0.216494623077544, -0.216529812402237, 0.216494623077545],
	}, {
	  name: 'E-35.26_A135', // <-0.5774,0.5774,0.5774>
	  url: 'E-35.26_A135_D1.4.wav',
	  coef: [.1250, -0.216494623077545, 0.216529812402237, 0.216494623077545]
	}];

	module.exports = FOASpeakerData;


/***/ }
/******/ ])
});
;