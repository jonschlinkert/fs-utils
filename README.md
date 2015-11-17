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

### [.isEmptyFile](index.js#L94)

Return `true` if the file exists and is empty.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isEmptyDir](index.js#L110)

Return `true` if the file exists and is empty.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isDir](index.js#L126)

Return `true` if the filepath is a directory.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isLink](index.js#L157)

True if the filepath is a symbolic link.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.glob](index.js#L171)

Glob files using [matched]. Or glob files synchronously
with `glob.sync`.

**Params**

* `patterns` **{String|Array}**
* `returns` **{options}**

### [.readFileSync](index.js#L182)

Read a file synchronously. Also strips any byte order
marks.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [readFile](index.js#L202)

Read a file asynchronously.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `normalize` **{Boolean}**: Strip carriage returns and BOM.
* `encoding` **{String}**: Default is `utf8`
* `callback` **{Function}**

### [.readYAML](index.js#L233)

Read a YAML file asynchronously and parse its contents as JSON.

**Params**

* `filepath` **{String}**
* `returns` **{Object}** `options`
* `returns` **{Function}** `cb`: Callback function

### [.readYAMLSync](index.js#L245)

Read a YAML file synchronously and parse its contents as JSON

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readJSON](index.js#L258)

Read JSON file asynchronously and parse contents as JSON

**Params**

* `filepath` **{String}**
* `callback` **{Function}**
* `returns` **{Object}**

### [.readJSONSync](index.js#L275)

Read a file synchronously and parse contents as JSON.
marks.

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readData](index.js#L290)

Read JSON or YAML utils.async. Determins the reader automatically
based on file extension.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `callback` **{Function}**
* `returns` **{String}**

### [.readDataSync](index.js#L304)

Read JSON or utils.YAML. Determins the reader automatically
based on file extension.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `returns` **{String}**

### [.writeFile](index.js#L358)

Asynchronously write a file to disk.

**Params**

* `dest` **{String}**
* `content` **{String}**
* `callback` **{Function}**

### [.writeFileSync](index.js#L372)

Synchronously write files to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeJSONSync](index.js#L386)

Synchronously write JSON to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeJSON](index.js#L400)

Asynchronously write files to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeYAMLSync](index.js#L414)

Synchronously write YAML to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeYAML](index.js#L428)

Aynchronously write YAML to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeDataSync](index.js#L447)

Synchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

**Example**

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.writeData](index.js#L467)

Asynchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

**Params**

* `dest` **{String}**
* `data` **{String}**
* `options` **{Options}**
* `cb` **{Function}**: Callback function

**Example**

```js
writeData('foo.yml', {foo: "bar"});
```

### [.copyFileSync](index.js#L479)

Copy files synchronously;

**Params**

* `src` **{String}**
* `dest` **{String}**

### [.rmdir](index.js#L492)

Asynchronously remove dirs and child dirs that exist.

**Params**

* `dir` **{String}**
* **{Function}**: `cb
* `returns` **{Function}**

### [.del](index.js#L529)

Delete folders and files recursively. Pass a callback
as the last argument to use utils.async.

**Params**

* `patterns` **{String}**: Glob patterns to use.
* `options` **{Object}**: Options for matched.
* `cb` **{Function}**

### [.ext](index.js#L597)

Return the file extension.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.dirname](index.js#L609)

Directory path excluding filename.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.last](index.js#L635)

The last `n` segments of a filepath. If a number
isn't passed for `n`, the last segment is returned.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.first](index.js#L650)

The first `n` segments of a filepath. If a number
isn't passed for `n`, the first segment is returned.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.lastChar](index.js#L669)

Returns the last character in `filepath`

**Params**

* `filepath` **{String}**
* `returns` **{String}**

**Example**

```
lastChar('foo/bar/baz/');
//=> '/'
```

### [.addSlash](index.js#L696)

Add a trailing slash to the filepath.

Note, this does _not_ consult the file system
to check if the filepath is file or a directory.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.normalizePath](index.js#L711)

Normalize a filepath and remove trailing slashes.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.relative](index.js#L737)

Resolve the relative path from `a` to `b.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.isAbsolute](index.js#L749)

Return `true` if the path is absolute.

**Params**

* **{[type]}**: filepath
* `returns` **{Boolean}**

### [.equivalent](index.js#L763)

Return `true` if path `a` is the same as path `b.

**Params**

* `filepath` **{String}**
* `a` **{String}**
* `b` **{String}**
* `returns` **{Boolean}**

### [.doesPathContain](index.js#L778)

True if descendant path(s) contained within ancestor path. Note: does not test if paths actually exist.

Sourced from [Grunt].

**Params**

* `ancestor` **{String}**: The starting path.
* `returns` **{Boolean}**

### [.isPathCwd](index.js#L807)

True if a filepath is the CWD.

Sourced from [Grunt].

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isPathInCwd](index.js#L824)

True if a filepath is contained within the CWD.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

## Related projects

* [read-data](https://www.npmjs.com/package/read-data): Read JSON or YAML files. | [homepage](https://github.com/jonschlinkert/read-data)
* [read-yaml](https://www.npmjs.com/package/read-yaml): Very thin wrapper around js-yaml for directly reading in YAML files. | [homepage](https://github.com/jonschlinkert/read-yaml)
* [write-data](https://www.npmjs.com/package/write-data): Write a YAML or JSON file to disk. Automatically detects the format to write based… [more](https://www.npmjs.com/package/write-data) | [homepage](https://github.com/jonschlinkert/write-data)
* [write-json](https://www.npmjs.com/package/write-json): Write a JSON file to disk, also creates intermediate directories in the destination path if… [more](https://www.npmjs.com/package/write-json) | [homepage](https://github.com/jonschlinkert/write-json)
* [write-yaml](https://www.npmjs.com/package/write-yaml): Write YAML. Converts JSON to YAML writes it to the specified file. | [homepage](https://github.com/jonschlinkert/write-yaml)

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

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 17, 2015._