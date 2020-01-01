var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var clean = require('gulp-rimraf');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var handlebars = require('gulp-compile-handlebars');
var fs = require('fs');
var yaml = require('yaml-js');
var exec = require('child_process').exec;
var argv  = require('minimist')(process.argv);
var rsync = require('gulp-rsync');
var prompt = require('gulp-prompt');
var gulpif = require('gulp-if');

// Set the banner content
var banner = ['/*\n',
    ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2016-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %>\n',
    ' */\n',
    ''
].join('');

// Clean
gulp.task('clean', function() {
  console.log("Clean all files in build folder");
  return gulp.src("build/*", { read: false })
    .pipe(clean());
});

// Minify compiled CSS
gulp.task('minify-css:inner', function() {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('build/css'))
        .pipe(sourcemaps.init())
            .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('minify-css:clean', function() {
    return gulp.src('build/css/**/*.css', { read: false })
        .pipe(clean());
});
gulp.task('minify-css', gulp.series('minify-css:clean', 'minify-css:inner', function(cb) { cb(); }));

// Minify JS
gulp.task('minify-js:inner', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(sourcemaps.init())
            .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('minify-js:clean', function() {
    return gulp.src('build/js/**/*.js', { read: false })
        .pipe(clean());
});
gulp.task('minify-js', gulp.series('minify-js:clean', 'minify-js:inner', function(cb) { cb(); }));

// Copy vendor libraries from /node_modules into /build/vendor
gulp.task('copy', function(cb) {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*'])
        .pipe(gulp.dest('build/vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/**/*'])
        .pipe(gulp.dest('build/vendor/jquery'))

    gulp.src(['node_modules/slick-carousel/slick/**/*'])
        .pipe(gulp.dest('build/vendor/slick'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('build/vendor/font-awesome'))
    
    cb()
});

// Copy .html files from /src to /build
gulp.task('html:inner', function() {
    return gulp.src(['src/**/*.html'])
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('html:clean', function() {
    return gulp.src('build/**/*.html', { read: false })
        .pipe(clean());
});
gulp.task('handlebars', function() {
    var options = {
            ignorePartials: true
        };

    return gulp.src('src/templates/**/*.hbs')
        .pipe(handlebars(
          yaml.load(fs.readFileSync('./src/data.yaml')),
          options))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('html', gulp.series('html:clean', 'handlebars', 'html:inner', function(cb) { cb(); }));

// Copy and optimise images
gulp.task('images:inner', function(){
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('images:clean', function() {
    return gulp.src('build/img/**/*', { read: false })
        .pipe(clean());
});
gulp.task('images', gulp.series('images:clean', 'images:inner', function(cb) { cb(); }));

// Copy documents
gulp.task('docs:inner', function(){
    return gulp.src('src/docs/**/*')
        .pipe(gulp.dest('build/docs/'));
});
gulp.task('docs:clean', function() {
    return gulp.src('build/docs/**/*', { read: false })
        .pipe(clean());
});
gulp.task('docs', gulp.series('docs:clean', 'docs:inner', function(cb) { cb(); }));

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'build/'
        },
    })
});

// Run everything
gulp.task('default', gulp.series('minify-css', 'minify-js', 'copy', 'html', 'images', 'docs', function(cb) { cb() }));

// Set up watches
gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', gulp.series('minify-css'));
    gulp.watch('src/js/**/*.js', gulp.series('minify-js'));
    gulp.watch('src/img/**/*', gulp.series('images'));
    gulp.watch('src/docs/**/*', gulp.series('docs'));
    gulp.watch('src/**/*.html', gulp.series('html'));
    gulp.watch('src/templates/**/*.hbs', gulp.series('html'));
    gulp.watch('src/data.json', gulp.series('html'));
    gulp.watch('src/data.yaml', gulp.series('html'));
});

// Dev task with browserSync
gulp.task('dev', gulp.series(
    gulp.parallel('minify-css', 'minify-js', 'copy', 'html', 'images', 'docs', function(cb) { cb() }),
    'watch',
    'browserSync',
    function(cb) { cb() }
))
