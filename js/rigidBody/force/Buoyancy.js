/**
 * Lets assume that we have a plane parallel to the XZ plane
 * that represents a liquid with some density. When an object
 * falls into this liquids it causes the liquid to apply a force
 * to the object that pushes it upward. When the object is
 * completely submerged in the liquid no matter what it's the
 * magnitude of its depth the liquid will push upward with the
 * same force.
 *
 * Simplified model of the buoyancy:
 *
 * Let v be the volume of the object.
 * let p be the density of the liquid
 *
 *      // if objectY > liquidHeight
 *      //      do nothing
 *      // else if objectY + height < liquidHeight
 *      //      push with vp
 *      // else
 *      //      push with vp * submersion depth percentage
 *
 * @class Ape.force.Buoyancy
 * @extends Ape.force.ForceGenerator
 */
Ape.force.Buoyancy = Ape.force.ForceGenerator.extend({
    /**
     * Ape.force.Buoyancy constructor
     * @param {Ape.Vector3} center Center of masses where
     * the force is applied to
     * @param {number} maxDepth Depth below liquidHeight
     * at which the maximum force is applied
     * @param {number} volume Volume of the rigid body
     * @param {number} liquidHeight Height of the liquid
     * from the origin
     * @param {number} [liquidDensity=1000] Liquid density
     * (typically it's 1000 kg/m^3)
     */
    init: function (center, maxDepth, volume,
                    liquidHeight, liquidDensity) {
        this._super();

        /**
         * The maximum submersion depth of the object before
         * it's pushed with the same force
         * @property {number}
         */
        this.maxDepth = maxDepth;

        /**
         * Rigid body volume
         * @property {Ape.Vector3}
         */
        this.volume = volume;

        /**
         * Height of the liquid this object will be submerged in
         * @property {number}
         */
        this.liquidHeight = liquidHeight;

        /**
         * Density of the liquid this object will be submerged in
         * @property {number} [liquidDensity=1000]
         */
        this.liquidDensity = liquidDensity || 1000;

        /**
         * The center of the buoyancy of the rigid body
         * in OBJECT coordinates
         * @property {Ape.Vector3}
         */
        this.centerOfBuoyancy = center || new Ape.Vector3();
    },

    /**
     * Applies a force following the rules described in the
     * model above
     * @param {Ape.RigidBody} body
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        var pointInWorld = body.getPointInWorldSpace(this.centerOfBuoyancy),
            depth = pointInWorld.y,
            force = new Ape.Vector3();

        if (depth <= this.liquidHeight) {
            if (depth + this.maxDepth <= this.liquidHeight) {
                // completely submerged
                force.y = this.volume * this.liquidDensity * -Ape.GRAVITY.y;
            } else {
                var submerged = (this.liquidHeight - depth) / this.maxDepth;
                Ape.assert(submerged <= 1 && submerged >= 0);
                // partially submerged
                force.y = submerged * this.volume * this.liquidDensity * -Ape.GRAVITY.y;
            }
            body.addForceAtBodyPoint(force, this.centerOfBuoyancy);
        }

    }
});