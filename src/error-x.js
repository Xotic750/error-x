import hasToStringTag from 'has-to-string-tag-x';
import trim from 'trim-x';
import map from 'lodash._arraymap';
import safeToString from 'to-string-symbols-supported-x';
import StackFrame from 'stackframe';
import errorStackParser from 'error-stack-parser';
import defineProperty from 'object-define-property-x';
import defineProperties from 'object-define-properties-x';
import findIndex from 'find-index-x';
import isFunction from 'is-function-x';
import inspect from 'inspect-x';
import truncate from 'truncate-x';
import isError from 'is-error-x';
import isNil from 'is-nil-x';
import isUndefined from 'validate.io-undefined';
import toLength from 'to-length-x';
import $create from 'object-create-x';

const $toStringTag = hasToStringTag && Symbol.toStringTag;

const $Error = Error;
const cV8 =
  $Error.captureStackTrace &&
  (function _cV8() {
    // Capture the function (if any).
    const {captureStackTrace} = $Error;
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
     * @param {!object} thisStack - The V8 stack.
     * @returns {!object} The V8 stack.
     */
    const prepareStackTrace = function _prepareStackTrace(ignore, thisStack) {
      return thisStack;
    };

    /**
     * Tests for number as specified in StackTrace library.
     *
     * @private
     * @param {*} n - The value to test.
     * @returns {boolean} True if parsable, otherwise false.
     */
    const isNumber = function _isNumber(n) {
      return isNaN(parseFloat(n)) === false && isFinite(n);
    };

    const isObjectLike = require('is-object-like-x');

    /**
     * Captures the V8 stack and converts it to an array of Stackframes.
     *
     * @private
     * @function captureV8
     * @param {!object} context - The Custom Error this object.
     * @returns {!Array.<!object>} Array of StackFrames.
     */
    return function captureV8(context) {
      const temp = $Error.prepareStackTrace;
      $Error.prepareStackTrace = prepareStackTrace;
      const error = new $Error();
      captureStackTrace(error, context.constructor);
      const frames = map(error.stack, function _mapper(frame) {
        const opts = {
          // args: void 0,
          functionName: frame.getFunctionName(),
          isConstructor: frame.isConstructor(),
          isEval: frame.isEval(),
          isNative: frame.isNative(),
          isToplevel: frame.isToplevel(),
          source: frame.toString(),
        };

        const getFileName = isFunction(frame.getFileName) && frame.getFileName();

        if (getFileName) {
          opts.getFileName = getFileName;
        }

        const columnNumber = isFunction(frame.getColumnNumber) && frame.getColumnNumber();

        if (isNumber(columnNumber)) {
          opts.columnNumber = columnNumber;
        }

        const lineNumber = isFunction(frame.getLineNumber) && frame.getLineNumber();

        if (isNumber(lineNumber)) {
          opts.lineNumber = lineNumber;
        }

        const evalOrigin = isFunction(frame.getEvalOrigin) && frame.getEvalOrigin();

        if (isObjectLike(evalOrigin)) {
          opts.evalOrigin = evalOrigin;
        }

        return new StackFrame(opts);
      });

      if (isUndefined(temp)) {
        delete $Error.prepareStackTrace;
      } else {
        $Error.prepareStackTrace = temp;
      }

      return frames;
    };
  })();

let allCtrs = true;

/**
 * Defines frames and stack on the Custom Error this object.
 *
 * @private
 * @param {!object} context - The Custom Error this object.
 * @param {!Array.<!object>} frames - Array of StackFrames.
 * @param {string} name - The name of the constructor.
 */
const defContext = function _defContext(context, frames, name) {
  defineProperties(context, {
    frames: {
      value: frames,
    },
    stack: {
      value: `${name}\n    ${map(frames, function(frame) {
        return frame.toString();
      }).join('\n    ')}`,
    },
  });
};

/**
 * Captures the other stacks and converts them to an array of Stackframes.
 *
 * @private
 * @param {!object} context - The Custom Error this object.
 * @param {!object} err - The Error object to be parsed.
 * @param {string} name - The name of the constructor.
 * @returns {boolean} True if the Error object was parsed, otherwise false.
 */
const errParse = function _errParse(context, err, name) {
  let frames;
  try {
    frames = errorStackParser.parse(err);
  } catch (ignore) {
    return false;
  }

  const start = findIndex(frames, function _finderStart(frame) {
    const fName = typeof frame.functionName === 'string' ? frame.functionName : '';

    return fName.indexOf(name) > -1;
  });

  if (start > -1) {
    const item = frames[start];
    frames = frames.slice(start + 1);

    const end = findIndex(frames, function _finderEnd(frame) {
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
 * @param {!object} context - The Custom Error this object.
 * @param {string} name - The name of the constructor.
 */
const parse = function _parse(context, name) {
  if (cV8) {
    defContext(context, cV8(context), name);
  } else {
    let err;
    try {
      // Error must be thrown to get stack in IE
      throw $Error();
    } catch (e) {
      err = e;
    }

    if (errParse(context, err, name) === false) {
      let stack = '';

      // If `Error` has a non-standard `stack`, `stacktrace` or
      // `opera#sourceloc` property that offers a trace of which functions
      // were called, in what order, from which line and  file, and with what
      // argument, then we will set it.
      if (isUndefined(err.stack) === false) {
        stack = err.stack;
      } else if (isUndefined(err.stacktrace) === false) {
        stack = err.stacktrace;
      } else {
        const sourceloc = err['opera#sourceloc'];

        if (isUndefined(sourceloc) === false) {
          stack = sourceloc;
        }
      }

      defineProperties(context, {
        frames: {
          value: [],
        },
        stack: {
          value: stack,
        },
      });
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
const isErrorCtr = function _isErrorCtr(ErrorCtr) {
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
const asAssertionError = function _asAssertionError(name, ErrorCtr) {
  if (name === 'AssertionError') {
    return true;
  }

  if (isErrorCtr(ErrorCtr)) {
    const err = new ErrorCtr({
      actual: 'b',
      expected: 'c',
      message: 'a',
      operator: 'd',
    });

    return (
      typeof err.name === 'string' && err.message === 'a' && err.actual === 'b' && err.expected === 'c' && err.operator === 'd'
    );
  }

  return false;
};

/**
 * Message generator for AssertionError.
 *
 * @private
 * @param {!object} message - The message object.
 * @returns {string} The generated message.
 */
const getMessage = function _getMessage(message) {
  const opts = {
    length: message.length ? toLength(message.length) : 128,
    omission: message.omission ? safeToString(message.omission) : '',
    separator: message.separator ? safeToString(message.separator) : '',
  };

  return `${truncate(inspect(message.actual), opts)} ${message.operator} ${truncate(inspect(message.expected), opts)}`;
};

/**
 * The toJSON method returns an object representation of the Error object.
 *
 * @private
 * @this {!Object} A custom error instance.
 * @returns {object} An object representation.
 */
const toJSON = function _toJSON() {
  return {
    frames: this.frames,
    message: this.message,
    name: this.name,
    stack: this.stack,
  };
};

/**
 * Initialise a new instance of a custom error.
 *
 * @private
 * @param {!object} context - The Custom Error this object.
 * @param {string} message - Human-readable description of the error.
 * @param {string} name - The name for the custom Error.
 * @param {Function} [ErrorCtr=Error] - Error constructor to be used.
 */
// eslint-disable-next-line max-params
const init = function _init(context, message, name, ErrorCtr) {
  if (asAssertionError(name, ErrorCtr)) {
    defineProperties(context, {
      actual: {
        value: message.actual,
      },
      expected: {
        value: message.expected,
      },
      generatedMessage: {
        value: Boolean(message.message) === false,
      },
      message: {
        value: message.message ? message.message : getMessage(message),
      },
      operator: {
        value: message.operator,
      },
    });
  } else if (isUndefined(message) === false) {
    // Standard Errors. Only set `this.message` if the argument `message`
    // was not `undefined`.
    defineProperties(context, {
      message: {
        value: safeToString(message),
      },
    });
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
const create = function _createErrorCtr(name, ErrorCtr) {
  let ECTR = ErrorCtr;
  let customName = isNil(name) ? 'CustomError' : name;
  let CstmCtr;

  if (customName !== 'CustomError') {
    try {
      customName = trim(safeToString(customName));
      // eslint-disable-next-line no-eval
      eval(`(function ${customName} () {})`);
    } catch (ignore) {
      customName = 'CustomError';
    }
  }

  if (allCtrs === false || isErrorCtr(ECTR) === false) {
    ECTR = $Error;
  }

  // eslint-disable-next-line no-unused-vars
  const f = function _f(context, message) {
    const isInstCtr = context instanceof CstmCtr;

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
   * @class CstmCtr
   * @augments Error
   * @param {string} [message] - Human-readable description of the error.
   */
  // eslint-disable-next-line no-eval
  CstmCtr = eval(`(0,function ${customName}(message){return f(this,message)})`);

  // Inherit the prototype methods from `ECTR`.
  CstmCtr.prototype = $create(ECTR.prototype);
  defineProperties(
    CstmCtr.prototype,
    /** @lends module:error-x.CstmCtr.prototype */ {
      /**
       * Specifies the function that created an instance's prototype.
       *
       * @class
       */
      constructor: {
        value: CstmCtr,
      },
      /**
       * The name property represents a name for the type of error.
       *
       * @default 'Error'
       * @type {string}
       */
      name: {
        value: customName,
      },
      /**
       * The toJSON method returns a string representation of the Error object.
       *
       * @returns {string} A JSON stringified representation.
       */
      toJSON: {
        value: toJSON,
      },
    },
  );

  if ($toStringTag) {
    /**
     * Name Symbol.toStringTag.
     *
     * @memberof module:error-x.CstmCtr.prototype
     * @type {string}
     */
    defineProperty(CstmCtr.prototype, $toStringTag, {
      value: '[object Error]',
    });
  }

  return CstmCtr;
};

// Test if we can use more than just the Error constructor.
try {
  allCtrs = create('X', SyntaxError)('x') instanceof SyntaxError;
} catch (ignore) {
  allCtrs = false;
}

/**
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
export default {
  /**
   * Error constructor for test and validation frameworks that implement the
   * standardized AssertionError specification.
   *
   * @class
   * @augments Error
   * @param {object} [message] - Need to document the properties.
   */
  AssertionError: create('AssertionError', Error),
  /**
   * Creates a custom Error constructor. Will use `Error` if argument is not
   * a valid constructor.
   *
   * @function
   * @param {string} [name='Error'] - The name for the custom Error.
   * @param {Function} [ECTR=Error] - Error constructor to be used.
   * @returns {Function} The custom Error constructor.
   */
  create,
  /**
   * The Error constructor creates an error object.
   *
   * @class
   * @augments Error
   * @param {string} [message] - Human-readable description of the error.
   */
  Error: create('Error', Error),
  /**
   * Creates an instance representing an error that occurs regarding the
   * global function eval().
   *
   * @class
   * @augments EvalError
   * @param {string} [message] - Human-readable description of the error.
   */
  EvalError: create('EvalError', EvalError),
  /**
   * The InternalError object indicates an error that occurred internally in
   * the JavaScript engine. For example: "InternalError: too much recursion".
   *
   * @class
   * @augments Error
   * @param {string} [message] - Human-readable description of the error.
   */
  InternalError: create('InternalError', Error),
  /**
   * Determine whether or not a given `value` is an `Error` type.
   *
   * @function
   * @param {*} value - The object to be tested.
   * @returns {boolean} Returns `true` if `value` is an `Error` type,
   *  else `false`.
   */
  isError,
  /**
   * Creates an instance representing an error that occurs when a numeric
   * variable or parameter is outside of its valid range.
   *
   * @class
   * @augments RangeError
   * @param {string} - - [message] Human-readable description of the error.
   */
  RangeError: create('RangeError', RangeError),
  /**
   * Creates an instance representing an error that occurs when de-referencing
   * an invalid reference.
   *
   * @class
   * @augments ReferenceError
   * @param {string} [message] - Human-readable description of the error.
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
   * @class
   * @augments SyntaError
   * @param {string} [message] - Human-readable description of the error.
   */
  SyntaxError: create('SyntaxError', SyntaxError),
  /**
   * Creates an instance representing an error that occurs when a variable or
   * parameter is not of a valid type.
   *
   * @class
   * @augments TypeError
   * @param {string} [message] - Human-readable description of the error.
   */
  TypeError: create('TypeError', TypeError),
  /**
   * Creates an instance representing an error that occurs when encodeURI() or
   * decodeURI() are passed invalid parameters.
   *
   * @class
   * @augments URIError
   * @param {string} [message] - Human-readable description of the error.
   */
  URIError: create('URIError', URIError),
};
