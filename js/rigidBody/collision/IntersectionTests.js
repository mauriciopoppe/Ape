/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/19/13
 * Time: 1:48 PM
 * To change this template use File | Settings | File Templates.
 */
Ape.IntersectionTests = {
    /**
     * Returns true if the box and the half space intersect
     * @param box
     * @param plane
     * @returns {boolean}
     */
    boxAndHalfSpace: function (box, plane) {
        // work out the radius from the box to the plane
        var projectedRadius = this.transformToAxis(box, plane.direction);

        // compute how far is the box from the origin
        var boxDistance = plane.direction.clone().
            dot(box.getAxis(3)) - projectedRadius;

        return boxDistance <= plane.offset;
    },

    transformToAxis: function (box, axis) {
        return box.halfSize.x * Math.abs(axis.clone.dot(box.getAxis(0))) +
            box.halfSize.y * Math.abs(axis.clone().dot(box.getAxis(1))) +
            box.halfSize.z * Math.abs(axis.clone().dot(box.getAxis(2)));
    },

    /**
     *
     * @param {Ape.Box} one
     * @param {Ape.Box} two
     * @param {THREE.Vector3} axis
     */
    overlapOnAxis: function (one, two, axis) {
        // project the boxes halfSize vector to the axis
        var oneProject = this.transformToAxis(one, axis),
            twoProject = this.transformToAxis(two, axis);

        // find the vector between the two centers
        var toCenter = two.getAxis(3).sub(one.getAxis(3));
        var distance = Math.abs(toCenter.dot(axis));

        return distance < oneProject + twoProject;
    }
};