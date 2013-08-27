/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/18/13
 * Time: 8:12 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * A helper structure that contains information for the detector
 * to use in building its contact data
 *
 * @class Ape.CollisionData
 */
Ape.CollisionData = Class.extend({
    init: function () {
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
         * Holds the number of contacts found so far
         * @type {number}
         */
        this.contactCount = null;

        //TODO: understand where this vars came from
        /**
         * Holds the friction value to be written into any collision
         * @type {number}
         */
        this.friction = null;

        /**
         * Holds the restitution value to be written into any collision
         * @type {number}
         */
        this.restitution = null;

        /**
         * Holds the collision tolerance, the objects that are this
         * close should have collisions generated
         * @type {number}
         */
        this.tolerance = null;
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
        this.contactCount = 0;
        this.contacts = [];
    },

    /**
     * Notifies the data that `count` number of contacts have been written
     * @param count
     */
    addContact: function (count) {
        this.contactsLeft -= count;
        this.contactCount += count;
    }
});