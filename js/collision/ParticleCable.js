/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/5/13
 * Time: 11:52 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Links a pair of particles, generating a force if they
 * stray too far apart
 *
 * @class Ape.ParticleCable
 */
Ape.ParticleCable = Ape.ParticleLink.extend({
    init: function (config) {
        config = config || {};

        this._super(config);

        /**
         * Holds the maximum length of the cable
         * @type {number}
         */
        this.maxLength = config.maxLength || 0;

        /**
         * Holds the restitution (bounciness) of the cable
         * @type {number}
         */
        this.restitution = config.restitution || 1;
    },

    /**
     * Returns the current length of the cable
     */
    currentLength: function () {
        var relativePosition = this.particles[0].position.clone()
            .sub(this.particles[1].position);
        return relativePosition.length();
    },

    /**
     * As described in the superclass' method
     *
     * @param contact
     * @param limit
     */
    fillContact: function (contact, limit) {
        var length = this.currentLength();

        // only generate a contact if the cable is overextended
        if (length < this.maxLength) {
            return false;
        }

        contact.particles[0] = this.particles[0];
        contact.particles[1] = this.particles[1];

        // calculate the normal
        var normal = this.particles[1].position.clone()
            .sub(this.particles[0].position);
        normal.normalize();

        contact.contactNormal = normal;
        contact.penetration = length - this.maxLength;
        contact.restitution = this.restitution;

        return true;
    }
});