/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 7/29/13
 * Time: 11:13 PM
 * To change this template use File | Settings | File Templates.
 */
Ape = Ape || {};

/********** GRAVITY **********/
// 15 is commonly used for shooters
Ape.GRAVITY = new Ape.Vector3(0, -15, 0);
// 20 is commonly used for racing games
//Ape.GRAVITY = new Ape.Vector3(0, -20, 0);//    1px ====== 1u

/********** SCALE **********/
// 0.01px ====== 1u
// scale: 1u / 0.1px
//Ape.SCALE = 1 / 0.1;
Ape.SCALE = 1;
