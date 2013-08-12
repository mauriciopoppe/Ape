/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/12/13
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */
Ape.ForceGenerator = Class.extend({
    init: function () {
    },

    /**
     * @abstract
     * Applies a force to the given rigid body
     * @param body Reference to the rigid body being affected
     * @param duration
     */
    updateForce: function (body, duration) {
        throw new Error('This is an abstract method so it must be' +
            'implemented in the inheritance chain');
    }
});