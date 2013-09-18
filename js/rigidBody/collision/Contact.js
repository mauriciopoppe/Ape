/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/5/13
 * Time: 11:52 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Represents a contact between 2 rigid bodies (the second rigid body
 * can be null meaning that it can't be moved)
 *
 * Resolving a contact removes their interpenetration and applies
 * sufficient impulse to keep them apart
 * @class Ape.Contact
 */
Ape.Contact = Class.extend({
    init: function (config) {
        config = config || {};
        /**
         * Holds the bodies that are involved in the contact.
         * The second body can be NULL meaning that it's not movable
         * @type {Array}
         */
        this.body = config.body || [];

        /**
         * Holds the normal restitution factor at the contact normal
         * @type {number}
         */
        this.restitution = config.restitution !== undefined ?
            config.restitution : 0;

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

        // ************* Rigid body specific variables *************
        /**
         * Holds the contact point in WORLD coordinates
         * @type {THREE.Vector3}
         */
        this.contactPoint = config.contactPoint || new THREE.Vector3();

        /**
         * Holds the lateral friction coefficient at the contact
         * @type {number}
         */
        this.friction = config.friction || 0;

        /**
         * A transform matrix that converts coordinates in the CONTACT
         * frame of reference to WORLD coordinates, the columns of this
         * matrix form an orthonormal set of vectors
         * @type {Ape.Matrix4}
         */
        this.contactToWorld = new Ape.Matrix4();

        /**
         * Holds the closing velocity at the point of contact
         * (set when `calculateInternals` is run)
         * @type {THREE.Vector3}
         */
        this.contactVelocity = new THREE.Vector3();

        /**
         * Holds the desired change in velocity to apply
         * to give it the correct impulse to the rigid body
         * to resolve the contact
         * @type {THREE.Vector3}
         */
        this.desiredVelocity = new THREE.Vector3();

        /**
         * Holds the relative position of the contact in OBJECT
         * coordinates of both rigid bodies
         * @type {Array<THREE.Vector3>}
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
     * Swaps the bodies (in the case the first is null), this also changes
     * the direction of the contact normal
     * @private
     */
    swapBodies: function () {
        this.contactNormal.multiplyScalar(-1);
        this.body = [this.body[1], this.body[0]];
    },

    /**
     * Calculates internal data from state date, such as:
     *      - contactToWorld
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
     * TODO: consider friction
     */
    calculateContactBasis: function () {
        var contactTangent = [],
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
     * @returns THREE.Vector3
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
        // calculate velocity that is due to forces without reactions
        accumulatedVelocity = body.acceleration.clone().multiplyScalar(duration);
        accumulatedVelocity = this.contactToWorld.transformTranspose(accumulatedVelocity);
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

        // STABILIZATION GOES HERE

        // if the velocity is too low limit the restitution
        if (Math.abs(this.contactVelocity.x) < velocityLimit) {
            restitution = 0;
        }

        this.desiredVelocity = -this.contactVelocity.multiplyScalar(1 + restitution);
    },

    /**
     * Performs the resolution of this contact
     * @param {Array<THREE.Vector3>} velocityChange
     * @param {Array<THREE.Vector3>} rotationChange
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
     * @param {Array<THREE.Vector3>} linearChange
     * @param {Array<THREE.Vector3>} angularChange
     * @param {number} penetration
     */
    applyPositionChange: function (linearChange, angularChange, penetration) {
        var i,
            linearMove = [], angularMove = [],
            inverseInertiaTensor,
            angularInertiaWorld,
            totalInertia = 0,
            linearInertia = [], angularInertia = [];

        for (i = 0; i < 2; i += 1) {
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
        for (i = 0; i < 2; i += 1) {
            angularChange[i] = new THREE.Vector3();
            linearChange[i] = new THREE.Vector3();

            if (this.body[i]) {
                var sign = (i === 0 ? 1 : -1);
                angularMove[i] = sign * this.penetration * angularInertia[i] / totalInertia;
                linearMove[i] = sign * this.penetration * linearInertia[i] / totalInertia;

                // we have the linear amount of movement required by
                // turning the rigid body (in angularMove)
                if(angularMove[i] === 0) {
                    // no angular movement means no rotation
                    angularChange[i].set(0, 0, 0);
                } else {
                    // work out the direction we would like to rotate in
                    var targetAngularDirection = this.relativeContactPosition[i].clone()
                        .cross(
                            this.contactNormal
                        );
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
     * @param {Array<Ape.Matrix3>} inverseInertiaTensor Inverse inertia tensor
     * of the two bodies (`inverseInertiaTensor[1]` might be null)
     * @returns {THREE.Vector3}
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

        return new THREE.Vector3(this.desiredVelocity / deltaVelocity, 0, 0);
    },

    /**
     * Calculates the impulse needed to resolve this contact given that it
     * has friction
     * @param {Array<Ape.Matrix3>} inverseInertiaTensor Inverse inertia tensor
     * of the two bodies (`inverseInertiaTensor[1]` might be null)
     * @returns {THREE.Vector3}
     */
    calculateFrictionImpulse: function (inverseInertiaTensor) {

    }
});