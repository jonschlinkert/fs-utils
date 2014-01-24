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

describe('file system methods', function () {

  var testTxtPath = path.join('test', 'fixtures', 'test.txt');
  var testTxtContents = 'FILE CONTENTS!!!';

  var testJsonPath = path.join('test', 'fixtures', 'test.json');
  var testJsonContents = {
    "foo": {
      "bar": "baz"
    }
  };

  var testYamlPath = path.join('test', 'fixtures', 'test.yaml');
  var testYamlContents = {
    "foo": {
      "bar": "baz"
    }
  };

  it('should return true the path exists', function () {
    var expected = true;
    var actual = file.exists(testTxtPath);
    expect(actual).to.eql(expected);
  });

  it('should return false the path does not exist', function () {
    var expected = false;
    var actual = file.exists('.', 'some', 'random', 'file.json');
    expect(actual).to.eql(expected);
  });

  it('should return true if a path is a real file', function() {
    var expected = true;
    var actual = file.isFile('package.json');
    expect(actual).to.eql(expected);

    expected = true;
    actual = file.isFile('README.md');
    expect(actual).to.eql(expected);
  });

  it('should return false if a path is not a real file', function() {
    var expected = false;
    var actual = file.isFile('test');
    expect(actual).to.eql(expected);
  });

  it('should return true if a path is a real directory', function() {
    var expected = true;
    var actual = file.isDir('test');
    expect(actual).to.eql(expected);
  });

  it('should return false if a path is not a real directory', function() {
    var expected = false;
    var actual = file.isDir('package.json');
    expect(actual).to.eql(expected);

    expected = false;
    actual = file.isDir('README.md');
    expect(actual).to.eql(expected);
  });

  it('should read the file', function () {
    var expected = testTxtContents;
    var actual = file.readFileSync(testTxtPath);
    expect(actual).to.eql(expected);
  });

  it('should read the json file', function() {
    var expected = testJsonContents;
    var actual = file.readJSONSync(testJsonPath);
    expect(actual).to.eql(expected);
  });

  it('should read the yaml file', function() {
    var expected = testYamlContents;
    var actual = file.readYAMLSync(testYamlPath);
    expect(actual).to.eql(expected);
  });

  it('should read the json file automatically', function() {
    var expected = testJsonContents;
    var actual = file.readDataSync(testJsonPath);
    expect(actual).to.eql(expected);
  });

  it('should read the yaml file automatically', function() {
    var expected = testYamlContents;
    var actual = file.readDataSync(testYamlPath);
    expect(actual).to.eql(expected);
  });

  it('should make a directory, asynchronously', function(done) {
    var newDir = ('test', 'actual', 'new', 'folder', 'async');
    file.mkdir(newDir, function(err) {
      if (err) return console.log(err);
      var expected = file.exists(newDir);
      expect(expected).to.be.ok;
      done();
    });
  });

  it('should make a directory, synchronously', function() {
    var newDir = ('test', 'actual', 'new', 'folder', 'sync');
    file.mkdirSync(newDir);
    var expected = file.exists(newDir);
    expect(expected).to.be.ok;
  });

  it('should remove a directory, asynchronously', function(done) {
  	var existingDir = ('test', 'actual', 'new', 'folder', 'async');
    file.rmdir(existingDir, function(err) {
    	if (err) return console.log(err);
	    var expected = !file.exists(existingDir);
	    expect(expected).to.be.ok;
	    done();
    });
  });

  it('should remove a directory, synchronously', function() {
    var existingDir = ('test', 'actual', 'new', 'folder', 'sync');
    file.rmdirSync(existingDir);
    var expected = !file.exists(existingDir);
    expect(expected).to.be.ok;
  });

  it('should "delete" a directory, synchronously', function() {
    var existingDir = ('test', 'actual', 'new', 'folder', 'sync');
    file.mkdirSync(existingDir);
    file.delete(existingDir);
    var expected = !file.exists(existingDir);
    expect(expected).to.be.ok;
  });

  it('should retrieve file stats, synchronously', function() {
    var stats = file.getStatsSync(testTxtPath);
    expect(stats).to.have.property('mtime');
  });

  it('should retrieve file stats, asynchronously', function(done) {
    file.getStats(testTxtPath, function (err, stats) {
      expect(stats).to.have.property('mtime');
      done();
    });
  });

  it('should throw error when attempting to retrieve stats, synchronously', function() {
    try {
      var stats = file.getStatsSync('some/fake/path/to/fake/file.html');
    } catch (err) {
      expect(err).not.to.be.null;
    }
  });

  it('should return error when attempting to retrieve stats, asynchronously', function(done) {
    file.getStats('some/fake/path/to/fake/file.html', function (err, stats) {
      expect(err).not.to.be.null;
      expect(stats).to.be.undefined;
      done();
    });
  });
});