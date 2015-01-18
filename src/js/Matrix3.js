var assert = require('assert');
var Vector3 = require('./Vector3');
var _ = require('lodash');
/**
 * Matrix3 represents a 9 component structure
 * useful to represent internal characteristics of a rigid
 * body such as the `inertiaTensor` and its `inverseInertiaTensor`
 *
 * <hr>
 *
 * Matrix3 representa una estructura de 9 componentes
 * util para representar caracteristicas internas de un cuerpo
 * rigido como su tensor de inercia y su inverso
 *
 * @class Matrix3
 * @mixins inertiaTensors/Primitive
 */

/**
 * Matrix3 constructor (it receives the nine component of the
 * vector in row order)
 *
 *      var m = new Matrix3(
 *          1, 2, 3
 *          4, 5, 6
 *          7, 8, 9
 *      )
 */
function Matrix3() {
  /**
   * Holds 9 real values in row order
   *
   *      var m = new Matrix3(
   *          1, 2, 3
   *          4, 5, 6
   *          7, 8, 9
   *      );
   *      // data is [1, 2, 3, 4, 5, 6, 7, 8, 9]
   *
   * @type {Array}
   */
  this.data = [];

  this.set.apply(this, Array.prototype.slice.call(arguments));
}

_.merge(Matrix3.prototype, {
  /**
   * Updates the components of this Matrix3
   *
   *       var m = new Matrix3();
   *       // the matrix has the form:
   *       // 1 0 0
   *       // 0 1 0
   *       // 0 0 1
   *       m.set(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *       // the matrix has the form:
   *       // 1 2 3
   *       // 4 5 6
   *       // 7 8 9
   *
   * @param {number} m11
   * @param {number} m12
   * @param {number} m13
   * @param {number} m21
   * @param {number} m22
   * @param {number} m23
   * @param {number} m31
   * @param {number} m32
   * @param {number} m33
   * @chainable
   */
  set: function (m11, m12, m13, m21, m22, m23, m31, m32, m33) {
    var d = this.data,
      special = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ],
      i;
    d[0] = m11; d[1] = m12; d[2] = m13;
    d[3] = m21; d[4] = m22; d[5] = m23;
    d[6] = m31; d[7] = m32; d[8] = m33;

    // fix undefined values
    for (i = -1; ++i < 9;) {
      d[i] = d[i] !== undefined ? d[i] : special[i];
    }

    return this;
  },

  /**
   * Checks if this matrix is equal to another matrix
   * @param {Matrix3} m
   * @returns {boolean}
   */
  equals: function (m) {
    var me = this,
      ok = true,
      i;
    for (i = -1; ok && ++i < 9;) {
      ok = ok && (me.data[i] === m.data[i]);
    }
    return ok;
  },

  /**
   * Creates a new instance of Matrix3 with the components of `this`
   *
   *      var m = new Matrix3();
   *      var mClone = m.clone();         // mClone has the same components
   *
   * @returns {Matrix3}
   */
  clone: function () {
    var d = this.data;
    return new Matrix3(
      d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]
    );
  },

  /**
   * Adds two Matrix instances
   *
   *      var ma = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *      var mb = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
   *      var mc = ma.add(mb);
   *       // the matrix mc has the form:
   *       //  2  4  6
   *       //  8 10 12
   *       // 14 16 18
   *
   * @param {Matrix3} m
   * @returns {Matrix3}
   */
  add: function (m) {
    assert(m instanceof Matrix3);
    var d1 = this.data;
    var d2 = m.data;

    return new Matrix3(
        d1[0] + d2[0], d1[1] + d2[1], d1[2] + d2[2],
        d1[3] + d2[3], d1[4] + d2[4], d1[5] + d2[5],
        d1[6] + d2[6], d1[7] + d2[7], d1[8] + d2[8]
    );
  },

  /**
   * Multiplies two Matrix3 instances
   * @param {Matrix3} m2
   * @returns {Matrix3}
   */
  multiply: function (m2) {
    assert(m2 instanceof Matrix3);
    var d1 = this.data;
    var d2 = m2.data;

    return new Matrix3(
        d1[0] * d2[0] + d1[1] * d2[3] + d1[2] * d2[6],
        d1[0] * d2[1] + d1[1] * d2[4] + d1[2] * d2[7],
        d1[0] * d2[2] + d1[1] * d2[5] + d1[2] * d2[8],

        d1[3] * d2[0] + d1[4] * d2[3] + d1[5] * d2[6],
        d1[3] * d2[1] + d1[4] * d2[4] + d1[5] * d2[7],
        d1[3] * d2[2] + d1[4] * d2[5] + d1[5] * d2[8],

        d1[6] * d2[0] + d1[7] * d2[3] + d1[8] * d2[6],
        d1[6] * d2[1] + d1[7] * d2[4] + d1[8] * d2[7],
        d1[6] * d2[2] + d1[7] * d2[5] + d1[8] * d2[8]
    );
  },

  /**
   * Transform the given vector by this matrix
   * @param {Vector3} v
   * @return Vector3
   */
  multiplyVector: function (v) {
    var d = this.data;
    return new Vector3(
        v.x * d[0] + v.y * d[1] + v.z * d[2],
        v.x * d[3] + v.y * d[4] + v.z * d[5],
        v.x * d[6] + v.y * d[7] + v.z * d[8]
    );
  },

  /**
   * Transform the given vector by this matrix
   * @param s
   * @return Matrix3
   */
  multiplyScalar: function (s) {
    var d = this.data;
    return new Matrix3(
        d[0] * s, d[1] * s, d[2] * s,
        d[3] * s, d[4] * s, d[5] * s,
        d[6] * s, d[7] * s, d[8] * s
    );
  },

  /**
   * Transform the given vector by this matrix
   * @param v
   * @return Vector3
   */
  transform: function (v) {
    return this.multiplyVector(v);
  },

  /**
   * Inverts the matrix `m` and sets the result of the inversion in
   * this matrix
   *
   *      var m = new Matrix3();
   *      var mI = new Matrix3();
   *      mI.setInverse(m);       // mI now holds the inverse of m
   *
   * @param {Matrix3} m
   * @chainable
   */
  setInverse: function (m) {
    var d = m.data;

    var t4 = d[0] * d[4],
      t6 = d[0] * d[5],
      t8 = d[1] * d[3],
      t10 = d[2] * d[3],
      t12 = d[1] * d[6],
      t14 = d[2] * d[6];

    // determinant
    var t16 = t4 * d[8] - t6 * d[7] - t8 * d[8] +
      t10 * d[7] + t12 * d[5] - t14 * d[4];

    // can't divide by zero
    if (t16 === 0) {
      throw Error('determinant is zero');
    }
    this.set(
        (d[4] * d[8] - d[5] * d[7]) / t16,
        -(d[1] * d[8] - d[2] * d[7]) / t16,
        (d[1] * d[5] - d[2] * d[4]) / t16,

        -(d[3] * d[8] - d[5] * d[6]) / t16,
        (d[0] * d[8] - t14) / t16,
        -(t6 - t10) / t16,

        (d[3] * d[7] - d[4] * d[6]) / t16,
        -(d[0] * d[7] - t12) / t16,
        (t4 - t8) / t16
    );
    return this;
  },

  /**
   * Inverts `this` matrix saving the inversion in a
   * new Matrix3
   *
   *      var m = new Matrix3();
   *      var mI = m.inverse();
   *      // m is not modified in the inversion
   *
   * @return Matrix3
   */
  inverse: function () {
    return new Matrix3().setInverse(this);
  },

  /**
   * Inverts `this` modifying it so that its components
   * are equal to the inversion
   *
   *      var m = new Matrix3();
   *      m.invert();
   *      // m is modified in the inversion
   *
   * @chainable
   */
  invert: function () {
    return this.setInverse(this);
  },

  /**
   * Transposes the matrix `m` and sets the result of the operation
   * in `this`
   *
   *      var m = new Matrix3(
   *          1, 2, 3,
   *          4, 5, 6,
   *          7, 8, 9
   *      );
   *      var mT = new Matrix3();
   *      mT.setTranspose(m);       // mT now holds the transpose of m
   *      // the matrix has the form:
   *      // 1 4 7
   *      // 2 5 8
   *      // 3 6 9
   *
   * @param {Matrix3} m
   * @chainable
   */
  setTranspose: function (m) {
    var d = m.data;
    return this.set(
      d[0], d[3], d[6],
      d[1], d[4], d[7],
      d[2], d[5], d[8]
    );
  },

  /**
   * Transposes `this` matrix saving the result in a
   * new Matrix3
   *
   *      var m = new Matrix3();
   *      var mT = m.transpose();
   *      // m is not modified in the operation
   *
   * @return Matrix3
   */
  transpose: function () {
    return new Matrix3().setTranspose(this);
  },

  /**
   * Creates a new vector transforming `vector` with
   * the transpose of `this`
   *
   *      var m = new Matrix3(
   *          1, 2, 3,
   *          4, 5, 6,
   *          7, 8, 9
   *      );
   *      m.transpose(new Vector3(-1, -2, -3));
   *      // the vector's components are:
   *      // (-1 * 1) + (-2 * 4) + (-3 * 7)
   *      // (-1 * 2) + (-2 * 5) + (-3 * 8)
   *      // (-1 * 3) + (-2 * 6) + (-3 * 9)
   *
   * @param {Vector3} vector
   * @returns {Vector3}
   */
  transformTranspose: function (vector) {
    var d = this.data;
    return new Vector3(
        vector.x * d[0] + vector.y * d[3] + vector.z * d[6],
        vector.x * d[1] + vector.y * d[4] + vector.z * d[7],
        vector.x * d[2] + vector.y * d[5] + vector.z * d[8]
    );
  },

  /**
   * Sets this matrix to be the rotation matrix corresponding to
   * the given quaternion.
   *
   * @param q
   * @chainable
   */
  setOrientation: function (q) {
    return this.set(
        1 - 2 * (q.y * q.y + q.z * q.z),
        2 * (q.x * q.y + q.z * q.w),
        2 * (q.x * q.z - q.y * q.w),
        2 * (q.x * q.y - q.z * q.w),
        1 - 2 * (q.x * q.x + q.z * q.z),
        2 * (q.y * q.z + q.x * q.w),
        2 * (q.x * q.z + q.y * q.w),
        2 * (q.y * q.z - q.x * q.w),
        1 - 2 * (q.x * q.x + q.y * q.y)
    );
  },

  /**
   * Sets the matrix to be a diagonal matrix with the given values along
   * the leading diagonal
   * @param a
   * @param b
   * @param c
   * @chainable
   */
  setDiagonal: function (a, b, c) {
    return this.set(
      a, 0, 0,
      0, b, 0,
      0, 0, c
    );
  },

  /**
   * @private
   * Update the component of `this` to be made
   * out of a proportion of the distance between
   * the matrices `a` and `b`
   *
   * @param {Matrix3} a
   * @param {Matrix3} b
   * @param {number} proportion
   * @chainable
   */
  linearInterpolate: function (a, b, proportion) {
    var i;
    for (i = 0; i < 9; i += 1) {
      this.data[i] = a.data[i] * (1 - proportion) +
        b.data[i] * proportion;
    }
    return this;
  },

  /**
   * Sets the vectors passed as a parameter as the columns of
   * this matrix
   * @param {Vector3} a
   * @param {Vector3} b
   * @param {Vector3} c
   * @chainable
   */
  setComponents: function (a, b, c) {
    var d = this.data;
    d[0] = a.x; d[1] = b.x; d[2] = c.x;
    d[3] = a.y; d[4] = b.y; d[5] = c.y;
    d[6] = a.z; d[7] = b.z; d[8] = c.z;
    return this;
  },

  /**
   * Sets the matrix to be a skew symmetric matrix based on
   * the given vector. The skew symmetric matrix is the
   * equivalent of the vector product.
   *
   *      // let a, b be Vector3
   *      a (cross) b = skewSymmetric(a) * b
   * @param v
   * @chainable
   */
  setSkewSymmetric: function (v) {
    var d = this.data;
    // set diagonal to zero
    d[0] = d[4] = d[8] = 0;
    d[1] = -v.z;
    d[2] = v.y;
    d[3] = v.z;
    d[5] = -v.x;
    d[6] = -v.y;
    d[7] = v.x;
    return this;
  }
});

// inertia tensor primitives
_.merge(Matrix3.prototype, require('./inertiaTensors/Primitive'));

module.exports = Matrix3;