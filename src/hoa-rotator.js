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

// Utility functions for rotation matrix computation.

/**
 * Kronecker Delta function.
 * @param {Number} i
 * @param {Number} j
 * @return {Number}
 */
function kroneckerDelta(i, j) {
  return (i == j ? 1 : 0);
};

// [2] uses an odd convention of referring to the rows and columns using
// centered indices, so the middle row and column are (0, 0) and the upper
// left would have negative coordinates.

/**
 * This is a convenience function to allow us to access a matrix array
 * in the same manner, assuming it is a (2l+1)x(2l+1) matrix.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} l
 * @param {Number} i
 * @param {Number} j
 * @param {Number} val
 */
function setCenteredElement(matrix, l, i, j, val) {
  var index = (j + l) * (2 * l + 1) + (i + l); // Row-wise indexing.
  matrix[l - 1][index].gain.value = val;
};

/**
 * This is a convenience function to allow us to access a matrix array
 * in the same manner, assuming it is a (2l+1)x(2l+1) matrix.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} l
 * @param {Number} i
 * @param {Number} j
 */
function getCenteredElement(matrix, l, i, j) {
  var index = (j + l) * (2 * l + 1) + (i + l); // Row-wise indexing.
  return matrix[l - 1][index].gain.value;
};

/**
 * Helper function defined in [2] that is used by the functions U, V, W.
 * This should not be called on its own, as U, V, and W (and their coefficients)
 * select the appropriate matrix elements to access arguments |a| and |b|.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} i
 * @param {Number} a
 * @param {Number} b
 * @param {Number} l
 */
function P(matrix, i, a, b, l) {
  if (b == l) {
    return getCenteredElement(matrix, 1, i, 1) *
      getCenteredElement(matrix, l - 1, a, l - 1) -
      getCenteredElement(matrix, 1, i, -1) *
      getCenteredElement(matrix, l - 1, a, -l + 1);
  } else if (b == -l) {
    return getCenteredElement(matrix, 1, i, 1) *
      getCenteredElement(matrix, l - 1, a, -l + 1) +
      getCenteredElement(matrix, 1, i, -1) *
      getCenteredElement(matrix, l - 1, a, l - 1);
  } else {
    return getCenteredElement(matrix, 1, i, 0) *
      getCenteredElement(matrix, l - 1, a, b);
  }
};

/**
 * The functions U, V, and W should only be called if the correspondingly
 * named coefficient u, v, w from the function ComputeUVWCoeff() is non-zero.
 * When the coefficient is 0, these would attempt to access matrix elements that
 * are out of bounds. The vector of rotations, |r|, must have the |l - 1|
 * previously completed band rotations. These functions are valid for |l >= 2|.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 */
function U(matrix, m, n, l) {
  /**
   * Although [1, 2] split U into three cases for m == 0, m < 0, m > 0
   * the actual values are the same for all three cases.
   */
  return P(matrix, 0, m, n, l);
};

/**
 * The functions U, V, and W should only be called if the correspondingly
 * named coefficient u, v, w from the function ComputeUVWCoeff() is non-zero.
 * When the coefficient is 0, these would attempt to access matrix elements that
 * are out of bounds. The vector of rotations, |r|, must have the |l - 1|
 * previously completed band rotations. These functions are valid for |l >= 2|.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 */
function V(matrix, m, n, l) {
  if (m == 0) {
    return P(matrix, 1, 1, n, l) + P(matrix, -1, -1, n, l);
  } else if (m > 0) {
    var d = kroneckerDelta(m, 1);
    return P(matrix, 1, m - 1, n, l) * Math.sqrt(1 + d) -
      P(matrix, -1, -m + 1, n, l) * (1 - d);
  } else {
    // Note there is apparent errata in [1,2,2b] dealing with this particular
    // case. [2b] writes it should be P*(1-d)+P*(1-d)^0.5
    // [1] writes it as P*(1+d)+P*(1-d)^0.5, but going through the math by hand,
    // you must have it as P*(1-d)+P*(1+d)^0.5 to form a 2^.5 term, which
    // parallels the case where m > 0.
    var d = kroneckerDelta(m, -1);
    return P(matrix, 1, m + 1, n, l) * (1 - d) + P(matrix, -1, -m - 1, n, l) *
      Math.sqrt(1 + d);
  }
};

/**
 * The functions U, V, and W should only be called if the correspondingly
 * named coefficient u, v, w from the function ComputeUVWCoeff() is non-zero.
 * When the coefficient is 0, these would attempt to access matrix elements that
 * are out of bounds. The vector of rotations, |r|, must have the |l - 1|
 * previously completed band rotations. These functions are valid for |l >= 2|.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 */
function W (matrix, m, n, l) {
  if (m == 0) {
    // Whenever this happens, w is also 0 so W can be anything.
    return 0;
  } else if (m > 0) {
    return P(matrix, 1, m + 1, n, l) + P(matrix, -1, -m - 1, n, l);
  } else {
    return P(matrix, 1, m - 1, n, l) - P(matrix, -1, -m + 1, n, l);
  }
};

/**
 * Calculates the coefficients applied to the U, V, and W functions. Because
 * their equations share many common terms they are computed simultaneously.
 * @param {Number} m
 * @param {Number} n
 * @param {Number} l
 */
function computeUVWCoeff(m, n, l) {
  var reciprocalDenominator;

  var d = kroneckerDelta(m, 0);
  if (Math.abs(n) == l) {
    reciprocalDenominator = 1 / (2 * l * (2 * l - 1));
  } else {
    reciprocalDenominator = 1 / ((l + n) * (l - n));
  }

  return [
    Math.sqrt((l + m) * (l - m) * reciprocalDenominator),
    0.5 * (1 - 2 * d) * Math.sqrt((1 + d) * (l + Math.abs(m) - 1) *
      (l + Math.abs(m)) * reciprocalDenominator),
    -0.5 * (1 - d) * Math.sqrt((l - Math.abs(m) - 1) * (l - Math.abs(m))) *
      reciprocalDenominator
  ];
};

/**
 * Calculates the (2l+1)x(2l+1) rotation matrix for the band l.
 * This uses the matrices computed for band 1 and band l-1 to compute the
 * matrix for band l. |rotations| must contain the previously computed l-1
 * rotation matrices.
 *
 * This implementation comes from p. 5 (6346), Table 1 and 2 in [2] taking
 * into account the corrections from [2b].
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 * @param {Number} l
 */
function computeBandRotation (matrix, l) {
  // The lth band rotation matrix has rows and columns equal to the number of
  // coefficients within that band (-l <= m <= l implies 2l + 1 coefficients).
  for (var m = -l; m <= l; m++) {
    for (var n = -l; n <= l; n++) {
      var uvw = computeUVWCoeff(m, n, l);

      // The functions U, V, W are only safe to call if the coefficients
      // u, v, w are not zero.
      if (Math.abs(uvw[0]) > 0) {
        uvw[0] *= U(matrix, m, n, l);
      }
      if (Math.abs(uvw[1]) > 0) {
        uvw[1] *= V(matrix, m, n, l);
      }
      if (Math.abs(uvw[2]) > 0) {
        uvw[2] *= W(matrix, m, n, l);
      }
      setCenteredElement(matrix, l, m, n, uvw[0] + uvw[1] + uvw[2]);
    }
  }
};

/**
 * Compute the HOA rotation matrix after setting the transform matrix.
 * @param {Array} matrix               N matrices of gainNodes, each with
 *                                     (2n+1)x(2n+1) elements,
 *                                     where n=1,2,...,N.
 */
function computeHOAMatrices (matrix) {
  // We start by computing the 2nd-order matrix from the 1st-order matrix.
  for (var i = 2; i <= matrix.length; i++) {
    computeBandRotation(matrix, i);
  }
};

/**
 * @class Higher-order-ambisonic decoder based on gain node network.
 *        We expect the order of the channels to conform to ACN ordering.
 *        Below are the helper methods to compute SH rotation using recursion.
 *        The code uses maths described in the following papers:
 *
 *        [1]  R. Green, "Spherical Harmonic Lighting: The Gritty Details",
 *             GDC 2003,
 *          http://www.research.scea.com/gdc2003/spherical-harmonic-lighting.pdf
 *        [2]  J. Ivanic and K. Ruedenberg, "Rotation Matrices for Real
 *             Spherical Harmonics. Direct Determination by Recursion", J. Phys.
 *             Chem., vol. 100, no. 15, pp. 6342-6347, 1996.
 *             http://pubs.acs.org/doi/pdf/10.1021/jp953350u
 *        [2b] Corrections to initial publication:
 *             http://pubs.acs.org/doi/pdf/10.1021/jp9833350
 * @param {AudioContext} context    Associated AudioContext.
 * @param {Number} ambisonicOrder   Ambisonic order (2 or 3).
 */
function HOARotator(context, ambisonicOrder) {
  this._context = context;

  // We need to determine the number of channels K based on the ambisonic
  // order N where K = (N + 1)^2
  var numChannels = (ambisonicOrder + 1) * (ambisonicOrder + 1);

  this._splitter = this._context.createChannelSplitter(numChannels);
  this._merger = this._context.createChannelMerger(numChannels);

  // Create a set of per-order rotation matrices using gain nodes.
  this._matrix = [];
  for (var i = 1; i <= ambisonicOrder; i++) {
    // Each ambisonic order requires a separate (2l + 1) x (2l + 1) rotation
    // matrix. We compute the offset value as the first channel index of the
    // current order where
    //   k_last = l^2 + l + m,
    // and let m = -l
    //   k_last = l^2
    var orderOffset = i * i;
    var rows = (2 * i + 1);

    this._matrix[i - 1] = [];
    for (var j = 0; j < rows; j++) {
      var inputIndex = orderOffset + j;
      for (var k = 0; k < rows; k++) {
        var outputIndex = orderOffset + k;
        var matrixIndex = j * rows + k; // Row-wise indexing.

        this._matrix[i - 1][matrixIndex] = this._context.createGain();
        this._splitter.connect(this._matrix[i - 1][matrixIndex], inputIndex);
        this._matrix[i - 1][matrixIndex].connect(this._merger, 0, outputIndex);
      }
    }
  }

  // W-channel is not involved in rotation, skip straight to ouput.
  this._splitter.connect(this._merger, 0, 0);

  // Default Identity matrix.
  this.setRotationMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);

  // Input/Output proxy.
  this.input = this._splitter;
  this.output = this._merger;
};

/**
 * Set 3x3 matrix for soundfield rotation. (gl-matrix.js style)
 * @param {Array} rotationMatrix    A 3x3 matrix of soundfield rotation. The
 *                                  matrix is in the row-major representation.
 */
HOARotator.prototype.setRotationMatrix = function (rotationMatrix) {
  for (var i = 0; i < 9; i++) {
    this._matrix[0][i].gain.value = rotationMatrix[i];
  }
  computeHOAMatrices(this._matrix);
};

/**
 * Set 4x4 matrix for soundfield rotation. (Three.js style)
 * @param {Array} rotationMatrix4   A 4x4 matrix of soundfield rotation.
 */
HOARotator.prototype.setRotationMatrix4 = function (rotationMatrix4) {
  for (var i = 0; i < 12; i = i + 4) {
    this._matrix[0][i].gain.value = rotationMatrix4[i];
    this._matrix[0][i + 1].gain.value = rotationMatrix4[i + 1];
    this._matrix[0][i + 2].gain.value = rotationMatrix4[i + 2];
  }
  computeHOAMatrices(this._matrix);
};

/**
 * Returns the current rotation matrix.
 * @return {Array}                  A 3x3 matrix of soundfield rotation. The
 *                                  matrix is in the row-major representation.
 */
HOARotator.prototype.getRotationMatrix = function () {
  var rotationMatrix = Float32Array(9);
  for (var i = 0; i < 9; i++) {
    rotationMatrix[i] = this._matrix[0][i].gain.value;
  }
  return rotationMatrix;
};

module.exports = HOARotator;
