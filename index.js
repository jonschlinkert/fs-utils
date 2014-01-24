/**
 * fs-utils
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// Node.js
var path = require('path');
var fs   = require('fs');

// node_modules
var async  = require('async');
var rimraf = require('rimraf');
var glob   = require('globule');
var YAML   = require('js-yaml');
var _      = require('lodash');


// Export the `file` object
var file = module.exports = {};


// Normalize paths to use `/`
file.pathSepRegex = /[\/\\]/g;
file.normalizeSlash = function(str) {
  return str.replace(file.pathSepRegex, '/');
};

file.escapeRegex = function(re) {
  return re.replace(/(.)/g, '\\$1');
};

file.toArray = function(val) {
  val = !Array.isArray(val) ? [val] : val;
  return _.compact([val]);
};

// Build RegExp patterns from a string or array
// @examples:
//   'foo' => '(?:foo)'
//   ['foo', 'bar', 'baz'] => '(?:foo|bar|baz)'
file.buildRegexGroup = function(patterns) {
  patterns = utils.toArray(patterns);
  if(patterns.length > 0) {
    patterns = patterns.join('|');
  }
  return '(?:' + patterns + ')';
};

// Default encoding
file.encoding = function(options) {
  options = options || {};
  return options.encoding || 'utf8';
};

file.preserveBOM = false;
file.stripBOM = function(str) {
  var EOL  = require('os').EOL;
  var EOLre = new RegExp(EOL, 'g');
  // Transform EOL
  var contents = (EOL === '\n') ? str : str.replace(EOLre, '\n');
  // Strip UTF BOM
  if (!file.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
    contents = contents.substring(1);
    contents = contents.replace(/^\uFEFF/, '');
  }
  return contents;
};

/**
 * CWD
 */

// Normalized path to the CWD
// @example: file.cwd('foo')
file.cwd = function() {
  var filepath = path.join.apply(path, arguments);
  return file.normalizeSlash(path.join(process.cwd(), filepath));
};

// Change the current working directory (CWD)
file.setCWD = function() {
  var filepath = path.join.apply(path, arguments);
  process.chdir(filepath);
};


/**
 * Path
 */

// The last segment of a filepath
file.lastSegment = function() {
  var filepath = path.join.apply(path, arguments);
  return _.compact(filepath.split(path.sep)).pop();
};

// The last segment of a filepath
file.firstSegment = function() {
  var filepath = path.join.apply(path, arguments);
  return _.compact(filepath.split(path.sep)).slice(0, 1)[0];
};
file.firstDir = file.firstSegment;

// Directory path
file.dirname = function() {
  var filepath = path.join.apply(path, arguments).split(path.sep);
  var dirlen = filepath.length - 1;
  var dir = file.normalizeSlash(filepath.splice(0, dirlen).join(path.sep));
  return file.addTrailingSlash(dir);
};

// Directory path
file.dir = function() {
  var filepath = path.join.apply(path, arguments);
  if(file.endsWith(filepath, path.extname(filepath))) {
    filepath = file.removeFilename(filepath);
    return filepath;
  }
  return filepath;
};

// Last dictory path segment, excluding the filename
file.lastDir = function() {
  var filepath = path.join.apply(path, arguments);
  if(file.hasExt(file.lastSegment(filepath))) {
    filepath = file.removeFilename(filepath);
  }
  var segments = file.dir(filepath).split(path.sep);
  // return _.compact(segments).splice(-1,1)[0];
  return _.compact(segments).pop();
};

// The last character in a filepath. 'foo/bar/baz/' => '/'
file.lastChar = function(filepath) {
  return _.toArray(filepath).pop();
};

// Returns a filename
file.filename = function() {
  var filepath = path.join.apply(path, arguments);
  var re = /[\w.-]+$/;
  try {
    var foo = re.exec(filepath)[0];
    return foo;
  } catch(e) {
    return '';
  }
};

file.getFilename = function() {
  var filepath = path.join.apply(path, arguments);
  return filepath.split(path.sep).pop().split('/').pop();
};

// Strip the filename from a file path
file.removeFilename = function() {
  var filepath = path.join.apply(path, arguments);
  if(file.hasExt(file.lastSegment(filepath))) {
    filepath = filepath.replace(/[^\/|\\]*$/, '');
  }
  return filepath;
};

// Filename without extension
file.basename = function() {
  var filepath = path.join.apply(path, arguments);
  return path.basename(filepath, path.extname(filepath));
};

// Filename without extension. Differs slightly from basename
file.base = function() {
  var filepath = path.join.apply(path, arguments);
  var name = path.basename(filepath, path.extname(filepath));
  return name.split('.')[0];
};

// File extension without the dot
file.ext = function() {
  var filepath = path.join.apply(path, arguments);
  return path.extname(filepath).replace(/\./, '');
};

// Get the _last_ file extension.
// @example 'foo/bar/file.tmpl.md' => 'md'
file.lastExt = function() {
  var filepath = path.join.apply(path, arguments);
  var sep = file.escapeRegex(path.sep);
  var ext = new RegExp('^.*?\\.([^.|' + sep + ']*)$', 'g');
  var segments = ext.exec(filepath);
  return segments && segments[1].length > 0 ? segments[1] : '';
};

// Returns true if the filepath ends in a file with an extension
file.hasExt = function() {
  var filepath = path.join.apply(path, arguments);
  var last = file.lastSegment(filepath);
  return /\./.test(last);
};

// Returns true if the filepath ends with the suffix
file.endsWith = function(filepath, suffix) {
  filepath = path.normalize(filepath);
  suffix = path.normalize(suffix);
  return filepath.indexOf(suffix, filepath.length - suffix.length) !== -1;
};

// Return a list of files with the given extension.
file.withExt = function (filepath, ext) {
  var files = fs.readdirSync(filepath);
  var list = [];
  files.forEach(function (filename) {
    if (file.endsWith(filename, ext)) {
      list.push(filename);
    }
  });
  return list;
};

// Add a trailing slash to the file path
file.addTrailingSlash = function () {
  var filepath = path.join.apply(path, arguments);
  if (filepath.charAt(filepath.length - 1) !== path.sep) {
    if(!file.hasExt(filepath) && !file.isFile(filepath)) {
      filepath += path.sep;
    }
  }
  return filepath;
};

// Remove the trailing slash from a file path
file.removeTrailingSlash = function () {
  var filepath = path.join.apply(path, arguments);
  var sep = new RegExp(file.escapeRegex(path.sep) + '+$');
  return filepath.replace(sep, '');
};


/**
 * Read Files
 */

// Read file synchronously
file.readFileSync = function(filepath, options) {
  options = options || {};
  var buffer = fs.readFileSync(String(filepath), file.encoding(options));
  try {
    return file.stripBOM(buffer);
  } catch (err) {
    err.message = 'Failed to read "' + filepath + '": ' + err.message;
    throw err;
  }
};

// Read JSON file synchronously and parse content as JSON
file.readJSONSync = function(filepath) {
  var buffer = file.readFileSync(filepath);
  try {
    return JSON.parse(buffer);
  } catch (err) {
    err.message = 'Failed to parse "' + filepath + '": ' + err.message;
    throw err;
  }
};

// Read YAML file synchronously and parse content as JSON
file.readYAMLSync = function(filepath) {
  var buffer = file.readFileSync(filepath);
  try {
    return YAML.load(buffer);
  } catch (err) {
    err.message = 'Failed to parse "' + filepath + '": ' + err.message;
    throw err;
  }
};


/**
 * Data file reader factory
 * Automatically determines the reader based on extension.
 * Use instead of grunt.file.readJSON or grunt.file.readYAML
 */
file.readDataSync = function(filepath, options) {
  options = options || {};
  var ext = path.extname(filepath);
  var reader = file.readJSONSync;
  switch(ext) {
    case '.json':
      reader = file.readJSONSync;
      break;
    case '.yml':
    case '.yaml':
      reader = file.readYAMLSync;
      break;
  }
  return reader(filepath, options);
};


/**
 * @param  {String} filepath The filepath to read or string pattern to expand then read
 * @param  {Object} options  Object of options. 'namespace' will use the basename of
 *                           the source file as the name of the returned object
 * @return {Object}          Object of metadata
 */
file.expandDataFiles = function (filepath, options) {
  options = options || {};

  var obj = {};
  glob.find(filepath, options).map(function (fp) {
    var name = path.basename(fp, path.extname(fp));
    if (file.isEmptyFile(fp)) {
      // console.warn('Skipping empty file:'.yellow, fp);
    } else {
      if(options.namespace === true) {
        obj[name] = _.extend(obj, file.readDataSync(fp));
      } else {
        obj = _.extend(obj, file.readDataSync(fp));
      }
    }
  });
  return obj;
};


file.getStatsSync = function (filepath) {
  try {
    return fs.statSync(filepath);
  } catch (err) {
    err.message = 'Failed to retrieve "' + filepath + '" stats: ' + err.message;
    throw err;
  }
};

file.getStats = function (filepath, callback) {
  try {
    return fs.stat(filepath, callback);
  } catch (err) {
    err.message = 'Failed to retrieve "' + filepath + '" stats: ' + err.message;
    return callback(err, null);
  }
};

/**
 * Make directories
 */

file.mkdir = function (dest, callback) {
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
};

// Make any directories and intermediate directories that
// don't already exist
file.mkdirSync = function (dirpath, mode) {
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
};

// Testing out the `mkdirp` lib as an alternative to
// built-in mkdir functions.
file.mkdirp = function (dir) {
  require('mkdirp')(dir, function (err) {
    if (err) {console.error(err); }
  });
};
file.mkdirpSync = function (dir) {
  require('mkdirp').sync(dir);
};


/**
 * Write
 */

file.writeFile = function (dest, content, callback) {
  var destpath = path.dirname(dest);
  fs.exists(destpath, function (exists) {
    if (exists) {
      fs.writeFile(dest, content, callback);
    } else {
      file.mkdir(destpath, function () {
        fs.writeFile(dest, content, callback);
      });
    }
  });
};

// Write files to disk, synchronously
file.writeFileSync = function(dest, content, options) {
  options = options || {};
  var dirpath = path.dirname(dest);
  if (!file.exists(dirpath)) {
    file.mkdirSync(dirpath);
  }
  fs.writeFileSync(dest, content, file.encoding(options));
};

file.writeJSONSync = function(dest, content, options) {
  options = options || {};
  options.indent = options.indent || 2;
  content = JSON.stringify(content, null, options.indent);
  file.writeFileSync(dest, content);
};

file.writeYAMLSync = function(dest, content, options) {
  options = options || {};
  options.indent = options.indent || 2;
  content = YAML.dump(content, null, options.indent);
  file.writeFileSync(dest, content);
};

// @example: file.writeDataSync('foo.yaml', {name: "Foo"});
file.writeDataSync = function(dest, content, options) {
  options = options || {};
  var ext = options.ext || path.extname(dest);
  var writer = file.writeJSONSync;
  switch(ext) {
    case '.json':
      writer = file.writeJSONSync;
      break;
    case '.yml':
    case '.yaml':
      writer = file.writeYAMLSync;
      break;
  }
  return writer(dest, content, options);
};


/**
 * Copy
 */

// Copy files synchronously from a to b.
file.copyFileSync = function (src, dest, options) {
  options = options || {};
  src = file.readFileSync(src);
  file.writeFileSync(dest, src, options);
};


/**
 * Remove
 */

// Remove any directories and child directories that exist
file.rmdirSync = function () {
  var dirpath = path.join.apply(path, arguments);
  if (fs.existsSync(dirpath)) {
    var files = fs.readdirSync(dirpath);
    for (var i = 0, l = files.length; i < l; i++) {
      var filepath = path.join(dirpath, files[i]);
      if (filepath === "." || filepath === "..") {
        continue;
      } else if (fs.statSync(filepath).isDirectory()) {
        file.rmdirSync(filepath);
      } else {
        fs.unlinkSync(filepath);
      }
    }
    fs.rmdirSync(dirpath);
  }
};

// file.delete was sourced and modified from grunt.file
// https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
// https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
//
// Delete folders and files recursively
file.delete = function(filepath, options) {
  filepath = String(filepath);
  options = options || {};

  if (!file.exists(filepath)) {
    console.warn('Cannot delete nonexistent file.');
    return false;
  }
  // Only delete cwd or outside cwd if --force enabled. Be careful, people!
  if (!options.force) {
    if (file.isPathCwd(filepath)) {
      console.warn('Cannot delete the current working directory.');
      return false;
    } else if (!file.isPathInCwd(filepath)) {
      console.warn('Cannot delete files outside the current working directory.');
      return false;
    }
  }
  try {
    // Actually delete. Or not.
    rimraf.sync(filepath);
    return true;
  } catch(e) {
    throw new Error('Unable to delete "' + filepath + '" file (' + e.message + ').', e);
  }
};

file.rmdir = function (dirpath, callback) {
  if (!_.isFunction(callback)) {callback = function () {};}
  fs.readdir(dirpath, function (err, files) {
    if (err) {return callback(err);}
    async.each(files, function (segment, next) {
      var dirpath = path.join(dirpath, segment);
      fs.stat(dirpath, function (err, stats) {
        if (err) {return callback(err); }
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
 * Checks
 */

// Does the filepath actually exist?
file.exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// Is the path a directory?
file.isDir = function() {
  var filepath = path.join.apply(path, arguments);
  if (!file.exists(filepath)) {return false;}
  return fs.statSync(filepath).isDirectory();
};

// Is the path a file?
file.isFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!file.exists(filepath)) {return false;}
  return fs.statSync(filepath).isFile();
};

// If the file actually exists, does it have any content?
file.isEmptyFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!file.exists(filepath)) {return false;}
  filepath = file.readFileSync(filepath);
  return (filepath.length === 0 || filepath === '') ? true : false;
};

// The following functions are sourced from grunt.file
// https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
// https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
// - isPathAbsolute
// - arePathsEquivalent
// - doesPathContain
// - isPathCwd
// - isPathInCwd

// Is the path absolute?
file.isPathAbsolute = function () {
  filepath = path.join.apply(path, arguments);
  return path.resolve(filepath) === file.removeTrailingSlash(filepath);
};

// Do all the specified paths refer to the same path?
file.arePathsEquivalent = function(first) {
  first = path.resolve(first);
  for (var i = 1; i < arguments.length; i++) {
    if (first !== path.resolve(arguments[i])) { return false; }
  }
  return true;
};

// Are descendant path(s) contained within ancestor path? Note: does not test
// if paths actually exist.
file.doesPathContain = function(ancestor) {
  ancestor = path.resolve(ancestor);
  var relative;
  for (var i = 1; i < arguments.length; i++) {
    relative = path.relative(path.resolve(arguments[i]), ancestor);
    if (relative === '' || /\w+/.test(relative)) { return false; }
  }
  return true;
};

// Test to see if a filepath is the CWD.
file.isPathCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.arePathsEquivalent(process.cwd(), fs.realpathSync(filepath));
  } catch(e) {
    return false;
  }
};

// Test to see if a filepath is contained within the CWD.
file.isPathInCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.doesPathContain(process.cwd(), fs.realpathSync(filepath));
  } catch(e) {
    return false;
  }
};



// Retrieve a specific file using globbing patterns. If
// multiple matches are found, only the first is returned
file.getFile = function(filepath, options) {
  var str = glob.find(filepath, options)[0];
  return str ? String(str) : null;
};



// @private
// List out functions
function fn(src) {
  return src.match(/^file\.(.+) =/gim).map(function(match) {
    return match.replace(/(file\.| =)/g, '');
  });
};
// file.writeDataSync('tmp/fn.json', fn(file.readFileSync(__filename)));
