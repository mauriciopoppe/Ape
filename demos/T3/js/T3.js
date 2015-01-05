/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:36 AM
 * To change this template use File | Settings | File Templates.
 */

// globals
var scene,
    T3 = {
        model: {},
        controller: {},
        view: {}
    };


/**
 * Retina displays have twice the pixel ratio
 * @type {Function}
 */
T3.devicePixelRatio = window.devicePixelRatio || 1;