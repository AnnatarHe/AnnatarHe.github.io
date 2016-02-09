'use strict'

const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const stylus = require('gulp-stylus')
const autoprefixer = require('gulp-autoprefixer')
// const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const concat = require('gulp-concat')

gulp.task('css', () => {
    return gulp.src('src/styles/app.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true
        }))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css/'))
})

gulp.task('js', () => {
    return gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js/'))
})

gulp.task('default', ['css', 'js'])
gulp.task('watch', () => {
    gulp.watch('src/styles/**/*.styl', ['css'])
    gulp.watch('src/js/**/*.js', ['js'])
})
