/**
 * Represents a rigid body that can be treated as an
 * aligned bounding box for collision detection
 *
 * @class Ape.primitive.Box
 * @extends Ape.primitive.Primitive
 */
Ape.primitive.Box = Ape.primitive.Primitive.extend({
    /**
     * Ape.primitive.Box constructor
     * @param {Ape.RigidBody} body
     * @param {Ape.Matrix4} offset
     * @param {Ape.Vector3} halfSize
     */
    init: function (body, offset, halfSize) {
        this._super(body, offset);

        /**
         * Represents the halfSizes of the box along
         * each of its OBJECT axis
         * @property {Ape.Vector3}
         */
        this.halfSize = halfSize;
    },

    /**
     * Each instance created is of type box
     * @property {string} [type=box]
     */
    type: 'box'
});