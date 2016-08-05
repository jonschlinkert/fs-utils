/**
 * fs-utils <https://github.com/assemble/fs-utils>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
require('should');
var file = require('..');

describe('fs', function() {
  it('should read the file (async)', function(cb) {
    file.readFile('test/fixtures/test.txt', function(err, contents) {
      if (err) return cb(err);
      contents.should.eql('FILE CONTENTS!!!');
      cb();
    });
  });

  it('should read JSON (async)', function(cb) {
    file.readJSON('test/fixtures/test.json', function(err, contents) {
      if (err) return cb(err);
      contents.should.eql({foo: {bar: 'baz'} });
      cb();
    });
  });

  it('should read the yaml file (async)', function(cb) {
    file.readYAML('test/fixtures/test.yaml', function(err, contents) {
      if (err) return cb(err);
      contents.should.eql({foo: {bar: 'baz'}});
      cb();
    });
  });

  it('should read detect JSON extension automatically (async)', function(cb) {
    file.readData('test/fixtures/test.json', function(err, actual) {
      if (err) return cb(err);
      actual.should.eql({foo: {bar: 'baz'} });
      cb();
    });
  });

  it('should read the yaml file automatically (async)', function(cb) {
    file.readData('test/fixtures/test.yaml', function(err, actual) {
      if (err) return cb(err);
      actual.should.eql({foo: {bar: 'baz'}});
      cb();
    });
  });

  it('should make a directory, asynchronously', function(cb) {
    file.mkdir('test/actual/new/folder/async', function(err) {
      if (err) return cb(err);
      file.exists('test/actual/new/folder/async').should.be.true;
      cb();
    });
  });

  it('should remove a directory, asynchronously', function(cb) {
    var existingDir = ('test/actual/new/folder/async');
    file.rmdir(existingDir, function(err) {
      if (err) return cb(err);
      file.exists('test/actual/new/folder/async').should.be.false;
      cb();
    });
  });

  it('should write a file (async)', function(cb) {
    file.writeFile('test/actual/test.txt', 'FILE CONTENTS!!!', function() {
      file.readFile('test/actual/test.txt', function(err, actual) {
        file.del('test/actual/test.txt');
        if (err) return cb(err);
        actual.should.eql('FILE CONTENTS!!!');
        cb();
      });
    });
  });

  it('should write JSON (async)', function(cb) {
    var expected = {foo: {bar: 'baz'} };
    file.writeJSON('test/actual/test.json', expected, function() {
      file.readJSON('test/actual/test.json', function(err, actual) {
        file.del('test/actual/test.json');
        if (err) return cb(err);
        actual.should.eql(expected);
        cb();
      });
    });
  });

  it('should write the yaml file (async)', function(cb) {
    var expected = {foo: {bar: 'baz'}};
    file.writeYAML('test/actual/test.yaml', expected, function() {
      file.readYAML('test/actual/test.yaml', function(err, actual) {
        file.del('test/actual/test.yaml');
        if (err) return cb(err);
        actual.should.eql(expected);
        cb();
      });
    });
  });

  it('should write JSON automatically (async)', function(cb) {
    var expected = {foo: {bar: 'baz'} };
    file.writeData('test/actual/test.json', expected, function() {
      file.readData('test/actual/test.json', function(err, actual) {
        file.del('test/actual/test.json');
        if (err) return cb(err);
        actual.should.eql(expected);
        cb();
      });
    });
  });

  it('should write the yaml file automatically (async)', function(cb) {
    var expected = {foo: {bar: 'baz'}};
    file.writeData('test/actual/test.yaml', expected, function() {
      file.readData('test/actual/test.yaml', function(err, actual) {
        file.del('test/actual/test.yaml');
        if (err) return cb(err);
        actual.should.eql(expected);
        cb();
      });
    });
  });
});
