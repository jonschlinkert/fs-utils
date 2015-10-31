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

### [.stripCR](index.js#L32)

Strip carriage returns from a string.

**Params**

* `str` **{String}**
* `returns` **{String}**

### [.stripBOM](index.js#L46)

Strip byte order marks from a string.

See [BOM](http://en.wikipedia.org/wiki/Byte_order_mark)

**Params**

* `str` **{String}**
* `returns` **{String}**

### [.slashify](index.js#L59)

Normalize all slashes to forward slashes.

**Params**

* `str` **{String}**
* `stripTrailing` **{Boolean}**: False by default.
* `returns` **{String}**

### [.isEmpty](index.js#L99)

Return `true` if the file exists and is empty.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isDir](index.js#L115)

Return `true` if the filepath is a directory.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isLink](index.js#L146)

True if the filepath is a symbolic link.

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.glob](index.js#L160)

Glob files using [globby]. Or glob files synchronously
with `glob.sync`.

**Params**

* `patterns` **{String|Array}**
* `returns` **{options}**

### [.readFileSync](index.js#L171)

Read a file synchronously. Also strips any byte order
marks.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [readFile](index.js#L191)

Read a file asynchronously.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `normalize` **{Boolean}**: Strip carriage returns and BOM.
* `encoding` **{String}**: Default is `utf8`
* `callback` **{Function}**

### [.readJSONSync](index.js#L222)

Read a file synchronously and parse contents as JSON.
marks.

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readJSON](index.js#L235)

Read JSON file asynchronously and parse content as JSON

**Params**

* `filepath` **{String}**
* `callback` **{Function}**
* `returns` **{Object}**

### [.readYAMLSync](index.js#L253)

Read a YAML file synchronously and parse its content as JSON

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readYAML](index.js#L265)

Read a YAML file synchronously and parse its content as JSON

**Params**

* `filepath` **{String}**
* `returns` **{Object}**

### [.readDataSync](index.js#L297)

Read JSON or YAML. Determins the reader automatically
based on file extension.

**Params**

* `filepath` **{String}**
* `options` **{String}**
* `returns` **{String}**

### [.readData](index.js#L328)

Read JSON or YAML async. Determins the reader automatically
based on file extension.

**Params**

* `filepath` **{String}**
* `options` **{String}**
* `returns` **{String}**

### [.writeFile](index.js#L402)

Asynchronously write a file to disk.

**Params**

* `dest` **{String}**
* `content` **{String}**
* `callback` **{Function}**

### [.writeFileSync](index.js#L429)

Synchronously write files to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeJSONSync](index.js#L449)

Synchronously write JSON to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeJSON](index.js#L465)

Asynchronously write files to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeYAMLSync](index.js#L485)

Synchronously write YAML to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeYAML](index.js#L501)

Aynchronously write YAML to disk, creating any
intermediary directories if they don't exist.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

### [.writeDataSync](index.js#L526)

Synchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

**Example**

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.writeData](index.js#L562)

Asynchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

**Params**

* `dest` **{String}**
* `str` **{String}**
* `options` **{Options}**

**Example**

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.copyFileSync](index.js#L595)

Copy files synchronously;

**Params**

* `src` **{String}**
* `dest` **{String}**

### [.rmdir](index.js#L608)

Asynchronously remove dirs and child dirs that exist.

**Params**

* `dir` **{String}**
* **{Function}**: `cb
* `returns` **{Function}**

### [.del](index.js#L645)

Delete folders and files recursively. Pass a callback
as the last argument to use async.

**Params**

* `patterns` **{String}**: Glob patterns to use.
* `options` **{String}**: Options for globby.
* `cb` **{Function}**

### [.ext](index.js#L713)

Return the file extension.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.dirname](index.js#L725)

Directory path excluding filename.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.last](index.js#L751)

The last `n` segments of a filepath. If a number
isn't passed for `n`, the last segment is returned.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.first](index.js#L766)

The first `n` segments of a filepath. If a number
isn't passed for `n`, the first segment is returned.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.lastChar](index.js#L785)

Returns the last character in `filepath`

**Params**

* `filepath` **{String}**
* `returns` **{String}**

**Example**

```
lastChar('foo/bar/baz/');
//=> '/'
```

### [.addSlash](index.js#L812)

Add a trailing slash to the filepath.

Note, this does _not_ consult the file system
to check if the filepath is file or a directory.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.normalizePath](index.js#L827)

Normalize a filepath and remove trailing slashes.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.relative](index.js#L853)

Resolve the relative path from `a` to `b.

**Params**

* `filepath` **{String}**
* `returns` **{String}**

### [.isAbsolute](index.js#L865)

Return `true` if the path is absolute.

**Params**

* **{[type]}**: filepath
* `returns` **{Boolean}**

### [.equivalent](index.js#L879)

Return `true` if path `a` is the same as path `b.

**Params**

* `filepath` **{String}**
* `a` **{String}**
* `b` **{String}**
* `returns` **{Boolean}**

### [.doesPathContain](index.js#L894)

True if descendant path(s) contained within ancestor path. Note: does not test if paths actually exist.

Sourced from [Grunt].

**Params**

* `ancestor` **{String}**: The starting path.
* `returns` **{Boolean}**

### [.isPathCwd](index.js#L923)

True if a filepath is the CWD.

Sourced from [Grunt].

**Params**

* `filepath` **{String}**
* `returns` **{Boolean}**

### [.isPathInCwd](index.js#L940)

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

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 31, 2015._