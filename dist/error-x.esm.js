function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

/*
 * Want to create your own Error objects, this module will allow you to do
 * just that. It ships with all the standard Error objects already created
 * for you. Why? Well, these offer some improvements over the native versions.
 * - They have a `toJSON` method and so they can be serialised.
 * - They have a standardised `stack` property, using
 * [`error-stack-parser`](https://github.com/stacktracejs/error-stack-parser)
 * messages and stacks are parsed and then re-formatted.
 * - They have a `frames` property which is an array of the parsed `stack`
 * message, so you have easy access to the information.
 */
import hasToStringTag from 'has-to-string-tag-x';
import trim from 'trim-x';
import safeToString from 'to-string-symbols-supported-x';
import StackFrame from 'stackframe';
import errorStackParser from 'error-stack-parser';
import defineProperty from 'object-define-property-x';
import defineProperties from 'object-define-properties-x';
import findIndex from 'find-index-x';
import isFunction from 'is-function-x';
import inspect from 'inspect-x';
import truncate from 'truncate-x';
import $isError from 'is-error-x';
import isNil from 'is-nil-x';
import toLength from 'to-length-x';
import $create from 'object-create-x';
import isObjectLike from 'is-object-like-x';
import map from 'array-map-x';
import numberIsNaN from 'is-nan-x';
import numberIsFinite from 'is-finite-x';
import isVarName from 'is-var-name';
export var isError = $isError;
var parse = errorStackParser.parse;
/**
 * @typedef {ErrorConstructor|TypeErrorConstructor|SyntaxErrorConstructor|URIErrorConstructor|ReferenceErrorConstructor|EvalErrorConstructor|RangeErrorConstructor} OfErrorConstructor
 */

var EMPTY_STRING = '';
/** @type {BooleanConstructor} */

var castBoolean = true.constructor;
/* eslint-disable-next-line compat/compat */

var $toStringTag = hasToStringTag && Symbol.toStringTag;
/** @type {ErrorConstructor} */

var $Error = Error; // Capture the function (if any).

var captureStackTrace = $Error.captureStackTrace,
    prepareStackTrace = $Error.prepareStackTrace;
/**
 * Tests for number as specified in StackTrace library.
 *
 * @private
 * @param {*} n - The value to test.
 * @returns {boolean} True if parsable, otherwise false.
 */

var isNumber = function isNumber(n) {
  return numberIsNaN(parseFloat(n)) === false && numberIsFinite(n);
};

var cV8 = castBoolean(captureStackTrace) && function getCV8() {
  // Test to see if the function works.
  try {
    captureStackTrace(new $Error(), captureStackTrace);
  } catch (ignore) {
    return false;
  }
  /**
   * Captures the V8 stack and converts it to an array of Stackframes.
   *
   * @private
   * @function captureV8
   * @param {!object} context - The Custom Error this object.
   * @returns {!Array.<!object>} Array of StackFrames.
   */


  return function captureV8(context) {
    var _this = this;

    /**
     * The stack preparation function for the V8 stack.
     *
     * @private
     * @param {*} ignore - Unused argument.
     * @param {!object} thisStack - The V8 stack.
     * @returns {!object} The V8 stack.
     */
    $Error.prepareStackTrace = function _prepareStackTrace(ignore, thisStack) {
      return thisStack;
    };
    /** @type {object} */


    var error = new $Error();
    captureStackTrace(error, context.constructor);
    var frames = map(error.stack, function (frame) {
      _newArrowCheck(this, _this);

      var opts = {
        // args: void 0,
        functionName: frame.getFunctionName(),
        isConstructor: frame.isConstructor(),
        isEval: frame.isEval(),
        isNative: frame.isNative(),
        isToplevel: frame.isToplevel(),
        source: frame.toString()
      };
      var getFileName = isFunction(frame.getFileName) && frame.getFileName();

      if (getFileName) {
        opts.getFileName = getFileName;
      }

      var columnNumber = isFunction(frame.getColumnNumber) && frame.getColumnNumber();

      if (isNumber(columnNumber)) {
        opts.columnNumber = columnNumber;
      }

      var lineNumber = isFunction(frame.getLineNumber) && frame.getLineNumber();

      if (isNumber(lineNumber)) {
        opts.lineNumber = lineNumber;
      }

      var evalOrigin = isFunction(frame.getEvalOrigin) && frame.getEvalOrigin();

      if (isObjectLike(evalOrigin)) {
        opts.evalOrigin = evalOrigin;
      }

      return new StackFrame(opts);
    }.bind(this));

    if (typeof prepareStackTrace === 'undefined') {
      delete $Error.prepareStackTrace;
    } else {
      $Error.prepareStackTrace = prepareStackTrace;
    }

    return frames;
  };
}();

var allCtrs = true;
var STACK_NEWLINE = '\n    ';
/**
 * Defines frames and stack on the Custom Error this object.
 *
 * @private
 * @param {!object} context - The Custom Error this object.
 * @param {!Array.<!object>} frames - Array of StackFrames.
 * @param {string} name - The name of the constructor.
 */

var defContext = function defContext(context, frames, name) {
  var _this2 = this;

  defineProperties(context, {
    frames: {
      value: frames
    },
    stack: {
      value: "".concat(name).concat(STACK_NEWLINE).concat(map(frames, function (frame) {
        _newArrowCheck(this, _this2);

        return frame.toString();
      }.bind(this)).join(STACK_NEWLINE))
    }
  });
};
/**
 * Captures the other stacks and converts them to an array of Stackframes.
 *
 * @private
 * @param {!object} context - The Custom Error this object.
 * @param {!Error} err - The Error object to be parsed.
 * @param {string} name - The name of the constructor.
 * @returns {boolean} True if the Error object was parsed, otherwise false.
 */


var errParse = function errParse(context, err, name) {
  var _this3 = this;

  var frames;

  try {
    frames = parse(err);
  } catch (ignore) {
    return false;
  }

  var start = findIndex(frames, function (frame) {
    _newArrowCheck(this, _this3);

    var fName = typeof frame.functionName === 'string' ? frame.functionName : EMPTY_STRING;
    return fName.indexOf(name) > -1;
  }.bind(this));

  if (start > -1) {
    var item = frames[start];
    frames = frames.slice(start + 1);
    var end = findIndex(frames, function (frame) {
      _newArrowCheck(this, _this3);

      return item.source === frame.source;
    }.bind(this));

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
 * @param {!object} context - The Custom Error this object.
 * @param {string} name - The name of the constructor.
 */


var parseStack = function parseStack(context, name) {
  if (cV8) {
    defContext(context, cV8(context), name);
  } else {
    /** @type {Error} */
    var err;

    try {
      // Error must be thrown to get stack in IE
      // noinspection ExceptionCaughtLocallyJS,JSValidateTypes
      throw $Error();
    } catch (e) {
      err = e;
    }

    if (errParse(context, err, name) === false) {
      var stack = EMPTY_STRING; // If `Error` has a non-standard `stack`, `stacktrace` or
      // `opera#sourceloc` property that offers a trace of which functions
      // were called, in what order, from which line and  file, and with what
      // argument, then we will set it.

      if (typeof err.stack !== 'undefined') {
        /* eslint-disable-next-line prefer-destructuring */
        stack = err.stack;
      } else {
        // noinspection JSUnresolvedVariable
        if (
        /* eslint-disable-line no-lonely-if */
        typeof err.stacktrace !== 'undefined') {
          // noinspection JSUnresolvedVariable
          stack = err.stacktrace;
        } else {
          var sourceloc = err['opera#sourceloc'];

          if (typeof sourceloc !== 'undefined') {
            stack = sourceloc;
          }
        }
      }

      defineProperties(context, {
        frames: {
          value: []
        },
        stack: {
          value: stack
        }
      });
    }
  }
};
/**
 * Test whether we have a valid Error constructor.
 *
 * @private
 * @param {*} ErrorCtr - Constructor to test it creates an Error.
 * @returns {boolean} True if ErrorCtr creates an Error, otherwise false.
 */


var isErrorCtr = function isErrorCtr(ErrorCtr) {
  if (isFunction(ErrorCtr)) {
    try {
      return isError(new ErrorCtr({}));
    } catch (ignore) {// empty
    }
  }

  return false;
};
/**
 * Detect whether we are creating an 'AssertionError' constructor.
 *
 * @private
 * @param {string} name - Name to test if it is 'AssertionError'.
 * @param {OfErrorConstructor} ErrorCtr - Constructor to test it creates ASSERTION$Error.
 * @returns {boolean} True if either arguments asserts, otherwise false.
 */


var asAssertionError = function asAssertionError(name, ErrorCtr) {
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

var MAX_MSG_LENGTH = 128;
/**
 * Message generator for AssertionError.
 *
 * @private
 * @param {!object} message - The message object.
 * @returns {string} The generated message.
 */

var getMessage = function getMessage(message) {
  var opts = {
    length: message.length ? toLength(message.length) : MAX_MSG_LENGTH,
    omission: message.omission ? safeToString(message.omission) : EMPTY_STRING,
    separator: message.separator ? safeToString(message.separator) : EMPTY_STRING
  };
  return "".concat(truncate(inspect(message.actual), opts), " ").concat(message.operator, " ").concat(truncate(inspect(message.expected), opts));
};
/**
 * The toJSON method returns an object representation of the Error object.
 *
 * @private
 * @this {!Object} A custom error instance.
 * @returns {object} An object representation.
 */


var toJSON = function toJSON() {
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
 * @param {!object} context - The Custom Error this object.
 * @param {object} message - Human-readable description of the error.
 * @param {string} name - The name for the custom Error.
 * @param {OfErrorConstructor} [ErrorCtr=Error] - Error constructor to be used.
 */


var init = function init(context, message, name, ErrorCtr) {
  if (asAssertionError(name, ErrorCtr)) {
    defineProperties(context, {
      actual: {
        value: message.actual
      },
      expected: {
        value: message.expected
      },
      generatedMessage: {
        value: castBoolean(message.message) === false
      },
      message: {
        value: message.message || getMessage(message)
      },
      operator: {
        value: message.operator
      }
    });
  } else if (typeof message !== 'undefined') {
    // Standard Errors. Only set `this.message` if the argument `message`
    // was not `undefined`.
    defineProperties(context, {
      message: {
        value: safeToString(message)
      }
    });
  } // Parse and set the 'this' properties.


  parseStack(context, name);
}; // `init` is used in `eval`, don't delete.


init({}, 'message', 'name', $Error);
var CUSTOM_NAME = 'CustomError';
/**
 * Creates a custom Error constructor. Will use `Error` if argument is not
 * a valid constructor.
 *
 * @function
 * @param {string} [name='Error'] - The name for the custom Error.
 * @param {OfErrorConstructor} [ErrorCtr=Error] - Error constructor to be used.
 * @returns {Function} The custom Error constructor.
 */

var createErrorCtr = function createErrorCtr(name, ErrorCtr) {
  var ECTR = allCtrs === false || isErrorCtr(ErrorCtr) === false ? $Error : ErrorCtr;
  var initialName = isNil(name) ? CUSTOM_NAME : trim(safeToString(name));
  var customName = initialName === CUSTOM_NAME || isVarName(initialName) ? initialName : CUSTOM_NAME;
  /**
   * Create a new object, that prototypally inherits from the `Error`
   * constructor.
   *
   * @private
   * @class CstmCtr
   * @param {string} [message] - Human-readable description of the error.
   */

  var CstmCtr; // noinspection JSUnusedLocalSymbols

  var f =
  /* eslint-disable-line no-unused-vars */
  function _f(context, message) {
    var isInstCtr = context instanceof CstmCtr;

    if (isInstCtr === false) {
      return new CstmCtr(message);
    }

    init(context, message, customName, ErrorCtr);
    return context;
  };
  /* eslint-disable-next-line no-eval */


  CstmCtr = eval("(0,function ".concat(customName, "(message){return f(this,message)})")); // Inherit the prototype methods from `ECTR`.

  CstmCtr.prototype = $create(ECTR.prototype); // noinspection JSValidateTypes

  defineProperties(CstmCtr.prototype,
  /** @lends CstmCtr.prototype */
  {
    /**
     * Specifies the function that created an instance's prototype.
     *
     * @class
     */
    constructor: {
      value: CstmCtr
    },

    /**
     * The name property represents a name for the type of error.
     *
     * @default 'Error'
     * @type {string}
     */
    name: {
      value: customName
    },

    /**
     * The toJSON method returns a string representation of the Error object.
     *
     * @returns {string} A JSON stringified representation.
     */
    toJSON: {
      value: toJSON
    }
  });

  if ($toStringTag) {
    /**
     * Name Symbol.toStringTag.
     *
     * @memberof CstmCtr.prototype
     * @type {string}
     */
    defineProperty(CstmCtr.prototype, $toStringTag, {
      value: '[object Error]'
    });
  }

  return CstmCtr;
};

export var create = createErrorCtr; // Test if we can use more than just the Error constructor.

try {
  allCtrs = createErrorCtr('X', SyntaxError)('x') instanceof SyntaxError;
} catch (ignore) {
  allCtrs = false;
}
/**
 * Error constructor for test and validation frameworks that implement the
 * standardized AssertionError specification.
 *
 * @class
 * @param {object} [message] - Need to document the properties.
 */


export var AssertionErrorConstructor = createErrorCtr('AssertionError', Error);
/**
 * The Error constructor creates an error object.
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var ErrorConstructor = createErrorCtr('Error', Error);
/**
 * Creates an instance representing an error that occurs regarding the
 * global function eval().
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var EvalErrorConstructor = createErrorCtr('EvalError', EvalError); // noinspection JSUnusedGlobalSymbols

/**
 * The InternalError object indicates an error that occurred internally in
 * the JavaScript engine. For example: "InternalError: too much recursion".
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var InternalErrorConstructor = createErrorCtr('InternalError', Error);
/**
 * Creates an instance representing an error that occurs when a numeric
 * variable or parameter is outside of its valid range.
 *
 * @class
 * @param {string} - - [message] Human-readable description of the error.
 */

export var RangeErrorConstructor = createErrorCtr('RangeError', RangeError);
/**
 * Creates an instance representing an error that occurs when de-referencing
 * an invalid reference.
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var ReferenceErrorConstructor = createErrorCtr('ReferenceError', ReferenceError); // noinspection JSUnusedGlobalSymbols

/**
 * Indicates if the Javascript engine supports subclassing of all Error
 * types. If `true` then all are supported, if `false` (only very old
 * browsers IE6) then only `Error` is supported.
 *
 * @type boolean
 * */

export var supportsAllConstructors = allCtrs;
/**
 * Creates an instance representing a syntax error that occurs while parsing
 * code in eval().
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var SyntaxErrorConstructor = createErrorCtr('SyntaxError', SyntaxError);
/**
 * Creates an instance representing an error that occurs when a variable or
 * parameter is not of a valid type.
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var TypeErrorConstructor = createErrorCtr('TypeError', TypeError);
/**
 * Creates an instance representing an error that occurs when encodeURI() or
 * decodeURI() are passed invalid parameters.
 *
 * @class
 * @param {string} [message] - Human-readable description of the error.
 */

export var URIErrorConstructor = createErrorCtr('URIError', URIError);

//# sourceMappingURL=error-x.esm.js.map