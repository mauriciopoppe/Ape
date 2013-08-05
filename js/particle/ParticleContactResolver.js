/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/5/13
 * Time: 5:24 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.ParticleContactResolver = Class.extend({
    init: function (maxIterations) {
        /**
         * The maximum number of iterations to be allowed
         * @type {number}
         */
        this.maxIterations = maxIterations;

        /**
         * Iterations used in the resolver
         * @type {number}
         */
        this.iterations = 0;
    },

    /**
     * Resolves a set of particle contacts for both penetration
     * and velocity
     * @param contactArray
     * @param numContacts
     * @param duration
     */
    resolveContacts: function (contactArray, numContacts, duration) {
        this.iterations = 0;
        while (this.iterations < this.maxIterations) {
            // find the contact with the largest closing velocity
            var maxVelocity = 0,
                maxIndex = numContacts;
            contactArray.forEach(function (contact, index) {
                var separatingVelocity = contact.calculateSeparatingVelocity();
                if (separatingVelocity < maxVelocity) {
                    maxVelocity = separatingVelocity;
                    maxIndex = index;
                }
            });

            // resolve this contact
            contactArray[maxIndex].resolve(duration);

            // update the total number of iterations
            this.iterations += 1;
        }
    }
});