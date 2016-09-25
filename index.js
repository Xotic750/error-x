/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/error-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/error-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/error-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/error-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/error-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/error-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/error-x" title="npm version">
 * <img src="https://badge.fury.io/js/error-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Create custom Javascript Error objects.
 *
 * Want to create your own Error objects, this module will allow you to do
 * just that. It ships with all the standard Error objects already created
 * for you. Why? Well, these offer some improvements over the native versions.
 * - They have a `toJSON` method and so they can be serialised.
 * - They have a standardised `stack` property, using
 * [`error-stack-parser`](https://github.com/stacktracejs/error-stack-parser)
 * messages and stacks are parsed and then re-formatted.
 * - They have a `frames` property which is an array of the parsed `stack`
 * message, so you have easy access to the information.
 *
 * <h2>ECMAScript compatibility shims for legacy JavaScript engines</h2>
 * `es5-shim.js` monkey-patches a JavaScript context to contain all EcmaScript 5
 * methods that can be faithfully emulated with a legacy JavaScript engine.
 *
 * `es5-sham.js` monkey-patches other ES5 methods as closely as possible.
 * For these methods, as closely as possible to ES5 is not very close.
 * Many of these shams are intended only to allow code to be written to ES5
 * without causing run-time errors in older engines. In many cases,
 * this means that these shams cause many ES5 methods to silently fail.
 * Decide carefully whether this is what you want. Note: es5-sham.js requires
 * es5-shim.js to be able to work properly.
 *
 * `json3.js` monkey-patches the EcmaScript 5 JSON implimentation faithfully.
 *
 * `es6.shim.js` provides compatibility shims so that legacy JavaScript engines
 * behave as closely as possible to ECMAScript 6 (Harmony).
 *
 * @example
 * var errorX = require('error-x');
 * var MyError = errorX.create('MyError'); // Uses `Error` as no constructor
 *                                         // specified.
 * var err = new MyError('somethingHappened');
 *
 * JSON.stringify(err); // => see below.
 * // A searialised error, showing the custom error object's structure and
 * // format
 * {
 *   "name": "MyError",
 *   "message": "somethingHappened",
 *   "frames": [
 *     {
 *       "functionName": "Y.x",
 *       "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
 *       "lineNumber": 65,
 *       "columnNumber": 13,
 *       "source": "Y.x (http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13)"
 *     },
 *     {
 *       "functionName": "window.onload",
 *       "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
 *       "lineNumber": 73,
 *       "columnNumber": 3,
 *       "source": "window.onload (http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3)"
 *     }
 *   ],
 *   "stack": "MyError\n    Y.x()@http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13\n    window.onload()@http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3"
 * }
 *
 * @version 1.3.12
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module error-x
 */

/*jslint maxlen:80, esversion:6, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:4, maxdepth:3,
  maxstatements:38, maxcomplexity:7 */

/*global require, module */

;(function () {
  'use strict';

  var $create = Object.create;
  var $toStringTag = require('has-to-string-tag-x') && Symbol.toStringTag;
  var pMap = Array.prototype.map;
  var pJoin = Array.prototype.join;
  var pSlice = Array.prototype.slice;
  var pIndexOf = String.prototype.indexOf;
  var pTrim = String.prototype.trim;
  var safeToString = require('safe-to-string-x');
  var StackFrame = require('stackframe');
  var errorStackParser = require('error-stack-parser');
  var define = require('define-properties-x');
  var CircularJSON = require('circular-json');
  var pFindIndex = Array.prototype.findIndex;
  var isCallable = require('is-callable');
  var inspect = require('inspect-x');
  var truncate = require('./truncate.js');
  var isError = require('is-error-x');
  var isNil = require('is-nil-x');
  var isUndefined = require('validate.io-undefined');
  var toLength = require('to-length-x');
  var ERROR = Error;
  var cV8 = ERROR.captureStackTrace && (function () {
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
       * @param {!Object} context The Custom Error this object.
       * @return {!Array.<!Object>} Array of StackFrames.
       */
      return function captureV8(context) {
        var temp = ERROR.prepareStackTrace;
        ERROR.prepareStackTrace = prepareStackTrace;
        var error = new ERROR();
        captureStackTrace(error, context.constructor);
        var frames = pMap.call(error.stack, function (frame) {
          return new StackFrame(
            frame.getFunctionName(),
            void 0,
            frame.getFileName(),
            frame.getLineNumber(),
            frame.getColumnNumber(),
            frame.toString()
          );
        });
        if (isUndefined(temp)) {
          delete ERROR.prepareStackTrace;
        } else {
          ERROR.prepareStackTrace = temp;
        }
        return frames;
      };
    }(ERROR));
  var allCtrs = true;

  /**
   * For use with define.properties, a predicate that returns `true`.
   *
   * @private
   * @return {boolean} `true`.
   */
  function truePredicate() {
    return true;
  }

  /**
   * Defines frames and stack on the Custom Error this object.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {!Array.<!Object>} frames Array of StackFrames.
   * @param {string} name The name of the constructor.
   */
  function defContext(context, frames, name) {
    define.properties(context, {
      frames: frames,
      stack: name + '\n    ' +
        pJoin.call(pMap.call(frames, function (frame) {
          return frame.toString();
        }), '\n    ')
    }, {
      frames: truePredicate,
      stack: truePredicate
    });
  }

  /**
   * Captures the other stacks and converts them to an array of Stackframes.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {!Object} err The Error object to be parsed.
   * @param {string} name The name of the constructor.
   * @return {boolean} True if the Error object was parsed, otherwise false.
   */
  function errParse(context, err, name) {
    var frames;
    try {
      frames = errorStackParser.parse(err);
    } catch (ignore) {
      return false;
    }
    var start = pFindIndex.call(frames, function (frame) {
      return pIndexOf.call(
        typeof frame.functionName === 'string' ? frame.functionName : '',
        name
      ) > -1;
    });
    if (start > -1) {
      var item = frames[start];
      frames = pSlice.call(frames, start + 1);
      var end = pFindIndex.call(frames, function (frame) {
        return item.source === frame.source;
      });
      if (end > -1) {
        frames = pSlice.call(frames, 0, end);
      }
    }
    defContext(context, frames, name);
    return true;
  }

  /**
   * The main function for capturing and parsing stacks and setting properties
   * on Custom Error.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {string} name The name of the constructor.
   */
  function parse(context, name) {
    var err;
    if (cV8) {
      defContext(context, cV8(context), name);
    } else {
      try {
        // Error must be thrown to get stack in IE
        throw ERROR();
      } catch (e) {
        err = e;
      }
      if (!errParse(context, err, name)) {
        // If `Error` has a non-standard `stack`, `stacktrace` or
        // `opera#sourceloc` property that offers a trace of which functions
        // were called, in what order, from which line and  file, and with what
        // argument, then we will set it.
        if (!isUndefined(err['opera#sourceloc'])) {
          define.property(
            context,
            'opera#sourceloc',
            err['opera#sourceloc'],
            true
          );
        }
        if (!isUndefined(err.stacktrace)) {
          define.property(context, 'stacktrace', err.stacktrace, true);
        }
        if (!isUndefined(err.stack)) {
          define.property(context, 'stack', err.stack, true);
        }
        define.property(context, 'frames', [], true);
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
        return isError(new ErrorCtr({}));
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
    if (name === 'AssertionError') {
      return true;
    }
    if (isErrorCtr(ErrorCtr)) {
      var err = new ErrorCtr({
        message: 'a',
        actual: 'b',
        expected: 'c',
        operator: 'd'
      });
      return typeof err.name === 'string' &&
        err.message === 'a' &&
        err.actual === 'b' &&
        err.expected === 'c' &&
        err.operator === 'd';
    }
    return false;
  }

  /**
   * Message generator for AssertionError.
   *
   * @private
   * @param {!Object} message The message object.
   * @return {string} The generated message.
   */
  function getMessage(message) {
    var opts = {
      length: message.length ? toLength(message.length) : 128,
      separator: message.separator ? safeToString(message.separator) : '',
      omission: message.omission ? safeToString(message.omission) : ''
    };
    return truncate(inspect(message.actual), opts) + ' ' +
      message.operator + ' ' +  truncate(inspect(message.expected), opts);
  }

  /**
   * The toJSON method returns a string representation of the Error object.
   *
   * @private
   * @this {!Object} A custom error instance.
   * @return {string} A JSON stringified representation.
   */
  function toJSON() {
    /*jshint validthis:true */
    return CircularJSON.stringify({
      name: this.name,
      message: this.message,
      frames: this.frames,
      stack: this.stack,
      stackframe: this.stackframe,
      'opera#sourceloc': this['opera#sourceloc'],
      actual: this.actual,
      expected: this.expected,
      operator: this.operator
    });
  }

  /**
   * Initialise a new instance of a custom error.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {string} message Human-readable description of the error.
   * @param {string} name The name for the custom Error.
   * @param {Function} [ErrorCtr=Error] Error constructor to be used.
   */
  function init(context, message, name, ErrorCtr) {
    if (asAssertionError(name, ErrorCtr)) {
      define.properties(context, {
        actual: message.actual,
        expected: message.expected,
        message: message.message ? message.message : getMessage(message),
        operator: message.operator,
        generatedMessage: !message.message
      }, {
        actual: truePredicate,
        expected: truePredicate,
        message: truePredicate,
        operator: truePredicate,
        generatedMessage: truePredicate
      });
    } else {
      // Standard Errors. Only set `this.message` if the argument `message`
      // was not `undefined`.
      if (!isUndefined(message)) {
        define.property(context, 'message', safeToString(message), true);
      }
    }
    // Parse and set the 'this' properties.
    parse(context, name);
  }

  // `init` is used in `eval`, don't delete.
  init({}, 'message', 'name', ERROR);

  /**
   * Creates a custom Error constructor. Will use `Error` if argument is not
   * a valid constructor.
   *
   * @private
   * @param {string} [name='CustomError'] The name for the custom Error.
   * @param {Function} [ErrorCtr=Error] Error constructor to be used.
   * @return {Function} The custom Error constructor.
   */
  function create(name, ErrorCtr) {
    /*jshint eqnull:true */
    var customName = isNil(name) ? 'CustomError' : name,
      CstmCtr;
    /*jshint eqnull:false */

    if (customName !== 'CustomError') {
      try {
        customName = pTrim.call(safeToString(customName));
        /*jshint evil:true */
        eval('(function ' + customName + ' () {})');
        /*jshint evil:false */
      } catch (ignore) {
        customName = 'CustomError';
      }
    }

    if (!allCtrs || !isErrorCtr(ErrorCtr)) {
      ErrorCtr = ERROR;
    }

    /**
     * Create a new object, that prototypally inherits from the `Error`
     * constructor.
     *
     * @private
     * @constructor CstmCtr
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    /*jshint evil:true */
    CstmCtr = eval(
      '(0,function ' + customName + ' (message){' +
      'if(!(this instanceof CstmCtr)){return new CstmCtr(message);}' +
      'init(this,message,customName,ErrorCtr);})');
    /*jshint evil:false */

    // Inherit the prototype methods from `ErrorCtr`.
    CstmCtr.prototype = $create(ErrorCtr.prototype);
    define.properties(CstmCtr.prototype, /** @lends module:error-x.CstmCtr.prototype */ {
      /**
       * Specifies the function that created an instance's prototype.
       *
       * @constructor
       */
      constructor: CstmCtr,
      /**
       * The name property represents a name for the type of error.
       *
       * @default 'Error'
       * @type {string}
       */
      name: customName,
      /**
       * The toJSON method returns a string representation of the Error object.
       *
       * @return {string} A JSON stringified representation.
       */
      toJSON: toJSON
    }, {
      constructor: truePredicate,
      name: truePredicate,
      toJSON: truePredicate
    });
    if ($toStringTag) {
      /**
       * name Symbol.toStringTag
       * @memberof module:error-x.CstmCtr.prototype
       * @type {string}
       */
      define.property(
        CstmCtr.prototype,
        $toStringTag,
        '[object Error]',
        true
      );
    }
    return CstmCtr;
  }

  // Test if we can use more than just the Error constructor.
  try {
    allCtrs = create('X', SyntaxError)('x') instanceof SyntaxError;
  } catch (ignore) {
    allCtrs = false;
  }

  define.properties(module.exports, {
    /**
    * Indicates if the Javascript engine supports subclassing of all Error
    * types. If `true` then all are supported, if `false` (only very old
    * browsers IE6) then only `Error` is supported.
    *
    * @type boolean
    * */
    supportsAllConstructors: allCtrs,
    /**
     * Creates a custom Error constructor. Will use `Error` if argument is not
     * a valid constructor.
     *
     * @function
     * @param {string} [name='Error'] The name for the custom Error.
     * @param {Function} [ErrorCtr=Error] Error constructor to be used.
     * @return {Function} The custom Error constructor.
     */
    create: create,
    /**
     * The Error constructor creates an error object.
     *
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    Error: create('Error', Error),
    /**
     * Creates an instance representing a syntax error that occurs while parsing
     * code in eval().
     *
     * @constructor
     * @augments SyntaError
     * @param {string} [message] Human-readable description of the error.
     */
    SyntaxError: create('SyntaxError', SyntaxError),
    /**
     * Creates an instance representing an error that occurs when a variable or
     * parameter is not of a valid type.
     *
     * @constructor
     * @augments TypeError
     * @param {string} [message] Human-readable description of the error.
     */
    TypeError: create('TypeError', TypeError),
    /**
     * Creates an instance representing an error that occurs when a numeric
     * variable or parameter is outside of its valid range.
     *
     * @constructor
     * @augments RangeError
     * @param {string} [message] Human-readable description of the error.
     */
    RangeError: create('RangeError', RangeError),
    /**
     * Creates an instance representing an error that occurs regarding the
     * global function eval().
     *
     * @constructor
     * @augments EvalError
     * @param {string} [message] Human-readable description of the error.
     */
    EvalError: create('EvalError', EvalError),
    /**
     * Creates an instance representing an error that occurs when de-referencing
     * an invalid reference
     *
     * @constructor
     * @augments ReferenceError
     * @param {string} [message] Human-readable description of the error.
     */
    ReferenceError: create('ReferenceError', ReferenceError),
    /**
     * Creates an instance representing an error that occurs when encodeURI() or
     * decodeURI() are passed invalid parameters.
     *
     * @constructor
     * @augments URIError
     * @param {string} [message] Human-readable description of the error.
     */
    URIError: create('URIError', URIError),
    /**
     * The InternalError object indicates an error that occurred internally in
     * the JavaScript engine. For example: "InternalError: too much recursion".
     *
     * @constructor
     * @augments Error
     * @param {string} [message] Human-readable description of the error.
     */
    InternalError: create('InternalError', Error),
    /**
     * Error constructor for test and validation frameworks that implement the
     * standardized AssertionError specification.
     *
     * @constructor
     * @augments Error
     * @param {Object} [message] Need to document the properties.
     */
    AssertionError: create('AssertionError', Error),
    /**
     * Determine whether or not a given `value` is an `Error` type.
     *
     * @function
     * @param {*} value The object to be tested.
     * @return {boolean} Returns `true` if `value` is an `Error` type,
     *  else `false`.
     */
    isError: isError
  });
}());
