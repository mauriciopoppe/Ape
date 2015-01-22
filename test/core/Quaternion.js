/**
 * Created by mauricio on 1/20/15.
 */
var Vector3 = require('../../src/js/Vector3');
var Quaternion = require('../../src/js/Quaternion');
var Constants = require('../../src/js/Constants');
var expect = require('chai').expect;

describe('Quaternion', function () {

  function checkLength(q) {
    expect(Math.abs(q.length() - 1) < Constants.EPS).be.true();
  }

  it('should have a valid constructor', function () {
    var q = new Quaternion();
    expect(q.equals(new Quaternion(1, 0, 0, 0))).be.true();
    checkLength(q);

    q = new Quaternion(1, 2, 3, 4);
    checkLength(q);

    expect(function () {
      new Quaternion(0, 0, 0, 0);
    }).throw();

    q = new Quaternion(-1, -2, -3, -4);
    checkLength(q);
  });

  it('should have a way to be normalized', function () {
    var q = Quaternion.fromVectorAndAngle(
      new Vector3(1, 1, 1),
      Math.PI * 0.5
    );
    expect(q.lengthSq()).equal(1);
    expect(q.length()).equal(1);
  });

  it('should calculate the conjugate', function () {
    var q = new Quaternion(1, -1, 2, -3);
    expect(
      q.conjugate()
        .equals(new Quaternion(1, 1, -2, 3))
    ).be.true();
  });

  it('should have a clone method', function () {
    var q = new Quaternion(-1, 2, -3, 4);
    expect(q.equals(q.clone())).be.true();
  });

  it('should have a method to return its components in an array', function () {
    var q = new Quaternion();
    expect(q.asArray()).deep.equal([1, 0, 0, 0]);
  });

  it('should multiply two quaternions and the result should be a mix of the info they have', function () {
    // http://www.wolframalpha.com/input/?i=quaternion+-Sin%5BPi%5D%2B3i%2B4j%2B3k+multiplied+by+-1j%2B3.9i%2B4-3k&lk=3
    var a = new Quaternion(-Math.sin(Math.PI), 3, 4, 3);
    var b = new Quaternion(4, 3.9, -1, -3);
    var res = new Quaternion(1.3, 3, 36.7, -6.6);

    expect(a.multiply(b).equals(res)).be.true();
  });

  it('should apply a rotation to a vector', function () {
    // 90 deg rotation over the z axis
    // after the rotation is applied the vector should be 0,1,0
    var v = new Vector3(1, 0, 0);
    var q = Quaternion.fromVectorAndAngle(
      new Vector3(0, 0, 1),
      Math.PI * 0.5
    );
    expect(
      q.rotateVector(v)
        .equals(new Vector3(0, 1, 0))
    ).be.true();
  });

});