'use strict';

module.exports = function slashify(str) {
  return str.replace(/[\\\/]/g, '/');
};
