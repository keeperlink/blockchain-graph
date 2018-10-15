'use strict';

var conf = require('./conf'),
        minifyHTML = require("gulp-htmlmin"),
        connect = require('gulp-connect'),
//        notify = require('gulp-notify'),
//        inject = require("gulp-inject"),
        version = require('gulp-version-number'),
        gulp = require('gulp');

gulp.task('html', function () {
    return gulp.src('src/main/html/**/*.html')
            .pipe(version({value: '%MDS%', replaces: [/{version}/g]}))
            .pipe(minifyHTML({collapseWhitespace: true}))
            .pipe(gulp.dest(conf.paths.dist))
            .pipe(connect.reload());
});
