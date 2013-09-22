/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/18/13
 * Time: 8:23 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Represents a rigid body that can be treated as an
 * aligned bounding box for collision detection
 *
 * @class Ape.Box
 * @inherit Ape.Primitive
 */
Ape.Box = Ape.Primitive.extend({
    init: function (body, offset, halfSize) {
        this._super(body, offset);

        /**
         * Represents the halfSizes of the box along
         * each of its OBJECT axis
         * @type {THREE.Vector3}
         */
        this.halfSize = halfSize;
    },

    /**
     * Each instance created is of type box
     * @type {string}
     */
    type: 'box'
});