/**
 * @license
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


import Utils from './utils.js';

/**
 * @typedef {string} BufferDataType
 */

/**
 * Buffer data type for ENUM.
 * @enum {BufferDataType}
 */
const BufferDataType = {
  /** @type {string} The data contains Base64-encoded string.. */
  BASE64: 'base64',
  /** @type {string} The data is a URL for audio file. */
  URL: 'url',
};


/**
 * BufferList object mananges the async loading/decoding of multiple
 * AudioBuffers from multiple URLs.
 * @constructor
 * @param {BaseAudioContext} context - Associated BaseAudioContext.
 * @param {string[]} bufferData - An ordered list of URLs.
 * @param {Object} options - Options
 * @param {string} [options.dataType='base64'] - BufferDataType specifier.
 * @param {Boolean} [options.verbose=false] - Log verbosity. |true| prints the
 * individual message from each URL and AudioBuffer.
 */
function BufferList(context, bufferData, options) {
  this._context = Utils.isAudioContext(context) ?
      context :
      Utils.throw('BufferList: Invalid BaseAudioContext.');

  this._options = {
    dataType: BufferDataType.BASE64,
    verbose: false,
  };

  if (options) {
    if (options.dataType &&
        Utils.isDefinedENUMEntry(BufferDataType, options.dataType)) {
      this._options.dataType = options.dataType;
    }
    if (options.verbose) {
      this._options.verbose = Boolean(options.verbose);
    }
  }

  this._bufferList = [];
  this._bufferData = this._options.dataType === BufferDataType.BASE64
      ? bufferData
      : bufferData.slice(0);
}


/**
 * Starts AudioBuffer loading tasks.
 * @return {Promise<AudioBuffer[]>} The promise resolves with an array of
 * AudioBuffer.
 */
BufferList.prototype.load = function() {
  const tasks = this._bufferData.map((_, i) =>
      this._options.dataType === BufferDataType.BASE64
          ? this._launchAsyncLoadTask(i)
          : this._launchAsyncLoadTaskXHR(i));

  return Promise.all(tasks).then((buffers) => {
    this._bufferList = buffers;
    const messageString = this._options.dataType === BufferDataType.BASE64
        ? this._bufferData.length + ' AudioBuffers from Base64-encoded HRIRs'
        : this._bufferData.length + ' files via XHR';
    Utils.log('BufferList: ' + messageString + ' loaded successfully.');
    return buffers;
  });
};


/**
 * Run async loading task for Base64-encoded string.
 * @private
 * @param {Number} taskId Task ID number from the ordered list |bufferData|.
 * @return {Promise<AudioBuffer>}
 */
BufferList.prototype._launchAsyncLoadTask = function(taskId) {
  return new Promise((resolve, reject) => {
    let arrayBuffer;
    try {
      arrayBuffer =
          Utils.getArrayBufferFromBase64String(this._bufferData[taskId]);
    } catch (err) {
      reject(new Error('BufferList: invalid Base64 at index ' + taskId));
      return;
    }

    this._context.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          if (this._options.verbose) {
            Utils.log('BufferList: ArrayBuffer(' + taskId +
                ') from Base64-encoded HRIR successfully loaded.');
          }
          resolve(audioBuffer);
        },
        (errorMessage) => {
          const message = 'BufferList: decoding ArrayBuffer("' + taskId +
              '" from Base64-encoded data) failed. (' + errorMessage + ')';
          Utils.log(message);
          reject(new Error(message));
        });
  });
};


/**
 * Run async loading task via XHR for audio file URLs.
 * @private
 * @param {Number} taskId Task ID number from the ordered list |bufferData|.
 * @return {Promise<AudioBuffer>}
 */
BufferList.prototype._launchAsyncLoadTaskXHR = function(taskId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this._bufferData[taskId]);
    xhr.responseType = 'arraybuffer';

    xhr.onload = () => {
      if (xhr.status === 200) {
        this._context.decodeAudioData(
            xhr.response,
            (audioBuffer) => {
              if (this._options.verbose) {
                Utils.log('BufferList: "' + this._bufferData[taskId] +
                    '" successfully loaded.');
              }
              resolve(audioBuffer);
            },
            (errorMessage) => {
              const message = 'BufferList: decoding "' +
                  this._bufferData[taskId] + '" failed. (' + errorMessage + ')';
              Utils.log(message);
              reject(new Error(message));
            });
      } else {
        const message = 'BufferList: XHR error while loading "' +
            this._bufferData[taskId] + '". (' + xhr.status + ' ' +
            xhr.statusText + ')';
        Utils.log(message);
        reject(new Error(message));
      }
    };

    xhr.onerror = () => {
      const message = 'BufferList: XHR network failed on loading "' +
          this._bufferData[taskId] + '".';
      Utils.log(message);
      reject(new Error(message));
    };

    xhr.send();
  });
};


export default BufferList;
