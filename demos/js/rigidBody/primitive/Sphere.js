/**
 * The sphere is defined with a radius and a center,
 * the center point is given by the offset from the origin
 * of the rigid body, data which is hold in Ape.primitive.Primitive
 *
 * <hr>
 *
 * La esfera es definida con un radio y un centro,
 * el centro esta definido por la propiedad offset heradada de la clase
 * Ape.primitive.Primitive
 *
 * @class Ape.primitive.Sphere
 * @extends Ape.primitive.Primitive
 */
Ape.primitive.Sphere = Ape.primitive.Primitive.extend({
    /**
     * Ape.primitive.Sphere constructor
     * @param {Ape.RigidBody} body
     * @param {Ape.Matrix4} offset
     * @param {number} radius
     */
    init: function (body, offset, radius) {
        this._super(body, offset);

        /**
         * Radius of the sphere
         * @property {number}
         */
        this.radius = radius;
    },

    /**
     * Each instance created is of type 'sphere'
     * @property {string}
     */
    type: 'sphere'
});