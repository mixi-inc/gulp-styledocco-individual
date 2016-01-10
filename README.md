gulp-styledocco-individual
===========================

[![Build Status](https://travis-ci.org/mixi-inc/gulp-styledocco-individual.svg?branch=master)](https://travis-ci.org/mixi-inc/gulp-styledocco-individual)
[![npm version](https://badge.fury.io/js/gulp-styledocco-individual.svg)](https://badge.fury.io/js/gulp-styledocco-individual)


Gulp plugin for [StyleDocco](https://jacobrask.github.io/styledocco/) and supports incremental building.

SytleDocco is a great documentation tool for CSS/Less/Sass and so on.
And now, this tool does not support incremental building.
Because generated docuents have navigations to each others.
So we can not generate documents incrementally.

But we can generate documents individually, and then we can do incremental building.

For example:

- StyleDocco (not individual):
  - `path/to/file.css` -> `path/to/docs/file.html`
  - `path/to/sub/file.css` -> `path/to/docs/sub-file.html`
  - These documents include navigations for each others.

- StyleDocco (individual): 
  - `path/to/file.css` -> `path/to/docs/file.css/file.html`
  - `path/to/sub/file.css` -> `path/to/docs/sub/file.css/file.html`
  - These documents do NOT include navigations for each others.


Example
-------

```javascript
var gulp = require('gulp');
var styledocco = require('gulp-styledocco-individual').styledoccoIndividual;

gulp.task('docs', () => {
  return gulp.src('css/**/*.css')
    .pipe(styledocco({ out: 'docs' }));
});
```

And this plugin pass through got files when processing is done.
So, you can write:

```javascript
var gulp = require('gulp');
var styledocco = require('gulp-styledocco-individual').styledoccoIndividual;
var autoprefixer = require('gulp-autoprefixer');

gulp.task('docs', () => {
  return gulp.src('css/**/*.css')
    .pipe(styledocco({ out: 'docs' }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('built'));
});
```


### ES2015 style

See [Using ES6 with gulp](https://markgoodyear.com/2015/06/using-es6-with-gulp/).

```javascript
import gulp from 'gulp';
import {styledoccoIndividual} from 'gulp-styledocco-individual';

gulp.task('docs', () => {
  return gulp.src('css/**/*.css')
    .pipe(styledoccoIndividual({ out: 'docs' }));
});
```


Install
-------

```sh-session
$ npm install --save-dev gulp-styledocco-individual
```


Options
-------

### Summary

| Option Name     | Type       | Optional | Default                                   |
|:----------------|:-----------|:---------|:------------------------------------------|
| `out`           | `string`   | yes      | `'docs'`                                  |
| `name`          | `string`   | yes      | `name` property of `package.json` or `''` |
| `includes`      | `string[]` | yes      | None                                      |
| `verbose`       | `boolean`  | yes      | `false`                                   |
| `noMinify`      | `boolean`  | yes      | `false`                                   |
| `preprocessor`  | `string`   | yes      | None                                      |
| `styledocco`    | `string`   | yes      | `./node_modules/.bin/styledocco`          |


### `out`

An output directory.
It can be a relative path from the cwd.


### `name`

A name of the generated document.
It will be used as the document page title.


### `includes`

Included files for the preview in the generated documentation.
It can be a relative path from the cwd.


### `verbose`

Show log messages when generating the documentation.


### `noMinify`

Disable minificating CSS/JavaScript in the generated documentation.


### `preprocessor`

A file path for the CSS preprocessor such as `'~/bin/lessc'`.
It can be a relative path from the cwd.


### `styledocco`

A file path for the StyleDocco command such as `'~/bin/styledocco'`.
It can be a relative path from the cwd.


Other API
---------
## `guessDocumentPath(filePath, basePath [, options])`

Returns a file path to the doc.
This function is useful for incremental building.


### `filePath`
Type: `string`

File path to document.


### `basePath`
Type: `string`

Base path of the filePath.
Typically, it should be vinyl.base.


### `options`
Type: `{ out: string | undefined | null }` or `undefined` or `null`
 
 Options for gulp-styledocco-individual.


### Returns
Type: `string`

File path to the doc.


License
-------

MIT
