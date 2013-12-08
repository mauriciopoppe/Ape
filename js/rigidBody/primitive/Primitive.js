/**
 * @abstract
 * Base class for collisionable shapes, this acts as a wrapper for rigid bodies
 * making them collisionable, a collisionable shape is defined with 3 properties:
 *
 * - **body**: An instance of the class Ape.RigidBody
 * - **offset**: The collisionable shape might define another place
 * for the rigid body to be collisionable
 * - **transform**: A matrix4 resultant of the combination of the offset
 * property and the transform matrix of the rigid body
 * @class Ape.primitive.Primitive
 */
Ape.primitive.Primitive = Class.extend({
    init: function (body, offset) {
        /**
         * Rigid body
         * @type {Ape.RigidBody}
         */
        this.body = body;

        /**
         * Offset (translation and rotation only,
         * no scaling or skewing)
         * @type {Ape.Matrix4}
         */
        this.offset = offset;

        /**
         * The resultant transform of the primitive, this is
         * calculated by combining the offset of the primitive
         * with the transform of the body
         *
         *      offset + transform
         *      offset + (orientation + position)
         *
         * @type {Ape.Matrix4}
         */
        this.transform = null;

    },

    /**
     * Type of object (based on this property the Ape.CollisionDetector is
     * capable of detecting the algorithm it has to use)
     * @property {string}
     */
    type: null,

    /**
     * Convenience method to access the axis vectors
     * in the transform matrix
     *
     *      // i.e.
     *      // since the column 3 in the Ape.Matrix4
     *      // holds the displacement of the object
     *      // to get the position of the primitive:
     *      primitive.getAxis(3)
     *
     * @param index
     * @returns {Ape.Vector3}
     */
    getAxis: function (index) {
        return this.transform.getAxisVector(index);
    },

    /**
     * Calculates the internals for the primitives such as
     * its transform matrix that is calculated by multiplying the body's
     * transformation matrix and the offset of the wrapper primitive
     */
    calculateInternals: function () {
        this.transform = this.body.transformMatrix.clone().multiply(
            this.offset
        );
    },

    /**
     * Getter for the property `type`
     * @returns {string}
     */
    getType: function () {
        if (!this.type) {
            throw new Error('Ape.primitive.Primitive(): type needed');
        }
        return this.type;
    }
});