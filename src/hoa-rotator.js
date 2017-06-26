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
 * @fileOverview Sound field rotator for higher-order-ambisonics decoding.
 */


/**
 * @class Higher-order-ambisonic decoder based on gain node network.
 *        We expect the order of the channels to conform to ACN ordering.
 * @param {AudioContext} context    Associated AudioContext.
 * @param {Number} order            Ambisonic order (2 or 3).
 */
function HOARotator (context, order) {
  this._context = context;

  var num_channels = (order + 1) * (order + 1);
  this._splitter = this._context.createChannelSplitter(num_channels);
  this._merger = this._context.createChannelMerger(num_channels);

  // Create a set of per-order rotation matrices using gain nodes.
  this._m = Array(order);
  for (var l = 1; l <= order; l++) {
    var order_offset = l * l;
    var rows = (2 * l + 1);
    this._m[l - 1] = Array(rows * rows);

    for (var j = 0; j < rows; j++) {
      var input_index = order_offset + j;
      for (var k = 0; k < rows; k++) {
        var output_index = order_offset + k;
        var matrix_index = j * rows + k; // Row-wise indexing.

        this._m[l - 1][matrix_index] = this._context.createGain();
        this._splitter.connect(this._m[l - 1][matrix_index], input_index);
        this._m[l - 1][matrix_index].connect(this._merger, 0, output_index);
      }
    }
  }

  // W-channel requires not transform.
  this._splitter.connect(this._merger, 0, 0);

  // Default Identity matrix.
  this.setRotationMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);

  // Input/Output proxy.
  this.input = this._splitter;
  this.output = this._merger;
};

HOARotator.prototype._kroneckerDelta = function(i, j) {
  return (i == j ? 1 : 0);
};

HOARotator.prototype._computeUVWCoeff = function(m, n, l) {
  var recip_denom, u, v, w;

  var d = this._kroneckerDelta(m, 0);
  if (Math.abs(n) == l) {
    recip_denom = 1 / (2 * l * (2 * l - 1));
  } else {
    recip_denom = 1 / ((l + n) * (l - n));
  }

  u = Math.sqrt((l + m) * (l - m) * recip_denom);
  v = 0.5 * (1 - 2 * d) * Math.sqrt((1 + d) * (l + Math.abs(m) - 1) *
      (l + Math.abs(m)) * recip_denom);
  w = -0.5 * (1 - d) *
      Math.sqrt((l - Math.abs(m) - 1) * (l - Math.abs(m)) * recip_denom);
  return [u, v, w];
};

HOARotator.prototype._setCenteredElement = function (l, i, j, val) {
  var index = (j + l) * (2 * l + 1) + (i + l); // Row-wise indexing.
  this._m[l - 1][index].gain.value = val;
};

HOARotator.prototype._getCenteredElement = function (l, i, j) {
  var index = (j + l) * (2 * l + 1) + (i + l); // Row-wise indexing.
  return this._m[l - 1][index].gain.value;
};

HOARotator.prototype._P = function (i, a, b, l) {
  if (b == l) {
    return this._getCenteredElement(1, i, 1) *
             this._getCenteredElement(l - 1, a, l - 1) -
           this._getCenteredElement(1, i, -1) *
             this._getCenteredElement(l - 1, a, -l + 1);
  } else if (b == -l) {
    return this._getCenteredElement(1, i, 1) *
             this._getCenteredElement(l - 1, a, -l + 1) +
           this._getCenteredElement(1, i, -1) *
             this._getCenteredElement(l - 1, a, l - 1);
  } else {
    return this._getCenteredElement(1, i, 0) *
             this._getCenteredElement(l - 1, a, b);
  }
};

HOARotator.prototype._U = function (m, n, l) {
  return this._P(0, m, n, l);
};

HOARotator.prototype._V = function (m, n, l) {
  if (m == 0) {
    return this._P(1, 1, n, l) + this._P(-1, -1, n, l);
  } else if (m > 0) {
    var d = this._kroneckerDelta(m, 1);
    return this._P(1, m - 1, n, l) * Math.sqrt(1 + d) -
           this._P(-1, -m + 1, n, l) * (1 - d);
  } else {
    var d = this._kroneckerDelta(m, -1);
    return this._P(1, m + 1, n, l) * (1 - d) +
           this._P(-1, -m - 1, n, l) * Math.sqrt(1 + d);
  }
};

HOARotator.prototype._W = function (m, n, l) {
  if (m == 0) {
    return 0;
  } else if (m > 0) {
    return this._P(1, m + 1, n, l) + this._P(-1, -m - 1, n, l);
  } else {
    return this._P(1, m - 1, n, l) - this._P(-1, -m + 1, n, l);
  }
};

HOARotator.prototype._computeBandRotation = function (l) {
  for (var m = -l; m <= l; m++) {
    for (var n = -l; n <= l; n++) {
      var uvw = this._computeUVWCoeff(m, n, l);

      if (Math.abs(uvw[0]) > 0) {
        uvw[0] *= this._U(m, n, l);
      }
      if (Math.abs(uvw[1]) > 0) {
        uvw[1] *= this._V(m, n, l);
      }
      if (Math.abs(uvw[2]) > 0) {
        uvw[2] *= this._W(m, n, l);
      }

      this._setCenteredElement(l, m, n, uvw[0] + uvw[1] + uvw[2]);
    }
  }
};

HOARotator.prototype._computeHOAMatrices = function () {
  // We start by computing the 2nd-order matrix from the 1st-order matrix.
  for (var l = 2; l <= this._m.length; l++) {
    this._computeBandRotation(l);
  }
};

/**
 * Set 3x3 matrix for soundfield rotation. (gl-matrix.js style)
 * @param {Array} rotationMatrix    A 3x3 matrix of soundfield rotation. The
 *                                  matrix is in the row-major representation.
 */
HOARotator.prototype.setRotationMatrix = function (rotationMatrix) {
  for (var i = 0; i < 9; i++) {
    this._m[0][i].gain.value = rotationMatrix[i];
  }
  this._computeHOAMatrices();
};

/**
 * Set 4x4 matrix for soundfield rotation. (Three.js style)
 * @param {Array} rotationMatrix4   A 4x4 matrix of soundfield rotation.
 */
HOARotator.prototype.setRotationMatrix4 = function (rotationMatrix4) {
  for (var i = 0; i < 12; i = i + 4) {
    this._m[0][i].gain.value = rotationMatrix4[i];
    this._m[0][i + 1].gain.value = rotationMatrix4[i + 1];
    this._m[0][i + 2].gain.value = rotationMatrix4[i + 2];
  }
  this._computeHOAMatrices();
};

/**
 * Returns the current rotation matrix.
 * @return {Array}                  A 3x3 matrix of soundfield rotation. The
 *                                  matrix is in the row-major representation.
 */
HOARotator.prototype.getRotationMatrix = function () {
  var rotationMatrix = Float32Array(9);
  for (var i = 0; i < 9; i++) {
    rotationMatrix[i] = this._m[0][i].gain.value;
  }
  return rotationMatrix;
};

HOARotator.prototype.testMultiply = function (input) {
  var output = new Float32Array(input.length);
  var order = Math.round(Math.sqrt(input.length)) - 1;
  output[0] = 1;
  for (var l = 1; l <= order; l++) {
    var order_offset = l * l;
    for (var m = -l; m <= l; m++) {
      var acn_index = l * l + l + m;
      var row_length = 2 * l + 1;
      for (var i = 0; i < row_length; i++) {
        var col = m + l;
        var matrix_index = col * row_length + i;
        output[order_offset + i] +=
          this._m[l - 1][matrix_index].gain.value * input[acn_index];
      }
    }
  }
  console.log(output);
}

module.exports = HOARotator;
