/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/14/13
 * Time: 9:36 AM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Aero, a force generator that applies an aerodynamic force
 *
 * @class Ape.Spring
 */
Ape.Aero = Ape.ForceGenerator.extend({
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
         * @type {THREE.Vector3}
         */
        this.position = position;

        /**
         * Holds a pointer to a vector containing the wind speed of
         * the environment. This is easier than managing a separate
         * wind speed vector per generator and having to update
         * it manually as the wind changes.
         * @type {THREE.Vector3}
         */
        this.windSpeed = windSpeed;
    },

    updateForce: function (body, duration) {
        this.updateForceFromTensor(body, duration, this.tensor);
    },

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

//        if (this.position.equals(new THREE.Vector3(2, 0, 0))) {
//            console.log("---------");
//            console.log(force);
//            console.log(this.position);
//        }

        // apply the force
        body.addForceAtBodyPoint(force, this.position);
    }
});