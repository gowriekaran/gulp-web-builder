const gulp = require('gulp');
const { parallel, series } = require('gulp');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const uglifyCSS = require('gulp-uglifycss');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const nunjucksRender = require('gulp-nunjucks-render');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');

function cleanFiles(cb) {
	del.sync(['dist']);
	cb();
}

function nunjucks(cb) {
	gulp.src('src/pages/*.html')
		.pipe(
			nunjucksRender({
				path: ['src/templates/'],
			})
		)
		.pipe(gulp.dest('dist'));
	cb();
}

function minifyNunjucks(cb) {
	gulp.src('dist/*.html')
		.pipe(
			htmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(gulp.dest('dist'));
	cb();
}

function copyJS(cb) {
	gulp.src('src/assets/js/*.js')
		.pipe(gulp.dest('dist/assets/js'));
	cb();
}

function copyJSMap(cb) {
	gulp.src('src/assets/js/*.map').pipe(gulp.dest('dist/assets/js'));
	cb();
}

function minifyJS(cb) {
    gulp.src("dist/assets/js/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist/assets/js"));
    cb();
}

function copyCSS(cb) {
	gulp.src('src/assets/css/*.css').pipe(gulp.dest('dist/assets/css'));
	cb();
}

function copyCSSMap(cb) {
	gulp.src('src/assets/css/*.map').pipe(gulp.dest('dist/assets/css'));
	cb();
}

function copySCSS(cb) {
	gulp.src('src/assets/sass/*.scss')
		.pipe(
			sass({
				outputStyle: 'compressed',
			}).on('error', sass.logError)
		)
		.pipe(
			autoprefixer({
				browserlist: ['last 2 versions'],
				cascade: false,
			})
		)
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(browserSync.stream());
	cb();
}

function minifyCSS(cb) {
    gulp.src("dist/assets/css/*.css")
        .pipe(uglifyCSS())
        .pipe(gulp.dest("dist/assets/css"));
    cb();
}

function copyFonts(cb) {
	gulp.src('src/assets/fonts/*.{ttf,otf}').pipe(gulp.dest('dist/assets/fonts'));
	cb();
}

function minifyImgs(cb) {
	gulp.src('dist/assets/images/**')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/assets/images'));
	cb();
}

function copyImgs(cb) {
	gulp.src('src/assets/images/**')
		.pipe(gulp.dest('dist/assets/images'));
	cb();
}

function watch_files() {
	browserSync.init({
		server: {
			baseDir: 'dist/',
		},
	});
	gulp.watch('src/pages/*.html', nunjucks).on('change', browserSync.reload);
	gulp.watch('src/templates/*.html', nunjucks).on('change', browserSync.reload);
	gulp.watch('src/assets/js/*.js', copyJS).on('change', browserSync.reload);
	gulp.watch('src/assets/css/**/*.css', copyCSS);
	gulp.watch('src/assets/sass/**/*.scss', copySCSS);
	gulp.watch('src/assets/fonts/*.{ttf,otf}', copyFonts).on('change', browserSync.reload);
	gulp.watch('src/assets/images/*.{png,jpg,jpeg,gif,svg}', copyImgs).on('change', browserSync.reload);
}

exports.default = series(
	cleanFiles,
	series(nunjucks, copyJS, copyJSMap, copyCSS, copyCSSMap, copySCSS, copyFonts, copyImgs, watch_files)
);

exports.build = series(
	cleanFiles,
	parallel(nunjucks, copyJS, copyJSMap, copyCSS, copyCSSMap, copySCSS, copyFonts, copyImgs),
	parallel(minifyNunjucks, minifyJS, minifyCSS)
);

exports.minifyImgs = series(
	copyImgs,
	minifyImgs
);