/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Upstage.
 * Licensed under the MIT License (MIT).
 */

var expect    = require('chai').expect;
var pathUtils = require('../');
var path      = require('path');
var cwd       = process.cwd();

// Normalize slashes in some test results
var normalize = pathUtils.normalizeSlash;

describe('Normalize slashes', function() {
  it('should normalize slash', function() {
    var expected = 'foo/bar/baz';
    var actual = pathUtils.normalizeSlash('foo\\bar/baz');
    expect(actual).to.eql(expected);

    expected = '/foo/bar/baz/';
    actual = pathUtils.normalizeSlash('\\foo\\bar\\baz\\');
    expect(actual).to.eql(expected);
  });
});

describe('Trailing slashes', function() {
  describe('Add trailing slashes', function() {
    it('should add a trailing slash when it appears to be a directory', function() {
      var expected = 'foo/bar/baz/';
      var actual = pathUtils.addTrailingSlash('foo/bar/baz');
      expect(normalize(actual)).to.eql(expected);

      expected = '/foo/bar/baz/';
      actual = pathUtils.addTrailingSlash('/foo/bar/baz');
      expect(normalize(actual)).to.eql(expected);

      expected = 'foo/bar.baz/quux/';
      actual = pathUtils.addTrailingSlash('./foo/bar.baz/quux');
      expect(normalize(actual)).to.eql(expected);

      expected = 'foo/bar/baz/';
      actual = pathUtils.addTrailingSlash('./foo/bar/baz');
      expect(normalize(actual)).to.eql(expected);

      expected = '/foo/bar/baz/';
      actual = pathUtils.addTrailingSlash('\\foo\\bar\\baz');
      expect(normalize(actual)).to.eql(expected);

      expected = 'foo/bar/baz/';
      actual = pathUtils.addTrailingSlash('foo\\bar\\baz');
      expect(normalize(actual)).to.eql(expected);
    });

    it('should not add a trailing slash when it already has one', function() {
      var expected = 'foo/bar/baz/';
      var actual = pathUtils.addTrailingSlash('foo/bar/baz/');
      expect(normalize(actual)).to.eql(expected);

      expected = '/foo/bar/baz/';
      actual = pathUtils.addTrailingSlash('/foo/bar/baz/');
      expect(normalize(actual)).to.eql(expected);
    });

    it('should not add a trailing slash when it appears to be a file', function() {
      var expected = 'foo/bar/baz.md';
      var actual = pathUtils.addTrailingSlash('./foo/bar/baz.md');
      expect(normalize(actual)).to.eql(expected);

      expected = '/foo/bar/baz.md';
      actual = pathUtils.addTrailingSlash('/foo/bar/baz.md');
      expect(normalize(actual)).to.eql(expected);

      expected = '/foo/bar/baz.md';
      actual = pathUtils.addTrailingSlash('\\foo\\bar\\baz.md');
      expect(normalize(actual)).to.eql(expected);
    });
  });

  describe('Remove trailing slashes', function() {
    it('should remove a trailing slash from the given file path', function() {
      var expected = 'one/two';
      var actual = pathUtils.removeTrailingSlash('./one/two/');
      expect(normalize(actual)).to.eql(expected);

      expected = '/three/four/five';
      actual = pathUtils.removeTrailingSlash('/three/four/five/');
      expect(normalize(actual)).to.eql(expected);

      expected = '/six/seven/eight';
      actual = pathUtils.removeTrailingSlash('\\six\\seven\\eight\\');
      expect(normalize(actual)).to.eql(expected);
    });
  });
});


describe('endsWith', function() {
  it('should return true if the path ends with the given string', function() {
    var expected = true;
    var actual = pathUtils.endsWith('foo\\bar\\baz\\', '/');
    expect(actual).to.eql(expected);

    expected = true;
    actual = pathUtils.endsWith('foo\\bar\\baz\\', '\\');
    expect(actual).to.eql(expected);

    expected = true;
    actual = pathUtils.endsWith('foo/bar/baz/', '/');
    expect(actual).to.eql(expected);

    expected = true;
    actual = pathUtils.endsWith('foo\\bar\\baz.md', 'baz.md');
    expect(actual).to.eql(expected);

    expected = true;
    actual = pathUtils.endsWith('foo\\bar\\baz.md', '.md');
    expect(actual).to.eql(expected);
  });

  it('should return false if the path does not end with the given string', function() {
    var expected = false;
    var actual = pathUtils.endsWith('foo\\bar\\baz.md', '/');
    expect(actual).to.eql(expected);

    expected = false;
    actual = pathUtils.endsWith('foo\\bar\\baz.md', 'baz');
    expect(actual).to.eql(expected);
  });
});

describe('lastExt', function() {
  it('should return the last file extension', function() {
    var expected = 'md';
    var actual = pathUtils.lastExt('foo/bar/baz/quux.bar/file.tmpl.md');
    expect(actual).to.eql(expected);

    expected = 'md';
    actual = pathUtils.lastExt('./foo/bar/baz/quux.bar/file.tmpl.md');
    expect(actual).to.eql(expected);

    expected = '';
    actual = pathUtils.lastExt('foo/bar/baz/quux.bar/CHANGELOG');
    expect(actual).to.eql(expected);

    expected = 'gitignore';
    actual = pathUtils.lastExt('/foo/bar/baz/quux.bar/.gitignore');
    expect(actual).to.eql(expected);

    expected = 'html';
    actual = pathUtils.lastExt('./foo/bar/baz/quux/index.html');
    expect(actual).to.eql(expected);
  });
});


describe('withExt', function() {
  it('should return files from specified directory that end with the given file extension.', function() {
    var expected = ['test.txt'];
    var actual = pathUtils.withExt('./test/fixtures', 'txt');
    expect(actual).to.eql(expected);

    expected = ['fs-tests.js', 'path-tests.js'];
    actual = pathUtils.withExt('./test', 'js');
    expect(actual).to.eql(expected);
  });
});


describe('firstSegment', function() {
  it('should return the first segment in the given file path', function() {
    var expected = 'apple';
    var actual = pathUtils.firstSegment('apple/orange/file.ext');
    expect(actual).to.eql(expected);

    expected = 'grape';
    actual = pathUtils.firstSegment('/grape/watermelon/quux');
    expect(actual).to.eql(expected);

    expected = 'banana';
    actual = pathUtils.firstSegment('./banana/strawberry/quux/');
    expect(actual).to.eql(expected);
  });
});

describe('lastSegment', function() {
  it('should return the last segment in the given file path', function() {
    var expected = 'file.ext';
    var actual = pathUtils.lastSegment('square/rectangle/file.ext');
    expect(actual).to.eql(expected);

    expected = 'four';
    actual = pathUtils.lastSegment('one/two/three/four');
    expect(actual).to.eql(expected);

    expected = 'grape';
    actual = pathUtils.lastSegment('apple/orange/grape/');
    expect(actual).to.eql(expected);
  });
});

describe('removeFilename', function() {
  it('should remove the filename from the given file path', function() {
    var expected = 'square/rectangle/';
    var actual = pathUtils.removeFilename('square/rectangle/file.ext');
    expect(normalize(actual)).to.eql(expected);

    expected = 'one/two/three/four';
    actual = pathUtils.removeFilename('one/two/three/four');
    expect(normalize(actual)).to.eql(expected);

    expected = 'apple/orange/grape/';
    actual = pathUtils.removeFilename('apple/orange/grape/');
    expect(normalize(actual)).to.eql(expected);
  });
});

describe('dirname', function() {

  it('should return the dirname in the given file path', function() {
    var expected = 'square/rectangle/';
    var actual = pathUtils.dirname('square/rectangle/file.ext');
    expect(normalize(actual)).to.eql(expected);

    expected = 'one/two/three/';
    actual = pathUtils.dirname('one/two/three/four');
    expect(normalize(actual)).to.eql(expected);

    expected = 'apple/orange/grape/';
    actual = pathUtils.dirname('apple/orange/grape/');
    expect(normalize(actual)).to.eql(expected);
  });

  it('should return the directory in the given file path, including filenames that do not have an extensions.', function() {
    var expected = 'square/rectangle/';
    var actual = pathUtils.dir('square/rectangle/file.ext');
    expect(normalize(actual)).to.eql(expected);

    expected = 'one/two/three/four';
    actual = pathUtils.dir('one/two/three/four');
    expect(normalize(actual)).to.eql(expected);

    expected = 'one/two/three/CHANGELOG';
    actual = pathUtils.dir('one/two/three/CHANGELOG');
    expect(normalize(actual)).to.eql(expected);

    expected = 'apple/orange/grape/';
    actual = pathUtils.dir('./apple/orange/grape/');
    expect(normalize(actual)).to.eql(expected);
  });
});


describe('firstDir', function() {
  it('should return the first directory in the given file path (alias for firstSegment)', function() {
    var expected = 'apple';
    var actual = pathUtils.firstDir('apple/orange/file.ext');
    expect(actual).to.eql(expected);

    expected = 'grape';
    actual = pathUtils.firstDir('/grape/watermelon/quux');
    expect(actual).to.eql(expected);

    expected = 'banana';
    actual = pathUtils.firstDir('./banana/strawberry/quux/');
    expect(actual).to.eql(expected);
  });
});


describe('lastDir', function() {
  it('should return the last dirname in the given file path', function() {
    var expected = 'rectangle';
    var actual = pathUtils.lastDir('square/rectangle/file.ext');
    expect(normalize(actual)).to.eql(expected);

    expected = 'four';
    actual = pathUtils.lastDir('one/two/three/four');
    expect(normalize(actual)).to.eql(expected);

    expected = 'grape';
    actual = pathUtils.lastDir('apple/orange/grape/');
    expect(normalize(actual)).to.eql(expected);
  });
});


describe('lastChar:', function() {
  it('should return the last character in the given file path', function() {
    var expected = 't';
    var actual = pathUtils.lastChar('foo/bar/baz/quux/file.ext');
    expect(actual).to.eql(expected);

    expected = 'x';
    actual = pathUtils.lastChar('foo/bar/baz/quux');
    expect(actual).to.eql(expected);

    expected = '/';
    actual = pathUtils.lastChar('foo/bar/baz/quux/');
    expect(actual).to.eql(expected);
  });
});


describe('path.basename:', function () {
  it('should get the basename using the Node.js path module', function () {
    var expected = 'file.json';
    var actual = path.basename('path/to/file.json');
    expect(actual).to.eql(expected);

    expected = 'file.tmpl.md';
    actual = path.basename('path/to/file.tmpl.md');
    expect(actual).to.eql(expected);

    expected = 'file';
    actual = path.basename('path/to/file');
    expect(actual).to.eql(expected);

    expected = 'baz.quux';
    actual = path.basename('.foo.bar/baz.quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux.';
    actual = path.basename('.foo.bar/baz.quux.');
    expect(actual).to.eql(expected);

    expected = '.html';
    actual = path.basename('.html');
    expect(actual).to.eql(expected);

    expected = 'foo.bar.baz.quux';
    actual = path.basename('/foo.bar.baz.quux');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('/foo/bar/baz/asdf/quux');
    expect(actual).to.eql(expected);

    expected = 'quux.html';
    actual = path.basename('/foo/bar/baz/asdf/quux.html');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('/foo/bar/baz/quux');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('/foo/bar/baz/quux/');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('/quux');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('/quux/');
    expect(actual).to.eql(expected);

    expected = 'foo.bar.baz.quux';
    actual = path.basename('foo.bar.baz.quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux';
    actual = path.basename('foo.bar/baz.quux');
    expect(actual).to.eql(expected);

    expected = 'bar.baz.quux';
    actual = path.basename('foo/bar.baz.quux');
    expect(actual).to.eql(expected);

    expected = 'bar.baz.quux';
    actual = path.basename('foo/bar.baz.quux/');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('foo/bar.baz/quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux';
    actual = path.basename('foo/bar/baz.quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux.';
    actual = path.basename('foo/bar/baz.quux.');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('foo/bar/baz/quux');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('foo/bar/baz/quux/');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('foo\\bar\\baz\\quux\\');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = path.basename('quux/');
    expect(actual).to.eql(expected);
  });


  it('should return the name of a file, exluding directories from the result', function () {
    var expected = 'file.json';
    var actual = pathUtils.filename('path/to/file.json');
    expect(actual).to.eql(expected);

    expected = 'file.tmpl.md';
    actual = pathUtils.filename('path/to/file.tmpl.md');
    expect(actual).to.eql(expected);

    expected = 'file';
    actual = pathUtils.filename('path/to/file');
    expect(actual).to.eql(expected);

    expected = 'baz.quux';
    actual = pathUtils.filename('.foo.bar/baz.quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux.';
    actual = pathUtils.filename('.foo.bar/baz.quux.');
    expect(actual).to.eql(expected);

    expected = '.html';
    actual = pathUtils.filename('.html');
    expect(actual).to.eql(expected);

    expected = 'foo.bar.baz.quux';
    actual = pathUtils.filename('/foo.bar.baz.quux');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = pathUtils.filename('/foo/bar/baz/asdf/quux');
    expect(actual).to.eql(expected);

    expected = 'quux.html';
    actual = pathUtils.filename('/foo/bar/baz/asdf/quux.html');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = pathUtils.filename('/foo/bar/baz/quux');
    expect(actual).to.eql(expected);

    // Different result than path.basename
    expected = '';
    actual = pathUtils.filename('/foo/bar/baz/quux/');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = pathUtils.filename('/quux');
    expect(actual).to.eql(expected);

    // Different result than path.basename
    expected = '';
    actual = pathUtils.filename('/quux/');
    expect(actual).to.eql(expected);

    expected = 'foo.bar.baz.quux';
    actual = pathUtils.filename('foo.bar.baz.quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux';
    actual = pathUtils.filename('foo.bar/baz.quux');
    expect(actual).to.eql(expected);

    expected = 'bar.baz.quux';
    actual = pathUtils.filename('foo/bar.baz.quux');
    expect(actual).to.eql(expected);

    // Different result than path.basename
    expected = '';
    actual = pathUtils.filename('foo/bar.baz.quux/');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = pathUtils.filename('foo/bar.baz/quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux';
    actual = pathUtils.filename('foo/bar/baz.quux');
    expect(actual).to.eql(expected);

    expected = 'baz.quux.';
    actual = pathUtils.filename('foo/bar/baz.quux.');
    expect(actual).to.eql(expected);

    expected = 'quux';
    actual = pathUtils.filename('foo/bar/baz/quux');
    expect(actual).to.eql(expected);

    // Different result than path.basename
    expected = '';
    actual = pathUtils.filename('foo/bar/baz/quux/');
    expect(actual).to.eql(expected);

    // Different result than path.basename
    expected = '';
    actual = pathUtils.filename('foo\\bar\\baz\\quux\\');
    expect(actual).to.eql(expected);

    // Different result than path.basename
    expected = '';
    actual = pathUtils.filename('quux/');
    expect(actual).to.eql(expected);
  });
});

describe('File name:', function() {
  it('should get the extension', function() {
    var expected = 'file.json';
    var actual = pathUtils.filename('path/to/file.json');
    expect(actual).to.eql(expected);
  });
});

describe('file extension:', function() {
  it('should get the extension', function() {
    var expected = 'json';
    var actual = pathUtils.ext('path/to/file.json');
    expect(actual).to.eql(expected);
  });

  it('should get the basename', function() {
    var expected = 'file';
    var actual = pathUtils.basename('path/to/file.json');
    expect(actual).to.eql(expected);
  });

  it('should get the base without extension', function() {
    var expected = 'file';
    var actual = pathUtils.base('path/to/file.json');
    expect(actual).to.eql(expected);
  });
});

describe('cwd:', function() {

	it('should get the absolute cwd', function() {
	  var expected = pathUtils.normalizeSlash(cwd);
	  var actual = pathUtils.cwd();
	  expect(actual).to.eql(expected);
	});

	it('should get the absolute path relative to the cwd given the parameters', function() {
		var expected = pathUtils.normalizeSlash(path.join(cwd, 'first', 'second', 'third'));
	  var actual = pathUtils.cwd('first', 'second', 'third');
	  expect(actual).to.eql(expected);
	});

	it('should change the cwd', function() {
	  var expected = pathUtils.normalizeSlash(path.join(cwd, 'test', 'fixtures'));
	  pathUtils.setCWD('test', 'fixtures');
	  var actual = pathUtils.normalizeSlash(process.cwd());
	  expect(actual).to.eql(expected);

	  pathUtils.setCWD('..', '..');
	});
});