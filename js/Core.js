/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
var Ape = Ape || {};

Ape.assert = function (v) {
    if (!v) {
        throw new Error();
    }
};