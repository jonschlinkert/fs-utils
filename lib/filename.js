'use strict';

var re = /([\w\.\-]+)$/i;

module.exports = function filename(fp) {
  var name = re.exec(fp);
  return name ? name[1] : '';
};