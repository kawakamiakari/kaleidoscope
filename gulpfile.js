const { dest, series, src, watch } = require('gulp');
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

function copyForDemo() {
  return src('dist/kaleidoscope.min.js').pipe(dest('docs'));
}

exports.watch = function() {
  watch('src/*.ts', series(buildClean, build, buildMinify, copyForDemo));
};
exports.default = series(buildClean, build, buildMinify, copyForDemo);
