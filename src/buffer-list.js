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


'use strict';

var Utils = require('./utils.js');


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

  this._options = { verbose: false };
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
  if (typeof resolve !== 'function')
    Utils.throw('BufferList: Invalid Promise resolver.');
  else
    this._resolveHandler = resolve;

  if (typeof reject === 'function')
    this._rejectHandler = reject;

  for (var i = 0; i < this._bufferData.length; ++i)
    this._launchAsyncLoadTask(i);
};


/**
 * Individual async loading task.
 * @private
 * @param {Number} taskId Task ID number from |BufferData|.
 */
BufferList.prototype._launchAsyncLoadTask = function(taskId) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', this._bufferData[taskId]);
  xhr.responseType = 'arraybuffer';

  var that = this;
  xhr.onload = function() {
    if (xhr.status === 200) {
      that._context.decodeAudioData(
          xhr.response,
          function(audioBuffer) {
            that._updateProgress(taskId, audioBuffer);
          },
          function(errorMessage) {
            that._updateProgress(taskId, null);
            var message = 'BufferList: decoding "' + that._bufferData[taskId] +
                '" failed. (' + errorMessage + ')';
            Utils.throw(message);
            that._rejectHandler(message);
          });
    } else {
      var message = 'BufferList: XHR error while loading "' +
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
