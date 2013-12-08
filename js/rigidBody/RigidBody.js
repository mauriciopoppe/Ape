(function () {
    var RigidBody;

    /**
     * Class whose instances represent a RigidBody, an idealization of a solid structure
     * (which means that it can't be deformed under any force applied)
     * 
     * This class holds many characteristics of the rigid bodies such as:
     * 
     * - Position
     * - Orientation
     * - Linear and angular velocity
     * - Linear and angular acceleration
     * - Mass
     * - Inertia tensor
     * 
     * The rigid body has a method called Ape.RigidBody.integrate that integrates the
     * characteristics of the rigid body transforming its properties with the following
     * algorithm
     * 
     * - Before the integrate method is run, the rigid body accumulates forces and
     * torque to be integrated later
     * - When the integrate method is called the force and torque are transformed
     * in a linear and angular acceleration change
     * - The linear and angular acceleration change is transformed into a change
     * of the linear and angular velocities of the rigid body
     * - These changes cause that the position and orientation of the object change too
     * - The accumulators (force and torque acummulators) are cleaned
     * since the force is only applied in a single frame
     * 
     * @class Ape.RigidBody
     */
    RigidBody = function () {
        THREE.Mesh.apply(this, arguments);
        // ************** DATA AND STATE **************
        /**
         * Inverse of the mass:
         *
         *      f = m * a (force equals mass times acceleration)
         *      a = (1 / m) * f (1 / m is the inverse of the mass)
         *
         * This means that infinite mass object have a zero inverse mass since 1 / ∞ = 0
         * Objects of zero mass have an undefined inverse mass
         * @property {number}
         */
        this.inverseMass = 1.0;
        /**
         * Holds the inverse of the body's inertia tensor given in BODY space
         * @property {Ape.Matrix3}
         */
        this.inverseInertiaTensor = new Ape.Matrix3();
        /**
         * Holds the amount of damping applied to linear
         * motion. Damping is required to remove energy added
         * through numerical instability in the integrator.
         * @property {number}
         */
        this.linearDamping = 0.9;
        /**
         * Holds the amount of damping applied to angular
         * motion. Damping is required to remove energy added
         * through numerical instability in the integrator.
         * @property {number}
         */
        this.angularDamping = 0.9;
        /**
         * Holds the linear position of the rigid body in
         * world space.
         * @property {Ape.Vector3}
         */
        this.position = this.position || new Ape.Vector3();
        /**
         * Holds the angular orientation of the rigid body in WORLD space
         * @property {Ape.Quaternion}
         */
        this.orientation = new Ape.Quaternion();
        /**
         * Holds the linear velocity of the rigid body in
         * world space.
         * @property {Ape.Vector3}
         */
        this.linearVelocity = new Ape.Vector3();
        /**
         * Holds the angular velocity or rotation of the rigid body in world space
         * @property {Ape.Vector3}
         */
        this.angularVelocity = new Ape.Vector3();

        // ************** DERIVED DATA **************
        // information that's derived from the other data in the class
        /**
         * Holds the inverse of the body's inertia tensor in WORLD coordinates
         * (it's calculated each frame in `calculateDerivedData`
         * @property {Ape.Matrix3}
         */
        this.inverseInertiaTensorWorld = new Ape.Matrix3();
        /**
         * Holds a transform matrix for converting body space
         * into world space and vice versa. This can be achieved by calling the
         * getPointInSpace functions.
         * @property {Ape.Matrix4}
         */
        this.transformMatrix = new Ape.Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0
        );

        // ************** FORCE AND TORQUE ACCUMULATORS **************
        // store the current force, torque and acceleration of the rigid body
        /**
         * Holds the accumulated force to be applied at the next
         * simulation iteration only. This value is zeroed at each integration step.
         * @property {Ape.Vector3}
         */
        this.accumulatedForce = new Ape.Vector3();
        /**
         * Holds the accumulated torque to be applied at the next
         * simulation iteration only. This value is zeroed at each integration step.
         * @property {Ape.Vector3}
         */
        this.accumulatedTorque = new Ape.Vector3();
        /**
         * Holds the acceleration of the rigid body, can be used to set
         * acceleration due to gravity or any other CONSTANT acceleration
         * @property {Ape.Vector3}
         */
        this.acceleration = new Ape.Vector3();


        // ************** STABILIZATION **************
        /**
         * To remove any velocity that has been built up from
         * acceleration we need to create a new data member which is this
         * @property {Ape.Vector3}
         */
        this.lastFrameAcceleration = new Ape.Vector3();
    };

    RigidBody.prototype = new THREE.Mesh();

    Ape.extend(RigidBody.prototype, {
        /**
         * Setter for the mass (it updates the `inverseMass` property)
         * @param {number} m
         */
        setMass: function (m) {
            Ape.assert(m !== 0);
            this.inverseMass = 1 / m;
        },

        /**
         * Setter for the inverse mass
         * @param {number} m
         */
        setInverseMass: function (m) {
            this.inverseMass = m;
        },

        /**
         * Gets the mass (transformed from the `inverseMass`)
         * @returns {number}
         */
        getMass: function () {
            if (this.inverseMass < 1e-9) {
                return Infinity;
            }
            return 1 / this.inverseMass;
        },

        /**
         * Gets the inverse mass
         * @returns {number}
         */
        getInverseMass: function () {
            return this.inverseMass;
        },

        /**
         * Integrates the rigid body forward in time by `delta` ms with the
         * following algorithm:
         * 
         * - The force accumulated is turned into linear acceleration and added
         * to the constant `acceleration` property
         * - The torque accumulated is turned into angular acceleration
         * - The linear acceleration is turned into linear velocity 
         * - The angular acceleration is turned into angular velocity
         * - THE linear and angular velocities suffer from damping (reducing
         * their value to simulate a damping force)
         * - The position is updated using the linear velocity calculated above
         * - The orientation is updated using the angular velocity calculated above
         * - The derived properties of the body are calculated again (since
         * the rigid body has changed its properties)
         * - The accumulators are cleaned
         *
         * This method should be called once per frame in the game loop to assure
         * the rigid body is correctly transformed.
         *
         * @param {number} delta Time elapsed since the last frame
         */
        integrate: function (delta) {
            Ape.assert(delta > 0);

            // calculate linear acceleration from force inputs
            // a' = old_a + a
            // let:
            //      f = m * a
            //      a = f * (1 / m)
            // so:
            // a' = old_a + f * m^(-1)
            var linearAcceleration =
                this.acceleration.clone()
                    .add(
                        this.accumulatedForce.clone()
                            .multiplyScalar(this.inverseMass)
                    );

            // calculate angular acceleration from force inputs
            // let:
            //      a be the angular acceleration
            //      I be the moment of inertia
            //      r be the torque vector
            // r = I * a
            // a = I^(-1) * r
            var angularAcceleration =
                this.inverseInertiaTensorWorld.transform(
                    this.accumulatedTorque
                );

            // PHASE 1: Velocities adjustment
            // linear velocity update
            // v' = v + linear_acceleration * delta
            this.linearVelocity
                .add(
                    linearAcceleration
                        .multiplyScalar(delta)
                );
            // angular velocity update
            // let:
            //      w be the angular velocity of the rigid body
            // w' = w + angular_acceleration * delta
            this.angularVelocity
                .add(
                    angularAcceleration
                        .multiplyScalar(delta)
                );

            // impose drag
            this.linearVelocity
                .multiplyScalar(
                    Math.pow(this.linearDamping, delta)
                );
            this.angularVelocity
                .multiplyScalar(
                    Math.pow(this.angularDamping, delta)
                );

            // PHASE 2: Position adjustment
            // linear position update
            // position' = position + v * t + 0.5 * a * t * t
            this.position
                .add(
                    this.linearVelocity.clone()
                        .multiplyScalar(delta)
                )
                // since delta squared times 0.5 gives a really small number,
                // the acceleration is commonly ignored
                .add(
                    this.acceleration.clone()
                        .multiplyScalar(delta * delta * 0.5)
                );

            // angular position (orientation) update
            this.orientation
                .addScaledVector(this.angularVelocity, delta);

            // TEST IN THREE JS:
            // the rotation of an object uses euler angles, since we have
            // a quaternion we have to update the rotation converting
            // the quaternion to euler angles
            this.rotation.setFromQuaternion(
                this.orientation,
                THREE.Euler.DefaultOrder
            );

            // STABILIZATION
            this.lastFrameAcceleration = linearAcceleration;

            // normalize the orientation, update the transformMatrix and
            // inverseInertiaTensor matrices to reflect the new changes
            // to the position and orientation of the body
            this.calculateDerivedData();

            // clears the forces and torque accumulated in the last frame
            this.clearAccumulators();
        },

        /**
         * Updates the information of the body like its transform matrix and
         * its inverse inertial tensor
         */
        calculateDerivedData: function () {
            // the orientation might have suffered some changes during the
            // application of the rotation, let's make sure it's length
            // is 1 so that it represents a correct orientation
            this.orientation.normalize();

            // update the transform matrix
            this.calculateTransformMatrix(
                this.transformMatrix, this.position, this.orientation
            );

            // calculate the inertialTensor in world space
            this.transformInertiaTensor(
                this.inverseInertiaTensorWorld,
                this.orientation,
                this.inverseInertiaTensor,
                this.transformMatrix
            );
        },

        /**
         * Clears the forces applied to the rigid body.
         * This will be called automatically after each integration step.
         */
        clearAccumulators: function () {
            this.accumulatedForce.set(0, 0, 0);
            this.accumulatedTorque.set(0, 0, 0);
        },

        /**
         * Adds the given force to the center of mass of the rigid body,
         * the force is expressed in world coordinates
         * @param {Ape.Vector3} f
         */
        addForce: function (f) {
            this.accumulatedForce
                .add(f);
        },

        /**
         * Adds the given torque to the center of mass of the rigid body,
         * the force is expressed in world coordinates
         * @param {Ape.Vector3} r
         */
        addTorque: function (r) {
            this.accumulatedTorque
                .add(r);
        },

        /**
         * Adds a `force` in a specific `point`, the point is specified in
         * WORLD coordinates
         * @param {Ape.Vector3} f
         * @param {Ape.Vector3} point
         */
        addForceAtPoint: function (f, point) {
            // vector from the center of mass to the point
            var pt = point.clone().sub(this.position);
            this.accumulatedForce
                .add(f);
            this.accumulatedTorque
                .add(pt.cross(f));
        },

        /**
         * Adds the given force to the given point on the rigid body, the direction
         * of the point is given in world space coordinates but the application point
         * is given in object space coordinates
         * @param {Ape.Vector3} force
         * @param {Ape.Vector3} point
         */
        addForceAtBodyPoint: function (force, point) {
            var pt = this.getPointInWorldSpace(point);
            this.addForceAtPoint(force, pt);
        },

        /**
         * Sets the inertia tensor of this rigid body (internally the inverseInertiaTensor
         * is set to make easier calculations)
         * @param {Ape.Matrix3} inertiaTensor
         */
        setInertiaTensor: function (inertiaTensor) {
            this.inverseInertiaTensor.setInverse(inertiaTensor);
            this.checkInverseInertiaTensor(this.inverseInertiaTensor);
        },

        /**
         * @private
         * Each frame the transformation matrix (Matrix4) must be updated,
         * it's updated using a vector3 which represents the position
         * and a quaternion which represents the orientation
         * @param {Ape.Matrix4} transformMatrix
         * @param {Ape.Vector3} position
         * @param {Ape.Quaternion} q
         */
        calculateTransformMatrix: function (transformMatrix, position, q) {
            transformMatrix.set(
                1 - 2 * (q.y * q.y + q.z * q.z),
                2 * (q.x * q.y - q.z * q.w),
                2 * (q.x * q.z + q.y * q.w),
                position.x,

                2 * (q.x * q.y + q.z * q.w),
                1 - 2 * (q.x * q.x + q.z * q.z),
                2 * (q.y * q.z - q.x * q.w),
                position.y,

                2 * (q.x * q.z - q.y * q.w),
                2 * (q.y * q.z + q.x * q.w),
                1 - 2 * (q.x * q.x + q.y * q.y),
                position.z
            );
        },

        /**
         * @private
         * Transforms the inverse inertia tensor from object coordinates to world
         * coordinates (called in `calculateDerivedData`)
         * @param iitWorld  inverse inertia tensor world
         * @param q         orientation
         * @param iitBody   inverse inertia tensor
         * @param tm        Transformation matrix
         */
        transformInertiaTensor: function (iitWorld, q, iitBody, tm) {
            var t4 = tm.data[0] * iitBody.data[0]+
                tm.data[1] * iitBody.data[3]+
                tm.data[2] * iitBody.data[6];
            var t9 = tm.data[0] * iitBody.data[1]+
                tm.data[1] * iitBody.data[4]+
                tm.data[2] * iitBody.data[7];
            var t14 = tm.data[0] * iitBody.data[2]+
                tm.data[1] * iitBody.data[5]+
                tm.data[2] * iitBody.data[8];
            var t28 = tm.data[4] * iitBody.data[0]+
                tm.data[5] * iitBody.data[3]+
                tm.data[6] * iitBody.data[6];
            var t33 = tm.data[4] * iitBody.data[1]+
                tm.data[5] * iitBody.data[4]+
                tm.data[6] * iitBody.data[7];
            var t38 = tm.data[4] * iitBody.data[2]+
                tm.data[5] * iitBody.data[5]+
                tm.data[6] * iitBody.data[8];
            var t52 = tm.data[8] * iitBody.data[0]+
                tm.data[9] * iitBody.data[3]+
                tm.data[10] * iitBody.data[6];
            var t57 = tm.data[8] * iitBody.data[1]+
                tm.data[9] * iitBody.data[4]+
                tm.data[10] * iitBody.data[7];
            var t62 = tm.data[8] * iitBody.data[2]+
                tm.data[9] * iitBody.data[5]+
                tm.data[10] * iitBody.data[8];

            iitWorld.data[0] = t4 * tm.data[0]+
                t9 * tm.data[1]+
                t14 * tm.data[2];
            iitWorld.data[1] = t4 * tm.data[4]+
                t9 * tm.data[5]+
                t14 * tm.data[6];
            iitWorld.data[2] = t4 * tm.data[8]+
                t9 * tm.data[9]+
                t14 * tm.data[10];
            iitWorld.data[3] = t28 * tm.data[0]+
                t33 * tm.data[1]+
                t38 * tm.data[2];
            iitWorld.data[4] = t28 * tm.data[4]+
                t33 * tm.data[5]+
                t38 * tm.data[6];
            iitWorld.data[5] = t28 * tm.data[8]+
                t33 * tm.data[9]+
                t38 * tm.data[10];
            iitWorld.data[6] = t52 * tm.data[0]+
                t57 * tm.data[1]+
                t62 * tm.data[2];
            iitWorld.data[7] = t52 * tm.data[4]+
                t57 * tm.data[5]+
                t62 * tm.data[6];
            iitWorld.data[8] = t52 * tm.data[8]+
                t57 * tm.data[9]+
                t62 * tm.data[10];
        },

        /**
         * @private
         * Checks the validity of the new inertia tensor
         * @param {Ape.Matrix3} iitWorld
         */
        checkInverseInertiaTensor: function (iitWorld) {
//            if (iitWorld) {
//                console.warn("Inverse inertia tensor is be invalid");
//            }
        },

        /**
         * Transform a point given in OBJECT coordinates to
         * WORLD coordinates (NOTE: make sure to understand
         * that the normal basis of this object might have changed
         * and may not be aligned with the world's normal basis)
         * @param {Ape.Vector3} point
         * @returns {Ape.Vector3}
         */
        getPointInWorldSpace: function (point) {
            return this.transformMatrix.transform(point);
        },

        /**
         * Transforms a point given in WORLD coordinates to
         * OBJECT coordinates (NOTE: make sure to understand
         * that the normal basis of this object might have changed
         * and may not be aligned with the world's normal basis)
         * @param {Ape.Vector3} point
         * @returns {Ape.Vector3}
         */
        getPointInLocalSpace: function (point) {
            return this.transformMatrix.transformInverse(point);
        },

        /**
         * Sets the value for both the linear damping and the angular damping
         * @param {number} linearDamping
         * @param {number} angularDamping
         */
        setDamping: function (linearDamping, angularDamping) {
            this.linearDamping = linearDamping;
            this.angularDamping = angularDamping;
        },

        /**
         * Adds the linear velocity `v` to the linear
         * velocity of this object
         * @param {Ape.Vector3} v
         */
        addVelocity: function (v) {
            this.linearVelocity.add(v);
        },

        /**
         * Adds the angular velocity `v` to the angular
         * velocity of this object
         * @param {Ape.Vector3} v
         */
        addRotation: function (v) {
            this.angularVelocity.add(v);
        }

    });

    Ape.RigidBody = RigidBody;
})();