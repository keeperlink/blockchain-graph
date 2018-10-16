'use strict';

var gulp = require('gulp'),
        conf = require('./conf'),
        removeLogging = require('gulp-remove-logging'),
        uglify = require('gulp-uglify');

gulp.task('scripts-uglify', function () {
    return gulp.src(conf.paths.dist + '/js/bgraph.js')
            .pipe(removeLogging())
            .pipe(uglify({mangle: {toplevel: false}}))//, properties: {reserved:['./scripts/init','./graphd3','./transformView','initGraph','zn']}
            .pipe(gulp.dest(conf.paths.dist + '/js'));
});
