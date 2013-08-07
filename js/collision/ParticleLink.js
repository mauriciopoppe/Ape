/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/5/13
 * Time: 11:52 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Links two particles together generating an inverse contact if they
 * violate the constraints of the other link, it's a base class for
 * cables and rods
 *
 * @class Ape.ParticleLink
 */
Ape.ParticleLink = Class.extend({
    init: function (config) {
        config = config || {};
        /**
         * Holds the particles that are connected by this link
         * @type {Array}
         */
        this.particles = config.particles || [];
    },

    /**
     * Returns the current length of the cable
     */
    currentLength: function () {

    },

    /**
     * @abstract
     * Fills the contact given with the contact needed to keep this link
     * from violating its constraint (the link cannot stretch more than the
     * length of the link)
     *
     * @param contact
     * @param limit
     */
    fillContact: function (contact, limit) {

    }
});