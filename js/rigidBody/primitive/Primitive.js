/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/18/13
 * Time: 8:19 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.Primitive = Class.extend({
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
     * Type of object
     * @type {string}
     */
    type: null,

    /**
     * Convenience method to access the axis vectors
     * in the transform matrix
     *
     * i.e.
     *      // since the column 3 in the Ape.Matrix4
     *      // holds the displacement of the object
     *      // to get the position of the primitive:
     *      primitive.getAxis(3)
     *
     * @param index
     * @returns {THREE.Vector3}
     */
    getAxis: function (index) {
        return this.transform.getAxisVector(index);
    },

    /**
     * Calculates the internals for the primitives such as
     * its transform matrix
     */
    calculateInternals: function () {
        this.transform = this.body.transformMatrix.clone().multiply(
            this.offset
        );
    },

    getType: function () {
        if (!this.type) {
            throw new Error('Ape.Primitive(): type needed');
        }
        return this.type;
    }
});