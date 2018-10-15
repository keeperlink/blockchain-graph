'use strict';

var _ = require('lodash'),
        browserify = require('browserify'),
        buffer = require('vinyl-buffer'),
        concat = require('gulp-concat'),
        conf = require('./conf'),
        connect = require('gulp-connect'),
        derequire = require('gulp-derequire'),
        gulp = require('gulp'),
        gutil = require('gulp-util'),
        jshint = require('gulp-jshint'),
        notifier = require('node-notifier'),
        path = require('path'),
        plumber = require('gulp-plumber'),
        source = require('vinyl-source-stream'),
        watchify = require('watchify');

gulp.task('scripts', ['scripts:jshint', 'scripts:derequire'], function () {
    return gulp.src(conf.paths.dist + '/js/bgraph.js')
            .pipe(gulp.dest(conf.paths.dist + '/js'))
            .pipe(connect.reload());
});

gulp.task('scripts:jshint', function () {
    return gulp.src(conf.paths.src + '/scripts/*.js')
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'));
});

gulp.task('scripts:derequire', function () {
    return buildScript(path.join(conf.paths.src, '/index.js'), 'dev');
});

function buildScript(filename, mode) {
    var bundleFilename = 'index.js';

    var browserifyConfig = {
        standalone: 'initGraph'
    };

    var bundler;

    if (mode === 'dev') {
        bundler = browserify(filename, _.extend(browserifyConfig, {debug: true}));
    } else if (mode === 'prod') {
        bundler = browserify(filename, browserifyConfig);
    } else if (mode === 'watch') {
        if (cached[filename]) {
            return cached[filename].bundle();
        }

        bundler = watchify(browserify(filename, _.extend(browserifyConfig, watchify.args, {debug: true})));
        cached[filename] = bundler;
    }

    function rebundle() {
        var stream = bundler.bundle()
                .on('error', function (err) {
                    error.call(this, err);
                });

        return stream
                .pipe(plumber({errorHandler: error}))
                .pipe(source(bundleFilename))
                .pipe(derequire())
                .pipe(buffer())
                .pipe(concat('bgraph.js'))
                .pipe(gulp.dest(conf.paths.dist + '/js'));
    }

    // listen for an update and run rebundle
    bundler.on('update', function () {
        rebundle();
        gutil.log('Rebundle...');
    });

    // run it once the first time buildScript is called
    return rebundle();
}

function error(err) {
    notifier.notify({message: 'Error: ' + err.message});
    gutil.log(gutil.colors.red('Error: ' + err));
    this.emit('end');
}
