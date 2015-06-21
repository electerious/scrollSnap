var	name    = require('./package.json').moduleName,
    fs      = require('fs'),
    gulp    = require('gulp'),
    plugins = require('gulp-load-plugins')()

var head = fs.readFileSync('./node_modules/@electerious/modulizer/head.js', { encoding: 'utf8' }),
    foot = fs.readFileSync('./node_modules/@electerious/modulizer/foot.js', { encoding: 'utf8' })

var catchError = function(err) {

	console.log(err.toString())
	this.emit('end')

}

gulp.task('scripts', function() {

	gulp.src('./src/scripts/*.js')
	    .pipe(plugins.header(head, { name: name }))
	    .pipe(plugins.footer(foot))
	    .pipe(plugins.babel())
	    .pipe(plugins.concat(name + '.min.js', { newLine: "\n" }))
	    .pipe(plugins.uglify())
	    .on('error', catchError)
	    .pipe(gulp.dest('./dist'))

})

gulp.task('default', ['scripts'])

gulp.task('watch', ['scripts'], function() {

	gulp.watch('./src/scripts/*.js', ['scripts'])

})