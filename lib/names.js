'use strict';

var name = require('./name');
var lookup = require('./lookup');

module.exports = function names(dir) {
  return lookup(dir).map(name);
};
