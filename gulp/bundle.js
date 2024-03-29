/**
 * Created by mauricio on 1/14/15.
 */
// recipe:
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
var path = require('path');
var assert = require('assert');
var browserify = require('browserify');
var watchify = require('watchify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var _ = require('lodash');
var gulp = require('gulp');
var uglify = require('gulp-uglify');

var pkg = require('../package.json');
var production = process.env.NODE_ENV === 'production';

/**
 * browserify app task
 * @param  {Object} folders
 * @param {Array} folders.src
 * @param {string} folders.output
 * @param {Array} external
 */
module.exports = function (folders, external) {
  folders = folders || {};
  external = external || [];
  // bundle index.js file
  assert(folders.src);
  // ouptut directory of the bundled file
  assert(folders.build);

  /**
   * Bundle generator which creates production ready bundles
   * @param  {Object} local
   * @param  {Object} local.src Index file of bundle
   * @param  {Object} local.name Name of the bundle
   * @param  {Object} local.standalone True to make it standalone
   * under window[name]
   * @param  {Object} local.onPreBundle Prebundle hook
   * @return {stream}
   */
  function generateBundler(local) {
    local = _.merge({
      onPreBundle: function () {}
    }, local);

    var name = local.name;
    var bundler = browserify({
      standalone: name,
      entries: local.src,
      extensions: ['js'],
      cache: {},
      packageCache: {},
      fullPaths: true,
      debug: true
    });

    if (!production) {
      bundler = watchify(bundler);
    }

    var bundle = function () {
      // concat
      console.log('building ' + name);
      console.time('browserify ' + name);

      var stream = bundler
        .bundle()
        .on('error', function (e) {
          console.error(e);
        })
        .pipe(source(name + (production ? '.min' : '') + '.js'))

      if (production) {
        stream
          .pipe(buffer())
          // <sourceMaps> source maps + uglify
          .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
          .pipe(sourcemaps.write('./'));
          // </sourceMaps>
      }

      stream
        .pipe(gulp.dest(folders.build))
        .on('end', function () {
          console.time('browserify ' + name);
        });

      return stream;
    };

    if (!production) {
      bundler.on('update', bundle);
    }

    return bundle();
  }

  gulp.task('bundle:app', function () {
    return generateBundler({
      src: path.join(folders.src, 'index.js'),
      name: pkg.name[0].toUpperCase() + pkg.name.substr(1)
    });
  });

  gulp.task('bundle', ['bundle:app']);

  // export the bundler
  module.exports.bundlerGenerator = generateBundler;
};