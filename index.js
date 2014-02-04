/**
 * fs-utils
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// Node.js
var fs     = require('graceful-fs');
var path   = require('path');
var os     = require('os');

// node_modules
var paths  = require('path-utils');
var async  = require('async');
var rimraf = require('rimraf');
var glob   = require('globule');
var YAML   = require('js-yaml');
var _      = require('lodash');


/**
 * File utils
 */

// Export the `_fs` object
var _fs = module.exports = {};

// Build regex based on os EOL
_fs.EOLre = new RegExp(os.EOL, 'g');

// Normalize line endings
_fs.normalizeEOL = function(str) {
  return str.replace(/\r\n|\n/g, os.EOL);
};

// Normalize to newlines
_fs.normalizeNL = function(str) {
  return str.replace(/\r\n|\n/g, '\n');
};

_fs.arrayify = function(val) {
  return !Array.isArray(val) ? [val] : val;
};

// Default encoding
_fs.encoding = function(options) {
  options = options || {};
  return options.encoding || 'utf8';
};

_fs.preserveBOM = false;
_fs.stripBOM = function(str) {
  // Transform EOL
  var contents = (os.EOL === '\n') ? str : str.replace(_fs.EOLre, '\n');
  // Strip UTF BOM
  if (!_fs.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
    contents = contents.substring(1);
    contents = contents.replace(/^\uFEFF/, '');
  }
  return contents;
};


/**
 * Read
 */

// Read file synchronously
_fs.readFileSync = function(filepath, options) {
  options = options || {};
  var buffer = fs.readFileSync(String(filepath), _fs.encoding(options));
  try {
    return _fs.stripBOM(buffer);
  } catch (err) {
    err.message = 'Failed to read "' + filepath + '": ' + err.message;
    throw err;
  }
};

// Read JSON file synchronously and parse content as JSON
_fs.readJSONSync = function(filepath) {
  var buffer = _fs.readFileSync(filepath);
  try {
    return JSON.parse(buffer);
  } catch (err) {
    err.message = 'Failed to parse "' + filepath + '": ' + err.message;
    throw err;
  }
};

// Read YAML file synchronously and parse content as JSON
_fs.readYAMLSync = function(filepath) {
  var buffer = _fs.readFileSync(filepath);
  try {
    return YAML.load(buffer);
  } catch (err) {
    err.message = 'Failed to parse "' + filepath + '": ' + err.message;
    throw err;
  }
};

// Read optional JSON
// Ben Alman, https://gist.github.com/2876125
_fs.readOptionalJSON = function(filepath) {
  var buffer = {};
  try {
    buffer = _fs.readJSONSync(filepath);
  } catch (e) {}
  return buffer;
};

_fs.readOptionalYAML = function(filepath) {
  var buffer = {};
  try {
    buffer = _fs.readYAMLSync(filepath);
  } catch (e) {}
  return buffer;
};

// Determine the reader based on extension.
_fs.readDataSync = function(filepath, options) {
  options = options || {};
  var ext = path.extname(filepath);
  var reader = _fs.readJSONSync;
  switch(ext) {
    case '.json':
      reader = _fs.readJSONSync;
      break;
    case '.yml':
    case '.yaml':
      reader = _fs.readYAMLSync;
      break;
  }
  return reader(filepath, options);
};



/**
 * Expand (glob / minimatch)
 */

/**
 * @param  {String} filepath The filepath to read or string pattern to expand then read
 * @param  {Object} options  Object of options. 'namespace' will use the basename of
 *                           the source file as the name of the returned object
 * @return {Object}          Object of metadata
 */
_fs.expandDataFiles = function (filepath, options) {
  var opts = _.extend({}, options);
  opts.data = opts.data || {};
  var contents;

  glob.find(filepath, opts).map(function (fp) {
    var name = paths.basename(fp);
    if (_fs.isEmptyFile(fp)) {
      if(opts.verbose) {console.warn('Skipping empty file:'.yellow, fp);}
    } else {
      try {
        // If it's a string, try to require it.
        contents = require(fp);
      } catch(e) {
        // If it can't be required, try to read it directly.
        contents = _fs.readDataSync(fp);
      }
      if(opts.namespace === true) {
        // Extend the data into an object named for the _fs.
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



/**
 * fs stats
 */

_fs.getStatsSync = function (filepath) {
  try {
    return fs.statSync(filepath);
  } catch (err) {
    err.message = 'Failed to retrieve "' + filepath + '" stats: ' + err.message;
    throw err;
  }
};

_fs.getStats = function (filepath, callback) {
  try {
    return fs.stat(filepath, callback);
  } catch (err) {
    err.message = 'Failed to retrieve "' + filepath + '" stats: ' + err.message;
    return callback(err, null);
  }
};

// Retrieve a specific file using globbing patterns. If
// multiple matches are found, only the first is returned
_fs.getFile = function(filepath, options) {
  var str = glob.find(filepath, options)[0];
  return str ? String(str) : null;
};



/**
 * Make directories
 */

_fs.mkdir = function (dest, callback) {
  var destpath = path.dirname(dest);
  fs.exists(destpath, function (exist) {
    if (exist) {
      fs.mkdir(dest, callback);
    } else {
      _fs.mkdir(destpath, function () {
        fs.mkdir(dest, callback);
      });
    }
  });
};

// Make any directories and intermediate directories that
// don't already exist
_fs.mkdirSync = function (dirpath, mode) {
  mode = mode || parseInt('0777', 8) & (~process.umask());
  if (!fs.existsSync(dirpath)) {
    var parentDir = path.dirname(dirpath);
    if (fs.existsSync(parentDir)) {
      fs.mkdirSync(dirpath, mode);
    } else {
      _fs.mkdirSync(parentDir);
      fs.mkdirSync(dirpath, mode);
    }
  }
};

// Testing out the `mkdirp` lib as an alternative to
// built-in mkdir functions.
_fs.mkdirp = function (dir) {
  require('mkdirp')(dir, function (err) {
    if (err) {console.error(err); }
  });
};
_fs.mkdirpSync = function (dir) {
  require('mkdirp').sync(dir);
};



/**
 * Write
 */

_fs.writeFile = function (dest, content, callback) {
  var destpath = path.dirname(dest);
  fs.exists(destpath, function (exists) {
    if (exists) {
      fs.writeFile(dest, content, callback);
    } else {
      _fs.mkdir(destpath, function () {
        fs.writeFile(dest, content, callback);
      });
    }
  });
};

// Write files to disk, synchronously
_fs.writeFileSync = function(dest, content, options) {
  options = options || {};
  var dirpath = path.dirname(dest);
  if (!_fs.exists(dirpath)) {
    _fs.mkdirSync(dirpath);
  }
  fs.writeFileSync(dest, content, _fs.encoding(options));
};

_fs.writeJSONSync = function(dest, content, options) {
  options = options || {};
  options.indent = options.indent || 2;
  content = JSON.stringify(content, null, options.indent);
  _fs.writeFileSync(dest, content);
};

_fs.writeYAMLSync = function(dest, content, options) {
  options = options || {};
  options.indent = options.indent || 2;
  content = YAML.dump(content, null, options.indent);
  _fs.writeFileSync(dest, content);
};

// @example: _fs.writeDataSync('foo.yml', {foo: "bar"});
_fs.writeDataSync = function(dest, content, options) {
  options = options || {};
  var ext = options.ext || path.extname(dest);
  var writer = _fs.writeJSONSync;
  switch(ext) {
    case '.json':
      writer = _fs.writeJSONSync;
      break;
    case '.yml':
    case '.yaml':
      writer = _fs.writeYAMLSync;
      break;
  }
  return writer(dest, content, options);
};



/**
 * Copy
 */

// Copy files synchronously and process any templates within
_fs.copyFileSync = function (src, dest, options) {
  var opts = _.extend({}, {process: true}, options || {});
  src = _fs.readFileSync(src);
  if(opts.process === true) {
    src = template.process(src, opts.data, opts);
  }
  _fs.writeFileSync(dest, src, opts);
};



/**
 * Remove
 */

// Remove any directories and child directories that exist
_fs.rmdirSync = function () {
  var dirpath = path.join.apply(path, arguments);
  if (fs.existsSync(dirpath)) {
    var files = fs.readdirSync(dirpath);
    for (var i = 0, l = files.length; i < l; i++) {
      var filepath = path.join(dirpath, files[i]);
      if (filepath === "." || filepath === "..") {
        continue;
      } else if (fs.statSync(filepath).isDirectory()) {
        _fs.rmdirSync(filepath);
      } else {
        fs.unlinkSync(filepath);
      }
    }
    fs.rmdirSync(dirpath);
  }
};

// _fs.delete was sourced and modified from grunt.file
// https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
// https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
//
// Delete folders and files recursively
_fs.delete = function(filepath, options) {
  filepath = String(filepath);
  options = options || {};

  if (!_fs.exists(filepath)) {
    console.warn('Cannot delete nonexistent file.');
    return false;
  }
  // Only delete cwd or outside cwd if --force enabled. Be careful, people!
  if (!options.force) {
    if (paths.isPathCwd(filepath)) {
      console.warn('Cannot delete the current working directory.');
      return false;
    } else if (!paths.isPathInCwd(filepath)) {
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

_fs.rmdir = function (dirpath, callback) {
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
_fs.exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// If the file actually exists, does it have any content?
_fs.isEmptyFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!_fs.exists(filepath)) {return false;}
  filepath = _fs.readFileSync(filepath);
  return (filepath.length === 0 || filepath === '') ? true : false;
};

// Is the path a directory?
_fs.isDir = function() {
  var filepath = path.join.apply(path, arguments);
  if (!fs.existsSync(filepath)) {return false;}
  return fs.statSync(filepath).isDirectory();
};

// Is the path a file?
_fs.isFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!fs.existsSync(filepath)) {return false;}
  return fs.statSync(filepath).isFile();
};
