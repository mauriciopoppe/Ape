/**
 * @author Mauricio Poppe <mauricio.poppe@gmail.com>
 * @class Ape
 * @singleton
 *
 * A global object on which all the physic engine classes
 * are declared
 *
 */
var Ape = Ape || {};

/**
 * Entry point for collision related classes
 * @type {Object}
 */
Ape.collision = {};

/**
 * Entry point for force related classes
 * @type {Object}
 */
Ape.force = {};

/**
 * Entry point for primitive related classes
 * @type {Object}
 */
Ape.primitive = {};

/**
 * Ape works with THREE.js to show a mesh for each simulated
 * body, the creation of those meshes are controlled by
 * this property.
 * If this property is set to `false` then no THREE meshes will
 * be created.
 * @property {boolean} [debug=true]
 */
Ape.debug = true;

/**
 * Asserts the value of an expression and halts the application if it's
 * a `falsy` value.
 * @param {boolean} v
 */
Ape.assert = function (v) {
    if (!v) {
        throw new Error();
    }
};

/**
 * Extends an object adding new properties.
 *
 *      // e.g.
 *      var object = {
 *          A: function() {},
 *          B: true,
 *          C: 1
 *      };
 *      var extension = {
 *          D: function() {},
 *          E: false
 *      };
 *
 *      Ape.extend(object, extension);
 *
 *      // calling Ape.extend will extend the object
 *      // with the object `extension` so:
 *      // object is now:
 *      // {
 *      //      A: function() {},
 *      //      B: true,
 *      //      C: 1,
 *      //      D: function() {},
 *      //      E: false
 *      // }
 *
 * @param {Object} obj
 * @param {Object} config
 */
Ape.extend = function (obj, config) {
    var property;
    for (property in config) {
        if (config.hasOwnProperty(property)) {
            obj[property] = config[property];
        }
    }
};