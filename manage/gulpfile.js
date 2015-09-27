'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    gulpFilter = require('gulp-filter'),
    bower = require('main-bower-files'),
    webserver = require('gulp-webserver'),
    watch = require('gulp-watch'),
    del = require('del'),
    runSequence = require('run-sequence'),
    config = require('./config');

gulp.task('clean', function(cb) {
    return del(config.dist.base, cb);
});

gulp.task('copy', function() {
    return gulp.src(config.src.views)
               .pipe(gulp.dest(config.dist.base));
});

gulp.task('images', function() {
    return gulp.src(config.src.images)
               .pipe(gulp.dest(config.dist.base));
});

gulp.task('scripts', function() {
    return gulp.src(config.src.scripts)
        .pipe(concat(config.output.buildJs))
        .pipe(gulp.dest(config.dist.js))
        .pipe(uglify())
        .pipe(rename({
            extname: config.output.minJs
        }))
        .pipe(gulp.dest(config.dist.js));
});

gulp.task('bowerJs', function() {
    var jsFilter = gulpFilter(config.filter.js);
    return gulp.src(bower())
           .pipe(jsFilter)
           .pipe(concat(config.output.bowerJs))
           .pipe(gulp.dest(config.dist.js))
           .pipe(uglify())
           .pipe(rename({
               extname: config.output.minJs
            }))
           .pipe(gulp.dest(config.dist.js));
});

gulp.task('bowerCss', function() {
    var cssFilter = gulpFilter(config.filter.css);
    return gulp.src(bower())
           .pipe(cssFilter)
           .pipe(concat(config.output.bowerCss))
           .pipe(gulp.dest(config.dist.css))
           .pipe(minifyCss())
           .pipe(rename({
               extname: config.output.minCss
            }))
           .pipe(gulp.dest(config.dist.css));
});

gulp.task('watch', function () {
    watch(config.src.scripts, function () {
        gulp.start(['scripts']);
    });

    watch(config.src.views, function () {
        gulp.start(['copy']);
    });
});

gulp.task('webserver', function() {
    console.log(config.dist.base);
    return gulp.src(config.dist.base)
        .pipe(webserver({
            host: process.env.DEV_HOST || 'localhost',
            port: process.env.DEV_PORT || 8080,
            livereload: true
        }));
});

gulp.task('bower', ['bowerJs', 'bowerCss']);

gulp.task('build', function(cb) {
  runSequence('clean', ['bower', 'scripts', 'copy'], cb);
});

gulp.task('default', ['webserver','watch']);
