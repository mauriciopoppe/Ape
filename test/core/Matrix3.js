/**
 * Created by mauricio on 1/17/15.
 */
var Matrix3 = require('../../src/js/Matrix3');
var Quaternion = require('../../src/js/Quaternion');
var Vector3 = require('../../src/js/Vector3');
var expect = require('chai').expect;
describe('Matrix3', function () {

  function gen_special() {
    return new Matrix3(
      1, 2, 3,
      4, 5, 6,
      7, 8, 9
    );
  }

  function gen() {
    return new Matrix3(
      -1, 2, -3,
      4, -5, 6,
      -7, 8, -9
    );
  }

  it('should have a valid constructor', function () {
    var m;
    m = new Matrix3();
    expect(m.data[0]).equal(1);
    expect(m.data[1]).equal(0);
    expect(m.data[2]).equal(0);
    expect(m.data[3]).equal(0);
    expect(m.data[4]).equal(1);
    expect(m.data[5]).equal(0);
    expect(m.data[6]).equal(0);
    expect(m.data[7]).equal(0);
    expect(m.data[8]).equal(1);

    m = gen();
    expect(m.data[0]).equal(-1);
    expect(m.data[1]).equal(2);
    expect(m.data[2]).equal(-3);
    expect(m.data[3]).equal(4);
    expect(m.data[4]).equal(-5);
    expect(m.data[5]).equal(6);
    expect(m.data[6]).equal(-7);
    expect(m.data[7]).equal(8);
    expect(m.data[8]).equal(-9);
  });

  it('should compare to other matrices', function () {
    expect(new Matrix3().equals(new Matrix3())).be.true();
  });

  it('should have the ability to be cloned', function () {
    var m = gen();
    expect(m.equals(m.clone())).be.true();
  });

  it('should have an add method', function () {
    expect(
      gen().add(gen())
        .equals(
          new Matrix3(
            -2, 4, -6,
            8, -10, 12,
            -14, 16, -18
          )
        )
    ).be.true();
  });

  it('should do matrix multiplication', function () {
    var m = new Matrix3(
      -9, 7, -1,
      6, -5, 2,
      6, -4, 1
    );
    var n = new Matrix3(
      1, -1, 3,
      2, -1, 4,
      2, 2, 1
    );
    expect(
      m.multiply(n)
        .equals(new Matrix3(
          3, 0, 0,
          0, 3, 0,
          0, 0, 3
        ))
    ).be.true();
  });

  it('should do matrix  vector = vector multiplication', function () {
    var m = gen_special();
    var v = new Vector3(-1, 5, -3);
    expect(
      m.multiplyVector(v)
        .equals(new Vector3(0, 3, 6))
    ).be.true();
    expect(
      m.transform(v)
        .equals(new Vector3(0, 3, 6))
    ).be.true();
  });

  it('should do matrix * scalar = matrix multiplication', function () {
    expect(
      gen().multiplyScalar(-1)
        .equals(new Matrix3(
          1, -2, 3,
          -4, 5, -6,
          7, -8, 9
        ))
    ).be.true();
  });

  it('should have an inverse method', function () {
    expect(function () {
      gen_special().inverse();
    }).throw('determinant is zero');

    function detNonZero() {
      return new Matrix3(
        4, 5, 6,
        6, 5, 4,
        4, 6, 5
      );
    }

    expect(
      new Matrix3(
        4, 5, 6,
        6, 5, 4,
        4, 6, 5
      ).inverse()
        .equals(new Matrix3(
          1/30, 11/30, -1/3,
          -7/15, -2/15, 2/3,
          8/15, -2/15, -1/3
        ))
    ).be.true();

    expect(
      detNonZero()
        .inverse()
        .multiply(detNonZero())
        .equals(new Matrix3())
    ).be.true();

  });

  it('should have a transpose method', function () {
    expect(
      new Matrix3().setTranspose(gen())
        .equals(new Matrix3(
          -1, 4, -7,
          2, -5, 8,
          -3, 6, -9
        ))
    ).be.true();

    expect(
      gen().transformTranspose(new Vector3(1, 2, 3))
        .equals(new Vector3(
          -1 + 2*4 -7*3,
          2 - 5*2 + 8*3,
          -3 + 6*2 - 9*3
        ))
    ).be.true();
  });

  it('should have a method to set its main diagonal', function () {
    expect(
      gen().setDiagonal(7, 8, 9)
        .equals(new Matrix3(
          7, 0, 0,
          0, 8, 0,
          0, 0, 9
        ))
    ).be.true();
  });

  it('should have a method to set its values from 3 vectors', function () {
    expect(
      new Matrix3()
        .setComponents(
          new Vector3(1, 2, 3),
          new Vector3(4, 5, 6),
          new Vector3(7, 8, 9)
        )
        .equals(new Matrix3(
          1, 4, 7,
          2, 5, 8,
          3, 6, 9
        ))
    ).be.true();
  });

  it('should have a method to transform it to a rotation matrix from a quaternion', function () {
    // matrix3 representation uses the right hand rule
    var q;
    var cosAngle = Math.cos(Math.PI * 0.5);
    var sinAngle = Math.sin(Math.PI * 0.5);
    q = Quaternion.fromVectorAndAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
    expect(
      new Matrix3().setOrientation(q)
        .equals(new Matrix3(
          cosAngle, 0, sinAngle,
          0, 1, 0,
          -sinAngle, 0, cosAngle
        ))
    ).be.true();

    q = new Quaternion(0, 2, -1, -3);
    expect(
      new Matrix3().setOrientation(q)
        .equals(new Matrix3(
          -3/7, -2/7, -6/7,
          -2/7, -6/7, 3/7,
          -6/7, 3/7, 2/7
        ))
    ).be.true();

    q = new Quaternion(11, -2, 0, -2);
    expect(
      new Matrix3().setOrientation(q)
        .equals(new Matrix3(
          121/129, 44/129, 8/129,
          -44/129, 113/129, 44/129,
          8/129, -44/129, 121/129
        ))
    ).be.true();

    q = new Quaternion(5, -3, 1, -7);
    expect(
      new Matrix3().setOrientation(q)
        .equals(new Matrix3(
          -4/21, 16/21, 13/21,
          -19/21, -8/21, 4/21,
          8/21, -11/21, 16/21
        ))
    ).be.true();

    q = new Quaternion(1, -2, 3, -4);
    expect(
      new Matrix3().setOrientation(q)
        .equals(new Matrix3(
          -2/3, -2/15, 11/15,
          -2/3, -1/3, -2/3,
          1/3, -14/15, 2/15
        ))
    ).be.true();
  });

  it('should have methods to set primitive inertia tensors', function () {
    expect(
      gen().setInertialTensorCoefficients(1, 2, 3, 4, 5, 6)
        .equals(new Matrix3(
          1, -4, -5,
          -4, 2, -6,
          -5, -6, 3
        ))
    ).be.true();

    expect(
      gen().setBlockInertialTensor(new Vector3(10, 10, 10), 5)
        .equals(new Matrix3(
          200*5*0.3, 0, 0,
          0, 200*5*0.3, 0,
          0, 0, 200*5*0.3
        ))
    ).be.true();

    expect(
      gen().setSphereInertialTensor(5, 5)
        .equals(new Matrix3(
          50, 0, 0,
          0, 50, 0,
          0, 0, 50
        ))
    ).be.true();
  });

  it('should set its values from a vector to form a skew symmetric matrix', function () {
    var a = new Vector3(-1, 2, -3);
    var b = new Vector3(37, -21, 7);
    var m = new Matrix3();
    expect(
      m.setSkewSymmetric(a)
        .equals(new Matrix3(
          0, 3, 2,
          -3, 0, 1,
          -2, -1, 0
        ))
    ).be.true();

    expect(
      m.transform(b)
        .equals(a.cross(b))
    ).be.true();
  });
});