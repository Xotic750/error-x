<a name="module_error-x"></a>
## error-x
<a href="https://travis-ci.org/Xotic750/error-x"
title="Travis status">
<img src="https://travis-ci.org/Xotic750/error-x.svg?branch=master"
alt="Travis status" height="18">
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
alt="npm version" height="18">
</a>

Create custom Javascript Error objects.

Want to create your own Error objects, this module will allow you to do
just that. It ships with all the standard Error objects already created
for you. Why? Well, these offer some improvements over the native versions.
- They have a `toJSON` method and so they can be serialised.
- They have a standardised `stack` property, using
[`error-stack-parser`](https://github.com/stacktracejs/error-stack-parser)
messages and stacks are parsed and then re-formatted.
- They have a `frames` property which is an array of the parsed `stack`
message, so you have easy access to the information.

<h2>ECMAScript compatibility shims for legacy JavaScript engines</h2>
`es5-shim.js` monkey-patches a JavaScript context to contain all EcmaScript 5
methods that can be faithfully emulated with a legacy JavaScript engine.

`es5-sham.js` monkey-patches other ES5 methods as closely as possible.
For these methods, as closely as possible to ES5 is not very close.
Many of these shams are intended only to allow code to be written to ES5
without causing run-time errors in older engines. In many cases,
this means that these shams cause many ES5 methods to silently fail.
Decide carefully whether this is what you want. Note: es5-sham.js requires
es5-shim.js to be able to work properly.

`json3.js` monkey-patches the EcmaScript 5 JSON implimentation faithfully.

`es6.shim.js` provides compatibility shims so that legacy JavaScript engines
behave as closely as possible to ECMAScript 6 (Harmony).

**Version**: 1.3.0  
**Author:** Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
**Example**  
```js
var errorX = require('error-x');
var MyError = errorX.create('MyError'); // Uses `Error` as no constructor
                                        // specified.
var err = new MyError('somethingHappened');

JSON.stringify(err); // => see below.
// A searialised error, showing the custom error object's structure and
// format
{
  "name": "MyError",
  "message": "somethingHappened",
  "frames": [
    {
      "functionName": "Y.x",
      "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
      "lineNumber": 65,
      "columnNumber": 13,
      "source": "Y.x (http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13)"
    },
    {
      "functionName": "window.onload",
      "fileName": "http://fiddle.jshell.net/2k5x5dj8/183/show/",
      "lineNumber": 73,
      "columnNumber": 3,
      "source": "window.onload (http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3)"
    }
  ],
  "stack": "MyError\n    Y.x()@http://fiddle.jshell.net/2k5x5dj8/183/show/:65:13\n    window.onload()@http://fiddle.jshell.net/2k5x5dj8/183/show/:73:3"
}
```

* [error-x](#module_error-x)
    * [~Error](#module_error-x..Error) ⇐ <code>Error</code>
    * [~SyntaxError](#module_error-x..SyntaxError) ⇐ <code>SyntaError</code>
    * [~TypeError](#module_error-x..TypeError) ⇐ <code>TypeError</code>
    * [~RangeError](#module_error-x..RangeError) ⇐ <code>RangeError</code>
    * [~EvalError](#module_error-x..EvalError) ⇐ <code>EvalError</code>
    * [~ReferenceError](#module_error-x..ReferenceError) ⇐ <code>ReferenceError</code>
    * [~URIError](#module_error-x..URIError) ⇐ <code>URIError</code>
    * [~InternalError](#module_error-x..InternalError) ⇐ <code>Error</code>
    * [~AssertionError](#module_error-x..AssertionError) ⇐ <code>Error</code>
    * [`~supportsAllConstructors`](#module_error-x..supportsAllConstructors) : <code>boolean</code>
    * [`~create([name], [ErrorCtr])`](#module_error-x..create) ⇒ <code>function</code>
    * [`~isError(value)`](#module_error-x..isError) ⇒ <code>boolean</code>

<a name="module_error-x..Error"></a>
### error-x~Error ⇐ <code>Error</code>
The Error constructor creates an error object.

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>Error</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..SyntaxError"></a>
### error-x~SyntaxError ⇐ <code>SyntaError</code>
Creates an instance representing a syntax error that occurs while parsing
code in eval().

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>SyntaError</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..TypeError"></a>
### error-x~TypeError ⇐ <code>TypeError</code>
Creates an instance representing an error that occurs when a variable or
parameter is not of a valid type.

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>TypeError</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..RangeError"></a>
### error-x~RangeError ⇐ <code>RangeError</code>
Creates an instance representing an error that occurs when a numeric
variable or parameter is outside of its valid range.

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>RangeError</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..EvalError"></a>
### error-x~EvalError ⇐ <code>EvalError</code>
Creates an instance representing an error that occurs regarding the
global function eval().

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>EvalError</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..ReferenceError"></a>
### error-x~ReferenceError ⇐ <code>ReferenceError</code>
Creates an instance representing an error that occurs when de-referencing
an invalid reference

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>ReferenceError</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..URIError"></a>
### error-x~URIError ⇐ <code>URIError</code>
Creates an instance representing an error that occurs when encodeURI() or
decodeURI() are passed invalid parameters.

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>URIError</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..InternalError"></a>
### error-x~InternalError ⇐ <code>Error</code>
The InternalError object indicates an error that occurred internally in
the JavaScript engine. For example: "InternalError: too much recursion".

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>Error</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x..AssertionError"></a>
### error-x~AssertionError ⇐ <code>Error</code>
Error constructor for test and validation frameworks that implement the
standardized AssertionError specification.

**Kind**: inner class of <code>[error-x](#module_error-x)</code>  
**Extends:** <code>Error</code>  

| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>Object</code> | Need to document the properties. |

<a name="module_error-x..supportsAllConstructors"></a>
### `error-x~supportsAllConstructors` : <code>boolean</code>
Indicates if the Javascript engine supports subclassing of all Error
types. If `true` then all are supported, if `false` (only very old
browsers IE6) then only `Error` is supported.

**Kind**: inner property of <code>[error-x](#module_error-x)</code>  
<a name="module_error-x..create"></a>
### `error-x~create([name], [ErrorCtr])` ⇒ <code>function</code>
Creates a custom Error constructor. Will use `Error` if argument is not
a valid constructor.

**Kind**: inner method of <code>[error-x](#module_error-x)</code>  
**Returns**: <code>function</code> - The custom Error constructor.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>string</code> | <code>&quot;&#x27;Error&#x27;&quot;</code> | The name for the custom Error. |
| [ErrorCtr] | <code>function</code> | <code>Error</code> | Error constructor to be used. |

<a name="module_error-x..isError"></a>
### `error-x~isError(value)` ⇒ <code>boolean</code>
Determine whether or not a given `value` is an `Error` type.

**Kind**: inner method of <code>[error-x](#module_error-x)</code>  
**Returns**: <code>boolean</code> - Returns `true` if `value` is an `Error` type,
 else `false`.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The object to be tested. |

