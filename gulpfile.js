const { dest, series, src } = require('gulp');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

function buildClean(cb) {
  return src('dist').pipe(clean({ force: true }));
}

function build() {
  return src('src/*.ts')
    .pipe(
      ts({
        noImplicitAny: true,
      })
    )
    .pipe(dest('dist'));
}

function buildMinify() {
  return src('src/*.ts')
    .pipe(
      ts({
        noImplicitAny: true,
      })
    )
    .pipe(
      uglify({
        output: {
          comments: 'some',
        },
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('dist'));
}

exports.default = series(buildClean, build, buildMinify);
