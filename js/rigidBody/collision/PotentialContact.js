/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 8/17/13
 * Time: 7:41 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Stores a potential contact between to bodies
 * to check later
 * @class Ape.PotentialContact
 */
Ape.PotentialContact = Class.extend({
    init: function (body1, body2) {
        /**
         * Holds the bodies that might be in contact
         * @type {Array}
         */
        this.bodies = [body1, body2];
    }
});