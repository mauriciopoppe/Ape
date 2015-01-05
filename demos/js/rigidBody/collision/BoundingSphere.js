/**
 * Represents a bounding sphere used in the coarse collision detection
 * phase, using this structure reduces collision detection time
 * since it takes `O(n log n)` operations instead of `O(n^2)` because
 * a binary search tree is used instead of an array.
 *
 * The bounding sphere is a sphere that acts as a wrapper for any rigid body,
 * considering that we have a collection of bounding spheres we can detect
 * collisions among them faster because we only have to make a constant check
 * considering only the center of the bounding spheres and their radii.
 *
 * <hr>
 *
 * Representa una esfera limitante usada en la fase de detección de colisiones
 * ordinario, usando esta estructura se reduce el tiempo de detección de
 * colisiones debido a que le toma `O(n log n)` operaciones en lugar de `O(n^2)`
 * por el uso de un arbol binario en lugar de un array.
 *
 * La esfera limitante es una esfera que actua como un envoltorio para cualquier
 * cuerpo rígido, considerando que tenemos una coleccion de esferas limitantes
 * podemos detectar las colisiones existentes entre ellos debido a que se puede
 * hacer una prueba constante considerando los centros y radios de las
 * esferas solamente.
 *
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