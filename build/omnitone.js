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
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
 * @file Omnitone library common utilities.
 */


/**
 * Omnitone library logging function.
 * @param {any} Message to be printed out.
 */
exports.log = function() {
  window.console.log.apply(window.console, [
    '%c[Omnitone]%c ' + Array.prototype.slice.call(arguments).join(' ') +
        ' %c(@' + performance.now().toFixed(2) + 'ms)',
    'background: #BBDEFB; color: #FF5722; font-weight: 500', 'font-weight: 300',
    'color: #AAA',
  ]);
};


/**
 * Omnitone library error-throwing function.
 * @param {any} Message to be printed out.
 */
exports.throw = function() {
  window.console.error.apply(window.console, [
    '%c[Omnitone]%c ' + Array.prototype.slice.call(arguments).join(' ') +
        ' %c(@' + performance.now().toFixed(2) + 'ms)',
    'background: #C62828; color: #FFEBEE; font-weight: 800', 'font-weight: 400',
    'color: #AAA',
  ]);

  throw new Error(false);
};


// Static temp storage for matrix inversion.
let a00;
let a01;
let a02;
let a03;
let a10;
let a11;
let a12;
let a13;
let a20;
let a21;
let a22;
let a23;
let a30;
let a31;
let a32;
let a33;
let b00;
let b01;
let b02;
let b03;
let b04;
let b05;
let b06;
let b07;
let b08;
let b09;
let b10;
let b11;
let det;


/**
 * A 4x4 matrix inversion utility. This does not handle the case when the
 * arguments are not proper 4x4 matrices.
 * @param {Float32Array} out   The inverted result.
 * @param {Float32Array} a     The source matrix.
 * @return {Float32Array} out
 */
exports.invertMatrix4 = function(out, a) {
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  a30 = a[12];
  a31 = a[13];
  a32 = a[14];
  a33 = a[15];
  b00 = a00 * a11 - a01 * a10;
  b01 = a00 * a12 - a02 * a10;
  b02 = a00 * a13 - a03 * a10;
  b03 = a01 * a12 - a02 * a11;
  b04 = a01 * a13 - a03 * a11;
  b05 = a02 * a13 - a03 * a12;
  b06 = a20 * a31 - a21 * a30;
  b07 = a20 * a32 - a22 * a30;
  b08 = a20 * a33 - a23 * a30;
  b09 = a21 * a32 - a22 * a31;
  b10 = a21 * a33 - a23 * a31;
  b11 = a22 * a33 - a23 * a32;
  det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

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
};


/**
 * Check if the given object is an instance of BaseAudioContext.
 * @param {AudioContext} context - A context object to be checked.
 * @return {Boolean}
 */
exports.isAudioContext = function(context) {
  // TODO(hoch): Update this when BaseAudioContext is available for all
  // browsers.
  return context instanceof AudioContext ||
    context instanceof OfflineAudioContext;
};


/**
 * Check if the given object is a valid AudioBuffer.
 * @param {Object} audioBuffer An AudioBuffer object to be checked.
 * @return {Boolean}
 */
exports.isAudioBuffer = function(audioBuffer) {
  return audioBuffer instanceof AudioBuffer;
};


/**
 * Perform channel-wise merge on multiple AudioBuffers. The sample rate and
 * the length of buffers to be merged must be identical.
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {AudioBuffer[]} bufferList - An array of AudioBuffers to be merged
 * channel-wise.
 * @return {AudioBuffer} - A single merged AudioBuffer.
 */
exports.mergeBufferListByChannel = function(context, bufferList) {
  const bufferLength = bufferList[0].length;
  const bufferSampleRate = bufferList[0].sampleRate;
  let bufferNumberOfChannel = 0;

  for (let i = 0; i < bufferList.length; ++i) {
    if (bufferNumberOfChannel > 32) {
      exports.throw('Utils.mergeBuffer: Number of channels cannot exceed 32.' +
          '(got ' + bufferNumberOfChannel + ')');
    }
    if (bufferLength !== bufferList[i].length) {
      exports.throw('Utils.mergeBuffer: AudioBuffer lengths are ' +
          'inconsistent. (expected ' + bufferLength + ' but got ' +
          bufferList[i].length + ')');
    }
    if (bufferSampleRate !== bufferList[i].sampleRate) {
      exports.throw('Utils.mergeBuffer: AudioBuffer sample rates are ' +
          'inconsistent. (expected ' + bufferSampleRate + ' but got ' +
          bufferList[i].sampleRate + ')');
    }
    bufferNumberOfChannel += bufferList[i].numberOfChannels;
  }

  const buffer = context.createBuffer(bufferNumberOfChannel,
                                      bufferLength,
                                      bufferSampleRate);
  let destinationChannelIndex = 0;
  for (let i = 0; i < bufferList.length; ++i) {
    for (let j = 0; j < bufferList[i].numberOfChannels; ++j) {
      buffer.getChannelData(destinationChannelIndex++).set(
          bufferList[i].getChannelData(j));
    }
  }

  return buffer;
};


/**
 * Perform channel-wise split by the given channel count. For example,
 * 1 x AudioBuffer(8) -> splitBuffer(context, buffer, 2) -> 4 x AudioBuffer(2).
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {AudioBuffer} audioBuffer - An AudioBuffer to be splitted.
 * @param {Number} splitBy - Number of channels to be splitted.
 * @return {AudioBuffer[]} - An array of splitted AudioBuffers.
 */
exports.splitBufferbyChannel = function(context, audioBuffer, splitBy) {
  if (audioBuffer.numberOfChannels <= splitBy) {
    exports.throw('Utils.splitBuffer: Insufficient number of channels. (' +
        audioBuffer.numberOfChannels + ' splitted by ' + splitBy + ')');
  }

  let bufflerList = [];
  let sourceChannelIndex = 0;
  const numberOfSplittedBuffer =
      Math.ceil(audioBuffer.numberOfChannels / splitBy);
  for (let i = 0; i < numberOfSplittedBuffer; ++i) {
    let buffer = context.createBuffer(splitBy,
                                      audioBuffer.length,
                                      audioBuffer.sampleRate);
    for (let j = 0; j < splitBy; ++j) {
      if (sourceChannelIndex < audioBuffer.numberOfChannels) {
        buffer.getChannelData(j).set(
          audioBuffer.getChannelData(sourceChannelIndex++));
      }
    }
    bufflerList.push(buffer);
  }

  return bufferList;
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Streamlined AudioBuffer loader.
 */




const Utils = __webpack_require__(0);


/**
 * BufferList object mananges the async loading/decoding of multiple
 * AudioBuffers from multiple URLs.
 * @constructor
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {string[]} bufferData - An ordered list of URLs.
 * @param {Object} options - Options
 * @param {Boolean} options.verbose - Log verbosity. |true| prints the
 * individual message from each URL and AudioBuffer.
 */
function BufferList(context, bufferData, options) {
  this._context = Utils.isAudioContext(context) ?
      context :
      Utils.throw('BufferList: Invalid BaseAudioContext.');

  this._bufferList = [];
  this._bufferData = bufferData.slice(0);
  this._numberOfTasks = this._bufferData.length;

  this._options = {verbose: false};
  if (options) {
    this._options = Boolean(options.verbose);
  }

  this._resolveHandler = null;
  this._rejectHandler = new Function();
}


/**
 * Starts AudioBuffer loading tasks.
 * @return {Promise<AudioBuffer[]>} The promise resolves with an array of
 * AudioBuffer.
 */
BufferList.prototype.load = function() {
  return new Promise(this._promiseGenerator.bind(this));
};


/**
 * Promise argument generator. Internally starts multiple async loading tasks.
 * @private
 * @param {function} resolve Promise resolver.
 * @param {function} reject Promise reject.
 */
BufferList.prototype._promiseGenerator = function(resolve, reject) {
  if (typeof resolve !== 'function') {
    Utils.throw('BufferList: Invalid Promise resolver.');
  } else {
    this._resolveHandler = resolve;
  }

  if (typeof reject === 'function') {
    this._rejectHandler = reject;
  }

  for (let i = 0; i < this._bufferData.length; ++i) {
    this._launchAsyncLoadTask(i);
  }
};


/**
 * Individual async loading task.
 * @private
 * @param {Number} taskId Task ID number from |BufferData|.
 */
BufferList.prototype._launchAsyncLoadTask = function(taskId) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', this._bufferData[taskId]);
  xhr.responseType = 'arraybuffer';

  const that = this;
  xhr.onload = function() {
    if (xhr.status === 200) {
      that._context.decodeAudioData(
          xhr.response,
          function(audioBuffer) {
            that._updateProgress(taskId, audioBuffer);
          },
          function(errorMessage) {
            that._updateProgress(taskId, null);
            const message = 'BufferList: decoding "' +
                that._bufferData[taskId] + '" failed. (' + errorMessage + ')';
            Utils.throw(message);
            that._rejectHandler(message);
          });
    } else {
      const message = 'BufferList: XHR error while loading "' +
          that._bufferData[taskId] + '(' + xhr.statusText + ')';
      Utils.throw(message);
      that._rejectHandler(message);
    }
  };

  xhr.onerror = function(event) {
    Utils.throw(
        'BufferList: XHR network failed on loading "' +
        that._bufferData[taskId] + '".');
    that._updateProgress(taskId, null);
    that._rejectHandler();
  };

  xhr.send();
};


/**
 * Updates the overall progress on loading tasks.
 * @param {Number} taskId Task ID number.
 * @param {AudioBuffer} audioBuffer Decoded AudioBuffer object.
 */
BufferList.prototype._updateProgress = function(taskId, audioBuffer) {
  this._bufferList[taskId] = audioBuffer;

  if (this._options.verbose) {
    Utils.log(
        'BufferList: "' + this._bufferData[taskId] + '" successfully' +
        'loaded.');
  }

  if (--this._numberOfTasks === 0) {
    Utils.log(
        'BufferList: ' + this._bufferData.length + ' files loaded ' +
        'successfully.');
    this._resolveHandler(this._bufferList);
  }
};


module.exports = BufferList;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file An audio channel router to resolve different channel layouts between
 * browsers.
 */




/**
 * @typedef {Number[]} ChannelMap
 */

/**
 * Channel map dictionary ENUM.
 * @enum {ChannelMap}
 */
const ChannelMap = {
  /** @type {Number[]} - ACN channel map for Chrome and FireFox. (FFMPEG) */
  DEFAULT: [0, 1, 2, 3],
  /** @type {Number[]} - Safari's 4-channel map for AAC codec. */
  SAFARI: [2, 0, 1, 3],
  /** @type {Number[]} - ACN > FuMa conversion map. */
  FUMA: [0, 3, 1, 2],
};


/**
 * Channel router for FOA stream.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number[]} channelMap - Routing destination array.
 */
function FOARouter(context, channelMap) {
  this._context = context;

  this._splitter = this._context.createChannelSplitter(4);
  this._merger = this._context.createChannelMerger(4);

  // input/output proxy.
  this.input = this._splitter;
  this.output = this._merger;

  this.setChannelMap(channelMap || ChannelMap.DEFAULT);
}


/**
 * Sets channel map.
 * @param {Number[]} channelMap - A new channel map for FOA stream.
 */
FOARouter.prototype.setChannelMap = function(channelMap) {
  if (!Array.isArray(channelMap)) {
    return;
  }

  this._channelMap = channelMap;
  this._splitter.disconnect();
  this._splitter.connect(this._merger, 0, this._channelMap[0]);
  this._splitter.connect(this._merger, 1, this._channelMap[1]);
  this._splitter.connect(this._merger, 2, this._channelMap[2]);
  this._splitter.connect(this._merger, 3, this._channelMap[3]);
};


/**
 * Static channel map ENUM.
 * @static
 * @type {ChannelMap}
 */
FOARouter.ChannelMap = ChannelMap;


module.exports = FOARouter;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Sound field rotator for first-order-ambisonics decoding.
 */




/**
 * First-order-ambisonic decoder based on gain node network.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 */
function FOARotator(context) {
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
  // Y (from channel 1)
  this._splitter.connect(this._inY, 1);
  // Z (from channel 2)
  this._splitter.connect(this._inZ, 2);
  // X (from channel 3)
  this._splitter.connect(this._inX, 3);
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
  // W -> W (to channel 0)
  this._splitter.connect(this._merger, 0, 0);
  // Y (to channel 1)
  this._outY.connect(this._merger, 0, 1);
  // Z (to channel 2)
  this._outZ.connect(this._merger, 0, 2);
  // X (to channel 3)
  this._outX.connect(this._merger, 0, 3);
  this._outY.gain.value = -1;
  this._outX.gain.value = -1;

  this.setRotationMatrix3(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));

  // input/output proxy.
  this.input = this._splitter;
  this.output = this._merger;
}


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
FOARotator.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  this._m0.gain.value = rotationMatrix3[0];
  this._m1.gain.value = rotationMatrix3[1];
  this._m2.gain.value = rotationMatrix3[2];
  this._m3.gain.value = rotationMatrix3[3];
  this._m4.gain.value = rotationMatrix3[4];
  this._m5.gain.value = rotationMatrix3[5];
  this._m6.gain.value = rotationMatrix3[6];
  this._m7.gain.value = rotationMatrix3[7];
  this._m8.gain.value = rotationMatrix3[8];
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
FOARotator.prototype.setRotationMatrix4 = function(rotationMatrix4) {
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
 * Returns the current 3x3 rotation matrix.
 * @return {Number[]} - A 3x3 rotation matrix. (column-major)
 */
FOARotator.prototype.getRotationMatrix3 = function() {
  return [
    this._m0.gain.value, this._m1.gain.value, this._m2.gain.value,
    this._m3.gain.value, this._m4.gain.value, this._m5.gain.value,
    this._m6.gain.value, this._m7.gain.value, this._m8.gain.value,
  ];
};


/**
 * Returns the current 4x4 rotation matrix.
 * @return {Number[]} - A 4x4 rotation matrix. (column-major)
 */
FOARotator.prototype.getRotationMatrix4 = function() {
  let rotationMatrix4 = new Float32Array(16);
  rotationMatrix4[0] = this._m0.gain.value;
  rotationMatrix4[1] = this._m1.gain.value;
  rotationMatrix4[2] = this._m2.gain.value;
  rotationMatrix4[4] = this._m3.gain.value;
  rotationMatrix4[5] = this._m4.gain.value;
  rotationMatrix4[6] = this._m5.gain.value;
  rotationMatrix4[8] = this._m6.gain.value;
  rotationMatrix4[9] = this._m7.gain.value;
  rotationMatrix4[10] = this._m8.gain.value;
  return rotationMatrix4;
};


module.exports = FOARotator;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file A collection of convolvers. Can be used for the optimized FOA binaural
 * rendering. (e.g. SH-MaxRe HRTFs)
 */




/**
 * FOAConvolver. A collection of 2 stereo convolvers for 4-channel FOA stream.
 * @constructor
 * @param {BaseAudioContext} context The associated AudioContext.
 * @param {AudioBuffer[]} [hrirBufferList] - An ordered-list of stereo
 * AudioBuffers for convolution. (i.e. 2 stereo AudioBuffers for FOA)
 */
function FOAConvolver(context, hrirBufferList) {
  this._context = context;

  this._active = false;
  this._isBufferLoaded = false;

  this._buildAudioGraph();

  if (hrirBufferList) {
    this.setHRIRBufferList(hrirBufferList);
  }

  this.enable();
}


/**
 * Build the internal audio graph.
 *
 * @private
 */
FOAConvolver.prototype._buildAudioGraph = function() {
  this._splitterWYZX = this._context.createChannelSplitter(4);
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
  this._splitterWYZX.connect(this._mergerWY, 0, 0);
  this._splitterWYZX.connect(this._mergerWY, 1, 1);
  this._splitterWYZX.connect(this._mergerZX, 2, 0);
  this._splitterWYZX.connect(this._mergerZX, 3, 1);

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

  // By default, WebAudio's convolver does the normalization based on IR's
  // energy. For the precise convolution, it must be disabled before the buffer
  // assignment.
  this._convolverWY.normalize = false;
  this._convolverZX.normalize = false;

  // For asymmetric degree.
  this._inverter.gain.value = -1;

  // Input/output proxy.
  this.input = this._splitterWYZX;
  this.output = this._summingBus;
};


/**
 * Assigns 2 HRIR AudioBuffers to 2 convolvers: Note that we use 2 stereo
 * convolutions for 4-channel direct convolution. Using mono convolver or
 * 4-channel convolver is not viable because mono convolution wastefully
 * produces the stereo outputs, and the 4-ch convolver does cross-channel
 * convolution. (See Web Audio API spec)
 * @param {AudioBuffer[]} hrirBufferList - An array of stereo AudioBuffers for
 * convolvers.
 */
FOAConvolver.prototype.setHRIRBufferList = function(hrirBufferList) {
  // After these assignments, the channel data in the buffer is immutable in
  // FireFox. (i.e. neutered) So we should avoid re-assigning buffers, otherwise
  // an exception will be thrown.
  if (this._isBufferLoaded) {
    return;
  }

  this._convolverWY.buffer = hrirBufferList[0];
  this._convolverZX.buffer = hrirBufferList[1];
  this._isBufferLoaded = true;
};


/**
 * Enable FOAConvolver instance. The audio graph will be activated and pulled by
 * the WebAudio engine. (i.e. consume CPU cycle)
 */
FOAConvolver.prototype.enable = function() {
  this._mergerBinaural.connect(this._summingBus);
  this._active = true;
};


/**
 * Disable FOAConvolver instance. The inner graph will be disconnected from the
 * audio destination, thus no CPU cycle will be consumed.
 */
FOAConvolver.prototype.disable = function() {
  this._mergerBinaural.disconnect();
  this._active = false;
};


module.exports = FOAConvolver;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @fileOverview DEPRECATED at V1. Audio buffer loading utility.
 */



const Utils = __webpack_require__(0);

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
  for (let i = 0; i < audioFileData.length; i++) {
    const fileInfo = audioFileData[i];

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

AudioBufferManager.prototype._loadAudioFile = function(fileInfo) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', fileInfo.url);
  xhr.responseType = 'arraybuffer';

  const that = this;
  xhr.onload = function() {
    if (xhr.status === 200) {
      that._context.decodeAudioData(xhr.response,
        function(buffer) {
          // Utils.log('File loaded: ' + fileInfo.url);
          that._done(fileInfo.name, buffer);
        },
        function(message) {
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
  xhr.onerror = function(event) {
    Utils.log('XHR Network failure: ' + fileInfo.url);
    that._done(fileInfo.name, null);
  };

  xhr.send();
};

AudioBufferManager.prototype._done = function(filename, buffer) {
  // Label the loading task.
  this._loadingTasks[filename] = buffer !== null ? 'loaded' : 'failed';

  // A failed task will be a null buffer.
  this._buffers.set(filename, buffer);

  this._updateProgress(filename);
};

AudioBufferManager.prototype._updateProgress = function(filename) {
  let numberOfFinishedTasks = 0;
  let numberOfFailedTask = 0;
  let numberOfTasks = 0;

  for (const task in this._loadingTasks) {
    if (Object.prototype.hasOwnProperty.call(this._loadingTasks, task)) {
      numberOfTasks++;
      if (this._loadingTasks[task] === 'loaded') {
        numberOfFinishedTasks++;
      } else if (this._loadingTasks[task] === 'failed') {
        numberOfFailedTask++;
      }
    }
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Phase matched filter for first-order-ambisonics decoding.
 */



const Utils = __webpack_require__(0);


// Static parameters.
const CROSSOVER_FREQUENCY = 690;
const GAIN_COEFFICIENTS = [1.4142, 0.8166, 0.8166, 0.8166];


/**
 * Generate the coefficients for dual band filter.
 * @param {Number} crossoverFrequency
 * @param {Number} sampleRate
 * @return {Object} Filter coefficients.
 */
function generateDualBandCoefficients(crossoverFrequency, sampleRate) {
  const k = Math.tan(Math.PI * crossoverFrequency / sampleRate);
  const k2 = k * k;
  const denominator = k2 + 2 * k + 1;

  return {
    lowpassA: [1, 2 * (k2 - 1) / denominator, (k2 - 2 * k + 1) / denominator],
    lowpassB: [k2 / denominator, 2 * k2 / denominator, k2 / denominator],
    hipassA: [1, 2 * (k2 - 1) / denominator, (k2 - 2 * k + 1) / denominator],
    hipassB: [1 / denominator, -2 * 1 / denominator, 1 / denominator],
  };
}


/**
 * FOAPhaseMatchedFilter: A set of filters (LP/HP) with a crossover frequency to
 * compensate the gain of high frequency contents without a phase difference.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 */
function FOAPhaseMatchedFilter(context) {
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
    const coef = generateDualBandCoefficients(CROSSOVER_FREQUENCY,
                                              this._context.sampleRate);
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
  const now = this._context.currentTime;
  this._gainHighW.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[0], now);
  this._gainHighY.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[1], now);
  this._gainHighZ.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[2], now);
  this._gainHighX.gain.setValueAtTime(-1 * GAIN_COEFFICIENTS[3], now);

  // Input/output Proxy.
  this.input = this._input;
  this.output = this._merger;
}


module.exports = FOAPhaseMatchedFilter;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Virtual speaker abstraction for first-order-ambisonics decoding.
 */




/**
 * DEPRECATED at V1: A virtual speaker with ambisonic decoding gain coefficients
 * and HRTF convolution for first-order-ambisonics stream. Note that the
 * subgraph directly connects to context's destination.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} options - Options for speaker.
 * @param {Number[]} options.coefficients - Decoding coefficients for (W,Y,Z,X).
 * @param {AudioBuffer} options.IR - Stereo IR buffer for HRTF convolution.
 * @param {Number} options.gain - Post-gain for the speaker.
 */
function FOAVirtualSpeaker(context, options) {
  if (options.IR.numberOfChannels !== 2) {
    throw new Error('IR does not have 2 channels. cannot proceed.');
  }

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


FOAVirtualSpeaker.prototype.enable = function() {
  this._gain.connect(this._context.destination);
  this._active = true;
};


FOAVirtualSpeaker.prototype.disable = function() {
  this._gain.disconnect();
  this._active = false;
};


module.exports = FOAVirtualSpeaker;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Static data manager for HRIR list and URLs. For Omnitone's HRIR list
 * structure, see src/resources/README.md for the detail.
 */




const HRIRList = [
  // Zero-order ambisonic. Not supported. (0 files, 1 channel)
  null,
  // First-order ambisonic. (2 files, 4 channels)
  ['omnitone-foa-1.wav', 'omnitone-foa-2.wav'],
  // Second-order ambisonic. (5 files, 9 channels)
  [
    'omnitone-soa-1.wav', 'omnitone-soa-2.wav', 'omnitone-soa-3.wav',
    'omnitone-soa-4.wav', 'omnitone-soa-5.wav',
  ],
  // Third-order ambisonic. (8 files, 16 channels)
  [
    'omnitone-toa-1.wav', 'omnitone-toa-2.wav', 'omnitone-toa-3.wav',
    'omnitone-toa-4.wav', 'omnitone-toa-5.wav', 'omnitone-toa-6.wav',
    'omnitone-toa-7.wav', 'omnitone-toa-8.wav',
  ],
];


// 2 different types of base URL.
const SourceURL = {
  GSTATIC:
      'https://www.gstatic.com/external_hosted/omnitone/build/resources/',
  GITHUB:
      'https://cdn.rawgit.com/GoogleChrome/omnitone/master/build/resources/',
};


/**
 * [getPathSet description]
 * @param {object} [setting] - Setting object.
 * @param {string} [setting.source="github"] - The base location for the HRIR
 * set.
 * @param {number} [setting.ambisonicOrder=1] - Requested ambisonic order.
 * @return {string[]} pathList - HRIR path set (2~8 URLs)
 */
module.exports.getPathList = function(setting) {
  let filenames;
  let staticPath;
  let pathList;

  const setting_ = setting || {ambisonicOrder: 1, source: 'github'};

  switch (setting_.ambisonicOrder) {
    case 1:
    case 2:
    case 3:
      filenames = HRIRList[setting_.ambisonicOrder];
      break;
    default:
      // Invalid order gets the null path list.
      filenames = HRIRList[0];
      break;
  }

  switch (setting_.source) {
    case 'gstatic':
      staticPath = SourceURL.GSTATIC;
      break;
    case 'github':
    default:
      // By default, use GitHub's CDN until Gstatic setup is completed.
      staticPath = SourceURL.GITHUB;
      break;
  }

  if (filenames) {
    pathList = [];
    filenames.forEach(function(filename) {
      pathList.push(staticPath + filename);
    });
  }

  return pathList;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file A collection of convolvers. Can be used for the optimized HOA binaural
 * rendering. (e.g. SH-MaxRe HRTFs)
 */




/**
 * A convolver network for N-channel HOA stream.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number} ambisonicOrder - Ambisonic order. (2 or 3)
 * @param {AudioBuffer[]} [hrirBufferList] - An ordered-list of stereo
 * AudioBuffers for convolution. (SOA: 5 AudioBuffers, TOA: 8 AudioBuffers)
 */
function HOAConvolver(context, ambisonicOrder, hrirBufferList) {
  this._context = context;

  this._active = false;
  this._isBufferLoaded = false;

  // The number of channels K based on the ambisonic order N where K = (N+1)^2.
  this._ambisonicOrder = ambisonicOrder;
  this._numberOfChannels =
      (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);

  this._buildAudioGraph();
  if (hrirBufferList) {
    this.setHRIRBufferList(hrirBufferList);
  }

  this.enable();
}


/**
 * Build the internal audio graph.
 * For TOA convolution:
 *   input -> splitter(16) -[0,1]-> merger(2) -> convolver(2) -> splitter(2)
 *                         -[2,3]-> merger(2) -> convolver(2) -> splitter(2)
 *                         -[4,5]-> ... (6 more, 8 branches total)
 * @private
 */
HOAConvolver.prototype._buildAudioGraph = function() {
  const numberOfStereoChannels = Math.ceil(this._numberOfChannels / 2);

  this._inputSplitter =
      this._context.createChannelSplitter(this._numberOfChannels);
  this._stereoMergers = [];
  this._convolvers = [];
  this._stereoSplitters = [];
  this._positiveIndexSphericalHarmonics = this._context.createGain();
  this._negativeIndexSphericalHarmonics = this._context.createGain();
  this._inverter = this._context.createGain();
  this._binauralMerger = this._context.createChannelMerger(2);
  this._outputGain = this._context.createGain();

  for (let i = 0; i < numberOfStereoChannels; ++i) {
    this._stereoMergers[i] = this._context.createChannelMerger(2);
    this._convolvers[i] = this._context.createConvolver();
    this._stereoSplitters[i] = this._context.createChannelSplitter(2);
    this._convolvers[i].normalize = false;
  }

  for (let l = 0; l <= this._ambisonicOrder; ++l) {
    for (let m = -l; m <= l; m++) {
      // We compute the ACN index (k) of ambisonics channel using the degree (l)
      // and index (m): k = l^2 + l + m
      const acnIndex = l * l + l + m;
      const stereoIndex = Math.floor(acnIndex / 2);

      // Split channels from input into array of stereo convolvers.
      // Then create a network of mergers that produces the stereo output.
      this._inputSplitter.connect(
          this._stereoMergers[stereoIndex], acnIndex, acnIndex % 2);
      this._stereoMergers[stereoIndex].connect(this._convolvers[stereoIndex]);
      this._convolvers[stereoIndex].connect(this._stereoSplitters[stereoIndex]);

      // Positive index (m >= 0) spherical harmonics are symmetrical around the
      // front axis, while negative index (m < 0) spherical harmonics are
      // anti-symmetrical around the front axis. We will exploit this symmetry
      // to reduce the number of convolutions required when rendering to a
      // symmetrical binaural renderer.
      if (m >= 0) {
        this._stereoSplitters[stereoIndex].connect(
            this._positiveIndexSphericalHarmonics, acnIndex % 2);
      } else {
        this._stereoSplitters[stereoIndex].connect(
            this._negativeIndexSphericalHarmonics, acnIndex % 2);
      }
    }
  }

  this._positiveIndexSphericalHarmonics.connect(this._binauralMerger, 0, 0);
  this._positiveIndexSphericalHarmonics.connect(this._binauralMerger, 0, 1);
  this._negativeIndexSphericalHarmonics.connect(this._binauralMerger, 0, 0);
  this._negativeIndexSphericalHarmonics.connect(this._inverter);
  this._inverter.connect(this._binauralMerger, 0, 1);

  // For asymmetric index.
  this._inverter.gain.value = -1;

  // Input/Output proxy.
  this.input = this._inputSplitter;
  this.output = this._outputGain;
};


/**
 * Assigns N HRIR AudioBuffers to N convolvers: Note that we use 2 stereo
 * convolutions for 4-channel direct convolution. Using mono convolver or
 * 4-channel convolver is not viable because mono convolution wastefully
 * produces the stereo outputs, and the 4-ch convolver does cross-channel
 * convolution. (See Web Audio API spec)
 * @param {AudioBuffer[]} hrirBufferList - An array of stereo AudioBuffers for
 * convolvers.
 */
HOAConvolver.prototype.setHRIRBufferList = function(hrirBufferList) {
  // After these assignments, the channel data in the buffer is immutable in
  // FireFox. (i.e. neutered) So we should avoid re-assigning buffers, otherwise
  // an exception will be thrown.
  if (this._isBufferLoaded) {
    return;
  }

  for (let i = 0; i < hrirBufferList.length; ++i) {
    this._convolvers[i].buffer = hrirBufferList[i];
  }

  this._isBufferLoaded = true;
};


/**
 * Enable HOAConvolver instance. The audio graph will be activated and pulled by
 * the WebAudio engine. (i.e. consume CPU cycle)
 */
HOAConvolver.prototype.enable = function() {
  this._binauralMerger.connect(this._outputGain);
  this._active = true;
};


/**
 * Disable HOAConvolver instance. The inner graph will be disconnected from the
 * audio destination, thus no CPU cycle will be consumed.
 */
HOAConvolver.prototype.disable = function() {
  this._binauralMerger.disconnect();
  this._active = false;
};


module.exports = HOAConvolver;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Sound field rotator for higher-order-ambisonics decoding.
 */




/**
 * Kronecker Delta function.
 * @param {Number} i
 * @param {Number} j
 * @return {Number}
 */
function getKroneckerDelta(i, j) {
  return i === j ? 1 : 0;
}


/**
 * A helper function to allow us to access a matrix array in the same
 * manner, assuming it is a (2l+1)x(2l+1) matrix. [2] uses an odd convention of
 * referring to the rows and columns using centered indices, so the middle row
 * and column are (0, 0) and the upper left would have negative coordinates.
 * @param {Number[]} matrix - N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 * @param {Number} l
 * @param {Number} i
 * @param {Number} j
 * @param {Number} gainValue
 */
function setCenteredElement(matrix, l, i, j, gainValue) {
  const index = (j + l) * (2 * l + 1) + (i + l);
  // Row-wise indexing.
  matrix[l - 1][index].gain.value = gainValue;
}


/**
 * This is a helper function to allow us to access a matrix array in the same
 * manner, assuming it is a (2l+1) x (2l+1) matrix.
 * @param {Number[]} matrix - N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 * @param {Number} l
 * @param {Number} i
 * @param {Number} j
 * @return {Number}
 */
function getCenteredElement(matrix, l, i, j) {
  // Row-wise indexing.
  const index = (j + l) * (2 * l + 1) + (i + l);
  return matrix[l - 1][index].gain.value;
}


/**
 * Helper function defined in [2] that is used by the functions U, V, W.
 * This should not be called on its own, as U, V, and W (and their coefficients)
 * select the appropriate matrix elements to access arguments |a| and |b|.
 * @param {Number[]} matrix - N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 * @param {Number} i
 * @param {Number} a
 * @param {Number} b
 * @param {Number} l
 * @return {Number}
 */
function getP(matrix, i, a, b, l) {
  if (b === l) {
    return getCenteredElement(matrix, 1, i, 1) *
        getCenteredElement(matrix, l - 1, a, l - 1) -
        getCenteredElement(matrix, 1, i, -1) *
        getCenteredElement(matrix, l - 1, a, -l + 1);
  } else if (b === -l) {
    return getCenteredElement(matrix, 1, i, 1) *
        getCenteredElement(matrix, l - 1, a, -l + 1) +
        getCenteredElement(matrix, 1, i, -1) *
        getCenteredElement(matrix, l - 1, a, l - 1);
  } else {
    return getCenteredElement(matrix, 1, i, 0) *
        getCenteredElement(matrix, l - 1, a, b);
  }
}


/**
 * The functions U, V, and W should only be called if the correspondingly
 * named coefficient u, v, w from the function ComputeUVWCoeff() is non-zero.
 * When the coefficient is 0, these would attempt to access matrix elements that
 * are out of bounds. The vector of rotations, |r|, must have the |l - 1|
 * previously completed band rotations. These functions are valid for |l >= 2|.
 * @param {Number[]} matrix - N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 * @return {Number}
 */
function getU(matrix, m, n, l) {
  // Although [1, 2] split U into three cases for m == 0, m < 0, m > 0
  // the actual values are the same for all three cases.
  return getP(matrix, 0, m, n, l);
}


/**
 * The functions U, V, and W should only be called if the correspondingly
 * named coefficient u, v, w from the function ComputeUVWCoeff() is non-zero.
 * When the coefficient is 0, these would attempt to access matrix elements that
 * are out of bounds. The vector of rotations, |r|, must have the |l - 1|
 * previously completed band rotations. These functions are valid for |l >= 2|.
 * @param {Number[]} matrix - N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 * @return {Number}
 */
function getV(matrix, m, n, l) {
  if (m === 0) {
    return getP(matrix, 1, 1, n, l) + getP(matrix, -1, -1, n, l);
  } else if (m > 0) {
    const d = getKroneckerDelta(m, 1);
    return getP(matrix, 1, m - 1, n, l) * Math.sqrt(1 + d) -
        getP(matrix, -1, -m + 1, n, l) * (1 - d);
  } else {
    // Note there is apparent errata in [1,2,2b] dealing with this particular
    // case. [2b] writes it should be P*(1-d)+P*(1-d)^0.5
    // [1] writes it as P*(1+d)+P*(1-d)^0.5, but going through the math by hand,
    // you must have it as P*(1-d)+P*(1+d)^0.5 to form a 2^.5 term, which
    // parallels the case where m > 0.
    const d = getKroneckerDelta(m, -1);
    return getP(matrix, 1, m + 1, n, l) * (1 - d) +
        getP(matrix, -1, -m - 1, n, l) * Math.sqrt(1 + d);
  }
}


/**
 * The functions U, V, and W should only be called if the correspondingly
 * named coefficient u, v, w from the function ComputeUVWCoeff() is non-zero.
 * When the coefficient is 0, these would attempt to access matrix elements that
 * are out of bounds. The vector of rotations, |r|, must have the |l - 1|
 * previously completed band rotations. These functions are valid for |l >= 2|.
 * @param {Number[]} matrix N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 * @return {Number}
 */
function getW(matrix, m, n, l) {
  // Whenever this happens, w is also 0 so W can be anything.
  if (m === 0) {
    return 0;
  }

  return m > 0 ? getP(matrix, 1, m + 1, n, l) + getP(matrix, -1, -m - 1, n, l) :
                 getP(matrix, 1, m - 1, n, l) - getP(matrix, -1, -m + 1, n, l);
}


/**
 * Calculates the coefficients applied to the U, V, and W functions. Because
 * their equations share many common terms they are computed simultaneously.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 * @return {Array} 3 coefficients for U, V and W functions.
 */
function computeUVWCoeff(m, n, l) {
  const d = getKroneckerDelta(m, 0);
  const reciprocalDenominator =
      Math.abs(n) === l ? 1 / (2 * l * (2 * l - 1)) : 1 / ((l + n) * (l - n));

  return [
    Math.sqrt((l + m) * (l - m) * reciprocalDenominator),
    0.5 * (1 - 2 * d) * Math.sqrt((1 + d) *
                                  (l + Math.abs(m) - 1) *
                                  (l + Math.abs(m)) *
                                  reciprocalDenominator),
    -0.5 * (1 - d) * Math.sqrt((l - Math.abs(m) - 1) * (l - Math.abs(m))) *
        reciprocalDenominator,
  ];
}


/**
 * Calculates the (2l+1) x (2l+1) rotation matrix for the band l.
 * This uses the matrices computed for band 1 and band l-1 to compute the
 * matrix for band l. |rotations| must contain the previously computed l-1
 * rotation matrices.
 * This implementation comes from p. 5 (6346), Table 1 and 2 in [2] taking
 * into account the corrections from [2b].
 * @param {Number[]} matrix - N matrices of gainNodes, each with where
 * n=1,2,...,N.
 * @param {Number} l
 */
function computeBandRotation(matrix, l) {
  // The lth band rotation matrix has rows and columns equal to the number of
  // coefficients within that band (-l <= m <= l implies 2l + 1 coefficients).
  for (let m = -l; m <= l; m++) {
    for (let n = -l; n <= l; n++) {
      const uvwCoefficients = computeUVWCoeff(m, n, l);

      // The functions U, V, W are only safe to call if the coefficients
      // u, v, w are not zero.
      if (Math.abs(uvwCoefficients[0]) > 0) {
        uvwCoefficients[0] *= getU(matrix, m, n, l);
      }
      if (Math.abs(uvwCoefficients[1]) > 0) {
        uvwCoefficients[1] *= getV(matrix, m, n, l);
      }
      if (Math.abs(uvwCoefficients[2]) > 0) {
        uvwCoefficients[2] *= getW(matrix, m, n, l);
      }

      setCenteredElement(
          matrix, l, m, n,
          uvwCoefficients[0] + uvwCoefficients[1] + uvwCoefficients[2]);
    }
  }
}


/**
 * Compute the HOA rotation matrix after setting the transform matrix.
 * @param {Array} matrix - N matrices of gainNodes, each with (2n+1) x (2n+1)
 * elements, where n=1,2,...,N.
 */
function computeHOAMatrices(matrix) {
  // We start by computing the 2nd-order matrix from the 1st-order matrix.
  for (let i = 2; i <= matrix.length; i++) {
    computeBandRotation(matrix, i);
  }
}


/**
 * Higher-order-ambisonic decoder based on gain node network. We expect
 * the order of the channels to conform to ACN ordering. Below are the helper
 * methods to compute SH rotation using recursion. The code uses maths described
 * in the following papers:
 *  [1] R. Green, "Spherical Harmonic Lighting: The Gritty Details", GDC 2003,
 *      http://www.research.scea.com/gdc2003/spherical-harmonic-lighting.pdf
 *  [2] J. Ivanic and K. Ruedenberg, "Rotation Matrices for Real
 *      Spherical Harmonics. Direct Determination by Recursion", J. Phys.
 *      Chem., vol. 100, no. 15, pp. 6342-6347, 1996.
 *      http://pubs.acs.org/doi/pdf/10.1021/jp953350u
 *  [2b] Corrections to initial publication:
 *       http://pubs.acs.org/doi/pdf/10.1021/jp9833350
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Number} ambisonicOrder - Ambisonic order.
 */
function HOARotator(context, ambisonicOrder) {
  this._context = context;
  this._ambisonicOrder = ambisonicOrder;

  // We need to determine the number of channels K based on the ambisonic order
  // N where K = (N + 1)^2.
  const numberOfChannels = (ambisonicOrder + 1) * (ambisonicOrder + 1);

  this._splitter = this._context.createChannelSplitter(numberOfChannels);
  this._merger = this._context.createChannelMerger(numberOfChannels);

  // Create a set of per-order rotation matrices using gain nodes.
  this._gainNodeMatrix = [];
  let orderOffset;
  let rows;
  let inputIndex;
  let outputIndex;
  let matrixIndex;
  for (let i = 1; i <= ambisonicOrder; i++) {
    // Each ambisonic order requires a separate (2l + 1) x (2l + 1) rotation
    // matrix. We compute the offset value as the first channel index of the
    // current order where
    //   k_last = l^2 + l + m,
    // and m = -l
    //   k_last = l^2
    orderOffset = i * i;

    // Uses row-major indexing.
    rows = (2 * i + 1);

    this._gainNodeMatrix[i - 1] = [];
    for (let j = 0; j < rows; j++) {
      inputIndex = orderOffset + j;
      for (let k = 0; k < rows; k++) {
        outputIndex = orderOffset + k;
        matrixIndex = j * rows + k;
        this._gainNodeMatrix[i - 1][matrixIndex] = this._context.createGain();
        this._splitter.connect(
            this._gainNodeMatrix[i - 1][matrixIndex], inputIndex);
        this._gainNodeMatrix[i - 1][matrixIndex].connect(
            this._merger, 0, outputIndex);
      }
    }
  }

  // W-channel is not involved in rotation, skip straight to ouput.
  this._splitter.connect(this._merger, 0, 0);

  // Default Identity matrix.
  this.setRotationMatrix3(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));

  // Input/Output proxy.
  this.input = this._splitter;
  this.output = this._merger;
}


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
HOARotator.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  for (let i = 0; i < 9; ++i) {
    this._gainNodeMatrix[0][i].gain.value = rotationMatrix3[i];
  }
  computeHOAMatrices(this._gainNodeMatrix);
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
HOARotator.prototype.setRotationMatrix4 = function(rotationMatrix4) {
  this._gainNodeMatrix[0][0].gain.value = rotationMatrix4[0];
  this._gainNodeMatrix[0][1].gain.value = rotationMatrix4[1];
  this._gainNodeMatrix[0][2].gain.value = rotationMatrix4[2];
  this._gainNodeMatrix[0][3].gain.value = rotationMatrix4[4];
  this._gainNodeMatrix[0][4].gain.value = rotationMatrix4[5];
  this._gainNodeMatrix[0][5].gain.value = rotationMatrix4[6];
  this._gainNodeMatrix[0][6].gain.value = rotationMatrix4[8];
  this._gainNodeMatrix[0][7].gain.value = rotationMatrix4[9];
  this._gainNodeMatrix[0][8].gain.value = rotationMatrix4[10];
  computeHOAMatrices(this._gainNodeMatrix);
};


/**
 * Returns the current 3x3 rotation matrix.
 * @return {Number[]} - A 3x3 rotation matrix. (column-major)
 */
HOARotator.prototype.getRotationMatrix3 = function() {
  let rotationMatrix3 = new Float32Array(9);
  for (let i = 0; i < 9; ++i) {
    rotationMatrix3[i] = this._gainNodeMatrix[0][i].gain.value;
  }
  return rotationMatrix3;
};


/**
 * Returns the current 4x4 rotation matrix.
 * @return {Number[]} - A 4x4 rotation matrix. (column-major)
 */
HOARotator.prototype.getRotationMatrix4 = function() {
  let rotationMatrix4 = new Float32Array(16);
  rotationMatrix4[0] = this._gainNodeMatrix[0][0].gain.value;
  rotationMatrix4[1] = this._gainNodeMatrix[0][1].gain.value;
  rotationMatrix4[2] = this._gainNodeMatrix[0][2].gain.value;
  rotationMatrix4[4] = this._gainNodeMatrix[0][3].gain.value;
  rotationMatrix4[5] = this._gainNodeMatrix[0][4].gain.value;
  rotationMatrix4[6] = this._gainNodeMatrix[0][5].gain.value;
  rotationMatrix4[8] = this._gainNodeMatrix[0][6].gain.value;
  rotationMatrix4[9] = this._gainNodeMatrix[0][7].gain.value;
  rotationMatrix4[10] = this._gainNodeMatrix[0][8].gain.value;
  return rotationMatrix4;
};


/**
 * Get the current ambisonic order.
 * @return {Number}
 */
HOARotator.prototype.getAmbisonicOrder = function() {
  return this._ambisonicOrder;
};


module.exports = HOARotator;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Namespace for Omnitone library.
 */




exports.Omnitone = __webpack_require__(12);


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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




const BufferList = __webpack_require__(1);
const FOAConvolver = __webpack_require__(4);
const FOADecoder = __webpack_require__(13);
const FOAPhaseMatchedFilter = __webpack_require__(6);
const FOARenderer = __webpack_require__(15);
const FOARotator = __webpack_require__(3);
const FOARouter = __webpack_require__(2);
const FOAVirtualSpeaker = __webpack_require__(7);
const HOAConvolver = __webpack_require__(9);
const HOARenderer = __webpack_require__(16);
const HOARotator = __webpack_require__(10);
const Polyfill = __webpack_require__(17);
const Utils = __webpack_require__(0);
const Version = __webpack_require__(18);

// DEPRECATED in V1, in favor of BufferList.
const AudioBufferManager = __webpack_require__(5);


/**
 * Omnitone namespace.
 * @namespace
 */
let Omnitone = {};


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


// DEPRECATED in V1. DO. NOT. USE.
Omnitone.loadAudioBuffers = function(context, speakerData) {
  return new Promise(function(resolve, reject) {
    new AudioBufferManager(context, speakerData, function(buffers) {
      resolve(buffers);
    }, reject);
  });
};


/**
 * Performs the async loading/decoding of multiple AudioBuffers from multiple
 * URLs.
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {string[]} bufferData - An ordered list of URLs.
 * @return {Promise<AudioBuffer[]>} - The promise resolves with an array of
 * AudioBuffer.
 */
Omnitone.createBufferList = function(context, bufferData) {
  const bufferList = new BufferList(context, bufferData);
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
 * Create an instance of FOAPhaseMatchedFilter.
 * @ignore
 * @see FOAPhaseMatchedFilter
 * @param {AudioContext} context - Associated AudioContext.
 * @return {FOAPhaseMatchedFilter}
 */
Omnitone.createFOAPhaseMatchedFilter = function(context) {
  return new FOAPhaseMatchedFilter(context);
};


/**
 * Create an instance of FOAVirtualSpeaker. For parameters, refer the
 * definition of VirtualSpeaker class.
 * @ignore
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} options - Options.
 * @return {FOAVirtualSpeaker}
 */
Omnitone.createFOAVirtualSpeaker = function(context, options) {
  return new FOAVirtualSpeaker(context, options);
};


/**
 * DEPRECATED. Use FOARenderer instance.
 * @see FOARenderer
 * @param {AudioContext} context - Associated AudioContext.
 * @param {DOMElement} videoElement - Video or Audio DOM element to be streamed.
 * @param {Object} options - Options for FOA decoder.
 * @param {String} options.baseResourceUrl - Base URL for resources.
 * (base path for HRIR files)
 * @param {Number} [options.postGain=26.0] - Post-decoding gain compensation.
 * @param {Array} [options.routingDestination]  Custom channel layout.
 * @return {FOADecoder}
 */
Omnitone.createFOADecoder = function(context, videoElement, options) {
  Utils.log('WARNING: FOADecoder is deprecated in favor of FOARenderer.');
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


// Handler Preload Tasks.
// - Detects the browser information.
// - Prints out the version number.
(function() {
  Utils.log('Version ' + Version + ' (running ' +
      Omnitone.browserInfo.name + ' ' + Omnitone.browserInfo.version +
      ' on ' + Omnitone.browserInfo.platform +')');
  if (Omnitone.browserInfo.name.toLowerCase() === 'safari') {
    Polyfill.patchSafari();
    Utils.log(Omnitone.browserInfo.name + ' detected. Appliying polyfill...');
  }
})();


module.exports = Omnitone;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Omnitone FOA decoder, DEPRECATED in favor of FOARenderer.
 */



const AudioBufferManager = __webpack_require__(5);
const FOARouter = __webpack_require__(2);
const FOARotator = __webpack_require__(3);
const FOAPhaseMatchedFilter = __webpack_require__(6);
const FOAVirtualSpeaker = __webpack_require__(7);
const FOASpeakerData = __webpack_require__(14);
const Utils = __webpack_require__(0);

// By default, Omnitone fetches IR from the spatial media repository.
const HRTFSET_URL = 'https://raw.githubusercontent.com/GoogleChrome/omnitone/master/build/resources/';

// Post gain compensation value.
let POST_GAIN_DB = 0;


/**
 * Omnitone FOA decoder.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {VideoElement} videoElement - Target video (or audio) element for
 * streaming.
 * @param {Object} options
 * @param {String} options.HRTFSetUrl - Base URL for the cube HRTF sets.
 * @param {Number} options.postGainDB - Post-decoding gain compensation in dB.
 * @param {Number[]} options.channelMap - Custom channel map.
 */
function FOADecoder(context, videoElement, options) {
  this._isDecoderReady = false;
  this._context = context;
  this._videoElement = videoElement;
  this._decodingMode = 'ambisonic';

  this._postGainDB = POST_GAIN_DB;
  this._HRTFSetUrl = HRTFSET_URL;
  this._channelMap = FOARouter.ChannelMap.DEFAULT; // ACN

  if (options) {
    if (options.postGainDB) {
      this._postGainDB = options.postGainDB;
    }
    if (options.HRTFSetUrl) {
      this._HRTFSetUrl = options.HRTFSetUrl;
    }
    if (options.channelMap) {
      this._channelMap = options.channelMap;
    }
  }

  // Rearrange speaker data based on |options.HRTFSetUrl|.
  this._speakerData = [];
  for (let i = 0; i < FOASpeakerData.length; ++i) {
    this._speakerData.push({
      name: FOASpeakerData[i].name,
      url: this._HRTFSetUrl + '/' + FOASpeakerData[i].url,
      coef: FOASpeakerData[i].coef,
    });
  }

  this._tempMatrix4 = new Float32Array(16);
}


/**
 * Initialize and load the resources for the decode.
 * @return {Promise}
 */
FOADecoder.prototype.initialize = function() {
  Utils.log('Initializing... (mode: ' + this._decodingMode + ')');

  // Rerouting channels if necessary.
  let channelMapString = this._channelMap.toString();
  let defaultChannelMapString = FOARouter.ChannelMap.DEFAULT.toString();
  if (channelMapString !== defaultChannelMapString) {
    Utils.log('Remapping channels ([' + defaultChannelMapString + '] -> ['
      + channelMapString + '])');
  }

  this._audioElementSource =
      this._context.createMediaElementSource(this._videoElement);
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
  const postGainLinear = Math.pow(10, this._postGainDB/20);
  Utils.log('Gain compensation: ' + postGainLinear + ' (' + this._postGainDB
    + 'dB)');

  // This returns a promise so developers can use the decoder when it is ready.
  const that = this;
  return new Promise(function(resolve, reject) {
    new AudioBufferManager(that._context, that._speakerData,
      function(buffers) {
        for (let i = 0; i < that._speakerData.length; ++i) {
          that._foaVirtualSpeakers[i] = new FOAVirtualSpeaker(that._context, {
            coefficients: that._speakerData[i].coef,
            IR: buffers.get(that._speakerData[i].name),
            gain: postGainLinear,
          });

          that._foaPhaseMatchedFilter.output.connect(
            that._foaVirtualSpeakers[i].input);
        }

        // Set the decoding mode.
        that.setMode(that._decodingMode);
        that._isDecoderReady = true;
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
FOADecoder.prototype.setRotationMatrix = function(rotationMatrix) {
  this._foaRotator.setRotationMatrix(rotationMatrix);
};


/**
 * Update the rotation matrix from a Three.js camera object.
 * @param  {Object} cameraMatrix      The Matrix4 obejct of Three.js the camera.
 */
FOADecoder.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {
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
FOADecoder.prototype.setMode = function(mode) {
  if (mode === this._decodingMode) {
    return;
  }

  switch (mode) {
    case 'bypass':
      this._decodingMode = 'bypass';
      for (let i = 0; i < this._foaVirtualSpeakers.length; ++i) {
        this._foaVirtualSpeakers[i].disable();
      }
      this._bypass.connect(this._context.destination);
      break;

    case 'ambisonic':
      this._decodingMode = 'ambisonic';
      for (let i = 0; i < this._foaVirtualSpeakers.length; ++i) {
        this._foaVirtualSpeakers[i].enable();
      }
      this._bypass.disconnect();
      break;

    case 'off':
      this._decodingMode = 'off';
      for (let i = 0; i < this._foaVirtualSpeakers.length; ++i) {
        this._foaVirtualSpeakers[i].disable();
      }
      this._bypass.disconnect();
      break;

    default:
      break;
  }

  Utils.log('Decoding mode changed. (' + mode + ')');
};

module.exports = FOADecoder;


/***/ }),
/* 14 */
/***/ (function(module, exports) {

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
 * The data for FOAVirtualSpeaker. Each entry contains the URL for IR files and
 * the gain coefficients for the associated IR files. Note that the order of
 * coefficients follows the ACN channel ordering. (W,Y,Z,X)
 * @type {Object[]}
 */
const FOASpeakerData = [{
  name: 'E35_A135',
  url: 'E35_A135.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, 0.21653, -0.216495],
}, {
  name: 'E35_A-135',
  url: 'E35_A-135.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, 0.21653, -0.216495],
}, {
  name: 'E-35_A135',
  url: 'E-35_A135.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, -0.21653, -0.216495],
}, {
  name: 'E-35_A-135',
  url: 'E-35_A-135.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, -0.21653, -0.216495],
}, {
  name: 'E35_A45',
  url: 'E35_A45.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, 0.21653, 0.216495],
}, {
  name: 'E35_A-45',
  url: 'E35_A-45.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, 0.21653, 0.216495],
}, {
  name: 'E-35_A45',
  url: 'E-35_A45.wav',
  gainFactor: 1,
  coef: [.1250, 0.216495, -0.21653, 0.216495],
}, {
  name: 'E-35_A-45',
  url: 'E-35_A-45.wav',
  gainFactor: 1,
  coef: [.1250, -0.216495, -0.21653, 0.216495],
}];


module.exports = FOASpeakerData;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Omnitone FOARenderer. This is user-facing API for the first-order
 * ambisonic decoder and the optimized binaural renderer.
 */



const BufferList = __webpack_require__(1);
const FOAConvolver = __webpack_require__(4);
const FOARotator = __webpack_require__(3);
const FOARouter = __webpack_require__(2);
const HRIRManager = __webpack_require__(8);
const Utils = __webpack_require__(0);


/**
 * @typedef {string} RenderingMode
 */

/**
 * Rendering mode ENUM.
 * @enum {RenderingMode}
 */
const RenderingMode = {
  /** @type {string} Use ambisonic rendering. */
  AMBISONIC: 'ambisonic',
  /** @type {string} Bypass. No ambisonic rendering. */
  BYPASS: 'bypass',
  /** @type {string} Disable audio output. */
  OFF: 'off',
};


/**
 * Omnitone FOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} config
 * @param {Array} [config.channelMap] - Custom channel routing map. Useful for
 * handling the inconsistency in browser's multichannel audio decoding.
 * @param {Array} [config.hrirPathList] - A list of paths to HRIR files. It
 * overrides the internal HRIR list if given.
 * @param {RenderingMode} [config.renderingMode='ambisonic'] - Rendering mode.
 */
function FOARenderer(context, config) {
  this._context = Utils.isAudioContext(context) ?
      context :
      Utils.throw('FOARenderer: Invalid BaseAudioContext.');

  this._config = {
    channelMap: FOARouter.ChannelMap.DEFAULT,
    renderingMode: RenderingMode.AMBISONIC,
  };

  if (config.channelMap) {
    if (Array.isArray(config.channelMap) && config.channelMap.length === 4) {
      this._config.channelMap = config.channelMap;
    } else {
      Utils.throw(
          'FOARenderer: Invalid channel map. (got ' + config.channelMap + ')');
    }
  }

  if (config.hrirPathList) {
    if (Array.isArray(config.hrirPathList) &&
        config.hrirPathList.length === 2) {
      this._config.pathList = config.hrirPathList;
    } else {
      Utils.throw(
          'FOARenderer: Invalid HRIR URLs. It must be an array with ' +
          '2 URLs to HRIR files. (got ' + config.hrirPathList + ')');
    }
  } else {
    // By default, the path list points to GitHub CDN with FOA files.
    // TODO(hoch): update this to Gstatic server when it's available.
    this._config.pathList = HRIRManager.getPathList();
  }

  if (config.renderingMode) {
    if (Object.values(RenderingMode).includes(config.renderingMode)) {
      this._config.renderingMode = config.renderingMode;
    } else {
      Utils.log(
          'FOARenderer: Invalid rendering mode order. (got' +
          config.renderingMode + ') Fallbacks to the mode "ambisonic".');
    }
  }

  this._buildAudioGraph();

  this._tempMatrix4 = new Float32Array(16);
  this._isRendererReady = false;
}


/**
 * Builds the internal audio graph.
 * @private
 */
FOARenderer.prototype._buildAudioGraph = function() {
  this.input = this._context.createGain();
  this.output = this._context.createGain();
  this._bypass = this._context.createGain();
  this._foaRouter = new FOARouter(this._context, this._config.channelMap);
  this._foaRotator = new FOARotator(this._context);
  this._foaConvolver = new FOAConvolver(this._context);
  this.input.connect(this._foaRouter.input);
  this.input.connect(this._bypass);
  this._foaRouter.output.connect(this._foaRotator.input);
  this._foaRotator.output.connect(this._foaConvolver.input);
  this._foaConvolver.output.connect(this.output);
};


/**
 * Internal callback handler for |initialize| method.
 * @private
 * @param {function} resolve - Resolution handler.
 * @param {function} reject - Rejection handler.
 */
FOARenderer.prototype._initializeCallback = function(resolve, reject) {
  let bufferLoaderData = [];
  for (let i = 0; i < this._config.pathList.length; ++i) {
    bufferLoaderData.push({name: i, url: this._config.pathList[i]});
  }

  const bufferList = new BufferList(this._context, this._config.pathList);
  bufferList.load().then(
      function(hrirBufferList) {
        this._foaConvolver.setHRIRBufferList(hrirBufferList);
        this.setRenderingMode(this._config.renderingMode);
        this._isRendererReady = true;
        Utils.log('FOARenderer: HRIRs loaded successfully. Ready.');
        resolve();
      }.bind(this),
      function() {
        const errorMessage = 'FOARenderer: HRIR loading/decoding failed.';
        Utils.throw(errorMessage);
        reject(errorMessage);
      });
};


/**
 * Initializes and loads the resource for the renderer.
 * @return {Promise}
 */
FOARenderer.prototype.initialize = function() {
  Utils.log(
      'FOARenderer: Initializing... (mode: ' + this._config.renderingMode +
      ')');

  return new Promise(this._initializeCallback.bind(this), function(error) {
    Utils.throw('FOARenderer: Initialization failed. (' + error + ')');
  });
};


/**
 * Set the channel map.
 * @param {Number[]} channelMap - Custom channel routing for FOA stream.
 */
FOARenderer.prototype.setChannelMap = function(channelMap) {
  if (!this._isRendererReady) {
    return;
  }

  if (channelMap.toString() !== this._config.channelMap.toString()) {
    Utils.log(
        'Remapping channels ([' + this._config.channelMap.toString() +
        '] -> [' + channelMap.toString() + ']).');
    this._config.channelMap = channelMap.slice();
    this._foaRouter.setChannelMap(this._config.channelMap);
  }
};


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  if (!this._isRendererReady) {
    return;
  }

  this._foaRotator.setRotationMatrix3(rotationMatrix3);
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
FOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {
  if (!this._isRendererReady) {
    return;
  }

  this._foaRotator.setRotationMatrix4(rotationMatrix4);
};


/**
 * Set the rotation matrix from a Three.js camera object. Depreated in V1, and
 * this exists only for the backward compatiblity. Instead, use
 * |setRotatationMatrix4()| with Three.js |camera.worldMatrix.elements|.
 * @deprecated
 * @param {Object} cameraMatrix - Matrix4 from Three.js |camera.matrix|.
 */
FOARenderer.prototype.setRotationMatrixFromCamera = function(cameraMatrix) {
  if (!this._isRendererReady) {
    return;
  }

  // Extract the inner array elements and inverse. (The actual view rotation is
  // the opposite of the camera movement.)
  Utils.invertMatrix4(this._tempMatrix4, cameraMatrix.elements);
  this._foaRotator.setRotationMatrix4(this._tempMatrix4);
};


/**
 * Set the rendering mode.
 * @param {RenderingMode} mode - Rendering mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
FOARenderer.prototype.setRenderingMode = function(mode) {
  if (mode === this._config.renderingMode) {
    return;
  }

  switch (mode) {
    case RenderingMode.AMBISONIC:
      this._foaConvolver.enable();
      this._bypass.disconnect();
      break;
    case RenderingMode.BYPASS:
      this._foaConvolver.disable();
      this._bypass.connect(this.output);
      break;
    case RenderingMode.OFF:
      this._foaConvolver.disable();
      this._bypass.disconnect();
      break;
    default:
      Utils.log(
          'FOARenderer: Rendering mode "' + mode + '" is not ' +
          'supported.');
      return;
  }

  this._config.renderingMode = mode;
  Utils.log('FOARenderer: Rendering mode changed. (' + mode + ')');
};


module.exports = FOARenderer;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Omnitone HOA decoder.
 */



const BufferList = __webpack_require__(1);
const HOAConvolver = __webpack_require__(9);
const HOARotator = __webpack_require__(10);
const HRIRManager = __webpack_require__(8);
const Utils = __webpack_require__(0);


/**
 * @typedef {string} RenderingMode
 */

/**
 * Rendering mode ENUM.
 * @enum {RenderingMode}
 */
const RenderingMode = {
  /** @type {string} Use ambisonic rendering. */
  AMBISONIC: 'ambisonic',
  /** @type {string} Bypass. No ambisonic rendering. */
  BYPASS: 'bypass',
  /** @type {string} Disable audio output. */
  OFF: 'off',
};


// Currently SOA and TOA are only supported.
const SupportedAmbisonicOrder = [2, 3];


/**
 * Omnitone HOA renderer class. Uses the optimized convolution technique.
 * @constructor
 * @param {AudioContext} context - Associated AudioContext.
 * @param {Object} config
 * @param {Number} [config.ambisonicOrder=3] - Ambisonic order.
 * @param {Array} [config.hrirPathList] - A list of paths to HRIR files. It
 * overrides the internal HRIR list if given.
 * @param {RenderingMode} [config.renderingMode='ambisonic'] - Rendering mode.
 */
function HOARenderer(context, config) {
  this._context = Utils.isAudioContext(context) ?
      context :
      Utils.throw('HOARenderer: Invalid BaseAudioContext.');

  this._config = {ambisonicOrder: 3, renderingMode: RenderingMode.AMBISONIC};

  if (config.ambisonicOrder) {
    if (SupportedAmbisonicOrder.includes(config.ambisonicOrder)) {
      this._config.ambisonicOrder = config.ambisonicOrder;
    } else {
      Utils.log(
          'HOARenderer: Invalid ambisonic order. (got ' +
          config.ambisonicOrder + ') Fallbacks to 3rd-order ambisonic.');
    }
  }

  this._config.numberOfChannels =
      (this._config.ambisonicOrder + 1) * (this._config.ambisonicOrder + 1);
  this._config.numberOfStereoChannels =
      Math.ceil(this._config.numberOfChannels / 2);

  if (config.hrirPathList) {
    if (Array.isArray(config.hrirPathList) &&
        config.hrirPathList.length === this._config.numberOfStereoChannels) {
      this._config.pathList = config.hrirPathList;
    } else {
      Utils.throw(
          'HOARenderer: Invalid HRIR URLs. It must be an array with ' +
          this._config.numberOfStereoChannels + ' URLs to HRIR files.' +
          ' (got ' + config.hrirPathList + ')');
    }
  } else {
    // By default, the path list points to GitHub CDN with HOA files.
    // TODO(hoch): update this to Gstatic server when it's available.
    this._config.pathList =
        HRIRManager.getPathList({ambisonicOrder: this._config.ambisonicOrder});
  }

  if (config.renderingMode) {
    if (Object.values(RenderingMode).includes(config.renderingMode)) {
      this._config.renderingMode = config.renderingMode;
    } else {
      Utils.log(
          'HOARenderer: Invalid rendering mode. (got ' + config.renderingMode +
          ') Fallbacks to "ambisonic".');
    }
  }

  this._buildAudioGraph();

  this._isRendererReady = false;
}


/**
 * Builds the internal audio graph.
 * @private
 */
HOARenderer.prototype._buildAudioGraph = function() {
  this.input = this._context.createGain();
  this.output = this._context.createGain();
  this._bypass = this._context.createGain();
  this._hoaRotator = new HOARotator(this._context, this._config.ambisonicOrder);
  this._hoaConvolver =
      new HOAConvolver(this._context, this._config.ambisonicOrder);
  this.input.connect(this._hoaRotator.input);
  this.input.connect(this._bypass);
  this._hoaRotator.output.connect(this._hoaConvolver.input);
  this._hoaConvolver.output.connect(this.output);
};


/**
 * Internal callback handler for |initialize| method.
 * @private
 * @param {function} resolve - Resolution handler.
 * @param {function} reject - Rejection handler.
 */
HOARenderer.prototype._initializeCallback = function(resolve, reject) {
  let bufferLoaderData = [];
  for (let i = 0; i < this._config.pathList.length; ++i) {
    bufferLoaderData.push({name: i, url: this._config.pathList[i]});
  }

  const bufferList = new BufferList(this._context, this._config.pathList);
  bufferList.load().then(
      function(hrirBufferList) {
        this._hoaConvolver.setHRIRBufferList(hrirBufferList);
        this.setRenderingMode(this._config.renderingMode);
        this._isRendererReady = true;
        Utils.log('HOARenderer: HRIRs loaded successfully. Ready.');
        resolve();
      }.bind(this),
      function() {
        const errorMessage = 'HOARenderer: HRIR loading/decoding failed.';
        Utils.throw(errorMessage);
        reject(errorMessage);
      });
};


/**
 * Initializes and loads the resource for the renderer.
 * @return {Promise}
 */
HOARenderer.prototype.initialize = function() {
  Utils.log(
      'HOARenderer: Initializing... (mode: ' + this._config.renderingMode +
      ', ambisonic order: ' + this._config.ambisonicOrder + ')');

  return new Promise(this._initializeCallback.bind(this), function(error) {
    Utils.throw('HOARenderer: Initialization failed. (' + error + ')');
  });
};


/**
 * Updates the rotation matrix with 3x3 matrix.
 * @param {Number[]} rotationMatrix3 - A 3x3 rotation matrix. (column-major)
 */
HOARenderer.prototype.setRotationMatrix3 = function(rotationMatrix3) {
  if (!this._isRendererReady) {
    return;
  }

  this._hoaRotator.setRotationMatrix3(rotationMatrix3);
};


/**
 * Updates the rotation matrix with 4x4 matrix.
 * @param {Number[]} rotationMatrix4 - A 4x4 rotation matrix. (column-major)
 */
HOARenderer.prototype.setRotationMatrix4 = function(rotationMatrix4) {
  if (!this._isRendererReady) {
    return;
  }

  this._hoaRotator.setRotationMatrix4(rotationMatrix4);
};


/**
 * Set the decoding mode.
 * @param {RenderingMode} mode - Decoding mode.
 *  - 'ambisonic': activates the ambisonic decoding/binaurl rendering.
 *  - 'bypass': bypasses the input stream directly to the output. No ambisonic
 *    decoding or encoding.
 *  - 'off': all the processing off saving the CPU power.
 */
HOARenderer.prototype.setRenderingMode = function(mode) {
  if (mode === this._config.renderingMode) {
    return;
  }

  switch (mode) {
    case RenderingMode.AMBISONIC:
      this._hoaConvolver.enable();
      this._bypass.disconnect();
      break;
    case RenderingMode.BYPASS:
      this._hoaConvolver.disable();
      this._bypass.connect(this.output);
      break;
    case RenderingMode.OFF:
      this._hoaConvolver.disable();
      this._bypass.disconnect();
      break;
    default:
      Utils.log(
          'HOARenderer: Rendering mode "' + mode + '" is not ' +
          'supported.');
      return;
  }

  this._config.renderingMode = mode;
  Utils.log('HOARenderer: Rendering mode changed. (' + mode + ')');
};


module.exports = HOARenderer;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Cross-browser support polyfill for Omnitone library.
 */




/**
 * Detects browser type and version.
 * @return {string[]} - An array contains the detected browser name and version.
 */
exports.getBrowserInfo = function() {
  const ua = navigator.userAgent;
  let M = ua.match(
      /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) ||
      [];
  let tem;

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {name: 'IE', version: (tem[1] || '')};
  }

  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem != null) {
      return {name: 'Opera', version: tem[1]};
    }
  }

  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/([\d.]+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }

  let platform = ua.match(/android|ipad|iphone/i);
  if (!platform) {
    platform = ua.match(/cros|linux|mac os x|windows/i);
  }

  return {
    name: M[0],
    version: M[1],
    platform: platform ? platform[0] : 'unknown',
  };
};


/**
 * Patches AudioContext if the prefixed API is found.
 */
exports.patchSafari = function() {
  if (window.webkitAudioContext && window.webkitOfflineAudioContext) {
    window.AudioContext = window.webkitAudioContext;
    window.OfflineAudioContext = window.webkitOfflineAudioContext;
  }
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 * @file Omnitone version.
 */




/**
 * Omnitone library version
 * @type {String}
 */
module.exports = '1.0.1';


/***/ })
/******/ ]);
});