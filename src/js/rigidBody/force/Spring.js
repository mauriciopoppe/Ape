/**
 * Class Ape.force.Spring which follows Hooke's law
 *
 * It's a simplified model of the metallic spring:
 * let `k` be a constant depending on the material (its stiffness
 * which is the rigidity of the material)
 * let `lRest` be the distance at which the spring is resting
 * let `l` be the new distance of the spring at which
 * is expanded or compressed
 *
 *      f = -k (l - lRest)
 *
 * If the spring is compressed then l < lRest thus the subtract
 * operation yields in a **negative** number which multiplied
 * by `-k` generates a **positive force** (i.e. a force that
 * repels the objects connected by the spring)
 *
 * If the spring is expanded then l > lRest thus the subtract
 * operation yields in a **positive** number which multiplied
 * by `-k` generates a **negative force** (i.e. a force that
 * attracts the objects connected by the spring)
 *
 * <hr>
 *
 * Se trata de un modelo simplificado del resorte metálico:
 * Si `k` es una constante en función del material (su rigidez)
 * Si `lRest` es la distancia a la que el resorte está descansando
 * Si `l` es la nueva distancia a la que el spring esta comprimido
 * o expandido
 *
 *      f = -k (l - lRest)
 *
 * Si el resorte se comprime entonces l < lRest por lo tanto la operacion
 * resta resulta en un número **negativo** que multiplicado
 * por `k` genera una **fuerza positiva** (es decir, una fuerza que
 * repele los objetos conectados por el resorte)
 *
 * Si el resorte se expande entonces l > lRest por lo tanto la operacion
 * resta resulta en un número **positivo** que multiplicado
 * por `k` genera una **fuerza positiva** (es decir, una fuerza que
 * atrae a los objetos conectados por el resorte)
 *
 * @class Ape.force.Spring
 * @extends Ape.force.ForceGenerator
 */
Ape.force.Spring = Ape.force.ForceGenerator.extend({

    /**
     * Ape.force.Spring constructor, it needs 5 configuration
     * parameters as described below:
     * @param {Ape.Vector3} localConnectionPt Point of
     * contact of one of the spring ends in the registered
     * rigid body
     * @param {Ape.RigidBody} other Other rigid body to whom
     * this spring is connected to
     * @param {Ape.Vector3} otherConnectionPt Point of contact
     * of the one of the spring ends in the other rigid body
     * @param {number} springConstant The spring constant `k`
     * @param {number} restLength Length at which this spring
     * is resting
     */
    init: function (localConnectionPt, other, otherConnectionPt,
                    springConstant, restLength) {

        this._super();

        /**
         * The point of connection of the spring in OBJECT
         * coordinates
         * @type {Ape.Vector3}
         */
        this.connectionPoint = localConnectionPt;

        /**
         * The body at the other end of the spring,
         * we assume that we're extending the spring from the
         * body which is not this one (this one is static)
         * @type {Ape.RigidBody}
         */
        this.other = other;

        /**
         * The point of connection of the spring in OBJECT
         * coordinates (in the other body)
         * @type {Ape.Vector3}
         */
        this.otherConnectionPoint = otherConnectionPt;

        /**
         * Holds the spring constant
         * @type {Ape.Vector3}
         */
        this.springConstant = springConstant;

        /**
         * The length of the material when it's on a rest position
         * @type {number}
         */
        this.restLength = restLength;
    },

    /**
     * Applies a force following the rules described in the
     * model of Hooke's law
     * @param {Ape.RigidBody} body
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        var bodyInWorldSpace = body.getPointInWorldSpace(this.connectionPoint),
            otherInWorldSpace = this.other.getPointInWorldSpace(this.otherConnectionPoint),
            vector,
            force,
            magnitude;

        vector = bodyInWorldSpace.clone()
            .sub(otherInWorldSpace);

        // -k (l - l_rest)
        magnitude = -this.springConstant *
            (vector.length() - this.restLength);

        // turn the magnitude into a vector
        // f_spring = magnitude * dˆ
        force = vector.clone().normalize().multiplyScalar(magnitude);
        body.addForceAtPoint(force, bodyInWorldSpace);
    }
});