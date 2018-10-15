'use strict';

var gulp = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('default', function(callback) {
    runSequence('clean', 'resources', 'html', 'images', 'scripts', 'styles', 'connect', 'watch', callback);
});
