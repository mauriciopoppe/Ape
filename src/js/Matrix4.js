var assert = require('assert');
var Vector3 = require('./Vector3');
var _ = require('lodash');
var Constants = require('./Constants');

var Identity = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0
];

/**
 * Matrix4 represents a 12 component structure (a 4x4 matrix is represented
 * by a 16 component structure however since the last row is always `[0 0 0 1]`,
 * inside the physics engine a 4x4 matrix is represented as a 3x4 matrix)
 * Typically instances of this class hold a transform matrix
 * consisting of a rotation matrix and a position
 *
 * <hr>
 *
 * Matrix4 representa una estructura de 12 componentes (una matriz de 4x4
 * es representada por una estructura de 16 componenentes sin embargo debido a que
 * la ultima fila siempre tiene los valores `[0 0 0 1]`, dentro del motor de
 * simulacion la matriz de 4x4 sera representada como una matriz de 3x4)
 * Tipicamente las instancias de esta clase contienen una matriz de
 * transformacion consistente de una matriz de rotacion y una posicion
 *
 * @class Matrix4
 */
function Matrix4() {
  /**
   * Holds 12 real values
   * It's assumed that the remaining row has (0, 0, 0, 1)
   * so it's not noted here
   * @type {Array}
   */
  this.data = [];

  this.set.apply(this, Array.prototype.slice.call(arguments));
}

Matrix4.prototype = {
  constructor: Matrix4,

  /**
   * Checks if this matrix is equal to another matrix
   * @param {Matrix4} m
   * @returns {boolean}
   */
  equals: function (m) {
    var me = this,
      ok = true,
      i;
    for (i = -1; ok && ++i < 9;) {
      ok = ok && Math.abs(me.data[i] - m.data[i]) < Constants.EPS;
    }
    return ok;
  },

  /**
   * Creates a new instance of Matrix4 with the components of `this`
   *
   *      var m = new Matrix4();
   *      var mClone = m.clone();         // mClone has the same components
   *
   * @returns {Matrix4}
   */
  clone: function () {
    var d = this.data;
    return new Matrix4(
      d[0], d[1], d[2], d[3],
      d[4], d[5], d[6], d[7],
      d[8], d[9], d[10], d[11]
    );
  },

  /**
   * Updates the components of this Matrix4
   *
   *       var m = new Matrix4();
   *       // the matrix has the form:
   *       // 1 0 0 0
   *       // 0 1 0 0
   *       // 0 0 1 0
   *       m.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
   *       // the matrix has the form:
   *       // 1  2  3  4
   *       // 5  6  7  8
   *       // 9 10 11 12
   *
   * @param {number} m11
   * @param {number} m12
   * @param {number} m13
   * @param {number} m14
   * @param {number} m21
   * @param {number} m22
   * @param {number} m23
   * @param {number} m24
   * @param {number} m31
   * @param {number} m32
   * @param {number} m33
   * @param {number} m34
   * @chainable
   */
  set: function (m11, m12, m13, m14, m21, m22, m23, m24,
                 m31, m32, m33, m34) {
    var d = this.data,
      i;
    d[0] = m11; d[1] = m12; d[2] = m13; d[3] = m14;
    d[4] = m21; d[5] = m22; d[6] = m23; d[7] = m24;
    d[8] = m31; d[9] = m32; d[10] = m33; d[11] = m34;

    // fix undefined values
    for (i = -1; ++i < 12;) {
      d[i] = isNaN(d[i]) ? Identity[i] : d[i];
    }

    return this;
  },

  /**
   * Multiplies two Matrix4 instances
   * @param {Matrix4} m2
   * @returns {Matrix4}
   */
  multiply: function (m2) {
    assert(m2 instanceof Matrix4);
    var d1 = this.data;
    var d2 = m2.data;

    return new Matrix4(
      d1[0] * d2[0] + d1[1] * d2[4] + d1[2] * d2[8],
      d1[0] * d2[1] + d1[1] * d2[5] + d1[2] * d2[9],
      d1[0] * d2[2] + d1[1] * d2[6] + d1[2] * d2[10],
      d1[0] * d2[3] + d1[1] * d2[7] + d1[2] * d2[11] + d1[3],

      d1[4] * d2[0] + d1[5] * d2[4] + d1[6] * d2[8],
      d1[4] * d2[1] + d1[5] * d2[5] + d1[6] * d2[9],
      d1[4] * d2[2] + d1[5] * d2[6] + d1[6] * d2[10],
      d1[4] * d2[3] + d1[5] * d2[7] + d1[6] * d2[11] + d1[7],

      d1[8] * d2[0] + d1[9] * d2[4] + d1[10] * d2[8],
      d1[8] * d2[1] + d1[9] * d2[5] + d1[10] * d2[9],
      d1[8] * d2[2] + d1[9] * d2[6] + d1[10] * d2[10],
      d1[8] * d2[3] + d1[9] * d2[7] + d1[10] * d2[11] + d1[11]
    );
  },

  /**
   * Transforms the given vector by this matrix
   * @param v
   */
  multiplyVector: function (v) {
    var data = this.data;
    return new Vector3(
      v.x * data[0] + v.y * data[1] + v.z * data[2] + data[3],
      v.x * data[4] + v.y * data[5] + v.z * data[6] + data[7],
      v.x * data[8] + v.y * data[9] + v.z * data[10] + data[11]
    );
  },

  /**
   * Transforms the given vector by this matrix
   * @param v
   * @returns {Vector3}
   */
  transform: function (v) {
    return this.multiplyVector(v);
  },

  /**
   * Transforms the given vector by the transformational inverse
   * of this matrix
   *
   * @param v
   * @returns {Vector3}
   */
  transformInverse: function (v) {
    var t = v.clone(),
      d = this.data;
    t.x -= d[3];
    t.y -= d[7];
    t.z -= d[11];
    return new Vector3(
      t.x * d[0] + t.y * d[4] + t.z * d[8],
      t.x * d[1] + t.y * d[5] + t.z * d[9],
      t.x * d[2] + t.y * d[6] + t.z * d[10]
    );
  },

  /**
   * Returns a vector representing one axis (a column) in the matrix
   * @param {number} j The column to return
   * @returns {Vector3}
   */
  getAxisVector: function (j) {
    assert(j >= 0 && j < 3);
    return new Vector3(
      this.data[j],
      this.data[j + 4],
      this.data[j + 8]
    );
  },

  /**
   * Calculates the determinant of this matrix4, even if it's not
   * a square matrix and because of the fact that the last row of this matrix is
   * [0, 0, 0, 1] we can easily determine the determinant by taking this row and
   * calculating the determinant of the 3x3 matrix that results after applying
   * the pattern:
   *
   *  det(      = det(
   *   a b c d        a b c
   *   e f g h        e f g
   *   i j k 1        i j k
   *   0 0 0 1      )
   *  )
   *
   *  Det(A) = a (f * k - g * j) -
   *    b (e * k - g * i) +
   *    c (e * j - f * i)
   *
   *  indexes:
   *
   *   0 1 2 3
   *   4 5 6 7
   *   8 91011
   *  12131415
   *
   * @returns {number}
   */
  getDeterminant: function () {
    var d = this.data;
    return d[0] * (d[5] * d[10] - d[6] * d[9]) -
      d[1] * (d[4] * d[10] - d[6] * d[8]) +
      d[2] * (d[4] * d[9] - d[5] * d[8]);
  },
  /**
   * Inverts the matrix `m` and sets the result of the inversion in
   * this matrix
   *
   *      var m = new Matrix4();
   *      var mI = new Matrix4();
   *      mI.setInverse(m);       // mI now holds the inverse of m
   *
   * Taken from http://www.cg.info.hiroshima-cu.ac.jp/~miyazaki/knowledge/teche23.html
   *
   * det(A) = A.getDeterminant()
   *
   * A^-1 = 1 / det *
   *  [b11 b12 b13 b14
   *   b21 b22 b23 b24
   *   b31 b32 b33 b34
   *   b41 b42 b43 b44]
   *
   *  indexes:
   *
   *   0 1 2 3  a11 a12 a13 a14
   *   4 5 6 7  a21 a22 a23 a24
   *   8 91011  a31 a32 a33 a34
   *  12131415  a41 a42 a43 a44
   *
   * b11 =  5 10 15 +  6 11 13 +  7  9 14 -  5 11 14 -  6  9 15 -  7 10 13
   * b12 =  1 11 14 +  2  9 15 +  3 10 13 -  1 10 15 -  2 11 13 -  3  9 14
   * b13 =  1  6 15 +  2  7 13 +  3  5 14 -  1  7 14 -  2  5 15 -  3  6 13
   * b13 =  1  7 10 +  2  5 11 +  3  6  9 -  1  6 11 -  2  7  9 -  3  5 10
   *
   * b21 =  4 11 14 +  6  8 15 +  7 10 12 -  4 10 15 -  6 11 12 -  7  8 14
   * b22 =  0 10 15 +  2 11 12 +  3  8 14 -  0 11 14 -  2  8 15 -  3 10 12
   * b23 =  0  7 14 +  2  4 15 +  3  6 12 -  0  6 15 -  2  7 12 -  3  4 14
   * b24 =  0  6 11 +  2  7  8 +  3  4 10 -  0  7 10 -  2  4 11 -  3  6  8
   *
   * b31 =  4  9 15 +  5 11 12 +  7  8 13 -  4 11 13 -  5  8 15 -  7  9 12
   * b32 =  0 11 13 +  1  8 15 +  3  9 12 -  0  9 15 -  1 11 12 -  3  8 13
   * b33 =  0  5 15 +  1  7 12 +  3  4 13 -  0  7 13 -  1  4 15 -  3  5 12
   * b34 =  0  7  9 +  1  4 11 +  3  5  8 -  0  5 11 -  1  7  8 -  3  4  9
   *
   * b41 =  4 10 13 +  5  8 14 +  6  9 12 -  4  9 14 -  5 10 12 -  6  8 13
   * b42 =  0  9 14 +  1 10 12 +  2  8 13 -  0 10 13 -  1  8 14 -  2  9 12
   * b43 =  0  6 13 +  1  4 14 +  2  5 12 -  0  5 14 -  1  6 12 -  2  4 13
   * b44 =  0  5 10 +  1  6  8 +  2  4  9 -  0  6  9 -  1  4 10 -  2  5  8
   *
   * Since indexes 12, 13 and 14 are zeros:
   *
   * b11 =  5 10 (1) -  6  9 (1)
   * b12 =  2  9 (1) -  1 10 (1)
   * b13 =  1  6 (1) -  2  5 (1)
   * b14 =  1  7 10 +  2  5 11 +  3  6  9 -  1  6 11 -  2  7  9 -  3  5 10
   *
   * b21 =  6  8 (1) -  4 10 (1)
   * b22 =  0 10 (1) -  2  8 (1)
   * b23 =  2  4 (1) -  0  6 (1)
   * b24 =  0  6 11 +  2  7  8 +  3  4 10 -  0  7 10 -  2  4 11 -  3  6  8
   *
   * b31 =  4  9 (1) -  5  8 (1)
   * b32 =  1  8 (1) -  0  9 (1)
   * b33 =  0  5 (1) -  1  4 (1)
   * b34 =  0  7  9 +  1  4 11 +  3  5  8 -  0  5 11 -  1  7  8 -  3  4  9
   *
   * b41 = zero
   * b42 = zero
   * b43 = zero
   * b44 =  0  5 10 +  1  6  8 +  2  4  9 -  0  6  9 -  1  4 10 -  2  5  8
   *
   * @param {Matrix4} m
   * @chainable
   */
  setInverse: function (m) {
    var det = m.getDeterminant(),
      d = m.data;
    if (det === 0) {
      throw Error('determinant is zero');
    }
    this.set(
      (d[5] * d[10] - d[6] * d[9]) / det, // 0
      (d[2] * d[9] - d[1] * d[10]) / det, // 1
      (d[1] * d[6] - d[2] * d[5]) / det, // 2
      (d[1] * d[7] * d[10] + d[2] * d[5] * d[11] + d[3] * d[6] * d[9] -
      d[1] * d[6] * d[11] - d[2] * d[7] * d[9] - d[3] * d[5] * d[10]) / det, // 3

      (d[6] * d[8] - d[4] * d[10]) / det, // 4
      (d[0] * d[10] - d[2] * d[8]) / det, // 5
      (d[2] * d[4] - d[0] * d[6]) / det, // 6
      (d[0] * d[6] * d[11] + d[2] * d[7] * d[8] + d[3] * d[4] * d[10] -
      d[0] * d[7] * d[10] - d[2] * d[4] * d[11] - d[3] * d[6] * d[8]) / det, // 7

      (d[4] * d[9] - d[5] * d[8]) / det, // 8
      (d[1] * d[8] - d[0] * d[9]) / det, // 9
      (d[0] * d[5] - d[1] * d[4]) / det, // 10
      (d[0] * d[7] * d[9] + d[1] * d[4] * d[11] + d[3] * d[5] * d[8] -
      d[0] * d[5] * d[11] - d[1] * d[7] * d[8] - d[3] * d[4] * d[9]) / det // 11
    );
    return this;
  },

  /**
   * Inverts `this` matrix saving the inversion in a
   * new Matrix4
   *
   *      var m = new Matrix4();
   *      var mI = m.inverse();
   *      // m is not modified in the inversion
   *
   * @return Matrix4
   */
  inverse: function () {
    return new Matrix4().setInverse(this);
  },

  /**
   * Inverts `this` modifying it so that its components
   * are equal to the inversion
   *
   *      var m = new Matrix4();
   *      m.invert();
   *      // m is modified in the inversion
   *
   * @chainable
   */
  invert: function () {
    return this.setInverse(this);
  },

  /**
   * Sets this matrix to be the rotation matrix corresponding to
   * the given quaternion + a translation given by `pos`, the transformation
   * results in a rotation matrix using the right hand rule
   *
   * @param {Quaternion} q
   * @param {Vector3} pos
   * @chainable
   */
  setOrientationAndPos: function (q, pos) {
    var xSq = q.x * q.x;
    var ySq = q.y * q.y;
    var zSq = q.z * q.z;
    var xy = q.x * q.y;
    var xz = q.x * q.z;
    var yz = q.y * q.z;
    var wx = q.w * q.x;
    var wy = q.w * q.y;
    var wz = q.w * q.z;
    return this.set(
      1 - 2 * (ySq + zSq),
      2 * (xy - wz),
      2 * (xz + wy),
      pos.x,

      2 * (xy + wz),
      1 - 2 * (xSq + zSq),
      2 * (yz - wx),
      pos.y,

      2 * (xz - wy),
      2 * (yz + wx),
      1 - 2 * (xSq + ySq),
      pos.z
    );
  },

  /**
   * Transforms the direction of a given vector with the info stored on this matrix
   *
   * When a direction is converted between frames of reference,
   * there is no translation required
   *
   * [0 1 2 3  [x  = [0x + 1y + 2z
   *  4 5 6 7   y     4x + 5y + 6z
   *  8 91011]  z]    8x + 9y + 10z]
   *
   * @param v
   * @returns {Vector3}
   */
  transformDirection: function (v) {
    var d = this.data;
    return new Vector3(
      v.x * d[0] + v.y * d[1] + v.z * d[2],
      v.x * d[4] + v.y * d[5] + v.z * d[6],
      v.x * d[8] + v.y * d[9] + v.z * d[10]
    );
  },

  /**
   * Transforms the given direction vector by the transformational
   * inverse of this matrix (the inverse of the matrix is equal to its
   * transpose when the matrix is a rotation matrix only)
   *
   * @param v
   * @returns {Vector3}
   */
  transformInverseDirection: function (v) {
    var d = this.data;
    return new Vector3(
      v.x * d[0] + v.y * d[4] + v.z * d[8],
      v.x * d[1] + v.y * d[5] + v.z * d[9],
      v.x * d[2] + v.y * d[6] + v.z * d[10]
    );
  }
};

module.exports = Matrix4;