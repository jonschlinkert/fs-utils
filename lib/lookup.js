'use strict';

var fs = require('fs');
var path = require('path');
var isFile = require('./is-file');
var isDir = require('./is-dir');

module.exports = function lookup(dir, re) {
  if (isFile(dir)) return dir;

  return fs.readdirSync(dir)
    .reduce(function (acc, fp) {
      fp = path.join(dir, fp);

      if (isDir(fp)) {
        acc = acc.concat(lookup(fp, re));
      } else {
        acc = acc.concat(fp);
      }
    return acc;
  }, []);
};
