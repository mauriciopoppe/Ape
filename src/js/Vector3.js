var assert = require('assert');

/**
 * Vector3 utility class which represents either a 3DPoint or a displacement
 * (starting from the origin and moving to a 3d Point), it has useful methods
 * to handle the operations between Vector3 instances.
 *
 *      // vector initialization
 *      var va = new Vector3();     // its [x, y, z] components are [0, 0, 0]
 *      var vb = new Vector3(1, 2, 3);        // its components are [1, 2, 3]
 *      va.set(1, 2, 3)                 // va's components are changed through set
 *
 * <hr>
 *
 * @class Vector3
 */

/**
 * Vector3 constructor
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [z=0]
 */
function Vector3(x, y, z) {
  /**
   * Vector's X component
   * @property {number}
   */
  this.x = x || 0;
  /**
   * Vector's Y component
   * @property {number}
   */
  this.y = y || 0;
  /**
   * Vector's Z component
   * @property {number}
   */
  this.z = z || 0;
}

Vector3.prototype = {
  constructor: Vector3,

  /**
   * Updates the components of a vector
   *
   *      var v = new Vector3();
   *      v.set(1, 2, 3);            // its components are [1, 2, 3]
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @chainable
   */
  set: function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    assert(!isNaN(x) && !isNaN(y) && !isNaN(z));
    return this;
  },

  /**
   * Checks if the vector `v` is equal to this vector
   * @param {Vector3} v
   * @returns {boolean}
   */
  equals: function (v) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  },

  /**
   * Adds an Vector3 to `this` Vector3
   *
   *      var a = new Vector3(1, 2, 3);
   *      var b = new Vector3(1, 2, 3);
   *      a.add(b);               // a's components are [2, 4, 6]
   *
   * @param {Vector3} v
   * @chainable
   */
  add: function (v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  },
  /**
   * Adds a scalar quantity to each component of `this`
   *
   *      var v = new Vector3(1, 1, 1);
   *      v.addScalar(1);         // v's components are [2, 2, 2]
   *
   * @param {number} s
   * @chainable
   */
  addScalar: function (s) {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  },
  /**
   * Subtracts an Vector3 from `this` Vector3
   *
   *      var a = new Vector3(1, 2, 3);
   *      var b = new Vector3(1, 2, 3);
   *      a.sub(b);               // a's components are [0, 0, 0]
   *
   * @param {Vector3} v
   * @chainable
   */
  sub: function (v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  },
  /**
   * Updates the components of `this` vector to be the sum of
   * two parameter Vector3 vectors
   *
   *      var a = new Vector3(1, 2, 3);
   *      var b = new Vector3(1, 2, 3);
   *      var c = new Vector3();
   *      c.addVectors(a, b);               // c's components are [2, 4, 6]
   *
   * @param {Vector3} a
   * @param {Vector3} b
   * @chainable
   */
  addVectors: function (a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  },
  /**
   * Adds an Vector3 to `this` Vector3 scaled by some quantity `s`,
   * this method returns a new instance of Vector3
   *
   *      var a = new Vector3(1, 2, 3);
   *      var b = new Vector3(1, 2, 3);
   *      a.addScaledVector(b, 2);        // a's components are [3, 6, 9]
   *
   * @param {Vector3} v
   * @param {number} s
   * @return Vector3
   */
  addScaledVector: function (v, s) {
    var me = this;
    return new Vector3(
        me.x + v.x * s,
        me.y + v.y * s,
        me.z + v.z * s
    );
  },
  /**
   * Multiplies a scalar quantity to each component of `this`
   *
   *      var v = new Vector3(1, 2, 3);
   *      v.multiplyScalar(5);         // v's components are [5, 10, 15]
   *
   * @param {number} s
   * @chainable
   */
  multiplyScalar: function (s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  },
  /**
   * Divides each component of `this` by a scalar quantity,
   * it also performs an assertion for the scalar value being distinct to zero
   *
   *      var v = new Vector3(5, 10, 15);
   *      v.divideScalar(5);         // v's components are [1, 2, 3]
   *
   * @param {number} s
   * @chainable
   */
  divideScalar: function (s) {
    assert(s !== 0);
    var inverse = 1 / s;
    this.x *= inverse;
    this.y *= inverse;
    this.z *= inverse;
    return this;
  },
  /**
   * Inverts the direction of `this` Vector3
   * (each component of `this` vector is multiplied by -1)
   * @chainable
   */
  invert: function () {
    var me = this;
    me.multiplyScalar(-1);
    return this;
  },
  /**
   * Creates a new instance of Vector3 with the components of `this`
   *
   *      var v = new Vector3(1, 2, 3);
   *      var vClone = v.clone();         // vClone has the same components
   *      // the following assertions are always true
   *      assert(v.x === vClone.x);
   *      assert(v.y === vClone.y);
   *      assert(v.z === vClone.z);
   *      assert(v !== vClone);
   *
   * @returns {Vector3}
   */
  clone: function () {
    return new Vector3(this.x, this.y, this.z);
  },
  /**
   * Normalizes this vector so that this vector's length is now 1
   *
   *      var v = new Vector3(1, 2, 3);
   *      v.normalize();                      // v's length is now 1
   *
   * @chainable
   */
  normalize: function () {
    var me = this;
    return me.divideScalar(me.length());
  },
  /**
   * Creates a new Vector3 by multiplying the components of `v` and
   * `this` one by one (i.e. given two vectors `a, b` then the multiplication
   * is `[a.x * b.x, a.y * b.y, a.c * b.c]`)
   *
   *      var v = new Vector3(1, 2, 3);
   *      var w = new Vector3(3, 4, 5);
   *      var componentMultiplication = v.component(w);
   *      // componentMultiplication's components are [3, 8, 15]
   *
   * @param {Vector3} v
   * @returns Vector3
   */
  component: function (v) {
    var me = this;
    return new Vector3(me.x * v.x, me.y * v.y, me.z * v.z);
  },
  /**
   * Calculates the length of this vector without taking a square root
   *
   *      var v = new Vector3(1, 2, 3);
   *      // the length squared is v.x * v.x + v.y * v.y + v.z * v.z
   *      var lengthSq = v.lengthSq();
   *      // so the following assertion is true
   *      assert(lengthSq === 1 * 1 + 2 * 2 + 3 * 3);
   *
   * @returns {number}
   */
  lengthSq: function () {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },
  /**
   * Calculates the length of this vector
   *
   *      var v = new Vector3(1, 2, 3);
   *      // the length is sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
   *      var length = v.length();
   *      // so the following assertion is true
   *      assert(lengthSq === sqrt(1 * 1 + 2 * 2 + 3 * 3));
   *
   * @returns {number}
   */
  length: function () {
    return Math.sqrt(this.lengthSq());
  },
  /**
   * Calculates the dot product between `this` and `v`
   *
   *      var v = new Vector3(1, 2, 3);
   *      var w = new Vector3(1, 2, 3);
   *      assert(v.dot(w) === 1 + 4 + 9)
   *
   * @param {Vector3} v
   * @returns {number}
   */
  dot: function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  /**
   * Calculates the cross product between `this` and `v` and
   * saves the resulting vector in `this`
   *
   *      var v = new Vector3(1, 2, 3);
   *      var w = new Vector3(3, 2, 1);
   *      v.cross(w);     // v's components are [-4, 8, -4]
   *
   * @param {Vector3} v
   * @chainable
   */
  cross: function (v) {
    var me = this,
      x = me.x, y = me.y, z = me.z;
    me.x = y * v.z - z * v.y;
    me.y = z * v.x - x * v.z;
    me.z = x * v.y - y * v.x;
    return this;
  },
  /**
   * Updates the components of `this` vector to be `[0, 0, 0]`
   *
   *      var v = new Vector3(3, 2, 1);
   *      v.clear();          // v's components are now [0, 0, 0]
   * @chainable
   */
  clear: function () {
    this.set(0, 0, 0);
    return this;
  },
  /**
   * Calculates the displacement needed to move from `this` vector
   * to the vector `v`.
   *
   *      var v = new Vector3(0, 0, 0);
   *      var w = new Vector3(3, 3, 3);
   *      v.distanceTo(w);        // the distance from v to w is 5.2
   *
   * @param {Vector3} v
   * @returns {number}
   */
  distanceTo: function ( v ) {
    return Math.sqrt(this.distanceToSquared(v));
  },

  /**
   * Calculates the displacement needed to move from `this` vector
   * to the vector `v` without taking the square root.
   *
   *      var v = new Vector3(0, 0, 0);
   *      var w = new Vector3(3, 3, 3);
   *      v.distanceToSquared(w);        // the distance from v to w is 27
   *
   * @param {Vector3} v
   * @returns {number}
   */
  distanceToSquared: function ( v ) {
    var dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
};

module.exports = Vector3;