//var Vector3 = require('./Vector3');
module.exports = {
  /**
   * Epsilon
   * @type {number}
   */
  EPS: 1e-7,

  // TODO: set after the library has boot
  ///**
  // * Static value for the gravity
  // *
  // *      Ape.assert(Ape.GRAVITY.x === 0);
  // *      Ape.assert(Ape.GRAVITY.y === -15);
  // *      Ape.assert(Ape.GRAVITY.z === 0);
  // *
  // * <hr>
  // *
  // * @type {Ape.Vector3}
  // */
  //// 15 is commonly used for shooters
  //// 20 is commonly used for racing games
  //GRAVITY: new Vector3(0, -15, 0),

  /**
   * Scale to work with in the rendering engine:
   *
   *      0.01px ====== 1u
   *      scale: 1u / 0.1px
   *
   * @type {number}
   */
  // 0.01px ====== 1u
  // scale: 1u / 0.1px
  //Ape.SCALE = 1 / 0.1;
  SCALE: 1
};