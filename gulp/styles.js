'use strict';

var gulp = require('gulp'),
        sass = require('gulp-ruby-sass'),
        concat = require('gulp-concat'),
        autoprefixer = require('gulp-autoprefixer'),
        cssnano = require('gulp-cssnano'),
        conf = require('./conf'),
        connect = require('gulp-connect');

gulp.task('styles', function () {
    return sass(conf.paths.src + '/styles/*.scss',{style: 'expanded'})
            .pipe(concat('graphd3.css'))
            .pipe(autoprefixer('last 2 version'))
            .pipe(cssnano())
            .pipe(gulp.dest(conf.paths.dist + '/css'))
            .pipe(connect.reload());
});
