'use strict';

var re = /([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g;

module.exports = function hyphenate(str) {
  return str.replace(re, function(str, a, b) {
    return a + '-' + b;
  }).toLowerCase();
};
