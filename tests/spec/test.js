'use strict';

var lib;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  lib = require('../../index.js');
} else {
  lib = returnExports;
}

describe('error-x', function () {
  describe('standard error type', function () {
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
      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof MyError).toBe(true, 'instanceof MyError');
      expect(lib.isError(error)).toBe(true, 'isError');
    });

    it('environment supports all `Error` types', function () {
      var MyError = lib.create('MyError', SyntaxError),
        error = new MyError('test');
      expect(MyError.prototype.constructor).toBe(MyError);
      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof MyError).toBe(true, 'instanceof MyError');
      expect(lib.isError(error)).toBe(true, 'isError');
    });

    it('can be sub-classed', function () {
      var MyError = lib.create('MyError', Error),
        MySubError = lib.create('MySubError', MyError),
        error = new MySubError('test');
      expect(MySubError.prototype.constructor).toBe(MySubError);
      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof MyError).toBe(true, 'instanceof MyError');
      expect(error instanceof MySubError).toBe(true, 'instanceof MySubError');
      expect(lib.isError(error)).toBe(true, 'isError');
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

  describe('AssertionError type', function () {
    it('messages', function () {
      var circular = { y: 1 };
      circular.x = circular;

      var testAssertionMessage = function (actual, expected) {
        try {
          throw new lib.AssertionError({
            actual: actual,
            expected: '',
            operator: '=='
          });
        } catch (e) {
          expect(lib.isError(e)).toBe(true, 'isError');
          expect(e.toString())
            .toBe('AssertionError: ' + expected + ' == \'\'');
          expect(e.generatedMessage)
            .toBe(true, 'Message not marked as generated');
        }
      };

      testAssertionMessage(undefined, 'undefined');
      testAssertionMessage(null, 'null');
      testAssertionMessage(true, 'true');
      testAssertionMessage(false, 'false');
      testAssertionMessage(0, '0');
      testAssertionMessage(100, '100');
      testAssertionMessage(NaN, 'NaN');
      testAssertionMessage(Infinity, 'Infinity');
      testAssertionMessage(-Infinity, '-Infinity');
      testAssertionMessage('', '\'\'');
      testAssertionMessage('foo', '\'foo\'');
      testAssertionMessage([], '[]');
      testAssertionMessage([
        1,
        2,
        3
      ], '[ 1, 2, 3 ]');
      testAssertionMessage(/a/, '/a/');
      testAssertionMessage(/abc/gim, '/abc/gim');
      testAssertionMessage(function f() {}, '[Function: f]');
      testAssertionMessage(function () {}, '[Function]');
      testAssertionMessage({}, '{}');
      testAssertionMessage(circular, '{ y: 1, x: [Circular] }');
      testAssertionMessage({
        a: undefined,
        b: null
      }, '{ a: undefined, b: null }');
      testAssertionMessage({
        a: NaN,
        b: Infinity,
        c: -Infinity
      },
      '{ a: NaN, b: Infinity, c: -Infinity }');
    });

    it('can be sub-classed', function () {
      var AE = lib.create('MyAssertionError', lib.AssertionError),
        error = new AE({});

      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof lib.AssertionError)
        .toBe(true, 'instanceof lib.AssertionError');
      expect(lib.isError(error)).toBe(true, 'isError');

      var circular = { y: 1 };
      circular.x = circular;

      var testAssertionMessage = function (actual, expected) {
        try {
          throw new AE({
            actual: actual,
            expected: '',
            operator: '=='
          });
        } catch (e) {
          expect(lib.isError(e)).toBe(true, 'isError');
          expect(e.toString())
            .toBe('MyAssertionError: ' + expected + ' == \'\'');
          expect(e.generatedMessage)
            .toBe(true, 'Message not marked as generated');
        }
      };

      testAssertionMessage(undefined, 'undefined');
      testAssertionMessage(null, 'null');
      testAssertionMessage(true, 'true');
      testAssertionMessage(false, 'false');
      testAssertionMessage(0, '0');
      testAssertionMessage(100, '100');
      testAssertionMessage(NaN, 'NaN');
      testAssertionMessage(Infinity, 'Infinity');
      testAssertionMessage(-Infinity, '-Infinity');
      testAssertionMessage('', '\'\'');
      testAssertionMessage('foo', '\'foo\'');
      testAssertionMessage([], '[]');
      testAssertionMessage([
        1,
        2,
        3
      ], '[ 1, 2, 3 ]');
      testAssertionMessage(/a/, '/a/');
      testAssertionMessage(/abc/gim, '/abc/gim');
      testAssertionMessage(function f() {}, '[Function: f]');
      testAssertionMessage(function () {}, '[Function]');
      testAssertionMessage({}, '{}');
      testAssertionMessage(circular, '{ y: 1, x: [Circular] }');
      testAssertionMessage({
        a: undefined,
        b: null
      }, '{ a: undefined, b: null }');
      testAssertionMessage({
        a: NaN,
        b: Infinity,
        c: -Infinity
      },
      '{ a: NaN, b: Infinity, c: -Infinity }');
    });
  });
});
