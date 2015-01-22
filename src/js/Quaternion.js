/**
 * Quaternion represents a 4 component vector a.k.a
 * Quaternion useful to determine the orientation of a rigid body
 *
 * <hr>
 *
 * Quaternion representa un vector de 4 componentes, tambien
 * conocido como quaternion que es util para determinar la
 * orientacion de un cuerpo rígido
 *
 * @class Quaternion
 */

var Constants = require('./Constants');
var assert = require('assert');
var Vector3 = require('./Vector3');

/**
 * Quaternion constructor
 * @param {number} w
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function Quaternion(w, x, y, z) {

  /**
   * Real component of the quaternion
   * @property {number} [w=1]
   */
  /**
   * First complex component of the quaternion
   * @property {number} [x=0]
   */
  /**
   * Second complex component of the quaternion
   * @property {number} [y=0]
   */
  /**
   * Third complex component of the quaternion
   * @property {number} [z=0]
   */
  this.set.apply(this, Array.prototype.slice.call(arguments));
}

/**
 * Creates a new Quaternion from a rotation axis and and angle
 * @param {Vector3} v
 * @param {Number} angle
 * @returns {Quaternion}
 */
Quaternion.fromVectorAndAngle = function (v, angle) {
  assert(!isNaN(angle));
  var halfAngle = angle * 0.5;
  var cosHalfAngle = Math.cos(halfAngle);
  var sinHalfAngle = Math.sin(halfAngle);
  v.normalize();
  return new Quaternion(
    cosHalfAngle,
    v.x * sinHalfAngle,
    v.y * sinHalfAngle,
    v.z * sinHalfAngle
  );
};

Quaternion.prototype = {
  constructor: Quaternion,

  /**
   * Updates the components of an Quaternion
   *
   *      var q = new Quaternion();
   *      q.set(5, 1, 2, 3);
   *      // its components are [5, 1, 2, 3]
   *      // but the vector is immediately normalized
   *      // so
   *      assert(q.w === 0.8);
   *      assert(q.x === 0.16);
   *      assert(q.y === 0.3);
   *      assert(q.z === 0.48);
   *
   * @param {number} w
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @chainable
   */
  set: function (w, x, y, z) {
    this.w = isNaN(w) ? 1 : w;
    this.x = isNaN(x) ? 0 : x;
    this.y = isNaN(y) ? 0 : y;
    this.z = isNaN(z) ? 0 : z;
    // TODO: normalization should be done on demand
    // http://stackoverflow.com/questions/11667783/quaternion-and-normalization
    return this.normalize();
  },

  /**
   * Creates a new quaternion which is the conjugate of this vector
   *
   *      q  = (s, v)
   * conj(q) = (s, -v)
   *
   * @returns {Quaternion}
   */
  conjugate: function () {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  },

  /**
   * Checks if the Quaternion `q` is equal to this quaternion
   * @param {Quaternion} q
   * @returns {boolean}
   */
  equals: function (q) {
    return Math.abs(q.w - this.w) < Constants.EPS &&
      Math.abs(q.x - this.x) < Constants.EPS &&
      Math.abs(q.y - this.y) < Constants.EPS &&
      Math.abs(q.z - this.z) < Constants.EPS;
  },

  /**
   * Creates a new array of 4 components made out of
   * the components of `this` quaternion
   * @returns {Array}
   */
  asArray: function () {
    return [this.w, this.x, this.y, this.z];
  },

  /**
   * Creates a new instance of Quaternion with the components of `this`
   *
   *      var q = new Quaternion(5, 1, 2, 3);
   *      var qClone = q.clone();         // qClone has the same components
   *      // the following assertions are always true
   *      assert(q.x === qClone.x);
   *      assert(q.y === qClone.y);
   *      assert(q.z === qClone.z);
   *      assert(q !== qClone);
   *
   * @returns {Quaternion}
   */
  clone: function () {
    return new Quaternion(this.w, this.x, this.y, this.z);
  },

  /**
   * Calculates the length squared of this vector
   * @returns {number}
   */
  lengthSq: function () {
    return this.w * this.w + this.x * this.x +
      this.y * this.y + this.z * this.z;
  },

  /**
   * Calculates the length of this vector
   *
   *      var q = new Quaternion(1, 2, 3, 4);
   *      // the length is sqrt(v.w * v.w + v.x * v.x + v.y * v.y + v.z * v.z)
   *      var length = v.length();
   *      // so the following assertion is true
   *      assert(lengthSq === sqrt(1 * 1 + 2 * 2 + 3 * 3 + 4 * 4));
   *
   * @returns {number}
   */
  length: function () {
    var lengthSq = this.lengthSq();
    assert(lengthSq >= 0.1);
    return Math.sqrt(lengthSq);
  },

  /**
   * Normalizes this quaternion by dividing each component
   * of the quaternion by the length of `this`
   *
   *      var q = new Quaternion(5, 1, 2, 3);
   *      q.normalize();
   *      assert(q.w === 0.8);
   *      assert(q.x === 0.16);
   *      assert(q.y === 0.3);
   *      assert(q.z === 0.48);
   *
   * @chainable
   */
  normalize: function () {
    var me = this;
    var length = me.length();
    this.w /= length;
    this.x /= length;
    this.y /= length;
    this.z /= length;
    return this;
  },

  /**
   * Multiplies two Quaternions (see [an explanation about
   * the multiplication of quaternions](http://3dgep.com/?p=1815))
   *
   * p q = ( p0q0 - dot(q, p), p0 q + q0 p + p x q)
   *
   * @param {Quaternion} q2
   * @chainable
   */
  multiply: function (q2) {
    var q1 = this;
    return this.set(
      q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
      q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
      q1.w * q2.y + q1.y * q2.w + q1.z * q2.x - q1.x * q2.z,
      q1.w * q2.z + q1.z * q2.w + q1.x * q2.y - q1.y * q2.x
    );
  },

  /**
   * Adds the given vector scaled with `scale` to this
   * This is used to update the orientation quaternion by a rotation
   * and time.
   * @param {Vector3} v
   * @param {number} scale
   */
  addScaledVector: function (v, scale) {
    scale = isNaN(scale) ? 1 : scale;
    var q = new Quaternion(
      0,
      v.x * scale,
      v.y * scale,
      v.z * scale
    );
    q.multiply(this);
    return this.set(
      this.w + q.w * 0.5,
      this.x + q.x * 0.5,
      this.y + q.y * 0.5,
      this.z + q.z * 0.5
    );
  },

  /**
   * Rotates a quaternion by a Vector3
   * @param {Vector3} v
   * @chainable
   */
  rotateByVector: function (v) {
    var q = new Quaternion(0, v.x, v.y, v.z);
    return this.multiply(q);
  },

  /**
   * Rotates a vector `v`, actually it's a bad idea according to this article:
   * http://physicsforgames.blogspot.com/2010/02/quaternions.html, it's cheaper to convert
   * the quaternion to a matrix and multiply it with the vector to apply the rotation
   * @param {Vector3} v
   * @returns {Vector3}
   */
  rotateVector: function (v) {
    var me = this;
    var product = me.clone()
      .multiply(new Quaternion(0, v.x, v.y, v.z))
      .multiply(me.conjugate());
    return new Vector3(product.x, product.y, product.z);
  }
};

module.exports = Quaternion;