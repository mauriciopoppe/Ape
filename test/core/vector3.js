/**
 * Created by mauricio on 1/14/15.
 */
var Ape = {};
var expect = require('chai').expect,
  Vector3 = require('../../src/js/Vector3');

describe('Vector3', function () {
  function verify(v) {
    expect(v.x).equal(1);
    expect(v.y).equal(2);
    expect(v.z).equal(3);
  }

  it('should be instantiated correctly', function () {
    var v = new Vector3(1, 2, 3);
    verify(v);
  });

  it('should set the xyz values using set', function () {
    var v = new Vector3();
    v.set(1, 2, 3);
    verify(v);
  });

  it('should add/subtract a vector to itself', function () {
    var v = new Vector3();
    v.add(new Vector3(1, 2, 3));
    verify(v);
    v = new Vector3();
    v.sub(new Vector3(-1, -2, -3));
    verify(v);
  });

  it('should add 2 vectors as the value of itself', function () {
    var a = new Vector3();
    a.addVectors(new Vector3(2, 4, 6), new Vector3(-1, -2, -3));
    verify(a);
  });

  it('should operate with scalars', function () {
    var a = new Vector3(1, 2, 3);
    a.multiplyScalar(2);
    expect(a.x).equal(2);
    expect(a.y).equal(4);
    expect(a.z).equal(6);

    a.divideScalar(2);
    verify(a);

    var v = new Vector3();
    v.addScalar(3);
    expect(v.x).equal(3);
    expect(v.y).equal(3);
    expect(v.z).equal(3);

    v = new Vector3();
    v = v.addScaledVector(new Vector3(1, 2, 3), 2);
    expect(v.x).equal(2);
    expect(v.y).equal(4);
    expect(v.z).equal(6);
  });

  it('should not allow division by zero', function () {
    var a = new Vector3(1, 2, 3);
    expect(function () {
      a.divideScalar(0);
    }).throw();
  });

  it('should calculate the length of a vector', function () {
    var v = new Vector3(1, 2, 3);
    expect(Math.abs(v.length() - 3.74165738677) < 1e-7).be.true();
  });

  it('should be able to be normalized', function () {
    var v = new Vector3(5, -8, 2).normalize();
    expect(Math.abs(1 - v.length()) < 1e-7).be.true();
  });

  it('should calculate the dot product', function () {
    var a = new Vector3(1, -1, 3);
    var b = new Vector3(-5, 4, -2);
    var res = -5 + -4 + -6;
    expect(a.dot(b)).equal(res);
    expect(b.dot(a)).equal(res);
  });

  it('should calculate the cross product', function () {
    var a = new Vector3(1, -1, 3);
    var b = new Vector3(-5, 4, -2);
    var res = new Vector3(2 - 12, -15 + 2, 4 - 5);
    expect(a.clone().cross(b)).deep.equal(res);
    expect(b.clone().cross(a)).deep.equal(res.multiplyScalar(-1));
  });

  it('should have utility methods like clone/clear/distances', function () {
    var a = new Vector3(5, 3, 3);
    // clone
    expect(a.clone()).deep.equal(a);
    // clear
    expect(a.clone().clear()).deep.equal(new Vector3());
    // distance to/distance to squared
    expect(new Vector3().distanceTo(new Vector3(3, 4, 0))).equal(5);
  });
});