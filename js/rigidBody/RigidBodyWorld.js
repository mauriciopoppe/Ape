/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 9/20/13
 * Time: 9:43 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Base class for any rigid body demo
 * @class Ape.RigidBodyWorld
 */
Ape.RigidBodyWorld = T3.World.extend({
    init: function (config) {
        var me = this;
        this._super(config);

        /**
         * Holds the maximum number of contacts allowed
         * @type {number}
         */
        this.maxContacts = config.maxContacts || 256;


        // ********* INTERNAL *********
        /**
         * The user can register new forces through this instance
         * @type {Ape.ForceRegistry}
         */
        this.forceRegistry = new Ape.ForceRegistry();
        /**
         * Holds the contacts to be resolved by the Collision
         * Resolver class
         * @type {Ape.CollisionData}
         */
        this.collisionData = new Ape.CollisionData();

        /**
         * Holds the contact resolver
         * @type {Ape.ContactResolver}
         */
        this.resolver = new Ape.ContactResolver({
            velocityIterations: this.maxContacts * 8,
            positionIterations: this.maxContacts * 8
        });
    },

    update: function (delta) {
        // hook to make the subclass decide how it's going to
        // integrate the accumulated forces of its bodies
        this.updateObjects(delta);

        this.generateContacts();
        this.resolver.resolveContacts(
            this.collisionData.contacts,
            this.collisionData.contacts.length,
            delta
        );

        // updates the camera's orbit and pan controls
        this._super(delta);
    },

    /**
     * @abstract
     * @template
     * Updates the objects (rigid bodies) integrating the forces
     * accumulated
     * @param delta
     */
    updateObjects: function (delta) {
        throw new Error('Ape.RigidBodyWorld.updateObjects(): ' +
            'abstract method not implemented');
    },

    /**
     * @abstract
     * @template
     * Generates the contacts used by the resolver, it must fill
     * the array `this.contacts`
     */
    generateContacts: function () {
        throw new Error('Ape.RigidBodyWorld.generateContacts(): ' +
            'abstract method not implemented');
    }
});