/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 9:09 AM
 * To change this template use File | Settings | File Templates.
 */
Ape.ParticleGravity = Ape.ParticleForceGenerator.extend({
    init: function (gravity) {
        this._super();

        /**
         * Gravity acceleration
         * @type {Ape.Vector3}
         */
        this.gravity = gravity;
    },

    updateForce: function (particle, duration) {
        if (particle.getMass() === Infinity) {
            // gravity doesn't affect infinite mass objects
            return;
        }

        // apply the mass-scaled force to the particle
        // f = m * a
        particle.addForce(
            this.gravity.multiplyScalar(particle.getMass())
        );
    }
});