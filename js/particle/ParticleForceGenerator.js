/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 8:44 AM
 * To change this template use File | Settings | File Templates.
 */
Ape.ParticleForceGenerator = Class.extend({
    init: function () {
    },

    /**
     * @abstract
     * Update the force of a `particle` for a given `duration`
     * @param particle Reference to the particle being affected
     * @param duration
     */
    updateForce: function (particle, duration) {
        throw new Error('This is an abstract method so it must be' +
            'implemented in the inheritance chain');
    }
});