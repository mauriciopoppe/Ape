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
     * @param duration
     */
    resolveContacts: function (contactArray, duration) {
        this.iterations = 0;

        // this while is used because after resolving a contact we may cause another
        // contact and so on, so this while limits the number of iterations
        while (this.iterations < this.maxIterations) {
            // find the contact with the largest closing velocity
            var maxVelocity = 0,
                maxIndex = contactArray.length - 1;

            contactArray.forEach(function (contact, index) {
                var separatingVelocity = contact.calculateSeparatingVelocity();
                if (separatingVelocity < maxVelocity) {
                    maxVelocity = separatingVelocity;
                    maxIndex = index;
                }
            });

            // TEST:
            var contact = contactArray[maxIndex],
                posI = contact.particles[0].position,
                posJ = contact.particles[1].position;
            contact.penetration = contact.particles[0].radius * 2 -
                posI.distanceTo(posJ);
            contact.contactNormal = posI.clone()
                .sub(posJ).normalize();

            // resolve the contact with the largest closing velocity
            contactArray[maxIndex].resolve(duration);

            // update the total number of iterations
            this.iterations += 1;
        }
    }
});