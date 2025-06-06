/**
 * A helper structure that contains the contacts detected by
 * the collision detector algorithms, besides it contains
 * the default configuration for each contact such as the
 * `friction`, the `restitution` and the `tolerance`.
 *
 * <hr>
 *
 * Una estructura de soporte que contiene los contactos detectados por
 * los algoritmos de deteccion de colisiones, ademas contiene la configuracion
 * por defecto para cada contacto como su `friccion`, la `restitucion` y la
 * `tolerancia`.
 *
 * @class Ape.collision.CollisionData
 */
Ape.collision.CollisionData = Class.extend({
    init: function (config) {
        config = config || {};

        /**
         * Holds the contacts array to write into
         * @type {Ape.collision.Contact[]}
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
     * @param {Ape.collision.Contact[]} contacts
     */
    addContact: function (contacts) {
	    Ape.assert(contacts instanceof Array);
	    this.contacts.concat(contacts);
        this.contactsLeft -= contacts.length;
    }
});