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
    var actual = file.readDataFile(testJsonPath);
    expect(actual).to.eql(expected);
  });

  it('should read the yaml file automatically', function() {
    var expected = testYamlContents;
    var actual = file.readDataFile(testYamlPath);
    expect(actual).to.eql(expected);
  });

  xit('should make a directory - async', function(done) {
  	var newFolder = path.join('test', 'actual', 'new', 'folder', 'async');
    file.mkdir(newFolder, function(err) {
    	if (err) return console.log(err);
	    var expected = file.exists(newFolder);
	    expect(expected).to.be.ok;
	    done();
    });
  });

  it('should make a directory - sync', function() {
  	var newFolder = path.join('test', 'actual', 'new', 'folder', 'sync');
  	file.mkdirSync(newFolder);
    var expected = file.exists(newFolder);
    expect(expected).to.be.ok;
  });

});