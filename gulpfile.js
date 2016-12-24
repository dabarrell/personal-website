var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var clean = require('gulp-rimraf');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var runSequence = require('run-sequence');

// Set the banner content
var banner = ['/*!\n',
    ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2016-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Clean
gulp.task('clean', function() {
  console.log("Clean all files in distribution folder");
  return gulp.src("dist/*", { read: false })
    .pipe(clean());
});

// Compile SASS files from /sass into /css
gulp.task('sass:inner', function() {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('sass:clean', function() {
    return gulp.src('src/css/**/*.css', { read: false })
        .pipe(clean());
});
gulp.task('sass', function(cb) {
    runSequence('sass:clean', 'sass:inner', cb);
});

// Minify compiled CSS
gulp.task('minify-css:inner', ['sass'], function() {
    return gulp.src('src/css/**/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('minify-css:clean', function() {
    return gulp.src('dist/css/**/*.css', { read: false })
        .pipe(clean());
});
gulp.task('minify-css', function(cb) {
    runSequence('minify-css:clean', 'minify-css:inner', cb);
});

// Minify JS
gulp.task('minify-js:inner', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('minify-js:clean', function() {
    return gulp.src('dist/js/**/*.js', { read: false })
        .pipe(clean());
});
gulp.task('minify-js', function(cb) {
    runSequence('minify-js:clean', 'minify-js:inner', cb);
});

// Copy vendor libraries from /node_modules into /dist/vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('dist/vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('dist/vendor/jquery'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('dist/vendor/font-awesome'))
});

// Copy .html files from /src to /dist
gulp.task('html:inner', function() {
    return gulp.src(['src/**/*.html'])
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('html:clean', function() {
    return gulp.src('dist/**/*.html', { read: false })
        .pipe(clean());
});
gulp.task('html', function(cb) {
    runSequence('html:clean', 'html:inner', cb);
});

// Copy and optimise images
gulp.task('images:inner', function(){
    gulp.src('src/img/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/img/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('images:clean', function() {
    return gulp.src('dist/img/**/*', { read: false })
        .pipe(clean());
});
gulp.task('images', function(cb) {
    runSequence('images:clean', 'images:inner', cb);
});

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist/'
        },
    })
});

// Run everything
gulp.task('default', ['sass', 'minify-css', 'minify-js', 'copy', 'html', 'images']);

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'minify-css', 'minify-js', 'copy', 'html', 'images'], function() {
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/css/**/*.css', ['minify-css']);
    gulp.watch('src/js/**/*.js', ['minify-js']);
    gulp.watch('src/img/**/*', ['images']);
    gulp.watch('src/**/*.html', ['html']);
});
