/**
 * Created by mauricio on 1/18/15.
 */
var Matrix4 = require('../../src/js/Matrix4');
var Vector3 = require('../../src/js/Vector3');
var Quaternion = require('../../src/js/Quaternion');
var expect = require('chai').expect;
describe('Matrix4', function () {
  function gen() {
    return new Matrix4(
      -1, 2, 3, 0,
      2, 3, 4, -1,
      -5, 1, 2, 3
    );
  }

  it('should have a valid constructor', function () {
    var m = new Matrix4();
    expect(
      m.equals(new Matrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0
      ))
    ).be.true();

    expect(
      gen().equals(gen())
    ).be.true();
  });

  it('should multiply two Matrix4 instances', function () {
    expect(
      new Matrix4(
        1, 12, 234, -23,
        23, 8, -9, -7,
        -4, 2, -39, 3
      ).multiply(
        new Matrix4(
          2, 4, 5, 6,
          -2, -5, -5, -3,
          3, 53, 3, -3
        )
      ).equals(
        new Matrix4(
          680, 12346, 647, -755,
          3, -425, 48, 134,
          -129, -2093, -147, 90
        )
      )
    ).be.true();
  });

  it('should transform a Vector3', function () {
    expect(
      gen()
        .transform(new Vector3(3, -1, 2))
        .equals(new Vector3(-3 -2+6, 6-3+8-1, -15-1+4+3))
    ).be.true();
  });

  it('should get each column as an axis vector', function () {
    var m = gen();
    expect(m.getAxisVector(0).equals(new Vector3(-1, 2, -5))).be.true();
    expect(m.getAxisVector(1).equals(new Vector3(2, 3, 1))).be.true();
    expect(m.getAxisVector(2).equals(new Vector3(3, 4, 2))).be.true();
  });

  it('should calculate the determinant of a matrix', function () {
    expect(gen().getDeterminant()).equal(1);
  });

  it('should calculate the inverse of a matrix', function () {
    expect(
      gen()
        .inverse()
        .multiply(gen())
        .equals(new Matrix4())
    ).be.true();
  });

  it('should have a method to transform it to a rotation matrix from a quaternion/position', function () {
    var q;
    var v = new Vector3(1, 2, 3);
    var cosAngle = Math.cos(Math.PI * 0.5);
    var sinAngle = Math.sin(Math.PI * 0.5);

    // generates a quaternion about the y-axis of 90deg
    q = Quaternion.fromVectorAndAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
    expect(
      new Matrix4().setOrientationAndPos(q, v)
        .equals(new Matrix4(
          cosAngle, 0, sinAngle, 1,
          0, 1, 0, 2,
          -sinAngle, 0, cosAngle, 3
        ))
    ).be.true();

    q = new Quaternion(0, 2, -1, -3);
    expect(
      new Matrix4().setOrientationAndPos(q, v)
        .equals(new Matrix4(
          -3/7, -2/7, -6/7, 1,
          -2/7, -6/7, 3/7, 2,
          -6/7, 3/7, 2/7, 3
        ))
    ).be.true();

    q = new Quaternion(11, -2, 0, -2);
    expect(
      new Matrix4().setOrientationAndPos(q, v)
        .equals(new Matrix4(
          121/129, 44/129, 8/129, 1,
          -44/129, 113/129, 44/129, 2,
          8/129, -44/129, 121/129, 3
        ))
    ).be.true();

    q = new Quaternion(5, -3, 1, -7);
    expect(
      new Matrix4().setOrientationAndPos(q, v)
        .equals(new Matrix4(
          -4/21, 16/21, 13/21, 1,
          -19/21, -8/21, 4/21, 2,
          8/21, -11/21, 16/21, 3
        ))
    ).be.true();

    q = new Quaternion(1, -2, 3, -4);
    expect(
      new Matrix4().setOrientationAndPos(q, v)
        .equals(new Matrix4(
          -2/3, -2/15, 11/15, 1,
          -2/3, -1/3, -2/3, 2,
          1/3, -14/15, 2/15, 3
        ))
    ).be.true();
  });

  it('should transform the direction of a vector (normal/inverse)', function () {
    // 90deg rotation over the y axis
    // right hand rule
    var cosAngle = Math.cos(Math.PI * 0.5);
    var sinAngle = Math.sin(Math.PI * 0.5);
    var m = new Matrix4(
      cosAngle, 0, sinAngle, 0,
      0, 1, 0, 0,
      -sinAngle,  0, cosAngle, 0
    );

    expect(
      m.transformDirection(new Vector3(1, 0, 0))
        .equals(new Vector3(0, 0, -1))
    ).be.true();

    // generates a quaternion about the y-axis of 90deg
    var q = Quaternion.fromVectorAndAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
    var v = new Vector3();
    m = new Matrix4().setOrientationAndPos(q, v);
    expect(
      m.transformDirection(new Vector3(1, 0, 0))
        .equals(new Vector3(0, 0, -1))
    ).be.true();

    // inverse rotation (-90deg about the y-axis)
    expect(
      m.transformInverseDirection(new Vector3(1, 0, 0))
        .equals(new Vector3(0, 0, 1))
    ).be.true();
  });
});