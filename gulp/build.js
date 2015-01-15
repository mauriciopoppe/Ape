/**
 * Created by mauricio on 1/14/15.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var assert = require('assert');
var path = require('path');
var pkg = require('../package.json');
var folders = pkg.folders;

module.exports = function () {
    assert(pkg.src);

    var srcList = pkg.src;
    srcList = srcList.map(function (v) {
        return folders.src + '/' + v;
    });

    gulp.task('minify', function () {
        gulp.src(srcList)
            .pipe(concat(pkg.name + '.js'))
            .pipe(gulp.dest(folders.build))
            .pipe(uglify({
                outSourceMap: true
            }))
            .pipe(rename(function (path) {
                path.basename += '.min';
            }))
            .pipe(gulp.dest(folders.build));
    });

    gulp.task('build', ['minify']);
};