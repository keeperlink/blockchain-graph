'use strict';

var gulp = require('gulp'),
        runSequence = require('run-sequence');

gulp.task('prod_build', function (callback) {
    runSequence('clean', 'resources', 'html', 'images', 'scripts', 'scripts-uglify', 'styles', callback);
});
