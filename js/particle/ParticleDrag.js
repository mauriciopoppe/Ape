/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 9:09 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Particle drag (air resistance), it depends on the velocity
 * of the object.
 *
 * Simplified model of drag:
 * let v be the normalized vector representing the velocity
 * of the particle
 *
 *      f_drag = -v ( k1 * |v| + k2 * (|v| ^ 2) )
 *
 * @class
 */
Ape.ParticleDrag = Ape.ParticleForceGenerator.extend({
    init: function (k1, k2) {
        this._super();

        /**
         * Drag coefficient
         * @type {Number}
         */
        this.k1 = k1;

        /**
         * Drag coefficient
         * @type {Number}
         */
        this.k2 = k2;
    },

    updateForce: function (particle, duration) {
        var nVelocity = particle.velocity.clone().normalize();

        // f_drag = -|v| ( k1 * |v| + k2 * (|v| ^ 2) )
        var drag = nVelocity.length();
        drag = this.k1 * drag + this.k2 * drag * drag;

        // multiply the drag by the negate of the normalized velocity
        var force = nVelocity.multiplyScalar(-drag);
        particle.addForce(force);
    }
});