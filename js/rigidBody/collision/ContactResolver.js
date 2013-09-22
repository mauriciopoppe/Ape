/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 9/12/13
 * Time: 4:34 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * One instance of this class is needed for the whole simulation
 * @class Ape.ContactResolver
 */
Ape.ContactResolver = Class.extend({
    init: function (config) {
        /**
         * Holds the number of iterations to perform when resolving velocity
         * @type {number}
         */
        this.velocityIterations = config.velocityIterations || 1;

        /**
         * To avoid instabilities, velocities smaller than this value
         * are considered to be zero
         * @type {number}
         */
        this.velocityEpsilon = config.velocityEpsilon || 1e-2;

        /**
         * @private
         * Total number of iterations used in the resolver
         * @type {number}
         */
        this.velocityIterationsUsed = 0;

        /**
         * Holds the number of iterations to perform when resolving position
         * @type {number}
         */
        this.positionIterations = config.positionIterations || 1;

        /**
         * @private
         * Total number of iterations used in the resolver
         * @type {number}
         */
        this.positionIterationsUsed = 0;

        /**
         * To avoid instabilities, positions smaller than this value
         * are considered to be zero
         * @type {number}
         */
        this.positionEpsilon = config.positionEpsilon || 1e-2;
    },

    /**
     * Checks if the config is good to continue resolving the contacts
     * @returns {boolean}
     */
    isValid: function () {
        return this.velocityIterations > 0 &&
            this.velocityEpsilon >= 0 &&
            this.positionIterations > 0 &&
            this.positionEpsilon >= 0;
    },

    /**
     * Resolves a set of contacts for both penetration and velocity
     * @param {Array<Ape.Contact>} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    resolveContacts: function (contactArray, numContacts, duration) {
        if (numContacts === 0 || !this.isValid()) {
            return;
        }
        // NOTE: to keep consistency within the API we're passing the
        // same arguments to each function (they might not be used at all)

        // prepare the contacts for processing
        this.prepareContacts(contactArray, numContacts, duration);
        // resolve the interpenetration problems with the contacts
        this.adjustPositions(contactArray, numContacts, duration);
        // resolve the velocity problems with the contacts
        this.adjustVelocities(contactArray, numContacts, duration);
    },

    /**
     * Resolves a set of contacts for both penetration and velocity
     * @param {Array<Ape.Contact>} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    prepareContacts: function (contactArray, numContacts, duration) {
        contactArray.forEach(function (contact) {
            // calculate the internal contact data (basis, inertia, etc)
            contact.calculateInternals(duration);
        });
    },

    /**
     * Resolves a set of contacts for both penetration and velocity
     * @param {Array<Ape.Contact>} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    adjustPositions: function (contactArray, numContacts, duration) {
        var i, b, d,
            linearChange = [], angularChange = [],
            max,
            maxIndex,
            contact,
            deltaPosition;

        this.positionIterationsUsed = 0;
        while(this.positionIterationsUsed++ < this.positionIterations) {

            // find biggest penetration
            max = this.positionEpsilon;
            maxIndex = -1;
            for(i = 0; i < numContacts; i += 1) {
                if (contactArray[i].penetration > max) {
                    max = contactArray[i].penetration;
                    maxIndex = i;
                }
            }
            if (maxIndex === -1) {
                // there are no contacts with a penetration bigger
                // than the minimum allowed: `this.positionEpsilon`
                break;
            }

            contact = contactArray[maxIndex];

            contact.applyPositionChange(
                linearChange,
                angularChange,
                contact.penetration
            );

            // this action may have changed the penetration of other bodies
            // so update the contacts (do not check for collisions again)
            for (i = 0; i < numContacts; i += 1) {
                for (b = 0; b < 2; b += 1) {
                    if (contactArray[i].body[b]) {
                        // check for a match with each body in the newly
                        // resolved contact
                        for (d = 0; d < 2; d += 1) {
                            if (contactArray[i].body[b] === contact.body[d]) {
                                deltaPosition = linearChange[d].clone().add(
                                    angularChange[d].clone().cross(
                                        contactArray[i].relativeContactPosition[b]
                                    )
                                );

                                // the sign is positive if we're dealing with the
                                // second body in a contact and negative otherwise
                                // (we're subtracting the resolution)
                                contactArray[i].penetration +=
                                    deltaPosition
                                        .dot(contactArray[i].contactNormal) *
                                         (b ? 1 : -1);
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * Resolves a set of contacts for both penetration and velocity
     * @param {Array<Ape.Contact>} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    adjustVelocities: function (contactArray, numContacts, duration) {
        var i, b, d,
            velocityChange = [], rotationChange = [],
            max,
            maxIndex,
            contact,
            deltaVelocity;

        this.velocityIterationsUsed = 0;
        while(this.velocityIterationsUsed++ < this.velocityIterations) {

            // find biggest penetration
            max = this.velocityEpsilon;
            maxIndex = -1;
            for(i = 0; i < numContacts; i += 1) {
                if (contactArray[i].desiredVelocity > max) {
                    max = contactArray[i].desiredVelocity;
                    maxIndex = i;
                }
            }
            if (maxIndex === -1) {
                // there are no contacts with a penetration bigger
                // than the minimum allowed: `this.positionEpsilon`
                break;
            }

            contact = contactArray[maxIndex];

            contact.applyVelocityChange(
                velocityChange,
                rotationChange
            );

            // with the change in velocity of the two bodies, the update of
            // contact velocities means that some of the relative closing
            // velocities need recomputing
            for (i = 0; i < numContacts; i += 1) {
                for (b = 0; b < 2; b += 1) {
                    if (contactArray[i].body[b]) {
                        // check for a match with each body in the newly
                        // resolved contact
                        for (d = 0; d < 2; d += 1) {
                            if (contactArray[i].body[b] === contact.body[d]) {
                                deltaVelocity = velocityChange[d].clone().add(
                                    rotationChange[d].clone().cross(
                                        contactArray[i].relativeContactPosition[b]
                                    )
                                );

                                // the sign is positive if we're dealing with the
                                // second body in a contact and negative otherwise
                                // (we're subtracting the resolution)
                                contactArray[i].contactVelocity.add(
                                    contactArray[i].contactToWorld
                                        .transformTranspose(deltaVelocity)
                                        .multiplyScalar(b ? -1 : 1)
                                );

                                // update the desired delta velocity
                                contactArray[i]
                                    .calculateDesiredDeltaVelocity(duration);
                            }
                        }
                    }
                }
            }
        }
    }
});