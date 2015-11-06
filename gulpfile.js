'use strict'

let name       = require('./package.json').moduleName,
    gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require('babelify'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    plugins    = require('gulp-load-plugins')()

const catchError = function(err) {

	console.log(err.toString())
	this.emit('end')

}

const scripts = function() {

	let bify = browserify({
		entries    : './src/scripts/main.js',
		standalone : name
	})

	let transformer = babelify.configure({
		presets: ['es2015']
	})

	bify.transform(transformer)
	    .bundle()
	    .on('error', catchError)
	    .pipe(source(name + '.min.js'))
	    .pipe(buffer())
	    .pipe(plugins.uglify())
	    .on('error', catchError)
	    .pipe(gulp.dest('./dist'))

}

const watch = function() {

	gulp.watch('./src/styles/**/*.scss', ['styles'])
	gulp.watch('./src/scripts/**/*.js', ['scripts'])

}

gulp.task('scripts', scripts)
gulp.task('default', ['scripts'])
gulp.task('watch', ['default'], watch)