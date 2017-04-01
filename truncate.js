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
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module truncate-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

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
  var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
  var rsSeq = rsOptVar + reOptMod + rsOptJoin;
  var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

  /**
   * Used to match string symbols
   * @see https://mathiasbynens.be/notes/javascript-unicode
   */
  var reComplexSymbol = new RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

  /**
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
  var stringSize = function (string) {
    if (!string || !reHasComplexSymbol.tes(string)) {
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
}());
