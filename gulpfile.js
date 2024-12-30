const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');

function compileSass() {
  return gulp
    .src('./scss/main.scss') // Source SCSS file
    .pipe(sass().on('error', sass.logError)) // Compile Sass to CSS
    // .pipe(cleanCSS()) // Minify CSS
    // .pipe(rename({ suffix: '.min' })) // Rename the minified file
    .pipe(gulp.dest('./assets')); // Destination directory for the compiled CSS
}

function watchSass() {
  gulp.watch('./scss/**/*.scss', compileSass); // Watch for changes in SCSS files
}

exports.default = gulp.series(compileSass, watchSass);