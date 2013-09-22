/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/18/13
 * Time: 8:12 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * A helper structure that contains information for the detector
 * to use while it's building its contact data
 *
 * @class Ape.CollisionData
 */
Ape.CollisionData = Class.extend({
    init: function (config) {
        config = config || {};

        /**
         * Holds the contacts array to write into
         * @type {Array}
         */
        this.contacts = [];

        /**
         * Holds the maximum number of contacts the array can take
         * @type {number}
         */
        this.contactsLeft = null;

        /**
         * Holds the friction value to be written into any collision
         * @type {number}
         */
        this.friction = config.friction || 0;

        /**
         * Holds the restitution value to be written into any collision
         * @type {number}
         */
        this.restitution = config.restitution || 0;

        /**
         * Holds the collision tolerance, the objects that are this
         * close should have collisions generated
         * @type {number}
         */
        this.tolerance = config.tolerance || 0;
    },

    /**
     * Checks if there are more contacts available in the contact data
     * @returns {boolean}
     */
    hasMoreContacts: function () {
        return this.contactsLeft > 0;
    },

    /**
     * Resets the collision data
     * @param {number} maxContacts
     */
    reset: function (maxContacts) {
        this.contactsLeft = maxContacts;
        this.contacts = [];
    },

    /**
     * Notifies the data that `count` number of contacts have been written
     * @param count
     */
    addContact: function (count) {
        this.contactsLeft -= count;
    }
});