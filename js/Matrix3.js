/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.Matrix3 = Class.extend({
    init: function () {
        /**
         * Holds 9 real values
         * @type {Array}
         */
        this.data = [];

        this.set.apply(this, Array.prototype.slice.call(arguments));
    },

    set: function (m11, m12, m13, m21, m22, m23, m31, m32, m33) {
        var data = this.data;
        data[0] = m11; data[1] = m12; data[2] = m13;
        data[3] = m21; data[4] = m22; data[5] = m23;
        data[6] = m31; data[7] = m32; data[8] = m33;
        return this;
    },

    clone: function () {
        var d = this.data;
        return new Ape.Matrix3(
            d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]
        );
    },

    multiply: function (m2) {
        Ape.assert(m2 instanceof Ape.Matrix3);
        var d1 = this.data;
        var d2 = m2.data;

        return new Ape.Matrix3(
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
     * @param v
     */
    multiplyVector: function (v) {
        var d = this.data;
        return new THREE.Vector3(
            v.x * d[0] + v.y * d[1] + v.z * d[2],
            v.x * d[3] + v.y * d[4] + v.z * d[5],
            v.x * d[6] + v.y * d[7] + v.z * d[8]
        );
    },

    /**
     * Transform the given vector by this matrix
     * @param v
     */
    transform: function (v) {
        return this.multiplyVector(v);
    },

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
            console.log('determinant is zero');
            return this;
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

    inverse: function () {
        return new Ape.Matrix3().setInverse(this);
    },

    invert: function () {
        return this.setInverse(this);
    },

    setTranspose: function (m) {
        var d = m.data;
        return this.set(
            d[0], d[3], d[6],
            d[1], d[4], d[7],
            d[2], d[5], d[8]
        );
    },

    transpose: function () {
        return new Ape.Matrix3().setTranspose(this);
    },

    transformTranspose: function (vector) {
        var d = this.data;
        return new THREE.Vector3(
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
     * @returns {*}
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
     * @returns {*}
     */
    setDiagonal: function (a, b, c) {
        this.setInertialTensorCoefficients(a, b, c);
    },

    /**
     * Sets the value of the matrix from inertia tensor values
     * @param ix
     * @param iy
     * @param iz
     * @param [ixy]
     * @param [ixz]
     * @param [iyz]
     */
    setInertialTensorCoefficients: function (ix, iy, iz, ixy, ixz, iyz) {
        ixy = ixy || 0;
        ixz = ixz || 0;
        iyz = iyz || 0;
        return this.set(
              ix, -ixy, -ixz,
            -ixy,   iy, -iyz,
            -ixz, -iyz,   iz
        );
    },

    /**
     * Sets the value of this matrix as the inertial tensor of a block
     * aligned with the body's coordinate system with the given axis half
     * sizes and mass
     * @param halfSizes
     * @param mass
     */
    setBlockInertialTensor: function (halfSizes, mass) {
        var sqx = halfSizes.x * halfSizes.x,
            sqy = halfSizes.y * halfSizes.y,
            sqz = halfSizes.z * halfSizes.z;
        return this.setInertialTensorCoefficients(
            0.3 * mass * (sqy + sqz),
            0.3 * mass * (sqx + sqz),
            0.3 * mass * (sqx + sqy)
        );
    },

    linearInterpolate: function (a, b, proportion) {
        var i;
        for (i = 0; i < 9; i += 1) {
            this.data[i] = a.data[i] * (1 - proportion) +
                b.data[i] * proportion;
        }
        return this;
    }
});