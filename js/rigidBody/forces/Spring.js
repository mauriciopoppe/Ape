/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 9:09 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Spring, follows Hooke's law
 *
 * Simplified model of the metallic spring:
 * let k be a constant depending on the material (its stiffness
 * which is the rigidity of the material)
 *
 *      f_spring = -k (l - l_rest)
 *
 * @class Ape.Spring
 */
Ape.Spring = Ape.ForceGenerator.extend({
    init: function (localConnectionPt, other, otherConnectionPt,
                    springConstant, restLength) {

        this._super();

        /**
         * The point of connection of the spring in OBJECT
         * coordinates
         * @type {THREE.Vector3}
         */
        this.connectionPoint = localConnectionPt;

        /**
         * The body at the other end of the spring,
         * we assume that we're extending the spring from the
         * body which is not this one (this one is static)
         * @type {Ape.Particle}
         */
        this.other = other;

        /**
         * The point of connection of the spring in OBJECT
         * coordinates (in the other body)
         * @type {THREE.Vector3}
         */
        this.otherConnectionPoint = otherConnectionPt;

        /**
         * Holds the spring constant
         * @type {THREE.Vector3}
         */
        this.springConstant = springConstant;

        /**
         * The length of the material when it's on a rest position
         * @type {number}
         */
        this.restLength = restLength;
    },

    updateForce: function (body, duration) {
        var bodyInWorldSpace = body.getPointInWorldSpace(this.connectionPoint),
            otherInWorldSpace = this.other.getPointInWorldSpace(this.otherConnectionPoint),
            vector,
            force,
            magnitude;

        vector = bodyInWorldSpace.clone()
                    .sub(otherInWorldSpace);

        // -k (l - l_rest)
        magnitude = -this.springConstant *
            (vector.length() - this.restLength);

        // turn the magnitude into a vector
        // f_spring = magnitude * dˆ
        force = vector.clone().normalize().multiplyScalar(magnitude);
        body.addForceAtPoint(force, bodyInWorldSpace);
    }
});