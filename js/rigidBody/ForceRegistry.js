/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/12/13
 * Time: 3:59 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.ForceRegistry = Class.extend({
    init: function () {
        /**
         * Keeps track of one force generator and
         * the body it applies to.
         * Each object is in the form:
         *      {
         *          body: ...,
         *          forceGenerator: ...
         *      }
         * @type {Array<Object>}
         */
        this.registrations = [];
    },

    /**
     * Registers the given force generator to apply to the
     * given body
     * @param body
     * @param forceGenerator
     */
    add: function (body, forceGenerator) {
        this.registrations.push({
            body: body,
            forceGenerator: forceGenerator
        });
    },

    /**
     * Removes the given registered pair from the registry
     * if it's found
     * @param body
     * @param forceGenerator
     */
    remove: function (body, forceGenerator) {
        var index = -1;
        this.registrations.forEach(function (item, i) {
            if (item.body === body &&
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
     * kill the body nor the force generators, just the
     * record of their connection)
     */
    clear: function () {
        this.registrations = [];
    },

    /**
     * Calls all the force generators to update the forces of
     * their corresponding bodies
     * @param duration
     */
    update: function (duration) {
        this.registrations.forEach(function (item) {
            item.forceGenerator.updateForce(item.body, duration);
        });
    }
});