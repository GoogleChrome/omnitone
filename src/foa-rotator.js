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

'use strict';


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
