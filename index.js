/**
 * @file {@link http://xotic750.github.io/error-x/ error-x}
 * Create custom Javascript Error objects.
 * @version 0.1.11
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module error-x
 */

/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:2, maxdepth:3,
  maxstatements:16, maxcomplexity:8 */

/*global require, module */

;(function () {
  'use strict';

  require('es5-shim');
  require('json3').runInContext();
  require('cycle-x');
  var hasToStringTag = typeof Symbol === 'function' &&
      typeof Symbol.toStringTag === 'symbol',
    StackFrame = require('stackframe'),
    errorStackParser = require('error-stack-parser'),
    defProps = require('define-properties'),
    isCallable = require('is-callable'),
    isPlainObject = require('lodash.isplainobject'),
    truePredicate = require('lodash.constant')(true),
    ERROR = Error,
    TYPEERROR = TypeError,
    SYNTAXERROR = SyntaxError,
    RANGEERROR = RangeError,
    EVALERROR = EvalError,
    REFERENCEERROR = ReferenceError,
    URIERROR = URIError,
    ASSERTIONERROR,
    captureV8 = ERROR.captureStackTrace && (function () {
      // Capture the function (if any).
      var captureStackTrace = ERROR.captureStackTrace;
      // Test to see if the function works.
      try {
        captureStackTrace(new ERROR(), captureStackTrace);
      } catch (ignore) {
        return false;
      }
      /**
       * The stack preparation function for the V8 stack.
       *
       * @private
       * @param {*} ignore Unused argument.
       * @param {!Object} thisStack The V8 stack.
       * @return {!Object} The V8 stack.
       */
      function prepareStackTrace(ignore, thisStack) {
        return thisStack;
      }
      /**
       * Captures the V8 stack and converts it to an array of Stackframes.
       *
       * @private
       * @function captureV8
       * @param {!Object} context The Custom$$Error this object.
       * @return {!Array.<!Object>} Array of StackFrames.
       */
      return function (context) {
        var temp = ERROR.prepareStackTrace,
          error, frames;
        ERROR.prepareStackTrace = prepareStackTrace;
        error = new ERROR();
        captureStackTrace(error, context.constructor);
        frames = error.stack.map(function (frame) {
          return new StackFrame(
            frame.getFunctionName(),
            undefined,
            frame.getFileName(),
            frame.getLineNumber(),
            frame.getColumnNumber(),
            frame.toString()
          );
        });
        if (typeof temp === 'undefined') {
          delete ERROR.prepareStackTrace;
        } else {
          ERROR.prepareStackTrace = temp;
        }
        return frames;
      };
    }(ERROR)),
    allCtrs = true;

  /**
   * Defines frames and stack on the Custom$$Error this object.
   *
   * @private
   * @param {!Object} context The Custom$$Error this object.
   * @param {!Array.<!Object>} frames Array of StackFrames.
   */
  function defContext(context, frames) {
    defProps(context, {
      frames: frames,
      stack: frames.map(function (frame) {
        return frame.toString();
      }).join('\n')
    }, {
      frames: truePredicate,
      stack: truePredicate
    });
  }

  /**
   * Captures the other stacks and converts them to an array of Stackframes.
   *
   * @private
   * @param {!Object} context The Custom$$Error this object.
   * @param {!Object} err The Error object to be parsed.
   * @return {boolean} True if the Error object was parsed, otherwise false.
   */
  function errParse(context, err) {
    var frames, start, end, item;
    try {
      frames = errorStackParser.parse(err);
    } catch (ignore) {
      return false;
    }
    start = frames.findIndex(function (frame) {
      return frame.functionName.indexOf('Custom$$Error') > -1;
    });
    if (start > -1) {
      item = frames[start];
      frames = frames.slice(start + 1);
      end = frames.findIndex(function (frame) {
        return item.source === frame.source;
      });
      if (end > -1) {
        frames = frames.slice(0, end);
      }
    }
    defContext(context, frames);
    return true;
  }

  /**
   * The main function for capturing and parsing stacks and setting properties
   * on Custom$$Error.
   *
   * @private
   * @param {!Object} context The Custom$$Error this object.
   */
  function parse(context) {
    var err;
    if (captureV8) {
      defContext(context, captureV8(context));
    } else {
      try {
        // Error must be thrown to get stack in IE
        throw Error.call(context, context.message);
      } catch (e) {
        err = e;
      }
      if (!errParse(context, err)) {
        // If `Error` has a non-standard `stack`, `stacktrace` or
        // `opera#sourceloc` property that offers a trace of which functions
        // were called, in what order, from which line and  file, and with what
        // argument, then we will set it.
        if (typeof err['opera#sourceloc'] === 'string') {
          defProps(context, {
            'opera#sourceloc': err['opera#sourceloc']
          }, {
            'opera#sourceloc': truePredicate
          });
        }
        if (typeof err.stacktrace === 'string') {
          defProps(context, {
            stacktrace: err.stacktrace
          }, {
            stacktrace: truePredicate
          });
        }
        if (typeof err.stack === 'string') {
          defProps(context, {
            stack: err.stack
          }, {
            stack: truePredicate
          });
        }
        defProps(context, {
          frames: []
        }, {
          frames: truePredicate
        });
      }
    }
  }

  /**
   * Test whether we have a valid Error constructor.
   *
   * @private
   * @param {Function} ErrorCtr Constructor to test it creates an Error.
   * @return {boolean} True if ErrorCtr creates an Error, otherwise false.
   */
  function isErrorCtr(ErrorCtr) {
    if (isCallable(ErrorCtr)) {
      try {
        return new ErrorCtr() instanceof ERROR;
      } catch (ignore) {}
    }
    return false;
  }

  /**
   * Detect whether we are creating an 'AssertionError' constructor.
   *
   * @private
   * @param {string} name Name to test if it is 'AssertionError'.
   * @param {Function} ErrorCtr Constructor to test it creates ASSERTIONERROR.
   * @return {boolean} True if either arguments asserts, otherwise false.
   */
  function asAssertionError(name, ErrorCtr) {
    return name === 'AssertionError' ||
      isErrorCtr(ASSERTIONERROR) && new ErrorCtr() instanceof ASSERTIONERROR;
  }

  /**
   * Creates a custom Error constructor. Will use `Error` if argument is not
   * a valid constructor.
   *
   * @param {string} [name='Error'] The name for the custom Error.
   * @param {Function} [ErrorCtr=Error] Error constructor to be used.
   * @return {Function} The custom Error constructor.
   */
  function create(name, ErrorCtr) {
    if (!allCtrs || !isErrorCtr(ErrorCtr)) {
      ErrorCtr = ERROR;
    }
    /**
     * Create a new object, that prototypally inherits from the `Error`
     * constructor.
     *
     * @private
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    function Custom$$Error(message) {
      // If `message` is our internal `truePredicate` function then we are
      // inheriting and we do not need to process any further.
      if (message === truePredicate) {
        return;
      }
      // If `Custom$$Error` was not called with `new`
      if (!(this instanceof Custom$$Error)) {
        return new Custom$$Error(message);
      }
      if (asAssertionError(name, ErrorCtr)) {
        if (!isPlainObject(message)) {
          message = {};
        }
        defProps(this, {
          actual: message.actual,
          expected: message.expected
        }, {
          actual: truePredicate,
          expected: truePredicate
        });
        if (typeof message.operator !== 'undefined') {
          defProps(this, {
            operator: String(message.operator)
          }, {
            operator: truePredicate
          });
        }
        if (typeof message.message === 'undefined') {
          // todo
          defProps(this, {
            message: String(message.message),
            generatedMessage: true
          }, {
            message: truePredicate,
            generatedMessage: truePredicate
          });
        } else {
          defProps(this, {
            message: String(message.message),
            generatedMessage: false
          }, {
            message: truePredicate,
            generatedMessage: truePredicate
          });
        }
      } else {
        // Standard Errors. Only set `this.message` if the argument `message`
        // was not `undefined`.
        if (typeof message !== 'undefined') {
          defProps(this, {
            message: String(message)
          }, {
            message: truePredicate
          });
        }
      }
      // Parse and set the 'this' properties.
      parse(this);
    }
    // Inherit the prototype methods from `ErrorCtr`.
    Custom$$Error.prototype = ErrorCtr.prototype;
    Custom$$Error.prototype = new Custom$$Error(truePredicate);
    defProps(Custom$$Error.prototype, {
      /**
       * Specifies the function that created an instance's prototype.
       *
       * @private
       * @constructor Custom$$Error.prototype.constructor
       */
      constructor: Custom$$Error,
      /**
       * The name property represents a name for the type of error.
       *
       * @private
       * @name Custom$$Error.prototype.name
       * @default 'Custom$$Error'
       * @type {string}
       */
      name: typeof name === 'undefined' ? 'Error' : String(name),
      /**
       * IE<9 has no built-in implementation of `Object.getPrototypeOf` neither
       * `__proto__`, but this manually setting `__proto__` will guarantee that
       * `Object.getPrototypeOf` will work as expected.
       *
       * @private
       * @name Custom$$Error.prototype.__proto__
       * @type {Object}
       */
      '__proto__': ErrorCtr.prototype,
      /**
       * The toJSON method returns a string representation of the Error object.
       *
       * @private
       * @function Custom$$Error.prototype.toJSON
       */
      toJSON: function () {
        var obj = {
          name: this.name,
          message: this.message,
          frames: this.frames,
          stack: this.stack,
          stackframe: this.stackframe,
          'opera#sourceloc': this['opera#sourceloc'],
          actual: this.actual,
          expected: this.expected,
          operator: this.operator
        };
        if (isCallable(JSON.decycle)) {
          obj = JSON.decycle(obj);
        }
        return JSON.stringify(obj);
      }
    }, {
      constructor: truePredicate,
      name: truePredicate,
      '__proto__': truePredicate,
      toJSON: truePredicate
    });
    if (hasToStringTag) {
      if (defProps.supportsDescriptors) {
        Object.defineProperty(Custom$$Error.prototype, Symbol.toStringTag, {
          enumerable: false,
          writable: true,
          configurable: true,
          value: '[object Error]'
        });
      } else {
        Custom$$Error.prototype[Symbol.toStringTag] = '[object Error]';
      }
    }
    return Custom$$Error;
  }

  // Test if we can use more than just the Error constructor.
  try {
    allCtrs = create('X', SYNTAXERROR)('x') instanceof SYNTAXERROR;
  } catch (ignore) {
    allCtrs = false;
  }

  /**
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @private
   * @constructor
   * @augments Error
   * @param {Object} [message] Need to document the properties.
   */
  ASSERTIONERROR = create('AssertionError', ERROR);

  defProps(module.exports, {
    supportsAllConstructors: allCtrs,
    // Creates a custom Error constructor.
    create: create,
    /**
     * The Error constructor creates an error object.
     *
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    Error: create('Error', ERROR),
    /**
     * Creates an instance representing a syntax error that occurs while parsing
     * code in eval().
     *
     * @constructor
     * @augments SyntaError
     * @param {string} [message] Human-readable description of the error.
     */
    SyntaxError: create('SyntaxError', SYNTAXERROR),
    /**
     * Creates an instance representing an error that occurs when a variable or
     * parameter is not of a valid type.
     *
     * @constructor
     * @augments TypeError
     * @param {string} [message] Human-readable description of the error.
     */
    TypeError: create('TypeError', TYPEERROR),
    /**
     * Creates an instance representing an error that occurs when a numeric
     * variable or parameter is outside of its valid range.
     *
     * @constructor
     * @augments RangeError
     * @param {string} [message] Human-readable description of the error.
     */
    RangeError: create('RangeError', RANGEERROR),
    /**
     * Creates an instance representing an error that occurs regarding the
     * global function eval().
     *
     * @constructor
     * @augments EvalError
     * @param {string} [message] Human-readable description of the error.
     */
    EvalError: create('EvalError', EVALERROR),
    /**
     * Creates an instance representing an error that occurs when de-referencing
     * an invalid reference
     *
     * @constructor
     * @augments ReferenceError
     * @param {string} [message] Human-readable description of the error.
     */
    ReferenceError: create('ReferenceError', REFERENCEERROR),
    /**
     * Creates an instance representing an error that occurs when encodeURI() or
     * decodeURI() are passed invalid parameters.
     *
     * @constructor
     * @augments URIError
     * @param {string} [message] Human-readable description of the error.
     */
    URIError: create('URIError', URIERROR),
    /**
     * The InternalError object indicates an error that occurred internally in
     * the JavaScript engine. For example: "InternalError: too much recursion".
     *
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    InternalError: create('InternalError', ERROR),
    /**
     * Error constructor for test and validation frameworks that implement the
     * standardized AssertionError specification.
     *
     * @constructor
     * @augments Error
     * @param {Object} [message] Need to document the properties.
     */
    AssertionError: ASSERTIONERROR
  }, {
    supportsAllConstructors: truePredicate,
    create: truePredicate,
    Error: truePredicate,
    SyntaxError: truePredicate,
    TypeError: truePredicate,
    RangeError: truePredicate,
    EvalError: truePredicate,
    ReferenceError: truePredicate,
    URIError: truePredicate,
    InternalError: truePredicate,
    AssertionError: truePredicate
  });
}());
