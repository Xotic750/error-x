/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:1, maxdepth:2,
  maxstatements:11, maxcomplexity:3 */

/*global module, require, describe, it, expect, JSON:true, returnExports */

(function () {
  'use strict';

  var lib;
  if (typeof module === 'object' && module.exports) {
    require('es5-shim');
    if (typeof JSON === 'undefined') {
      JSON = {};
    }
    require('json3').runInContext(null, JSON);
    lib = require('../../index.js');
  } else {
    lib = returnExports;
  }

  describe('error-x', function () {
    it('should not throw an error with bad arguments', function () {
      lib.create();
      lib.create(undefined);
      lib.create(null);
      lib.create('');
      lib.create('NullError', null);
      lib.create('FnError', function () {});
    });
    it('should work with `Error`', function () {
      var MyError = lib.create('MyError', Error),
        error = new MyError('test');
      expect(MyError.prototype.constructor).toBe(MyError);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof MyError).toBe(true);
    });
    it('environment supports all `Error` types', function () {
      var MyError = lib.create('MyError', SyntaxError),
        error = new MyError('test');
      expect(MyError.prototype.constructor).toBe(MyError);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof MyError).toBe(true);
    });
    it('should have correct `name`', function () {
      expect(lib.create('MyError')('test').name).toBe('MyError');
    });
    it('should have correct `message`', function () {
      expect(lib.create('MyError')('test').message).toBe('test');
    });
    it('should have correct `toString`', function () {
      var s = lib.create('MyError')('test').toString().slice(0, 13);
      expect(s).toBe('MyError: test');
    });
  });
}());
