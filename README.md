<a href="https://travis-ci.org/Xotic750/error-x"
   title="Travis status">
<img
   src="https://travis-ci.org/Xotic750/error-x.svg?branch=master"
   alt="Travis status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/error-x"
   title="Dependency status">
<img src="https://david-dm.org/Xotic750/error-x.svg"
   alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/error-x#info=devDependencies"
   title="devDependency status">
<img src="https://david-dm.org/Xotic750/error-x/dev-status.svg"
   alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/error-x" title="npm version">
<img src="https://badge.fury.io/js/error-x.svg"
   alt="npm version" height="18"/>
</a>
<a name="module_error-x"></a>

## error-x

Create custom Javascript Error objects.

- [error-x](#module_error-x)
  - [`module.exports`](#exp_module_error-x--module.exports) ⏏
    - [.AssertionErrorConstructor](#module_error-x--module.exports.AssertionErrorConstructor) ⇐ <code>Error</code>
      - [`new AssertionErrorConstructor([message])`](#new_module_error-x--module.exports.AssertionErrorConstructor_new)
    - [.ErrorConstructor](#module_error-x--module.exports.ErrorConstructor) ⇐ <code>Error</code>
      - [`new ErrorConstructor([message])`](#new_module_error-x--module.exports.ErrorConstructor_new)
    - [.EvalErrorConstructor](#module_error-x--module.exports.EvalErrorConstructor) ⇐ <code>EvalError</code>
      - [`new EvalErrorConstructor([message])`](#new_module_error-x--module.exports.EvalErrorConstructor_new)
    - [.InternalErrorConstructor](#module_error-x--module.exports.InternalErrorConstructor) ⇐ <code>Error</code>
      - [`new InternalErrorConstructor([message])`](#new_module_error-x--module.exports.InternalErrorConstructor_new)
    - [.RangeErrorConstructor](#module_error-x--module.exports.RangeErrorConstructor) ⇐ <code>RangeError</code>
      - [`new RangeErrorConstructor()`](#new_module_error-x--module.exports.RangeErrorConstructor_new)
    - [.ReferenceErrorConstructor](#module_error-x--module.exports.ReferenceErrorConstructor) ⇐ <code>ReferenceError</code>
      - [`new ReferenceErrorConstructor([message])`](#new_module_error-x--module.exports.ReferenceErrorConstructor_new)
    - [.SyntaxErrorConstructor](#module_error-x--module.exports.SyntaxErrorConstructor) ⇐ <code>SyntaError</code>
      - [`new SyntaxErrorConstructor([message])`](#new_module_error-x--module.exports.SyntaxErrorConstructor_new)
    - [.TypeErrorConstructor](#module_error-x--module.exports.TypeErrorConstructor) ⇐ <code>TypeError</code>
      - [`new TypeErrorConstructor([message])`](#new_module_error-x--module.exports.TypeErrorConstructor_new)
    - [.URIErrorConstructor](#module_error-x--module.exports.URIErrorConstructor) ⇐ <code>URIError</code>
      - [`new URIErrorConstructor([message])`](#new_module_error-x--module.exports.URIErrorConstructor_new)
    - [`.supportsAllConstructors`](#module_error-x--module.exports.supportsAllConstructors) : <code>boolean</code>
    - [`.create([name], [ECTR])`](#module_error-x--module.exports.create) ⇒ <code>function</code>
    - [`.isErrorConstructor(value)`](#module_error-x--module.exports.isErrorConstructor) ⇒ <code>boolean</code>

<a name="exp_module_error-x--module.exports"></a>

### `module.exports` ⏏

Want to create your own Error objects, this module will allow you to do
just that. It ships with all the standard ErrorConstructor objects already created
for you. Why? Well, these offer some improvements over the native versions.

- They have a `toJSON` method and so they can be serialised.
- They have a standardised `stack` property, using
  [`error-stack-parser`](https://github.com/stacktracejs/error-stack-parser)
  messages and stacks are parsed and then re-formatted.
- They have a `frames` property which is an array of the parsed `stack`
  message, so you have easy access to the information.

**Kind**: Exported member  
<a name="module_error-x--module.exports.AssertionErrorConstructor"></a>

#### module.exports.AssertionErrorConstructor ⇐ <code>Error</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>Error</code>  
<a name="new_module_error-x--module.exports.AssertionErrorConstructor_new"></a>

##### `new AssertionErrorConstructor_new([message])`

Error constructor for test and validation frameworks that implement the
standardized AssertionError specification.

| Param     | Type                | Description                      |
| --------- | ------------------- | -------------------------------- |
| [message] | <code>Object</code> | Need to document the properties. |

<a name="module_error-x--module.exports.ErrorConstructor"></a>

#### module.exports.ErrorConstructor ⇐ <code>Error</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>Error</code>  
<a name="new_module_error-x--module.exports.ErrorConstructor_new"></a>

##### `new ErrorConstructor([message])`

The Error constructor creates an error object.

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.EvalErrorConstructor"></a>

#### module.exports.EvalErrorConstructor ⇐ <code>EvalError</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>EvalError</code>  
<a name="new_module_error-x--module.exports.EvalErrorConstructor_new"></a>

##### `new EvalErrorConstructor_new([message])`

Creates an instance representing an error that occurs regarding the
global function eval().

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.InternalErrorConstructor"></a>

#### module.exports.InternalErrorConstructor ⇐ <code>Error</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>Error</code>  
<a name="new_module_error-x--module.exports.InternalErrorConstructor_new"></a>

##### `new InternalErrorConstructor_new([message])`

The InternalError object indicates an error that occurred internally in
the JavaScript engine. For example: "InternalErrorConstructor: too much recursion".

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.RangeErrorConstructor"></a>

#### module.exports.RangeErrorConstructor ⇐ <code>RangeError</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>RangeError</code>  
<a name="new_module_error-x--module.exports.RangeErrorConstructor_new"></a>

##### `new RangeErrorConstructor_new()`

Creates an instance representing an error that occurs when a numeric
variable or parameter is outside of its valid range.

| Type                | Description                                        |
| ------------------- | -------------------------------------------------- |
| <code>string</code> | [message] Human-readable description of the error. |

<a name="module_error-x--module.exports.ReferenceErrorConstructor"></a>

#### module.exports.ReferenceErrorConstructor ⇐ <code>ReferenceError</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>ReferenceError</code>  
<a name="new_module_error-x--module.exports.ReferenceErrorConstructor_new"></a>

##### `new ReferenceErrorConstructor_new([message])`

Creates an instance representing an error that occurs when de-referencing
an invalid reference

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.SyntaxErrorConstructor"></a>

#### module.exports.SyntaxErrorConstructor ⇐ <code>SyntaError</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>SyntaError</code>  
<a name="new_module_error-x--module.exports.SyntaxErrorConstructor_new"></a>

##### `new SyntaxErrorConstructor([message])`

Creates an instance representing a syntax error that occurs while parsing
code in eval().

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.TypeErrorConstructor"></a>

#### module.exports.TypeErrorConstructor ⇐ <code>TypeError</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>TypeError</code>  
<a name="new_module_error-x--module.exports.TypeErrorConstructor_new"></a>

##### `new TypeErrorConstructor([message])`

Creates an instance representing an error that occurs when a variable or
parameter is not of a valid type.

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.URIErrorConstructor"></a>

#### module.exports.URIErrorConstructor ⇐ <code>URIError</code>

**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>URIError</code>  
<a name="new_module_error-x--module.exports.URIErrorConstructor_new"></a>

##### `new URIErrorConstructor([message])`

Creates an instance representing an error that occurs when encodeURI() or
decodeURI() are passed invalid parameters.

| Param     | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.supportsAllConstructors"></a>

#### `module.exports.supportsAllConstructors` : <code>boolean</code>

Indicates if the Javascript engine supports subclassing of all Error
types. If `true` then all are supported, if `false` (only very old
browsers IE6) then only `Error` is supported.

**Kind**: static property of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
<a name="module_error-x--module.exports.create"></a>

#### `module.exports.create([name], [ECTR])` ⇒ <code>function</code>

Creates a custom Error constructor. Will use `ErrorConstructor` if argument is not
a valid constructor.

**Kind**: static method of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Returns**: <code>function</code> - The custom Error constructor.

| Param  | Type                  | Default                                    | Description                    |
| ------ | --------------------- | ------------------------------------------ | ------------------------------ |
| [name] | <code>string</code>   | <code>&quot;&#x27;Error&#x27;&quot;</code> | The name for the custom Error. |
| [ECTR] | <code>function</code> | <code>Error</code>                         | Error constructor to be used.  |

**Example**

```js
import * as errorX from 'error-x';

const MyError = errorX.create('MyError'); // Uses `Error` as no constructor
// specified.
const err = new MyError('somethingHappened');

JSON.stringify(err); // => see below.
// A serialised error, showing the custom error object's structure and
// format
// {
//   "name": "MyError",
//   "message": "somethingHappened",
//   "frames": [
//     {
//       "functionName": "Y.x",
//       "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
//       "lineNumber": 65,
//       "columnNumber": 13,
//       "source": "Y.x (http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13)"
//     },
//     {
//       "functionName": "window.onload",
//       "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
//       "lineNumber": 73,
//       "columnNumber": 3,
//       "source": "window.onload (http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3)"
//     }
//   ],
//   "stack": "MyError\n    Y.x()@http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13\n    window.onload()@http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3"
// }
```

<a name="module_error-x--module.exports.isErrorConstructor"></a>

#### `module.exports.isErrorConstructor(value)` ⇒ <code>boolean</code>

Determine whether or not a given `value` is an `Error` type.

**Kind**: static method of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Returns**: <code>boolean</code> - Returns `true` if `value` is an `Error` type,
else `false`.

| Param | Type            | Description              |
| ----- | --------------- | ------------------------ |
| value | <code>\*</code> | The object to be tested. |
