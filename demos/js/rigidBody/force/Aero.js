/**
 * A force generator that applies an aerodynamic force using
 * a tensor representing an aerodynamic surface at some place in
 * the rigid body
 *
 * <hr>
 *
 * Una generador de fuerza que aplica una fuerza aerodinamica usando
 * un tensor representando una superficie aerodinamica en algun lugar
 * en el cuerpo rigido
 *
 * @class Ape.force.Aero
 * @extends Ape.force.ForceGenerator
 */
Ape.force.Aero = Ape.force.ForceGenerator.extend({
    init: function (tensor, position, windSpeed) {

        this._super();

        /**
         * Holds the aerodynamic tensor for the surface in
         * OBJECT space
         * @type {Ape.Matrix3}
         */
        this.tensor = tensor;

        /**
         * Holds the relative position of the aerodynamic surface
         * in OBJECT space
         * @type {Ape.Vector3}
         */
        this.position = position;

        /**
         * Holds a pointer to a vector containing the wind speed of
         * the environment. This is easier than managing a separate
         * wind speed vector per generator and having to update
         * it manually as the wind changes.
         * @type {Ape.Vector3}
         */
        this.windSpeed = windSpeed;
    },

    /**
     * Applies a force to a rigid body using the tensor defined
     * for the aerodynamic force
     * @param body
     * @param duration
     */
    updateForce: function (body, duration) {
        this.updateForceFromTensor(body, duration, this.tensor);
    },

    /**
     * Calculates the force to apply to a body given its linear velocity
     * and WORLD wind speed, the resulting force is applied in OBJECT
     * coordinates
     * @param {Ape.RigidBody} body
     * @param {number} duration
     * @param {Ape.Matrix3} tensor
     */
    updateForceFromTensor: function (body, duration, tensor) {
        // calculate the total velocity (windSpeed and body's velocity)
        var velocity = body.linearVelocity.clone();
        velocity.add(this.windSpeed);

        // calculate the velocity in OBJECT coordinates
        var objectVelocity = body.transformMatrix
            .transformInverseDirection(velocity);

        // calculate the force in OBJECT coordinates
        var bodyForce = tensor.transform(objectVelocity);
        var force = body.transformMatrix
            .transformDirection(bodyForce);

        // apply the force
        body.addForceAtBodyPoint(force, this.position);
    }
});