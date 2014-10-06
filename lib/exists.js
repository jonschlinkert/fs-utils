'use strict';

var fs = require('fs');

/**
 * Return `true` if the filepath actually
 * exists on the file system.
 */

module.exports = function exists(filepath) {
  return fs.existsSync(filepath);
};
