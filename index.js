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
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module error-x
 */

/* eslint strict: 1, max-statements: 1 , sort-keys: 1, no-eval: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $toStringTag = require('has-to-string-tag-x') && Symbol.toStringTag;
  var trim = require('string.prototype.trim');
  var map = require('lodash._arraymap');
  var safeToString = require('safe-to-string-x');
  var StackFrame = require('stackframe');
  var errorStackParser = require('error-stack-parser');
  var define = require('define-properties-x');
  var CircularJSON = require('circular-json');
  var findIndex = require('find-index-x');
  var isCallable = require('is-callable');
  var inspect = require('inspect-x');
  var truncate = require('./truncate.js');
  var isError = require('is-error-x');
  var isNil = require('is-nil-x');
  var isUndefined = require('validate.io-undefined');
  var isNull = require('lodash.isnull');
  var toLength = require('to-length-x');
  var isPrimitive = require('is-primitive');
  var $create = Object.create || function create(prototype, properties) {
    var object;
    var T = function Type() {}; // An empty constructor.

    if (isNull(prototype)) {
      object = {};
    } else {
      if (!isNull(prototype) && isPrimitive(prototype)) {
        // In the native implementation `parent` can be `null`
        // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
        // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
        // like they are in modern browsers. Using `Object.create` on DOM elements
        // is...err...probably inappropriate, but the native version allows for it.
        throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
      }
      T.prototype = prototype;
      object = new T();
      // IE has no built-in implementation of `Object.getPrototypeOf`
      // neither `__proto__`, but this manually setting `__proto__` will
      // guarantee that `Object.getPrototypeOf` will work as expected with
      // objects created using `Object.create`
      object.__proto__ = prototype; // eslint-disable-line no-proto
    }

    if (!isUndefined(properties)) {
      define.properties(object, properties);
    }

    return object;
  };
  var $Error = Error;
  var cV8 = $Error.captureStackTrace && (function () {
      // Capture the function (if any).
    var captureStackTrace = $Error.captureStackTrace;
      // Test to see if the function works.
    try {
      captureStackTrace(new $Error(), captureStackTrace);
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
    var prepareStackTrace = function (ignore, thisStack) {
      return thisStack;
    };
      /**
       * Captures the V8 stack and converts it to an array of Stackframes.
       *
       * @private
       * @function captureV8
       * @param {!Object} context The Custom Error this object.
       * @return {!Array.<!Object>} Array of StackFrames.
       */
    return function captureV8(context) {
      var temp = $Error.prepareStackTrace;
      $Error.prepareStackTrace = prepareStackTrace;
      var error = new $Error();
      captureStackTrace(error, context.constructor);
      var frames = map(error.stack, function (frame) {
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
        delete $Error.prepareStackTrace;
      } else {
        $Error.prepareStackTrace = temp;
      }
      return frames;
    };
  }($Error));
  var allCtrs = true;

  /**
   * For use with define.properties, a predicate that returns `true`.
   *
   * @private
   * @return {boolean} `true`.
   */
  var truePredicate = function () {
    return true;
  };

  /**
   * Defines frames and stack on the Custom Error this object.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {!Array.<!Object>} frames Array of StackFrames.
   * @param {string} name The name of the constructor.
   */
  var defContext = function (context, frames, name) {
    define.properties(context, {
      frames: frames,
      stack: name + '\n    ' + map(frames, function (frame) {
        return frame.toString();
      }).join('\n    ')
    }, {
      frames: truePredicate,
      stack: truePredicate
    });
  };

  /**
   * Captures the other stacks and converts them to an array of Stackframes.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {!Object} err The Error object to be parsed.
   * @param {string} name The name of the constructor.
   * @return {boolean} True if the Error object was parsed, otherwise false.
   */
  var errParse = function (context, err, name) {
    var frames;
    try {
      frames = errorStackParser.parse(err);
    } catch (ignore) {
      return false;
    }
    var start = findIndex(frames, function (frame) {
      var fName = typeof frame.functionName === 'string' ? frame.functionName : '';
      return fName.indexOf(name) > -1;
    });
    if (start > -1) {
      var item = frames[start];
      frames = frames.slice(start + 1);
      var end = findIndex(frames, function (frame) {
        return item.source === frame.source;
      });
      if (end > -1) {
        frames = frames.slice(0, end);
      }
    }
    defContext(context, frames, name);
    return true;
  };

  /**
   * The main function for capturing and parsing stacks and setting properties
   * on Custom Error.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {string} name The name of the constructor.
   */
  var parse = function (context, name) {
    var err;
    if (cV8) {
      defContext(context, cV8(context), name);
    } else {
      try {
        // Error must be thrown to get stack in IE
        throw $Error();
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
  };

  /**
   * Test whether we have a valid Error constructor.
   *
   * @private
   * @param {Function} ErrorCtr Constructor to test it creates an Error.
   * @return {boolean} True if ErrorCtr creates an Error, otherwise false.
   */
  var isErrorCtr = function (ErrorCtr) {
    if (isCallable(ErrorCtr)) {
      try {
        return isError(new ErrorCtr({}));
      } catch (ignore) {}
    }
    return false;
  };

  /**
   * Detect whether we are creating an 'AssertionError' constructor.
   *
   * @private
   * @param {string} name Name to test if it is 'AssertionError'.
   * @param {Function} ErrorCtr Constructor to test it creates ASSERTION$Error.
   * @return {boolean} True if either arguments asserts, otherwise false.
   */
  var asAssertionError = function (name, ErrorCtr) {
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
      return typeof err.name === 'string' && err.message === 'a' && err.actual === 'b' && err.expected === 'c' && err.operator === 'd';
    }
    return false;
  };

  /**
   * Message generator for AssertionError.
   *
   * @private
   * @param {!Object} message The message object.
   * @return {string} The generated message.
   */
  var getMessage = function (message) {
    var opts = {
      length: message.length ? toLength(message.length) : 128,
      separator: message.separator ? safeToString(message.separator) : '',
      omission: message.omission ? safeToString(message.omission) : ''
    };
    return truncate(inspect(message.actual), opts) + ' ' + message.operator + ' ' + truncate(inspect(message.expected), opts);
  };

  /**
   * The toJSON method returns a string representation of the Error object.
   *
   * @private
   * @this {!Object} A custom error instance.
   * @return {string} A JSON stringified representation.
   */
  var toJSON = function () {
    /* jshint validthis:true */
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
  };

  /**
   * Initialise a new instance of a custom error.
   *
   * @private
   * @param {!Object} context The Custom Error this object.
   * @param {string} message Human-readable description of the error.
   * @param {string} name The name for the custom Error.
   * @param {Function} [ErrorCtr=Error] Error constructor to be used.
   */
  var init = function (context, message, name, ErrorCtr) {
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
    } else if (!isUndefined(message)) {
      // Standard Errors. Only set `this.message` if the argument `message`
      // was not `undefined`.
      define.property(context, 'message', safeToString(message), true);
    }
    // Parse and set the 'this' properties.
    parse(context, name);
  };

  // `init` is used in `eval`, don't delete.
  init({}, 'message', 'name', $Error);

  /**
   * Creates a custom Error constructor. Will use `Error` if argument is not
   * a valid constructor.
   *
   * @private
   * @param {string} [name='CustomError'] The name for the custom Error.
   * @param {Function} [ErrorCtr=Error] Error constructor to be used.
   * @return {Function} The custom Error constructor.
   */
  var create = function (name, ErrorCtr) {
    var ECTR = ErrorCtr;
    var customName = isNil(name) ? 'CustomError' : name;
    var CstmCtr;
    if (customName !== 'CustomError') {
      try {
        customName = trim(safeToString(customName));
        eval('(function ' + customName + ' () {})');
      } catch (ignore) {
        customName = 'CustomError';
      }
    }

    if (!allCtrs || !isErrorCtr(ECTR)) {
      ECTR = $Error;
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
    CstmCtr = eval('(0,function ' + customName + ' (message){if(!(this instanceof CstmCtr)){return new CstmCtr(message);}init(this,message,customName,ErrorCtr);})');

    // Inherit the prototype methods from `ECTR`.
    CstmCtr.prototype = $create(ECTR.prototype);
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
  };

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
     * @param {Function} [ECTR=Error] Error constructor to be used.
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
