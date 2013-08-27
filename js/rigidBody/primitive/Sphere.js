/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/18/13
 * Time: 8:23 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * The sphere is usually defined with a radius and a center,
 * the center point is given by the offset from the origin
 * of the rigid body, data which is hold in `Ape.Primitive`
 * @class Ape.Sphere
 * @inherit Ape.Primitive
 */
Ape.Sphere = Ape.Primitive.extend({
    init: function (body, offset, radius) {
        this._super(body, offset);

        /**
         * Radius of the sphere
         * @type {*}
         */
        this.radius = radius;
    }
});