/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/1/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Rigid body buoyancy, a partial hooke's law application
 *
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
 * @class Ape.ParticleBuoyancy
 */
Ape.Buoyancy = Ape.ForceGenerator.extend({
    init: function (center, maxDepth, volume, liquidHeight, liquidDensity) {
        this._super();

        /**
         * The maximum submersion depth of the object before
         * it's pushed with the same force
         * @type {number}
         */
        this.maxDepth = maxDepth;

        /**
         * Object volume
         * @type {THREE.Vector3}
         */
        this.volume = volume;

        /**
         * Height of the liquid this object will be submerged in
         * @type {number}
         */
        this.liquidHeight = liquidHeight;

        /**
         * Density of the liquid this object will be submerged in
         * @type {number} [liquidDensity=1000]
         */
        this.liquidDensity = liquidDensity || 1000;

        /**
         * The center of the buoyancy of the rigid body
         * in OBJECT coordinates
         * @type {THREE.Vector3}
         */
        this.centerOfBuoyancy = center || new THREE.Vector3();
    },

    updateForce: function (body, duration) {
        var pointInWorld = body.getPointInWorldSpace(this.centerOfBuoyancy),
            depth = pointInWorld.y,
            force = new THREE.Vector3();

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