/**
 * @abstract
 * Abstract class that is a blueprint for all the classes
 * whose instances apply forces to rigid bodies.
 *
 * The only method inherited that must be implemented by
 * the subclasses is the #updateForce method which applies
 * a force to the given body through Ape.RigidBody.addForceAtPoint or
 * Ape.RigidBody.addForceAtBodyPoint
 *
 * <hr>
 *
 * Clase abstracta que sirve como un cianotipo para todas las clases
 * cuyas instancias aplican fuerzas a los cuerpos rígidos.
 *
 * El único metodo heredado que debe ser implementado por las subclases
 * es el metodo #updateForce que aplica una fuerza al cuerpo rigido
 * a traves de Ape.RigidBody.addForceAtPoint o
 * Ape.RigidBody.addForceAtBodyPoint
 *
 * @class Ape.force.ForceGenerator
 */
Ape.force.ForceGenerator = Class.extend({
    /**
     * Ape.force.ForceGenerator constructor
     */
    init: function () {
    },

    /**
     * @abstract
     * Applies a force to the given rigid body
     * @param {Ape.RigidBody} body Reference to the rigid body being affected
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        throw new Error('This is an abstract method so it must be' +
            'implemented in the inheritance chain');
    }
});