# fs-utils [![NPM version](https://badge.fury.io/js/fs-utils.svg)](http://badge.fury.io/js/fs-utils)


> File system extras and utilities to extend the Node.js fs module.

## Install
#### Install with [npm](npmjs.org):

```bash
npm i fs-utils --save-dev
```

## Run tests

```bash
npm test
```

## Usage

```js
var fs = require('fs-utils');
```

## API
### [.stripcr](index.js#L32)

* `str` **{String}**    
* `returns`: {String}  

Strip carriage returns from a string.

### [.stripBOM](index.js#L46)

Strip byte order marks from a string.

* `str` **{String}**    
* `returns`: {String}  

See [BOM](http://en.wikipedia.org/wiki/Byte_order_mark)

### [.forwardSlash](index.js#L58)

* `str` **{String}**    
* `returns`: {String}  

Normalize all slashes to forward slashes.

### [.isEmpty](index.js#L99)

* `filepath` **{String}**    
* `returns`: {Boolean}  

Return `true` if the file exists and is empty.

### [.isDir](index.js#L115)

* `filepath` **{String}**    
* `returns`: {Boolean}  

Return `true` if the filepath is a directory.

### [.isLink](index.js#L146)

* `filepath` **{String}**    
* `returns`: {Boolean}  

True if the filepath is a symbolic link.

### [.readFileSync](index.js#L160)

* `filepath` **{String}**    
* `returns`: {String}  

Read a file synchronously. Also strips any byte order
marks.

### [readFile](index.js#L180)

* `filepath` **{String}**    
* `options` **{Object}**    
* `normalize` **{Boolean}**: Strip carriage returns and BOM.    
* `encoding` **{String}**: Default is `utf8`    
* `callback` **{Function}**    

Read a file asynchronously.

### [.readJSONSync](index.js#L212)

* `filepath` **{String}**    
* `returns`: {Object}  

Read a file synchronously and parse contents as JSON.
marks.

### [.readJSON](index.js#L225)

* `filepath` **{String}**    
* `callback` **{Function}**    
* `returns`: {Object}  

Read JSON file asynchronously and parse content as JSON

### [.readYAMLSync](index.js#L243)

* `filepath` **{String}**    
* `returns`: {Object}  

Read a YAML file synchronously and parse its content as JSON

### [.readYAML](index.js#L255)

* `filepath` **{String}**    
* `returns`: {Object}  

Read a YAML file synchronously and parse its content as JSON

### [.readDataSync](index.js#L287)

* `filepath` **{String}**    
* `options` **{String}**    
* `returns`: {String}  

Read JSON or YAML. Determins the reader automatically
based on file extension.

### [.readData](index.js#L318)

* `filepath` **{String}**    
* `options` **{String}**    
* `returns`: {String}  

Read JSON or YAML async. Determins the reader automatically
based on file extension.

### [.writeFile](index.js#L379)


Write

### [.writeFileSync](index.js#L406)

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

Synchronously write files to disk, creating any
intermediary directories if they don't exist.

### [.writeJSONSync](index.js#L426)

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

Synchronously write JSON to disk, creating any
intermediary directories if they don't exist.

### [.writeJSON](index.js#L442)

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

Asynchronously write files to disk, creating any
intermediary directories if they don't exist.

### [.writeYAMLSync](index.js#L463)

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

Synchronously write YAML to disk, creating any
intermediary directories if they don't exist.

### [.writeYAML](index.js#L479)

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

Aynchronously write YAML to disk, creating any
intermediary directories if they don't exist.

### [.writeDataSync](index.js#L504)

Synchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.writeData](index.js#L540)

Asynchronously write JSON or YAML to disk, creating any intermediary directories if they don't exist. Data type is determined by the `dest` file extension.

* `dest` **{String}**    
* `str` **{String}**    
* `options` **{Options}**    

```js
writeDataSync('foo.yml', {foo: "bar"});
```

### [.copyFileSync](index.js#L573)

* `src` **{String}**    
* `dest` **{String}**    

Copy files synchronously;

### [.rmdir](index.js#L586)

* `dir` **{String}**    
* **{Function}**: `cb    
* `returns`: {Function}  

Asynchronously remove dirs and child dirs that exist.

### [.ext](index.js#L693)

* `filepath` **{String}**    
* `returns`: {String}  

Return the file extension.

### [.dirname](index.js#L705)

* `filepath` **{String}**    
* `returns`: {String}  

Directory path excluding filename.

### [.last](index.js#L731)

* `filepath` **{String}**    
* `returns`: {String}  

The last `n` segments of a filepath. If a number
isn't passed for `n`, the last segment is returned.

### [.first](index.js#L746)

* `filepath` **{String}**    
* `returns`: {String}  

The first `n` segments of a filepath. If a number
isn't passed for `n`, the first segment is returned.

### [.lastChar](index.js#L765)

Returns the last character in `filepath`

* `filepath` **{String}**    
* `returns`: {String}  

```
lastChar('foo/bar/baz/');
//=> '/'
```

### [.addSlash](index.js#L792)

Add a trailing slash to the filepath.

* `filepath` **{String}**    
* `returns`: {String}  

Note, this does _not_ consult the file system
to check if the filepath is file or a directory.

### [.normalizePath](index.js#L807)

* `filepath` **{String}**    
* `returns`: {String}  

Normalize a filepath and remove trailing slashes.

### [.relative](index.js#L833)

* `filepath` **{String}**    
* `returns`: {String}  

Resolve the relative path from `a` to `b.

### [.isAbsolute](index.js#L845)

* **{[type]}**: filepath    
* `returns`: {Boolean}  

Return `true` if the path is absolute.

### [.equivalent](index.js#L859)

* `filepath` **{String}**    
* `a` **{String}**    
* `b` **{String}**    
* `returns`: {Boolean}  

Return `true` if path `a` is the same as path `b.

### [.doesPathContain](index.js#L874)

True if descendant path(s) contained within ancestor path. Note: does not test if paths actually exist.

* `ancestor` **{String}**: The starting path.    
* `returns`: {Boolean}  

Sourced from [Grunt].

### [.isPathCwd](index.js#L903)

True if a filepath is the CWD.

* `filepath` **{String}**    
* `returns`: {Boolean}  

Sourced from [Grunt].

### [.isPathInCwd](index.js#L920)

* `filepath` **{String}**    
* `returns`: {Boolean}  

True if a filepath is contained within the CWD.

## Author

**Jon Schlinkert**
 
+ [github/assemble](https://github.com/assemble)
+ [twitter/assemble](http://twitter.com/assemble) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 06, 2014._