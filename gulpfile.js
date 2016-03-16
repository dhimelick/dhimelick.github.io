var gulp    = require('gulp'),
	connect = require('gulp-connect');

gulp.task('reload-index-html', function () {
	gulp.src('index.html')
		.pipe(connect.reload());
});

gulp.task('reload-html', function () {
	gulp.src('files/*.html')
		.pipe(connect.reload());
});

gulp.task('reload-js', function () {
	gulp.src('./js/*.js')
		.pipe(connect.reload());
});

gulp.task('connect', function() {
	connect.server({
		port: 8001,
		livereload: true
	});
});

gulp.task('default', ['connect'], function() {
	gulp.watch('files/*.html', ['reload-html']);
	gulp.watch('index.html', ['reload-index-html']);
	gulp.watch('./js/*.js', ['reload-js']);
});
