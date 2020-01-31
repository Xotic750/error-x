function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
import $isError from 'is-error-x';
import isNil from 'is-nil-x';
import $create from 'object-create-x';
import isObjectLike from 'is-object-like-x';
import map from 'array-map-x';
import numberIsNaN from 'is-nan-x';
import numberIsFinite from 'is-finite-x';
import isVarName from 'is-var-name';
import repeat from 'string-repeat-x';
import endsWith from 'string-ends-with-x';
import toBoolean from 'to-boolean-x';
import objectKeys from 'object-keys-x';
import every from 'array-every-x';
import methodize from 'simple-methodize-x';
export var isError = $isError;
var mathMax = Math.max;
/**
 * @typedef {ErrorConstructor|TypeErrorConstructor|SyntaxErrorConstructor|URIErrorConstructor|ReferenceErrorConstructor|EvalErrorConstructor|RangeErrorConstructor} OfErrorConstructor
 */

var EMPTY_STRING = '';
var split = methodize(EMPTY_STRING.split);
var stringIndexOf = methodize(EMPTY_STRING.indexOf);
var stringSlice = methodize(EMPTY_STRING.slice);
var tempArray = [];
var pop = methodize(tempArray.pop);
var join = methodize(tempArray.join);
var arraySlice = methodize(tempArray.slice);
/* eslint-disable-next-line compat/compat */

var $toStringTag = hasToStringTag && Symbol.toStringTag;
/** @type {ErrorConstructor} */

var $Error = Error;
/* Capture the function (if any). */

var captureStackTrace = $Error.captureStackTrace,
    prepareStackTrace = $Error.prepareStackTrace;
var kReadableOperator = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
  deepEqual: 'Expected values to be loosely deep-equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notIdentical: 'Values identical but not reference-equal:',
  notDeepEqualUnequal: 'Expected values not to be loosely deep-equal:'
};
/* Comparing short primitives should just show === / !== instead of using the diff. */

var kMaxShortLength = 12;

var inspectValue = function inspectValue(val) {
  /*
   *The util.inspect default values could be changed. This makes sure the
   * error messages contain the necessary information nevertheless.
   */
  return inspect(val, {
    compact: false,
    customInspect: false,
    depth: 1000,
    maxArrayLength: Infinity,

    /* Assert compares only enumerable properties (with a few exceptions). */
    showHidden: false,

    /* Assert does not detect proxies currently. */
    showProxy: false,
    sorted: true,

    /* Inspect getters as we also check them when comparing entries. */
    getters: true
  });
};

var createErrDiff = function createErrDiff(obj) {
  var actual = obj.actual,
      expected = obj.expected,
      operator = obj.operator;
  var $operator = operator;
  var other = EMPTY_STRING;
  var res = EMPTY_STRING;
  var end = EMPTY_STRING;
  var skipped = false;
  var actualInspected = inspectValue(actual);
  var actualLines = split(actualInspected, '\n');
  var expectedLines = split(inspectValue(expected), '\n');
  var i = 0;
  var indicator = EMPTY_STRING;
  /* In case both values are objects or functions explicitly mark them as not reference equal for the `strictEqual` operator. */

  if ($operator === 'strictEqual' && (_typeof(actual) === 'object' && actual !== null && _typeof(expected) === 'object' && expected !== null || typeof actual === 'function' && typeof expected === 'function')) {
    $operator = 'strictEqualObject';
  }
  /* If "actual" and "expected" fit on a single line and they are not strictly equal, check further special handling. */


  if (actualLines.length === 1 && expectedLines.length === 1 && actualLines[0] !== expectedLines[0]) {
    var inputLength = actualLines[0].length + expectedLines[0].length;
    /*
     * If the character length of "actual" and "expected" together is less than kMaxShortLength and if neither is an object and at
     * least one of them is not `zero`, use the strict equal comparison to visualize the output.
     */

    if (inputLength <= kMaxShortLength) {
      if ((_typeof(actual) !== 'object' || actual === null) && (_typeof(expected) !== 'object' || expected === null) && (actual !== 0 || expected !== 0)) {
        /* -0 === +0 */
        return "".concat(kReadableOperator[$operator], "\n\n").concat(actualLines[0], " !== ").concat(expectedLines[0], "\n");
      }
    } else if ($operator !== 'strictEqualObject') {
      /*
       * If the stderr is a tty and the input length is lower than the current columns per line,
       * add a mismatch indicator below the output. If it is not a tty, use a default value of 80 characters.
       */
      var _maxLength = 80;

      if (inputLength < _maxLength) {
        while (actualLines[0][i] === expectedLines[0][i]) {
          i += 1;
        }
        /* Ignore the first characters. */


        if (i > 2) {
          /*
           * Add position indicator for the first mismatch in case it is a
           * single line and the input length is less than the column length.
           */
          indicator = "\n  ".concat(repeat(' ', i), "^");
          i = 0;
        }
      }
    }
  }
  /*
   * Remove all ending lines that match (this optimizes the output for
   * readability by reducing the number of total changed lines).
   */


  var a = actualLines[actualLines.length - 1];
  var b = expectedLines[expectedLines.length - 1];

  while (a === b) {
    if (i < 3) {
      end = "\n  ".concat(a).concat(end);
    } else {
      other = a;
    }

    i += 1;
    pop(actualLines);
    pop(expectedLines);

    if (actualLines.length === 0 || expectedLines.length === 0) {
      break;
    }

    a = actualLines[actualLines.length - 1];
    b = expectedLines[expectedLines.length - 1];
  }

  var maxLines = mathMax(actualLines.length, expectedLines.length);
  /*
   * Strict equal with identical objects that are not identical by reference.
   * E.g., assert.deepStrictEqual({ a: Symbol() }, { a: Symbol() })
   */

  if (maxLines === 0) {
    /* We have to get the result again. The lines were all removed before. */
    var aLines = split(actualInspected, '\n');
    /* Only remove lines in case it makes sense to collapse those. */

    /* TODO: Accept env to always show the full error. */

    if (aLines.length > 50) {
      aLines[46] = '...';

      while (aLines.length > 47) {
        pop(aLines);
      }
    }

    return "".concat(kReadableOperator.notIdentical, "\n\n").concat(join(aLines, '\n'), "\n");
  }
  /* There were at least five identical lines at the end. Mark a couple of skipped. */


  if (i >= 5) {
    end = "\n...".concat(end);
    skipped = true;
  }

  if (other !== EMPTY_STRING) {
    end = "\n  ".concat(other).concat(end);
    other = EMPTY_STRING;
  }

  var printedLines = 0;
  var identical = 0;
  var msg = "".concat(kReadableOperator[$operator], "\n+ actual - expected");
  var skippedMsg = ' ... Lines skipped';
  var lines = actualLines;
  var plusMinus = '+';
  var maxLength = expectedLines.length;

  if (actualLines.length < maxLines) {
    lines = expectedLines;
    plusMinus = '-';
    maxLength = actualLines.length;
  }

  for (i = 0; i < maxLines; i += 1) {
    if (maxLength < i + 1) {
      /* If more than two former lines are identical, print them. Collapse them in case more than five lines were identical. */
      if (identical > 2) {
        if (identical > 3) {
          if (identical > 4) {
            if (identical === 5) {
              res += "\n  ".concat(lines[i - 3]);
              printedLines += 1;
            } else {
              res += '\n...';
              skipped = true;
            }
          }

          res += "\n  ".concat(lines[i - 2]);
          printedLines += 1;
        }

        res += "\n  ".concat(lines[i - 1]);
        printedLines += 1;
      }
      /* No identical lines before. */


      identical = 0;
      /* Add the expected line to the cache. */

      if (lines === actualLines) {
        res += "\n".concat(plusMinus, " ").concat(lines[i]);
      } else {
        other += "\n".concat(plusMinus, " ").concat(lines[i]);
      }

      printedLines += 1;
      /* Only extra actual lines exist. Lines diverge */
    } else {
      var expectedLine = expectedLines[i];
      var actualLine = actualLines[i];
      /*
       * If the lines diverge, specifically check for lines that only diverge by a trailing comma.
       * In that case it is actually identical and we should mark it as such.
       */

      var divergingLines = actualLine !== expectedLine && (endsWith(actualLine, ',') === false || stringSlice(actualLine, 0, -1) !== expectedLine);
      /*
       * If the expected line has a trailing comma but is otherwise identical, add a comma at the end of the actual line.
       * Otherwise the output could look weird as in:
       *
       * [
       *   1         // No comma at the end!
       * +   2
       * ]
       */

      if (divergingLines && endsWith(expectedLine, ',') && stringSlice(expectedLine, 0, -1) === actualLine) {
        divergingLines = false;
        actualLine += ',';
      }

      if (divergingLines) {
        /* If more than two former lines are identical, print them. Collapse them in case more than five lines were identical. */
        if (identical > 2) {
          if (identical > 3) {
            if (identical > 4) {
              if (identical === 5) {
                res += "\n  ".concat(actualLines[i - 3]);
                printedLines += 1;
              } else {
                res += '\n...';
                skipped = true;
              }
            }

            res += "\n  ".concat(actualLines[i - 2]);
            printedLines += 1;
          }

          res += "\n  ".concat(actualLines[i - 1]);
          printedLines += 1;
        }
        /* No identical lines before. */


        identical = 0;
        /*
         * Add the actual line to the result and cache the expected diverging
         * line so consecutive diverging lines show up as +++--- and not +-+-+-.
         */

        res += "\n+ ".concat(actualLine);
        other += "\n- ".concat(expectedLine);
        printedLines += 2;
        /* Lines are identical */
      } else {
        /* Add all cached information to the result before adding other things and reset the cache. */
        res += other;
        other = EMPTY_STRING;
        identical += 1;
        /* The very first identical line since the last diverging line is be added to the result. */

        if (identical <= 2) {
          res += "\n  ".concat(actualLine);
          printedLines += 1;
        }
      }
    }
    /* Inspected object to big (Show ~50 rows max) */


    if (printedLines > 50 && i < maxLines - 2) {
      return "".concat(msg).concat(skippedMsg, "\n").concat(res, "\n...").concat(other, "\n...");
    }
  }

  return "".concat(msg).concat(skipped ? skippedMsg : EMPTY_STRING, "\n").concat(res).concat(other).concat(end).concat(indicator);
};
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
/**
 * The stack preparation function for the V8 stack.
 *
 * @private
 * @param {*} ignore - Unused argument.
 * @param {!object} thisStack - The V8 stack.
 * @returns {!object} The V8 stack.
 */


var tempPrepareStackTrace = function $prepareStackTrace(ignore, thisStack) {
  return thisStack;
};

var getFrameIterateeOpts = function getFrameIterateeOpts(frame) {
  return {
    functionName: frame.getFunctionName(),
    isConstructor: frame.isConstructor(),
    isEval: frame.isEval(),
    isNative: frame.isNative(),
    isToplevel: frame.isToplevel(),
    source: frame.toString()
  };
};

var setFileName = function setFileName(frame, opts) {
  var getFileName = isFunction(frame.getFileName) && frame.getFileName();

  if (getFileName) {
    opts.getFileName = getFileName;
  }

  return opts;
};

var setColumnNumber = function setColumnNumber(frame, opts) {
  var columnNumber = isFunction(frame.getColumnNumber) && frame.getColumnNumber();

  if (isNumber(columnNumber)) {
    opts.columnNumber = columnNumber;
  }

  return opts;
};

var setLineNumber = function setLineNumber(frame, opts) {
  var lineNumber = isFunction(frame.getLineNumber) && frame.getLineNumber();

  if (isNumber(lineNumber)) {
    opts.lineNumber = lineNumber;
  }

  return opts;
};

var setEvalOrigin = function setEvalOrigin(frame, opts) {
  var evalOrigin = isFunction(frame.getEvalOrigin) && frame.getEvalOrigin();

  if (isObjectLike(evalOrigin)) {
    opts.evalOrigin = evalOrigin;
  }

  return opts;
};

var v8FrameIteratee = function v8FrameIteratee(frame) {
  var opts = getFrameIterateeOpts(frame);
  setFileName(frame, opts);
  setEvalOrigin(frame, opts);
  setColumnNumber(frame, opts);
  setLineNumber(frame, opts);
  setEvalOrigin(frame, opts);
  return new StackFrame(opts);
};
/**
 * Captures the V8 stack and converts it to an array of Stackframes.
 *
 * @private
 * @function captureV8
 * @param {!object} context - The Custom Error this object.
 * @returns {!Array.<!object>} Array of StackFrames.
 */


var captureV8 = function captureV8(context) {
  $Error.prepareStackTrace = tempPrepareStackTrace;
  /** @type {object} */

  var error = new $Error();
  captureStackTrace(error, context.constructor);
  var frames = map(error.stack, v8FrameIteratee);

  if (typeof prepareStackTrace === 'undefined') {
    delete $Error.prepareStackTrace;
  } else {
    $Error.prepareStackTrace = prepareStackTrace;
  }

  return frames;
};

var getCV8 = function getCV8() {
  /* Test to see if the function works. */
  try {
    captureStackTrace(new $Error(), captureStackTrace);
  } catch (ignore) {
    return false;
  }

  return captureV8;
};

var cV8 = toBoolean(captureStackTrace) && getCV8();
var allCtrs = true;
var STACK_NEWLINE = '\n    ';
/**
 * Defines frames and stack on the Custom Error this object.
 *
 * @private
 * @param {!object} obj - The parameters.
 * @property {!object} objcontext - The Custom Error this object.
 * @property {!Array.<!object>} objframes - Array of StackFrames.
 * @property {string} objname - The name of the constructor.
 */

var defContext = function defContext(obj) {
  var context = obj.context,
      frames = obj.frames,
      name = obj.name;
  defineProperties(context, {
    frames: {
      value: frames
    },
    stack: {
      value: "".concat(name).concat(STACK_NEWLINE).concat(join(map(frames, function iteratee(frame) {
        return frame.toString();
      }), STACK_NEWLINE))
    }
  });
};
/**
 * @private
 * @param {Array} frames - The frames array.
 * @param {number} start - Start from.
 * @returns {Array} - The filtered frames array.
 */


var filterFramesErrParse = function filterFramesErrParse(frames, start) {
  var item = frames[start];
  var $frames = arraySlice(frames, start + 1);
  var end = findIndex($frames, function predicate(frame) {
    return item.source === frame.source;
  });
  return end > -1 ? arraySlice($frames, 0, end) : $frames;
};
/**
 * @private
 * @param {Error} err - The error object.
 * @returns {Array|boolean} - The frames array or false.
 */


var getErrParseFrames = function getErrParseFrames(err) {
  try {
    return errorStackParser.parse(err);
  } catch (ignore) {
    return false;
  }
};
/**
 * Captures the other stacks and converts them to an array of Stackframes.
 *
 * @private
 * @param {!object} obj - The parameters.
 * @property {!object} obj.context - The Custom Error this object.
 * @property {!Error} obj.err - The Error object to be parsed.
 * @property {string} obj.name - The name of the constructor.
 * @returns {boolean} True if the Error object was parsed, otherwise false.
 */


var errParse = function errParse(obj) {
  var context = obj.context,
      err = obj.err,
      name = obj.name;
  var frames = getErrParseFrames(err);

  if (frames === false) {
    return false;
  }

  var start = findIndex(frames, function predicate(frame) {
    var fName = typeof frame.functionName === 'string' ? frame.functionName : EMPTY_STRING;
    return stringIndexOf(fName, name) > -1;
  });

  if (start > -1) {
    frames = filterFramesErrParse(frames, start);
  }

  defContext({
    context: context,
    frames: frames,
    name: name
  });
  return true;
};
/**
 * Error must be thrown to get stack in IE.
 *
 * @private
 * @returns {Error} - The thrown error.
 */


var getParseStackError = function getParseStackError() {
  try {
    // noinspection ExceptionCaughtLocallyJS,JSValidateTypes
    throw $Error();
  } catch (e) {
    return e;
  }
};
/**
 * If `Error` has a non-standard `stack`, `stacktrace` or `opera#sourceloc` property that offers a trace of which functions
 * were called, in what order, from which line and  file, and with what argument, then we will set it.
 *
 * @private
 * @param {Error} err - - The error object.
 * @returns {string} - The stack string.
 */


var getParseStackStack = function getParseStackStack(err) {
  if (typeof err.stack !== 'undefined') {
    return err.stack;
  } // noinspection JSUnresolvedVariable


  if (typeof err.stacktrace !== 'undefined') {
    // noinspection JSUnresolvedVariable
    return err.stacktrace;
  }

  var sourceloc = err['opera#sourceloc'];

  if (typeof sourceloc !== 'undefined') {
    return sourceloc;
  }

  return EMPTY_STRING;
};
/**
 * The main function for capturing and parsing stacks and setting properties
 * on Custom Error.
 *
 * @private
 * @param {!object} context - The Custom Error this object.
 * @param {string} name - The name of the constructor.
 * @returns {!object} - The context.
 */


var parseStack = function parseStack(context, name) {
  if (cV8) {
    defContext({
      context: context,
      frames: cV8(context),
      name: name
    });
  } else {
    var err = getParseStackError();

    if (errParse({
      context: context,
      err: err,
      name: name
    }) === false) {
      defineProperties(context, {
        frames: {
          value: []
        },
        stack: {
          value: getParseStackStack(err)
        }
      });
    }
  }

  return context;
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
    var testObject = {
      actual: 'b',
      expected: 'c',
      message: 'a',
      operator: 'd'
    };
    var err = new ErrorCtr(testObject);
    return every(objectKeys(testObject), function predicate(key) {
      return err[key] === testObject[key];
    });
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


var getMessage = function getMessage(message) {
  if (message.operator === 'deepStrictEqual' || message.operator === 'strictEqual') {
    var _actual = message.actual,
        expected = message.expected,
        operator = message.operator;
    return createErrDiff({
      actual: _actual,
      expected: expected,
      operator: operator
    });
  }

  if (message.operator === 'notDeepStrictEqual' || message.operator === 'notStrictEqual') {
    /* In case the objects are equal but the operator requires unequal, show the first object and say A equals B. */
    var base = kReadableOperator[message.operator];

    var _res = split(inspectValue(message.actual), '\n');
    /* In case "actual" is an object or a function, it should not be reference equal. */


    if (message.operator === 'notStrictEqual' && (_typeof(message.actual) === 'object' && message.actual !== null || typeof actual === 'function')) {
      base = kReadableOperator.notStrictEqualObject;
    }
    /* Only remove lines in case it makes sense to collapse those. */

    /* TODO: Accept env to always show the full error. */


    if (_res.length > 50) {
      _res[46] = '...';

      while (_res.length > 47) {
        pop(_res);
      }
    }
    /* Only print a single input. */


    if (_res.length === 1) {
      return "".concat(base).concat(_res[0].length > 5 ? '\n\n' : ' ').concat(_res[0]);
    }

    return "".concat(base, "\n\n").concat(join(_res, '\n'), "\n");
  }

  var res = inspectValue(message.actual);
  var other = inspectValue(message.expected);
  var knownOperator = kReadableOperator[message.operator];

  if (message.operator === 'notDeepEqual' && res === other) {
    res = "".concat(knownOperator, "\n\n").concat(res);

    if (res.length > 1024) {
      res = "".concat(stringSlice(res, 0, 1021), "...");
    }

    return res;
  }

  if (res.length > 512) {
    res = "".concat(stringSlice(res, 0, 509), "...");
  }

  if (other.length > 512) {
    other = "".concat(stringSlice(other, 0, 509), "...");
  }

  if (message.operator === 'deepEqual') {
    res = "".concat(knownOperator, "\n\n").concat(res, "\n\nshould loosely deep-equal\n\n");
  } else {
    var newOp = kReadableOperator["".concat(message.operator, "Unequal")];

    if (newOp) {
      res = "".concat(newOp, "\n\n").concat(res, "\n\nshould not loosely deep-equal\n\n");
    } else {
      other = " ".concat(message.operator, " ").concat(other);
    }
  }

  return "".concat(res).concat(other);
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

var defineAssertionErrorProps = function defineAssertionErrorProps(context, message) {
  if (_typeof(message) !== 'object' || message === null) {
    throw new TypeError("The \"options\" argument must be of type Object. Received type ".concat(_typeof(message)));
  }

  defineProperties(context, {
    actual: {
      value: message.actual
    },
    code: {
      value: 'ERR_ASSERTION'
    },
    expected: {
      value: message.expected
    },
    generatedMessage: {
      value: toBoolean(message.message) === false
    },
    message: {
      value: message.message || getMessage(message)
    },
    operator: {
      value: message.operator
    }
  });
  return context;
};
/**
 * Initialise a new instance of a custom error.
 *
 * @private
 * @param {!object} obj - The parameters.
 * @property {!object} obj.context - The Custom Error this object.
 * @property {object} obj.message - Human-readable description of the error.
 * @property {string} obj.name - The name for the custom Error.
 * @property {OfErrorConstructor} [obj.ErrorCtr=Error] - Error constructor to be used.
 * @returns {!object} - The context;.
 */


var init = function init(obj) {
  var context = obj.context,
      message = obj.message,
      name = obj.name,
      ErrorCtr = obj.ErrorCtr;

  if (asAssertionError(name, ErrorCtr)) {
    defineAssertionErrorProps(context, message);
  } else if (typeof message !== 'undefined') {
    /* Standard Errors. Only set `this.message` if the argument `message` was not `undefined`. */
    defineProperties(context, {
      message: {
        value: safeToString(message)
      }
    });
  }
  /* Parse and set the 'this' properties. */


  return parseStack(context, name);
};
/* `init` is used in `eval`, don't delete. */


init({
  context: {},
  message: 'message',
  name: 'name',
  ErrorCtr: $Error
});
var AssertionError = null;
var CUSTOM_NAME = 'CustomError';

var assignToStringTag = function assignToStringTag(CstmCtr) {
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

var getToStringFn = function getToStringFn(nativeToString) {
  return function $toString() {
    /* eslint-disable-next-line babel/no-invalid-this */
    return this instanceof AssertionError ? "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message) : nativeToString(this);
  };
};

var assignCtrMethods = function assignCtrMethods(obj) {
  var CstmCtr = obj.CstmCtr,
      customName = obj.customName,
      nativeToString = obj.nativeToString; // noinspection JSValidateTypes

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
    },
    toString: {
      value: getToStringFn(nativeToString)
    }
  });
  return assignToStringTag(CstmCtr);
};
/**
 * @private
 * @param {*} name - The supplied name.
 * @returns {string} - The custom name.
 */


var getCustomName = function getCustomName(name) {
  var initialName = isNil(name) ? CUSTOM_NAME : trim(safeToString(name));
  return initialName === CUSTOM_NAME || isVarName(initialName) ? initialName : CUSTOM_NAME;
};
/**
 * Creates a custom Error constructor. Will use `Error` if argument is not a valid constructor.
 *
 * @function
 * @param {string} [name='Error'] - The name for the custom Error.
 * @param {OfErrorConstructor} [ErrorCtr=Error] - Error constructor to be used.
 * @returns {Function} The custom Error constructor.
 */


var createErrorCtr = function createErrorCtr(name, ErrorCtr) {
  var ECTR = allCtrs === false || isErrorCtr(ErrorCtr) === false ? $Error : ErrorCtr;
  var customName = getCustomName(name);
  /**
   * Create a new object, that prototypically inherits from the `Error`
   * constructor.
   *
   * @private
   * @class CstmCtr
   * @param {string} [message] - Human-readable description of the error.
   */

  var CstmCtr; // noinspection JSUnusedLocalSymbols

  var f = function f(context, message) {
    return context instanceof CstmCtr ? init({
      context: context,
      message: message,
      name: customName,
      ErrorCtr: ErrorCtr
    }) : new CstmCtr(message);
  };
  /* eslint-disable-next-line no-new-func */


  CstmCtr = Function('f', "return function ".concat(customName, "(message){return f(this,message)}"))(f);
  /* Inherit the prototype methods from `ECTR`. */

  CstmCtr.prototype = $create(ECTR.prototype);
  return assignCtrMethods({
    CstmCtr: CstmCtr,
    customName: customName,
    nativeToString: methodize(ECTR.prototype.toString)
  });
};

export var create = createErrorCtr;
/* Test if we can use more than just the Error constructor. */

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
AssertionError = AssertionErrorConstructor;
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