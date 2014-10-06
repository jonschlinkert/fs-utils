'use strict';

var path = require('path');
var dirname = require('./dirname');
var re = /[\\\/]/g;

module.exports = function last(fp, num) {
  var seg = dirname(fp).split(re);
  return seg.slice(-num).join('/');
};
