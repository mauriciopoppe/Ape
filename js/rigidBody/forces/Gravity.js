/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/12/13
 * Time: 9:18 AM
 * To change this template use File | Settings | File Templates.
 */
Ape.Gravity = Ape.ForceGenerator.extend({
    init: function (gravity) {
        this._super();

        /**
         * Gravity acceleration
         * @type {THREE.Vector3}
         */
        this.gravity = gravity;
    },

    updateForce: function (body, duration) {
        if (body.getInverseMass() === 0) {
            // gravity doesn't affect infinite mass objects
            return;
        }

        // apply the mass-scaled force to the particle
        // f = m * a
        body.addForce(
            this.gravity.clone()
                .multiplyScalar(body.getMass())
        );
    }
});