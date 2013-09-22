/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/18/13
 * Time: 8:23 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * The plane is used for contacts with the immovable geometry
 * in the world (so it doesn't represent a rigid body)
 * @class Ape.Plane
 */
Ape.Plane = Ape.Primitive.extend({
    init: function () {
        /**
         * Direction of the plane normal
         * @type {THREE.Vector3}
         */
        this.direction = null;

        /**
         * The distance of the plane from the origin
         * @type {number}
         */
        this.offset = null;
    },

    /**
     * Each instance created is of type plane
     * @type {string}
     */
    type: 'plane'
});