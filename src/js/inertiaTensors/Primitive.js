/**
 * Created by mauricio on 1/17/15.
 */

/**
 * Mixin applied to the Matrix3 prototype's to provide support for primitive
 * inertia tensors
 * @type {Object}
 */
module.exports = {
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

  /**
   * Sets the value of this matrix as the inertial tensor of a sphere
   * with uniform density
   * @param radius
   * @param mass
   */
  setSphereInertialTensor: function (radius, mass) {
    var cfg = 2 / 5 * mass * radius * radius;
    return this.setInertialTensorCoefficients(
        cfg, cfg, cfg
    );
  }
};