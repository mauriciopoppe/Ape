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
Ape.ParticleContact = Class.extend({
    init: function (config) {
        config = config || {};
        /**
         * Holds the particles that are involved in the contact,
         * the second particle can be null if it can't be moved
         * @type {Array}
         */
        this.particles = config.particles || [];

        /**
         * Holds the normal restitution coefficient at the contact
         * @type {number}
         */
        this.restitution = config.restitution !== undefined ?
            config.restitution : 1;

        /**
         * Holds the direction of the contact (from the first
         * particle perspective)
         * @type {THREE.Vector3}
         */
        this.contactNormal = config.contactNormal || new THREE.Vector3();

        /**
         * Holds the depth of penetration at the contact
         * @type {number}
         */
        this.penetration = config.penetration || null;
    },

    /**
     * Resolves the contact for both velocity and interpenetration
     * @param duration
     */
    resolve: function (duration) {
        this.resolveVelocity(duration);
        this.resolveInterpenetration(duration);
    },

    /**
     * Calculates the separating velocity at this contact
     * i.e.
     *      v_separating = (va - vb) dot (contactNormal)
     */
    calculateSeparatingVelocity: function () {
        var relativeVelocity = this.particles[0].velocity.clone();
        if (this.particles[1]) {
            relativeVelocity.sub(this.particles[1].velocity.clone());
        }
        return relativeVelocity.dot(this.contactNormal);
    },

    /**
     * Resolves the impulse calculations for this contact
     * @param duration
     */
    resolveVelocity: function (duration) {
        var separatingVelocity = this.calculateSeparatingVelocity();

        // check if the contact needs to be resolved
        if (separatingVelocity > 0) {
            // the particles are separating so there's no contact
            return;
        }

        // calculate the new separating velocity
        // vs' = -c * vs
        var newSeparatingVelocity = -this.restitution * separatingVelocity;

        // check the velocity build-up due to acceleration only
        var accCausedVelocity = this.particles[0].acceleration.clone();
        if (this.particles[1]) {
            accCausedVelocity.sub(this.particles[1].acceleration);
        }
        var accCausedSepVelocity = accCausedVelocity.dot(this.contactNormal) * duration;

        // if we get a closing velocity (i.e. vs < 0) due to acceleration build-up
        // then remove it from the new separating velocity
        if (accCausedSepVelocity < 0) {
            // vs' = -c * vs + c * vs_accCaused
            newSeparatingVelocity += this.restitution * accCausedSepVelocity;
            // the new separating velocity must be strictly greater than zero
            // otherwise we would be forcing the particle to get closer that what
            // it's allowed
            if (newSeparatingVelocity < 0) {
                newSeparatingVelocity = 0;
            }
        }

        var deltaVelocity = newSeparatingVelocity - separatingVelocity;

        // apply the change in velocity to each object in proportion to
        // their inverse mass
        var totalInverseMass = this.particles[0].getInverseMass();
        if (this.particles[1]) {
            totalInverseMass += this.particles[1].getInverseMass();
        }

        // if all particles have infinite mass then the impulses
        // won't have any effect
        if (totalInverseMass <= 0) {
            return;
        }

        // calculate the impulse to apply
        // We know that:
        //      f = m * a = m * dv / dt
        //      f * dt = m * dv
        // f * dt is the impulse which represents a quantity of motion to
        // be applied to the object:
        //
        // let:
        //      p be the impulse
        //      v the velocity of the particle
        //      m the mass of the particle
        // p = m * v
        // if we have the inverseMass instead then
        // p = 1 / (1 / m) * m
        // and (1 / m) == inverseMass
        // so p = (1 / inverseMass) * v
        // p = v / inverseMass
//        var impulse = deltaVelocity / totalInverseMass;
        var velocityProjection = this.particles[0].velocity.dot(this.contactNormal);
        if (this.particles[1]) {
            velocityProjection += -this.particles[1].velocity.dot(this.contactNormal);
        }
        var impulse = -(1 + this.restitution) * velocityProjection / totalInverseMass;

        // amount of impulse per unit of inverse mass
        // this is the total impulse that will be distributed between the particles,
        // for particleA it will be applied in the same direction as the contact
        // normal and for particleB (if possible) it will be pushed in the opposite
        // direction (-contactNormal)
        // let's calculate the amount of impulse needed to move 1 unit of mass
        // in the direction of the contact normal
        var impulsePerIMass = this.contactNormal.clone()
            .multiplyScalar(impulse);

        // apply the impulse immediately to the particles (it'll be distributed)
        // between them based on their mass
        // let:
        //      g be the impulse
        //      v the velocity of the particle
        //      m the mass of the particle
        //
        // g = v * m
        // v = (1 / m) * g
        // applying this new velocity to the velocity of the particle yields:
        // newVelocity = oldVelocity + (1 / m) * g
        this.particles[0].velocity
            .add(impulsePerIMass.clone()
                .multiplyScalar(this.particles[0].getInverseMass()));

        if (this.particles[1]) {
            this.particles[1].velocity
                .add(impulsePerIMass.clone()
                    .multiplyScalar(-this.particles[1].getInverseMass()));
        }

    },

    /**
     * Resolves the interpenetration issues (moves the objects apart if there
     * is a contact)
     * @param duration
     */
    resolveInterpenetration: function (duration) {
        if (this.penetration <= 0) {
            // resolve only penetrations that are greater than zero (meaning
            // that there's penetration)
            return;
        }

        // the movement is based on the inverse mass of each object
        // so the strategy is to calculate the movement for the sum of the
        // masses and then distribute the movement between the particles
        var totalInverseMass = this.particles[0].getInverseMass();
        if (this.particles[1]) {
            totalInverseMass += this.particles[1].getInverseMass();
        }

        // if all particles have infinite mass then the impulses
        // won't have any effect
        if (totalInverseMass <= 0) {
            return;
        }

        // find the amount of penetration resolution per unit of inverse mass
        // applied in the direction of the contact normal
        // Let's consider that we have the sum of the masses instead of the
        // sum of the inverse masses, so if we want to move two particles
        // in the opposite directions to resolve the penetration, we have to
        // apply the movement in proportion to their mass:
        //
        //     movement = penetration
        //     sumOfMasses = massA + massB
        //     movementForA = movement * massA / sumOfMasses
        //     movementForB = movement * massB / sumOfMasses
        //
        // we have the sum of the inverse masses instead, since a proportion
        // will be used there's no need to make the conversion from the sum
        // of inverse masses to the sum of masses
        //
        //     movement = penetration
        //     sumOfIMasses = IMassA + IMassB
        //     movementForA = movement * IMassA / sumOfIMasses
        //     movementForB = movement * IMassB / sumOfIMasses
        var movePerIMass = this.contactNormal.clone()
            .multiplyScalar(this.penetration / totalInverseMass);

        this.particles[0].position
            .add(movePerIMass.clone()
                .multiplyScalar(this.particles[0].getInverseMass()));

        if (this.particles[1]) {
            this.particles[1].position
                .add(movePerIMass.clone()
                    .multiplyScalar(-this.particles[1].getInverseMass()));
        }
    }
});