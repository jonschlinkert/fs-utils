# fs-utils [![NPM version](https://badge.fury.io/js/fs-utils.svg)](http://badge.fury.io/js/fs-utils)

> fs extras and utilities to extend the node.js file system module. Used in Assemble and many other projects.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i fs-utils --save
```

## Usage

```js
var fs = require('fs-utils');
```

## API

### [.stripCR](index.js#L24)

Strip carriage returns from a string.

**Params**

* `str` **{String}**
* `returns` **{String}**

### [.stripBOM](index.js#L38)

Strip byte order marks from a string.

See [BOM](http://en.wikipedia.org/wiki/Byte_order_mark)

**Params**

* `str` **{String}**
* `returns` **{String}**

### [.slashify](index.js#L51)

Normalize all slashes to forward slashes.

**Params**

* `str` **{String}**
* `stripTrailing` **{Boolean}**: False by default.
* `returns` **{String}**

### [.isEmpty](index.js#L91)

Return `true` if the file exists and is empty.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isDir](index.js#L107)

Return `true` if the filepath is a directory.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isLink](index.js#L138)

True if the filepath is a symbolic link.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.glob](index.js#L152)

Glob files using [matched]. Or glob files synchronously
with `glob.sync`.

**Params**

* `patterns` **{String|Array}**
* `returns` **{options}**

### [.readFileSync](index.js#L163)

Read a file synchronously. Also strips any byte order
marks.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [readFile](index.js#L183)

Read a file asynchronously.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `normalize` **{Boolean}**: Strip carriage returns and BOM.
* `encoding` **{String}**: Default is `utf8`
* `callback` **{Function}**

### [.readJSONSync](index.js#L214)

Read a file synchronously and parse contents as JSON.
marks.

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readJSON](index.js#L227)

Read JSON file asynchronously and parse content as JSON

**Params**

* `filepath` **{String}**
* `callback` **{Function}**
* `returns` **{Object}**

### [.readYAMLSync](index.js#L245)

Read a YAML file synchronously and parse its content as JSON

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readYAML](index.js#L257)

Read a YAML file synchronously and parse its content as JSON

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readDataSync](index.js#L289)

Read JSON or utils.YAML. Determins the reader automatically
based on file extension.

**Params**

* `filepath` **{String}**
* `options` **{String}**
* `returns` **{String}**

### [.readData](index.js#L320)

Read JSON or YAML utils.async. Determins the reader automatically
based on file extension.

**Params**

* `filepath` **{String}**
* `options` **{String}**
* `returns` **{String}**

### [.writeFile](index.js#L394)

Asynchronously write a file to disk.

**Params**

* `dest` **{String}**
* `content` **{String}**
* `callback` **{Function}**

### [.writeFileSync](index.js#L421)

Synchronously write files to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeJSONSync](index.js#L441)

Synchronously write JSON to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeJSON](index.js#L457)

Asynchronously write files to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeYAMLSync](index.js#L477)

Synchronously write YAML to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeYAML](index.js#L493)

Aynchronously write YAML to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeDataSync](index.js#L518)

Synchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

**Example**

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.writeData](index.js#L554)

Asynchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

**Example**

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.copyFileSync](index.js#L587)

Copy files synchronously;

**Params**

* `src` **{String}**
* `dest` **{String}**

### [.rmdir](index.js#L600)

Asynchronously remove dirs and child dirs that exist.

**Params**

* `dir` **{String}**
* **{Function}**: `cb
* `returns` **{Function}**

### [.del](index.js#L637)

Delete folders and files recursively. Pass a callback
as the last argument to use utils.async.

**Params**

* `patterns` **{String}**: Glob patterns to use.
* `options` **{String}**: Options for matched.
* `cb` **{Function}**

### [.ext](index.js#L705)

Return the file extension.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.dirname](index.js#L717)

Directory path excluding filename.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.last](index.js#L743)

The last `n` segments of a filepath. If a number
isn't passed for `n`, the last segment is returned.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.first](index.js#L758)

The first `n` segments of a filepath. If a number
isn't passed for `n`, the first segment is returned.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.lastChar](index.js#L777)

Returns the last character in `filepath`

**Params**

* `filepath` **{String}**
* `returns` **{String}**

**Example**

```
lastChar('foo/bar/baz/');
//=> '/'
```

### [.addSlash](index.js#L804)

Add a trailing slash to the filepath.

Note, this does _not_ consult the file system
to check if the filepath is file or a directory.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.normalizePath](index.js#L819)

Normalize a filepath and remove trailing slashes.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.relative](index.js#L845)

Resolve the relative path from `a` to `b.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.isAbsolute](index.js#L857)

Return `true` if the path is absolute.

**Params**

* **{[type]}**: filepath
* `returns` **{Boolean}**

### [.equivalent](index.js#L871)

Return `true` if path `a` is the same as path `b.

**Params**

* `filepath` **{String}**
* `a` **{String}**
* `b` **{String}**
* `returns` **{Boolean}**

### [.doesPathContain](index.js#L886)

True if descendant path(s) contained within ancestor path. Note: does not test if paths actually exist.

Sourced from [Grunt].

**Params**

* `ancestor` **{String}**: The starting path.
* `returns` **{Boolean}**

### [.isPathCwd](index.js#L915)

True if a filepath is the CWD.

Sourced from [Grunt].

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isPathInCwd](index.js#L932)

True if a filepath is contained within the CWD.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

## Related projects

* [is-glob](https://www.npmjs.com/package/is-glob): Returns `true` if the given string looks like a glob pattern or an extglob pattern.… [more](https://www.npmjs.com/package/is-glob) | [homepage](https://github.com/jonschlinkert/is-glob)
* [micromatch](https://www.npmjs.com/package/micromatch): Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. Just… [more](https://www.npmjs.com/package/micromatch) | [homepage](https://github.com/jonschlinkert/micromatch)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/assemble/fs-utils/issues/new).

## Author

**Jon Schlinkert**

+ [github/assemble](https://github.com/assemble)
+ [twitter/assemble](http://twitter.com/assemble)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 04, 2015._