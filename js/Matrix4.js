/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Holds a transform matrix consisting of a rotation matrix and
 * a position
 * @class Ape.Matrix4
 */
Ape.Matrix4 = Class.extend({
    init: function () {
        /**
         * Holds 12 real values
         * It's assumed that the remaining row has (0, 0, 0, 1)
         * so it's not noted here
         * @type {Array}
         */
        this.data = [];

        this.set.apply(this, Array.prototype.slice.call(arguments));
    },

    clone: function () {
        var d = this.data;
        return new Ape.Matrix4(
            d[0], d[1], d[2], d[3],
            d[4], d[5], d[6], d[7],
            d[8], d[9], d[10], d[11]
        );
    },

    set: function (m11, m12, m13, m14, m21, m22, m23, m24,
           m31, m32, m33, m34) {
        var d = this.data,
            special = {
                0: true,
                5: true,
                10: true
            },
            i;
        d[0] = m11; d[1] = m12; d[2] = m13; d[3] = m14;
        d[4] = m21; d[5] = m22; d[6] = m23; d[7] = m24;
        d[8] = m31; d[9] = m32; d[10] = m33; d[11] = m34;

        // fix undefined values
        for (i = 0; i < 12; i += 1) {
            d[i] = d[i] !== undefined ? d[i] : Number(!!special[i]);
        }

        return this;
    },

    multiply: function (m2) {
        Ape.assert(m2 instanceof Ape.Matrix4);
        var d1 = this.data;
        var d2 = m2.data;

        return new Ape.Matrix4(
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
        return new THREE.Vector3(
            v.x * data[0] + v.y * data[1] + v.z * data[2] + data[3],
            v.x * data[4] + v.y * data[5] + v.z * data[6] + data[7],
            v.x * data[8] + v.y * data[9] + v.z * data[10] + data[11]
        );
    },

    /**
     * Transforms the given vector by this matrix
     * @param v
     * @returns {THREE.Vector3}
     */
    transform: function (v) {
        return this.multiplyVector(v);
    },

    /**
     * Transforms the given vector by the transformational inverse
     * of this matrix
     *
     * @param v
     * @returns {THREE.Vector3}
     */
    transformInverse: function (v) {
        var t = v.clone(),
            d = this.data;
        t.x -= d[3];
        t.y -= d[7];
        t.z -= d[11];
        return new THREE.Vector3(
            t.x * d[0] + t.y * d[4] + t.z * d[8],
            t.x * d[1] + t.y * d[5] + t.z * d[9],
            t.x * d[2] + t.y * d[6] + t.z * d[10]
        );
    },

    /**
     * Returns a vector representing one axis (a column) in the matrix
     * @param {number} j The column to return
     * @returns {THREE.Vector3}
     */
    getAxisVector: function (j) {
        return new THREE.Vector3(
            this.data[j],
            this.data[j + 4],
            this.data[j + 8]
        );
    },

    getDeterminant: function () {
        var d = this.data;
        return d[8] * d[5] * d[2] +
            d[4] * d[9] * d[2] +
            d[8] * d[1] * d[6] -
            d[0] * d[9] * d[6] -
            d[4] * d[1] * d[10] +
            d[0] * d[5] * d[10];
    },

    setInverse: function (m) {
        var det = m.getDeterminant(),
            d = m.data;
        if (det === 0) {
            console.log('determinant is zero');
            return this;
        }
        this.set(
            (-d[9] * d[6] + d[5] * d[10]) / det, // 0
            (d[9] * d[2] - d[1] * d[10]) / det, // 1
            (-d[5] * d[2] + d[1] * d[6] * d[15]) / det, // 2
            (d[9] * d[6] * d[3] -
                d[5] * d[10] * d[3] -
                d[9] * d[2] * d[7] +
                d[1] * d[10] * d[7] +
                d[5] * d[2] * d[11] -
                d[1] * d[6] * d[11]) / det, // 3

            (d[8] * d[6] - d[4] * d[10]) / det, // 4
            (-d[8] * d[2] + d[0] * d[10]) / det, // 5
            (d[4] * d[2] - d[0] * d[6] * d[15]) / det, // 6
            (-d[8] * d[6] * d[3] +
                d[4] * d[10] * d[3] +
                d[8] * d[2] * d[7] -
                d[0] * d[10] * d[7] -
                d[4] * d[2] * d[11] +
                d[0] * d[6] * d[11]) / det, // 7

            (-d[8] * d[5] + d[4] * d[9] * d[15]) / det, // 8
            (d[8] * d[1] - d[0] * d[9] * d[15]) / det, // 9
            (-d[4] * d[1] + d[0] * d[5] * d[15]) / det, // 10
            (d[8] * d[5] * d[3] -
                d[4] * d[9] * d[3] -
                d[8] * d[1] * d[7] +
                d[0] * d[9] * d[7] +
                d[4] * d[1] * d[11] -
                d[0] * d[5] * d[11]) / det // 11
        );
        return this;
    },

    /**
     * Returns a new matrix with the inverse of this matrix
     * @returns {Ape.Matrix4}
     */
    inverse: function () {
        return new Ape.Matrix4().setInverse(this);
    },

    /**
     * Inverts this matrix
     * @returns {Ape.Matrix4}
     */
    invert: function () {
        return this.setInverse(this);
    },

    /**
     * Sets this matrix to be the rotation matrix corresponding to
     * the given quaternion
     *
     * @param q
     * @param pos
     * @returns {*}
     */
    setOrientationAndPos: function (q, pos) {
        return this.set(
            1 - 2 * (q.y * q.y + q.z * q.z),
            2 * (q.x * q.y + q.z * q.w),
            2 * (q.x * q.z - q.y * q.w),
            pos.x,

            2 * (q.x * q.y - q.z * q.w),
            1 - 2 * (q.x * q.x + q.z * q.z),
            2 * (q.y * q.z + q.x * q.w),
            pos.y,

            2 * (q.x * q.z + q.y * q.w),
            2 * (q.y * q.z - q.x * q.w),
            1 - 2 * (q.x * q.x + q.y * q.y),
            pos.z
        );
    },

    /**
     * Transforms the given direction by this matrix
     *
     * When a direction is converted between frames of reference,
     * there is no translation required
     *
     * @param v
     * @returns {THREE.Vector3}
     */
    transformDirection: function (v) {
        var d = this.data;
        return new THREE.Vector3(
            v.x * d[0] + v.y * d[1] + v.z * d[2],
            v.x * d[4] + v.y * d[5] + v.z * d[6],
            v.x * d[8] + v.y * d[9] + v.z * d[10]
        );
    },

    /**
     * Transforms the given direction vector by the transformational
     * inverse of this matrix
     *
     * @param v
     * @returns {THREE.Vector3}
     */
    transformInverseDirection: function (v) {
        var d = this.data;
        return new THREE.Vector3(
            v.x * d[0] + v.y * d[4] + v.z * d[8],
            v.x * d[1] + v.y * d[5] + v.z * d[9],
            v.x * d[2] + v.y * d[6] + v.z * d[10]
        );
    }
});