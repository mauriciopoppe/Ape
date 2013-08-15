/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.Quaternion = Class.extend({
    init: function (w, x, y, z) {
        /**
         * Real component of the quaterion
         * @type {number}
         */
        this.w = w !== undefined ? w : 1;

        /**
         * First complex component of the quaternion
         * @type {number}
         */
        this.x = x !== undefined ? x : 0;

        /**
         * Second complex component of the quaternion
         * @type {number}
         */
        this.y = y !== undefined ? y : 0;

        /**
         * Third complex component of the quaternion
         * @type {number}
         */
        this.z = z !== undefined ? z : 0;
    },

    set: function (w, x, y, z) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        return this.normalize();
    },

    asArray: function () {
        return [this.w, this.x, this.y, this.z];
    },

    clone: function () {
        return new Ape.Quaternion(this.w, this.x, this.y, this.z);
    },

    normalize: function () {
        var length = this.w * this.w + this.x * this.x +
                     this.y * this.y + this.z * this.z;
        if (length < Ape.EPS) {
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
     * @param v
     * @param scale
     */
    addScaledVector: function (v, scale) {
        var q = new Ape.Quaternion(
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

    rotateByVector: function (v) {
        var q = new Ape.Quaternion(0, v.x, v.y, v.z);
        return this.multiply(q);
    }
});