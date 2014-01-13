/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Upstage.
 * Licensed under the MIT License (MIT).
 */

var expect = require('chai').expect;
var file = require('../');

describe('path methods', function() {

  it('should normalize slash', function() {
    var expected = 'foo/bar/baz';
    var actual = file.normalizeSlash('foo\\bar/baz');
    expect(actual).to.eql(expected);
  });

});