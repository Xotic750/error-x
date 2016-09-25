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
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module truncate-x
 */

/*jslint maxlen:80, es6:false, this:true, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:true, plusplus:true, maxparams:2, maxdepth:3,
  maxstatements:42, maxcomplexity:18 */

/*global require, module */

;(function () {
  'use strict';

  var RE = RegExp;
  var pTest = RE.prototype.test;
  var pExec = RE.prototype.exec;
  var sSlice = String.prototype.slice;
  var sIndexOf = String.prototype.indexOf;
  var sLastIndexOf = String.prototype.lastIndexOf;
  var pMatch = String.prototype.match;
  var aSlice = Array.prototype.slice;
  var pJoin = Array.prototype.join;
  var isUndefined = require('validate.io-undefined');
  var toLength = require('to-length-x');
  var isRegExp = require('is-regex');
  var safeToString = require('safe-to-string-x');
  var isObjectLike = require('is-object-like-x');

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to compose unicode character classes. */
  var rsAstralRange = '\\ud800-\\udfff';
  var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
  var rsComboSymbolsRange = '\\u20d0-\\u20f0';
  var rsVarRange = '\\ufe0e\\ufe0f';

  /** Used to compose unicode capture groups. */
  var rsAstral = '[' + rsAstralRange + ']';
  var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';
  var rsFitz = '\\ud83c[\\udffb-\\udfff]';
  var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
  var rsNonAstral = '[^' + rsAstralRange + ']';
  var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
  var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
  var rsZWJ = '\\u200d';

  /** Used to compose unicode regexes. */
  var reOptMod = rsModifier + '?';
  var rsOptVar = '[' + rsVarRange + ']?';
  var rsOptJoin = '(?:' + rsZWJ + '(?:' + pJoin.call(
    [rsNonAstral, rsRegional, rsSurrPair],
    '|'
  ) + ')' + rsOptVar + reOptMod + ')*';
  var rsSeq = rsOptVar + reOptMod + rsOptJoin;
  var rsSymbol = '(?:' + pJoin.call(
    [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral],
    '|'
  ) + ')';

  /**
   * Used to match string symbols
   * @see https://mathiasbynens.be/notes/javascript-unicode
   */
  var reComplexSymbol = new RE(
    rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq,
    'g'
  );

  /**
   * Used to detect strings with [zero-width joiners or code points from
   * the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/).
   */
  var reHasComplexSymbol = new RE(
    '[' + rsZWJ + rsAstralRange + rsComboMarksRange +
    rsComboSymbolsRange + rsVarRange + ']'
  );

  /**
   * Gets the number of symbols in `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the string size.
   */
  function stringSize(string) {
    if (!string || !pTest.call(reHasComplexSymbol, string)) {
      return string.length;
    }
    var result = reComplexSymbol.lastIndex = 0;
    while (pTest.call(reComplexSymbol, string)) {
      result += 1;
    }
    return result;
  }

  /**
   * Truncates `string` if it's longer than the given maximum string length.
   * The last characters of the truncated string are replaced with the omission
   * string which defaults to "...".
   *
   * @param {string} [string=''] The string to truncate.
   * @param {Object} [options] The options object.
   * @param {number} [options.length=30] The maximum string length.
   * @param {string} [options.omission='...'] The string to indicate text
   * is omitted.
   * @param {RegExp|string} [options.separator] The separator pattern to
   * truncate to.
   * @returns {string} Returns the truncated string.
   * @example
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
    var strSymbols;
    if (pTest.call(reHasComplexSymbol, str)) {
      strSymbols = pMatch.call(str, reComplexSymbol);
      strLength = strSymbols.length;
    }
    if (length >= strLength) {
      return str;
    }
    var end = length - stringSize(omission);
    if (end < 1) {
      return omission;
    }
    var result = strSymbols ?
      pJoin.call(aSlice.call(strSymbols, 0, end), '') :
      sSlice.call(str, 0, end);
    if (isUndefined(separator)) {
      return result + omission;
    }
    if (strSymbols) {
      end += result.length - end;
    }
    if (isRegExp(separator)) {
      if (sSlice.call(str, end).search(separator)) {
        var substr = result;
        if (!separator.global) {
          separator = new RE(
            separator.source,
            safeToString(pExec.call(reFlags, separator)) + 'g'
          );
        }
        separator.lastIndex = 0;
        var newEnd;
        var match = pExec.call(separator, substr);
        while (match) {
          newEnd = match.index;
          match = pExec.call(separator, substr);
        }
        result = sSlice.call(result, 0, isUndefined(newEnd) ? end : newEnd);
      }
    } else if (sIndexOf.call(str, separator, end) !== end) {
      var index = sLastIndexOf.call(result, separator);
      if (index > -1) {
        result = sSlice.call(result, 0, index);
      }
    }
    return result + omission;
  };
}());
