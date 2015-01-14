/**
 * Generates a force equal to an `acceleration` configured
 * as a property and the mass of a rigid body.
 *
 * Typically the value of the acceleration is the force
 * of the gravity so if the constructor call has no
 * parameters then its acceleration equals Ape.GRAVITY
 *
 *      var force = new Ape.force.Gravity();
 *      // the force applied will be:
 *      // body.getMass() * Ape.GRAVITY
 *
 * The usefulness of this class lies in that multiple rigid
 * bodies can be assigned a distinct gravity value if
 * it's needed in the game
 *
 *      // constructor with a gravity different than the
 *      // usual value (Ape.GRAVITY)
 *      var force = new Ape.force.Gravity(
 *          new Ape.Vector3(0, -15, 0)
 *      );
 *      // the force applied will be:
 *      // body.getMass() * Ape.Vector3(0, -15, 0)
 *
 * <hr>
 *
 * Genera una fuerza igual a la aceleracion configurada como una propiedad
 * y la masa del cuerpo rigido.
 *
 * Tipicamente el valor de la aceleracion es la fuerza de la gravedad, asi que
 * si el contructor es llamado sin parametros entonces su aceleracion es igual
 * a Ape.GRAVITY.
 *
 * La utilidad de esta clase radica en que mutliples cuerpos rigidos pueden ser
 * asignados distintos valores de gravedad si es que se necesita en el juego.
 *
 * @class Ape.force.Gravity
 * @extends Ape.force.ForceGenerator
 */
Ape.force.Gravity = Ape.force.ForceGenerator.extend({

    /**
     * Ape.force.Gravity constructor
     * @param {Ape.Vector3} [gravity=Ape.GRAVITY]
     */
    init: function (gravity) {
        this._super();

        /**
         * Gravity value (a.k.a. gravity acceleration)
         * @type {Ape.Vector3}
         */
        this.gravity = gravity || Ape.GRAVITY.clone();
    },

    /**
     * Applies a force to a rigid body equal to the
     * value of the `gravity` saved in this instances
     * multiplied by the `mass` of the `body`.
     * @param {Ape.RigidBody} body
     * @param {number} duration
     */
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