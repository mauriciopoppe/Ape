/**
 * Utility class to store instances of the subclasses of the class
 * Ape.force.ForceGenerator, there should be a single instance of this class
 * in the entire application, the single instance is in charge of calling
 * the `update()` method of all its registered instances making each one of them
 * apply forces to a given object.
 *
 *      // inside the application and before executing
 *      // the game loop
 *      // ****** before the game loop ******
 *      var registry = new Ape.force.ForceRegistry();
 *
 *      // lets register some `forceGenerator` instances
 *      // given that fgA, fgB, fgC are instances
 *      // that generate forces for the objects A, B, C
 *      // we can register the forces in the registry
 *      registry.add(A, fgA);
 *      registry.add(B, fgB);
 *      registry.add(C, fgC);
 *
 *      // ****** during the game loop ******
 *      // given that the time `delta` is the time elapsed
 *      // since the last frame we can update all the forces
 *      // through the update method
 *      registry.update(delta);
 *
 *      // this will in turn call the `update` method of all
 *      // its registered forces
 *           fgA.updateForce(A, delta);
 *           fgB.updateForce(B, delta);
 *           fgC.updateForce(C, delta);
 *
 * @class Ape.force.ForceRegistry
 */
Ape.force.ForceRegistry = Class.extend({
    init: function () {
        /**
         * Keeps track of one force generator and
         * the body the force will be applied to.
         * Each object is in the form:
         *
         *      {
         *          body: Ape.RigidBody instance,
         *          forceGenerator: Ape.force.ForceGenerator subclass instance
         *      }
         *
         * @type {Ape.force.ForceGenerator[]}
         */
        this.registrations = [];
    },

    /**
     * Registers a body and a force so that later the instance of this
     * class can call the `updateForce` method of the `forceGenerator`
     * applying the force to the `body`.
     *
     *      var registry = new Ape.force.ForceRegistry();
     *
     *      var box = Ape.RigidBodyFactory.createBox({
     *          size: 5,
     *          type: 'simple'
     *      });
     *
     *      var force = new Ape.force.Gravity();
     *
     *      // registers a rigid body and a force in this instance
     *      registry.add({
     *          body: box,
     *          forceGenerator: force
     *      });
     *
     * @param {Ape.RigidBody} body
     * @param {Ape.force.ForceGenerator} forceGenerator
     * @chainable
     */
    add: function (body, forceGenerator) {
        this.registrations.push({
            body: body,
            forceGenerator: forceGenerator
        });
        return this;
    },

    /**
     * Removes the given registered pair from the registry
     * if it's found
     * @param {Ape.RigidBody} body
     * @param {Ape.force.ForceGenerator} forceGenerator
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
     * destroy the body nor the force generators, just the record of their connection)
     * @chainable
     */
    clear: function () {
        this.registrations = [];
        return this;
    },

    /**
     * Grabs each one of the registered tuples (`body` - `forceGenerator`) and
     * applies a force to the `body` through the method Ape.force.ForceGenerator.updateForce
     * of the class Ape.force.ForceGenerator for a given `duration`.
     *
     * @param {number} duration Time elapsed since the last frame in ms
     */
    update: function (duration) {
        this.registrations.forEach(function (item) {
            item.forceGenerator.updateForce(item.body, duration);
        });
    }
});