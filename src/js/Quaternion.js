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

var constants = require('./Constants');
var assert = require('assert');

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
  this.w = w !== undefined ? w : 1;

  /**
   * First complex component of the quaternion
   * @property {number} [x=0]
   */
  this.x = x !== undefined ? x : 0;

  /**
   * Second complex component of the quaternion
   * @property {number} [y=0]
   */
  this.y = y !== undefined ? y : 0;

  /**
   * Third complex component of the quaternion
   * @property {number} [z=0]
   */
  this.z = z !== undefined ? z : 0;
}

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
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    return this.normalize();
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
    var length = this.w * this.w + this.x * this.x +
      this.y * this.y + this.z * this.z;
    if (length < constants.EPS) {
      this.w = 1;
      return this;
    }
    length = 1 / Math.sqrt(length);
    this.w *= length;
    this.x *= length;
    this.y *= length;
    this.z *= length;
    return this;
  },
  /**
   * Multiplies two Quaternions (see [an explanation about
   * the multiplication of quaternions](http://3dgep.com/?p=1815))
   * @param {Quaternion} q2
   * @chainable
   */
  multiply: function (q2) {
    var q1 = this.clone();

    this.w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
    this.x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
    this.y = q1.w * q2.y + q1.y * q2.w + q1.z * q2.x - q1.x * q2.z;
    this.z = q1.w * q2.z + q1.z * q2.w + q1.x * q2.y - q1.y * q2.x;

    return this;
  },

  /**
   * Adds the given vector scaled with `scale` to this
   * This is used to update the orientation quaternion by a rotation
   * and time.
   * @param {Vector3} v
   * @param {number} scale
   */
  addScaledVector: function (v, scale) {
    scale = typeof scale === 'number' ? scale : 1;
    var q = new Quaternion(
      0,
      v.x * scale,
      v.y * scale,
      v.z * scale
    );
    q.multiply(this);
    this.w += q.w * 0.5;
    this.x += q.x * 0.5;
    this.y += q.y * 0.5;
    this.z += q.z * 0.5;
  },

  /**
   * Rotates a quaternion by an Vector3
   * @param {Vector3} v
   * @chainable
   */
  rotateByVector: function (v) {
    var q = new Quaternion(0, v.x, v.y, v.z);
    return this.multiply(q);
  }
};

module.exports = Quaternion;