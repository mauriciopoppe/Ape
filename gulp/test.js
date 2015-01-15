var gulp = require('gulp');
var mocha = require('gulp-mocha');
var assert = require('assert');
var watch = require('gulp-watch');
var path = require('path');

module.exports = function (options) {
  options = options || {};
  assert(options.src);
  assert(options.test);

  gulp.task('test', function () {
    return gulp.src([path.resolve(options.test, 'index.js')], { read: false })
      .pipe(mocha({ reporter: 'spec' }))
      .on('error', function (err) {
        console.log(err);
        this.emit('end');
      });
  });

  gulp.task('watch:test', function () {
    return watch(
      [
        path.resolve(options.src, '**'),
        path.resolve(options.test, '**')
      ],
      function () {
        gulp.start('test');
      }
    );
  });
};