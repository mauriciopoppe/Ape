/**
 * @class Ape
 */
Ape = Ape || {};

///********** GRAVITY **********/
// 15 is commonly used for shooters
/**
 * Static value for the gravity
 *
 *      Ape.assert(Ape.GRAVITY.x === 0);
 *      Ape.assert(Ape.GRAVITY.y === -15);
 *      Ape.assert(Ape.GRAVITY.z === 0);
 *
 * <hr>
 *
 *
 *
 * @type {Ape.Vector3}
 */
Ape.GRAVITY = new Ape.Vector3(0, -15, 0);
// 20 is commonly used for racing games
//Ape.GRAVITY = new Ape.Vector3(0, -20, 0);//    1px ====== 1u

///********** SCALE **********/
// 0.01px ====== 1u
// scale: 1u / 0.1px
//Ape.SCALE = 1 / 0.1;
/**
 * Scale to work with in the rendering engine:
 *
 *      0.01px ====== 1u
 *      scale: 1u / 0.1px
 *
 * @type {number}
 */
Ape.SCALE = 1;

///********** EPSILON **********/
// 0.01px ====== 1u
// scale: 1u / 0.1px
//Ape.SCALE = 1 / 0.1;
/**
 * Useful comparison value (to avoid floating errors)
 *
 *      Ape.EPS = 1e-7
 *
 * @type {number}
 */
Ape.EPS = 1e-7;
