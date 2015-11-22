/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:1, maxdepth:1,
  maxstatements:6, maxcomplexity:2 */

/*global module, require, describe, it, expect, returnExports */

(function () {
    'use strict';

    var exports;
    if (typeof module === 'object' && module.exports) {
      exports = require('../../index.js');
    } else {
      exports = returnExports;
    }

    describe('error-x', function () {
        it('should not throw an error with bad arguments', function () {
            exports.create();
            exports.create(null);
            exports.create('');
            exports.create('NullError', null);
            exports.create('FnError', function () {});
        });
        it('should work with `Error`', function () {
            var MyError = exports.create('MyError', Error),
              error = new MyError('test');
            expect(MyError.prototype.constructor).toBe(MyError);
            expect(error instanceof Error).toBe(true);
            expect(error instanceof MyError).toBe(true);
        });
        it('environment supports all `Error` types', function () {
          var MyError = exports.create('MyError', SyntaxError),
            error = new MyError('test');
          expect(MyError.prototype.constructor).toBe(MyError);
          expect(error instanceof Error).toBe(true);
          expect(error instanceof MyError).toBe(true);
        });
        it('should have correct `name`', function () {
            expect(exports.create('MyError')('test').name).toBe('MyError');
        });
        it('should have correct `message`', function () {
            expect(exports.create('MyError')('test').message).toBe('test');
        });
        it('should have correct `toString`', function () {
            expect(/^MyError: test/.test(exports.create('MyError')('test').toString())).toBe(true);
        });
    });
}());
