/**
 * fs-utils
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// Node.js
var fs       = require('graceful-fs');
var os       = require('os');
var path     = require('path');

// node_modules
var async    = require('async');
var glob     = require('globule');
var rimraf   = require('rimraf');
var YAML     = require('js-yaml');
var template = require('template');
var _        = require('lodash');



// Export the `file` object
var file = module.exports = {};


/**
 * Utils
 */


// Build regex based on os EOL
file.EOLre = new RegExp(os.EOL, 'g');

file.arrayify = function(val) {
  return !Array.isArray(val) ? [val] : val;
};

file.escapeRegex = function(re) {
  return re.replace(/(.)/g, '\\$1');
};

// Normalize paths to use `/`
file.pathSepRegex = /[\/\\]/g;
file.normalizeSlash = function(str) {
  return str.replace(file.pathSepRegex, '/');
};

// Normalize line endings
file.normalizeEOL = function(str) {
  return str.replace(/\r\n|\n/g, os.EOL);
};

// Normalize to newlines
file.normalizeNL = function(str) {
  return str.replace(/\r\n|\n/g, '\n');
};

// Default encoding
file.encoding = function(options) {
  options = options || {};
  return options.encoding || 'utf8';
};

file.preserveBOM = false;
file.stripBOM = function(str) {
  // Transform EOL
  var contents = (os.EOL === '\n') ? str : str.replace(file.EOLre, '\n');
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
 * Boolean checks
 */

// True if the filepath actually exist.
file.exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// True if the file exists and is NOT empty.
file.isEmptyFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!file.exists(filepath)) {return false;}
  filepath = file.readFileSync(filepath);
  return (filepath.length === 0 || filepath === '') ? true : false;
};

// True if the filepath is a directory.
file.isDir = function() {
  var filepath = path.join.apply(path, arguments);
  if (!fs.existsSync(filepath)) {return false;}
  return fs.statSync(filepath).isDirectory();
};

// True if the filepath is a file.
file.isFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!fs.existsSync(filepath)) {return false;}
  return fs.statSync(filepath).isFile();
};

// True if the filepath is a symbolic link.
file.isLink = function() {
  var filepath = path.join.apply(path, arguments);
  return file.exists(filepath) && fs.lstatSync(filepath).isSymbolicLink();
};



/**
 * Stats
 */

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
 * Read
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

// Read optional JSON
// Ben Alman, https://gist.github.com/2876125
file.readOptionalJSON = function(filepath) {
  var buffer = {};
  try {
    buffer = file.readJSONSync(filepath);
  } catch (e) {}
  return buffer;
};

file.readOptionalYAML = function(filepath) {
  var buffer = {};
  try {
    buffer = file.readYAMLSync(filepath);
  } catch (e) {}
  return buffer;
};

// Determine the reader based on extension.
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
 * Expand (globbing / minimatch)
 * Most of these methods are a thin wrapper around globule
 */

// Returns a unique array of all file or directory paths
// that match the given globbing pattern(s).
file.expand = function(patterns, options) {
  var opts = _.extend({}, options);
  return glob.find(patterns, opts);
};

// Given a set of source file paths, returns an array
// of src-dest file mapping objects. Example:
//   file.mapping(['a.js', 'b.js', 'c.js'])
file.mapping = function(filepaths, options) {
  var opts = _.extend({}, options);
  opts.srcBase = opts.cwd;
  return glob.findMapping(filepaths, opts);
};

// Returns a unique array of all directories that match
// the given globbing patterns.
file.expandMapping = function(patterns, options) {
  var opts = _.extend({}, options);
  opts.srcBase = opts.cwd;
  return glob.findMapping(patterns, opts);
};

// Match one or more globbing patterns against one
// or more file paths.
file.match = function(patterns, filepaths, options) {
  var opts = _.extend({}, options);
  return glob.match(patterns, filepaths, opts);
};

// Returns `true` if any files were matched
file.isMatch = function(patterns, filepaths, options) {
  var opts = _.extend({}, options);
  return glob.isMatch(patterns, filepaths, opts);
};

// Returns the resolved filepath for a specific file using
// globbing patterns. If multiple matches are found, only
// the first is returned
file.findFile = function(filepath, options) {
  var opts = _.extend({filter: 'isFile'}, options);
  var str = glob.find(filepath, opts)[0];
  return str ? String(path.resolve(str)) : null;
};

// Returns resolved dirpath for a specific directory using
// globbing patterns. If multiple matches are found, only
// the first direc returned
file.findDir = function(dir, options) {
  var opts = _.extend({filter: 'isDirectory'}, options);
  var str = glob.find(dir, opts)[0];
  return str ? String(path.resolve(str)) : null;
};

/**
 * Expand AND read JSON and YAML files.
 * @param  {String} filepath The filepath to read or string pattern to expand then read
 * @param  {Object} options  Object of options. 'namespace' will use the basename of
 *                           the source file as the name of the returned object
 * @return {Object}          Object of metadata
 */

// Should "expandData" actually read in the files,
// and "expandData" not? If so, we should deprecate
// the latter and make this change.
file.expandData = function (filepath, options) {
  var opts = _.extend({}, options);
  opts.data = opts.data || {};
  var contents;

  glob.find(filepath, opts).map(function (filepath) {
    var name = _path.basename(filepath);
    if (file.isEmptyFile(filepath)) {
      if(opts.verbose) {console.warn('Skipping empty file:'.yellow, filepath);}
    } else {
      try {
        // If it's a string, try to require it.
        contents = require(path.resolve(filepath));
      } catch(e) {
        // If that doesn't work, try to read it directly.
        contents = file.readDataSync(filepath);
      }
      // `namespace` merges the data from each file into an object
      // where the top-level property is the basename of the file itself
      if(opts.namespace === true) {
        // Extend the data into an object named for the file.
        opts.data[name] = _.cloneDeep(_.extend(opts.data, contents));
      } else if(opts.namespace === 'only') {
        opts.data[name] = _.cloneDeep(_.extend({}, opts.data, contents));
      } else {
        opts.data = _.extend(opts.data, contents);
      }
    }
  });
  return opts.data;
};
file.expandDataFiles = file.expandData;


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

// Make any dirs and intermediate dirs don't exist
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

// @example: file.writeDataSync('foo.yml', {foo: "bar"});
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
 * Copy files
 */

// Copy files synchronously and process any templates within
file.copyFileSync = function (src, dest, options) {
  var opts = _.extend({}, {process: true}, options || {});
  src = file.readFileSync(src);
  if(opts.process === true) {
    src = template.process(src, opts.data, opts);
  }
  file.writeFileSync(dest, src, opts);
};



/**
 * Remove directories
 */

// Asynchronously remove dirs and child dirs that exist
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

// Synchronously remove dirs and child dirs that exist
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



/**
 * Delete files
 */

/**
 * file.delete was sourced and modified from grunt.file
 * https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

// Delete folders and files recursively
file.delete = function(filepath, options) {
  var opts = _.extend({force: false}, options);
  filepath = String(filepath);

  if (!file.exists(filepath)) {
    console.warn('Cannot delete nonexistent file.');
    return false;
  }
  // Only delete cwd or outside cwd if options.force is true.
  if (!opts.force) {
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
  } catch(err) {
    var msg ='Unable to delete "' + filepath + '" file (' + err.message + ').';
    throw new Error(msg, err);
  }
};




/**
 * Path utils
 */


/**
 * Directory / Segments
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



/**
 * Path "endings"
 */

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

// Returns true if the filepath ends with the suffix
file.endsWith = function(filepath, suffix) {
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
    if(!file.hasExt(filepath)) {
      filepath += path.sep;
    }
  }
  return filepath;
};



/**
 * File name
 */

// Returns a filename
file.filename = function() {
  var filepath = path.join.apply(path, arguments);
  var re = /[\w.-]+$/;
  try {
    var test = re.exec(filepath)[0];
    return test;
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



/**
 * Basename
 */

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
// Alias
file.name = file.base;



/**
 * Extension
 */

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

// Returns true if the filepath has one of the given extensions
file.containsExt = function(filepath, ext) {
  ext = file.arrayify(ext);
  if(ext.length > 1) {
    ext = '?:' + ext.join('|');
  } else {
    ext = ext.join('');
  }
  return new RegExp('\\.('+ext+')$').test(filepath);
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

// Returns true if the filepath ends in a file with an extension
file.isModule = function() {
  var filepath = path.join.apply(path, arguments);
  if(file.ext(filepath) !== 'js' && file.base(filepath) !== 'index') {
    return false;
  }
  return filepath;
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
file.arePathsEquivalent = function(first) {
  first = path.resolve(first);
  for (var i = 1; i < arguments.length; i++) {
    if (first !== path.resolve(arguments[i])) { return false; }
  }
  return true;
};

// True if descendant path(s) contained within ancestor path.
// Note: does not test if paths actually exist.
file.doesPathContain = function(ancestor) {
  ancestor = path.resolve(ancestor);
  var relative;
  for (var i = 1; i < arguments.length; i++) {
    relative = path.relative(path.resolve(arguments[i]), ancestor);
    if (relative === '' || /\w+/.test(relative)) { return false; }
  }
  return true;
};

// True if a filepath is the CWD.
file.isPathCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.arePathsEquivalent(process.cwd(), fs.realpathSync(filepath));
  } catch(e) {
    return false;
  }
};

// True if a filepath is contained within the CWD.
file.isPathInCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.doesPathContain(process.cwd(), fs.realpathSync(filepath));
  } catch(e) {
    return false;
  }
};