/*!
 * fs-utils <https://github.com/assemble/fs-utils>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('graceful-fs');
var path = require('path');
var EOL = require('os').EOL;
var EOLre = new RegExp(EOL, 'g');
var utils = require('./utils');

/**
 * Strip carriage returns from a string.
 *
 * @param  {String} `str`
 * @return {String}
 * @api public
 */

exports.stripCR = function(str) {
  return str.replace(/\r/g, '');
};

/**
 * Strip byte order marks from a string.
 *
 * See [BOM](http://en.wikipedia.org/wiki/Byte_order_mark)
 *
 * @param  {String} `str`
 * @return {String}
 * @api public
 */

exports.stripBOM = function(str) {
  return str.replace(/^\uFEFF/, '');
};

/**
 * Normalize all slashes to forward slashes.
 *
 * @param  {String} `str`
 * @param  {Boolean} `stripTrailing` False by default.
 * @return {String}
 * @api public
 */

exports.slashify = function(str, trailing) {
  return utils.normalize(str, trailing || false);
};

/**
 * Normalize a string by stripping windows
 * carriage returns and byte order marks.
 *
 * @param  {String} `str`
 * @return {String}
 * @api private
 */

exports.normalize = function(str){
  if (EOL !== '\n') {
    str = str.replace(EOLre, '\n');
  }
  return exports.stripBOM(str);
};

/**
 * True if the filepath actually exist.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 */

var exists = exports.exists = function(paths) {
  var fp = path.join.apply(path, arguments);
  try {
    return fs.existsSync(fp);
  } catch (err) {}
  return false;
};

/**
 * Return `true` if the file exists and is empty.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 * @api public
 */

exports.isEmptyFile = function(fp) {
  if (exists(fp) === false) {
    return false;
  }
  var str = exports.readFileSync(fp);
  return str.length > 0;
};

/**
 * Return `true` if the file exists and is empty.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 * @api public
 */

exports.isEmptyDir = function(fp) {
  if (exists(fp) === false) {
    return false;
  }
  var files = fs.readdirSync(fp);
  return files.length > 0;
};

/**
 * Return `true` if the filepath is a directory.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 * @api public
 */

exports.isDir = function(filepath) {
  if (!exists(filepath)) {
    return false;
  }
  return fs.statSync(filepath)
    .isDirectory();
};

/**
 * True if the filepath is a file.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 */

var isFile = exports.isFile = function(filepath) {
  if (!exists(filepath)) {
    return false;
  }
  return fs.statSync(filepath)
    .isFile();
};

/**
 * True if the filepath is a symbolic link.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 * @api public
 */

exports.isLink = function(filepath) {
  return exists(filepath) && fs.lstatSync(filepath)
    .isSymbolicLink();
};

/**
 * Glob files using [matched]. Or glob files synchronously
 * with `glob.sync`.
 *
 * @param  {String|Array} `patterns`
 * @return {options}
 * @api public
 */

exports.glob = utils.glob;

/**
 * Read a file synchronously. Also strips any byte order
 * marks.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.readFileSync = function(filepath, options) {
  var opts = utils.extend({normalize: true, encoding: 'utf8'}, options);
  var str = fs.readFileSync(filepath, opts.encoding);
  if (opts.normalize && opts.encoding === 'utf8') {
    str = exports.normalize(str);
  }
  return str;
};

/**
 * Read a file asynchronously.
 *
 * @param {String} `filepath`
 * @param {Object} `options`
 *   @param {Boolean} [options] `normalize` Strip carriage returns and BOM.
 *   @param {String} [options] `encoding` Default is `utf8`
 * @param {Function} `callback`
 * @api public
 */

var readFile = exports.readFile = function(filepath, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('readfile expects callback to be a function');
  }

  var opts = utils.extend({normalize: true, encoding: 'utf8'}, options);

  fs.readFile(filepath, opts.encoding, function (err, content) {
    if (err) return cb(err);

    if (opts.normalize && opts.encoding === 'utf8') {
      content = exports.normalize(content);
    }
    cb(null, content);
  });
};

/**
 * Read a YAML file asynchronously and parse its contents as JSON.
 *
 * @param  {String} `filepath`
 * @return {Object} `options`
 * @return {Function} `cb` Callback function
 * @api public
 */

exports.readYAML = function(filepath, options, cb) {
  return utils.readYaml.apply(utils.readYaml, arguments);
};

/**
 * Read a YAML file synchronously and parse its contents as JSON
 *
 * @param  {String} `filepath`
 * @return {Object}
 * @api public
 */

exports.readYAMLSync = function(filepath, options) {
  return utils.readYaml.sync.apply(utils.readYaml, arguments);
};

/**
 * Read JSON file asynchronously and parse contents as JSON
 *
 * @param  {String} `filepath`
 * @param  {Function} `callback`
 * @return {Object}
 * @api public
 */

exports.readJSON = function(filepath, cb) {
  exports.readFile(filepath, function(err, contents) {
    if (err) return cb(err);

    cb(null, JSON.parse(contents.toString()));
  });
};

/**
 * Read a file synchronously and parse contents as JSON.
 * marks.
 *
 * @param  {String} `filepath`
 * @return {Object}
 * @api public
 */

exports.readJSONSync = function(filepath, options) {
  return JSON.parse(exports.readFileSync(filepath, options));
};

/**
 * Read JSON or YAML utils.async. Determins the reader automatically
 * based on file extension.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @param  {Function} `callback`
 * @return {String}
 * @api public
 */

exports.readData = function(filepath, options, cb) {
  return utils.readData.data.apply(utils.readData, arguments);
};

/**
 * Read JSON or utils.YAML. Determins the reader automatically
 * based on file extension.
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {String}
 * @api public
 */

exports.readDataSync = function(filepath, options) {
  return utils.readData.data.sync.apply(utils.readData, arguments);
};

/**
 * Asynchronously create dirs and any intermediate dirs
 * don't exist.
 *
 * @param  {String} `dirpath`
 */

var mkdir = exports.mkdir = function(dest, cb) {
  var dir = path.dirname(dest);
  fs.exists(dir, function (exist) {
    if (exist) {
      fs.mkdir(dest, cb);
    } else {
      mkdir(dir, function (err) {
        if (err) return cb(err);
        fs.mkdir(dest, cb);
      });
    }
  });
};

/**
 * Synchronously create dirs and any intermediate dirs
 * don't exist.
 *
 * @param  {String} `dirpath`
 */

var mkdirSync = exports.mkdirSync = function(dirpath, mode) {
  mode = mode || parseInt('0777', 8) & (~process.umask());
  if (!exists(dirpath)) {
    var parentDir = path.dirname(dirpath);
    if (exists(parentDir)) {
      fs.mkdirSync(dirpath, mode);
    } else {
      mkdirSync(parentDir);
      fs.mkdirSync(dirpath, mode);
    }
  }
};

/**
 * Asynchronously write a file to disk.
 *
 * @param  {String} `dest`
 * @param  {String} `content`
 * @param  {Function} `callback`
 * @api public
 */

exports.writeFile = function(dest, content, cb) {
  utils.writeFile.apply(utils.writeFile, arguments);
};

/**
 * Synchronously write files to disk, creating any
 * intermediary directories if they don't exist.
 *
 * @param  {String} `dest`
 * @param  {String} `str`
 * @param  {Options} `options`
 * @api public
 */

exports.writeFileSync = function(dest, str, options) {
  utils.writeFile.sync.apply(utils.writeFile, arguments);
};

/**
 * Synchronously write JSON to disk, creating any
 * intermediary directories if they don't exist.
 *
 * @param  {String} `dest`
 * @param  {String} `str`
 * @param  {Options} `options`
 * @api public
 */

exports.writeJSONSync = function(dest, str, options) {
  utils.writeJson.sync.apply(utils.writeJson, arguments);
};

/**
 * Asynchronously write files to disk, creating any
 * intermediary directories if they don't exist.
 *
 * @param  {String} `dest`
 * @param  {String} `str`
 * @param  {Options} `options`
 * @api public
 */

exports.writeJSON = function(dest, str, options, cb) {
  utils.writeJson.apply(utils.writeJson, arguments);
};

/**
 * Synchronously write YAML to disk, creating any
 * intermediary directories if they don't exist.
 *
 * @param  {String} `dest`
 * @param  {String} `str`
 * @param  {Options} `options`
 * @api public
 */

exports.writeYAMLSync = function(dest, str, options) {
  utils.writeYaml.sync.apply(utils.writeYaml, arguments);
};

/**
 * Aynchronously write YAML to disk, creating any
 * intermediary directories if they don't exist.
 *
 * @param  {String} `dest`
 * @param  {String} `str`
 * @param  {Options} `options`
 * @api public
 */

exports.writeYAML = function(dest, data, options, cb) {
  utils.writeYaml.apply(utils.writeYaml, arguments);
};

/**
 * Synchronously write JSON or YAML to disk, creating any
 * intermediary directories if they don't exist. Data
 * type is determined by the `dest` file extension.
 *
 * ```js
 * writeDataSync('foo.yml', {foo: "bar"});
 * ```
 *
 * @param  {String} `dest`
 * @param  {String} `str`
 * @param  {Options} `options`
 * @api public
 */

exports.writeDataSync = function(dest, data, options) {
  utils.writeData.sync.apply(utils.writeData, arguments);
};

/**
 * Asynchronously write JSON or YAML to disk, creating any
 * intermediary directories if they don't exist. Data
 * type is determined by the `dest` file extension.
 *
 * ```js
 * writeData('foo.yml', {foo: "bar"});
 * ```
 *
 * @param  {String} `dest`
 * @param  {String} `data`
 * @param  {Options} `options`
 * @param  {Function} `cb` Callback function
 * @api public
 */

exports.writeData = function(dest, data, options, cb) {
  utils.writeData.apply(utils.writeData, arguments);
};

/**
 * Copy files synchronously;
 *
 * @param  {String} `src`
 * @param  {String} `dest`
 * @api public
 */

exports.copyFileSync = function(src, dest) {
  exports.writeFileSync(dest, exports.readFileSync(src));
};

/**
 * Asynchronously remove dirs and child dirs that exist.
 *
 * @param  {String} `dir`
 * @param  {Function} `cb
 * @return {Function}
 * @api public
 */

exports.rmdir = function(dir, cb) {
  if (typeof cb !== 'function') {
    cb = function () {};
  }

  fs.readdir(dir, function (err, files) {
    if (err) {
      return cb(err);
    }
    utils.async.each(files, function (segment, next) {
      var dir = path.join(dir, segment);
      fs.stat(dir, function (err, stats) {
        if (err) {
          return cb(err);
        }
        if (stats.isDirectory()) {
          utils.del(dir, next);
        } else {
          fs.unlink(dir, next);
        }
      });
    }, function () {
      fs.rmdir(dir, cb);
    });
  });
};

/**
 * Delete folders and files recursively. Pass a callback
 * as the last argument to use utils.async.
 *
 * @param  {String} `patterns` Glob patterns to use.
 * @param  {Object} `options` Options for matched.
 * @param  {Function} `cb`
 * @api public
 */

exports.del = function(patterns, opts, cb) {
  var args = [].slice.call(arguments);
  var last = args[args.length - 1];

  if (typeof last === 'function') {
    exports.deleteAsync(patterns, opts);
  } else {
    exports.deleteSync(patterns, opts);
  }
};

/**
 * Asynchronously delete folders and files.
 *
 * @param  {String} `patterns` Glob patterns to use.
 * @param  {String} `opts` Options for matched.
 * @param  {Function} `cb`
 * @api private
 */

exports.deleteAsync = function(patterns, opts, cb) {
  if (typeof opts !== 'object') {
    cb = opts;
    opts = {};
  }

  utils.glob(patterns, opts, function (err, files) {
    if (err) {
      cb(err);
      return;
    }
    utils.async.each(files, function (filepath, next) {
      if (opts.cwd && !exports.isAbsolute(filepath)) {
        filepath = path.resolve(opts.cwd, filepath);
      }

      utils.del(filepath, next);
    }, cb);
  });
};

/**
 * Synchronously delete folders and files.
 *
 * @param  {String} `patterns` Glob patterns to use.
 * @param  {Object} `options` Options for matched.
 * @param  {Function} `cb`
 * @api private
 */

exports.deleteSync = function(patterns, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  utils.glob.sync(patterns, opts).forEach(function (filepath) {
    if (opts.cwd) {
      filepath = path.resolve(opts.cwd, filepath);
    }
    utils.del.sync(filepath);
  });
};

/**
 * Return the file extension.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.ext = function(filepath) {
  return path.extname(filepath);
};

/**
 * Directory path excluding filename.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.dirname = function(filepath) {
  return isFile(filepath)
    ? path.dirname(filepath)
    : filepath;
};

/**
 * Return an array of path segments.
 *
 * @param  {String} `filepath`
 * @return {Array}
 */

var segments = exports.segments = function(filepath) {
  return filepath.split(/[\\\/]/g);
};

/**
 * The last `n` segments of a filepath. If a number
 * isn't passed for `n`, the last segment is returned.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.last = function(filepath, num) {
  var seg = segments(filepath);
  return seg.slice(-(num || 1))
    .join(path.sep);
};

/**
 * The first `n` segments of a filepath. If a number
 * isn't passed for `n`, the first segment is returned.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.first = function(filepath, num) {
  var seg = segments(filepath);
  return seg.slice(num || 1)
    .join(path.sep);
};

/**
 * Returns the last character in `filepath`
 *
 * ```
 * lastChar('foo/bar/baz/');
 * //=> '/'
 * ```
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.lastChar = function(filepath) {
  var len = filepath.length;
  return filepath[len - 1];
};

/**
 * Remove a trailing slash from a filepath
 *
 * @param  {String} `filepath`
 * @return {String}
 */

var removeSlash = exports.removeSlash = function(filepath) {
  return filepath.replace(/[\\\/]$/, '');
};

/**
 * Add a trailing slash to the filepath.
 *
 * Note, this does _not_ consult the file system
 * to check if the filepath is file or a directory.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.addSlash = function(filepath) {
  if (!/\./.test(path.basename(filepath))) {
    return removeSlash(filepath) + path.sep;
  }
  return filepath;
};

/**
 * Normalize a filepath and remove trailing slashes.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.normalizePath = function(filepath) {
  return removeSlash(path.normalize(filepath));
};

/**
 * Resolve a filepath, also normalizes and removes
 * trailing slashes.
 *
 * @param  {String} `filepath`
 * @return {String}
 */

var resolve = exports.resolve = function(filepath) {
  var args = [].slice.call(arguments);
  var paths = path.resolve.apply(path, args);
  return exports.normalizePath(paths);
};

/**
 * Resolve the relative path from `a` to `b.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

exports.relative = function(a, b) {
  return utils.relative.apply(utils.relative, arguments);
};

/**
 * Return `true` if the path is absolute.
 *
 * @param  {[type]}  filepath
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(filepath) {
  return utils.isAbs.apply(utils.isAbs, arguments);
};

/**
 * Return `true` if path `a` is the same as path `b.
 *
 * @param  {String} `filepath`
 * @param  {String} `a`
 * @param  {String} `b`
 * @return {Boolean}
 * @api public
 */

exports.equivalent = function(a, b) {
  return resolve(a) === resolve(b);
};

/**
 * True if descendant path(s) contained within ancestor path.
 * Note: does not test if paths actually exist.
 *
 * Sourced from [Grunt].
 *
 * @param  {String} `ancestor` The starting path.
 * @return {Boolean}
 * @api public
 */

exports.doesPathContain = function(ancestor) {
  ancestor = path.resolve(ancestor);

  var args = [].slice.call(arguments, 1);
  var len = arguments.length;
  if (len === 0) {
    return false;
  }

  var rel;
  for (var i = 0; i < len; i++) {
    rel = path.relative(resolve(args[i]), ancestor);
    if (rel === '' || /\w+/.test(rel)) {
      return false;
    }
  }
  return true;
};

/**
 * True if a filepath is the CWD.
 *
 * Sourced from [Grunt].
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 * @api public
 */

exports.isPathCwd = function(filepath) {
  try {
    var actual = fs.realpathSync(filepath);
    return exports.equivalent(process.cwd(), actual);
  } catch (err) {
    return false;
  }
};

/**
 * True if a filepath is contained within the CWD.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 * @api public
 */

exports.isPathInCwd = function(filepath) {
  try {
    var actual = fs.realpathSync(path.resolve(filepath));
    console.log(actual);
    return exports.doesPathContain(process.cwd(), actual);
  } catch (err) {
    return false;
  }
};
