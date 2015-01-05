/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 9:09 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Particle spring, follows Hooke's law
 *
 * Simplified model of the metallic spring:
 * let k be a constant depending on the material (its stiffness
 * which is the rigidity of the material)
 *
 *      f_spring = -k (l - l_rest)
 *
 * @class Ape.ParticleSpring
 */
Ape.ParticleSpring = Ape.ParticleForceGenerator.extend({
    init: function (other, springConstant, restLength) {
        this._super();

        /**
         * The particle at the other end of the spring,
         * we assume that we're extending the spring from the
         * particle which is not this one (this one is static)
         * @type {Ape.Particle}
         */
        this.other = other;

        /**
         * Holds the spring constant
         * @type {Ape.Vector3}
         */
        this.springConstant = springConstant;

        /**
         * The length of the material when it's on a rest position
         * @type {number}
         */
        this.restLength = restLength;
    },

    updateForce: function (particle, duration) {
        var vector,
            force,
            magnitude;

        vector = particle.position.clone()
                    .sub(this.other.position);

        // -k (l - l_rest)
        magnitude = -this.springConstant *
            (vector.length() - this.restLength);

        // turn the magnitude into a vector
        // f_spring = magnitude * dˆ
        force = vector.clone().normalize().multiplyScalar(magnitude);
        particle.addForce(force);

        // add a damping factor since the system is perfect
        // but there's some lose of energy
        var dumpingFactor = 0.5;
        force = particle.velocity.clone();
        particle.addForce(
            force.multiplyScalar(-dumpingFactor)
        );
    }
});