import * as lib from '../src/error-x';

describe('error-x', function() {
  describe('standard error type', function() {
    it('should not throw an error with bad arguments', function() {
      expect.assertions(1);
      lib.create();
      lib.create(undefined);
      lib.create(null);
      lib.create('');
      lib.create('NullError', null);
      lib.create('FnError', function() {});
      expect(true).toBe(true);
    });

    it('should work with `Error`', function() {
      expect.assertions(4);
      const MyError = lib.create('MyError', Error);
      const error = new MyError('test');
      expect(MyError.prototype.constructor).toBe(MyError);
      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof MyError).toBe(true, 'instanceof MyError');
      expect(lib.isError(error)).toBe(true, 'isError');
    });

    it('environment supports all `Error` types', function() {
      expect.assertions(4);
      const MyError = lib.create('MyError', SyntaxError);
      const error = new MyError('test');
      expect(MyError.prototype.constructor).toBe(MyError);
      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof MyError).toBe(true, 'instanceof MyError');
      expect(lib.isError(error)).toBe(true, 'isError');
    });

    it('can be sub-classed', function() {
      expect.assertions(5);
      const MyError = lib.create('MyError', Error);
      const MySubError = lib.create('MySubError', MyError);
      const error = new MySubError('test');
      expect(MySubError.prototype.constructor).toBe(MySubError);
      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof MyError).toBe(true, 'instanceof MyError');
      expect(error instanceof MySubError).toBe(true, 'instanceof MySubError');
      expect(lib.isError(error)).toBe(true, 'isError');
    });

    it('should have correct `name`', function() {
      expect.assertions(1);
      expect(lib.create('MyError')('test').name).toBe('MyError');
    });

    it('should have correct `message`', function() {
      expect.assertions(1);
      expect(lib.create('MyError')('test').message).toBe('test');
    });

    it('should have correct `toString`', function() {
      expect.assertions(1);
      const s = lib
        .create('MyError')('test')
        .toString()
        .slice(0, 13);
      expect(s).toBe('MyError: test');
    });
  });

  describe('assertionError type', function() {
    it('messages', function() {
      expect.assertions(63);
      const circular = {y: 1};
      circular.x = circular;

      const testAssertionMessage = function(actual, expected) {
        try {
          throw new lib.AssertionErrorConstructor({
            actual,
            expected: '',
            operator: '==',
          });
        } catch (e) {
          expect(lib.isError(e)).toBe(true, 'isError');
          expect(e.toString()).toBe(`AssertionError [${e.code}]: ${expected} == ''`);
          expect(e.generatedMessage).toBe(true, 'Message not marked as generated');
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
      testAssertionMessage('', "''");
      testAssertionMessage('foo', "'foo'");
      testAssertionMessage([], '[]');
      testAssertionMessage([1, 2, 3], '[ 1, 2, 3 ]');
      testAssertionMessage(/a/, '/a/');
      testAssertionMessage(/abc/gim, '/abc/gim');
      testAssertionMessage(function f() {}, '[Function: f]');
      testAssertionMessage(function() {}, '[Function]');
      testAssertionMessage({}, '{}');
      testAssertionMessage(circular, '{ y: 1, x: [Circular] }');
      testAssertionMessage(
        {
          a: undefined,
          b: null,
        },
        '{ a: undefined, b: null }',
      );
      testAssertionMessage(
        {
          a: NaN,
          b: Infinity,
          c: -Infinity,
        },
        '{ a: NaN, b: Infinity, c: -Infinity }',
      );
    });

    it('can be sub-classed', function() {
      expect.assertions(66);
      const AE = lib.create('MyAssertionError', lib.AssertionErrorConstructor);
      const error = new AE({});

      expect(error instanceof Error).toBe(true, 'instanceof Error');
      expect(error instanceof lib.AssertionErrorConstructor).toBe(true, 'instanceof lib.AssertionError');
      expect(lib.isError(error)).toBe(true, 'isError');

      const circular = {y: 1};
      circular.x = circular;

      const testAssertionMessage = function(actual, expected) {
        try {
          throw new AE({
            actual,
            expected: '',
            operator: '==',
          });
        } catch (e) {
          expect(lib.isError(e)).toBe(true, 'isError');
          expect(e.toString()).toBe(`MyAssertionError [${e.code}]: ${expected} == ''`);
          expect(e.generatedMessage).toBe(true, 'Message not marked as generated');
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
      testAssertionMessage('', "''");
      testAssertionMessage('foo', "'foo'");
      testAssertionMessage([], '[]');
      testAssertionMessage([1, 2, 3], '[ 1, 2, 3 ]');
      testAssertionMessage(/a/, '/a/');
      testAssertionMessage(/abc/gim, '/abc/gim');
      testAssertionMessage(function f() {}, '[Function: f]');
      testAssertionMessage(function() {}, '[Function]');
      testAssertionMessage({}, '{}');
      testAssertionMessage(circular, '{ y: 1, x: [Circular] }');
      testAssertionMessage(
        {
          a: undefined,
          b: null,
        },
        '{ a: undefined, b: null }',
      );
      testAssertionMessage(
        {
          a: NaN,
          b: Infinity,
          c: -Infinity,
        },
        '{ a: NaN, b: Infinity, c: -Infinity }',
      );
    });

    it('toJSON has correct properties', function() {
      expect.assertions(7);
      const MyError = lib.create('MyError', Error);
      const err = new MyError();
      const obj = err.toJSON();
      expect(obj).not.toBeNull();
      expect(typeof obj).toBe('object');
      expect(Object.keys(obj).sort()).toStrictEqual(['frames', 'message', 'name', 'stack']);
      expect(typeof obj.frames).toBe('object');
      expect(typeof obj.message).toBe('string');
      expect(typeof obj.name).toBe('string');
      expect(typeof obj.stack).toBe('string');
    });
  });
});
