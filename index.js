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
var glob  = require('glob');
var cwd   = require('cwd');
var YAML  = require('js-yaml');
var _     = require('lodash');


// Export the `file` object
var file = module.exports = {};

/**
 * TODO:
 *  - endsWith
 *  - lastExt (last extension)
 *
 *  - readYFM?
 *  - readContent? (returns the content of a page, without YFM)
 */

// Normalize paths to use `/`
file.pathSepRegex = /[\/\\]/g;
file.normalizeSlash =function(str) {
  return str.replace(file.pathSepRegex, '/');
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

// 'foo/bar/baz/quux/file.ext' => 'file.ext'
// 'foo/bar/baz/quux'          => 'quux'
// 'foo/bar/baz/quux/'         => ''
file.lastSegment = function() {
  var filepath = path.join.apply(null, arguments);
  return filepath.split('/').pop();
};

// Normalized path to the CWD
// @example: file.cwd('foo')
file.cwd = function() {
  var filepath = path.join.apply(null, arguments);
  return file.normalizeSlash(path.join(cwd, filepath));
};

// Change the current working directory (CWD)
file.changeCWD = function() {
  var filepath = path.join.apply(null, arguments);
  process.chdir(filepath);
};

file.filename = function() {
  var filepath = path.join.apply(null, arguments);
  return path.basename(filepath);
};

file.name = function() {
  var filepath = path.join.apply(null, arguments);
  var re = /[\w.-]+$/;
  return re.exec(filepath)[0];
};

file.basename = function() {
  var filepath = path.join.apply(null, arguments);
  return path.basename(filepath, path.extname(filepath));
};

// Filename without extension
file.base = function() {
  var filepath = path.join.apply(null, arguments);
  var name = path.basename(filepath, path.extname(filepath));
  return name.split('.')[0];
};

// Filename without extension
file.rename = function(dir, filename) {
  return file.addTrailingSlash(path.join(dir, filename));
};

// Retrieve a specific file using globbing patterns. If
// multiple matches are found, only the first is returned
file.getFile = function(filepath, options) {
  var str = file.expandFiles(filepath, options)[0];
  return str ? String(str) : null;
};

// Does the filepath actually exist?
file.exists = function() {
  var filepath = path.join.apply(null, arguments);
  return fs.existsSync(filepath);
};

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
  file.expandFiles(filepath, options).map(function (fp) {
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
file.mkdirSync = function (dir, mode) {
  mode = mode || parseInt('0777', 8) & (~process.umask());
  if (!fs.existsSync(dir)) {
    file.mkdirSync(path.dirname(dir), mode);
    fs.mkdirSync(dir, mode);
  }
};

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

// @example: file.writeDataFile('foo.yaml', {name: "Foo"});
file.writeDataSync = function(dest, content, options) {
  options = options || {};
  var ext = path.extname(dest);
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
  return writer(dest, content, ext);
};

file.copyFileSync = function (src, dest, options) {
  options = options || {};
  src = file.readFileSync(src);
  file.writeFileSync(dest, src, options);
};


// If the given file exists, does it have any content?
file.isEmptyFile = function(filepath) {
  filepath = file.readFileSync(filepath);
  return (filepath.length === 0 || filepath === '') ? true : false;
};

// Is the path a directory?
file.isDir = function(filepath) {
  if (!file.exists(filepath)) {return false;}
  return fs.statSync(filepath).isDirectory();
};

// Is the path a file?
file.isFile = function(filepath) {
  if (!file.exists(filepath)) {return false;}
  return fs.statSync(filepath).isFile();
};

// Is the given filepath an absolute path?
file.isPathAbsolute = function (filepath) {
  filepath = path.normalize(filepath);
  return path.resolve(filepath) === filepath;
};

// SOURCED FROM globule: https://github.com/cowboy/node-globule
// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
function processPatterns(patterns, fn) {
  return _.flatten(patterns).reduce(function(result, pattern) {
    if (pattern.indexOf('!') === 0) {
      // If the first character is ! all matches via this pattern should be
      // removed from the result set.
      pattern = pattern.slice(1);
      return _.difference(result, fn(pattern));
    } else {
      // Otherwise, add all matching filepaths to the result set.
      return _.union(result, fn(pattern));
    }
  }, []);
}

/**
 * Returns both files and directories based on the given patterns and
 * specified options. Any options supported by
 * [glob](https://github.com/isaacs/node-glob#options) may be used.
 *
 * @param {String} pattern The glob pattern to use
 * @param {Object} options The object of options to pass to 'glob'
 */
file.expand = function(patterns, options) {
  options = _.extend(options || {});
  patterns = !Array.isArray(patterns) ? [patterns] : patterns;
  var matches = processPatterns(patterns, function(pattern) {
    pattern = file.normalizeSlash(path.join(options.cwd || '', pattern));
    return glob.sync(pattern, options);
  });
  return matches;
};

/**
 * Returns only files based on the given patterns and specified options.
 * Any options supported by [glob](https://github.com/isaacs/node-glob#options)
 * may be used.
 *
 * @param {String} pattern The glob pattern to use
 * @param {Object} options The options to pass to 'glob'
 */
file.expandFiles = function(patterns, options) {
  options = _.extend({}, options);
  return file.expand(patterns, options).filter(function (filepath) {
    return fs.statSync(filepath).isFile();
  });
};
