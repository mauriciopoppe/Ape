/**
 * Represents a bounding sphere used in the coarse collision detection
 * step,
 * @class Ape.collision.BoundingSphere
 */
Ape.collision.BoundingSphere = Class.extend({
    init: function (center, radius) {
        /**
         * The center of the bounding sphere
         * @type {Ape.Vector3}
         */
        this.center = center;

        /**
         * The radius of the bounding sphere
         * @type {number}
         */
        this.radius = radius;
    },

    /**
     * Returns the volume of this bounding sphere. This is used
     * to calculate how to do recursion into the bounding volume tree.
     *
     *      V = 4/3 * Math.PI * r * r * r
     */
    getSize: function () {
        return 4 / 3 * Math.PI * this.radius * this.radius * this.radius;
    },

    /**
     * Joins two given bounding spheres
     * @param one
     * @param two
     */
    join: function (one, two) {
        var centerVector = one.center.clone().sub(two.center),
            distance = centerVector.length(),
            radiusDiff = two.radius - one.radius;

        // check if one sphere encloses the other
        if (distance <= Math.abs(radiusDiff)) {
            if (one.radius > two.radius) {
                this.center = one.center;
                this.radius = one.radius;
            } else {
                this.center = two.center;
                this.radius = two.radius;
            }
        } else {
            // the new radius is at half the sum of the distance of the centers,
            // one's radius and two's radius
            this.radius = (distance + one.radius + two.radius) * 0.5;
            this.center = one.center;
            if (distance) {
                // using linear proportions we can interpolate
                // the amount to be added to the center using the new radius
                // and the radius of one
                this.center.add(
                    centerVector.multiplyScalar(
                        (this.radius - one.radius) / distance
                    )
                );
            }
        }
    },

    /**
     * Checks if this bounding sphere overlaps
     * with the other bounding sphere
     * @param {Ape.collision.BoundingSphere} other
     */
    overlaps: function (other) {
        var distance = this.center.distanceTo(other.center);
        return distance < this.center.radius + other.center.radius;
    },

    /**
     * We can calculate the growth by analyzing the surface of a new
     * bounding sphere created with this and the `other` sphere
     *
     *      Surface Area = 4 * Math.PI * r * r
     *
     * we're not interested in the constants so we can only analyze
     * the growth with the radius of both spheres discarding the constants
     *
     *      growth = bigSphere - smallSphere
     *      growth = bigSphere.radius^2 - smallSphere.radius^2
     *
     * @param {Ape.collision.BoundingSphere} other
     * @returns {number}
     */
    getGrowth: function (other) {
        var newSphere = new Ape.collision.BoundingSphere().join(this, other);
        return newSphere.radius * newSphere.radius - this.radius * this.radius;
    }
});