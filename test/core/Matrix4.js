/**
 * Created by mauricio on 1/18/15.
 */
var Matrix4 = require('../../src/js/Matrix4');
var Vector3 = require('../../src/js/Vector3');
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
});