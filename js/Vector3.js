/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
Ape = Ape || {};
Ape.Vector3 = Class.extend({
    
    // basic methods
    init: function (x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    },
    set: function (x, y, z) {
        this.init(x, y, z);
    },
    add: function (v) {
        var me = this;
        return new Ape.Vector3(me.x + v.x, me.y + v.y, me.z + v.z);
    },
    addSelf: function (v) {
        var me = this;
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return me;
    },
    addScaledVector: function (v, s) {
        var me = this;
        return new Ape.Vector3(
            me.x + v.x * s,
            me.y + v.y * s,
            me.z + v.z * s
        );
    },
    divideScalar: function (s) {
        var me = this;
        Ape.assert(s !== 0);
        return new Ape.Vector3(me.x / s, me.y / s, me.z / s);
    },
    multiplyScalar: function (s) {
        var me = this;
        return new Ape.Vector3(me.x * s, me.y * s, me.z * s);
    },

    // common vector related operations
    clone: function () {
        var me = this;
        return new Ape.Vector3(me.x, me.y, me.z);
    },
    invert: function () {
        var me = this;
        me.x *= -1;
        me.y *= -1;
        me.z *= -1;
        return this;
    },
    magnitude: function () {
        var me = this;
        return Math.sqrt(me.squareMagnitude());
    },
    squareMagnitude: function () {
        var me = this;
        return me.x * me.x + me.y * me.y + me.z * me.z;
    },
    normalize: function () {
        var me = this,
            magnitude = me.magnitude();
        return me.divideScalar(magnitude);
    },

    // advanced vector operations
    component: function (v) {
        var me = this;
        return new Ape.Vector3(me.x * v.x, me.y * v.y, me.z * v.z);
    },
    dot: function (v) {
        var me = this;
        return me.x * v.x + me.y * v.y + me.z * v.z;
    },
    cross: function (v) {
        var me = this;
        return new Ape.Vector3(
            me.y * v.z - me.z * v.y,
            me.z * v.x - me.x * v.z,
            me.x * v.y - me.y * v.x
        );
    },
    clear: function () {
        this.init(0, 0, 0);
    }

});