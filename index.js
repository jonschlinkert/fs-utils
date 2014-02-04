/**
 * fs-utils
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// Node.js
var fs   = require('graceful-fs');
var path = require('path');
var os   = require('os');

// node_modules
var paths = require('path-utils');
var async     = require('async');
var rimraf    = require('rimraf');
var glob      = require('globule');
var YAML      = require('js-yaml');
var _         = require('lodash');

// Export the `file` object
var file = module.exports = {};

// Build regex based on os EOL
file.EOLre = new RegExp(os.EOL, 'g');

// Normalize line endings
file.normalizeEOL = function(str) {
  return str.replace(/\r\n|\n/g, os.EOL);
};

// Normalize to newlines
file.normalizeNL = function(str) {
  return str.replace(/\r\n|\n/g, '\n');
};

file.arrayify = function(val) {
  return !Array.isArray(val) ? [val] : val;
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


// Read optional JSON. Ben Alman, https://gist.github.com/2876125
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
  var opts = _.extend({}, options);
  opts.data = opts.data || {};
  var contents;

  glob.find(filepath, opts).map(function (fp) {
    var name = paths.basename(fp);
    if (file.isEmptyFile(fp)) {
      if(opts.verbose) {console.warn('Skipping empty file:'.yellow, fp);}
    } else {
      try {
        // If it's a string, try to require it.
        contents = require(fp);
      } catch(e) {
        // If it can't be required, try to read it directly.
        contents = file.readDataSync(fp);
      }
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

// Retrieve a specific file using globbing patterns. If
// multiple matches are found, only the first is returned
file.getFile = function(filepath, options) {
  var str = glob.find(filepath, options)[0];
  return str ? String(str) : null;
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

// If the file actually exists, does it have any content?
file.isEmptyFile = function() {
  var filepath = path.join.apply(path, arguments);
  if (!file.exists(filepath)) {return false;}
  filepath = file.readFileSync(filepath);
  return (filepath.length === 0 || filepath === '') ? true : false;
};

