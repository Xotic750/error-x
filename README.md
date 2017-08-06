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

**Version**: 2.0.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  

* [error-x](#module_error-x)
    * [`module.exports`](#exp_module_error-x--module.exports) ⏏
        * [.AssertionError](#module_error-x--module.exports.AssertionError) ⇐ <code>Error</code>
            * [`new AssertionError([message])`](#new_module_error-x--module.exports.AssertionError_new)
        * [.Error](#module_error-x--module.exports.Error) ⇐ <code>Error</code>
            * [`new Error([message])`](#new_module_error-x--module.exports.Error_new)
        * [.EvalError](#module_error-x--module.exports.EvalError) ⇐ <code>EvalError</code>
            * [`new EvalError([message])`](#new_module_error-x--module.exports.EvalError_new)
        * [.InternalError](#module_error-x--module.exports.InternalError) ⇐ <code>Error</code>
            * [`new InternalError([message])`](#new_module_error-x--module.exports.InternalError_new)
        * [.RangeError](#module_error-x--module.exports.RangeError) ⇐ <code>RangeError</code>
            * [`new RangeError()`](#new_module_error-x--module.exports.RangeError_new)
        * [.ReferenceError](#module_error-x--module.exports.ReferenceError) ⇐ <code>ReferenceError</code>
            * [`new ReferenceError([message])`](#new_module_error-x--module.exports.ReferenceError_new)
        * [.SyntaxError](#module_error-x--module.exports.SyntaxError) ⇐ <code>SyntaError</code>
            * [`new SyntaxError([message])`](#new_module_error-x--module.exports.SyntaxError_new)
        * [.TypeError](#module_error-x--module.exports.TypeError) ⇐ <code>TypeError</code>
            * [`new TypeError([message])`](#new_module_error-x--module.exports.TypeError_new)
        * [.URIError](#module_error-x--module.exports.URIError) ⇐ <code>URIError</code>
            * [`new URIError([message])`](#new_module_error-x--module.exports.URIError_new)
        * [`.supportsAllConstructors`](#module_error-x--module.exports.supportsAllConstructors) : <code>boolean</code>
        * [`.create([name], [ECTR])`](#module_error-x--module.exports.create) ⇒ <code>function</code>
        * [`.isError(value)`](#module_error-x--module.exports.isError) ⇒ <code>boolean</code>

<a name="exp_module_error-x--module.exports"></a>

### `module.exports` ⏏
Want to create your own Error objects, this module will allow you to do
just that. It ships with all the standard Error objects already created
for you. Why? Well, these offer some improvements over the native versions.
- They have a `toJSON` method and so they can be serialised.
- They have a standardised `stack` property, using
[`error-stack-parser`](https://github.com/stacktracejs/error-stack-parser)
messages and stacks are parsed and then re-formatted.
- They have a `frames` property which is an array of the parsed `stack`
message, so you have easy access to the information.

**Kind**: Exported member  
<a name="module_error-x--module.exports.AssertionError"></a>

#### module.exports.AssertionError ⇐ <code>Error</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>Error</code>  
<a name="new_module_error-x--module.exports.AssertionError_new"></a>

##### `new AssertionError([message])`
Error constructor for test and validation frameworks that implement the
standardized AssertionError specification.


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>Object</code> | Need to document the properties. |

<a name="module_error-x--module.exports.Error"></a>

#### module.exports.Error ⇐ <code>Error</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>Error</code>  
<a name="new_module_error-x--module.exports.Error_new"></a>

##### `new Error([message])`
The Error constructor creates an error object.


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.EvalError"></a>

#### module.exports.EvalError ⇐ <code>EvalError</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>EvalError</code>  
<a name="new_module_error-x--module.exports.EvalError_new"></a>

##### `new EvalError([message])`
Creates an instance representing an error that occurs regarding the
global function eval().


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.InternalError"></a>

#### module.exports.InternalError ⇐ <code>Error</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>Error</code>  
<a name="new_module_error-x--module.exports.InternalError_new"></a>

##### `new InternalError([message])`
The InternalError object indicates an error that occurred internally in
the JavaScript engine. For example: "InternalError: too much recursion".


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.RangeError"></a>

#### module.exports.RangeError ⇐ <code>RangeError</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>RangeError</code>  
<a name="new_module_error-x--module.exports.RangeError_new"></a>

##### `new RangeError()`
Creates an instance representing an error that occurs when a numeric
variable or parameter is outside of its valid range.


| Type | Description |
| --- | --- |
| <code>string</code> | [message] Human-readable description of the error. |

<a name="module_error-x--module.exports.ReferenceError"></a>

#### module.exports.ReferenceError ⇐ <code>ReferenceError</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>ReferenceError</code>  
<a name="new_module_error-x--module.exports.ReferenceError_new"></a>

##### `new ReferenceError([message])`
Creates an instance representing an error that occurs when de-referencing
an invalid reference


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.SyntaxError"></a>

#### module.exports.SyntaxError ⇐ <code>SyntaError</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>SyntaError</code>  
<a name="new_module_error-x--module.exports.SyntaxError_new"></a>

##### `new SyntaxError([message])`
Creates an instance representing a syntax error that occurs while parsing
code in eval().


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.TypeError"></a>

#### module.exports.TypeError ⇐ <code>TypeError</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>TypeError</code>  
<a name="new_module_error-x--module.exports.TypeError_new"></a>

##### `new TypeError([message])`
Creates an instance representing an error that occurs when a variable or
parameter is not of a valid type.


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.URIError"></a>

#### module.exports.URIError ⇐ <code>URIError</code>
**Kind**: static class of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Extends**: <code>URIError</code>  
<a name="new_module_error-x--module.exports.URIError_new"></a>

##### `new URIError([message])`
Creates an instance representing an error that occurs when encodeURI() or
decodeURI() are passed invalid parameters.


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>string</code> | Human-readable description of the error. |

<a name="module_error-x--module.exports.supportsAllConstructors"></a>

#### `module.exports.supportsAllConstructors` : <code>boolean</code>
Indicates if the Javascript engine supports subclassing of all Error
types. If `true` then all are supported, if `false` (only very old
browsers IE6) then only `Error` is supported.

**Kind**: static property of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
<a name="module_error-x--module.exports.create"></a>

#### `module.exports.create([name], [ECTR])` ⇒ <code>function</code>
Creates a custom Error constructor. Will use `Error` if argument is not
a valid constructor.

**Kind**: static method of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Returns**: <code>function</code> - The custom Error constructor.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>string</code> | <code>&quot;&#x27;Error&#x27;&quot;</code> | The name for the custom Error. |
| [ECTR] | <code>function</code> | <code>Error</code> | Error constructor to be used. |

**Example**  
```js
var errorX = require('error-x');
var MyError = errorX.create('MyError'); // Uses `Error` as no constructor
                                        // specified.
var err = new MyError('somethingHappened');

JSON.stringify(err); // => see below.
// A serialised error, showing the custom error object's structure and
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
<a name="module_error-x--module.exports.isError"></a>

#### `module.exports.isError(value)` ⇒ <code>boolean</code>
Determine whether or not a given `value` is an `Error` type.

**Kind**: static method of [<code>module.exports</code>](#exp_module_error-x--module.exports)  
**Returns**: <code>boolean</code> - Returns `true` if `value` is an `Error` type,
 else `false`.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The object to be tested. |

