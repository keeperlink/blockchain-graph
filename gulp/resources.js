'use strict';

var conf = require('./conf'),
        connect = require('gulp-connect'),
        gulp = require('gulp');

gulp.task('resources', function () {
    return gulp.src('src/main/resources/**')
            .pipe(gulp.dest(conf.paths.dist))
            .pipe(connect.reload());
});
