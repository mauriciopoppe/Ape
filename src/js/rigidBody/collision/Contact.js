/**
 * Represents a contact between 2 rigid bodies (the second rigid body
 * can be null meaning that it can't be moved)
 *
 * Resolving a contact removes their interpenetration and applies
 * sufficient impulse to keep them apart
 *
 * <hr>
 *
 * Representa un contacto entre 2 cuerpos rígidos (el segundo cuerpo puede ser
 * nulo y significaria que no puede ser movido)
 *
 * Al resolver un contacto se elimina la interpenetracion existente y se aplica
 * impulso suficiente para mantenerlos separados
 *
 * @class Ape.collision.Contact
 */
Ape.collision.Contact = Class.extend({
    init: function (config) {
        config = config || {};
        /**
         * Holds the bodies that are involved in the contact.
         * The second body can be NULL meaning that it's not movable
         * @type {Ape.RigidBody[]}
         */
        this.body = config.body || [];

        /**
         * Holds the normal restitution factor at the contact normal
         * @type {number} [restitution=0]
         */
        this.restitution = config.restitution !== undefined ?
            config.restitution : 0;

        /**
         * Holds the direction of the contact in WORLD coordinates
         * @type {Ape.Vector3}
         */
        this.contactNormal = config.contactNormal || new Ape.Vector3();

        /**
         * Holds the depth of penetration at the contact point
         * @type {number}
         */
        this.penetration = config.penetration || null;

        // ************* Rigid body specific variables *************
        /**
         * Holds the contact point in WORLD coordinates
         * @type {Ape.Vector3}
         */
        this.contactPoint = config.contactPoint || new Ape.Vector3();

        /**
         * Holds the lateral friction coefficient at the contact
         * @type {number} [friction=0]
         */
        this.friction = config.friction || 0;

        /**
         * A transform matrix that converts coordinates in the CONTACT
         * frame of reference to WORLD coordinates, the columns of this
         * matrix form an orthonormal set of vectors
         * @type {Ape.Matrix3}
         */
        this.contactToWorld = new Ape.Matrix3();

        /**
         * Holds the closing velocity at the point of contact
         * (set when `calculateInternals` is run)
         * @type {Ape.Vector3}
         */
        this.contactVelocity = new Ape.Vector3();

        /**
         * Holds the desired change in velocity to apply
         * to give it the correct impulse to the rigid body
         * to resolve the contact
         * @type {number} [desiredVelocity=0]
         */
        this.desiredVelocity = 0;

        /**
         * Holds the relative position of the contact in OBJECT
         * coordinates of both rigid bodies
         * @type {Ape.Vector3[]}
         */
        this.relativeContactPosition = [];
    },

    /**
     * Sets the data that doesn't depend on the position of the contact
     * @param {Ape.RigidBody} one
     * @param {Ape.RigidBody} two
     * @param {number} friction
     * @param {number} restitution
     */
    setBodyData: function (one, two, friction, restitution) {
        this.body = [one, two];
        this.friction = friction;
        this.restitution = restitution;
    },

    /**
     * @private
     * Swaps the bodies (in the case the first is null), this also changes
     * the direction of the contact normal
     */
    swapBodies: function () {
        this.contactNormal.multiplyScalar(-1);
        this.body = [this.body[1], this.body[0]];
    },

    /**
     * Calculates internal data useful to create the contact such as:
     *
     * - orthogonal contact basis
     * - relative contact position
     * - velocity at the contact point
     * - velocity change
     *
     * @param {number} duration
     */
    calculateInternals: function (duration) {
        if (!this.body[0]) {
            this.swapBodies();
        }
        Ape.assert(this.body[0]);

        // calculate a set of axes at the contact point
        this.calculateContactBasis();

        // store the relative position of the contact relative to each body
        this.relativeContactPosition[0] = this.contactPoint.clone().sub(
            this.body[0].position
        );
        if (this.body[1]) {
            this.relativeContactPosition[1] = this.contactPoint.clone().sub(
                this.body[1].position
            );
        }

        // find the relative velocities of the bodies at the contact point
        // this method uses the `contactToWorld` matrix and the
        // `relativeContactPosition` array
        this.contactVelocity = this.calculateLocalVelocity(0, duration);
        if (this.body[1]) {
            this.contactVelocity.sub(this.calculateLocalVelocity(1, duration));
        }

        // calculate the desired change in velocity for resolution
        this.calculateDesiredDeltaVelocity(duration);
    },

    /**
     * Calculates an arbitrary orthonormal basis for the contact, this is
     * stored as a 3x3 matrix where each vector is a column (in other words
     * the matrix that transforms from CONTACT space to WORLD space), the x direction
     * is generated from the contact normal, and the (y,z) arbitrary considering
     * which (y,z) axes is closer to the world's (y,z) axes
     */
    calculateContactBasis: function () {
        var contactTangent = [
                new Ape.Vector3(),
                new Ape.Vector3()
            ],
            scale;

        if (Math.abs(this.contactNormal.x) > Math.abs(this.contactNormal.y)) {
            // the Z-axis is nearer to the X axis
            scale = 1 / Math.sqrt(this.contactNormal.z * this.contactNormal.z +
                this.contactNormal.x * this.contactNormal.x);

            // the new X axis is at right angles to the world Y-axis
            contactTangent[0].x = this.contactNormal.z * scale;
            contactTangent[0].y = 0;
            contactTangent[0].z = -this.contactNormal.x * scale;

            // the new Y axis is at right angles to the new X-axis and Z-axis
            contactTangent[1].x = this.contactNormal.y * contactTangent[0].x;
            contactTangent[1].y = this.contactNormal.z * contactTangent[0].x -
                this.contactNormal.x * contactTangent[0].z;
            contactTangent[1].z = -this.contactNormal.y * contactTangent[0].x;
        } else {
            // the Z-axis is nearer to the Y axis
            scale = 1 / Math.sqrt(this.contactNormal.z * this.contactNormal.z +
                this.contactNormal.y * this.contactNormal.y);

            // The new X-axis is at right angles to the world X-axis
            contactTangent[0].x = 0;
            contactTangent[0].y = -this.contactNormal.z * scale;
            contactTangent[0].z = this.contactNormal.y * scale;

            // The new Y-axis is at right angles to the new X-axis and Z- axis
            contactTangent[1].x = this.contactNormal.y * contactTangent[0].z -
                this.contactNormal.z * contactTangent[0].y;
            contactTangent[1].y = -this.contactNormal.x * contactTangent[0].z;
            contactTangent[1].z = this.contactNormal.x * contactTangent[0].y;
        }

        this.contactToWorld.setComponents(
            this.contactNormal,
            contactTangent[0],
            contactTangent[1]
        );
    },

    /**
     * Calculates the velocity of the contact point on the given body:
     *
     *      // the angular velocity is given by
     *      angularVelocity = bodyRotation (cross) relativeContactPosition
     *      linearVelocity = bodyVelocity
     *      // the total closing velocity is:
     *      velocity = angularVelocity + linearVelocity
     *
     * @param {number} bodyIndex
     * @param {number} duration
     * @returns Ape.Vector3
     */
    calculateLocalVelocity: function (bodyIndex, duration) {
        var body = this.body[bodyIndex],
            velocity,
            contactVelocity,
            accumulatedVelocity;

        // the velocity is equal to the linear velocity +
        // the angular velocity at the contact point
        velocity = body.angularVelocity.clone().cross(
            this.relativeContactPosition[bodyIndex]
        );
        velocity.add(body.linearVelocity);

        // transform the velocity from WORLD coordinates to CONTACT coordinates
        contactVelocity = this.contactToWorld.transformTranspose(velocity);

        // STABILIZATION and FRICTION
        // calculate the amount of velocity that is due to forces without reactions
        accumulatedVelocity = body.lastFrameAcceleration.clone()
            .multiplyScalar(duration);
        accumulatedVelocity = this.contactToWorld
            .transformTranspose(accumulatedVelocity);
        // ignore any velocity change in the direction of the contact normal
        // only check planar acceleration
        accumulatedVelocity.x = 0;
        contactVelocity.add(accumulatedVelocity);

        // process velocity
        return contactVelocity;
    },

    /**
     * Calculates the velocity based on the linear velocity +
     * the angular velocity of the contact point
     *
     * @param {number} duration
     */
    calculateDesiredDeltaVelocity: function (duration) {
        var velocityLimit = 0.25,
            restitution = this.restitution;

        // STABILIZATION
        var accumulatedVelocity = this.body[0].lastFrameAcceleration
            .dot(this.contactNormal) * duration;

        if (this.body[1]) {
            accumulatedVelocity -= this.body[1].lastFrameAcceleration
                .dot(this.contactNormal) * duration;
        }

        // if the velocity is too low limit the restitution
        // to avoid the vibration of the rigid bodies
        if (Math.abs(this.contactVelocity.x) < velocityLimit) {
            restitution = 0;
        }

//        this.desiredVelocity = -this.contactVelocity.x * (1 + restitution);
        this.desiredVelocity = -this.contactVelocity.x -
            restitution * (this.contactVelocity.x - accumulatedVelocity);
    },

    /**
     * Turns an impulse generated into velocity and rotation change
     * @param {Ape.Vector3[]} velocityChange
     * @param {Ape.Vector3[]} rotationChange
     */
    applyVelocityChange: function (velocityChange, rotationChange) {
        var inverseInertiaTensor = [],
            impulseContact,
            impulsiveTorque,
            impulse,
            i;
        for (i = 0; i < 2; i += 1) {
            if (this.body[i]) {
                inverseInertiaTensor[i] = this.body[i].inverseInertiaTensor;
            }
        }

        // calculate the impulse required
        impulseContact = this[this.friction === 0 ? 'calculateFrictionlessImpulse' :
            'calculateFrictionImpulse'](inverseInertiaTensor);

        // convert impulse to world coordinates
        impulse = this.contactToWorld.transform(impulseContact);

        // split the impulse into linear and rotational components
        // first body
        impulsiveTorque = this.relativeContactPosition[0].clone().cross(impulse);
        rotationChange[0] = inverseInertiaTensor[0].transform(impulsiveTorque);
        velocityChange[0] = impulse.clone().multiplyScalar(this.body[0].getInverseMass());
        // apply the changes
        this.body[0].addVelocity(velocityChange[0]);
        this.body[0].addRotation(rotationChange[0]);

        // second body
        if (this.body[1]) {
            impulsiveTorque = impulse.clone().cross(this.relativeContactPosition[1]);
            rotationChange[1] = inverseInertiaTensor[1].transform(impulsiveTorque);
            velocityChange[1] = impulse.clone().multiplyScalar(-this.body[1].getInverseMass());
            // apply the changes
            this.body[1].addVelocity(velocityChange[1]);
            this.body[1].addRotation(rotationChange[1]);
        }
    },

    /**
     * Applies a change in the position considering the linear and angular
     * changes in the position
     * @param {Ape.Vector3[]} linearChange
     * @param {Ape.Vector3[]} angularChange
     * @param {number} penetration
     */
    applyPositionChange: function (linearChange, angularChange, penetration) {
        var i,
            linearMove = [], angularMove = [],
            inverseInertiaTensor,
            angularInertiaWorld,
            totalInertia = 0,
            linearInertia = [], angularInertia = [];

        // work out the inertia of each object in the direction
        // of the contact normal due to angular inertia only
        for (i = -1; ++i < 2;) {
            if (this.body[i]) {
                inverseInertiaTensor = this.body[i].inverseInertiaTensor;

                // angular inertia
                angularInertiaWorld = this.relativeContactPosition[i].clone().cross(
                    this.contactNormal
                );
                angularInertiaWorld = inverseInertiaTensor.transform(angularInertiaWorld);
                angularInertiaWorld.cross(this.relativeContactPosition[i]);
                angularInertia[i] = angularInertiaWorld.dot(this.contactNormal);

                // the linear component is simply the inverse mass
                linearInertia[i] = this.body[i].getInverseMass();

                totalInertia += linearInertia[i] + angularInertia[i];
            }
        }

        // loop again to apply the changes
        for (i = -1; ++i < 2;) {
            angularChange[i] = new Ape.Vector3();
            linearChange[i] = new Ape.Vector3();

            if (this.body[i]) {
                var sign = (i === 0 ? 1 : -1);
                angularMove[i] = sign * this.penetration * (angularInertia[i] / totalInertia);
                linearMove[i] = sign * this.penetration * (linearInertia[i] / totalInertia);

                // we have the linear amount of movement required by
                // turning the rigid body (in angularMove)
                if(angularMove[i] === 0) {
                    // no angular movement means no rotation
                    angularChange[i].set(0, 0, 0);
                } else {
                    // work out the direction we would like to rotate in
                    var targetAngularDirection = this.relativeContactPosition[i].clone()
                        .cross(this.contactNormal);
                    inverseInertiaTensor = this.body[i].inverseInertiaTensor;
                    angularChange[i] = inverseInertiaTensor.transform(targetAngularDirection)
                        .multiplyScalar(angularMove[i] / angularInertia[i]);
                }
                linearChange[i] = this.contactNormal.clone().multiplyScalar(linearMove[i]);

                // apply changes
                // change in position
                this.body[i].position.add(linearChange[i]);
                // change in orientation
                this.body[i].orientation.addScaledVector(angularChange[i], 1);
                this.body[i].rotation.setFromQuaternion(
                    this.body[i].orientation,
                    THREE.Euler.DefaultOrder
                );

                this.body[i].calculateDerivedData();
            }
        }
    },

    /**
     * Calculates the impulse needed to resolve this contact given that it
     * has no friction
     * @param {Ape.Matrix3[]} inverseInertiaTensor Inverse inertia tensor
     * of the two bodies (`inverseInertiaTensor[1]` might be null)
     * @returns {Ape.Vector3}
     */
    calculateFrictionlessImpulse: function (inverseInertiaTensor) {
        var deltaVelocityWorld,
            deltaVelocity;

        // first body
        deltaVelocityWorld = this.relativeContactPosition[0].clone()
            .cross(this.contactNormal);
        deltaVelocityWorld = inverseInertiaTensor[0].transform(deltaVelocityWorld);
        deltaVelocityWorld = deltaVelocityWorld.clone()
            .cross(this.relativeContactPosition[0]);

        // transform to contact coordinates
        deltaVelocity =
            // angular component
            deltaVelocityWorld.dot(this.contactNormal) +
                // linear component
                this.body[0].getInverseMass();

        if (this.body[1]) {
            deltaVelocityWorld = this.relativeContactPosition[1].clone()
                .cross(this.contactNormal);
            deltaVelocityWorld = inverseInertiaTensor[1].transform(deltaVelocityWorld);
            deltaVelocityWorld = deltaVelocityWorld.clone()
                .cross(this.relativeContactPosition[1]);

            // transform to contact coordinates
            deltaVelocity +=
                // angular component
                deltaVelocityWorld.dot(this.contactNormal) +
                    // linear component
                    this.body[1].getInverseMass();
        }

        return new Ape.Vector3(this.desiredVelocity / deltaVelocity, 0, 0);
    },

    /**
     * Calculates the impulse needed to resolve this contact given that it
     * has friction
     * @param {Ape.Matrix3[]} inverseInertiaTensor Inverse inertia tensor
     * of the two bodies (`inverseInertiaTensor[1]` might be null)
     * @returns {Ape.Vector3}
     */
    calculateFrictionImpulse: function (inverseInertiaTensor) {
        var impulseContact,
            inverseMass = this.body[0].getInverseMass(),
            impulseToTorque = new Ape.Matrix3()
                .setSkewSymmetric(this.relativeContactPosition[0]);

        // build the matrix to convert contact impulse to change
        // in velocity in world coordinates
        var deltaToWorld = impulseToTorque.clone();
        deltaToWorld = deltaToWorld.multiply(inverseInertiaTensor[0]);
        deltaToWorld = deltaToWorld.multiply(impulseToTorque);
        deltaToWorld = deltaToWorld.multiplyScalar(-1);

        if (this.body[1]) {
            inverseMass += this.body[1].getInverseMass();
            impulseToTorque.setSkewSymmetric(this.relativeContactPosition[1]);

            var deltaToWorld2 = impulseToTorque.clone();
            deltaToWorld2 = deltaToWorld2.multiply(inverseInertiaTensor[1]);
            deltaToWorld2 = deltaToWorld2.multiply(impulseToTorque);
            deltaToWorld2 = deltaToWorld2.multiplyScalar(-1);

            deltaToWorld = deltaToWorld.add(deltaToWorld2);
        }

        // change to contact coordinates
        var deltaVelocity = this.contactToWorld.transpose();
        deltaVelocity = deltaVelocity.multiply(deltaToWorld);
        deltaVelocity = deltaVelocity.multiply(this.contactToWorld);

        // add in the linear velocity change to the diagonal
        deltaVelocity.data[0] += inverseMass;
        deltaVelocity.data[4] += inverseMass;
        deltaVelocity.data[8] += inverseMass;

        var impulseMatrix = deltaVelocity.inverse();
        var velocityKill = new Ape.Vector3(
            this.desiredVelocity,
            -this.contactVelocity.y,
            -this.contactVelocity.z
        );
        impulseContact = impulseMatrix.transform(velocityKill);
        var planarImpulse = Math.sqrt(impulseContact.y * impulseContact.y +
            impulseContact.z * impulseContact.z);
        if (planarImpulse > impulseContact.x * this.friction) {
            impulseContact.y /= planarImpulse;
            impulseContact.z /= planarImpulse;

            impulseContact.x = deltaVelocity.data[0] +
                deltaVelocity.data[1] * this.friction * impulseContact.y +
                deltaVelocity.data[2] * this.friction * impulseContact.z;

            impulseContact.x = this.desiredVelocity / impulseContact.x;
            impulseContact.y *= this.friction * impulseContact.x;
            impulseContact.z *= this.friction * impulseContact.x;
        }
        return impulseContact;
    }
});