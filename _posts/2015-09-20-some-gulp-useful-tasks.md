---
layout: post
title: 一些有用的gulp模板
tags: gulp front-end
---

## Introduction

正如**阮一峰**所说，前端变化太快了。

前年还在用`Grunt`, 去年就用了`Gulp`，而今年都在用`Webpack`，明年或许都用`Brunch`了。

我之前一直在用`Grunt`，后来追`Gulp`了。后来就实在是不想追了。就老老实实用`gulp`吧

## Normal

正常的项目大概会需要以下的一些内容

* sass转义
* js文件合并压缩
* ES6 转 ES5

那么就先安装依赖：

{% highlight console %}
$ npm install 6to5ify gulp gulp-autoprefixer gulp-babel gulp-browserify2 gulp-concat gulp-minify-css gulp-notify gulp-sass gulp-sourcemaps gulp-uglify gulp-hash --save-dev
{% endhighlight %}

这一块定义一个我适用的基本的模板。

分别有`sass`和`js`任务。

可以编译`sass`和`ES6`的语法到正常浏览器能解析的样子。

运行`production`则生成生产环境下的文件在`productions`目录
{% highlight js %}
var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    browserify = require('gulp-browserify2'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    hash = require('gulp-hash'),
    concat = require('gulp-concat');

gulp.task('sass', function() {
  return gulp.src('src/style/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/style/'))
        .pipe(notify({ message: 'normal css file was successfully build!'}));
});

gulp.task('production-sass', function() {
  return gulp.src('src/style/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(minifycss())
        .pipe(sourcemaps.write('.'))
        .pipe(hash())
        .pipe(gulp.dest('production/style/'))
        .pipe(hash.manifest('asset-hashes.json')) 
        .pipe(gulp.dest('production/style/'))
        .pipe(notify({ message: 'production css file was successfully build!'}));
});

gulp.task('js', function() {
  return gulp.src('src/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(browserify({
          fileName: 'bundle.js',
          transform: require('6to5ify'),
          options: {
            debug: false
          }
        })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js/'))
        .pipe(notify({ message: 'normal js file was successfully build!'}));
});

gulp.task('production-js', function() {
  return gulp.src('src/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(browserify({
          fileName: 'bundle.js',
          transform: require('6to5ify'),
          options: {
            debug: false
          }
        })
        )
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(hash())
        .pipe(gulp.dest('production/js/'))
        .pipe(hash.manifest('asset-hashes.json')) 
        .pipe(gulp.dest('production/js/'))
        .pipe(notify({ message: 'production js file was successfully build!'}));
});

gulp.task('default', function() {
  gulp.start('sass', 'js');
});

gulp.task('watch', function() {
  gulp.watch('src/style/*.scss', ['sass']);
  gulp.watch('src/js/*.js', ['js']);
});

gulp.task('production', function() {
  gulp.start('production-sass', 'production-js');
});
{% endhighlight %}

## React

现在`React`这么火，我当然也是会写一些`React`项目的。

首先是安装依赖

注意：这里没有写其他的部分。需要`css`部分的，参考上面的部分

{% highlight console %}
npm install --save-dev gulp browserify vinyl-source-stream babelify
{% endhighlight %}

然后是任务编写：

{% highlight js %}
var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");

gulp.task('jsx', function(){
  return browserify('./js/app.js')
         .transform(babelify)
         .bundle()
         .pipe(source('bundle.js'))
         .pipe(gulp.dest('js'));
});
{% endhighlight %}