var	gulp = require('gulp'),
	plugins = require('gulp-load-plugins')();

gulp.task('scripts', function () {

	gulp.src('./src/scripts/*.js')
		.pipe(plugins.babel())
		.pipe(plugins.concat('fluidScroll.min.js', {newLine: "\n"}))
		// .pipe(plugins.uglify())
		.pipe(gulp.dest('./dist'));

});

gulp.task('default', ['scripts']);

gulp.task('watch', function() {
	gulp.watch('./src/scripts/*.js', ['scripts']);
});