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
var path = require('path');
var file = require('../');
var cwd = require('cwd');

describe('path methods', function() {

  it('should normalize slash', function() {
    var expected = 'foo/bar/baz';
    var actual = file.normalizeSlash('foo\\bar/baz');
    expect(actual).to.eql(expected);
  });

  // 'foo/bar/baz/quux/file.ext' => 'file.ext'
	// 'foo/bar/baz/quux'          => 'quux'
	// 'foo/bar/baz/quux/'         => ''
	it('should return the last segment', function() {
	  
	  var expected = 'file.ext';
	  var actual = file.lastSegment('foo/bar/baz/quux/file.ext');
	  expect(actual).to.eql(expected);

	  expected = 'quux';
	  actual = file.lastSegment('foo/bar/baz/quux');
	  expect(actual).to.eql(expected);

	  expected = '';
	  actual = file.lastSegment('foo/bar/baz/quux/');
	  expect(actual).to.eql(expected);

	});

	it('should get the absolute cwd', function() {
	  var expected = file.normalizeSlash(cwd);
	  var actual = file.cwd();
	  expect(actual).to.eql(expected);
	});

	it('should get the absolute path relative to the cwd given the parameters', function() {
		var expected = file.normalizeSlash(path.join(cwd, 'first', 'second', 'third'));
	  var actual = file.cwd('first', 'second', 'third');
	  expect(actual).to.eql(expected);
	});

	it('should change the cwd', function() {
	  var expected = file.normalizeSlash(path.join(cwd, 'test', 'fixtures'));
	  file.setCWD('test', 'fixtures');
	  var actual = file.normalizeSlash(process.cwd());
	  expect(actual).to.eql(expected);

	  file.setCWD('..', '..');
	});

	it('should get the filename', function() {
	  var expected = 'file.json';
	  var actual = file.filename('path/to/file.json');
	  expect(actual).to.eql(expected);
	});

	it('should get the name', function() {
	  var expected = 'file.json';
	  var actual = file.name('path/to/file.json');
	  expect(actual).to.eql(expected);
	});

	it('should get the extension', function() {
	  var expected = '.json';
	  var actual = file.ext('path/to/file.json');
	  expect(actual).to.eql(expected);
	});

	it('should get the basename', function() {
	  var expected = 'file';
	  var actual = file.basename('path/to/file.json');
	  expect(actual).to.eql(expected);
	});

	it('should get the base without extension', function() {
	  var expected = 'file';
	  var actual = file.base('path/to/file.json');
	  expect(actual).to.eql(expected);
	});

	xit('should get the "rename"?', function() {
	  var expected = 'foo';
	  var actual = file.rename('path/to', 'file.json');
	  expect(actual).to.eql(expected);
	});



});