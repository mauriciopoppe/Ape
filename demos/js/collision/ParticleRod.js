/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/5/13
 * Time: 11:52 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Links a pair of particles, generating a force if they
 * stray too far apart or too near apart (like a stick)
 *
 * @class Ape.ParticleRod
 */
Ape.ParticleRod = Ape.ParticleLink.extend({
    init: function (config) {
        config = config || {};

        this._super(config);

        /**
         * Holds the maximum length of the rod
         * @type {number}
         */
        this.maxLength = config.maxLength || 0;
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
        if (Math.abs(length - this.maxLength) < 1e-7) {
            return false;
        }

        contact.particles[0] = this.particles[0];
        contact.particles[1] = this.particles[1];

        // calculate the normal
        // should be a vector pointing towards p[1] since
        // we're generating a contact for p[0]
        var normal = this.particles[1].position.clone()
            .sub(this.particles[0].position);
        normal.normalize();

        if (length > this.maxLength) {
            contact.contactNormal = normal;
            contact.penetration = length - this.maxLength;
        } else {
            contact.contactNormal = normal.multiplyScalar(-1);
            contact.penetration = this.maxLength - length;
        }
        contact.restitution = 0;

        return true;
    }
});