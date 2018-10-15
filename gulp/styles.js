'use strict';

var gulp = require('gulp'),
        sass = require('gulp-ruby-sass'),
        autoprefixer = require('gulp-autoprefixer'),
        cssnano = require('gulp-cssnano'),
        conf = require('./conf'),
        connect = require('gulp-connect');

gulp.task('styles', function () {
    return sass(conf.paths.src + '/styles/graphd3.scss', {style: 'expanded'})
            .pipe(autoprefixer('last 2 version'))
            .pipe(cssnano())
            .pipe(gulp.dest(conf.paths.dist + '/css'))
            .pipe(connect.reload());
});
