/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/5/13
 * Time: 11:52 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Represents a contact between 2 particles (the second particle
 * can be null meaning that it can't be moved)
 *
 * Resolving a contact removes their interpenetration and applies
 * sufficient impulse to keep them apart
 * @class Ape.ParticleContact
 */
Ape.Contact = Class.extend({
    init: function (config) {
        config = config || {};
        /**
         * Holds the position of the contact in WORLD coordinates
         * @type {THREE.Vector3}
         */
        this.particles = config.particles || [];

        /**
         * Holds the direction of the contact in WORLD coordinates
         * @type {THREE.Vector3}
         */
        this.contactNormal = config.contactNormal || new THREE.Vector3();

        /**
         * Holds the depth of penetration at the contact point
         * @type {number}
         */
        this.penetration = config.penetration || null;
    }
});