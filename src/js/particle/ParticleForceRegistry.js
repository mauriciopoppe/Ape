/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/31/13
 * Time: 8:51 AM
 * To change this template use File | Settings | File Templates.
 */
Ape.ParticleForceRegistry = Class.extend({
    init: function () {
        /**
         * Keeps track of one force generator and
         * the particle it applies to.
         * Each object is in the form:
         *      {
         *          particle: ...,
         *          forceGenerator: ...
         *      }
         * @type {Array<Object>}
         */
        this.registrations = [];
    },

    /**
     * Registers the given force generator to
     * apply to the given particle
     * @param particle
     * @param forceGenerator
     */
    add: function (particle, forceGenerator) {
        this.registrations.push({
            particle: particle,
            forceGenerator: forceGenerator
        });
    },

    /**
     * Removes the given registered pair from the registry
     * if it's found
     * @param particle
     * @param forceGenerator
     */
    remove: function (particle, forceGenerator) {
        var index = -1;
        this.registrations.forEach(function (item, i) {
            if (item.particle === particle &&
                item.forceGenerator === forceGenerator) {
                index = i;
            }
        });
        if (index !== -1) {
            this.registrations.splice(index, 1);
        }
    },

    /**
     * Clears all the registrations from the registry (it doesn't
     * kill the particles nor the force generators, just the
     * record of their connection)
     */
    clear: function () {
        this.registrations = [];
    },

    /**
     * Calls all the force generators to update the forces of
     * their corresponding particles
     * @param duration
     */
    update: function (duration) {
        this.registrations.forEach(function (item) {
            item.forceGenerator.updateForce(item.particle, duration);
        });
    }
});