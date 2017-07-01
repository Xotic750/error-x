(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.returnExports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
 * // A serialised error, showing the custom error object's structure and
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
 * @version 1.7.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module error-x
 */

'use strict';

var $toStringTag = _dereq_('has-to-string-tag-x') && Symbol.toStringTag;
var trim = _dereq_('string.prototype.trim');
var map = _dereq_('lodash._arraymap');
var safeToString = _dereq_('safe-to-string-x');
var StackFrame = _dereq_('stackframe');
var errorStackParser = _dereq_('error-stack-parser');
var define = _dereq_('define-properties-x');
var findIndex = _dereq_('find-index-x');
var isFunction = _dereq_('is-function-x');
var inspect = _dereq_('inspect-x');
var truncate = _dereq_('truncate-x');
var isError = _dereq_('is-error-x');
var isNil = _dereq_('is-nil-x');
var isUndefined = _dereq_('validate.io-undefined');
var toLength = _dereq_('to-length-x');
var stubTrue = _dereq_('lodash.stubtrue');
var $create = _dereq_('object-create-x');
var $Error = Error;
var cV8 = $Error.captureStackTrace && (function _cV8() {
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
   * @param {*} ignore - Unused argument.
   * @param {!Object} thisStack - The V8 stack.
   * @returns {!Object} The V8 stack.
   */
  var prepareStackTrace = function _prepareStackTrace(ignore, thisStack) {
    return thisStack;
  };

  /**
   * Captures the V8 stack and converts it to an array of Stackframes.
   *
   * @private
   * @function captureV8
   * @param {!Object} context - The Custom Error this object.
   * @returns {!Array.<!Object>} Array of StackFrames.
   */
  return function captureV8(context) {
    var temp = $Error.prepareStackTrace;
    $Error.prepareStackTrace = prepareStackTrace;
    var error = new $Error();
    captureStackTrace(error, context.constructor);
    var frames = map(error.stack, function _mapper(frame) {
      var stackFrame = new StackFrame({
        args: void 0,
        columnNumber: frame.getColumnNumber(),
        fileName: frame.getFileName(),
        functionName: frame.getFunctionName(),
        isEval: frame.isEval(),
        isNative: frame.isNative(),
        lineNumber: frame.getLineNumber(),
        source: frame.toString()
      });

      return stackFrame;
    });

    if (isUndefined(temp)) {
      delete $Error.prepareStackTrace;
    } else {
      $Error.prepareStackTrace = temp;
    }

    return frames;
  };
}());

var allCtrs = true;

/**
 * Defines frames and stack on the Custom Error this object.
 *
 * @private
 * @param {!Object} context - The Custom Error this object.
 * @param {!Array.<!Object>} frames - Array of StackFrames.
 * @param {string} name - The name of the constructor.
 */
var defContext = function _defContext(context, frames, name) {
  define.properties(context, {
    frames: frames,
    stack: name + '\n    ' + map(frames, function (frame) {
      return frame.toString();
    }).join('\n    ')
  }, {
    frames: stubTrue,
    stack: stubTrue
  });
};

/**
 * Captures the other stacks and converts them to an array of Stackframes.
 *
 * @private
 * @param {!Object} context - The Custom Error this object.
 * @param {!Object} err - The Error object to be parsed.
 * @param {string} name - The name of the constructor.
 * @returns {boolean} True if the Error object was parsed, otherwise false.
 */
var errParse = function _errParse(context, err, name) {
  var frames;
  try {
    frames = errorStackParser.parse(err);
  } catch (ignore) {
    return false;
  }

  var start = findIndex(frames, function _finderStart(frame) {
    var fName = typeof frame.functionName === 'string' ? frame.functionName : '';
    return fName.indexOf(name) > -1;
  });

  if (start > -1) {
    var item = frames[start];
    frames = frames.slice(start + 1);

    var end = findIndex(frames, function _finderEnd(frame) {
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
 * @param {!Object} context - The Custom Error this object.
 * @param {string} name - The name of the constructor.
 */
var parse = function _parse(context, name) {
  if (cV8) {
    defContext(context, cV8(context), name);
  } else {
    var err;
    try {
      // Error must be thrown to get stack in IE
      throw $Error();
    } catch (e) {
      err = e;
    }

    if (errParse(context, err, name) === false) {
      var stack = '';
      // If `Error` has a non-standard `stack`, `stacktrace` or
      // `opera#sourceloc` property that offers a trace of which functions
      // were called, in what order, from which line and  file, and with what
      // argument, then we will set it.
      if (isUndefined(err.stack) === false) {
        stack = err.stack;
      } else if (isUndefined(err.stacktrace) === false) {
        stack = err.stacktrace;
      } else {
        var sourceloc = err['opera#sourceloc'];
        if (isUndefined(sourceloc) === false) {
          stack = sourceloc;
        }
      }

      define.property(context, 'stack', stack, true);
      define.property(context, 'frames', [], true);
    }
  }
};

/**
 * Test whether we have a valid Error constructor.
 *
 * @private
 * @param {Function} ErrorCtr - Constructor to test it creates an Error.
 * @returns {boolean} True if ErrorCtr creates an Error, otherwise false.
 */
var isErrorCtr = function _isErrorCtr(ErrorCtr) {
  if (isFunction(ErrorCtr)) {
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
 * @param {string} name - Name to test if it is 'AssertionError'.
 * @param {Function} ErrorCtr - Constructor to test it creates ASSERTION$Error.
 * @returns {boolean} True if either arguments asserts, otherwise false.
 */
var asAssertionError = function _asAssertionError(name, ErrorCtr) {
  if (name === 'AssertionError') {
    return true;
  }

  if (isErrorCtr(ErrorCtr)) {
    var err = new ErrorCtr({
      actual: 'b',
      expected: 'c',
      message: 'a',
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
 * @param {!Object} message - The message object.
 * @returns {string} The generated message.
 */
var getMessage = function _getMessage(message) {
  var opts = {
    length: message.length ? toLength(message.length) : 128,
    omission: message.omission ? safeToString(message.omission) : '',
    separator: message.separator ? safeToString(message.separator) : ''
  };

  return truncate(inspect(message.actual), opts) + ' ' + message.operator + ' ' + truncate(inspect(message.expected), opts);
};

/**
 * The toJSON method returns an object representation of the Error object.
 *
 * @private
 * @this {!Object} A custom error instance.
 * @returns {Object} An object representation.
 */
var toJSON = function _toJSON() {
  return {
    frames: this.frames,
    message: this.message,
    name: this.name,
    stack: this.stack
  };
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
// eslint-disable-next-line max-params
var init = function _init(context, message, name, ErrorCtr) {
  if (asAssertionError(name, ErrorCtr)) {
    define.properties(context, {
      actual: message.actual,
      expected: message.expected,
      generatedMessage: !message.message,
      message: message.message ? message.message : getMessage(message),
      operator: message.operator
    }, {
      actual: stubTrue,
      expected: stubTrue,
      generatedMessage: stubTrue,
      message: stubTrue,
      operator: stubTrue
    });
  } else if (isUndefined(message) === false) {
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
 * @param {string} [name='CustomError'] - The name for the custom Error.
 * @param {Function} [ErrorCtr=Error] - Error constructor to be used.
 * @returns {Function} The custom Error constructor.
 */
var create = function _createErrorCtr(name, ErrorCtr) {
  var ECTR = ErrorCtr;
  var customName = isNil(name) ? 'CustomError' : name;
  var CstmCtr;
  if (customName !== 'CustomError') {
    try {
      customName = trim(safeToString(customName));
      // eslint-disable-next-line no-eval
      eval('(function ' + customName + ' () {})');
    } catch (ignore) {
      customName = 'CustomError';
    }
  }

  if (allCtrs === false || isErrorCtr(ECTR) === false) {
    ECTR = $Error;
  }

  // eslint-disable-next-line no-unused-vars
  var f = function _f(context, message) {
    var isInstCtr = context instanceof CstmCtr;
    if (isInstCtr === false) {
      return new CstmCtr(message);
    }

    init(context, message, customName, ErrorCtr);
    return context;
  };

  /**
   * Create a new object, that prototypally inherits from the `Error`
   * constructor.
   *
   * @private
   * @constructor CstmCtr
   * @augments Error
   * @param {string} [message] - Human-readable description of the error.
   */
  // eslint-disable-next-line no-eval
  CstmCtr = eval('(0,function ' + customName + '(message){return f(this,message)})');

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
    constructor: stubTrue,
    name: stubTrue,
    toJSON: stubTrue
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
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @constructor
   * @augments Error
   * @param {Object} [message] Need to document the properties.
   */
  AssertionError: create('AssertionError', Error),
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
   * Creates an instance representing an error that occurs regarding the
   * global function eval().
   *
   * @constructor
   * @augments EvalError
   * @param {string} [message] Human-readable description of the error.
   */
  EvalError: create('EvalError', EvalError),
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
   * Determine whether or not a given `value` is an `Error` type.
   *
   * @function
   * @param {*} value The object to be tested.
   * @return {boolean} Returns `true` if `value` is an `Error` type,
   *  else `false`.
   */
  isError: isError,
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
   * Creates an instance representing an error that occurs when de-referencing
   * an invalid reference
   *
   * @constructor
   * @augments ReferenceError
   * @param {string} [message] Human-readable description of the error.
   */
  ReferenceError: create('ReferenceError', ReferenceError),
  /**
  * Indicates if the Javascript engine supports subclassing of all Error
  * types. If `true` then all are supported, if `false` (only very old
  * browsers IE6) then only `Error` is supported.
  *
  * @type boolean
  * */
  supportsAllConstructors: allCtrs,
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
   * Creates an instance representing an error that occurs when encodeURI() or
   * decodeURI() are passed invalid parameters.
   *
   * @constructor
   * @augments URIError
   * @param {string} [message] Human-readable description of the error.
   */
  URIError: create('URIError', URIError)
});

},{"define-properties-x":7,"error-stack-parser":9,"find-index-x":21,"has-to-string-tag-x":29,"inspect-x":32,"is-error-x":39,"is-function-x":41,"is-nil-x":50,"lodash._arraymap":63,"lodash.stubtrue":65,"object-create-x":67,"safe-to-string-x":80,"stackframe":82,"string.prototype.trim":84,"to-length-x":88,"truncate-x":91,"validate.io-undefined":93}],2:[function(_dereq_,module,exports){
(function (global){
'use strict';

var ES = _dereq_('es-abstract/es6');
var $isNaN = Number.isNaN || function isNaN(a) {
	return a !== a;
};
var $isFinite = Number.isFinite || function isFinite(n) {
	return typeof n === 'number' && global.isFinite(n);
};
var indexOf = Array.prototype.indexOf;

module.exports = function includes(searchElement) {
	var fromIndex = arguments.length > 1 ? ES.ToInteger(arguments[1]) : 0;
	if (indexOf && !$isNaN(searchElement) && $isFinite(fromIndex) && typeof searchElement !== 'undefined') {
		return indexOf.apply(this, arguments) > -1;
	}

	var O = ES.ToObject(this);
	var length = ES.ToLength(O.length);
	if (length === 0) {
		return false;
	}
	var k = fromIndex >= 0 ? fromIndex : Math.max(0, length + fromIndex);
	while (k < length) {
		if (ES.SameValueZero(searchElement, O[k])) {
			return true;
		}
		k += 1;
	}
	return false;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"es-abstract/es6":11}],3:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var ES = _dereq_('es-abstract/es6');

var implementation = _dereq_('./implementation');
var getPolyfill = _dereq_('./polyfill');
var polyfill = getPolyfill();
var shim = _dereq_('./shim');

var slice = Array.prototype.slice;

/* eslint-disable no-unused-vars */
var boundIncludesShim = function includes(array, searchElement) {
/* eslint-enable no-unused-vars */
	ES.RequireObjectCoercible(array);
	return polyfill.apply(array, slice.call(arguments, 1));
};
define(boundIncludesShim, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = boundIncludesShim;

},{"./implementation":2,"./polyfill":4,"./shim":5,"define-properties":8,"es-abstract/es6":11}],4:[function(_dereq_,module,exports){
'use strict';

var implementation = _dereq_('./implementation');

module.exports = function getPolyfill() {
	return Array.prototype.includes || implementation;
};

},{"./implementation":2}],5:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

module.exports = function shimArrayPrototypeIncludes() {
	var polyfill = getPolyfill();
	define(
		Array.prototype,
		{ includes: polyfill },
		{ includes: function () { return Array.prototype.includes !== polyfill; } }
	);
	return polyfill;
};

},{"./polyfill":4,"define-properties":8}],6:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/assert-is-callable-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/assert-is-callable-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-is-callable-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-callable-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/assert-is-callable-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-callable-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/assert-is-callable-x" title="npm version">
 * <img src="https://badge.fury.io/js/assert-is-callable-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * If IsCallable(callbackfn) is false, throw a TypeError exception.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-callable-x
 */

/* eslint strict: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isCallable = _dereq_('is-callable');
  var safeToString = _dereq_('safe-to-string-x');
  var isPrimitive = _dereq_('is-primitive');

  /**
   * Tests `callback` to see if it is callable, throws a `TypeError` if it is
   * not. Otherwise returns the `callback`.
   *
   * @param {*} value The argument to be tested.
   * @throws {TypeError} Throws if `callback` is not a callable.
   * @return {*} Returns `callback` if it is callable.
   * @example
   * var assertIsCallable = require('assert-is-callable-x');
   * var primitive = true;
   * var mySymbol = Symbol('mySymbol');
   * var symObj = Object(mySymbol);
   * var object = {};
   * function fn () {}
   *
   * assertIsCallable(primitive);
   *    // TypeError 'true is not callable'.
   * assertIsCallable(object);
   *    // TypeError '#<Object> is not callable'.
   * assertIsCallable(mySymbol);
   *    // TypeError 'Symbol(mySymbol) is not callable'.
   * assertIsCallable(symObj);
   *    // TypeError '#<Object> is not callable'.
   * assertIsCallable(fn);
   *    // Returns fn.
   */
  module.exports = function assertIsCallable(value) {
    if (!isCallable(value)) {
      var msg = isPrimitive(value) ? safeToString(value) : '#<Object>';
      throw new TypeError(msg + ' is not callable');
    }
    return value;
  };
}());

},{"is-callable":36,"is-primitive":54,"safe-to-string-x":80}],7:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/define-properties-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/define-properties-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/define-properties-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/define-properties-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/define-properties-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/define-properties-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/define-properties-x" title="npm version">
 * <img src="https://badge.fury.io/js/define-properties-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Define multiple non-enumerable properties at once.
 *
 * Requires ES3 or above.
 *
 * @see {@link https://www.npmjs.com/package/define-properties|define-properties}
 *
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module define-properties-x
 */

/* eslint strict: 1, max-statements: 1, id-length: 1, no-restricted-syntax: 1,
   no-param-reassign: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var hasSymbols = _dereq_('has-symbol-support-x');
  var isFunction = _dereq_('is-function-x');
  var isUndefined = _dereq_('validate.io-undefined');
  var forEach = _dereq_('foreach');
  var $keys = isFunction(Object.keys) ? Object.keys : _dereq_('object-keys');
  var $getOwnPropertySymbols = isFunction(Object.getOwnPropertySymbols) && Object.getOwnPropertySymbols;
  var $defineProperty = isFunction(Object.defineProperty) && Object.defineProperty;
  var supportsDescriptors = Boolean($defineProperty) && (function () {
    var obj = {};
    try {
      $defineProperty(obj, 'x', {
        enumerable: false,
        value: obj
      });
      for (var unused in obj) {
        /* jshint forin:false */
        return false;
      }
      return obj.x === obj;
    } catch (e) { /* this is IE 8. */
      return false;
    }
  }());

  /**
   * Method `property`.
   *
   * @private
   * @param {Object} object The object on which to define the property.
   * @param {string|Symbol} prop The property name.
   * @param {*} value The value of the property.
   * @param {boolean} [force=false] If `true` then set property regardless.
   */
  var property = function (object, prop, value, force) {
    if (prop in object && !force) {
      return;
    }
    if (supportsDescriptors) {
      $defineProperty(object, prop, {
        configurable: true,
        enumerable: false,
        value: value,
        writable: true
      });
    } else {
      object[prop] = value;
    }
  };

  /**
   * Method `properties`.
   *
   * @private
   * @param {Object} object The object on which to define the property.
   * @param {Object} map The object of properties.
   * @param {Object} [predicates] The object of property predicates.
   */
  var properties = function (object, map, predicates) {
    var preds = isUndefined(predicates) ? {} : predicates;
    var props = $keys(map);
    if (hasSymbols && $getOwnPropertySymbols) {
      props = props.concat($getOwnPropertySymbols(map));
    }
    forEach(props, function (name) {
      var predicate = preds[name];
      property(
        object,
        name,
        map[name],
        isFunction(predicate) && predicate()
      );
    });
  };

  properties(module.exports, {
    /**
     * Define multiple non-enumerable properties at once.
     * Uses `Object.defineProperty` when available; falls back to standard
     * assignment in older engines. Existing properties are not overridden.
     * Accepts a map of property names to a predicate that, when true,
     * force-overrides.
     *
     * @function
     * @param {Object} object The object on which to define the property.
     * @param {Object} map The object of properties.
     * @param {Object} [predicates] The object of property predicates.
     * @example
     * var define = require('define-properties-x');
     * define.properties({
     *   a: 1,
     *   b: 2
     * }, {
     *   a: function () { return false; },
     *   b: function () { return true; }
     * });
     */
    properties: properties,
    /**
     * Just like `properties` but for defining a single non-enumerable
     * property. Useful in environments that do not
     * support `Computed property names`. This can be done
     * with `properties`, but this method can read a little cleaner.
     *
     * @function
     * @param {Object} object The object on which to define the property.
     * @param {string|Symbol} prop The property name.
     * @param {*} value The value of the property.
     * @param {boolean} [force=false] If `true` then set property regardless.
     * @example
     * var define = require('define-properties-x');
     * var myString = 'something';
     * define.property(obj, Symbol.iterator, function () {}, true);
     * define.property(obj, myString, function () {}, true);
     */
    property: property,
    /**
     * Boolean indicator as to whether the environments supports descriptors
     * or not.
     *
     * @type boolean
     * @example
     * var define = require('define-properties-x');
     * define.supportsDescriptors; // true or false
     */
    supportsDescriptors: supportsDescriptors
  });
}());

},{"foreach":23,"has-symbol-support-x":28,"is-function-x":41,"object-keys":71,"validate.io-undefined":93}],8:[function(_dereq_,module,exports){
'use strict';

var keys = _dereq_('object-keys');
var foreach = _dereq_('foreach');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"foreach":23,"object-keys":71}],9:[function(_dereq_,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(_dereq_('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));

},{"stackframe":82}],10:[function(_dereq_,module,exports){
'use strict';

var $isNaN = _dereq_('./helpers/isNaN');
var $isFinite = _dereq_('./helpers/isFinite');

var sign = _dereq_('./helpers/sign');
var mod = _dereq_('./helpers/mod');

var IsCallable = _dereq_('is-callable');
var toPrimitive = _dereq_('es-to-primitive/es5');

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return $isNaN(x) && $isNaN(y);
	},

	// http://www.ecma-international.org/ecma-262/5.1/#sec-8
	Type: function Type(x) {
		if (x === null) {
			return 'Null';
		}
		if (typeof x === 'undefined') {
			return 'Undefined';
		}
		if (typeof x === 'function' || typeof x === 'object') {
			return 'Object';
		}
		if (typeof x === 'number') {
			return 'Number';
		}
		if (typeof x === 'boolean') {
			return 'Boolean';
		}
		if (typeof x === 'string') {
			return 'String';
		}
	}
};

module.exports = ES5;

},{"./helpers/isFinite":13,"./helpers/isNaN":14,"./helpers/mod":16,"./helpers/sign":17,"es-to-primitive/es5":18,"is-callable":36}],11:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';
var symbolToStr = hasSymbols ? Symbol.prototype.toString : toStr;

var $isNaN = _dereq_('./helpers/isNaN');
var $isFinite = _dereq_('./helpers/isFinite');
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

var assign = _dereq_('./helpers/assign');
var sign = _dereq_('./helpers/sign');
var mod = _dereq_('./helpers/mod');
var isPrimitive = _dereq_('./helpers/isPrimitive');
var toPrimitive = _dereq_('es-to-primitive/es6');
var parseInteger = parseInt;
var bind = _dereq_('function-bind');
var strSlice = bind.call(Function.call, String.prototype.slice);
var isBinary = bind.call(Function.call, RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = bind.call(Function.call, RegExp.prototype.test, /^0o[0-7]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
var hasNonWS = bind.call(Function.call, RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = bind.call(Function.call, RegExp.prototype.test, invalidHexLiteral);

// whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
var ws = [
	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
	'\u2029\uFEFF'
].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = bind.call(Function.call, String.prototype.replace);
var trim = function (value) {
	return replace(value, trimRegex, '');
};

var ES5 = _dereq_('./es5');

var hasRegExpMatcher = _dereq_('is-regex');

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
var ES6 = assign(assign({}, ES5), {

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
	Call: function Call(F, V) {
		var args = arguments.length > 2 ? arguments[2] : [];
		if (!this.IsCallable(F)) {
			throw new TypeError(F + ' is not a function');
		}
		return F.apply(V, args);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
	ToPrimitive: toPrimitive,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
	// ToBoolean: ES5.ToBoolean,

	// http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
	ToNumber: function ToNumber(argument) {
		var value = isPrimitive(argument) ? argument : toPrimitive(argument, 'number');
		if (typeof value === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a number');
		}
		if (typeof value === 'string') {
			if (isBinary(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
			} else if (isOctal(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
				return NaN;
			} else {
				var trimmed = trim(value);
				if (trimmed !== value) {
					return this.ToNumber(trimmed);
				}
			}
		}
		return Number(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
	// ToInteger: ES5.ToNumber,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
	// ToInt32: ES5.ToInt32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
	// ToUint32: ES5.ToUint32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
	ToInt16: function ToInt16(argument) {
		var int16bit = this.ToUint16(argument);
		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
	// ToUint16: ES5.ToUint16,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
	ToInt8: function ToInt8(argument) {
		var int8bit = this.ToUint8(argument);
		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
	ToUint8: function ToUint8(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x100);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
	ToUint8Clamp: function ToUint8Clamp(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number <= 0) { return 0; }
		if (number >= 0xFF) { return 0xFF; }
		var f = Math.floor(argument);
		if (f + 0.5 < number) { return f + 1; }
		if (number < f + 0.5) { return f; }
		if (f % 2 !== 0) { return f + 1; }
		return f;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
	ToString: function ToString(argument) {
		if (typeof argument === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a string');
		}
		return String(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
	ToObject: function ToObject(value) {
		this.RequireObjectCoercible(value);
		return Object(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
	ToPropertyKey: function ToPropertyKey(argument) {
		var key = this.ToPrimitive(argument, String);
		return typeof key === 'symbol' ? symbolToStr.call(key) : this.ToString(key);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	ToLength: function ToLength(argument) {
		var len = this.ToInteger(argument);
		if (len <= 0) { return 0; } // includes converting -0 to +0
		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
		return len;
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
		if (toStr.call(argument) !== '[object String]') {
			throw new TypeError('must be a string');
		}
		if (argument === '-0') { return -0; }
		var n = this.ToNumber(argument);
		if (this.SameValue(this.ToString(n), argument)) { return n; }
		return void 0;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
	RequireObjectCoercible: ES5.CheckObjectCoercible,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
	IsArray: Array.isArray || function IsArray(argument) {
		return toStr.call(argument) === '[object Array]';
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
	// IsCallable: ES5.IsCallable,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
	IsConstructor: function IsConstructor(argument) {
		return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
	IsExtensible: function IsExtensible(obj) {
		if (!Object.preventExtensions) { return true; }
		if (isPrimitive(obj)) {
			return false;
		}
		return Object.isExtensible(obj);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
	IsInteger: function IsInteger(argument) {
		if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
			return false;
		}
		var abs = Math.abs(argument);
		return Math.floor(abs) === abs;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
	IsPropertyKey: function IsPropertyKey(argument) {
		return typeof argument === 'string' || typeof argument === 'symbol';
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-isregexp
	IsRegExp: function IsRegExp(argument) {
		if (!argument || typeof argument !== 'object') {
			return false;
		}
		if (hasSymbols) {
			var isRegExp = argument[Symbol.match];
			if (typeof isRegExp !== 'undefined') {
				return ES5.ToBoolean(isRegExp);
			}
		}
		return hasRegExpMatcher(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
	// SameValue: ES5.SameValue,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
	SameValueZero: function SameValueZero(x, y) {
		return (x === y) || ($isNaN(x) && $isNaN(y));
	},

	/**
	 * 7.3.2 GetV (V, P)
	 * 1. Assert: IsPropertyKey(P) is true.
	 * 2. Let O be ToObject(V).
	 * 3. ReturnIfAbrupt(O).
	 * 4. Return O.[[Get]](P, V).
	 */
	GetV: function GetV(V, P) {
		// 7.3.2.1
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}

		// 7.3.2.2-3
		var O = this.ToObject(V);

		// 7.3.2.4
		return O[P];
	},

	/**
	 * 7.3.9 - http://www.ecma-international.org/ecma-262/6.0/#sec-getmethod
	 * 1. Assert: IsPropertyKey(P) is true.
	 * 2. Let func be GetV(O, P).
	 * 3. ReturnIfAbrupt(func).
	 * 4. If func is either undefined or null, return undefined.
	 * 5. If IsCallable(func) is false, throw a TypeError exception.
	 * 6. Return func.
	 */
	GetMethod: function GetMethod(O, P) {
		// 7.3.9.1
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}

		// 7.3.9.2
		var func = this.GetV(O, P);

		// 7.3.9.4
		if (func == null) {
			return undefined;
		}

		// 7.3.9.5
		if (!this.IsCallable(func)) {
			throw new TypeError(P + 'is not a function');
		}

		// 7.3.9.6
		return func;
	},

	/**
	 * 7.3.1 Get (O, P) - http://www.ecma-international.org/ecma-262/6.0/#sec-get-o-p
	 * 1. Assert: Type(O) is Object.
	 * 2. Assert: IsPropertyKey(P) is true.
	 * 3. Return O.[[Get]](P, O).
	 */
	Get: function Get(O, P) {
		// 7.3.1.1
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		// 7.3.1.2
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}
		// 7.3.1.3
		return O[P];
	},

	Type: function Type(x) {
		if (typeof x === 'symbol') {
			return 'Symbol';
		}
		return ES5.Type(x);
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
	SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		var C = O.constructor;
		if (typeof C === 'undefined') {
			return defaultConstructor;
		}
		if (this.Type(C) !== 'Object') {
			throw new TypeError('O.constructor is not an Object');
		}
		var S = hasSymbols && Symbol.species ? C[Symbol.species] : undefined;
		if (S == null) {
			return defaultConstructor;
		}
		if (this.IsConstructor(S)) {
			return S;
		}
		throw new TypeError('no constructor found');
	}
});

delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

module.exports = ES6;

},{"./es5":10,"./helpers/assign":12,"./helpers/isFinite":13,"./helpers/isNaN":14,"./helpers/isPrimitive":15,"./helpers/mod":16,"./helpers/sign":17,"es-to-primitive/es6":19,"function-bind":25,"is-regex":56}],12:[function(_dereq_,module,exports){
var has = Object.prototype.hasOwnProperty;
module.exports = Object.assign || function assign(target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

},{}],13:[function(_dereq_,module,exports){
var $isNaN = Number.isNaN || function (a) { return a !== a; };

module.exports = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

},{}],14:[function(_dereq_,module,exports){
module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};

},{}],15:[function(_dereq_,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],16:[function(_dereq_,module,exports){
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};

},{}],17:[function(_dereq_,module,exports){
module.exports = function sign(number) {
	return number >= 0 ? 1 : -1;
};

},{}],18:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isPrimitive = _dereq_('./helpers/isPrimitive');

var isCallable = _dereq_('is-callable');

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};

},{"./helpers/isPrimitive":20,"is-callable":36}],19:[function(_dereq_,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = _dereq_('./helpers/isPrimitive');
var isCallable = _dereq_('is-callable');
var isDate = _dereq_('is-date-object');
var isSymbol = _dereq_('is-symbol');

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":20,"is-callable":36,"is-date-object":38,"is-symbol":59}],20:[function(_dereq_,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],21:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/find-index-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/find-index-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/find-index-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/find-index-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/find-index-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/find-index-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/find-index-x" title="npm version">
 * <img src="https://badge.fury.io/js/find-index-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * This method returns the index of the first element in the array that satisfies the
 * provided testing function. Otherwise -1 is returned.
 *
 * Requires ES3 or above.
 *
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module find-index-x
 */

/* eslint strict: 1, max-statements: 1, id-length: 1, no-sparse-arrays: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toLength = _dereq_('to-length-x');
  var toObject = _dereq_('to-object-x');
  var isString = _dereq_('is-string');
  var assertIsCallable = _dereq_('assert-is-callable-x');
  var pFindIndex = Array.prototype.findIndex;

  var implemented = pFindIndex && ([, 1].findIndex(function (item, idx) {
    return idx === 0;
  }) === 0);

  var findIdx;
  if (implemented) {
    findIdx = function findIndex(array, callback) {
      var object = toObject(array);
      assertIsCallable(callback);
      var args = [callback];
      if (arguments.length > 2) {
        args.push(arguments[2]);
      }
      return pFindIndex.apply(object, args);
    };
  } else {
    findIdx = function findIndex(array, callback) {
      var object = toObject(array);
      assertIsCallable(callback);
      var length = toLength(object.length);
      if (length < 1) {
        return -1;
      }
      var thisArg;
      if (arguments.length > 2) {
        thisArg = arguments[2];
      }
      var isStr = isString(object);
      var index = 0;
      while (index < length) {
        var item = isStr ? object.charAt(index) : object[index];
        if (callback.call(thisArg, item, index, object)) {
          return index;
        }
        index += 1;
      }
      return -1;
    };
  }

  /**
   * Like `findIndex`, this method returns an index in the array, if an element
   * in the array satisfies the provided testing function. Otherwise -1 is returned.
   *
   * @param {Array} array The array to search.
   * @throws {TypeError} If array is `null` or `undefined`-
   * @param {Function} callback Function to execute on each value in the array,
   *  taking three arguments: `element`, `index` and `array`.
   * @throws {TypeError} If `callback` is not a function.
   * @param {*} [thisArg] Object to use as `this` when executing `callback`.
   * @return {number} Returns index of positively tested element, otherwise -1.
   * @example
   * var findLastIndex = require('find-index-x');
   *
   * function isPrime(element, index, array) {
   *   var start = 2;
   *   while (start <= Math.sqrt(element)) {
   *     if (element % start++ < 1) {
   *       return false;
   *     }
   *   }
   *   return element > 1;
   * }
   *
   * console.log(findIndex([4, 6, 8, 12, 14], isPrime)); // -1, not found
   * console.log(findIndex([4, 6, 7, 12, 13], isPrime)); // 2
   */
  module.exports = findIdx;
}());

},{"assert-is-callable-x":6,"is-string":58,"to-length-x":88,"to-object-x":89}],22:[function(_dereq_,module,exports){
var isFunction = _dereq_('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":42}],23:[function(_dereq_,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],24:[function(_dereq_,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],25:[function(_dereq_,module,exports){
var implementation = _dereq_('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":24}],26:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/get-function-name-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/get-function-name-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/get-function-name-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/get-function-name-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/get-function-name-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/get-function-name-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/get-function-name-x" title="npm version">
 * <img src="https://badge.fury.io/js/get-function-name-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Get the name of the function.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module get-function-name-x
 */

/* eslint strict: 1, max-statements: 1, func-style: 1, no-new-func: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isFunction = _dereq_('is-function-x');
  var getFnName;
  var t = function test1() {};
  if (t.name === 'test1') {
    /* jshint evil:true */
    var test2 = new Function();
    if (test2.name === 'anonymous') {
      getFnName = function getName(fn) {
        return fn.name && fn.name !== 'anonymous' ? fn.name : '';
      };
    }

  } else {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var fToString = Function.prototype.toString;
    var s = _dereq_('white-space-x').ws;
    var x = '^[' + s + ']*(?:function|class)[' + s + ']*\\*?[' + s + ']+([\\w\\$]+)[' + s + ']*';
    var reName = new RegExp(x, 'i');
    getFnName = function getName(fn) {
      var name = fToString.call(fn).replace(STRIP_COMMENTS, ' ').match(reName);
      return name && name[1] !== 'anonymous' ? name[1] : '';
    };
  }
  /**
   * This method returns the name of the function, or `undefined` if not
   * a function.
   *
   * @param {Function} fn The function to get the name of.
   * @return {undefined|string} The name of the function,  or `undefined` if
   *  not a function.
   * @example
   * var getFunctionName = require('get-function-name-x');
   *
   * getFunctionName(); // undefined
   * getFunctionName(Number.MIN_VALUE); // undefined
   * getFunctionName('abc'); // undefined
   * getFunctionName(true); // undefined
   * getFunctionName({ name: 'abc' }); // undefined
   * getFunctionName(function () {}); // ''
   * getFunctionName(new Function ()); // ''
   * getFunctionName(function test1() {}); // 'test1'
   * getFunctionName(function* test2() {}); // 'test2'
   * getFunctionName(class Test {}); // 'Test'
   */
  module.exports = function getFunctionName(fn) {
    if (!isFunction(fn)) {
      return void 0;
    }
    return getFnName ? getFnName(fn) : fn.name;
  };
}());

},{"is-function-x":41,"white-space-x":94}],27:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-own-property-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-own-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-own-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-own-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-own-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-own-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-own-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-own-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Used to determine whether an object has an own property with the specified property key.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-hasownproperty|7.3.11 HasOwnProperty (O, P)}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-own-property-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toObject = _dereq_('to-object-x');
  var toPrimitive = _dereq_('es-to-primitive/es6');
  var safeToString = _dereq_('safe-to-string-x');
  var hop = Object.prototype.hasOwnProperty;

  /**
   * The `hasOwnProperty` method returns a boolean indicating whether
   * the `object` has the specified `property`. Does not attempt to fix known
   * issues in older browsers, but does ES6ify the method.
   *
   * @param {!Object} object The object to test.
   * @param {string|Symbol} property The name or Symbol of the property to test.
   * @return {boolean} `true` if the property is set on `object`, else `false`.
   * @example
   * var hasOwnProperty = require('has-own-property-x');
   * var o = {
   *   foo: 'bar'
   * };
   *
   *
   * hasOwnProperty(o, 'bar'); // false
   * hasOwnProperty(o, 'foo'); // true
   * hasOwnProperty(undefined, 'foo');
   *                   // TypeError: Cannot convert undefined or null to object
   */
  module.exports = function hasOwnProperty(object, property) {
    return hop.call(toObject(object), safeToString(toPrimitive(property, String)));
  };
}());

},{"es-to-primitive/es6":19,"safe-to-string-x":80,"to-object-x":89}],28:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-symbol-support-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-symbol-support-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-symbol-support-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-symbol-support-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-symbol-support-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-symbol-support-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-symbol-support-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-symbol-support-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Tests if `Symbol` exists and creates the correct type.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */

/* eslint strict: 1, symbol-description: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  /**
   * Indicates if `Symbol`exists and creates the correct type.
   * `true`, if it exists and creates the correct type, otherwise `false`.
   *
   * @type boolean
   */
  module.exports = typeof Symbol === 'function' && typeof Symbol() === 'symbol';
}());

},{}],29:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-to-string-tag-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-to-string-tag-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-to-string-tag-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-to-string-tag-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-to-string-tag-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-to-string-tag-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-to-string-tag-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-to-string-tag-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Tests if ES6 @@toStringTag is supported.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag|26.3.1 @@toStringTag}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-to-string-tag-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  /**
   * Indicates if `Symbol.toStringTag`exists and is the correct type.
   * `true`, if it exists and is the correct type, otherwise `false`.
   *
   * @type boolean
   */
  module.exports = _dereq_('has-symbol-support-x') && typeof Symbol.toStringTag === 'symbol';
}());

},{"has-symbol-support-x":28}],30:[function(_dereq_,module,exports){
var bind = _dereq_('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":25}],31:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/index-of-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/index-of-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/index-of-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/index-of-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/index-of-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/index-of-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/index-of-x" title="npm version">
 * <img src="https://badge.fury.io/js/index-of-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * An extended ES6 indexOf module.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module index-of-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, no-invalid-this: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $isNaN = _dereq_('is-nan');
  var isString = _dereq_('is-string');
  var toInteger = _dereq_('to-integer-x');
  var toObject = _dereq_('to-object-x');
  var toLength = _dereq_('to-length-x');
  var sameValueZero = _dereq_('same-value-zero-x');
  var safeToString = _dereq_('safe-to-string-x');
  var sameValue = _dereq_('object-is');
  var findIndex = _dereq_('find-index-x');
  var pIndexOf = Array.prototype.indexOf;

  if (typeof pIndexOf !== 'function' || [0, 1].indexOf(1, 2) !== -1) {
    var boxedString = Object('a');
    var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

    pIndexOf = function indexOf(searchElement) {
      var self = splitString && isString(this) ? this.split('') : toObject(this);
      var length = self.length >>> 0;

      if (length === 0) {
        return -1;
      }

      var i = 0;
      if (arguments.length > 1) {
        i = toInteger(arguments[1]);
      }

      // handle negative indices
      i = i >= 0 ? i : Math.max(0, length + i);
      while (i < length) {
        if (i in self && self[i] === searchElement) {
          return i;
        }
        i += 1;
      }
      return -1;
    };
  }

  /**
   * This method returns an index in the array, if an element in the array
   * satisfies the provided testing function. Otherwise -1 is returned.
   *
   * @private
   * @param {Array} object The array to search.
   * @param {*} searchElement Element to locate in the array.
   * @param {number} fromIndex The index to start the search at.
   * @param {Function} extendFn The comparison function to use.
   * @return {number} Returns index of found element, otherwise -1.
   */
  var findIdxFrom = function findIndexFrom(object, searchElement, fromIndex, extendFn) {
    var fIdx = fromIndex;
    var isStr = isString(object);
    var length = toLength(object.length);
    while (fIdx < length) {
      if (fIdx in object) {
        var element = isStr ? object.charAt(fIdx) : object[fIdx];
        if (extendFn(element, searchElement)) {
          return fIdx;
        }
      }
      fIdx += 1;
    }
    return -1;
  };

  /**
   * This method returns the first index at which a given element can be found
   * in the array, or -1 if it is not present.
   *
   * @param {Array} array The array to search.
   * @throws {TypeError} If `array` is `null` or `undefined`.
   * @param {*} searchElement Element to locate in the `array`.
   * @param {number} [fromIndex] The index to start the search at. If the
   *  index is greater than or equal to the array's length, -1 is returned,
   *  which means the array will not be searched. If the provided index value is
   *  a negative number, it is taken as the offset from the end of the array.
   *  Note: if the provided index is negative, the array is still searched from
   *  front to back. If the calculated index is less than 0, then the whole
   *  array will be searched. Default: 0 (entire array is searched).
   * @param {string} [extend] Extension type: `SameValue` or `SameValueZero`.
   * @return {number} Returns index of found element, otherwise -1.
   * @example
   * var indexOf = require('index-of-x');
   * var subject = [2, 3, undefined, true, 'hej', null, 2, false, 0, -0, NaN];
   *
   * // Standard mode, operates just like `Array.prototype.indexOf`.
   * indexOf(subject, null); // 5
   * indexOf(testSubject, '2'); // -1
   * indexOf(testSubject, NaN); // -1
   * indexOf(testSubject, -0); // 8
   * indexOf(testSubject, 2, 2); //6
   *
   * // `SameValueZero` mode extends `indexOf` to match `NaN`.
   * indexOf(subject, null, 'SameValueZero'); // 5
   * indexOf(testSubject, '2', 'SameValueZero'); // -1
   * indexOf(testSubject, NaN, 'SameValueZero'); // 10
   * indexOf(testSubject, -0, 'SameValueZero'); // 8
   * indexOf(testSubject, 2, 2, 'SameValueZero'); //6
   *
   * // `SameValue` mode extends `indexOf` to match `NaN` and signed `0`.
   * indexOf(subject, null, 'SameValue'); // 5
   * indexOf(testSubject, '2', 'SameValue'); // -1
   * indexOf(testSubject, NaN, 'SameValue'); // 10
   * indexOf(testSubject, -0, 'SameValue'); // 9
   * indexOf(testSubject, 2, 2, 'SameValue'); //6
   */
  module.exports = function indexOf(array, searchElement) {
    var object = toObject(array);
    var length = toLength(object.length);
    if (!length) {
      return -1;
    }
    var args = [searchElement];
    var extend;
    if (arguments.length > 2) {
      if (arguments.length > 3) {
        args.push(arguments[2]);
        extend = arguments[3];
      } else if (isString(arguments[2])) {
        extend = safeToString(arguments[2]);
      }
    }
    var extendFn;
    if (isString(extend)) {
      extend = extend.toLowerCase();
      if (extend === 'samevalue') {
        extendFn = sameValue;
      } else if (extend === 'samevaluezero') {
        extendFn = sameValueZero;
      }
    }
    if (extendFn && (searchElement === 0 || $isNaN(searchElement))) {
      var fromIndex = toInteger(arguments[2]);
      if (fromIndex < length) {
        if (fromIndex < 0) {
          fromIndex = length - Math.abs(fromIndex);
          if (fromIndex < 0) {
            fromIndex = 0;
          }
        }
      }
      if (fromIndex > 0) {
        return findIdxFrom(object, searchElement, fromIndex, extendFn);
      }
      return findIndex(object, function (element, index) {
        return index in object && extendFn(searchElement, element);
      });
    }
    if (!extendFn && args.length === 1 && arguments.length === 3) {
      args.push(arguments[2]);
    }
    return pIndexOf.apply(object, args);
  };
}());

},{"find-index-x":21,"is-nan":46,"is-string":58,"object-is":70,"safe-to-string-x":80,"same-value-zero-x":81,"to-integer-x":87,"to-length-x":88,"to-object-x":89}],32:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/inspect-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/inspect-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/inspect-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/inspect-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/inspect-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/inspect-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/inspect-x" title="npm version">
 * <img src="https://badge.fury.io/js/inspect-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * An implementation of node's inspect module.
 *
 * @example
 * var util = require('inspect-x');
 *
 * var obj = { name: 'nate' };
 * obj.inspect = function(depth) {
 *   return '{' + this.name + '}';
 * };
 *
 * inspect(obj);
 *   // "{nate}"
 *
 * var obj = { foo: 'this will not show up in the inspect() out' };
 * obj.inspect = function(depth) {
 *   return { bar: 'baz' };
 * };
 *
 * inspect(obj);
 *   // "{ bar: 'baz' }"
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @see https://nodejs.org/api/util.html#util_util_inspect_object_options
 * @module inspect-x
 */

  'use strict';

  var isFunction = _dereq_('is-function-x');
  var isGeneratorFunction = _dereq_('is-generator-function');
  var isAsyncFunction = _dereq_('is-async-function-x');
  var isRegExp = _dereq_('is-regex');
  var define = _dereq_('define-properties-x');
  var isDate = _dereq_('is-date-object');
  var isArrayBuffer = _dereq_('is-array-buffer-x');
  var isSet = _dereq_('is-set-x');
  var isMap = _dereq_('is-map-x');
  var isTypedArray = _dereq_('is-typed-array');
  var isDataView = _dereq_('is-data-view-x');
  var isUndefined = _dereq_('validate.io-undefined');
  var isNil = _dereq_('is-nil-x');
  var isNull = _dereq_('lodash.isnull');
  var isError = _dereq_('is-error-x');
  var isObjectLike = _dereq_('is-object-like-x');
  var isPromise = _dereq_('is-promise');
  var isString = _dereq_('is-string');
  var isNumber = _dereq_('is-number-object');
  var isBoolean = _dereq_('is-boolean-object');
  var isNegZero = _dereq_('is-negative-zero');
  var isSymbol = _dereq_('is-symbol');
  var isPrimitive = _dereq_('is-primitive');
  var getFunctionName = _dereq_('get-function-name-x');
  var hasSymbolSupport = _dereq_('has-symbol-support-x');
  var hasOwnProperty = _dereq_('has-own-property-x');
  var toStringTag = _dereq_('to-string-tag-x');
  var reSingle = new RegExp('\\{[' + _dereq_('white-space-x').ws + ']+\\}');
  var hasSet = typeof Set === 'function' && isSet(new Set());
  var testSet = hasSet && new Set(['SetSentinel']);
  var sForEach = hasSet && Set.prototype.forEach;
  var sValues = hasSet && Set.prototype.values;
  var hasMap = typeof Map === 'function' && isMap(new Map());
  var testMap = hasMap && new Map([[1, 'MapSentinel']]);
  var mForEach = hasMap && Map.prototype.forEach;
  var mValues = hasMap && Map.prototype.values;
  var pSymToStr = hasSymbolSupport && Symbol.prototype.toString;
  var pSymValOf = hasSymbolSupport && Symbol.prototype.valueOf;
  var indexOf = _dereq_('index-of-x');
  var reduce = _dereq_('reduce');
  var forEach = _dereq_('for-each');
  var filter = _dereq_('lodash._arrayfilter');
  var $stringify = _dereq_('json3').stringify;
  var $keys = Object.keys || _dereq_('object-keys');
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var $getPrototypeOf = Object.getPrototypeOf || function getPrototypeOf(object) {
    var proto = object.__proto__; // eslint-disable-line no-proto
    if (proto || isNull(proto)) {
      return proto;
    } else if (toStringTag(object.constructor) === '[object Function]') {
      return object.constructor.prototype;
    } else if (object instanceof Object) {
      return Object.prototype;
    } else {
      return null;
    }
  };
  var $getOwnPropertyNames = Object.getOwnPropertyNames;
  var $getOwnPropertySymbols = hasSymbolSupport && Object.getOwnPropertySymbols;
  var $propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
  var $isArray = _dereq_('validate.io-array');
  var $includes = _dereq_('array-includes');
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
  var $assign = _dereq_('object.assign');
  var $isNaN = _dereq_('is-nan');
  var pRegExpToString = RegExp.prototype.toString;
  var pErrorToString = Error.prototype.toString;
  var pNumberToString = Number.prototype.toString;
  var pBooleanToString = Boolean.prototype.toString;
  var pToISOString = Date.prototype.toISOString;
  var toISOString;
  if (pToISOString) {
    toISOString = function (date) {
      return pToISOString.call(date);
    };
  } else {
    toISOString = function (date) {
      if (!isFinite(date) || !isFinite(date.getTime())) {
        // Adope Photoshop requires the second check.
        throw new RangeError('Date.prototype.toISOString called on non-finite value.');
      }

      var year = date.getUTCFullYear();
      var month = date.getUTCMonth();
      // see https://github.com/es-shims/es5-shim/issues/111
      year += Math.floor(month / 12);
      month = ((month % 12) + 12) % 12;

      // the date time string format is specified in 15.9.1.15.
      var result = [
        month + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      ];

      year = (year < 0 ? '-' : year > 9999 ? '+' : '') + ('00000' + Math.abs(year)).slice(year >= 0 && year <= 9999 ? -4 : -6);

      for (var i = 0; i < result.length; i += 1) {
        // pad months, days, hours, minutes, and seconds to have two digits.
        result[i] = ('00' + result[i]).slice(-2);
      }

      // pad milliseconds to have three digits.
      return year + '-' + result.slice(0, 2).join('-') + 'T' + result.slice(2).join(':') + '.' + ('000' + date.getUTCMilliseconds()).slice(-3) + 'Z';
    };
  }
  var $defineProperty = Object.defineProperty;
  var bpe = 'BYTES_PER_ELEMENT';
  var inspect;
  var fmtValue;

  var customInspectSymbol = hasSymbolSupport ? Symbol('inspect.custom') : '_inspect.custom_';

  var supportsGetSet;
  if ($defineProperty) {
    try {
      var testVar;
      var testObject = $defineProperty($create(null), 'defaultOptions', {
        get: function () {
          return testVar;
        },
        set: function (val) {
          testVar = val;
          return testVar;
        }
      });
      testObject.defaultOptions = 'test';
      supportsGetSet = testVar === 'test';
    } catch (ignore) {}
  }

  var $seal = Object.seal || function seal(obj) {
    return obj;
  };

  var errProps;
  try {
    throw new Error('test');
  } catch (e) {
    errProps = $keys(e);
    forEach($keys(new Error()), function (p) {
      if (!$includes(errProps, p)) {
        errProps.push(p);
      }
    });
  }

  var inspectDefaultOptions = $seal($assign($create(null), {
    breakLength: 60,
    colors: false,
    customInspect: true,
    depth: 2,
    maxArrayLength: 100,
    showHidden: false,
    showProxy: false
  }));

  var isBooleanType = function (arg) {
    return typeof arg === 'boolean';
  };

  var isNumberType = function (arg) {
    return typeof arg === 'number';
  };

  var isStringType = function (arg) {
    return typeof arg === 'string';
  };

  var isSymbolType = function (arg) {
    return typeof arg === 'symbol';
  };

  var isMapIterator = function (value) {
    if (!hasMap || !isObjectLike(value)) {
      return false;
    }
    try {
      return value.next.call(mValues.call(testMap)).value === 'MapSentinel';
    } catch (ignore) {}
    return false;
  };

  var isSetIterator = function (value) {
    if (!hasSet || !isObjectLike(value)) {
      return false;
    }
    try {
      return value.next.call(sValues.call(testSet)).value === 'SetSentinel';
    } catch (ignore) {}
    return false;
  };

  var filterIndexes = function (keys, length) {
    var i = keys.length - 1;
    while (i > -1) {
      var key = keys[i];
      if (key > -1 && key % 1 === 0 && key < length && !isSymbolType(key)) {
        keys.splice(i, 1);
      }
      i -= 1;
    }
  };

  var pushUniq = function (arr, value) {
    if (!$includes(arr, value)) {
      arr.push(value);
    }
  };

  var unshiftUniq = function (arr, value) {
    var index = indexOf(arr, value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    arr.unshift(value);
  };

  var stylizeWithColor = function (str, styleType) {
    var style = inspect.styles[styleType];
    if (style) {
      var colors = inspect.colors[style];
      return '\u001b[' + colors[0] + 'm' + str + '\u001b[' + colors[1] + 'm';
    }
    return str;
  };

  var stylizeNoColor = function (str) {
    return str;
  };

  var getNameSep = function (obj) {
    var name = getFunctionName(obj);
    return name ? ': ' + name : name;
  };

  var collectionEach = function (collection, callback) {
    if (isMap(collection)) {
      mForEach.call(collection, callback);
    } else if (isSet(collection)) {
      sForEach.call(collection, callback);
    }
  };

  var getConstructorOf = function (obj) {
    var o = obj;
    var maxLoop = 100;
    while (!isNil(o) && maxLoop > -1) {
      o = Object(o);
      var descriptor = $getOwnPropertyDescriptor(o, 'constructor');
      if (descriptor && descriptor.value) {
        return descriptor.value;
      }
      o = $getPrototypeOf(o);
      maxLoop -= 1;
    }
    return null;
  };

  var fmtNumber = function (ctx, value) {
    // Format -0 as '-0'.
    return ctx.stylize(isNegZero(value) ? '-0' : pNumberToString.call(value), 'number');
  };

  var fmtPrimitive = function (ctx, value) {
    if (isNil(value)) {
      var str = String(value);
      return ctx.stylize(str, str);
    }
    if (isStringType(value)) {
      var simple = $stringify(value).replace(/^"|"$/g, '').replace(/'/g, '\\\'').replace(/\\"/g, '"');
      return ctx.stylize('\'' + simple + '\'', 'string');
    }
    if (isNumberType(value)) {
      return fmtNumber(ctx, value);
    }
    if (isBooleanType(value)) {
      return ctx.stylize(pBooleanToString.call(value), 'boolean');
    }
    // es6 symbol primitive
    if (isSymbolType(value)) {
      return ctx.stylize(pSymToStr.call(value), 'symbol');
    }
    return void 0;
  };

  var fmtPrimNoColor = function (ctx, value) {
    var stylize = ctx.stylize;
    ctx.stylize = stylizeNoColor;
    var str = fmtPrimitive(ctx, value);
    ctx.stylize = stylize;
    return str;
  };

  var recurse = function (depth) {
    return isNull(depth) ? null : depth - 1;
  };

  /*
  var isCollection = function (value) {
    return isSet(value) || isMap(value);
  };
  */

  var isDigits = function (key) {
    return (/^\d+$/).test(key);
  };

  // eslint-disable-next-line max-params
  var fmtProp = function (ctx, value, depth, visibleKeys, key, arr) {
    var desc = $getOwnPropertyDescriptor(value, key) || { value: value[key] };

    /*
    // this is a fix for broken FireFox, should not be needed with es6-shim
    if (key === 'size' && isCollection(value) && isFunction(value.size)) {
      desc.value = value.size();
    }
    */

    var name;
    if (!$includes(visibleKeys, key)) {
      if (key === bpe && !value[bpe] && isTypedArray(value)) {
        var constructor = getConstructorOf(value);
        if (constructor) {
          desc.value = constructor[bpe];
        }
      } else if (isSymbolType(key)) {
        name = '[' + ctx.stylize(pSymToStr.call(key), 'symbol') + ']';
      } else {
        name = '[' + key + ']';
      }
    }

    var str;
    if (desc.get) {
      str = ctx.stylize(desc.set ? '[Getter/Setter]' : '[Getter]', 'special');
    } else if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    } else if ($includes(ctx.seen, desc.value)) {
      str = ctx.stylize('[Circular]', 'special');
    } else {
      str = fmtValue(ctx, desc.value, recurse(depth));
      if (str.indexOf('\n') > -1) {
        var rx = arr ? /\n/g : /(^|\n)/g;
        var rStr = arr ? '\n  ' : '\n   ';
        str = str.replace(rx, rStr);
      }
    }

    if (isUndefined(name)) {
      if (arr && isDigits(key)) {
        return str;
      }
      name = $stringify(key);
      if (/^"[\w$]+"$/.test(name)) {
        name = ctx.stylize(name.slice(1, -1), 'name');
      } else {
        name = name.replace(/'/g, '\\\'').replace(/\\"/g, '"').replace(/(^"|"$)/g, '\'').replace(/\\\\/g, '\\');
        name = ctx.stylize(name, 'string');
      }
    }
    return name + ': ' + str;
  };

  // eslint-disable-next-line max-params
  var fmtObject = function (ctx, value, depth, visibleKeys, keys) {
    var out = [];
    forEach(keys, function (key) {
      out.push(fmtProp(ctx, value, depth, visibleKeys, key, false));
    });
    return out;
  };

  // eslint-disable-next-line max-params
  var fmtArray = function (ctx, value, depth, visibleKeys, keys) {
    var output = [];
    var visibleLength = 0;
    var index = 0;
    while (index < value.length && visibleLength < ctx.maxArrayLength) {
      var emptyItems = 0;
      while (index < value.length && !hasOwnProperty(value, pNumberToString.call(index))) {
        emptyItems += 1;
        index += 1;
      }
      if (emptyItems > 0) {
        var ending = emptyItems > 1 ? 's' : '';
        var message = '<' + emptyItems + ' empty item' + ending + '>';
        output.push(ctx.stylize(message, 'undefined'));
      } else {
        output.push(fmtProp(ctx, value, depth, visibleKeys, pNumberToString.call(index), true));
        index += 1;
      }
      visibleLength += 1;
    }
    var remaining = value.length - index;
    if (remaining > 0) {
      output.push('... ' + remaining + ' more item' + (remaining > 1 ? 's' : ''));
    }
    forEach(keys, function (key) {
      if (isSymbolType(key) || !isDigits(key)) {
        output.push(fmtProp(ctx, value, depth, visibleKeys, key, true));
      }
    });
    return output;
  };

  // eslint-disable-next-line max-params
  var fmtTypedArray = function (ctx, value, depth, visibleKeys, keys) {
    var maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
    var remaining = value.length - maxLength;
    var output = new Array(maxLength);
    for (var i = 0; i < maxLength; i += 1) {
      output[i] = fmtNumber(ctx, value[i]);
    }
    if (remaining > 0) {
      output.push('... ' + remaining + ' more item' + (remaining > 1 ? 's' : ''));
    }
    forEach(keys, function (key) {
      if (isSymbolType(key) || !isDigits(key)) {
        output.push(fmtProp(ctx, value, depth, visibleKeys, key, true));
      }
    });
    return output;
  };

  // eslint-disable-next-line max-params
  var fmtSet = function (ctx, value, depth, visibleKeys, keys) {
    var out = [];
    collectionEach(value, function (v) {
      out.push(fmtValue(ctx, v, recurse(depth)));
    });
    forEach(keys, function (key) {
      out.push(fmtProp(ctx, value, depth, visibleKeys, key, false));
    });
    return out;
  };

  // eslint-disable-next-line max-params
  var fmtMap = function (ctx, value, depth, visibleKeys, keys) {
    var out = [];
    collectionEach(value, function (v, k) {
      var r = recurse(depth);
      out.push(fmtValue(ctx, k, r) + ' => ' + fmtValue(ctx, v, r));
    });
    forEach(keys, function (key) {
      out.push(fmtProp(ctx, value, depth, visibleKeys, key, false));
    });
    return out;
  };

  var reduceToSingleString = function (out, base, braces) {
    var length = reduce(out, function (prev, cur) {
      return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
    }, 0);
    var result;
    if (length > 60) {
      // If the opening "brace" is too large, like in the case of "Set {",
      // we need to force the first item to be on the next line or the
      // items will not line up correctly.
      var layoutBase = base === '' && braces[0].length === 1 ? '' : base + '\n ';
      result = braces[0] + layoutBase + ' ' + out.join(',\n  ') + ' ' + braces[1];
    } else {
      result = braces[0] + base + ' ' + out.join(', ') + ' ' + braces[1];
    }
    return result.replace(reSingle, '{}');
  };

  var fmtDate = function (value) {
    return $isNaN(value.getTime()) ? 'Invalid Date' : toISOString(value);
  };

  var fmtError = function (value) {
    return value.stack || '[' + pErrorToString.call(value) + ']';
  };

  // eslint-disable-next-line complexity
  fmtValue = function (ctx, value, depth) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (ctx.customInspect && value) {
      var maybeCustomInspect = value[customInspectSymbol] || value.inspect;
      if (isFunction(maybeCustomInspect)) {
        // Filter out the util module, its inspect function is special
        if (maybeCustomInspect !== inspect) {
          // Also filter out any prototype objects using the circular check.
          if (!(value.constructor && value.constructor.prototype === value)) {
            var ret = maybeCustomInspect.call(value, depth, ctx);
            // If the custom inspection method returned `this`, don't go into
            // infinite recursion.
            // eslint-disable-next-line max-depth
            if (ret !== value) {
              return isStringType(ret) ? ret : fmtValue(ctx, ret, depth);
            }
          }
        }
      }
    }

    // Primitive types cannot have properties
    var primitive = fmtPrimitive(ctx, value);
    if (primitive) {
      return primitive;
    }

    // Look up the keys of the object.
    var keys = $keys(value);
    if (keys.length && errProps.length && isError(value)) {
      keys = filter(keys, function (key) {
        return !$includes(errProps, key);
      });
    }

    var visibleKeys = keys;
    var symbolKeys = $getOwnPropertySymbols ? $getOwnPropertySymbols(value) : [];
    var enumSymbolKeys = filter(symbolKeys, function (key) {
      return $propertyIsEnumerable.call(value, key);
    });
    keys = keys.concat(enumSymbolKeys);

    if (ctx.showHidden) {
      keys = $getOwnPropertyNames(value).concat(symbolKeys);
      if (isError(value)) {
        if (!$includes(visibleKeys, 'message') && !$includes(keys, 'message')) {
          unshiftUniq(keys, 'message');
        }
        /*
        if (!includes(visibleKeys, 'name') && !includes(keys, 'name')) {
          unshiftUniq(keys, 'name');
        }
        */
      }
    }

    if (isString(value)) {
      // for boxed Strings, we have to remove the 0-n indexed entries,
      // since they just noisey up the out and are redundant
      filterIndexes(keys, value.length);
      filterIndexes(visibleKeys, value.length);
    } else if (isArrayBuffer(value)) {
      filterIndexes(keys, value.byteLength);
      filterIndexes(visibleKeys, value.byteLength);
    }

    // Some type of object without properties can be shortcutted.
    if (keys.length === 0) {
      // This could be a boxed primitive (new String(), etc.)
      if (isString(value)) {
        return ctx.stylize(
          '[String: ' + fmtPrimNoColor(ctx, value.valueOf()) + ']',
          'string'
        );
      }
      if (isNumber(value)) {
        return ctx.stylize(
          '[Number: ' + fmtPrimNoColor(ctx, value.valueOf()) + ']',
          'number'
        );
      }
      if (isBoolean(value)) {
        return ctx.stylize(
          '[Boolean: ' + fmtPrimNoColor(ctx, value.valueOf()) + ']',
          'boolean'
        );
      }
      if (isSymbol(value)) {
        return ctx.stylize(
          '[Symbol: ' + fmtPrimNoColor(ctx, pSymValOf.call(value)) + ']',
           'symbol'
        );
      }
      if (isAsyncFunction(value)) {
        return ctx.stylize('[AsyncFunction' + getNameSep(value) + ']', 'special');
      }
      if (isGeneratorFunction(value)) {
        return ctx.stylize('[GeneratorFunction' + getNameSep(value) + ']', 'special');
      }
      if (isFunction(value)) {
        return ctx.stylize('[Function' + getNameSep(value) + ']', 'special');
      }
      if (isRegExp(value)) {
        return ctx.stylize(pRegExpToString.call(value), 'regexp');
      }
      if (isDate(value)) {
        return ctx.stylize(fmtDate(value), 'date');
      }
      if (isError(value)) {
        return fmtError(value);
      }
      // Fast path for ArrayBuffer. Can't do the same for DataView because it
      // has a non-primitive buffer property that we need to recurse for.
      if (isArrayBuffer(value)) {
        return 'ArrayBuffer { byteLength: ' + fmtNumber(ctx, value.byteLength) + ' }';
      }
      if (isMapIterator(value)) {
        return 'MapIterator {}';
      }
      if (isSetIterator(value)) {
        return 'SetIterator {}';
      }
      if (isPromise(value)) {
        return 'Promise {}';
      }
    }
    var name = getFunctionName(getConstructorOf(value));
    var base = '';
    var empty = false;
    var braces = ['{', '}'];
    var fmtter = fmtObject;
    // We can't compare constructors for various objects using a comparison
    // like `constructor === Array` because the object could have come from a
    // different context and thus the constructor won't match. Instead we check
    // the constructor names (including those up the prototype chain where
    // needed) to determine object types.
    if (isString(value)) {
      // Make boxed primitive Strings look like such
      base = '[String: ' + fmtPrimNoColor(ctx, value.valueOf()) + ']';
    } else if (isNumber(value)) {
      // Make boxed primitive Numbers look like such
      base = '[Number: ' + fmtPrimNoColor(ctx, value.valueOf()) + ']';
    } else if (isBoolean(value)) {
      // Make boxed primitive Booleans look like such
      base = '[Boolean: ' + fmtPrimNoColor(ctx, value.valueOf()) + ']';
    } else if (isFunction(value)) {
      // Make functions say that they are functions
      base = '[Function' + getNameSep(value) + ']';
    } else if (isRegExp(value)) {
      // Make RegExps say that they are RegExps
      name = 'RegExp';
      base = pRegExpToString.call(value);
    } else if (isDate(value)) {
      // Make dates with properties first say the date
      name = 'Date';
      base = fmtDate(value);
    } else if (isError(value)) {
      // Make error with message first say the error
      base = fmtError(value);
    } else if ($isArray(value)) {
      // Unset the constructor to prevent "Array [...]" for ordinary arrays.
      name = name === 'Array' ? '' : name;
      braces = ['[', ']'];
      if (ctx.showHidden) {
        unshiftUniq(keys, 'length');
      }
      empty = value.length === 0;
      fmtter = fmtArray;
    } else if (isSet(value)) {
      name = 'Set';
      fmtter = fmtSet;
      // With `showHidden`, `length` will display as a hidden property for
      // arrays. For consistency's sake, do the same for `size`, even though
      // this property isn't selected by Object.getOwnPropertyNames().
      if (ctx.showHidden) {
        unshiftUniq(keys, 'size');
      }
      empty = value.size === 0;
    } else if (isMap(value)) {
      name = 'Map';
      fmtter = fmtMap;
      // With `showHidden`, `length` will display as a hidden property for
      // arrays. For consistency's sake, do the same for `size`, even though
      // this property isn't selected by Object.getOwnPropertyNames().
      if (ctx.showHidden) {
        unshiftUniq(keys, 'size');
      }
      empty = value.size === 0;
    } else if (isArrayBuffer(value)) {
      name = 'ArrayBuffer';
      unshiftUniq(keys, 'byteLength');
      pushUniq(visibleKeys, 'byteLength');
    } else if (isDataView(value)) {
      name = 'DataView';
      unshiftUniq(keys, 'buffer');
      unshiftUniq(keys, 'byteOffset');
      unshiftUniq(keys, 'byteLength');
      pushUniq(visibleKeys, 'byteLength');
      pushUniq(visibleKeys, 'byteOffset');
      pushUniq(visibleKeys, 'buffer');
    } else if (isTypedArray(value)) {
      braces = ['[', ']'];
      fmtter = fmtTypedArray;
      if (ctx.showHidden) {
        unshiftUniq(keys, 'buffer');
        unshiftUniq(keys, 'byteOffset');
        unshiftUniq(keys, 'byteLength');
        unshiftUniq(keys, 'length');
        unshiftUniq(keys, bpe);
      }
    } else if (isPromise(value)) {
      name = 'Promise';
    } else if (isMapIterator(value)) {
      name = 'MapIterator';
      empty = true;
    } else if (isSetIterator(value)) {
      name = 'SetIterator';
      empty = true;
    } else {
      // Unset the constructor to prevent "Object {...}" for ordinary objects.
      name = name === 'Object' ? '' : name;
      empty = true; // No other data than keys.
    }
    empty = empty === true && keys.length === 0;
    if (base) {
      base = ' ' + base;
    } else if (name) {
      // Add constructor name if available
      braces[0] = name + ' ' + braces[0];
    }
    if (empty) {
      return braces[0] + base + braces[1];
    }
    if (depth < 0) {
      if (isRegExp(value)) {
        return ctx.stylize(pRegExpToString.call(value), 'regexp');
      } else if ($isArray(value)) {
        return ctx.stylize('[Array]', 'special');
      } else {
        return ctx.stylize('[Object]', 'special');
      }
    }
    ctx.seen.push(value);
    var out = fmtter(ctx, value, depth, visibleKeys, keys);
    ctx.seen.pop();
    return reduceToSingleString(out, base, braces);
  };

  inspect = function (obj, opts) {
    // default options
    var ctx = {
      seen: [],
      stylize: stylizeNoColor
    };
    // legacy...
    if (arguments.length >= 3 && !isUndefined(arguments[2])) {
      ctx.depth = arguments[2];
    }
    if (arguments.length >= 4 && !isUndefined(arguments[3])) {
      ctx.colors = arguments[3];
    }
    if (isBoolean(opts)) {
      // legacy...
      ctx.showHidden = opts;
    }
    // Set default and user-specified options
    if (supportsGetSet) {
      ctx = $assign($create(null), inspect.defaultOptions, ctx, opts);
    } else {
      ctx = $assign($create(null), inspectDefaultOptions, inspect.defaultOptions, ctx, opts);
    }
    if (ctx.colors) {
      ctx.stylize = stylizeWithColor;
    }
    if (isNull(ctx.maxArrayLength)) {
      ctx.maxArrayLength = Infinity;
    }
    return fmtValue(ctx, obj, ctx.depth);
  };

  if (supportsGetSet) {
    $defineProperty(inspect, 'defaultOptions', {
      get: function () {
        return inspectDefaultOptions;
      },
      set: function (options) {
        if (!isObjectLike(options)) {
          throw new TypeError('"options" must be an object');
        }
        return $assign(inspectDefaultOptions, options);
      }
    });
  } else {
    define.property(inspect, 'defaultOptions', $assign($create(null), inspectDefaultOptions));
  }

  define.property(inspect, 'custom', customInspectSymbol);

  // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
  define.property(inspect, 'colors', $assign($create(null), {
    black: [30, 39],
    blue: [34, 39],
    bold: [1, 22],
    cyan: [36, 39],
    green: [32, 39],
    grey: [90, 39],
    inverse: [7, 27],
    italic: [3, 23],
    magenta: [35, 39],
    red: [31, 39],
    underline: [4, 24],
    white: [37, 39],
    yellow: [33, 39]
  }));

  // Don't use 'blue' not visible on cmd.exe
  define.property(inspect, 'styles', $assign($create(null), {
    'boolean': 'yellow',
    date: 'magenta',
    // name: intentionally not styling
    'null': 'bold',
    number: 'yellow',
    regexp: 'red',
    special: 'cyan',
    string: 'green',
    symbol: 'green',
    undefined: 'grey'
  }));

  /**
   * Echos the value of a value. Trys to print the value out
   * in the best way possible given the different types.
   * Values may supply their own custom `inspect(depth, opts)` functions,
   * when called they receive the current depth in the recursive inspection,
   * as well as the options object passed to `inspect`.
   *
   * @param {Object} obj The object to print out.
   * @param {Object} [opts] Options object that alters the out.
   * @return {string} The string representation.
   * @example
   * var inspect = require('inspect-x');
   *
   * console.log(inspect(inspect, { showHidden: true, depth: null }));
   * //{ [Function: inspect]
   * //  [length]: 2,
   * //  [name]: 'inspect',
   * //  [prototype]: inspect { [constructor]: [Circular] },
   * //  [colors]:
   * //   { [bold]: [ 1, 22, [length]: 2 ],
   * //     [italic]: [ 3, 23, [length]: 2 ],
   * //     [underline]: [ 4, 24, [length]: 2 ],
   * //     [inverse]: [ 7, 27, [length]: 2 ],
   * //     [white]: [ 37, 39, [length]: 2 ],
   * //     [grey]: [ 90, 39, [length]: 2 ],
   * //     [black]: [ 30, 39, [length]: 2 ],
   * //     [blue]: [ 34, 39, [length]: 2 ],
   * //     [cyan]: [ 36, 39, [length]: 2 ],
   * //     [green]: [ 32, 39, [length]: 2 ],
   * //     [magenta]: [ 35, 39, [length]: 2 ],
   * //     [red]: [ 31, 39, [length]: 2 ],
   * //     [yellow]: [ 33, 39, [length]: 2 ] },
   * //  [styles]:
   * //   { [special]: 'cyan',
   * //     [number]: 'yellow',
   * //     [boolean]: 'yellow',
   * //     [undefined]: 'grey',
   * //     [null]: 'bold',
   * //     [string]: 'green',
   * //     [symbol]: 'green',
   * //     [date]: 'magenta',
   * //     [regexp]: 'red' } }
   */
  module.exports = inspect;

},{"array-includes":3,"define-properties-x":7,"for-each":22,"get-function-name-x":26,"has-own-property-x":27,"has-symbol-support-x":28,"index-of-x":31,"is-array-buffer-x":33,"is-async-function-x":34,"is-boolean-object":35,"is-data-view-x":37,"is-date-object":38,"is-error-x":39,"is-function-x":41,"is-generator-function":43,"is-map-x":44,"is-nan":46,"is-negative-zero":49,"is-nil-x":50,"is-number-object":51,"is-object-like-x":52,"is-primitive":54,"is-promise":55,"is-regex":56,"is-set-x":57,"is-string":58,"is-symbol":59,"is-typed-array":60,"json3":61,"lodash._arrayfilter":62,"lodash.isnull":64,"object-keys":71,"object.assign":75,"reduce":78,"to-string-tag-x":90,"validate.io-array":92,"validate.io-undefined":93,"white-space-x":94}],33:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-array-buffer-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-array-buffer-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-array-buffer-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-array-buffer-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-array-buffer-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-array-buffer-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-array-buffer-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-array-buffer-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Detect whether or not an object is an Arraybuffer.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-array-buffer-x
 */

/* jslint maxlen:80, es6:true, white:true */

/* jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
   freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
   nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
   es3:true, esnext:true, plusplus:true, maxparams:2, maxdepth:1,
   maxstatements:2, maxcomplexity:2 */

/* eslint strict: 1, max-statements: 1 */

/* global module, ArrayBuffer */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isObjectLike = _dereq_('is-object-like-x');
  var hasABuf = typeof ArrayBuffer === 'function';
  var toStringTag;
  var aBufTag;
  var bLength;

  if (hasABuf) {
    if (_dereq_('has-to-string-tag-x')) {
      try {
        bLength = Object.getOwnPropertyDescriptor(
          ArrayBuffer.prototype,
          'byteLength'
        ).get;
        bLength = typeof bLength.call(new ArrayBuffer(4)) === 'number' && bLength;
      } catch (ignore) {
        bLength = null;
      }
    }
    if (!bLength) {
      toStringTag = _dereq_('to-string-tag-x');
      aBufTag = '[object ArrayBuffer]';
    }
  }

  /**
   * Determine if an `object` is an `ArrayBuffer`.
   *
   * @param {*} object The object to test.
   * @return {boolean} `true` if the `object` is an `ArrayBuffer`,
   *  else false`.
   * @example
   * var isArrayBuffer = require('is-array-buffer-x');
   *
   * isArrayBuffer(new ArrayBuffer(4)); // true
   * isArrayBuffer(null); // false
   * isArrayBuffer([]); // false
   */
  module.exports = function isArrayBuffer(object) {
    if (!hasABuf || !isObjectLike(object)) {
      return false;
    }
    if (!bLength) {
      return toStringTag(object) === aBufTag;
    }
    try {
      return typeof bLength.call(object) === 'number';
    } catch (ignore) {}
    return false;
  };
}());

},{"has-to-string-tag-x":29,"is-object-like-x":52,"to-string-tag-x":90}],34:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-async-function-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/is-async-function-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-async-function-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-async-function-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-async-function-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-async-function-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-async-function-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-async-function-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Determine if a function is a native aync function.
 *
 * Requires ES3 or above.
 *
 * @see {@link https://tc39.github.io/ecma262/#sec-async-function-definitions|14.6 Async Function Definitions}
 *
 * @version 1.0.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-async-function-x
 */

/* eslint strict: 1, max-statements: 1, no-new-func: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toStringTag = _dereq_('to-string-tag-x');
  var hasToStringTag = _dereq_('has-to-string-tag-x');
  var isNull = _dereq_('lodash.isnull');
  var s = _dereq_('white-space-x').ws;
  var x = '^[' + s + ']*async[' + s + ']+(?:function)?';
  var isFnRegex = new RegExp(x);
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var fToString = Function.prototype.toString;

  var $getPrototypeOf = Object.getPrototypeOf || function getPrototypeOf(object) {
    // eslint-disable-next-line no-proto
    var proto = object.__proto__;
    if (proto || isNull(proto)) {
      return proto;
    } else if (toStringTag(object.constructor) === '[object Function]') {
      return object.constructor.prototype;
    } else if (object instanceof Object) {
      return Object.prototype;
    } else {
      return null;
    }
  };

  var getAF = function getAsyncFunc() {
    if (!hasToStringTag) {
      return false;
    }
    try {
      return new Function('return async function() {}')();
    } catch (ignore) {}
    return false;
  };
  var asyncFunc = getAF();
  var AsyncFunction = asyncFunc ? $getPrototypeOf(asyncFunc) : {};

  /**
   * Checks if `value` is classified as an `Async Function` object.
   *
   * @param {*} fn The value to check.
   * @return {boolean} Returns `true` if `value` is correctly classified,
   * else `false`.
   * @example
   * var isAsyncFunction = require('is--async-function-x');
   *
   * isAsyncFunction(); // false
   * isAsyncFunction(Number.MIN_VALUE); // false
   * isAsyncFunction('abc'); // false
   * isAsyncFunction(true); // false
   * isAsyncFunction({ name: 'abc' }); // false
   * isAsyncFunction(function () {}); // false
   * isAsyncFunction(new Function ()); // false
   * isAsyncFunction(function* test1() {}); // false
   * isAsyncFunction(function test2(a, b) {}); // false
   * isAsyncFunction(class Test {}); // false
   * isAsyncFunction((x, y) => {return this;}); // false
   * isAsyncFunction(async functin() {}); // true
   */
  module.exports = function isAsyncFunction(fn) {
    if (typeof fn !== 'function') {
      return false;
    }
    if (isFnRegex.test(fToString.call(fn).replace(STRIP_COMMENTS, ' '))) {
      return true;
    }
    if (!hasToStringTag) {
      return toStringTag(fn) === '[object AsyncFunction]';
    }
    return $getPrototypeOf(fn) === AsyncFunction;
  };
}());

},{"has-to-string-tag-x":29,"lodash.isnull":64,"to-string-tag-x":90,"white-space-x":94}],35:[function(_dereq_,module,exports){
'use strict';

var boolToStr = Boolean.prototype.toString;

var tryBooleanObject = function tryBooleanObject(value) {
	try {
		boolToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var boolClass = '[object Boolean]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isBoolean(value) {
	if (typeof value === 'boolean') { return true; }
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryBooleanObject(value) : toStr.call(value) === boolClass;
};

},{}],36:[function(_dereq_,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],37:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-data-view-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-data-view-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-data-view-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-data-view-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-data-view-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-data-view-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-data-view-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-data-view-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Detect whether or not an object is a DataView.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-data-view-x
 */

/* eslint strict: 1, max-statements: 1 */

/* global module, DataView, ArrayBuffer */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isObjectLike = _dereq_('is-object-like-x');
  var hasDView = typeof DataView === 'function';
  var getByteLength;
  var legacyCheck;

  if (hasDView) {
    if (_dereq_('has-to-string-tag-x')) {
      try {
        getByteLength = Object.getOwnPropertyDescriptor(
          DataView.prototype,
          'byteLength'
        ).get;
        getByteLength = typeof getByteLength.call(
          new DataView(new ArrayBuffer(4))
        ) !== 'number' && getByteLength;
      } catch (ignore) {
        getByteLength = null;
      }
    }
    if (!getByteLength) {
      var toStringTag = _dereq_('to-string-tag-x');
      var dViewTag = '[object DataView]';
      if (toStringTag(new DataView(new ArrayBuffer(4))) === dViewTag) {
        legacyCheck = function byStringTag(object) {
          return toStringTag(object) === dViewTag;
        };
      } else {
        var isArrayBuffer = _dereq_('is-array-buffer-x');
        legacyCheck = function byDuckType(object) {
          var isByteLength = typeof object.byteLength === 'number';
          var isByteOffset = typeof object.byteOffset === 'number';
          var isGetFloat32 = typeof object.getFloat32 === 'function';
          var isSetFloat64 = typeof object.setFloat64 === 'function';
          return isByteLength && isByteOffset && isGetFloat32 && isSetFloat64 && isArrayBuffer(object.buffer);
        };
      }
    }
  }

  /**
   * Determine if an `object` is an `DataView`.
   *
   * @param {*} object The object to test.
   * @return {boolean} `true` if the `object` is a `DataView`, else `false`.
   * @example
   * var isDataView = require('is-data-view-x');
   * var ab = new ArrayBuffer(4);
   * var dv = new DataView(ab);
   *
   * isDataView(ab); // false
   * isDataView(true); // false
   * isDataView(dv); // true
   */
  module.exports = function isDataView(object) {
    if (!hasDView || !isObjectLike(object)) {
      return false;
    }
    if (legacyCheck) {
      return legacyCheck(object);
    }
    try {
      return typeof getByteLength.call(object) === 'number';
    } catch (ignore) {}
    return false;
  };
}());

},{"has-to-string-tag-x":29,"is-array-buffer-x":33,"is-object-like-x":52,"to-string-tag-x":90}],38:[function(_dereq_,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],39:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-error-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-error-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-error-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-error-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-error-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-error-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-error-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-error-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * isError module. Detect whether a value is an error.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-error-x
 */

/* eslint strict: 1, max-statements: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toStringTag = _dereq_('to-string-tag-x');
  var isObjectLike = _dereq_('is-object-like');
  var isNull = _dereq_('lodash.isnull');
  var $getPrototypeOf = Object.getPrototypeOf || function getPrototypeOf(object) {
    // eslint-disable-next-line no-proto
    var proto = object.__proto__;
    if (proto || isNull(proto)) {
      return proto;
    } else if (toStringTag(object.constructor) === '[object Function]') {
      return object.constructor.prototype;
    } else if (object instanceof Object) {
      return Object.prototype;
    } else {
      return null;
    }
  };

  var errorCheck = function checkIfError(value) {
    return toStringTag(value) === '[object Error]';
  };

  if (!errorCheck(Error.prototype)) {
    var errorProto = Error.prototype;
    var testStringTag = errorCheck;
    errorCheck = function checkIfError(value) {
      return value === errorProto || testStringTag(value);
    };
  }

  /**
   * Determine whether or not a given `value` is an `Error` type.
   *
   * @param {*} value The object to be tested.
   * @return {boolean} Returns `true` if `value` is an `Error` type,
   *  else `false`.
   * @example
   * var isError = require('is-error-x');
   *
   * isError(); // false
   * isError(Number.MIN_VALUE); // false
   * isError('abc'); // false
   * isError(new Error()); //true
   */
  module.exports = function isError(value) {
    if (!isObjectLike(value)) {
      return false;
    }
    var object = value;
    var maxLoop = 100;
    while (object && maxLoop > -1) {
      if (errorCheck(object)) {
        return true;
      }
      object = $getPrototypeOf(object);
      maxLoop -= 1;
    }
    return false;
  };
}());

},{"is-object-like":53,"lodash.isnull":64,"to-string-tag-x":90}],40:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-finite-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/is-finite-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-finite-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-finite-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-finite-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-finite-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-finite-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-finite-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for Number.isFinite.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-number.isfinite|20.1.2.2 Number.isFinite ( number )}
 *
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-finite-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $isNaN = _dereq_('is-nan');

  var $isFinite;
  if (typeof Number.isFinite === 'function') {
    try {
      if (Number.isFinite(9007199254740991) && !Number.isFinite(Infinity)) {
        $isFinite = Number.isFinite;
      }
    } catch (ignore) {}
  }

  /**
   * This method determines whether the passed value is a finite number.
   *
   * @param {*} number The value to be tested for finiteness.
   * @return {boolean} A Boolean indicating whether or not the given value is a finite number.
   * @example
   * var numIsFinite = require('is-finite-x');
   *
   * numIsFinite(Infinity);  // false
   * numIsFinite(NaN);       // false
   * numIsFinite(-Infinity); // false
   *
   * numIsFinite(0);         // true
   * numIsFinite(2e64);      // true
   *
   * numIsFinite('0');       // false, would've been true with
   *                         // global isFinite('0')
   * numIsFinite(null);      // false, would've been true with
   */
  module.exports = $isFinite || function isFinite(number) {
    return !(typeof number !== 'number' || $isNaN(number) || number === Infinity || number === -Infinity);
  };
}());

},{"is-nan":46}],41:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-function-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/is-function-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-function-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-function-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-function-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-function-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-function-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-function-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Determine whether a given value is a function object.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-function-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var fToString = Function.prototype.toString;
  var toStringTag = _dereq_('to-string-tag-x');
  var hasToStringTag = _dereq_('has-to-string-tag-x');
  var isPrimitive = _dereq_('is-primitive');
  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';
  var asyncTag = '[object AsyncFunction]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @private
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is correctly classified,
   * else `false`.
   */
  var tryFuncToString = function funcToString(value) {
    try {
      fToString.call(value);
      return true;
    } catch (ignore) {}
    return false;
  };

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is correctly classified,
   * else `false`.
   * @example
   * var isFunction = require('is-function-x');
   *
   * isFunction(); // false
   * isFunction(Number.MIN_VALUE); // false
   * isFunction('abc'); // false
   * isFunction(true); // false
   * isFunction({ name: 'abc' }); // false
   * isFunction(function () {}); // true
   * isFunction(new Function ()); // true
   * isFunction(function* test1() {}); // true
   * isFunction(function test2(a, b) {}); // true
   * isFunction(class Test {}); // true
   * isFunction((x, y) => {return this;}); // true
   */
  module.exports = function isFunction(value) {
    if (isPrimitive(value)) {
      return false;
    }
    if (hasToStringTag) {
      return tryFuncToString(value);
    }
    var strTag = toStringTag(value);
    return strTag === funcTag || strTag === genTag || strTag === asyncTag;
  };
}());

},{"has-to-string-tag-x":29,"is-primitive":54,"to-string-tag-x":90}],42:[function(_dereq_,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],43:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var generatorFunc = getGeneratorFunc();
var GeneratorFunction = generatorFunc ? getProto(generatorFunc) : {};

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	return getProto(fn) === GeneratorFunction;
};

},{}],44:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-map-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-map-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-map-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-map-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-map-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-map-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-map-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-map-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Detect whether or not an object is an ES6 Map.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-map-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isObjectLike;
  var getSize;

  if (typeof Map === 'function') {
    try {
      getSize = Object.getOwnPropertyDescriptor(Map.prototype, 'size').get;
      getSize = typeof getSize.call(new Map()) === 'number' && getSize;
      isObjectLike = _dereq_('is-object-like-x');
    } catch (ignore) {
      getSize = null;
    }
  }

  /**
   * Determine if an `object` is a `Map`.
   *
   * @param {*} object The object to test.
   * @return {boolean} `true` if the `object` is a `Map`,
   *  else false`
   * @example
   * var isMap = require('is-map-x');
   * var m = new Map();
   *
   * isMap([]); // false
   * isMap(true); // false
   * isMap(m); // true
   */
  module.exports = function isMap(object) {
    if (!getSize || !isObjectLike(object)) {
      return false;
    }
    try {
      return typeof getSize.call(object) === 'number';
    } catch (ignore) {}
    return false;
  };
}());

},{"is-object-like-x":52}],45:[function(_dereq_,module,exports){
'use strict';

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function isNaN(value) {
	return value !== value;
};

},{}],46:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');

var implementation = _dereq_('./implementation');
var getPolyfill = _dereq_('./polyfill');
var shim = _dereq_('./shim');

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

define(implementation, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = implementation;

},{"./implementation":45,"./polyfill":47,"./shim":48,"define-properties":8}],47:[function(_dereq_,module,exports){
'use strict';

var implementation = _dereq_('./implementation');

module.exports = function getPolyfill() {
	if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')) {
		return Number.isNaN;
	}
	return implementation;
};

},{"./implementation":45}],48:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function shimNumberIsNaN() {
	var polyfill = getPolyfill();
	define(Number, { isNaN: polyfill }, { isNaN: function () { return Number.isNaN !== polyfill; } });
	return polyfill;
};

},{"./polyfill":47,"define-properties":8}],49:[function(_dereq_,module,exports){
'use strict';

module.exports = function isNegativeZero(number) {
	return number === 0 && (1 / number) === -Infinity;
};


},{}],50:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-nil-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-nil-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-nil-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-nil-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-nil-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-nil-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-nil-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-nil-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Checks if `value` is `null` or `undefined`.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-nil-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isUndefined = _dereq_('validate.io-undefined');
  var isNull = _dereq_('lodash.isnull');

  /**
   * Checks if `value` is `null` or `undefined`.
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
   * @example
   *
   * _.isNil(null);
   * // => true
   *
   * _.isNil(void 0);
   * // => true
   *
   * _.isNil(NaN);
   * // => false
   */
  module.exports = function isNil(value) {
    return isNull(value) || isUndefined(value);
  };
}());

},{"lodash.isnull":64,"validate.io-undefined":93}],51:[function(_dereq_,module,exports){
'use strict';

var numToStr = Number.prototype.toString;
var tryNumberObject = function tryNumberObject(value) {
	try {
		numToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var numClass = '[object Number]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isNumberObject(value) {
	if (typeof value === 'number') { return true; }
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryNumberObject(value) : toStr.call(value) === numClass;
};

},{}],52:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-object-like-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-object-like-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-object-like-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-object-like-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-object-like-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-object-like-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-object-like-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-object-like-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 isObjectLike module.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-object-like-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isFunction = _dereq_('is-function-x');
  var isPrimitive = _dereq_('is-primitive');

  /**
   * Checks if `value` is object-like. A value is object-like if it's not a
   * primitive and not a function.
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   * var isObjectLike = require('is-object-like-x');
   *
   * isObjectLike({});
   * // => true
   *
   * isObjectLike([1, 2, 3]);
   * // => true
   *
   * isObjectLike(_.noop);
   * // => false
   *
   * isObjectLike(null);
   * // => false
   */
  module.exports = function isObjectLike(value) {
    return !isPrimitive(value) && !isFunction(value);
  };
}());

},{"is-function-x":41,"is-primitive":54}],53:[function(_dereq_,module,exports){
'use strict'

module.exports = function isObjectLike (value) {
  return (typeof value === 'object' || typeof value === 'function') && value !== null
}

},{}],54:[function(_dereq_,module,exports){
/*!
 * is-primitive <https://github.com/jonschlinkert/is-primitive>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

// see http://jsperf.com/testing-value-is-primitive/7
module.exports = function isPrimitive(value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],55:[function(_dereq_,module,exports){
module.exports = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

},{}],56:[function(_dereq_,module,exports){
'use strict';

var has = _dereq_('has');
var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
	try {
		var lastIndex = value.lastIndex;
		value.lastIndex = 0;

		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	} finally {
		value.lastIndex = lastIndex;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (!hasToStringTag) {
		return toStr.call(value) === regexClass;
	}

	var descriptor = gOPD(value, 'lastIndex');
	var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');
	if (!hasLastIndexDataProperty) {
		return false;
	}

	return tryRegexExecCall(value);
};

},{"has":30}],57:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-set-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-set-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-set-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-set-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-set-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-set-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-set-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-set-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Detect whether or not an object is an ES6 SET.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-set-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isObjectLike;
  var getSize;

  if (typeof Set === 'function') {
    try {
      getSize = Object.getOwnPropertyDescriptor(Set.prototype, 'size').get;
      getSize = typeof getSize.call(new Set()) === 'number' && getSize;
      isObjectLike = _dereq_('is-object-like-x');
    } catch (ignore) {
      getSize = null;
    }
  }

  /**
   * Determine if an `object` is a `Set`.
   *
   * @param {*} object The object to test.
   * @return {boolean} `true` if the `object` is a `Set`,
   *  else false`
   * @example
   * var isSet = require('is-set-x');
   * var s = new Set();
   *
   * isSet([]); // false
   * isSet(true); // false
   * isSet(s); // true
   */
  module.exports = function isSet(object) {
    if (!getSize || !isObjectLike(object)) {
      return false;
    }
    try {
      return typeof getSize.call(object) === 'number';
    } catch (ignore) {}

    return false;
  };
}());

},{"is-object-like-x":52}],58:[function(_dereq_,module,exports){
'use strict';

var strValue = String.prototype.valueOf;
var tryStringObject = function tryStringObject(value) {
	try {
		strValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var strClass = '[object String]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isString(value) {
	if (typeof value === 'string') { return true; }
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
};

},{}],59:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}

},{}],60:[function(_dereq_,module,exports){
(function (global){
'use strict';

var forEach = _dereq_('foreach');

var toStr = Object.prototype.toString;
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var typedArrays = {
	Float32Array: true,
	Float64Array: true,
	Int8Array: true,
	Int16Array: true,
	Int32Array: true,
	Uint8Array: true,
	Uint8ClampedArray: true,
	Uint16Array: true,
	Uint32Array: true
};

var slice = String.prototype.slice;
var toStrTags = {};
var gOPD = Object.getOwnPropertyDescriptor;
if (hasToStringTag && gOPD && Object.getPrototypeOf) {
	forEach(typedArrays, function (_, typedArray) {
		var arr = new global[typedArray]();
		if (!(Symbol.toStringTag in arr)) {
			throw new EvalError('this engine has support for Symbol.toStringTag, but ' + typedArray + ' does not have the property! Please report this.');
		}
		var proto = Object.getPrototypeOf(arr);
		var descriptor = gOPD(proto, Symbol.toStringTag);
		if (!descriptor) {
			var superProto = Object.getPrototypeOf(proto);
			descriptor = gOPD(superProto, Symbol.toStringTag);
		}
		toStrTags[typedArray] = descriptor.get;
	});
}

var tryTypedArrays = function tryTypedArrays(value) {
	var anyTrue = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) { return !!typedArrays[slice.call(toStr.call(value), 8, -1)]; }
	if (!gOPD) { return false; }
	return tryTypedArrays(value);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"foreach":23}],61:[function(_dereq_,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],62:[function(_dereq_,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.filter` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[++resIndex] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;

},{}],63:[function(_dereq_,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.map` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],64:[function(_dereq_,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is `null`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * _.isNull(null);
 * // => true
 *
 * _.isNull(void 0);
 * // => false
 */
function isNull(value) {
  return value === null;
}

module.exports = isNull;

},{}],65:[function(_dereq_,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/**
 * This method returns `true`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `true`.
 * @example
 *
 * _.times(2, _.stubTrue);
 * // => [true, true]
 */
function stubTrue() {
  return true;
}

module.exports = stubTrue;

},{}],66:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/math-sign-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/math-sign-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/math-sign-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/math-sign-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/math-sign-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/math-sign-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/math-sign-x" title="npm version">
 * <img src="https://badge.fury.io/js/math-sign-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for Math.sign.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-math.sign|20.2.2.29 Math.sign(x)}
 *
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module math-sign-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $isNaN = _dereq_('is-nan');

  var $sign;
  if (typeof Math.sign === 'function') {
    try {
      if (Math.sign(10) === 1 && Math.sign(-10) === -1 && Math.sign(0) === 0) {
        $sign = Math.sign;
      }
    } catch (ignore) {}
  }

  /**
   * This method returns the sign of a number, indicating whether the number is positive,
   * negative or zero.
   *
   * @param {*} x A number.
   * @return {number} A number representing the sign of the given argument. If the argument
   * is a positive number, negative number, positive zero or negative zero, the function will
   * return 1, -1, 0 or -0 respectively. Otherwise, NaN is returned.
   * @example
   * var mathSign = require('math-sign-x');
   *
   * mathSign(3);     //  1
   * mathSign(-3);    // -1
   * mathSign('-3');  // -1
   * mathSign(0);     //  0
   * mathSign(-0);    // -0
   * mathSign(NaN);   // NaN
   * mathSign('foo'); // NaN
   * mathSign();      // NaN
   */
  module.exports = $sign || function sign(x) {
    var n = Number(x);
    if (n === 0 || $isNaN(n)) {
      return n;
    }
    return n > 0 ? 1 : -1;
  };
}());

},{"is-nan":46}],67:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-create-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-create-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-create-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-create-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-create-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-create-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-create-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-create-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.create
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-create-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isPrimitive = _dereq_('is-primitive');
  var isUndefined = _dereq_('validate.io-undefined');
  var isNull = _dereq_('lodash.isnull');
  var $defineProperties = _dereq_('object-define-properties-x');
  var $create = Object.create;

  // ES5 15.2.3.5
  // http://es5.github.com/#x15.2.3.5
  if (!$create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({ __proto__: null } instanceof Object);
    // the following produces false positives
    // in Opera Mini => not a reliable check
    // Object.prototype.__proto__ === null

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    /* global ActiveXObject */
    var shouldUseActiveX = function _shouldUseActiveX() {
      // return early if document.domain not set
      if (!document.domain) {
        return false;
      }

      try {
        return !!new ActiveXObject('htmlfile');
      } catch (exception) {
        return false;
      }
    };

    // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var getEmptyViaActiveX = function _getEmptyViaActiveX() {
      var empty;
      var xDoc;

      xDoc = new ActiveXObject('htmlfile');

      var script = 'script';
      xDoc.write('<' + script + '></' + script + '>');
      xDoc.close();

      empty = xDoc.parentWindow.Object.prototype;
      xDoc = null;

      return empty;
    };

    // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150
    var getEmptyViaIFrame = function _getEmptyViaIFrame() {
      var iframe = document.createElement('iframe');
      var parent = document.body || document.documentElement;
      var empty;

      iframe.style.display = 'none';
      parent.appendChild(iframe);
      // eslint-disable-next-line no-script-url
      iframe.src = 'javascript:';

      empty = iframe.contentWindow.Object.prototype;
      parent.removeChild(iframe);
      iframe = null;

      return empty;
    };

    /* global document */
    if (supportsProto || typeof document === 'undefined') {
      createEmpty = function () {
        return { __proto__: null };
      };
    } else {
      // In old IE __proto__ can't be used to manually set `null`, nor does
      // any other method exist to make an object that inherits from nothing,
      // aside from Object.prototype itself. Instead, create a new global
      // object and *steal* its Object.prototype and strip it bare. This is
      // used as the prototype to create nullary objects.
      createEmpty = function () {
        // Determine which approach to use
        // see https://github.com/es-shims/es5-shim/issues/150
        var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

        delete empty.constructor;
        delete empty.hasOwnProperty;
        delete empty.propertyIsEnumerable;
        delete empty.isPrototypeOf;
        delete empty.toLocaleString;
        delete empty.toString;
        delete empty.valueOf;

        var E = function Empty() {};
        E.prototype = empty;
        // short-circuit future calls
        createEmpty = function () {
          return new E();
        };
        return new E();
      };
    }

    $create = function create(prototype, properties) {

      var object;
      var T = function Type() {}; // An empty constructor.

      if (isNull(prototype)) {
        object = createEmpty();
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
        // eslint-disable-next-line no-proto
        object.__proto__ = prototype;
      }

      if (!isUndefined(properties)) {
        $defineProperties(object, properties);
      }

      return object;
    };
  }

  /**
   * This method method creates a new object with the specified prototype object and properties.
   *
   * @param {*} prototype The object which should be the prototype of the newly-created object.
   * @param {*} [properties] If specified and not undefined, an object whose enumerable own properties
   * (that is, those properties defined upon itself and not enumerable properties along its prototype chain)
   * specify property descriptors to be added to the newly-created object, with the corresponding property names.
   * @throws {TypeError} If the properties parameter isn't null or an object.
   * @return {boolean} A new object with the specified prototype object and properties.
   * @example
   * var create = require('object-create-x');
   */
  module.exports = $create;
}());

},{"is-primitive":54,"lodash.isnull":64,"object-define-properties-x":68,"validate.io-undefined":93}],68:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-define-properties-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-define-properties-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-define-properties-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-properties-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-define-properties-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-properties-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-define-properties-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-define-properties-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.defineProperties
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-properties-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module, document */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var forEach = _dereq_('foreach');
  var $keys = _dereq_('object-keys');
  var $defineProperty = _dereq_('object-define-property-x');
  var $defineProperties = Object.defineProperties;

  // ES5 15.2.3.6
  // http://es5.github.com/#x15.2.3.6

  // Patch for WebKit and IE8 standard mode
  // Designed by hax <hax.github.com>
  // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
  // IE8 Reference:
  //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
  //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
  // WebKit Bugs:
  //     https://bugs.webkit.org/show_bug.cgi?id=36423

  var doesDefinePropertyWork = function _doesDefinePropertyWork(object) {
    try {
      $defineProperty(object, 'sentinel', {});
      return 'sentinel' in object;
    } catch (exception) {
      return false;
    }
  };

  // check whether defineProperty works if it's given. Otherwise,
  // shim partially.
  if ($defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertiesFallback = Object.defineProperties;
    }
  }

  // ES5 15.2.3.7
  // http://es5.github.com/#x15.2.3.7
  if (!$defineProperties || definePropertiesFallback) {
    $defineProperties = function defineProperties(object, properties) {
      // make a valiant attempt to use the real defineProperties
      if (definePropertiesFallback) {
        try {
          return definePropertiesFallback.call(Object, object, properties);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      forEach($keys(properties), function (property) {
        if (property !== '__proto__') {
          $defineProperty(object, property, properties[property]);
        }
      });
      return object;
    };
  }

  /**
   * This method defines new or modifies existing properties directly on an object, returning the object.
   *
   * @param {Object} object The object on which to define or modify properties.
   * @param {Object} properties An object whose own enumerable properties constitute descriptors for the
   * properties to be defined or modified.
   * @return {Object} The object that was passed to the function.
   * @example
   * var defineProperties = require('object-define-properties-x');
   *
   * var obj = {};
   * defineProperties(obj, {
   *   'property1': {
   *     value: true,
   *     writable: true
   *   },
   *   'property2': {
   *     value: 'Hello',
   *     writable: true
   *   }
   *   // etc. etc.
   * });
   */
  module.exports = $defineProperties;
}());

},{"foreach":23,"object-define-property-x":69,"object-keys":71}],69:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-define-property-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-define-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-define-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-define-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-define-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-define-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.deineProperty
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-property-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module, document */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isPrimitive = _dereq_('is-primitive');
  var owns = _dereq_('has-own-property-x');
  var $defineProperty = Object.defineProperty;

  var prototypeOfObject = Object.prototype;
  // If JS engine supports accessors creating shortcuts.
  var defineGetter;
  var defineSetter;
  var lookupGetter;
  var lookupSetter;
  var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
  if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle, no-restricted-properties */
    defineGetter = prototypeOfObject.__defineGetter__;
    defineSetter = prototypeOfObject.__defineSetter__;
    lookupGetter = prototypeOfObject.__lookupGetter__;
    lookupSetter = prototypeOfObject.__lookupSetter__;
    /* eslint-enable no-underscore-dangle, no-restricted-properties */
  }

  // ES5 15.2.3.6
  // http://es5.github.com/#x15.2.3.6

  // Patch for WebKit and IE8 standard mode
  // Designed by hax <hax.github.com>
  // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
  // IE8 Reference:
  //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
  //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
  // WebKit Bugs:
  //     https://bugs.webkit.org/show_bug.cgi?id=36423

  var doesDefinePropertyWork = function _doesDefinePropertyWork(object) {
    try {
      $defineProperty(object, 'sentinel', {});
      return 'sentinel' in object;
    } catch (exception) {
      return false;
    }
  };

  // check whether defineProperty works if it's given. Otherwise,
  // shim partially.
  if ($defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertyFallback = Object.defineProperty;
    }
  }

  if (!$defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

    $defineProperty = function defineProperty(object, property, descriptor) {
      if (isPrimitive(object)) {
        throw new TypeError(ERR_NON_OBJECT_TARGET + object);
      }
      if (isPrimitive(descriptor)) {
        throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
      }
      // make a valiant attempt to use the real defineProperty
      // for I8's DOM elements.
      if (definePropertyFallback) {
        try {
          return definePropertyFallback.call(Object, object, property, descriptor);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      // If it's a data property.
      if ('value' in descriptor) {
        // fail silently if 'writable', 'enumerable', or 'configurable'
        // are requested but not supported
        /*
        // alternate approach:
        if ( // can't implement these features; allow false but not true
            ('writable' in descriptor && !descriptor.writable) ||
            ('enumerable' in descriptor && !descriptor.enumerable) ||
            ('configurable' in descriptor && !descriptor.configurable)
        ))
            throw new RangeError(
              'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
            );
        */

        if (supportsAccessors && (lookupGetter.call(object, property) || lookupSetter.call(object, property))) {
          // As accessors are supported only on engines implementing
          // `__proto__` we can safely override `__proto__` while defining
          // a property to make sure that we don't hit an inherited
          // accessor.
          /* eslint-disable no-proto */
          var prototype = object.__proto__;
          object.__proto__ = prototypeOfObject;
          // Deleting a property anyway since getter / setter may be
          // defined on object itself.
          delete object[property];
          object[property] = descriptor.value;
          // Setting original `__proto__` back now.
          object.__proto__ = prototype;
          /* eslint-enable no-proto */
        } else {
          object[property] = descriptor.value;
        }
      } else {
        var hasGetter = 'get' in descriptor;
        var hasSetter = 'set' in descriptor;
        if (!supportsAccessors && (hasGetter || hasSetter)) {
          throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
        }
        // If we got that far then getters and setters can be defined !!
        if (hasGetter) {
          defineGetter.call(object, property, descriptor.get);
        }
        if (hasSetter) {
          defineSetter.call(object, property, descriptor.set);
        }
      }
      return object;
    };
  }

  /**
   * This method defines a new property directly on an object, or modifies an existing property on an object,
   * and returns the object.
   *
   * @param {Object} object The object on which to define the property.
   * @param {string} property The name of the property to be defined or modified.
   * @param {Object} descriptor The descriptor for the property being defined or modified.
   * @return {Object} The object that was passed to the function.
   * @example
   * var defineProperty = require('object-define-property-x');
   *
   * var o = {}; // Creates a new object
   *
   * Object.defineProperty(o, 'a', {
   *   value: 37,
   *   writable: true
   * });
   */
  module.exports = $defineProperty;
}());

},{"has-own-property-x":27,"is-primitive":54}],70:[function(_dereq_,module,exports){
"use strict";

/* https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is */

var NumberIsNaN = function (value) {
	return value !== value;
};

module.exports = function is(a, b) {
	if (a === 0 && b === 0) {
		return 1 / a === 1 / b;
	} else if (a === b) {
		return true;
	} else if (NumberIsNaN(a) && NumberIsNaN(b)) {
		return true;
	}
	return false;
};


},{}],71:[function(_dereq_,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = _dereq_('./isArguments');
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":72}],72:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],73:[function(_dereq_,module,exports){
'use strict';

var keys = _dereq_('object-keys');

module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; }
	if (keys(obj).length !== 0) { return false; }
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{"object-keys":71}],74:[function(_dereq_,module,exports){
'use strict';

// modified from https://github.com/es-shims/es6-shim
var keys = _dereq_('object-keys');
var bind = _dereq_('function-bind');
var canBeObject = function (obj) {
	return typeof obj !== 'undefined' && obj !== null;
};
var hasSymbols = _dereq_('./hasSymbols')();
var toObject = Object;
var push = bind.call(Function.call, Array.prototype.push);
var propIsEnumerable = bind.call(Function.call, Object.prototype.propertyIsEnumerable);
var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;

module.exports = function assign(target, source1) {
	if (!canBeObject(target)) { throw new TypeError('target must be an object'); }
	var objTarget = toObject(target);
	var s, source, i, props, syms, value, key;
	for (s = 1; s < arguments.length; ++s) {
		source = toObject(arguments[s]);
		props = keys(source);
		var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			syms = getSymbols(source);
			for (i = 0; i < syms.length; ++i) {
				key = syms[i];
				if (propIsEnumerable(source, key)) {
					push(props, key);
				}
			}
		}
		for (i = 0; i < props.length; ++i) {
			key = props[i];
			value = source[key];
			if (propIsEnumerable(source, key)) {
				objTarget[key] = value;
			}
		}
	}
	return objTarget;
};

},{"./hasSymbols":73,"function-bind":25,"object-keys":71}],75:[function(_dereq_,module,exports){
'use strict';

var defineProperties = _dereq_('define-properties');

var implementation = _dereq_('./implementation');
var getPolyfill = _dereq_('./polyfill');
var shim = _dereq_('./shim');

var polyfill = getPolyfill();

defineProperties(polyfill, {
	implementation: implementation,
	getPolyfill: getPolyfill,
	shim: shim
});

module.exports = polyfill;

},{"./implementation":74,"./polyfill":76,"./shim":77,"define-properties":8}],76:[function(_dereq_,module,exports){
'use strict';

var implementation = _dereq_('./implementation');

var lacksProperEnumerationOrder = function () {
	if (!Object.assign) {
		return false;
	}
	// v8, specifically in node 4.x, has a bug with incorrect property enumeration order
	// note: this does not detect the bug unless there's 20 characters
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function () {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	// Firefox 37 still has "pending exception" logic in its Object.assign implementation,
	// which is 72% slower than our shim, and Firefox 40's native implementation.
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

module.exports = function getPolyfill() {
	if (!Object.assign) {
		return implementation;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation;
	}
	if (assignHasPendingExceptions()) {
		return implementation;
	}
	return Object.assign;
};

},{"./implementation":74}],77:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

module.exports = function shimAssign() {
	var polyfill = getPolyfill();
	define(
		Object,
		{ assign: polyfill },
		{ assign: function () { return Object.assign !== polyfill; } }
	);
	return polyfill;
};

},{"./polyfill":76,"define-properties":8}],78:[function(_dereq_,module,exports){
module.exports = reduce

var objectKeys = _dereq_('object-keys');

function reduce(list, iterator) {
    var keys = objectKeys(list)
        , i = 0
        , accumulator = list[0]
        , context = this

    if (arguments.length === 2) {
        i = 1
    } else if (arguments.length === 3) {
        accumulator = arguments[2]
    } else if (arguments.length >= 4) {
        context = arguments[2]
        accumulator = arguments[3]
    }

    for (var len = keys.length; i < len; i++) {
        var key = keys[i]
            , value = list[key]

        accumulator = iterator.call(context, accumulator, value, key, list)
    }

    return accumulator
}


},{"object-keys":71}],79:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/require-object-coercible-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/require-object-coercible-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/require-object-coercible-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/require-object-coercible-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/require-object-coercible-x#info=devDependencies"
 * title="devDependency status">
 * <img
 * src="https://david-dm.org/Xotic750/require-object-coercible-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a
 * href="https://badge.fury.io/js/require-object-coercible-x"
 * title="npm version">
 * <img src="https://badge.fury.io/js/require-object-coercible-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for RequireObjectCoercible.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-requireobjectcoercible|7.2.1 RequireObjectCoercible ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module require-object-coercible-x
 */

/* eslint strict: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isNil = _dereq_('is-nil-x');

  /**
   * The abstract operation RequireObjectCoercible throws an error if argument
   * is a value that cannot be converted to an Object using ToObject.
   *
   * @param {*} value The `value` to check.
   * @throws {TypeError} If `value` is a `null` or `undefined`.
   * @return {string} The `value`.
   * @example
   * var RequireObjectCoercible = require('require-object-coercible-x');
   *
   * RequireObjectCoercible(); // TypeError
   * RequireObjectCoercible(null); // TypeError
   * RequireObjectCoercible('abc'); // 'abc'
   * RequireObjectCoercible(true); // true
   * RequireObjectCoercible(Symbol('foo')); // Symbol('foo')
   */
  module.exports = function RequireObjectCoercible(value) {
    if (isNil(value)) {
      throw new TypeError('Cannot call method on ' + value);
    }
    return value;
  };
}());

},{"is-nil-x":50}],80:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/safe-to-string-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/safe-to-string-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/safe-to-string-x" title="npm version">
 * <img src="https://badge.fury.io/js/safe-to-string-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 safeToString module. Converts a `Symbol` literal or object to `Symbol()`
 * instead of throwing a `TypeError`. Its primary use is for logging/debugging.
 *
 * Requires ES3 or above.
 *
 * @see {@link https://github.com/Xotic750/to-string-x|to-string-x}
 *
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module safe-to-string-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isSymbol = _dereq_('is-symbol');
  var pToString = _dereq_('has-symbol-support-x') && Symbol.prototype.toString;

  /**
   * The abstract operation `safeToString` converts a `Symbol` literal or
   * object to `Symbol()` instead of throwing a `TypeError`.
   *
   * @param {*} value The value to convert to a string.
   * @return {string} The converted value.
   * @example
   * var safeToString = require('safe-to-string-x');
   *
   * safeToString(); // 'undefined'
   * safeToString(null); // 'null'
   * safeToString('abc'); // 'abc'
   * safeToString(true); // 'true'
   * safeToString(Symbol('foo')); // 'Symbol(foo)'
   * safeToString(Symbol.iterator); // 'Symbol(Symbol.iterator)'
   * safeToString(Object(Symbol.iterator)); // 'Symbol(Symbol.iterator)'
   */
  module.exports = function safeToString(value) {
    return pToString && isSymbol(value) ? pToString.call(value) : String(value);
  };
}());

},{"has-symbol-support-x":28,"is-symbol":59}],81:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/same-value-zero-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/same-value-zero-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/same-value-zero-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/same-value-zero-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/same-value-zero-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/same-value-zero-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/same-value-zero-x" title="npm version">
 * <img src="https://badge.fury.io/js/same-value-zero-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for SameValueZero.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero|7.2.10 SameValueZero(x, y)}
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module same-value-zero-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var is = _dereq_('object-is');

  /**
   * This method determines whether two values are the same value.
   * SameValueZero differs from SameValue (`Object.is`) only in its treatment
   * of +0 and -0.
   *
   * @param {*} x The first value to compare.
   * @param {*} y The second value to compare.
   * @return {boolean} A Boolean indicating whether or not the two arguments
   * are the same value.
   * @example
   * var sameValueZero = require('same-value-zero-x');
   * sameValueZero(0, 0); // true
   * sameValueZero(-0, -0); // true
   * sameValueZero(0, -0); // false
   * sameValueZero(NaN, NaN); //true
   * sameValueZero(Infinity, Infinity); // true
   * sameValueZero(-Infinity, -Infinity); // true
   */
  module.exports = function sameValueZero(x, y) {
    return x === y || is(x, y);
  };
}());

},{"object-is":70}],82:[function(_dereq_,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stackframe', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.StackFrame = factory();
    }
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str[0].toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps);

    function StackFrame(obj) {
        if (obj instanceof Object) {
            for (var i = 0; i < props.length; i++) {
                if (obj.hasOwnProperty(props[i]) && obj[props[i]] !== undefined) {
                    this['set' + _capitalize(props[i])](obj[props[i]]);
                }
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));

},{}],83:[function(_dereq_,module,exports){
'use strict';

var bind = _dereq_('function-bind');
var ES = _dereq_('es-abstract/es5');
var replace = bind.call(Function.call, String.prototype.replace);

var leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
var rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;

module.exports = function trim() {
	var S = ES.ToString(ES.CheckObjectCoercible(this));
	return replace(replace(S, leftWhitespace, ''), rightWhitespace, '');
};

},{"es-abstract/es5":10,"function-bind":25}],84:[function(_dereq_,module,exports){
'use strict';

var bind = _dereq_('function-bind');
var define = _dereq_('define-properties');

var implementation = _dereq_('./implementation');
var getPolyfill = _dereq_('./polyfill');
var shim = _dereq_('./shim');

var boundTrim = bind.call(Function.call, getPolyfill());

define(boundTrim, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = boundTrim;

},{"./implementation":83,"./polyfill":85,"./shim":86,"define-properties":8,"function-bind":25}],85:[function(_dereq_,module,exports){
'use strict';

var implementation = _dereq_('./implementation');

var zeroWidthSpace = '\u200b';

module.exports = function getPolyfill() {
	if (String.prototype.trim && zeroWidthSpace.trim() === zeroWidthSpace) {
		return String.prototype.trim;
	}
	return implementation;
};

},{"./implementation":83}],86:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

module.exports = function shimStringTrim() {
	var polyfill = getPolyfill();
	define(String.prototype, { trim: polyfill }, { trim: function () { return String.prototype.trim !== polyfill; } });
	return polyfill;
};

},{"./polyfill":85,"define-properties":8}],87:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-integer-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-integer-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-integer-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-integer-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-integer-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/to-integer-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/to-integer-x" title="npm version">
 * <img src="https://badge.fury.io/js/to-integer-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for toInteger.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger|7.1.4 ToInteger ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-integer-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $isNaN = _dereq_('is-nan');
  var $isFinite = _dereq_('is-finite-x');
  var $sign = _dereq_('math-sign-x');

  /**
   * Converts `value` to an integer.
   *
   * @param {*} value The value to convert.
   * @return {number} Returns the converted integer.
   *
   * @example
   * var toInteger = require('to-integer-x');
   * toInteger(3); // 3
   * toInteger(Number.MIN_VALUE); // 0
   * toInteger(Infinity); // 1.7976931348623157e+308
   * toInteger('3'); // 3
   */
  module.exports = function ToInteger(value) {
    var number = Number(value);
    if ($isNaN(number)) {
      return 0;
    }
    if (number === 0 || !$isFinite(number)) {
      return number;
    }
    return $sign(number) * Math.floor(Math.abs(number));
  };
}());

},{"is-finite-x":40,"is-nan":46,"math-sign-x":66}],88:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-length-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-length-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-length-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-length-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-length-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/to-length-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/to-length-x" title="npm version">
 * <img src="https://badge.fury.io/js/to-length-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for ToLength.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-tolength|7.1.15 ToLength ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-length-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toInteger = _dereq_('to-integer-x');
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Converts `value` to an integer suitable for use as the length of an
   * array-like object.
   *
   * @param {*} value The value to convert.
   * @return {number} Returns the converted integer.
   * @example
   * var toLength = require('to-length-x');
   * toLength(3); // 3
   * toLength(Number.MIN_VALUE); // 0
   * toLength(Infinity); // Number.MAX_SAFE_INTEGER
   * toLength('3'); // 3
   */
  module.exports = function ToLength(value) {
    var len = toInteger(value);
    if (len <= 0) {
      return 0;
    } // includes converting -0 to +0
    if (len > MAX_SAFE_INTEGER) {
      return MAX_SAFE_INTEGER;
    }
    return len;
  };
}());

},{"to-integer-x":87}],89:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-object-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-object-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-object-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-object-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-object-x#info=devDependencies"
 * title="devDependency status">
 * <img
 * src="https://david-dm.org/Xotic750/to-object-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a
 * href="https://badge.fury.io/js/to-object-x"
 * title="npm version">
 * <img src="https://badge.fury.io/js/to-object-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for ToObject.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-toobject|7.1.13 ToObject ( argument )}
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-object-x
 */

/* eslint strict: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $requireObjectCoercible = _dereq_('require-object-coercible-x');

  /**
   * The abstract operation ToObject converts argument to a value of
   * type Object.
   *
   * @param {*} value The `value` to convert.
   * @throws {TypeError} If `value` is a `null` or `undefined`.
   * @return {!Object} The `value` converted to an object.
   * @example
   * var ToObject = require('to-object-x');
   *
   * ToObject(); // TypeError
   * ToObject(null); // TypeError
   * ToObject('abc'); // Object('abc')
   * ToObject(true); // Object(true)
   * ToObject(Symbol('foo')); // Object(Symbol('foo'))
   */
  module.exports = function ToObject(value) {
    return Object($requireObjectCoercible(value));
  };
}());

},{"require-object-coercible-x":79}],90:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-string-tag-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/to-string-tag-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-string-tag-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-string-tag-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-string-tag-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/to-string-tag-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/to-string-tag-x" title="npm version">
 * <img src="https://badge.fury.io/js/to-string-tag-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Get an object's ES6 @@toStringTag.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring|19.1.3.6 Object.prototype.toString ( )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-string-tag-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isNull = _dereq_('lodash.isnull');
  var isUndefined = _dereq_('validate.io-undefined');
  var nullTag = '[object Null]';
  var undefTag = '[object Undefined]';
  var toStr = Object.prototype.toString;

  /**
   * The `toStringTag` method returns "[object type]", where type is the
   * object type.
   *
   * @param {*} value The object of which to get the object type string.
   * @return {string} The object type string.
   * @example
   * var o = new Object();
   *
   * toStringTag(o); // returns '[object Object]'
   */
  module.exports = function toStringTag(value) {
    if (isNull(value)) {
      return nullTag;
    }
    if (isUndefined(value)) {
      return undefTag;
    }
    return toStr.call(value);
  };
}());

},{"lodash.isnull":64,"validate.io-undefined":93}],91:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/truncate-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/truncate-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/truncate-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/truncate-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/truncate-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/truncate-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/truncate-x" title="npm version">
 * <img src="https://badge.fury.io/js/truncate-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * truncate module.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module truncate-x
 */

'use strict';

var isUndefined = _dereq_('validate.io-undefined');
var toLength = _dereq_('to-length-x');
var isRegExp = _dereq_('is-regex');
var safeToString = _dereq_('safe-to-string-x');
var isObjectLike = _dereq_('is-object-like-x');

/* Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/* Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange = '\\u20d0-\\u20f0';
var rsVarRange = '\\ufe0e\\ufe0f';

/* Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']';
var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ = '\\u200d';

/* Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange + ']?';
var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/*
 * Used to match string symbols
 * @see https://mathiasbynens.be/notes/javascript-unicode
 */
var reComplexSymbol = new RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/*
 * Used to detect strings with [zero-width joiners or code points from
 * the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/).
 */
var reHasComplexSymbol = new RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the string size.
 */
var stringSize = function _stringSize(string) {
  if (!string || !reHasComplexSymbol.test(string)) {
    return string.length;
  }
  reComplexSymbol.lastIndex = 0;
  var result = 0;
  while (reComplexSymbol.test(string)) {
    result += 1;
  }
  return result;
};

/**
 * Truncates `string` if it's longer than the given maximum string length.
 * The last characters of the truncated string are replaced with the omission
 * string which defaults to "...".
 *
 * @param {string} string The string to truncate.
 * @param {Object} [options] The options object.
 * @param {number} [options.length=30] The maximum string length.
 * @param {string} [options.omission='...'] The string to indicate text
 * is omitted.
 * @param {RegExp|string} [options.separator] The separator pattern to
 * truncate to.
 * @returns {string} Returns the truncated string.
 * @example
 * var truncate = require('truncate-x');
 *
 * truncate('hi-diddly-ho there, neighborino');
 * // 'hi-diddly-ho there, neighbo...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': ' '
 * });
 * // 'hi-diddly-ho there,...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': /,? +/
 * });
 * // 'hi-diddly-ho there...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'omission': ' [...]'
 * });
 * // 'hi-diddly-ho there, neig [...]'
 */
module.exports = function truncate(string, options) {
  var str = safeToString(string);
  var length = 30;
  var omission = '...';
  var separator;
  if (isObjectLike(options)) {
    if ('separator' in options) {
      separator = options.separator;
    }
    if ('length' in options) {
      length = toLength(options.length);
    }
    if ('omission' in options) {
      omission = safeToString(options.omission);
    }
  }
  var strLength = str.length;
  var matchSymbols;
  if (reHasComplexSymbol.test(str)) {
    matchSymbols = str.match(reComplexSymbol);
    strLength = matchSymbols.length;
  }
  if (length >= strLength) {
    return str;
  }
  var end = length - stringSize(omission);
  if (end < 1) {
    return omission;
  }
  var result = matchSymbols ? matchSymbols.slice(0, end).join('') : str.slice(0, end);
  if (isUndefined(separator)) {
    return result + omission;
  }
  if (matchSymbols) {
    end += result.length - end;
  }
  if (isRegExp(separator)) {
    if (str.slice(end).search(separator)) {
      var substr = result;
      if (!separator.global) {
        separator = new RegExp(separator.source, safeToString(reFlags.exec(separator)) + 'g');
      }
      separator.lastIndex = 0;
      var newEnd;
      var match = separator.exec(substr);
      while (match) {
        newEnd = match.index;
        match = separator.exec(substr);
      }
      result = result.slice(0, isUndefined(newEnd) ? end : newEnd);
    }
  } else if (str.indexOf(separator, end) !== end) {
    var index = result.lastIndexOf(separator);
    if (index > -1) {
      result = result.slice(0, index);
    }
  }
  return result + omission;
};

},{"is-object-like-x":52,"is-regex":56,"safe-to-string-x":80,"to-length-x":88,"validate.io-undefined":93}],92:[function(_dereq_,module,exports){
'use strict';

/**
* FUNCTION: isArray( value )
*	Validates if a value is an array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an array
*/
function isArray( value ) {
	return Object.prototype.toString.call( value ) === '[object Array]';
} // end FUNCTION isArray()

// EXPORTS //

module.exports = Array.isArray || isArray;

},{}],93:[function(_dereq_,module,exports){
/**
*
*	VALIDATE: undefined
*
*
*	DESCRIPTION:
*		- Validates if a value is undefined.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isUndefined( value )
*	Validates if a value is undefined.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is undefined
*/
function isUndefined( value ) {
	return value === void 0;
} // end FUNCTION isUndefined()


// EXPORTS //

module.exports = isUndefined;

},{}],94:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/white-space-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/white-space-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/white-space-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/white-space-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/white-space-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/white-space-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/white-space-x" title="npm version">
 * <img src="https://badge.fury.io/js/white-space-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * List of ECMAScript5 white space characters.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module white-space-x
 */

/* eslint strict: 1, max-len:1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var define = _dereq_('define-properties-x');
  var forEach = _dereq_('foreach');

  /**
   * An array of the whitespace char codes.
   *
   * @name whiteSpaces
   * @type Array.<number>
   * @property {number} 0 0x0009 // Tab
   * @property {number} 1 0x000a // Line Feed
   * @property {number} 2 0x000b // Vertical Tab
   * @property {number} 3 0x000c // Form Feed
   * @property {number} 4 0x000d // Carriage Return
   * @property {number} 5 0x0020 // Space
   * @property {number} 6 0x00a0 // No-break space
   * @property {number} 7 0x1680 // Ogham space mark
   * @property {number} 8 0x180e // Mongolian vowel separator
   * @property {number} 9 0x2000 // En quad
   * @property {number} 10 0x2001 // Em quad
   * @property {number} 11 0x2002 // En space
   * @property {number} 12 0x2003 // Em space
   * @property {number} 13 0x2004 // Three-per-em space
   * @property {number} 14 0x2005 // Four-per-em space
   * @property {number} 15 0x2006 // Six-per-em space
   * @property {number} 16 0x2007 // Figure space
   * @property {number} 17 0x2008 // Punctuation space
   * @property {number} 18 0x2009 // Thin space
   * @property {number} 19 0x200a // Hair space
   * @property {number} 20 0x2028 // Line separator
   * @property {number} 21 0x2029 // Paragraph separator
   * @property {number} 22 0x202f // Narrow no-break space
   * @property {number} 23 0x205f // Medium mathematical space
   * @property {number} 24 0x3000 // Ideographic space
   * @property {number} 25 0xfeff // Byte Order Mark
   * @example
   * var lib = require('white-space-x');
   * var count = 0x110000;
   * var nws = ''; // A string of all the non-whitepaces
   * do {
   *   count -= 1;
   *   if (lib.whiteSpaces.indexOf(count) < 0) {
   *     nws = String.fromCodePoint(count) + nws;
   *   }
   * } while (count);
   */
  define.property(module.exports, 'whiteSpaces', [
    0x0009, // Tab
    0x000a, // Line Feed
    0x000b, // Vertical Tab
    0x000c, // Form Feed
    0x000d, // Carriage Return
    0x0020, // Space
    // 0x0085, // Next line - Not ES5 whitespace
    0x00a0, // No-break space
    0x1680, // Ogham space mark
    0x180e, // Mongolian vowel separator
    0x2000, // En quad
    0x2001, // Em quad
    0x2002, // En space
    0x2003, // Em space
    0x2004, // Three-per-em space
    0x2005, // Four-per-em space
    0x2006, // Six-per-em space
    0x2007, // Figure space
    0x2008, // Punctuation space
    0x2009, // Thin space
    0x200a, // Hair space
    // 0x200b, // Zero width space - Not ES5 whitespace
    0x2028, // Line separator
    0x2029, // Paragraph separator
    0x202f, // Narrow no-break space
    0x205f, // Medium mathematical space
    0x3000, // Ideographic space
    0xfeff // Byte Order Mark
  ]);

  var wsString = '';
  forEach(module.exports.whiteSpaces, function (item) {
    wsString += String.fromCharCode(item);
  });

  /**
   * A string of the whitespace characters.
   *
   * @name ws
   * @type string
   * @default \u0009\u000a\u000b\u000c\u000d\u0020\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff
   * @example
   * var lib = require('white-space-x');
   * var ws = '\u0009\u000a\u000b\u000c\u000d\u0020\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';
   * var re1 = new RegExp('^[' + lib.ws + ']+$)');
   * re1.test(ws); // true
   */
  define.property(module.exports, 'ws', wsString);
}());

},{"define-properties-x":7,"foreach":23}]},{},[1])(1)
});