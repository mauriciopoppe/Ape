var browserSync = require('browser-sync');
var gulp = require('gulp');
var path = require('path');
var production = process.env.NODE_ENV === 'production';

/**
 * make a little server
 * @param {Object} folders
 * @param {string} folders.baseDir Alternative server base dir
 */
module.exports = function (folders) {
  folders = folders || {};
  var root = production ? folders.build : folders.project;

  gulp.task('server', function () {
    browserSync({
      server: {
        baseDir: root
      },
      // logLevel: 'debug',
      // notify: false,
      // tunnel: true
    });
  });
};