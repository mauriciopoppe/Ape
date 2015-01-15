var me = __dirname;
var gulp = require('gulp');
var _ = require('lodash');
var path = require('path');
var pkg = require('./package.json');

// additional folder is the root of the project
pkg.folders.project = '.';
_(pkg.folders).forOwn(function (v, k) {
    pkg.folders[k] = path.resolve(me, v);
});

// tasks:
// - bundle:app
var bundler = require('./gulp/bundle');
bundler(pkg.folders);

// tasks:
// - build
// - minify
require('./gulp/build')();

// tasks:
// - server
require('./gulp/server')(pkg.folders);

// tasks:
// - test
// - watch:test
require('./gulp/test')(pkg.folders);
// tasks:
// - release:major
// - release:minor
// - release:patch
require('./gulp/release')();

// main tasks
gulp.task('watch', ['watch:test']);
gulp.task('default', ['bundle', 'watch'], function () {
    gulp.start('server');
});