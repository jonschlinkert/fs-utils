/*!
 * fs-utils <https://github.com/assemble/fs-utils>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('graceful-fs');
var os = require('os');
var path = require('path');
var del = require('delete');
var async = require('async');
var rimraf = require('rimraf');
var YAML = require('js-yaml');
var typeOf = require('kind-of');
var _ = require('lodash');
var file = module.exports = {};

function stripcr(str) {
  return str.replace(/\r/g, '');
}

function stripBOM(str) {
  return str.replace(/^\uFEFF/, '');
}

/**
 * Boolean checks
 */

/**
 * True if the filepath actually exist.
 *
 * @param  {[type]} filepath
 * @return {[type]}
 */

function exists(filepath) {
  return fs.existsSync(filepath);
}

/**
 * Return `true` if the file exists and is empty.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 */

function isEmpty(filepath) {
  if (!exists(filepath)) {
    return false;
  }
  var str = fs.readFileSync(filepath, 'utf8');
  return !!str.length > 0;
}

/**
 * Return the results from a call to `fs.statSync()`.
 *
 * @param  {String} `filepath`
 * @return {Object}
 */

function stats(filepath) {
  return fs.statSync(filepath);
}

/**
 * Return `true` if the filepath is a directory.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 */

function isDir(filepath) {
  if (!fs.existsSync(filepath)) {
    return false;
  }
  return stats(filepath).isDirectory();
}

/**
 * True if the filepath is a file.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 */

function isFile(filepath) {
  if (!fs.existsSync(filepath)) {
    return false;
  }
  return stats(filepath).isFile();
}

/**
 * True if the filepath is a symbolic link.
 *
 * @param  {String} `filepath`
 * @return {Boolean}
 */

function isLink(filepath) {
  return file.exists(filepath)
    && fs.lstatSync(filepath).isSymbolicLink();
}

/**
 * Read a file synchronously. Also strips any byte order
 * marks.
 *
 * @param  {String} `filepath`
 * @return {String}
 */

function readFileSync(filepath, enc) {
  var str = fs.readFileSync(String(filepath), enc || 'utf8');
  return stripBOM(str);
}

/**
 * Read a file asynchronously. Also strips any byte order
 * marks.
 *
 * @param  {String} `filepath`
 * @return {String}
 */

function readFile(filepath, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  async.waterfall([
    function (next) {
      fs.readFile(String(filepath), enc || 'utf8', next);
    }, function (contents, next) {
      try {
        next(null, stripBOM(contents));
      } catch (err) {
        err.message = 'Failed to read "' + filepath + '": ' + err.message;
        next(err);
      }
    }
  ], callback);
}

/**
 * Read a file synchronously and parse contents as JSON.
 * marks.
 *
 * @param  {String} `filepath`
 * @return {Object}
 */

function readJSONSync(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// Read JSON file asynchronously and parse content as JSON
function readJSON(filepath, callback) {
  async.waterfall([
    function (next) {
      fs.readFile(filepath, next);
    }, function (contents, next) {
      try {
        next(null, JSON.parse(contents));
      } catch (err) {
        err.message = 'Failed to parse "' + filepath + '": ' + err.message;
        next(err);
      }
    }
  ], callback);
}


// Read YAML file synchronously and parse content as JSON
function readYAMLSync(filepath) {
  var buffer = file.readFileSync(filepath);
  try {
    return YAML.load(buffer);
  } catch (err) {
    err.message = 'Failed to parse "' + filepath + '": ' + err.message;
    throw err;
  }
}

// Read YAML file synchronously and parse content as JSON
function readYAML(filepath, callback) {
  async.waterfall([
    function (next) {
      file.readFile(filepath, next);
    },
    function (contents, next) {
      try {
        next(null, YAML.load(contents));
      } catch (err) {
        err.message = 'Failed to parse "' + filepath + '": ' + err.message;
        next(err);
      }
    }
  ], callback);
}

// Read optional JSON
// Ben Alman, https://gist.github.com/2876125
function readOptionalJSON(filepath) {
  var buffer = {};
  try {
    buffer = file.readJSONSync(filepath);
  } catch (e) {}
  return buffer;
}

function readOptionalYAML(filepath) {
  var buffer = {};
  try {
    buffer = file.readYAMLSync(filepath);
  } catch (e) {}
  return buffer;
}

// Determine the reader based on extension.
function readDataSync(filepath, options) {
  var opts = _.extend({}, options);
  var ext = opts.lang || opts.parse || file.ext(filepath);
  var reader = file.readJSONSync;
  switch (ext) {
  case 'json':
    reader = file.readJSONSync;
    break;
  case 'yml':
  case 'yaml':
    reader = file.readYAMLSync;
    break;
  }
  return reader(filepath, options);
}

// Determine the reader based on extension (async).
function readData(filepath, options, callback) {
  if (_.isFunction(options || {})) {
    callback = options;
    options = {};
  }
  var opts = _.extend({}, options);
  var ext = opts.parse || file.ext(filepath);
  var reader = file.readJSON;
  switch (ext) {
    case 'json':
      reader = file.readJSON;
      break;
    case 'yml':
    case 'yaml':
      reader = file.readYAML;
      break;
    }
  reader(filepath, callback);
}

/**
 * Make directories
 */

function mkdir(dest, callback) {
  var destpath = path.dirname(dest);
  fs.exists(destpath, function (exist) {
    if (exist) {
      fs.mkdir(dest, callback);
    } else {
      file.mkdir(destpath, function () {
        fs.mkdir(dest, callback);
      });
    }
  });
}

// Make any dirs and intermediate dirs don't exist
function mkdirSync(dirpath, mode) {
  mode = mode || parseInt('0777', 8) & (~process.umask());
  if (!fs.existsSync(dirpath)) {
    var parentDir = path.dirname(dirpath);
    if (fs.existsSync(parentDir)) {
      fs.mkdirSync(dirpath, mode);
    } else {
      file.mkdirSync(parentDir);
      fs.mkdirSync(dirpath, mode);
    }
  }
}

/**
 * Write
 */

function writeFile(dest, content, callback) {
  var destpath = path.dirname(dest);
  fs.exists(destpath, function (exists) {
    if (exists) {
      fs.writeFile(dest, content, callback);
    } else {
      file.mkdir(destpath, function (err) {
        if (err) {
          callback(err);
        } else {
          fs.writeFile(dest, content, callback);
        }
      });
    }
  });
}


// Write files to disk, synchronously
function writeFileSync(dest, content, options) {
  options = options || {};
  var dirpath = path.dirname(dest);
  if (!file.exists(dirpath)) {
    file.mkdirSync(dirpath);
  }
  fs.writeFileSync(dest, content, file.encoding(options));
};

function writeJSONSync(dest, content, options) {
  options = options || {};
  options.indent = options.indent || 2;
  content = JSON.stringify(content, null, options.indent);
  file.writeFileSync(dest, content);
};

function writeJSON(dest, content, options, callback) {
  options = options || {};
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  options.indent = options.indent || 2;
  content = JSON.stringify(content, null, options.indent);
  file.writeFile(dest, content, callback);
};

function writeYAMLSync(dest, content, options) {
  options = options || {};
  options.indent = options.indent || 2;
  content = YAML.dump(content, null, options.indent);
  file.writeFileSync(dest, content);
};

function writeYAML(dest, content, options, callback) {
  options = options || {};
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  options.indent = options.indent || 2;
  content = YAML.dump(content, null, options.indent);
  file.writeFile(dest, content, callback);
};

// @example: file.writeDataSync('foo.yml', {foo: "bar"});
function writeDataSync(dest, content, options) {
  options = options || {};
  var ext = options.ext || path.extname(dest);
  var writer = file.writeJSONSync;
  switch (ext) {
  case '.json':
  case 'json':
    writer = file.writeJSONSync;
    break;
  case '.yml':
  case 'yml':
  case '.yaml':
  case 'yaml':
    writer = file.writeYAMLSync;
    break;
  }
  return writer(dest, content, options);
};

file.writeData = function (dest, content, options, callback) {
  options = options || {};
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  var ext = options.ext || path.extname(dest);
  var writer = file.writeJSON;
  switch (ext) {
  case '.json':
  case 'json':
    writer = file.writeJSON;
    break;
  case '.yml':
  case 'yml':
  case '.yaml':
  case 'yaml':
    writer = file.writeYAML;
    break;
  }
  writer(dest, content, options, callback);
};

/**
 * Copy files
 */

// Copy files synchronously
file.copyFileSync = function (src, dest, options) {
  file.writeFileSync(dest, file.readFileSync(src), options || {});
};

/**
 * Remove directories
 */

// Asynchronously remove dirs and child dirs that exist
file.rmdir = function (dirpath, callback) {
  if (!_.isFunction(callback)) {
    callback = function () {};
  }
  fs.readdir(dirpath, function (err, files) {
    if (err) {
      return callback(err);
    }
    async.each(files, function (segment, next) {
      var dirpath = path.join(dirpath, segment);
      fs.stat(dirpath, function (err, stats) {
        if (err) {
          return callback(err);
        }
        if (stats.isDirectory()) {
          rimraf(dirpath, next);
        } else {
          fs.unlink(dirpath, next);
        }
      });
    }, function () {
      fs.rmdir(dirpath, callback);
    });
  });
};

/**
 *  Delete folders and files recursively
 */

file.delete = function (patterns, options, cb) {
  var args = [].slice.call(arguments);
  var last = args[args.length - 1];

  if (typeOf(last) === 'function') {
    file.deleteAsync(patterns, options);
  } else {
    file.deleteSync(patterns, options);
  }
};

file.deleteAsync = function (patterns, options, cb) {
  if (typeof options !== 'object') {
    cb = options;
    options = {};
  }

  globby(patterns, options, function (err, files) {
    if (err) {
      cb(err);
      return;
    }
    async.each(files, function (filepath, next) {
      if (options.cwd) {
        filepath = path.resolve(options.cwd, filepath);
      }

      del(filepath, next);
    }, cb);
  });
};

file.deleteSync = function (patterns, options) {
  globby.sync(patterns, options).forEach(function (filepath) {
    if (options.cwd) {
      filepath = path.resolve(options.cwd, filepath);
    }
    del.sync(filepath);
  });
};

/**
 * Path utils
 */

/**
 * Directory / Segments
 */

// The last segment of a filepath
file.lastSegment = function () {
  var filepath = path.join.apply(path, arguments);
  return _.compact(filepath.split(path.sep)).pop();
};

// The last segment of a filepath
file.firstSegment = function () {
  var filepath = path.join.apply(path, arguments);
  return _.compact(filepath.split(path.sep)).slice(0, 1)[0];
};

// First segment of a file path
file.firstDir = file.firstSegment;

// Directory path
file.dirname = function () {
  var filepath = path.join.apply(path, arguments).split(path.sep);
  var dirlen = filepath.length - 1;
  var dir = file.normalizeSlash(filepath.splice(0, dirlen).join(path.sep));
  return file.addTrailingSlash(dir);
};

// Directory path
file.dir = function () {
  var filepath = path.join.apply(path, arguments);
  if (file.endsWith(filepath, path.extname(filepath))) {
    filepath = file.removeFilename(filepath);
    return filepath;
  }
  return filepath;
};

// Last dictory path segment, excluding the filename
file.lastDir = function () {
  var filepath = path.join.apply(path, arguments);
  if (file.hasExt(file.lastSegment(filepath))) {
    filepath = file.removeFilename(filepath);
  }
  var segments = file.dir(filepath).split(path.sep);
  // return _.compact(segments).splice(-1,1)[0];
  return _.compact(segments).pop();
};

/**
 * Path "endings"
 */

// The last character in a filepath. 'foo/bar/baz/' => '/'
file.lastChar = function (filepath) {
  return _.toArray(filepath).pop();
};

// Returns true if the filepath ends with the suffix
file.endsWith = function (filepath, suffix) {
  filepath = path.normalize(filepath);
  suffix = path.normalize(suffix);
  return filepath.indexOf(suffix, filepath.length - suffix.length) !== -1;
};

/**
 * Trailing slash
 */

// Remove the trailing slash from a file path
file.removeTrailingSlash = function () {
  var filepath = path.join.apply(path, arguments);
  var sep = new RegExp(file.escapeRegex(path.sep) + '+$');
  return filepath.replace(sep, '');
};

// Add a trailing slash to the filepath, does NOT consult
// the file system to check if it's a file or a directory.
file.addTrailingSlash = function () {
  var filepath = path.join.apply(path, arguments);
  if (filepath.charAt(filepath.length - 1) !== path.sep) {
    if (!file.hasExt(filepath)) {
      filepath += path.sep;
    }
  }
  return filepath;
};

// Ensure that filepath has trailing slash. Alternate
// to `addTrailingSlash`. One of these will be deprecated
// after more tests, and we'll keep the name `slashify`.
file.slashify = function () {
  var filepath = path.join.apply(path, arguments);
  var last = _.last((filepath).split('/'));
  if (last.indexOf('.') === -1) {
    return filepath.replace(/\/$/, '') + '/';
  } else {
    return filepath;
  }
};

/**
 * File name
 */

// Returns a filename
file.filename = function () {
  var filepath = path.join.apply(path, arguments);
  var re = /[\w.-]+$/;
  try {
    var test = re.exec(filepath)[0];
    return test;
  } catch (e) {
    return '';
  }
};

file.getFilename = function () {
  var filepath = path.join.apply(path, arguments);
  return filepath.split(path.sep).pop().split('/').pop();
};

// Strip the filename from a file path
file.removeFilename = function () {
  var filepath = path.join.apply(path, arguments);
  if (file.hasExt(file.lastSegment(filepath))) {
    filepath = filepath.replace(/[^\/|\\]*$/, '');
  }
  return filepath;
};

/**
 * Basename
 */

// Filename without extension
file.basename = function () {
  var filepath = path.join.apply(path, arguments);
  return path.basename(filepath, path.extname(filepath));
};

// Filename without extension. Differs slightly from basename
file.base = function () {
  var filepath = path.join.apply(path, arguments);
  var name = path.basename(filepath, path.extname(filepath));
  return name.split('.')[0];
};
// Alias
file.name = file.base;

/**
 * Extension
 */

// File extension without the dot
file.ext = function () {
  var filepath = path.join.apply(path, arguments);
  return path.extname(filepath).replace(/\./, '');
};

// Get the _last_ file extension.
// @example 'foo/bar/file.tmpl.md' => 'md'
file.lastExt = function () {
  var filepath = path.join.apply(path, arguments);
  var sep = file.escapeRegex(path.sep);
  var ext = new RegExp('^.*?\\.([^.|' + sep + ']*)$', 'g');
  var segments = ext.exec(filepath);
  return segments && segments[1].length > 0 ? segments[1] : '';
};

// Returns true if the filepath ends in a file with an extension
file.hasExt = function () {
  var filepath = path.join.apply(path, arguments);
  var last = file.lastSegment(filepath);
  return /\./.test(last);
};

// Returns true if the filepath has one of the given extensions
file.containsExt = function (filepath, ext) {
  ext = file.arrayify(ext);
  if (ext.length > 1) {
    ext = '?:' + ext.join('|');
  } else {
    ext = ext.join('');
  }
  return new RegExp('\\.(' + ext + ')$').test(filepath);
};

// Return a list of files with the given extension.
file.withExt = function (filepath, ext) {
  var files = fs.readdirSync(filepath);
  var list = [];
  files.forEach(function (filename) {
    if (file.containsExt(filename, ext)) {
      list.push(filename);
    }
  });
  return list;
};

/**
 * Boolean checks
 */

/**
 * The following functions were sourced from grunt.file
 * - isPathAbsolute
 * - arePathsEquivalent
 * - doesPathContain
 * - isPathCwd
 * - isPathInCwd
 * https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

// True if the path is absolute
file.isPathAbsolute = function () {
  var filepath = path.join.apply(path, arguments);
  return path.resolve(filepath) === file.removeTrailingSlash(filepath);
};

// True if the specified paths refer to the same path.
file.arePathsEquivalent = function (first) {
  first = path.resolve(first);
  for (var i = 1; i < arguments.length; i++) {
    if (first !== path.resolve(arguments[i])) {
      return false;
    }
  }
  return true;
};

// True if descendant path(s) contained within ancestor path.
// Note: does not test if paths actually exist.
file.doesPathContain = function (ancestor) {
  ancestor = path.resolve(ancestor);
  var relative;
  for (var i = 1; i < arguments.length; i++) {
    relative = path.relative(path.resolve(arguments[i]), ancestor);
    if (relative === '' || /\w+/.test(relative)) {
      return false;
    }
  }
  return true;
};

// True if a filepath is the CWD.
file.isPathCwd = function () {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.arePathsEquivalent(process.cwd(), fs.realpathSync(filepath));
  } catch (e) {
    return false;
  }
};

// True if a filepath is contained within the CWD.
file.isPathInCwd = function () {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.doesPathContain(process.cwd(), fs.realpathSync(filepath));
  } catch (e) {
    return false;
  }
};