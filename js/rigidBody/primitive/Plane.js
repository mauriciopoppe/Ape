/**
 * The plane is used as a shape with unmovable geometry
 * in the world (it doesn't represent a rigid body)
 * @class Ape.primitive.Plane
 */
Ape.primitive.Plane = Class.extend({
    init: function () {
        /**
         * Direction of the plane's normal (it should
         * be a normalized vector)
         * @type {Ape.Vector3}
         */
        this.direction = null;

        /**
         * The distance from the origin to the the plane
         * @type {number}
         */
        this.offset = null;
    },

    /**
     * Each instance created is of type plane
     * @type {string}
     */
    type: 'plane',

    /**
     * Returns the type of this object (for collision purposes = 'plane')
     * @returns {string}
     */
    getType: function () {
        return this.type;
    }
});