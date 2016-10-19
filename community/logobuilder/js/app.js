/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*****************************!*\
  !*** ./src/logo-builder.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var MaxLogo = __webpack_require__(/*! ./max-logo */ 1),
	    maskA = __webpack_require__(/*! url?limit=40000!../assets/a-mask.png */ 6),
	    maskM = __webpack_require__(/*! url?limit=40000!../assets/m-mask.png */ 7),
	    maskX = __webpack_require__(/*! url?limit=40000!../assets/x-mask.png */ 8),
	    brand = __webpack_require__(/*! url?limit=40000!../assets/branding.png */ 9);
	
	var letterDimension = 720,
	    masks = {
	        m: maskM,
	        a: maskA,
	        x: maskX
	    },
	    branding = {
	        imageData: brand,
	        width: 2160,
	        height: 1132,
	        image: null
	    };
	
	window.maxLogo = new MaxLogo(letterDimension, masks, branding);

/***/ },
/* 1 */
/*!*************************!*\
  !*** ./src/max-logo.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var MaxLetter = __webpack_require__(/*! ./max-letter */ 2),
	  Q = __webpack_require__(/*! q */ 3);
	
	function MaxLogo(letterDimension, masks, branding) {
	  var aX = letterDimension,
	    xX = letterDimension * 2;
	
	  this.renderer = document.createElement('canvas');
	  this.brandedRenderer = document.createElement('canvas');
	  this.brandedRenderer.width = branding.width;
	  this.brandedRenderer.height = branding.height;
	  this.brandedRenderer.ctx = this.brandedRenderer.getContext('2d');
	  this.brandedRenderer.style.backgroundColor = '#cccccc';
	  this.renderer.classList.add('logo');
	  this.renderer.width = letterDimension * 3;
	  this.renderer.height = letterDimension;
	  this.renderer.ctx = this.renderer.getContext('2d');
	  this.renderer.style.backgroundColor = '#cccccc';
	  this.letterDimension = 720;
	  this.logoOffset = 206;
	  this.letters = {
	    m: new MaxLetter(
	      masks.m,
	      0,
	      0,
	      letterDimension
	    ),
	    a: new MaxLetter(
	      masks.a,
	      aX,
	      0,
	      letterDimension
	    ),
	    x: new MaxLetter(
	      masks.x,
	      xX,
	      0,
	      letterDimension
	    )
	  };
	  this.branding = branding;
	  this.branding.image = new Image();
	
	  function onLoad() {
	    this.brandedRenderer.ctx.drawImage(branding.image, 0, 0, branding.width, branding.height);
	  }
	  this.branding.image.addEventListener('load', onLoad.bind(this));
	  this.branding.image.src = this.branding.imageData;
	}
	
	MaxLogo.prototype.validate = function validate() {
	  if (!this.letters.m.composite || !this.letters.a.composite || !this.letters.x.composite) {
	    return new Error('Please provide an image for each letter');
	  } else {
	    return false;
	  }
	};
	
	MaxLogo.prototype.getImage = function getImage() {
	  var invalid = this.validate();
	  if (invalid) {
	    return Q.reject(invalid);
	  } else {
	    for (var l in this.letters) {
	      var letter = this.letters[l];
	      this.renderer.ctx.drawImage(
	        letter.composite,
	        letter.x,
	        letter.y,
	        letter.dimension,
	        letter.dimension);
	    }
	    return Q.resolve(this.renderer.toDataURL('image/jpeg'));
	  }
	};
	
	MaxLogo.prototype.saveImage = function saveImage() {
	  return this.getImage().then(function() {
	    this.brandedRenderer.ctx.drawImage(this.renderer, 0, this.logoOffset, this.branding.width, this.letterDimension);
	    return Q.resolve(this.brandedRenderer.toDataURL('image/jpeg'));
	  }.bind(this));
	};
	
	MaxLogo.prototype.updateM = function updateM(dataUrl) {
	  return this.letters.m.update(dataUrl);
	};
	
	MaxLogo.prototype.updateA = function updateA(dataUrl) {
	  return this.letters.a.update(dataUrl);
	};
	
	MaxLogo.prototype.updateX = function updateX(dataUrl) {
	  return this.letters.x.update(dataUrl);
	};
	
	module.exports = MaxLogo;

/***/ },
/* 2 */
/*!***************************!*\
  !*** ./src/max-letter.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var Q = __webpack_require__(/*! q */ 3);
	
	function MaxLetter(maskImage,
	  x,
	  y,
	  letterDimension) {
	  this.image = new Image();
	  this.mask = new Image();
	  this.mask.src = maskImage;
	  this.x = x;
	  this.y = y;
	  this.composite = null;
	  this.dimension = letterDimension;
	}
	
	MaxLetter.prototype.update = function update(dataURL) {
	  var cropped,
	    transformed,
	    deferred = Q.defer(),
	    onLoad = function() {
	      if (this.image.width < this.dimension || this.image.height < this.dimension) {
	        return deferred.reject(
	          new Error('Your image must be larger than ' + this.dimension + 'x' + this.dimension + ' pixels.'));
	      }
	      cropped = scaleAndCrop(this.image, this.dimension);
	      transformed = this.transformAndMask(cropped);
	      this.image.removeEventListener('load', onLoad);
	      deferred.resolve(transformed);
	    }.bind(this);
	  if (dataURL.startsWith('data:image/png;') || dataURL.startsWith('data:image/jpeg;')) {
	    this.image.addEventListener('load', onLoad);
	    this.image.src = dataURL;
	    return deferred.promise;
	  } else {
	    return Q.reject(new Error('Images must be JPGs or PNGs'));
	  }
	};
	
	MaxLetter.prototype.transformAndMask = function transformAndMask(canvas) {
	  var tempCanvas = document.createElement('canvas'),
	    ctx = tempCanvas.getContext('2d');
	  tempCanvas.width = this.dimension;
	  tempCanvas.height = this.dimension;
	  ctx.translate(this.dimension, this.dimension);
	  ctx.rotate(Math.PI);
	  ctx.drawImage(this.mask, 0, 0, this.dimension, this.dimension);
	  ctx.globalCompositeOperation = 'source-in';
	  ctx.drawImage(canvas, 0, 0, this.dimension, this.dimension);
	  ctx.translate(this.dimension, this.dimension);
	  ctx.rotate(Math.PI);
	  ctx.globalCompositeOperation = 'destination-atop';
	  ctx.drawImage(canvas, 0, 0, this.dimension, this.dimension);
	  this.composite = tempCanvas;
	  this.composite.classList.add('letter');
	  return tempCanvas;
	};
	
	function scaleAndCrop(image, finalDimension) {
	  var tempCanvas = document.createElement('canvas');
	  var tempCtx = tempCanvas.getContext('2d');
	  var canvas = document.createElement('canvas');
	  var ctx = canvas.getContext('2d');
	  var cropDimension;
	  var sx;
	  var sy;
	  var scale;
	
	  if (image.width < image.height) {
	    cropDimension = image.width;
	    sx = 0;
	    sy = Math.floor((image.height - cropDimension) / 2);
	  } else {
	    cropDimension = image.height;
	    sx = Math.floor((image.width - cropDimension) / 2);
	    sy = 0;
	  }
	  tempCanvas.width = cropDimension;
	  tempCanvas.height = cropDimension;
	  scale = finalDimension / cropDimension;
	  tempCtx.scale(scale, scale);
	  tempCtx.drawImage(image, sx, sy, cropDimension, cropDimension, 0, 0, cropDimension, cropDimension);
	  tempCtx.setTransform(1, 0, 0, 1, 0, 0);
	  canvas.width = finalDimension;
	  canvas.height = finalDimension;
	  ctx.drawImage(tempCanvas, 0, 0, finalDimension, finalDimension, 0, 0, finalDimension, finalDimension);
	  return canvas;
	}
	
	function cropToCanvas(image, width, height) {
	  var canvas = document.createElement('canvas'),
	    ctx = canvas.getContext('2d'),
	    sx = Math.floor((image.width - width) / 2),
	    sy = Math.floor((image.height - height) / 2);
	  canvas.width = width;
	  canvas.height = height;
	  ctx.drawImage(image, sx, sy, width, height, 0, 0, width, height);
	  return canvas;
	}
	
	module.exports = MaxLetter;

/***/ },
/* 3 */
/*!******************!*\
  !*** ./~/q/q.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
	 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	
	(function (definition) {
	    "use strict";
	
	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.
	
	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);
	
	    // CommonJS
	    } else if (true) {
	        module.exports = definition();
	
	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);
	
	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }
	
	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;
	
	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();
	
	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };
	
	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }
	
	})(function () {
	"use strict";
	
	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}
	
	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;
	
	// shims
	
	// used for fallback in "allResolved"
	var noop = function () {};
	
	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];
	
	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;
	
	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;
	
	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);
	
	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();
	
	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!
	
	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }
	
	                throw e;
	
	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }
	
	        if (domain) {
	            domain.exit();
	        }
	    }
	
	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };
	
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	
	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.nextTick()` yields "[object process]".
	        isNodeJS = true;
	
	        requestTick = function () {
	            process.nextTick(flush);
	        };
	
	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }
	
	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };
	
	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();
	
	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis
	
	var array_slice = uncurryThis(Array.prototype.slice);
	
	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);
	
	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);
	
	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);
	
	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};
	
	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
	
	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};
	
	var object_toString = uncurryThis(Object.prototype.toString);
	
	function isObject(value) {
	    return value === Object(value);
	}
	
	// generator related shims
	
	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}
	
	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}
	
	// long stack traces
	
	var STACK_JUMP_SEPARATOR = "From previous event:";
	
	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack &&
	        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack) {
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);
	
	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        error.stack = filterStackString(concatedStacks);
	    }
	}
	
	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];
	
	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}
	
	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}
	
	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }
	
	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }
	
	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}
	
	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
	
	    if (!fileNameAndLineNumber) {
	        return false;
	    }
	
	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];
	
	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}
	
	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }
	
	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }
	
	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}
	
	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}
	
	// end of shims
	// beginning of real work
	
	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }
	
	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;
	
	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;
	
	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;
	
	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}
	
	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;
	
	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };
	
	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };
	
	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };
	
	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	        }
	    }
	
	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.
	
	    function become(newPromise) {
	        resolvedPromise = newPromise;
	        promise.source = newPromise;
	
	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);
	
	        messages = void 0;
	        progressListeners = void 0;
	    }
	
	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(Q(value));
	    };
	
	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };
	
	    return deferred;
	}
	
	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};
	
	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}
	
	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6
	
	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};
	
	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};
	
	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};
	
	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Can't join: not the same: " + x + " " + y);
	        }
	    });
	};
	
	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}
	
	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};
	
	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }
	
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };
	
	    promise.inspect = inspect;
	
	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }
	
	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }
	
	    return promise;
	}
	
	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};
	
	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks
	
	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }
	
	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }
	
	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }
	
	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_rejected(exception));
	        }]);
	    });
	
	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }
	
	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);
	
	    return deferred.promise;
	};
	
	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};
	
	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);
	
	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};
	
	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}
	
	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};
	
	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};
	
	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};
	
	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};
	
	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */
	
	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}
	
	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}
	
	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}
	
	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}
	
	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};
	
	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}
	
	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};
	
	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}
	
	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};
	
	//// BEGIN UNHANDLED REJECTION TRACKING
	
	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;
	
	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;
	
	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}
	
	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }
	
	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}
	
	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	
	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}
	
	Q.resetUnhandledRejections = resetUnhandledRejections;
	
	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};
	
	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};
	
	resetUnhandledRejections();
	
	//// END UNHANDLED REJECTION TRACKING
	
	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });
	
	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);
	
	    return rejection;
	}
	
	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}
	
	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}
	
	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}
	
	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}
	
	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};
	
	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;
	
	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.
	
	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}
	
	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}
	
	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}
	
	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}
	
	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}
	
	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};
	
	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};
	
	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};
	
	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};
	
	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};
	
	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};
	
	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};
	
	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};
	
	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};
	
	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};
	
	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};
	
	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};
	
	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};
	
	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	
	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};
	
	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};
	
	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}
	
	Promise.prototype.all = function () {
	    return all(this);
	};
	
	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;
	
	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }
	
	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];
	
	        pendingCount++;
	
	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected() {
	            pendingCount--;
	            if (pendingCount === 0) {
	                deferred.reject(new Error(
	                    "Can't get fulfillment value from any promise, all " +
	                    "promises were rejected."
	                ));
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);
	
	    return deferred.promise;
	}
	
	Promise.prototype.any = function () {
	    return any(this);
	};
	
	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}
	
	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};
	
	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}
	
	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};
	
	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};
	
	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};
	
	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}
	
	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};
	
	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};
	
	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};
	
	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};
	
	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };
	
	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;
	
	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }
	
	    promise.then(void 0, onUnhandledError);
	};
	
	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};
	
	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);
	
	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);
	
	    return deferred.promise;
	};
	
	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};
	
	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};
	
	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};
	
	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}
	
	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};
	
	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};
	
	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();
	
	return Q;
	
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/process/browser.js */ 4), __webpack_require__(/*! ./~/timers-browserify/main.js */ 5).setImmediate))

/***/ },
/* 4 */
/*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	(function () {
	    try {
	        cachedSetTimeout = setTimeout;
	    } catch (e) {
	        cachedSetTimeout = function () {
	            throw new Error('setTimeout is not defined');
	        }
	    }
	    try {
	        cachedClearTimeout = clearTimeout;
	    } catch (e) {
	        cachedClearTimeout = function () {
	            throw new Error('clearTimeout is not defined');
	        }
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/*!*************************************!*\
  !*** ./~/timers-browserify/main.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(/*! process/browser.js */ 4).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/timers-browserify/main.js */ 5).setImmediate, __webpack_require__(/*! ./~/timers-browserify/main.js */ 5).clearImmediate))

/***/ },
/* 6 */
/*!******************************************************!*\
  !*** ./~/url-loader?limit=40000!./assets/a-mask.png ***!
  \******************************************************/
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAALQCAYAAAC5V0ecAAAACXBIWXMAAAsTAAALEwEAmpwYAAA7ZmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzIgNzkuMTU5Mjg0LCAyMDE2LzA0LzE5LTEzOjEzOjQwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxNi0wOC0yM1QxMjo1NToxMS0wNDowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE2LTA5LTE2VDEyOjQ5OjQyLTA0OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0wOS0xNlQxMjo0OTo0Mi0wNDowMDwveG1wOk1ldGFkYXRhRGF0ZT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDplNTE1YmFkOC0xMjlmLTQ1YjUtYTY3Ny1jYWM1MjUyNTEwOGM8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6NTk5NUYxOENGMzhGMTFFNUE3NjRCMzRCNTMzMTkzM0U8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpEZXJpdmVkRnJvbSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgIDxzdFJlZjppbnN0YW5jZUlEPnhtcC5paWQ6NTk5NUYxODlGMzhGMTFFNUE3NjRCMzRCNTMzMTkzM0U8L3N0UmVmOmluc3RhbmNlSUQ+CiAgICAgICAgICAgIDxzdFJlZjpkb2N1bWVudElEPnhtcC5kaWQ6NTk5NUYxOEFGMzhGMTFFNUE3NjRCMzRCNTMzMTkzM0U8L3N0UmVmOmRvY3VtZW50SUQ+CiAgICAgICAgIDwveG1wTU06RGVyaXZlZEZyb20+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDo1OTk1RjE4Q0YzOEYxMUU1QTc2NEIzNEI1MzMxOTMzRTwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6NzUxMmMyMDktNTAzYS00MGJlLTg5NjQtY2YxZTI3MDg0OTI2PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE2LTA4LTI0VDEyOjU3OjU3LTA0OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDplNTE1YmFkOC0xMjlmLTQ1YjUtYTY3Ny1jYWM1MjUyNTEwOGM8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTYtMDktMTZUMTI6NDk6NDItMDQ6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1LjUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjcyMDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj43MjA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PkIUDMQAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUw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AAABGgAABGgAABCgAQAAARoAAARoAAAQoAEAQIAGAAABGgAABGgAAECABgAAARoAAARoAAAQoAEAQIAGAAABGgAAEKABAECABgAAARoAAARoAAAQoAEAQIAGAAAEaAAAEKABAECABgAAARoAAARoAAAQoAEAAAEaAAAEaAAAEKABAECABgAAARoAAARoAABAgAYAAAEaAAAEaAAAEKABAECABgAAARoAABCgAQBAgAYAAAEaAAAEaAAAEKABAECABgAABGgAABCgAQBAgAYAAAEaAAAEaAAAEKABAAABGgAABGgAABCgAQBAgAYAAAEaAAAEaAAAQIAGAAABGgAABGgAABCgAQBAgAYAAAEaAAAQoAEAQIAGAAABGgAABGgAABCgAQBAgAYAAARoAAAQoAEAQIAGAAABGgAABGgAABCgAQAAARoAAARoAAAQoAEAQIAGAAABGgAABGgAAECABgAAARoAAARoAAAQoAEAQIAGAAABGgAAEKABAECABgAAARoAAARoAAAQoAEAQIAGAAAEaAAAEKABAECABgAAARoAAARoAAAQoAEAAAEaAAAEaAAAEKABAECABgAAARoAAO6o/38A/WYlReUel7oAAAAASUVORK5CYII="

/***/ },
/* 7 */
/*!******************************************************!*\
  !*** ./~/url-loader?limit=40000!./assets/m-mask.png ***!
  \******************************************************/
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAALQCAYAAAC5V0ecAAAACXBIWXMAAAsTAAALEwEAmpwYAAA7ZmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzIgNzkuMTU5Mjg0LCAyMDE2LzA0LzE5LTEzOjEzOjQwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxNi0wOC0yNFQxMjoxNjo1NS0wNDowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE2LTA5LTE2VDEyOjQ5OjUzLTA0OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNi0wOS0xNlQxMjo0OTo1My0wNDowMDwveG1wOk1ldGFkYXRhRGF0ZT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo2OTRkNzEzYS01M2M2LTRkZjQtOWJjZS00OWIxMDNjNWYwOTk8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6MDkxNDRBMzlGMzlEMTFFNUE3NjRCMzRCNTMzMTkzM0U8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpEZXJpdmVkRnJvbSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgIDxzdFJlZjppbnN0YW5jZUlEPnhtcC5paWQ6MDkxNDRBMzZGMzlEMTFFNUE3NjRCMzRCNTMzMTkzM0U8L3N0UmVmOmluc3RhbmNlSUQ+CiAgICAgICAgICAgIDxzdFJlZjpkb2N1bWVudElEPnhtcC5kaWQ6MDkxNDRBMzdGMzlEMTFFNUE3NjRCMzRCNTMzMTkzM0U8L3N0UmVmOmRvY3VtZW50SUQ+CiAgICAgICAgIDwveG1wTU06RGVyaXZlZEZyb20+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDowOTE0NEEzOUYzOUQxMUU1QTc2NEIzNEI1MzMxOTMzRTwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6Yjc1YzRiZmQtYTc2YS00NDJkLWE0NDgtOWViZWU2MmNiNjRjPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE2LTA4LTI0VDEyOjU4OjE4LTA0OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo2OTRkNzEzYS01M2M2LTRkZjQtOWJjZS00OWIxMDNjNWYwOTk8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTYtMDktMTZUMTI6NDk6NTMtMDQ6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1LjUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjcyMDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj43MjA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pq2qZ3kAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUw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"

/***/ },
/* 8 */
/*!******************************************************!*\
  !*** ./~/url-loader?limit=40000!./assets/x-mask.png ***!
  \******************************************************/
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAALQCAYAAAC5V0ecAAAACXBIWXMAAAsTAAALEwEAmpwYAAA57GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzIgNzkuMTU5Mjg0LCAyMDE2LzA0LzE5LTEzOjEzOjQwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChNYWNpbnRvc2gpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTA4LTI1VDEwOjA0OjMyLTA0OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMTYtMDktMTZUMTI6NDk6NDctMDQ6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE2LTA5LTE2VDEyOjQ5OjQ3LTA0OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjU5ZjQyYjI4LTk4NGUtNDRjYS04NzU4LTc3YzRlOThmMzI0MjwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDowY2Q0MTJkNC1hMmRhLTQ3MTMtOWM5YS0wYjUwNzEwMTcwMDQ8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDowY2Q0MTJkNC1hMmRhLTQ3MTMtOWM5YS0wYjUwNzEwMTcwMDQ8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MGNkNDEyZDQtYTJkYS00NzEzLTljOWEtMGI1MDcxMDE3MDA0PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE2LTA4LTI1VDEwOjA0OjMyLTA0OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo1OWY0MmIyOC05ODRlLTQ0Y2EtODc1OC03N2M0ZTk4ZjMyNDI8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTYtMDktMTZUMTI6NDk6NDctMDQ6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1LjUgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjcyMDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj43MjA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PkhXjLoAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAATfpJREFUeNrs3VmUbflB3/ffPrdbEwhJmFh2EsxynBAbMFMIBmEjIwtBAIOD4zx45SEPWX5IHmLMtLCdlTgsRjEEzIzBgCQ0IIRAAwINCARIQgKEEEhCSEgCSYDm7larJ9XOw65ynz53D/89nKn257NWr7636tQ5p3bdOvtb//rv/7+q6zqwRlVVPTjJJsn2N0HbN0Q98Pehtw+9r+T9c2+fE7t/4BrQEKzVxiFgzQ19+d/u2471XE792AAAAhomxW214s8dAAS0QwBnGY3CFgAENJx9jFaCFwAENHDa4S/MAUBAw9nEKwAgoAERDQAIaDiPGDYlAwAENJxtRO9j6TpxDAACGhgZydURHhMAENBw1hF9bo9Z7fwHAAIaAAAQ0FCi2tNtD/WcTv2YAYCAhhXFc1XwtmpPkSlSAUBAw7WMbABAQAN7jm9RDgACGq5N6J7zPGcrZQCAgIazC/BzuF8AQEDDtQ3X6hp8DgAgoGHlQV2yOsf2282FBgABDfihAgAENCBEAQABDcUh27caRzXhPq57ZFv1AwABDZx91IppABDQcDIhXM34WMEOAAIaGBnAc1fjqBZ8TABAQMOkqO172yHXYK72/HkKaQAQ0HC0yAYABDSsUj0hkgU1AAhoIKexZXa18mMJAAIaxPficWk+MwAIaDj5ID61iwIPcf8AgICG1gidsrTcEqPIU57TPj9fgQ8AAhoWD9sxfz/liDQNBAAENJxllJ/yfa/h+QGAgIYzCkajwAAgoOHahW818eMAAAENZPqo8Smu4uEHAAAQ0HCUSK4KP77a03OpctrTQUQ6AAIaEJgAIKCBqfOgBXzZY+z+BwACGs40HqsJET11p8K+6R3VQp/PEoF7yGMvqgEQ0HCN4nrO7asjPpe1HHMAENAgCHvvq3LMAEBAw6lF29RpHKcSiUuEtogFAAENi0TjPqdpTH0O+wzpU/5aAICAhmsactURHvO6HHvHAgABDdc8ope67SlcgCheAUBAQ2skts1/7lverhp5n30fU53B8TmVr5GgB0BAw8oi0YocACCg4VqoM2+e8r5CdskLCq/TDzt+cADg6G5xCKA43uqBkK0Lbz/nfsd8fFdo1yM/764fPI75tTiF5wHAShmBhu44m3uh3xqWnDulrxcACGg4gXBecrWMqaFczXz/PqKzOrGvnZAGQEDDgcJrMzJUqxnv5zAh7esAgICGI8XYoe97zmj32Gi8bqPQghoAAQ3XJKYPHW9isSyoAWAyq3BAf3DVLX9ui+uxK3D03d+cVTmO9cNFfYZf2zGs9gGAgIY8cOfBoVAeityhjxvzMVPua+4PCCwb3LAWXkNYJVM44OZAWmKJumrB57Pvz9u0BgAQ0LCXaK1GhnY18PFD9zH3osKpMZ0DfywACGi4xtEsIgFAQIOIvvx/PSKsl378ao/3e8iNVkwJAeDacxEh3ByN9YSPG7NyxpiLB/ue126k1jOeZ8lzmXNM27j4CICzZAQaygJw989LbvF9Dp//Od4/AAhoOKGIHhuDJRcUzn2Mcz2+QhoAAQ1nFm/VTqD2rbYxJqinLoc3ZyWMJW5zjGg3dxoAAQ0rDfKlYnSfMTklog8ZtyIaAAENK4rmKRE9JayrmfE5d73nQ8yPFtIACGg48RBum7pRtQTnmA1Vxm6eMiZ0q4LPpRr5OZ9a5JraAYCAhhOM5qG3VyPDt2SUeU5U7+tYHONjxTQAAhpWEN37ishDb3pyjhEtpgEQ0HBE9cz4m7sKx6G2CK/2dNtjR/RSxwcABDRMCL4xF/ctucHKmDnSc0a/Dz3N4pgh3fUfAAho2ENE981/nroe9JIhe4iIrhY+rqf0tRbXAMx2i0MAnbFVH/C+d9+2HXX1iPsd+zH7/Pz3eQz3+YMUUK52CFgjI9CsPZJLl3sb++ehqR3VAs97ShCOGXldYnTWKC8AAhpWEtVTIneJTVXm3G7q53uMYwsAZ8sUDnhg4HVNrdh+X9efu+6j5H27MVtPfL5j3j/lee2qJx7nLHyfAHAwRqChPPJKLyIsfd/V3+dcAHgqW3svfeytqAGAgIYzi+WxcTl2JY4pOxNWe/r85t7/vkK6NLIBQEDDgSMsKZ/3XLp83ZJxWhqqJRu7VHt+ntURv46CGoCDMAcaHhhi9c7/k+E50Om4fdI/P7rk77v30XXboben8H5L76M0ousjfR2nMPcaAAENI8N5zO2mXqBXesFeSUjPiehDRbC1oAG4dkzhgPaImjpVY6kQmzsHulr4mMyZJmFqBQACGq5RLPcF89CW3qVrRg9tA17NCOahOdFz3r90FJunDICAhmsU0pkZsX1x3RfOYx9rapxWezx21R6eLwCcLHOg4eawK7m4bl9zoJf4+Clzo4cuLJxz3Ep/ABnLRX8ACGg4QixXPaF6FWmlq3EssTth126IaXk+U0Jy6q6DpT8sHDJux4S32AZAQMOegqzOuC2y97HKxBJbes/ZUrzvOdV7uv0pxLbIBkBAw8hwnhqbXetGJ+Uj1F0RN2cKSMmUjbHxOHcKyqn/OwDK+aGT1XIRIWsP581OPPWtsNG3tF1V+Oe+iwxLI27Mx43ZgbDK/JU/hu675D8AENBwRkE99L4p60NXI99XTbhNyfMZG9NLh/Tc4AYAAQ0nHNKl0Ttnw5W5HzfnvqoD39fSYQ0AR2MONLTPYd6NwzErcOyqO27TNw+6bQ5138ek5zmUzIOeu7zdnJVB9v1Dh3maAAhoWDDChjZRqVsiu+TCwJJAL4nTORccjo3gkmAduwrHKUSt2AZAQMOeAqstbIeWiNvXMnb7WnljiZHmesFjfmrhanoIlH+vXDgMrJU50DAcUUMXEI69wHDKFt5jV97YZ0Du4+I+85sBOBtGoBHL/X9um8KRdE/naFsLelvpboWlm6OMnbYxZt5z321Ko7ue+TVZ6j4BQEDDHiJ6X/OHu4K3a+pI0n9RYz3y+c/dJGZOxO5je+9Tnf4BgICG1YTz1Pgd2n2w5H5KQnYotFPw9nrEMZi6fficH1T28XUU1gAIaNhTRPdNuxg7haM06EqmcJSEcOlUjTGhXDpqPGc78EPErvnUcJjXTlgdFxFCf3CN2VRl7AmnWug5zrmvauLjLX1CtesgAAIazjiYS24/J4Srjuicu2X31LheamvvJUJaUANw8kzhQEQPT3fYnq7RN4WjS8kmKtXAY6fj9l0xPOZCw2T86hx9t+sL83rG12lfzJUGQEDDxHjuCs25G5AMbePd9zh9c6P3tSth6QWCcy4kPKV4NcINy7x+goCGlZ0Ixqx33LdDYd/72x5z6q6DJVt8D61DnYEAL4ncuStrTD0BGzUGQEDDkcK56gjGvpU0xm6q0hV+bbfr+/sSo8wlq3akJ85Lg3zfATx35EuAAyCgYeGwHtp8pGsJu5K4rSc+l0NuojJmTespQXrsqRx+9QzLDUDA6liFAyeBZZaGG1o1onTljdKPrXoev/RzqAo/r7Gf/5yvgxMyACfPCDRrj+e+UCyZyrH9977771qJo2vKRslIc+mOhHM+h7Zjs+/VN0oi2hQMAI7GCDQiun80eMzodOnIcl+4Vzv3VToqO2UUvW1jl2rkMZtynJf8unX9BwB7YwSatcdz29v61ngeuyZ01wobfSt29M2pnjLnuWQN6LEXDQ7dLh2PWbq6xz6+tpnwfAFAQENLaJUE8lBgD029GIrloY1W2qK7Lf6G1oZOyqablITpmKX/2iL1UCPFS08fAfy2BwENtERwW6zWhRE9FMtdj52ex8rI+2mLwZLNXErePzWmh57XPr+2gIAGAQ17jOihEKtHxOaYqB2a7jEU1kPPp/S5jA3psbc9dlADgICGGcFcpXvjk64R5aGR3e1Y3b39RU949k0lGRrpLonyZHiEPAXHIB23awvppbf7PtQcagAQ0DAQa30XFO7ermSktisgN1th3fVYbaFc9YR6X4AOLXU3ZtS9dE3puuA5ZiDEU/Dx1YT7AgABDQvGc90RqyXzmUvuIwVhm4H7bIvU0hU5xoxUDz2XkttOidglo9j8TNj/6ycIaFjxiaBt1PSi5/1dQdc3DSQZHsndvV1JXM9dvm5M8I6d67z0lIsxgV16gjdSDYCAhhExtknykZQvGzcUzLtRVrXEat8az20fNybYUxDwbR9fTYj7sRFaur70PgN7qY8Br5++dxDQsPoTQd8GJ33v74q/MVtvlwZ2Ur6EXdfbp64TPeZzKwnw0og1OgyAgIYTDeiuaB6aAz02orsiti8gx2ygUhd+fm3PY+yo8pg52X2x3DdKfogRLpEOgICGEeFc9URxW1S3Rd/Y3fb6lsRLhqdydI0qD02RKFlJJCmfzlH3fPyYMK0G/r7v0PVraJj/+gkCGlZ4AhiaAlG61XbpKhxdIVy6A2Hf6HbJaHjpboSlt0nKV/3YZ+gaTQZAQMOBQnpoesTQRiFDW3mXTr3o21ilK7qHblMS0n0ButTW3nNGq6aOZu/rcQAQ0LDqeB7ana8uCM+uMG4Lsyrl85FL5kiXxmPpluJTPqexIbv0+tBLxbJfScP4104Q0LDiE8CUEei+2KsnBHjX1t1pCfCSEC6J5q7H6QrLkh8ihkJ56ekdU7/+wDSb3L9WPghoWHFMD+1E2BWopbsVlgR4yeh0X/BWhbdLxo+ql34OJZFaT7wdAAhoOHI0t/0asmS5uEx4/5AxI7ulkVvyMWPmQY99HmPDGjiv108Q0LDigC5d87lvA5S+GB6z++Bu2Jbujjj2OaTgMUojeO7azaVTPcaGOgAIaDhAVHfFaV/UTp2nXLL7YN/zHIr0tscrjeGpUzXqicd9bCSPDXXBDYCAhgVieXcaR+mc5bGbhWxH3Np/7VmP/BoBp/v6CQIa+E8nhnrE27uCemjHv75VOpLh7cJLR5j7pn2UfC5jR5fHbrAyJaynfl0B308goGHmCaBK+aobfdt51xPis3Qe9Jg5zkPznaesK126FN7UoD70CdlUDgAENMwI6M1ORO+OCu++vSueq55Y3VcAVgveV1/Edn0uU6ejjDk29Z6+7sAyAxAgoGHFJ4KSbbiHVsNoC9ySEd3SFT5KL0pMylbIKJ3SMXQMpoRuVRjLTtAgoEFAw4lH9FC4lqyb3BXXQ9M0hjZMmTrHeczUjy5jwrzkfkqjemqgA4CAhj1F8ybTlkNri94q929tWxKDQ9t5X/15MzEg+0a2x0bumKkdfcFbzfha1YWf89zHAsq+J32PIaBhpSeAZNwUjq6NV7Zjtyteq47767tYsO+x+iKzSveIeVfID00RGQrioXitF/p6ZcLzAQABDXuK6L6AHJqakY7w7brdmDhue44lOwuO2Txl6vSMujCalxytsl04HP+10/cYAhpWfAJoG/HtmjrRN6I7NIVj+77T8bhtobhpeU6lUzvabjcUvFXh59v13MeMek+N5qkn7iV3NgSvnyCgYdUB3bV83XZYDV0UuD2FoyvYSpa7a3vsquP5DY0ad01P6YrH3duXzj2uCt8+dQfHpQLXhYoACGhYMKbHbD5SMo2jLdimjPDuxnrpKO6Yj+lbbm/M8+u6/ZgLGesj/hsAxg1AgICGlZ4AtgNze4pE37J1fRcI7m680rdUXZWydZy7pnF0BWDXSh4lIbt9LNLxcRlxP7v3NRTLm573GSUGQEDDiUR00j2FIx1hmkxbJm73fqZMk6hmfK51wX3XHcdoTNRWBW8bWlVkbKgDh7FxCBDQsN547gqzts1T+kaVhzZT6ZqHPLR5S3o+riQ+h6aMlK7Q0ff2Ketol4RxaST7NTIcd/ABBDSs8CTQN23javrDxdYJ42Lrdtvv277Pi44AT7qnVnRNJcnW2y46/tw1NWL3frr+3hetXVM5tj+2HnnMx8bypuA2Y94PAAIaZsRz0j29YTuUk/apF1VPGCfDFyhWPaFddQRxWh4j6V4ir2uTlb6gLZnKUbXcx5Ibpkzd0XDshY/A+O9TI9AIaFjpCWAotkqmTUzdkKTO8DJ2aQnk0ukZ6YjdekaoluxWuOQ85SWmhyx134CABgENl3anNbSN1l5keNS2b3WOvtuOXcauK+anbIwyJqaT6Vt3L3GitfsgCGgQ0HAC4XwjyX3pX/GhbdpG3w6Fu9Mx+iJ27AocXZFfOvLaFfilsTt0QWEG7ntOJDtZg4AGAQ0ncALYDd5keJpEWyRPXbWidJWODIRzyehz332Xxu6UEegxFw06IYOABgENZxbRSdkc46HNUTJwu6F47ptrPBT3JfFeMpVjSuxOmQt96JOwiwcBENAwI543uX8O9Ha4dl3gl53gLpnGUDqK3ReVJVM3hp5vBj6263MYM0JcOq3jmCFbRUTDUoMPIKBhxSeAtikZfaPBpSO4fRcJdj1eeu5jyiocbc9vieefCbE9drpGfYCvPTDte8j3EQIaVn4SGDMloySmS0ao+6Z2tMVeaTyXXNA3FN5jdxkcuv2UKSJTQtfIMgACGg4Qz9VAaA7NLe6aStEX1UP3X6d9s5KS6Ru7U1F27yMZnvpRclHhklM7+u7H2s5wem7k5h1CQUDDygJ6Oxj7RnrTEdhjRqSH7r9O+69Hx4xAd20SM3cEes6KGYcahZ4a3wAgoGFEQLdFcVsg747WDsVxV2R3Re+UedApCP6+wKwK3zYnmoc+dokw7/oaA/t7/QQBDSs9CWzSP42ib9pD1//r3P/rzZItu692O9y0xGGdB+6WuEn/9txDQdm1+kad7tH4KZuipCfE68ITcd0TyiVbsU8Nb0BAg4CGgRPA0Ihr6bSMtuAsHYHedDz+7v2OGYEuXUquayR+7CofpUFdej9VT4zPjWMnfxDQIKBh4glgaF5yX7D2RfLYzVNS+PhTn2d6An7obV33NXVqR1fsLhXJTuyw/9dPENCw4oDuOhl0TcuoO/6enttWW2+7SPuUjKv72J76Uffctup5vM1AdNYtj7P72En3yPju7ccG7/afNwW3b/v73BUATOGAZV4/QUDDCk8Au3OKL3pu3za1Yvfv1UCQbzoivW00uRr4c+ljDy2J1zWSXfV8/NhQLZmO0TcabQoHCGgQ0HCCJ4Hdi/TSEZZtkTv0/rb7GrtqxhSljzF2N8Kx855LYnepFTic2EFAg4CGPdhc/te1pfdFHjhqvD3VoW06xXZ4X6R/CkfX5i3bUyMuOv7cN/VjaJWLoaki6bld0j21Ix2PXfp1KAnk+kAncVM7QECDgIbCE0Fb7LbtHLgb2m0rbmzSPvWib3m73fvadPy5b/fEvikWXUvS9U0fScttM+J9c8N16iocc0JYFICABgENPSeATYaXmeuawrC7ZfbQboN995OW++r789D7uuK5JDjHTuE49rQL0zjg8Da+xxDQsN6A3p56cdERv5uBSOvaKCUZ3qFwdxWNi6239/05LfHcNirc9VhXJ8Dk5vnbVUfMd709A5//lLDtW8t67lbfS530TfVg7a+fIKBhxQGdraDs2lWwbepD3ROSXdE8dKFh17SNtj8n/TslJv1TM8aswtH39rbPa+5JdqnVOPYZvgICr58goMFJoCMK+6ZqpOPtXdMr+kZxu6K4dJrG0Kht6Uoch95IpSSal4xkJ30Q0CCgYeYJoO8iwN0VL6YEcdv0ht1VPtq2Ar9I+zSNOt0X7nVtsrL9eV60nADb3lZnePvuqjDg54RtNXAfU6eJzPl3A2t3tYoRCGhY4QmgSvvKGrvx2xWwQ2G7G+bJ8EodSfvKG8nwZilVhudGty1L1/a20k1Z2kK2NIZLDM15PnTQmvsMIKBh1ap0b3aS9K980Revyc0X+w3dR3qCOR1hXve8rxqI3imbuNQT47ie8DiHCOR64r8Z8NrpewEBDau0u5FK1zbeuytktE232A7m3Y1VdqdjbD/W7sYobbere57T7qh324oaF7l5lL3tgsDd4K8GIn0oKrtG5LuCPymfUz00raM0kAUACGgQ0DDhBDC0ZF3bChlt/990xHXX5imbnttl5/bpCdmxUza6lrzreuwx24CPOcEOrRoy5vGWnDIClA1A+P5CQMPKIzotgVuNuI+SqQBjNlSpO0K57ojrrsAcmrIxdkrGxQKhusQGLE7cIKBBQMMR47lkt8G+SO4L4zFB3rWld1vsls7NnhrP6fh8NyNuu0Q4n1o0u4AQAAHN6gN60xLRfdtwD633nIH3Xf15d95y0n3R3+77u3Y1TOaNPLfNgZ4bt2MDeO4ug/sOXiNucP8P05axQ0DDSgP66kTQFsZ9UTY00ty2ekbXWsvViNgbsy5z29v6RoFvFMRnaRCPHW1eakOWpQMc6H799P2FgIaVngB2R6CH4rN098G2oNuMCOXSWBwzBzoZt9lJ6aYwY57XlBgXzCCgQUDDidhdxm4oAEumbiT9Uze272d3KbrSP5fGfUm0dv3QMHbb7u1pKSXzpOuM+/VvPfBDCXD4108BjYCGFdsN4pKpHF3rKfdNyajSvxRd266EfcvV9QV/13MfO1d6KJyHorvrvudM7Ti1k7YLCwEENKwunsfMKe6K4L6R3KGLC0su1qsKInjOShhTdiUs+bjrsPJGyb8hWBsXESKgYeUngK6R4Drdo7i7t7naRXAz8L6kfde97fdfpH8pu6GYT0dQX6R93euuDVz6pmRc9Lxv+/MrOcG2bUgzhxFhOO7gAwhoWMEJoCtW26Zp9E2L2BS8r2s0ebMT9m2PnZSPPrdN8yjdabBkHvSm8PiWhO7YXQiHgtlJHQ4zAOF7DQENKw7oTUesDq26kZ73jZ2msbvec90T9qdqynSNObsRCmYQ0CCg4QgBvdk6GdRpv3iw7aLC7WkXu1M3kvunS3RtejIUgn1bdu9OB6l7/r57+67bXN0uGT+do+v+pgbxksG9xGMC3QMQIKBhpSeATaatZLHpCccb6Z5acLHzuGOiru3xdke6+6Zu9E3b2MwI17Fbgi8ZxFO+7sA8LiJEQIOInvyxuytsdG2H3bWhStc84zHTP/rCtVroGPXtSji07vMS0zSWZhQaAAENM+O5azvvrv/vxtjVx19th709raNrY5SkfwWOro1X0vL3i3SvR90VjX0j7GMvzJs6N7ltpZOlR7XEMpzW4AMIaDhjm63/2jZEKQ3LuuO+20KybcOUzU6IJ2UbqVQtjze01fbu3Oi2VUBKdzUsOQ6lJ+J9BnN1gMeEtb5+goCGldmdA53CcG6bupGeAO1625gg7FvKbii8u6ZSbAoeq+3xlozcauH7E8dwuNdPENCw0hPAZis4t1fVaJsOcZHu0cyuVTeqgcdv26Uw6V+RIy0hXBdGb9/60hfpvpCyTv9I7kXGLdU354Rdi2Y4OsvYIaBhxQG9O5WibZ5x21SLqud96Qnprj9XO4+Zjjhsm3+dgZBsW8t6qVU4xmys0vb5jrHUxivAMgFtCgcCGlYe0lM/ri4IxIuW9+9Gcwre3rfRS1Vw+ynqgXiuFrifseEMnM4ABAhoWOkJYHfHv7ojZuuBAN9dyu7q9jdy82j27kh12zzri4443p1u0fb3kosd+6ZzlEzbGJpaMjd+DxXOIgDGMwKNgIYVnwBupHt1i4uOAN2OxbbbbDqicuzoc9eFgW2bo2wGwrDr4sKu6Rx9o0t1z+fTddtTDOc5zxEAAQ2r1LYT4e6GJ0OrbWzSvcnImE1SSqc4lNxuqQ1Uxh7LKUHa9oPEPp/71PWqgZsHIHzvIKBhxQHdNoViSoSWRHPJShRdUypKI3TusnpTp2OMGZk+JKt1wP5eP0FAwwpPAJudsGrbeXB7p8C29aD75gTXHYFbOhJdd0Ryep5PV2APBXJfZA79QDH2B46xOx1OvV/RDPtxI+ZAI6BhtQFdtZwEdudAb1oicffiwt0I3gwEc9vj9a2yURKHJdt3T4nqY0wJmRrNYhkO+/oJAhpWHNC7c6Drlre3beRRpX9nwq6pGNVAFNcTPm73Pi6y7I6ISwT2khcIWt4OBDQIaDiw7VU4dkeUh6K5bdpF6bSMoekaXbfru+Cw7b42PdFZGsBD7xvagGXbReb9yndf0z6Aaa+fvgcR0LBiY1fCKA3MQ93PnBU85m6UUvq4yXLzJZ204TQC2hxoBDSsNJy3p2BUA5HZd5uu8Bz756WivGR5uL7HuVgwnufuQCic4XRfP0FAwwpPAJu0T+EYMwf6Kjg3Pe8vWWmj7X270x5KYrtkZY65QVoX3mYz4+OdnOF0GYFGQMPKTwAlS9S1Be9ubLcFbVt0pyeAdx/nRsttxy5DV48M2JLwnbuZy5I7FwLHef0EAQ0rtD2FYzec20K5La67VuDo+nPbhi1df64G4rNkmbuxlpg+curL3gHLvX6CgIaVngA2uX+qRNuUje33DYVyXxj3jVZf5OapJOn4uO3nlJ6A7lolo2s1jCU2S7mYeGLdXXP7kOqRbwdAQMPqA7ov3HbnQpfE5ZQl7DYFz3X3OZXEbdXx+ewjnscsabcbqYcO55LNV4yuQTdzoBHQsPKA7lrPuW/qRWlUlsxZHrowsOQ+SoO3b9WNufF8rCUAp37tAQENAhomRNTuRYR9OwN2rcZxkf61pIc2WekK5a6/lyxHdzHyWOxerJiev3fF8Nh43mcYm34BhxmAAAENKw7otq28297WNjJ8o+NjSpaPa5sr3bUqSAru7yqeb7Tc7qIj7Hcfvxq4/xQE/FA47+vEK5zhcK+fIKBhpSeAqudk0LfaRslJpW+1jNJYHbPmc9984pL5ySXL382N532Hc+XkDgdhCgcCGlZ8AtieB7272kZbSCf3T9mod95f8uer+7la+WP3dkN/391kZTcYh0aZ+94+Zkm8KuN2K1xqZLhrXW3BDMd5/QQBDStUbUXz9lSOvvnGm47oHPPnthHhsaPRm4Hn1ndffW/fPgZDJ9ASpfeXkfcnnOG4AW0EGgENKw7okg1L+iJuaNm6satwjH3/lPueO53iWCto2KQFTv+1EwQ0XGM3Lr8HdjdJufp/vXOi2B6l7rqwsE77zoXpONlcpH3qRGm8twV/Wu6vNELrDE+7GBux+xh5Bo7LFA4ENKxU1RLIu//v28J7NzJ350lffcxFT9SW7iaYjvvrW/Fj7FrQbZ9PWh577Iobc6N56RAHlnn99D2JgIaVnwiGYrPtwsA+m44/t41YjwnernnOJWtDpye02+6nGvi8hqJ37snViDOcLnOgEdCw4nDeZHipuO3bX43A7o7Gts2D7huxbVtp42JkQE7ZobDrRFhn/lztrs9jyg8z4hlO//XT9ygCGlZokwcuZZe0z23entKxvcnJpue2u7fpi+yh2w4F7JjR5zEbsoyN57bPY6ylV+wA9uOG71MENKxX1RLCQxfSjVmBIz33MyUsp7xtKICXWgVk7mohiRMynNNrp+9XBDSs+ARQpX/5ud2LBy86wnh3dY6uk83uKG3bShxVT7BP/VyH4nXpeLatNghoENBwzXRN4eja+GQ3frumebTFYz3wPEpDtB64XemFg0nZqO+ckefSgDbfGc739RMENKxMle5RlL6pGUP3OTSCPGdqRzUjlMcGbl34/KqRb9997FONZyPoMPz6CQIanARuirq6IISHArlkFY6u25be35i3D63esbvayHWPzHrCDwDgtdP3CAIaVn0C2F7GrS826xnxfHX/u9M/+kajS+cVd8XzRdp/xXp1H5ueoCxd73nsCfSYFwsKZViOnQgR0LDiE8CNPPBCwron9rpGpXcjrS/GS2O0dMm6rnWmhyL4GJucHGOus50MQUCDgIYFVS3/77pgryQC650Y7wq5oVgeM2d5M+K2Jc+/JPRLYrQe8bj7DGcneNjf66fvLwQ0rPQEcHUl+fYUi90/t03RuNgK2K7pGWl5X0mQ1yMC9GLgh4OuwB8T1iVhnhE/MAhnOH9W4UBAw4oDejso29aBLtlhMOlfsaN0q/CuyO2bC32jMHCH5lMvvVHKlBVMpsZyRn4ewDIB7fsNAQ0rDui5wde1yUnpvOYlg7Ja4Hkvcd+HiGcnbziN108Q0LCyE8D2ryF3dx68+vP2aha7y7vVHVG6+77d0d7dCw13Hydpn/6RtK+u0Td1oWs1jtIQ7fv4rvuss+yvd+uWz9PJG47HFA4ENKw4oKuWgN6drnEj3XOZx0zdyMDfNx3PseR2XfFcz4znqSG8VNx2rYQCnMbrJwhoWOkJoCqIya4VOoZW3OiK6WrCbbq2Dh+7ucqYeK1G3n7pyHWChtN0I0agEdCwStu/gtyeojHmz0NL0F10RGnfKh1tuwAutX13BqJ7TjyPmVPd90OKLbQBENBwwnancAz9OSmfEtE35WP3OXR9zFA8T72wb1/xPMfQDonA6TACjYCGFcdz2xSOMdtzVwWPsR2HQ8G9VIhWB/rYpZ+zKRtwXq+fIKBhZXa38m4L5K7IuyiI37Z1pftuP2YDlbrj/ruex9C0jbbPqe/EWTINpOSHChufgIAGAQ1neALo2iXwaq7z7jzltuXmSlbcqDriuuQ+diN703G7sTsQbt+m9Nexc0eLLUUH12MAwhQOBDSsPKR3I3Y3KKudE0dX+JaMTM/dQa8aeO4peLztt48ZST70yh6H5gJGAAQ0DITo1Xa0V8G8PTVhd0OVrvddvf8iD9zetm3TlZKR5kNN29ikfcWPrrCcMvJcZ/yW4ccMYiPiUOaG7xcENKw3oKuWKNwd1a3Svvzc7t93R6bbRqpL13oeM0q972kbc6dsHPIkWx/xsWFNTOFAQMOKA7otmEuDsvTvJfex+7bS+dCHWm1jasgeImCPOcINax+AAAENKzwB3NiJ1q7tvPumbVQ9f687gnjoIsKrt01ZA3povemh1Ta6jkPJDyNzVufou9/dUBbNIKBBQMMRXM1X3vREa1dIX/19dwfBzUDklWymkvSP4E6J53Q856H7GHNx4fZxXUrd87UDjv/6CQIaVqhtFGXKhipz5jyXPq8l4rl0ikrJc0zBDwJzw7naw30D+3ntBAENKzoBlATz9seUTNvom+oxFNT1hEDtGzW+GPjYauB2fT9gzJnr3DY9w8YqcB5cRIiAhpWfAPouJqxbIrPa+XvJyPOmMJ674rEvqodGlkumbJTcru15zl0TejemhTOchxsCGgEN6zU0zWL3fTfywNHSTUEUl7wtA/E8ZdpGydSLsRf8LXGBoFFmuH6vnSCgYYUngrY47FpTuMrwfOauSOxa53nsahtd91+ygcqx4lk4w/V73QQBDSuzyf3L2G2PJtcdfx+zkkY9EI/1QJj2xebutJG2j9sMhOyYTVTGTvEY+gHkEGzJDfsPaBGNgIaVBnTbMnZtaxqXjlKXxmKV4VHqrjC80fO+oekcpbsKzpnnfKiR5ikXWwICGgQ07PkkMLTj4O7tLloCeUwkj52yURLPY8NyytSOfURsPfPrCux3AMJFhAhoWPEJYJObpzXsTpPoWm1jN/Zu7Lyt7gjDTUskdk2rGJqyUc94f9tznbIax1LsMAgCGgQ0nLDt0ee+HQaHVtvoW2mjGhGcXfOg++K4bwR9zHSNMb+OXTqcRTOcZ0CDgIaVBvT2KMpuyNU9sVkSz0NvK4naqQFbugpHcvhl7EQzXK8BCBDQsNKIHgrjOv2rZVy9b3dXwuTmXQjblpprW50jLe8rma6RDK/SMWYVjmSZlTi2/3zs0SurdICABgENE7TtQpgML1PXNXp6kZvnQO8+znZQ941Sl0wJGfP+ofvvCswpOwR2HZ9DnGxLw9iJHwQ0CGiYcQIoWWljKEyvQnkoVrtGfvumRlx0hGid/g1Vhm5TEtpT4vWYoeyEDgIaBDQc4CTQtgrHdrhuz4fuu81u2HVNAWl7+6YlENtW9hgb9VVhfM6Zk7xkONdCGQQ0CGg4XdsXELZF8KYn3MaOOvetyDFmusYSW3QPxf6YwJ0bs3XB1wg4PTd8fyKgYd3GrqoxZuWNZNwmKn1BOhTGpSPBU1ffmBvLbcFcLRjjwGFfN32/IqBhxSeB7Skc2yeFi50TRdfW3n1vS8/bk/YVOdo+Jj3v74vr3eknfZHaNjJdGs5925vve8m6JXZNBMbZCGgENKz3BFA6haPuuM3Q27o+vuTtXffVFrYlo9ZTRqanTO049KjymCh2woflfnD1/YSAhpWfCNqCs+ttY1ap6JvGkYyf57yPaRpzpmccYuWNesTXDxDQIKBhj65GoPumRpTE7e5ocZ3+Eeq+6R1J/1SOvuXq+oJ2yvSMrmkZU6ZkVIVRvPRFioCABgENC58AtqdxdEVy31rKXaPTpZukjJmqMXcqR1ecpyBm526IMnTxoFiG8xuA8P2KgIaVh/SYIK4LPzYD4T1nqsbYKRqHXnGjNJhPnYsOARDQsBN1uxulzF2urm0Fj+3/t63aUTKNo3QljTFTIOoFw/lUgrnew78RoPv1EwQ0rPAEsMnwToJT3rYpiOyS9+1G+1Ij0kn5vOSSWD2VlTac0OEw2qa/gYCGlQT0bjxXhaG5xOYopdttL7l5St9tS7f9nhur9cSvFXA67ESIgAYB/Z/+Xo+M1anL1PVFYemOg2PCeepmI0vvPHjMGB4z7QXwQy0IaGixyQN/Ddk1At0VtV1vq9M9hWPofel5f9fHT43VeuaJsSQ893GSNc8ZTmcAAgQ0rPwEUBVEVul86N3Y6wrt7feVfGzfvOUx85/HhuMhRpLNcwYBDQIaTtyY6Rdj5kP33X77Y+ZcEDhlNY7S+1zy45Z6DEBAg4CGE9C2E+F2yLUtOVf33LYrjvumaJSM7JaO/s4ZjZ4TsPVCAQ+c3+snCGhYqZJl5UpHq6uJ75saw4eawjE25pcKZRf4wem+bvqBGAENKz4BlETyoVbZGLss3b6jeZ8bpBzrIkRg+YEHENCw0oDuWsauGgjJ3QsCq4FI7Jre0bfJym54D03hGNqcpe251R3HZ04M90Xyufz61yg4dL9+goCGFZ4AtudAzxlpnvJxybwVOLruK5k2NWTKvOmhjz2HZexK/p0AN/8A7HsDAQ0Uz1Eu2Qp7ynJzY29TEndzpmAcahOUesbXCTje66XvRQQ0rPQEcHUleddKGXVLNFcd72tbXWNo5Y3tP4+9zdBtu27fdru2iB0zxWLKFI4pjwOcBqtwIKCBm6ZS1ANvH/u+tvvsen/fbabcti1kp0zf6AviQ07hKA1zABDQsIdorlK+YUrf28eGbun7SwN47u1L4/TQq3Ac4nkA018/QUDDyk8AV3/vmrbRNlViaNpF37SO3fd33UfXyaoeiPGhYO+K2NLtzeuZcVwtdBvg8FxEiICGlQf0piWYt//fN/ViaCpF6bSOkngdOw2j5CLAfay8sWT4mqoBgICGEwzooQA1beN4MWyEC87j9RMENKzwRDAUt23TLuqZ7++7ze7t2t5fsuJGXfi2oZPhUPyOnbJxHdaHBgENAhpW52oZpjGrYvRN2SidjlG6gsY+pmz0xeucUei5W4Qv/YMQIKBBQMMeTwKbgficukFK19baJVE5ZW7yvpai20cUO/HC+Q9A+D5GQIOQ7gzCTU8MVx3xWKd7SkVpmFcDcVoyAj0mXseOCs+Zc31MpnoAIKBhorYpHCXRWRLAVcYtETdmusacEeQlLxZcIkSPEbNGzWCZ10/fSwhoWKkqZfOTS95fOiJbOld57P2WhOnUE1694H0dO2aNQMPyr50goGHFJ4CxUTxlSbqxq12MXb5uSpjWBcfqusSskz4IaBDQMPMEsEn/iG3JtIeSAB2z1NucC/KWXm+53vPX4NCMQIOABgENewi5MVM5SiP2FKdpLLXl9jlFrJM+CGgQ0DDzBDB2ubqSqF5ymsbcUN7nLoP1jGMPCGgQ0HDmAb3E/dUL3q4tNudOz6j3cAz3EdiAgAYBDWdyQuiKv9IVNebebig8D71U3dwgdoKFdbxegoCGlZ0EqsLILZ16MWaKxj5CeZ/rOe/7pGnEGgABDWcQz9WI2y89RWPsdI6lPnbsDwqH/JqIczh9NlJBQAPFIbmPEec584iXXnFj6YitT/jrC8z7fvI9hYCGFZ8ASqdwzI3qoYjb52obcwKynnmMAQENAhqu8QmhLRyrifdVd8RotcfnXxq7Yz63fU7xONYOiICABgENE2yS3Lj8f1vMlawP3ReB1cjInbvCxpjgnLLj4T6i1jJ4AAhoOCOlFxEOraM8dYWNfY1Q73OU+9CRa4QLTvv1EwQ0rDigDx2dU8J7TFAuccHgMS46PIeoBwQ0AhrIYS8YnDsNo574+YwNz+qafT2B5VjGDgENK47makSELRXKcwN5H0vXHSo8jQwDIKDhmoR0X+j1TfFYcrm60oAdE6GbCdG6z8jdCGm4Nq+bRqAR0OAk8ICwqyaEbRb4mDkft9T9zVmh41ifIyCgQUDDEU8KbZac5zz3wr2xJ6164WOxFKPQAAhoOMNYHtqJsGtEuusCw6ENSg5xAeFSIVwf4PgD58lFhAhoWHlA9wVd17znamQUztnV8BjqODkC5a+fIKBhhSeCvuide/uScF56zeV6T8dk6UgHAAEN1zisp06/WGJe8yGXo6uPdHyB83p99D2MgIYVnwBKl46bevHeuWzNfW7TTIDjvn6CgIYVnwBKlm0bswZ0yQmmnvA8SwP4VE+IpmwAIKDhmgb13EA+xpSNKQFcH/n4Auf9eul7GgENKw7mqiMqp26ZvcSycfs6MR3iMQABDQIaVhjVfeE55uNKPnZM0B57moZpGAAIaIcAsTz5tkuE8b5X16iPeMyWJt4BENBwZFNWnZg7BaLeY5DWJxa8SwexXxfD6TCFAwENKz4BbP9/6sV/S66oUS/w+ew7ZJc+/oCABgENZx7UY+PyGFM06j1/3nOZbgGAgIZrHMxVT/hNnd6xVJyO3U5835bechw4/9dQENDghLCXaKwXfD5LP8Z1OGEa8QZAQMM1ierS8Kz39DzXEp9GwsD3HQhoOOCL/5S47VsvespI9Ni5z0vOlT7Epi1OwgAIaFhhaM8J69L31zM/fuk4PcaqIAAgoOHEw7iaGIxTdy1cIjrrAx+jfTJ/GQABDdcgqueE3yFGfZeY73wq23obqYbr/3oJAhqu2Yv/mI1USk4e9ULPax8RW+3h+J0zo98ACGhYOAjrhe5nX9E2J2LFoxE08P0DAhoOdoLY9zzn0mkcp3qRX33mX1/A9w8IaOh58Z8y8rzvNZerhW936Mh1YgVAQMNK43rp6Fxq9PnUI9f0EAAENDAYncdYlaI+w+MEXP/XQxDQ4CRwkB396j0992MwAg2AgAaRvfdQvA4jz6ce9oDvcxDQcOQX/0MuWbfUczc6DAACGg4Wo8fcuMTOf8C5vnaCgAYnjL0G7pInK6PNACCg4ahBOuf+6jP+HIU4AAhomByZ9YEe55TC1q9qAUBAw15isj6h53Iq8Q0AAhpWEML7vM/6Gn/+Ih0AAQ1CevEoXNMW2qZ+gNdOENDAQTZVOZUTmhFkABDQcPR4ra/h5wR4zQMBDSt68T/0vOV9n3SMGgOAgIaTie1zCFbTOABAQMPZxvV1iFC/pgW8NoCAhge8+FcHCN41rbwBrMOtDgECGigNXlM2gDW/Nj708s/3OhwIaGCpYK2v+ed3ysQ/7O9760FpRp3fl+Rbk/yWw4KABg4ZoEJP/MO52CR58OWfn5nk3yZ5o8OCgIZ1x9YxNkY5dOgJdmCKh1y+Xv1Rkm9I8iyHBAQ0TInc+hp9LuIcaPuevpFm1PnOJD+U5JvSTN0ABDTsLUZrxwM4U1cXCb4sydcmeaVDAgIarkNUGvUFlvbgy9euv0zy/yT5sST3OCwgoKEvduszfM5iHJj7/X8jzQobSfKMJF+X5G0ODQhomBul9Uo/72Od0IHDuPWyBd6QZrrGcx0SENBwipEpEM8r6OG6nv9vpJmi8S1JvjnJHQ4LCGi4LoEouIElXa3p/OIkX5/ktx0SENCw9uAW5EDb9/2taUad/yLJNyb5wSQXDg0IaJgSptd9a+59Bzlw+uG8ufz7jyf5d0ne7tCAgIZjBqcRXeBUXU3X+MMkX53kBQ4JCGg4h8AW28AxXpduTXJ7ku9K8u1pdhUEBDRc69jeFxEP19PVms5X5/ZfTjPq/DqHBgQ0cP4RL+pheVfTNd6R5BuSPMkhAQENawhJXwtgyvfP1fn8J9MsTfcXDgsIaDiHeDOKChzSJs2UjSR5TZKvSvJShwUENFzXEBfbwBw3LgP69iRPTPIdST7ssICABrEtvoGb3Xr5/+cn+do0S9QBAhrYU3yvmR88OPfv+6tz9tuT/NskT/bvGgQ0gB884OYf/G65/PdbJ/m+JP9vkvc4NCCgAYCbXU3X+O000zV+xSEBAQ3HVO38fw6/RgWWdOPytemDaUacv8shAQEN1zXGBTcw97Xkamm6Z6UZdX6LwwICGrD2NNB9Tn5rms1QnuGQgIAGTjfERTwc73t4c/n/jyT5/iTfGBcJgoAGRDxwk83W989vJvlXSV7psMB5fPMCAIf/wbNK8t4kX5PkseIZzocRaAA4nO1R52ekuUjw7Q4LCGg4F0stY2cOMFDianWNN6a5SPDnHRIQ0LD2EBffQJvtiwS/O8m/S3KHwwICGjh8fItxOP3v76trjX4tyVcnebXDAgIauJ4xDsz7Xrz6fnxPkn+d5EcdFhDQAEB3PNdJnpLkG5L8mcMCAhoAuNnVdI3Xp1ld43kOCQhoAKA7nD+c5Dsv//uAwwICGgB4oO25zi9Os5Pgax0WWM9PzQDA+Hh+R5J/keTx4hnWwwg0az8Bbv+/i+XhgCvbA08/luYiwXc7LCCggfbQHkt4w/WM599LM13jJQ4JCGjgNMJbkMPpfS9XSe5K8m1JviXJ3Q4LCGhgfUEOlH/PPT/J1yd5ncMCCGgA6I7ndyT5uiQ/7ZAAV6zCAQA3x/O9SX4oyWeIZ2CXEWgAuD+ck+R30lwk+KsOCdDGCDQAwrn57/YkX5Pk88Qz0McINABrj+ck+cUk/zLJHzkkwBAj0ACsMZqv/vuTJP8syZeIZ0BAA0B7PCfNuurfk+YiwWc6LMAYpnAAsLZ4fmWSr0rycocEmMIINABrCOcqyQfTXCT4D8QzMIcRaACuczhfeWqSf5NmzjOAgAaAjnh+c5qdBJ/lkAACGgC6w/muJN+b5BuT3OGwAAIalj3RVgO3qx0qOKvv6V9Ls5PgbzskgICG456UlybMYdnv0fcn+ddJfsghAQQ0CPNjEPic0/fQM5J8bZK3OyyAgAYEPnR7Y5L/M8kvORTAoVgHGoBzdFeSb0nymeIZODQj0ACcm5ekuUjw9xwK4BiMQANwLt6V5H9L8gTxDByTEWgAzsGPp1lh4y8cCkBAA0C3P0jyNUle4FAAp8IUDgBO0Z1J/q8knyaegVNjBBqAU/NLSb4qyesdCuAUGYEG4FT8eZL/NckXi2dAQANAvx9O8hlJftKhAE6dKRwAHNPvpNlJ8NcdCkBAA0C3DyR5YpLvSHKPwwEIaADo9gtpdhJ8s0MBnCNzoAE4lLcm+WdJvkI8AwIaAPr9QJqLBJ/pUADnzhQOAPbplWl2EnSRIHBtGIEGYB9uT7O6xueKZ+C6MQINwNJ+NsnXJXmLQwEIaADo9pYkX5vkWQ4FIKABoNu9Sb4zybcneb/DAQhoAOj2m2nmOr/aoQDWwkWEAEzxF0n+9ySfJ56BtTECDcBYT07y9Une6VAAAhoAuv1Rkq9K8nyHAlgzUzgAGHKR5gLB/048AxiBBqDfC9PsJPhahwKgYQQagDbvTvIvkjxBPAM8kBFoALZ9JMlPJfk3Sd7lcAAIaAC6/X6Sr04zbQOADqZwAPDhNCPOny2eAYYZgQZYtxem2Unw9Q4FQBkj0ADr9I4k/zzNRYLiGUBAA9DjR5N8apKnOhQA45nCAbAer0mzk+BLHQqA6YxAA1x/d6a5SPAx4hlgPiPQANfbs5N8bZI/digAlmEEGuB6eluS/yXJ/yieAZZlBBrgerk3yfcn+b+T3OZwAAhoALq9Is1Fgq9wKAD2xxQOgPN3R5J/leRzxTPA/hmBBjhvz0rydUne7FAACGgAur05zXSN5zgUAIdlCgfAebk7yXcn+UzxDHAcRqABzsdvJPmXSV7tUAAcjxFogNP37iT/R5LHiWeA4zMCDXDanppmJ8F3OBQAAhqAbq+8DOeXORQAAhqAbh9M8p1JXpXkPQ4HgIAGoN1H0qzp/BNJ/kqSf57k45L8SpInJ3mXQwRwGqq6rh0F1vmPv6relOS/diQ4AW9K8sQkb0/y+CT/TZJ7k9RJHprkfZdx/YI0y9jBSdAQCGgQ0HBo9yX5wSQ/l+TvJPnSJPck+fDO7R6S5GFJfifJU5L8gUOHgAYBDQKatXlZku9NM6L8xZf/Ft+fZipHtdspaZYdfVSS25P8UpJnJLnNYURAg4AGAc11947LcH51kscm+buXb7+r8OMfnGY0+k+S/HSSX3dIEdAgoEFAc109Lcl/TPLXkvzjJDdGhPOuh1zG9G8m+akkf+rwIqDhMKzCAbB/r0vy3WlW0nh8kk9LM/3iw7l5ukapD6eZQ/3YNPOnfy7Jc9LMoQZgj4xAs95//Eag2b97knx/kucl+ZQkj0kzcvyhhR/nYWkGRP4wzZJ3r3XoOQQNgYAGAQ1LemmaDVFuJPmfkzwizQWA+3rRrZJ8dJqLEJ+f5GfSXJQIAhoENAhoTto7k3xXktck+bwkn5NmxPmeTJ+uUdwzSR50GetvS/L0JC/yJUFAg4AGAc0pujfN9ImnJfmENHOTH5Hkjuxv1Lnzn3eSj7p83N9Ks3b0W32JENAgoEFAcypel+Tbk7wnyZcl+fgkdya5OPLz2qSZ1nFHkp9P8uzcvEkLCGgQ0CCgOZgPpVnT+YVp1nN+Qpo5yHdk/9M1ihsnzUWGD0uzg+GT0+xoCAIaBDQIaA7ql5P8QJpVNR6f5K9fhvNHTiietyN6k+Rj0ux8+JI00zpcZIiABgENApq9+7Mk35xmNPfLknxSmuka953J878lycPTrEn9lCQv9iVFQIOABgHNPtyX5CfTrGzxCUm+OMmtaZam25zZ53KRZm70g5O8Ks1Ohn/sS4yABgENApqlvCrNToJ3JHlckk9MczHe3Tm96RrF7ZNmybuPTjOV4zlJfiHLb/KCgAYBDQKaFflQkv8vzVrKj0ny99IsV3fdtsu+9TKk35xmNPq3fOkR0CCgQUAz1i8k+cHLsPzKJI9MM1JbXdPPt06zbvVFmnnRT0/y5/4ZIKBBQIOAZsib0ixN90dJ/mGST00zVeOuaxzP2xH94Nx/keEzkvxSmpVFQECDgEZAC2ge4N4kP3oZjZ+S5AvSXBx4T46/IcrBvz3SLM/3oCS/nWbt6D/yTwQBDQIaAS2gufKKNKPOdyb5kjQ7CV7n6RrFfZTkUWkumHxemmkdLjJEQKMh/ONHQLNi701zkeBvJPmsJJ93Gc2ntJPgKUT0w9KMSL8pyVOTvNxhQUAjoEFAsz4/l2bKxn+W5IuSfFSaec6nuJPgKUT05jKkqyQvS/KkuMjQPwwNgYAGAc0qvCXJNyV5a+7fSfADwnlUSD8yybuTPDPJ83M+uzAioEFAg4BmhDuS/Hia5en+TpLHppmWcJtwnhTSVzsZvibN2tF/6LAIaBDQIKC5Pn41zUWCSTNd49FpVtcwcjovom9J8tA0U19ekGZazPsdGgENAhoENOfr3WkuEnx5ks9P8jlJbhfOi7uRZhOWtyV5WpJfcUgENAhoENCc2Xn9MuR+IsnHJfnSJB8bo6P7drWT4a+nWa3j7Q6JgAYBDQKa0/faNNM13plmusbfTLNJyt0x1/kQP7g8KM2KJu9L8rNp5pzbyVBAg4AGAc0JujfNdI3nJvnMJI9PswHIvQ7NUdyaZkvw16W5yPC1DomABgENAprT8cIkP3z55y9K8jfSTNfwAnd8j0pzkeEvp5nW8QGHRECDgAYBzfH8eZLvSLOU2t9P8mlppml82KE5ncZKs1zgQ9LMiX5Gkl+LaR0CGgQ0CGgO7klJfjLJJyT5x5fhfKfDctIemmbt6Jdffv3e6pAIaBDQIKDZv99LM+r87jTTNT45zXQNOwmeQW+l2cnwY5O8N80Fhj8fvzEQ0CCgQUCzF+9L8iNp5jt/VpLPTnOh2occmrP0sDSj0X+Y5MlJftchEdAgoEFAs5wXJPm+y+j6ijTLpN0VFwme/bdhmmkdVZIXpVm7+90Oi4AGAQ0CmuneluS70oxSXu0keFus6XytGizN2tGPTHOR4c9c/sCEgAYBDQKaES7SXCD4tCQfn+QLLgPr9sv3iefrF9FVmnWj6ySvSvLTSd7s0AhoENAgoBn26jQXCd6W5CuT/LU0q2tY9mwdbiT56DRz25+dZjfDux0WAQ0CGgQ0N7stzU6Cv5pmJ8HHXYaz6Ror7LI00zoekeQNaUajX+GwCGgQ0CCgud+zk/xYko9J8o/SjDpfTddgxd+mlxF9d5KXptnJ8C8dFgENAhoE9Jq9Pcm3JXljkick+dtJ7klyr0PDllvSrLzy7jQXGf6yfyMCGgQ0COi1uTfJj6aZ3/q30uwkWCe5I6Zr0NFqaZYxfEiaefJPvvzBCwENAhoE9LX3iiTfnWb3uS+8/BrcnuQ+8UxBRN+SZqrPbUl+Mc2ItM10BDQIaBDQ19K706zp/PI0y9J9xmU0W2GBKR6UZkT6T5I8KS4yFNAgoEFAXzPPSvIfknxski9Ps/vc7THizMx+SzM3+pYkv57kp5K802ER0CCgQUCfszemGXV+W5LHJvn0NFM37hLPLBjRD06zCcufJ3lmmqkd9zk0AhoENAjoc/KRJD+c5iLBT07yD5LcehnOXnTYl4emmdrx2jSj0a93SAQ0CGgQ0Ofg19PsJPiRJP9Tkkcneb/DwgE94vKHteelGZG+zSER0CCgQUCfoncl+fdJXpXks5N8Tppfo9+ZZOPwcEAXaUajH57kLWk2YPlVh0VAg4AGAX0y59AkT0vyH5P8l2l2Enx4mhHAjzg8HNEmzUoddZLfuAzpP3VYBDQIaBDQx/SGJE9Ms/LBl1wezw/GPGdO7Ns9zbSODyT5uSS/EMsnCmgQ0CCgD+xDSX4gyfOTfFKaDVFuSTPX1OoanGTrJfno3H+R4VMu/4+ABgENAnrvXnwZz7dchvOj00zXuFc8cwYRfUuataPvTvLCNNOPPuDQCGgQ0CCg9+Evk3xTkt9N8sVJPjPNiLN5zpxjSN9I8sg0c6KfkuSlDouABgENAnop96YZpXtKkv88yRPSXCT4wRhx5vxD+mMuY/oVadaOfqvDIqBBQIOAnuP30uwk+J4kj788Xvek+fW3eOa6RPSD0qzW8b4kP59mbv+dDo2ABgENAnqMu5N8b5LnJvl7ST4/989zhuvq1jS/XXlDmtHo33FIBDQIaBDQJV6Q5PvSjMp9eZK/nmZkDtbiEWl+0/KiJE9P8xsYBDQIaBDQN3lLmp0E/yDJY5N8Spod3T4c0zVYWRcmeUia1Tr+7DKiXxTrmwtoENAIaAG9FQs/muSnk/y3aVbYqNOMwHmBYO0ekuTBabaof3KSP3ZIBDQIaAT0ur0qzVznDyT5oiSfmGa6xkWMOsPVD5ibJI9Ks2zjc5P8TJrfzDg4GgIBDQJ6RT6Y5HvSrH37mUkek+YCqjv8y4DOkP6oNNcGvCHJUy9/ABXQIKBBQK/Ac5L8YJpNJL4iza+o70qzIYpRZ+iP6E2aJe82SV6SZn30vxTQIKBBQF9Pb0vyrUnemGYL7s9KM11DOMP4kL6RZlrHu9JM6fjFNFOfBDQIaBDQ18Cdada0fdbl5/v5ada6vc2/Apjt4Zcx/duX32dvEtAgoEFAn7dXJvmONBujfFmSv5pmM5T7/AuAxdxI8tA0U6Gel+TZaa4zENAgoEFAn5H3plld42VJPifNus53xBbcsLeWTHOB4SPSjEL/dJLfENAgoEFAn4dnJfmxyxP5E5I8Os1omKXpYP8RXV1+792X5NcuQ/pdAhoENAjo0/T6JN+V5K1ppmv8V2k2Q7nHVxsO7tY0y969J8kz06wffe0uMtQQCGgQ0OfqIs10jV9I8klpdhK8O6ZrwNH7Ms20jocneU2SJyX5AwENAhoE9HH9SpIfuIzox6cZdf5gml8fi2c4jYi+kWbd9TuS/FKSp+earIKjIRDQIKDPyfuSPDHJbyX5+0k+/fJEfbevLJysB6fZuOhtSZ6W5iLfsz4JawgENAjoc/H0NBcJPjrJVya5JbbghnPysDRzpF+W5MlJ/kxAg4AGAb0ff5hmTed3JvmCJJ+W5PY06zqbrgFn1J2XP/g+Ms024M9O8pyc4QW/GgIBDQL6VN2e5IfTbBX8GWnWdb41zQ6DwHm7Go1+XZrR6N8X0CCgQUDP85I0K2xskvyTNCNWH9o9h8UINJy7j0pzMfAL00zTeq+ABgENAnqcd6RZ0/n3kjzm8r8PX/4nluH6qdNcYPjwJH9yGdEvEdAgoEFAl3lKmvVi/4skj7s8od4ZOwnCGiJ6k2ZaR5XklWmmdbxNQIOABgHd7rVJvjXNr27/aZKPT7Oms29SWOFLVJotwW9L8qw0Fxqe3EWGGgIBDQL6WG5LsxnKi5L83TSjzh9JM9d54ysFq3WRZjT6o5K8Ps1o9KsFNAhoWHtAPz/NChsPS7OT4KPTzHO2NB2Q3L/k3UcnuSvJi5M8I8l7BDQIaFhbQL8rybelWbLqC9OMPH8ozcgzQJsbST7m8vXj6Wl+a3XU1wwNgYAGAX0I9yX5iSRPTfIJSb4szfa+H4wRZ6CgWdNcWHxL7r/I8M0CGgQ0XNeAflWS70mzMcrjkvytNL+SvUc8AyMj+tY00zo+mOR5SX42zfQvAQ0CGq5FQN+WZk3nFyf5/CSfm+TunOG2vcDJeVCaiwzflOSncuCLDDUEAhoE9D48N8mPXJ7gvjTJX0ny/hhxBhbs2DRL3tVJXppmWsdfCGgQ0HBuAf2WJE9MMzfxsUk+Nc3FPneKZ2BPEf2QNCv6vDPJz6S5yPA+AQ0CGs4hoH8kydOSfFKSf3R5YrsnNkQBDvDSlubC5IckeU2Sn0zyRgENAhpONaBfkeQ70lzI80/SrLLxXkcaOJJHpVke8zlpdjO8XUCDgIZTCeg/T/KDSX4zyX9/+d/m8sRlugZwLHWSh6aZ1vHmJE+5fJ0S0CCg4agB/bNppmz81SRfcnmyujvNFrwAJ/FydxnRVZqLDJ+WZp60gAYBDQcN6Dcl+e40ozpPSLOT4Psuw9moM3Bq6jS/GXtUmm3AfzbN1I5ZFxlqCAQ0COgSdyb5D0l+PsknptkQ5WFp1noGOIeQfniabcF/N820jtcLaBDQsK+A/rUk/z7NKPOXJPm4NNM17otRZ+C8IvqWyx/+70nyi0mengkXGWoIBDQI6C7vS/LNabbi/odJHpNm+1zhDFyHkH5kmrXrn3o5UCCgQUDD5IC+L81mBE9Oc5Hg49KMOn/A0QOuWUhf7WT4m5eveX8qoEFAw9iAfkOSb0uzRN0XJfmbl0F9jyMHXNOIflCaDVjen+TZaaZ2fFhAg4CGoYC+K8kPJHlukk9P8oWXJ5C7HTFgJR6U5kLD308zGv0aAQ0CGroC+kVJvi/NvOb/Ic1Ogu+PpemAdbla8u6RlwMIv5zkGWmuBxHQIKBZeUC/LcnfSPK2y3B+TZqLBD/58iYfdpSAlXvI5X9/muYiw5cKaBDQrDugn5NmU4FvuQzpL798112ODkBrSL88yZNyuXa0hkBAw/oC+tOSPDrJ5yT5pFiaDqBLnWbzlUelmcrxc0neXNf1mx0aBDQAANBr4xAAAICABgAAAQ0AAAIaAAAENAAACGgAABDQDgEAAAhoAAAQ0AAAIKABAEBAAwCAgAYAAAHtEAAAgIAGAAABDQAAAhoAAAQ0AAAIaAAAENAOAQAACGgAABDQAAAgoAEAQEADAICABgAAAe0QAACAgAYAAAENAAACGgAABDQAAAhoAAAQ0A4BAAAIaAAAENAAACCgAQBAQAMAgIAGAAAB7RAAAICABgAAAQ0AAAIaAAAENAAACGgAABDQDgEAAAhoAAAQ0AAAIKABAEBAAwCAgAYAAAHtEAAAgIAGAAABDQAAAhoAAAQ0AAAIaAAAENAOAQAACGgAABDQAAAgoAEAQEADAICABgAAAe0QAACAgAYAAAENAAACGgAABDQAAAhoAAAQ0A4BAAAIaAAAENAAACCgAQBAQAMAgIAGAAAB7RAAAICABgAAAQ0AAAIaAAAENAAACGgAABDQDgEAAAhoAAAQ0AAAIKABAEBAAwCAgAYAAAHtEAAAgIAGAAABDQAAAhoAAAQ0AAAIaAAAENAOAQAACGgAABDQAAAgoAEAQEADAICABgAAAe0QAACAgAYAAAENAAACGgAABDQAAAhoAAAQ0A4BAAAIaAAAENAAACCgAQBAQAMAgIAGAAAB7RAAAICABgAAAQ0AAAIaAAAENAAACGgAABDQDgEAAAhoAAAQ0AAAIKABAEBAAwCAgAYAAAHtEAAAgIAGAAABDQAAAhoAAAQ0AAAIaAAAENAOAQAACGgAABDQAAAgoAEAQEADAICABgAAAe0QAACAgAYAAAENAAACGgAABDQAAAhoAAAQ0A4BAAAIaAAAENAAACCgAQBAQAMAgIAGAAAB7RAAAICABgAAAQ0AAAIaAAAENAAAXE///wB6+Dutuq7OyAAAAABJRU5ErkJggg=="

/***/ },
/* 9 */
/*!********************************************************!*\
  !*** ./~/url-loader?limit=40000!./assets/branding.png ***!
  \********************************************************/
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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AACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAIDEFDgAAAAAAAACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAIDEFDgAAAAAAAACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAIDEFDgAAAAAAAACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAIDEFDgAAAAAAAACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAIDEFDgAAAAAAAACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAIDEFDgAAAAAAAACAxBQ4AAAAAAAAAAASU+AAAAAAAAAAAEhMgQMAAAAAAAAAILH6iMilDgEAAAAAAAAAcC6zAwcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAAAAAkpsABAAAAAAAAAJCYAgcAAAAAAAAAQGIKHAAAAAAAAAAAiSlwAAAAAAAA/z+7diwAAAAAMMjfehh7iiMAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAAAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAAAAAAJgJHAAAAAAAAAAAM4EDAAAAAAAAAGAmcAAAAAAAAAAAzAQOAAAAAAAAAICZwAEAAAAAAAAAMBM4AAAAAAAAAABmAgcAAAAAAAAAwEzgAAAAAAAAAACYCRwAAAAAAAAAADOBAwAAAAAAAABgJnAAAAAAAAAAAMwEDgAAAAAAAACAmcABAAAAAAAAADATOAAAAAAAAAAAZgIHAAAAAAAAAMBM4AAAAAAAAAAAmAkcAAAAAAAAAAAzgQMAAAAAAAAAYCZwAAAAAAAAAADMBA4AAAAAAAAAgJnAAQAA8EAPOgAAIABJREFUAAAAAAAwEzgAAAAAAAAAAGYCBwAAAAAAAADATOAAAAAAgNq7Q+g0tvXhw/t/1xEZiQwSGSQySGSQkY2MPJG1tZG9EkllZCKRRCKJRBKJnLp+oh+5CZk9DDThTdvnWeuudcoE2EPoNfvXdwMAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAECwf1JKP6IXAQAAAAAAAADwNzOBAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIADAAAAAAAAACCYgAMAAAAAAAAAIJiAAwAAAAAAAAAgmIAD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BwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAF9zo4xAAAAc0lEQVQHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAEAwAQcAAAAAAAAAQDABBwAAAAAAAABAMAEHAAAAAAAAAECw/weA+udC/TFksAAAAABJRU5ErkJggg=="

/***/ }
/******/ ]);
//# sourceMappingURL=logo-bundle.js.map
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Vue = __webpack_require__(1),
	    qs = __webpack_require__(3),
	    Gallery = __webpack_require__(6);

	var breakpoints = {
	  small: 320,
	  medium: 768,
	  large: 1024,
	  xlarge: 1280
	},
	data = {
	  isMobile: window.innerWidth <= breakpoints.medium,
	  letterDimensions: maxLogo.letterDimension
	};

	window.addEventListener('resize', function() {
	  data.isMobile = window.innerWidth <= breakpoints.medium;
	});

	window.addEventListener('load', function() {
	  var qsVals = qs.parse(location.search),
	      error = qsVals.error;

	  delete qsVals.error;

	  var newLocation = location.href.split('?')[0];

	  if(Object.keys(qsVals).length > 0) {
	    newLocation += '?' + qs.stringify(qsVals);
	  }

	  history.pushState(null, "", newLocation);

	  if(error) {
	    alert(error);
	  }
	});

	var LogoBuilder = Vue.extend({
	  template: __webpack_require__(14),
	  props: {
	    isMobile: {
	      type: Boolean,
	      required: true
	    }
	  },
	  data: function() {
	    var data = {
	      currentLetter: null,
	      previewImage: null,
	      savedImage: false,
	      termsAgreed: false,
	      expandTerms: false,
	      letters: {
	        m: {
	          name: 'M',
	          selectorImage: 'img/selector-m.jpg',
	          canvasBg: 'img/mobile-canvas-m.jpg',
	          elemResult: null,
	          updateMethod: window.maxLogo.updateM.bind(maxLogo)
	        },
	        a: {
	          name: 'A',
	          selectorImage: 'img/selector-a.jpg',
	          canvasBg: 'img/mobile-canvas-a.jpg',
	          elemResult: null,
	          updateMethod: window.maxLogo.updateA.bind(maxLogo)
	        },
	        x: {
	          name: 'X',
	          selectorImage: 'img/selector-x.jpg',
	          canvasBg: 'img/mobile-canvas-x.jpg',
	          elemResult: null,
	          updateMethod: window.maxLogo.updateX.bind(maxLogo)
	        }
	      }
	    };

	    data.currentLetter = data.letters.m;

	    return data;
	  },
	  methods: {
	    isPreviewReady: function() {
	      var self = this;

	      return (self.letters.m.elemResult != null &&
	          self.letters.a.elemResult != null &&
	          self.letters.x.elemResult != null);
	    },
	    addFormAndSubmit: function() {
	      var self = this;

	      return window.maxLogo.saveImage()
	      .then(function(imgSrc) {
	        var dataInput = document.createElement("input") ;
	        dataInput.setAttribute("name", 'imageData') ;
	        dataInput.setAttribute("value", imgSrc);
	        dataInput.setAttribute("type", "hidden");

	        var myForm = document.createElement("form");
	        myForm.method = 'post';
	        myForm.action = 'https://www.wreckerlab.com/';
	        myForm.appendChild(dataInput);

	        document.body.appendChild(myForm);
	        myForm.submit();
	        document.body.removeChild(myForm);
	      }).catch(function(err) {
	        alert(err);
	      });
	    },
	    saveImage: function(generatePreview) {
	      var self = this;

	      if(!self.isPreviewReady() || !self.termsAgreed) {
	        return;
	      }

	      if(generatePreview) {
	        self.generatePreview().then(function() {
	          self.addFormAndSubmit();
	          this.savedImage = true;
	        })
	      } else {
	        self.addFormAndSubmit();
	        this.savedImage = true;
	      }

	      s_adbadobenonacdc.linkTrackVars = 'channel,prop3,prop4,prop5,eVar12';
	      s_adbadobenonacdc.tl(this, 'o', 'max.adobe.com:logobuilder:saveimage');
	    },
	    revertToLogo: function() {
	      this.previewImage = null;
	      this.savedImage = false;
	    },
	    resetView: function() {
	      this.letters.m.elemResult = null;
	      this.letters.a.elemResult = null;
	      this.letters.x.elemResult = null;
	      this.previewImage = null;
	      this.savedImage = false;
	      this.currentLetter = this.letters.m;
	    },
	    generatePreview: function() {
	      var self = this;

	      return window.maxLogo.getImage()
	      .then(function(imgSrc) {
	        self.previewImage = imgSrc;
	      }).catch(function(err) {
	        alert(err);
	      });
	    },
	    updateLetter: function(imageUrl, letter) {
	      var self = this;
	      if(letter) {
	        self.currentLetter = letter;
	      }

	      if(self.currentLetter.name === 'M') {
	        s_adbadobenonacdc.linkTrackVars = 'channel,prop3,prop4,prop5,eVar12';
	        s_adbadobenonacdc.tl(this, 'o','max.adobe.com:logobuilder:chooseimage:1');
	      } else if (self.currentLetter.name === 'A') {
	        s_adbadobenonacdc.linkTrackVars = 'channel,prop3,prop4,prop5,eVar12';
	        s_adbadobenonacdc.tl(this, 'o','max.adobe.com:logobuilder:chooseimage:2');
	      } else if (self.currentLetter.name === 'X') {
	        s_adbadobenonacdc.linkTrackVars = 'channel,prop3,prop4,prop5,eVar12';
	        s_adbadobenonacdc.tl(this, 'o','max.adobe.com:logobuilder:chooseimage:3');
	      }

	      self.currentLetter.updateMethod(imageUrl).then(function(result) {
	        self.currentLetter.elemResult = result;
	      }).catch(function(err) {
	        alert(err.message);
	      });
	    }
	  }
	});

	var ImageSelector = Vue.extend({
	  template: __webpack_require__(15),
	  props: {
	    letter: [Object]
	  },
	  methods: {
	    onFileSelected: function() {
	      var file = this.$els.imageSelector.files[0],
	          reader = new FileReader(),
	          self = this;
	      reader.onloadend = function() {
	        self.$dispatch('image-selected', reader.result, self.letter);
	      };
	      if (file) {
	        reader.readAsDataURL(file);
	      }
	    },
	    setValToNull: function() {
	      this.$els.imageSelector.value = null;
	    }
	  }
	});

	Vue.component('logo-builder', LogoBuilder);
	Vue.component('image-selector', ImageSelector);
	Vue.directive('canvas-append', {
	  bind: function () {
	    if(this.value)  {
	      this.el.appendChild(this.value);
	    }
	  },
	  update: function (newValue, oldValue) {
	    this.el.innerHTML = '';
	    if(newValue) {
	      this.el.appendChild(newValue);
	    }
	  }
	});
	Vue.component('gallery', Gallery);

	var app = new Vue({
	  el: '#logo-builder-app',
	  data: data
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {/*!
	 * Vue.js v1.0.26
	 * (c) 2016 Evan You
	 * Released under the MIT License.
	 */
	'use strict';

	function set(obj, key, val) {
	  if (hasOwn(obj, key)) {
	    obj[key] = val;
	    return;
	  }
	  if (obj._isVue) {
	    set(obj._data, key, val);
	    return;
	  }
	  var ob = obj.__ob__;
	  if (!ob) {
	    obj[key] = val;
	    return;
	  }
	  ob.convert(key, val);
	  ob.dep.notify();
	  if (ob.vms) {
	    var i = ob.vms.length;
	    while (i--) {
	      var vm = ob.vms[i];
	      vm._proxy(key);
	      vm._digest();
	    }
	  }
	  return val;
	}

	/**
	 * Delete a property and trigger change if necessary.
	 *
	 * @param {Object} obj
	 * @param {String} key
	 */

	function del(obj, key) {
	  if (!hasOwn(obj, key)) {
	    return;
	  }
	  delete obj[key];
	  var ob = obj.__ob__;
	  if (!ob) {
	    if (obj._isVue) {
	      delete obj._data[key];
	      obj._digest();
	    }
	    return;
	  }
	  ob.dep.notify();
	  if (ob.vms) {
	    var i = ob.vms.length;
	    while (i--) {
	      var vm = ob.vms[i];
	      vm._unproxy(key);
	      vm._digest();
	    }
	  }
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	 * Check whether the object has the property.
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @return {Boolean}
	 */

	function hasOwn(obj, key) {
	  return hasOwnProperty.call(obj, key);
	}

	/**
	 * Check if an expression is a literal value.
	 *
	 * @param {String} exp
	 * @return {Boolean}
	 */

	var literalValueRE = /^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s?$/;

	function isLiteral(exp) {
	  return literalValueRE.test(exp);
	}

	/**
	 * Check if a string starts with $ or _
	 *
	 * @param {String} str
	 * @return {Boolean}
	 */

	function isReserved(str) {
	  var c = (str + '').charCodeAt(0);
	  return c === 0x24 || c === 0x5F;
	}

	/**
	 * Guard text output, make sure undefined outputs
	 * empty string
	 *
	 * @param {*} value
	 * @return {String}
	 */

	function _toString(value) {
	  return value == null ? '' : value.toString();
	}

	/**
	 * Check and convert possible numeric strings to numbers
	 * before setting back to data
	 *
	 * @param {*} value
	 * @return {*|Number}
	 */

	function toNumber(value) {
	  if (typeof value !== 'string') {
	    return value;
	  } else {
	    var parsed = Number(value);
	    return isNaN(parsed) ? value : parsed;
	  }
	}

	/**
	 * Convert string boolean literals into real booleans.
	 *
	 * @param {*} value
	 * @return {*|Boolean}
	 */

	function toBoolean(value) {
	  return value === 'true' ? true : value === 'false' ? false : value;
	}

	/**
	 * Strip quotes from a string
	 *
	 * @param {String} str
	 * @return {String | false}
	 */

	function stripQuotes(str) {
	  var a = str.charCodeAt(0);
	  var b = str.charCodeAt(str.length - 1);
	  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
	}

	/**
	 * Camelize a hyphen-delmited string.
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var camelizeRE = /-(\w)/g;

	function camelize(str) {
	  return str.replace(camelizeRE, toUpper);
	}

	function toUpper(_, c) {
	  return c ? c.toUpperCase() : '';
	}

	/**
	 * Hyphenate a camelCase string.
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var hyphenateRE = /([a-z\d])([A-Z])/g;

	function hyphenate(str) {
	  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
	}

	/**
	 * Converts hyphen/underscore/slash delimitered names into
	 * camelized classNames.
	 *
	 * e.g. my-component => MyComponent
	 *      some_else    => SomeElse
	 *      some/comp    => SomeComp
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var classifyRE = /(?:^|[-_\/])(\w)/g;

	function classify(str) {
	  return str.replace(classifyRE, toUpper);
	}

	/**
	 * Simple bind, faster than native
	 *
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @return {Function}
	 */

	function bind(fn, ctx) {
	  return function (a) {
	    var l = arguments.length;
	    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
	  };
	}

	/**
	 * Convert an Array-like object to a real Array.
	 *
	 * @param {Array-like} list
	 * @param {Number} [start] - start index
	 * @return {Array}
	 */

	function toArray(list, start) {
	  start = start || 0;
	  var i = list.length - start;
	  var ret = new Array(i);
	  while (i--) {
	    ret[i] = list[i + start];
	  }
	  return ret;
	}

	/**
	 * Mix properties into target object.
	 *
	 * @param {Object} to
	 * @param {Object} from
	 */

	function extend(to, from) {
	  var keys = Object.keys(from);
	  var i = keys.length;
	  while (i--) {
	    to[keys[i]] = from[keys[i]];
	  }
	  return to;
	}

	/**
	 * Quick object check - this is primarily used to tell
	 * Objects from primitive values when we know the value
	 * is a JSON-compliant type.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	function isObject(obj) {
	  return obj !== null && typeof obj === 'object';
	}

	/**
	 * Strict object type check. Only returns true
	 * for plain JavaScript objects.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	var toString = Object.prototype.toString;
	var OBJECT_STRING = '[object Object]';

	function isPlainObject(obj) {
	  return toString.call(obj) === OBJECT_STRING;
	}

	/**
	 * Array type check.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	var isArray = Array.isArray;

	/**
	 * Define a property.
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @param {*} val
	 * @param {Boolean} [enumerable]
	 */

	function def(obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value: val,
	    enumerable: !!enumerable,
	    writable: true,
	    configurable: true
	  });
	}

	/**
	 * Debounce a function so it only gets called after the
	 * input stops arriving after the given wait period.
	 *
	 * @param {Function} func
	 * @param {Number} wait
	 * @return {Function} - the debounced function
	 */

	function _debounce(func, wait) {
	  var timeout, args, context, timestamp, result;
	  var later = function later() {
	    var last = Date.now() - timestamp;
	    if (last < wait && last >= 0) {
	      timeout = setTimeout(later, wait - last);
	    } else {
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    }
	  };
	  return function () {
	    context = this;
	    args = arguments;
	    timestamp = Date.now();
	    if (!timeout) {
	      timeout = setTimeout(later, wait);
	    }
	    return result;
	  };
	}

	/**
	 * Manual indexOf because it's slightly faster than
	 * native.
	 *
	 * @param {Array} arr
	 * @param {*} obj
	 */

	function indexOf(arr, obj) {
	  var i = arr.length;
	  while (i--) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	}

	/**
	 * Make a cancellable version of an async callback.
	 *
	 * @param {Function} fn
	 * @return {Function}
	 */

	function cancellable(fn) {
	  var cb = function cb() {
	    if (!cb.cancelled) {
	      return fn.apply(this, arguments);
	    }
	  };
	  cb.cancel = function () {
	    cb.cancelled = true;
	  };
	  return cb;
	}

	/**
	 * Check if two values are loosely equal - that is,
	 * if they are plain objects, do they have the same shape?
	 *
	 * @param {*} a
	 * @param {*} b
	 * @return {Boolean}
	 */

	function looseEqual(a, b) {
	  /* eslint-disable eqeqeq */
	  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
	  /* eslint-enable eqeqeq */
	}

	var hasProto = ('__proto__' in {});

	// Browser environment sniffing
	var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

	// detect devtools
	var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

	// UA sniffing for working around browser-specific quirks
	var UA = inBrowser && window.navigator.userAgent.toLowerCase();
	var isIE = UA && UA.indexOf('trident') > 0;
	var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
	var isAndroid = UA && UA.indexOf('android') > 0;
	var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
	var iosVersionMatch = isIos && UA.match(/os ([\d_]+)/);
	var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');

	// detecting iOS UIWebView by indexedDB
	var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;

	var transitionProp = undefined;
	var transitionEndEvent = undefined;
	var animationProp = undefined;
	var animationEndEvent = undefined;

	// Transition property/event sniffing
	if (inBrowser && !isIE9) {
	  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
	  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
	  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
	  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
	  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
	  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
	}

	/**
	 * Defer a task to execute it asynchronously. Ideally this
	 * should be executed as a microtask, so we leverage
	 * MutationObserver if it's available, and fallback to
	 * setTimeout(0).
	 *
	 * @param {Function} cb
	 * @param {Object} ctx
	 */

	var nextTick = (function () {
	  var callbacks = [];
	  var pending = false;
	  var timerFunc;
	  function nextTickHandler() {
	    pending = false;
	    var copies = callbacks.slice(0);
	    callbacks = [];
	    for (var i = 0; i < copies.length; i++) {
	      copies[i]();
	    }
	  }

	  /* istanbul ignore if */
	  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
	    var counter = 1;
	    var observer = new MutationObserver(nextTickHandler);
	    var textNode = document.createTextNode(counter);
	    observer.observe(textNode, {
	      characterData: true
	    });
	    timerFunc = function () {
	      counter = (counter + 1) % 2;
	      textNode.data = counter;
	    };
	  } else {
	    // webpack attempts to inject a shim for setImmediate
	    // if it is used as a global, so we have to work around that to
	    // avoid bundling unnecessary code.
	    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
	    timerFunc = context.setImmediate || setTimeout;
	  }
	  return function (cb, ctx) {
	    var func = ctx ? function () {
	      cb.call(ctx);
	    } : cb;
	    callbacks.push(func);
	    if (pending) return;
	    pending = true;
	    timerFunc(nextTickHandler, 0);
	  };
	})();

	var _Set = undefined;
	/* istanbul ignore if */
	if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
	  // use native Set when available.
	  _Set = Set;
	} else {
	  // a non-standard Set polyfill that only works with primitive keys.
	  _Set = function () {
	    this.set = Object.create(null);
	  };
	  _Set.prototype.has = function (key) {
	    return this.set[key] !== undefined;
	  };
	  _Set.prototype.add = function (key) {
	    this.set[key] = 1;
	  };
	  _Set.prototype.clear = function () {
	    this.set = Object.create(null);
	  };
	}

	function Cache(limit) {
	  this.size = 0;
	  this.limit = limit;
	  this.head = this.tail = undefined;
	  this._keymap = Object.create(null);
	}

	var p = Cache.prototype;

	/**
	 * Put <value> into the cache associated with <key>.
	 * Returns the entry which was removed to make room for
	 * the new entry. Otherwise undefined is returned.
	 * (i.e. if there was enough room already).
	 *
	 * @param {String} key
	 * @param {*} value
	 * @return {Entry|undefined}
	 */

	p.put = function (key, value) {
	  var removed;

	  var entry = this.get(key, true);
	  if (!entry) {
	    if (this.size === this.limit) {
	      removed = this.shift();
	    }
	    entry = {
	      key: key
	    };
	    this._keymap[key] = entry;
	    if (this.tail) {
	      this.tail.newer = entry;
	      entry.older = this.tail;
	    } else {
	      this.head = entry;
	    }
	    this.tail = entry;
	    this.size++;
	  }
	  entry.value = value;

	  return removed;
	};

	/**
	 * Purge the least recently used (oldest) entry from the
	 * cache. Returns the removed entry or undefined if the
	 * cache was empty.
	 */

	p.shift = function () {
	  var entry = this.head;
	  if (entry) {
	    this.head = this.head.newer;
	    this.head.older = undefined;
	    entry.newer = entry.older = undefined;
	    this._keymap[entry.key] = undefined;
	    this.size--;
	  }
	  return entry;
	};

	/**
	 * Get and register recent use of <key>. Returns the value
	 * associated with <key> or undefined if not in cache.
	 *
	 * @param {String} key
	 * @param {Boolean} returnEntry
	 * @return {Entry|*}
	 */

	p.get = function (key, returnEntry) {
	  var entry = this._keymap[key];
	  if (entry === undefined) return;
	  if (entry === this.tail) {
	    return returnEntry ? entry : entry.value;
	  }
	  // HEAD--------------TAIL
	  //   <.older   .newer>
	  //  <--- add direction --
	  //   A  B  C  <D>  E
	  if (entry.newer) {
	    if (entry === this.head) {
	      this.head = entry.newer;
	    }
	    entry.newer.older = entry.older; // C <-- E.
	  }
	  if (entry.older) {
	    entry.older.newer = entry.newer; // C. --> E
	  }
	  entry.newer = undefined; // D --x
	  entry.older = this.tail; // D. --> E
	  if (this.tail) {
	    this.tail.newer = entry; // E. <-- D
	  }
	  this.tail = entry;
	  return returnEntry ? entry : entry.value;
	};

	var cache$1 = new Cache(1000);
	var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
	var reservedArgRE = /^in$|^-?\d+/;

	/**
	 * Parser state
	 */

	var str;
	var dir;
	var c;
	var prev;
	var i;
	var l;
	var lastFilterIndex;
	var inSingle;
	var inDouble;
	var curly;
	var square;
	var paren;
	/**
	 * Push a filter to the current directive object
	 */

	function pushFilter() {
	  var exp = str.slice(lastFilterIndex, i).trim();
	  var filter;
	  if (exp) {
	    filter = {};
	    var tokens = exp.match(filterTokenRE);
	    filter.name = tokens[0];
	    if (tokens.length > 1) {
	      filter.args = tokens.slice(1).map(processFilterArg);
	    }
	  }
	  if (filter) {
	    (dir.filters = dir.filters || []).push(filter);
	  }
	  lastFilterIndex = i + 1;
	}

	/**
	 * Check if an argument is dynamic and strip quotes.
	 *
	 * @param {String} arg
	 * @return {Object}
	 */

	function processFilterArg(arg) {
	  if (reservedArgRE.test(arg)) {
	    return {
	      value: toNumber(arg),
	      dynamic: false
	    };
	  } else {
	    var stripped = stripQuotes(arg);
	    var dynamic = stripped === arg;
	    return {
	      value: dynamic ? arg : stripped,
	      dynamic: dynamic
	    };
	  }
	}

	/**
	 * Parse a directive value and extract the expression
	 * and its filters into a descriptor.
	 *
	 * Example:
	 *
	 * "a + 1 | uppercase" will yield:
	 * {
	 *   expression: 'a + 1',
	 *   filters: [
	 *     { name: 'uppercase', args: null }
	 *   ]
	 * }
	 *
	 * @param {String} s
	 * @return {Object}
	 */

	function parseDirective(s) {
	  var hit = cache$1.get(s);
	  if (hit) {
	    return hit;
	  }

	  // reset parser state
	  str = s;
	  inSingle = inDouble = false;
	  curly = square = paren = 0;
	  lastFilterIndex = 0;
	  dir = {};

	  for (i = 0, l = str.length; i < l; i++) {
	    prev = c;
	    c = str.charCodeAt(i);
	    if (inSingle) {
	      // check single quote
	      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
	    } else if (inDouble) {
	      // check double quote
	      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
	    } else if (c === 0x7C && // pipe
	    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
	      if (dir.expression == null) {
	        // first filter, end of expression
	        lastFilterIndex = i + 1;
	        dir.expression = str.slice(0, i).trim();
	      } else {
	        // already has filter
	        pushFilter();
	      }
	    } else {
	      switch (c) {
	        case 0x22:
	          inDouble = true;break; // "
	        case 0x27:
	          inSingle = true;break; // '
	        case 0x28:
	          paren++;break; // (
	        case 0x29:
	          paren--;break; // )
	        case 0x5B:
	          square++;break; // [
	        case 0x5D:
	          square--;break; // ]
	        case 0x7B:
	          curly++;break; // {
	        case 0x7D:
	          curly--;break; // }
	      }
	    }
	  }

	  if (dir.expression == null) {
	    dir.expression = str.slice(0, i).trim();
	  } else if (lastFilterIndex !== 0) {
	    pushFilter();
	  }

	  cache$1.put(s, dir);
	  return dir;
	}

	var directive = Object.freeze({
	  parseDirective: parseDirective
	});

	var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
	var cache = undefined;
	var tagRE = undefined;
	var htmlRE = undefined;
	/**
	 * Escape a string so it can be used in a RegExp
	 * constructor.
	 *
	 * @param {String} str
	 */

	function escapeRegex(str) {
	  return str.replace(regexEscapeRE, '\\$&');
	}

	function compileRegex() {
	  var open = escapeRegex(config.delimiters[0]);
	  var close = escapeRegex(config.delimiters[1]);
	  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
	  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
	  tagRE = new RegExp(unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '|' + open + '((?:.|\\n)+?)' + close, 'g');
	  htmlRE = new RegExp('^' + unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '$');
	  // reset cache
	  cache = new Cache(1000);
	}

	/**
	 * Parse a template text string into an array of tokens.
	 *
	 * @param {String} text
	 * @return {Array<Object> | null}
	 *               - {String} type
	 *               - {String} value
	 *               - {Boolean} [html]
	 *               - {Boolean} [oneTime]
	 */

	function parseText(text) {
	  if (!cache) {
	    compileRegex();
	  }
	  var hit = cache.get(text);
	  if (hit) {
	    return hit;
	  }
	  if (!tagRE.test(text)) {
	    return null;
	  }
	  var tokens = [];
	  var lastIndex = tagRE.lastIndex = 0;
	  var match, index, html, value, first, oneTime;
	  /* eslint-disable no-cond-assign */
	  while (match = tagRE.exec(text)) {
	    /* eslint-enable no-cond-assign */
	    index = match.index;
	    // push text token
	    if (index > lastIndex) {
	      tokens.push({
	        value: text.slice(lastIndex, index)
	      });
	    }
	    // tag token
	    html = htmlRE.test(match[0]);
	    value = html ? match[1] : match[2];
	    first = value.charCodeAt(0);
	    oneTime = first === 42; // *
	    value = oneTime ? value.slice(1) : value;
	    tokens.push({
	      tag: true,
	      value: value.trim(),
	      html: html,
	      oneTime: oneTime
	    });
	    lastIndex = index + match[0].length;
	  }
	  if (lastIndex < text.length) {
	    tokens.push({
	      value: text.slice(lastIndex)
	    });
	  }
	  cache.put(text, tokens);
	  return tokens;
	}

	/**
	 * Format a list of tokens into an expression.
	 * e.g. tokens parsed from 'a {{b}} c' can be serialized
	 * into one single expression as '"a " + b + " c"'.
	 *
	 * @param {Array} tokens
	 * @param {Vue} [vm]
	 * @return {String}
	 */

	function tokensToExp(tokens, vm) {
	  if (tokens.length > 1) {
	    return tokens.map(function (token) {
	      return formatToken(token, vm);
	    }).join('+');
	  } else {
	    return formatToken(tokens[0], vm, true);
	  }
	}

	/**
	 * Format a single token.
	 *
	 * @param {Object} token
	 * @param {Vue} [vm]
	 * @param {Boolean} [single]
	 * @return {String}
	 */

	function formatToken(token, vm, single) {
	  return token.tag ? token.oneTime && vm ? '"' + vm.$eval(token.value) + '"' : inlineFilters(token.value, single) : '"' + token.value + '"';
	}

	/**
	 * For an attribute with multiple interpolation tags,
	 * e.g. attr="some-{{thing | filter}}", in order to combine
	 * the whole thing into a single watchable expression, we
	 * have to inline those filters. This function does exactly
	 * that. This is a bit hacky but it avoids heavy changes
	 * to directive parser and watcher mechanism.
	 *
	 * @param {String} exp
	 * @param {Boolean} single
	 * @return {String}
	 */

	var filterRE = /[^|]\|[^|]/;
	function inlineFilters(exp, single) {
	  if (!filterRE.test(exp)) {
	    return single ? exp : '(' + exp + ')';
	  } else {
	    var dir = parseDirective(exp);
	    if (!dir.filters) {
	      return '(' + exp + ')';
	    } else {
	      return 'this._applyFilters(' + dir.expression + // value
	      ',null,' + // oldValue (null for read)
	      JSON.stringify(dir.filters) + // filter descriptors
	      ',false)'; // write?
	    }
	  }
	}

	var text = Object.freeze({
	  compileRegex: compileRegex,
	  parseText: parseText,
	  tokensToExp: tokensToExp
	});

	var delimiters = ['{{', '}}'];
	var unsafeDelimiters = ['{{{', '}}}'];

	var config = Object.defineProperties({

	  /**
	   * Whether to print debug messages.
	   * Also enables stack trace for warnings.
	   *
	   * @type {Boolean}
	   */

	  debug: false,

	  /**
	   * Whether to suppress warnings.
	   *
	   * @type {Boolean}
	   */

	  silent: false,

	  /**
	   * Whether to use async rendering.
	   */

	  async: true,

	  /**
	   * Whether to warn against errors caught when evaluating
	   * expressions.
	   */

	  warnExpressionErrors: true,

	  /**
	   * Whether to allow devtools inspection.
	   * Disabled by default in production builds.
	   */

	  devtools: process.env.NODE_ENV !== 'production',

	  /**
	   * Internal flag to indicate the delimiters have been
	   * changed.
	   *
	   * @type {Boolean}
	   */

	  _delimitersChanged: true,

	  /**
	   * List of asset types that a component can own.
	   *
	   * @type {Array}
	   */

	  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

	  /**
	   * prop binding modes
	   */

	  _propBindingModes: {
	    ONE_WAY: 0,
	    TWO_WAY: 1,
	    ONE_TIME: 2
	  },

	  /**
	   * Max circular updates allowed in a batcher flush cycle.
	   */

	  _maxUpdateCount: 100

	}, {
	  delimiters: { /**
	                 * Interpolation delimiters. Changing these would trigger
	                 * the text parser to re-compile the regular expressions.
	                 *
	                 * @type {Array<String>}
	                 */

	    get: function get() {
	      return delimiters;
	    },
	    set: function set(val) {
	      delimiters = val;
	      compileRegex();
	    },
	    configurable: true,
	    enumerable: true
	  },
	  unsafeDelimiters: {
	    get: function get() {
	      return unsafeDelimiters;
	    },
	    set: function set(val) {
	      unsafeDelimiters = val;
	      compileRegex();
	    },
	    configurable: true,
	    enumerable: true
	  }
	});

	var warn = undefined;
	var formatComponentName = undefined;

	if (process.env.NODE_ENV !== 'production') {
	  (function () {
	    var hasConsole = typeof console !== 'undefined';

	    warn = function (msg, vm) {
	      if (hasConsole && !config.silent) {
	        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
	      }
	    };

	    formatComponentName = function (vm) {
	      var name = vm._isVue ? vm.$options.name : vm.name;
	      return name ? ' (found in component: <' + hyphenate(name) + '>)' : '';
	    };
	  })();
	}

	/**
	 * Append with transition.
	 *
	 * @param {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	function appendWithTransition(el, target, vm, cb) {
	  applyTransition(el, 1, function () {
	    target.appendChild(el);
	  }, vm, cb);
	}

	/**
	 * InsertBefore with transition.
	 *
	 * @param {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	function beforeWithTransition(el, target, vm, cb) {
	  applyTransition(el, 1, function () {
	    before(el, target);
	  }, vm, cb);
	}

	/**
	 * Remove with transition.
	 *
	 * @param {Element} el
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	function removeWithTransition(el, vm, cb) {
	  applyTransition(el, -1, function () {
	    remove(el);
	  }, vm, cb);
	}

	/**
	 * Apply transitions with an operation callback.
	 *
	 * @param {Element} el
	 * @param {Number} direction
	 *                  1: enter
	 *                 -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	function applyTransition(el, direction, op, vm, cb) {
	  var transition = el.__v_trans;
	  if (!transition ||
	  // skip if there are no js hooks and CSS transition is
	  // not supported
	  !transition.hooks && !transitionEndEvent ||
	  // skip transitions for initial compile
	  !vm._isCompiled ||
	  // if the vm is being manipulated by a parent directive
	  // during the parent's compilation phase, skip the
	  // animation.
	  vm.$parent && !vm.$parent._isCompiled) {
	    op();
	    if (cb) cb();
	    return;
	  }
	  var action = direction > 0 ? 'enter' : 'leave';
	  transition[action](op, cb);
	}

	var transition = Object.freeze({
	  appendWithTransition: appendWithTransition,
	  beforeWithTransition: beforeWithTransition,
	  removeWithTransition: removeWithTransition,
	  applyTransition: applyTransition
	});

	/**
	 * Query an element selector if it's not an element already.
	 *
	 * @param {String|Element} el
	 * @return {Element}
	 */

	function query(el) {
	  if (typeof el === 'string') {
	    var selector = el;
	    el = document.querySelector(el);
	    if (!el) {
	      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
	    }
	  }
	  return el;
	}

	/**
	 * Check if a node is in the document.
	 * Note: document.documentElement.contains should work here
	 * but always returns false for comment nodes in phantomjs,
	 * making unit tests difficult. This is fixed by doing the
	 * contains() check on the node's parentNode instead of
	 * the node itself.
	 *
	 * @param {Node} node
	 * @return {Boolean}
	 */

	function inDoc(node) {
	  if (!node) return false;
	  var doc = node.ownerDocument.documentElement;
	  var parent = node.parentNode;
	  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
	}

	/**
	 * Get and remove an attribute from a node.
	 *
	 * @param {Node} node
	 * @param {String} _attr
	 */

	function getAttr(node, _attr) {
	  var val = node.getAttribute(_attr);
	  if (val !== null) {
	    node.removeAttribute(_attr);
	  }
	  return val;
	}

	/**
	 * Get an attribute with colon or v-bind: prefix.
	 *
	 * @param {Node} node
	 * @param {String} name
	 * @return {String|null}
	 */

	function getBindAttr(node, name) {
	  var val = getAttr(node, ':' + name);
	  if (val === null) {
	    val = getAttr(node, 'v-bind:' + name);
	  }
	  return val;
	}

	/**
	 * Check the presence of a bind attribute.
	 *
	 * @param {Node} node
	 * @param {String} name
	 * @return {Boolean}
	 */

	function hasBindAttr(node, name) {
	  return node.hasAttribute(name) || node.hasAttribute(':' + name) || node.hasAttribute('v-bind:' + name);
	}

	/**
	 * Insert el before target
	 *
	 * @param {Element} el
	 * @param {Element} target
	 */

	function before(el, target) {
	  target.parentNode.insertBefore(el, target);
	}

	/**
	 * Insert el after target
	 *
	 * @param {Element} el
	 * @param {Element} target
	 */

	function after(el, target) {
	  if (target.nextSibling) {
	    before(el, target.nextSibling);
	  } else {
	    target.parentNode.appendChild(el);
	  }
	}

	/**
	 * Remove el from DOM
	 *
	 * @param {Element} el
	 */

	function remove(el) {
	  el.parentNode.removeChild(el);
	}

	/**
	 * Prepend el to target
	 *
	 * @param {Element} el
	 * @param {Element} target
	 */

	function prepend(el, target) {
	  if (target.firstChild) {
	    before(el, target.firstChild);
	  } else {
	    target.appendChild(el);
	  }
	}

	/**
	 * Replace target with el
	 *
	 * @param {Element} target
	 * @param {Element} el
	 */

	function replace(target, el) {
	  var parent = target.parentNode;
	  if (parent) {
	    parent.replaceChild(el, target);
	  }
	}

	/**
	 * Add event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 * @param {Boolean} [useCapture]
	 */

	function on(el, event, cb, useCapture) {
	  el.addEventListener(event, cb, useCapture);
	}

	/**
	 * Remove event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	function off(el, event, cb) {
	  el.removeEventListener(event, cb);
	}

	/**
	 * For IE9 compat: when both class and :class are present
	 * getAttribute('class') returns wrong value...
	 *
	 * @param {Element} el
	 * @return {String}
	 */

	function getClass(el) {
	  var classname = el.className;
	  if (typeof classname === 'object') {
	    classname = classname.baseVal || '';
	  }
	  return classname;
	}

	/**
	 * In IE9, setAttribute('class') will result in empty class
	 * if the element also has the :class attribute; However in
	 * PhantomJS, setting `className` does not work on SVG elements...
	 * So we have to do a conditional check here.
	 *
	 * @param {Element} el
	 * @param {String} cls
	 */

	function setClass(el, cls) {
	  /* istanbul ignore if */
	  if (isIE9 && !/svg$/.test(el.namespaceURI)) {
	    el.className = cls;
	  } else {
	    el.setAttribute('class', cls);
	  }
	}

	/**
	 * Add class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {String} cls
	 */

	function addClass(el, cls) {
	  if (el.classList) {
	    el.classList.add(cls);
	  } else {
	    var cur = ' ' + getClass(el) + ' ';
	    if (cur.indexOf(' ' + cls + ' ') < 0) {
	      setClass(el, (cur + cls).trim());
	    }
	  }
	}

	/**
	 * Remove class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {String} cls
	 */

	function removeClass(el, cls) {
	  if (el.classList) {
	    el.classList.remove(cls);
	  } else {
	    var cur = ' ' + getClass(el) + ' ';
	    var tar = ' ' + cls + ' ';
	    while (cur.indexOf(tar) >= 0) {
	      cur = cur.replace(tar, ' ');
	    }
	    setClass(el, cur.trim());
	  }
	  if (!el.className) {
	    el.removeAttribute('class');
	  }
	}

	/**
	 * Extract raw content inside an element into a temporary
	 * container div
	 *
	 * @param {Element} el
	 * @param {Boolean} asFragment
	 * @return {Element|DocumentFragment}
	 */

	function extractContent(el, asFragment) {
	  var child;
	  var rawContent;
	  /* istanbul ignore if */
	  if (isTemplate(el) && isFragment(el.content)) {
	    el = el.content;
	  }
	  if (el.hasChildNodes()) {
	    trimNode(el);
	    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
	    /* eslint-disable no-cond-assign */
	    while (child = el.firstChild) {
	      /* eslint-enable no-cond-assign */
	      rawContent.appendChild(child);
	    }
	  }
	  return rawContent;
	}

	/**
	 * Trim possible empty head/tail text and comment
	 * nodes inside a parent.
	 *
	 * @param {Node} node
	 */

	function trimNode(node) {
	  var child;
	  /* eslint-disable no-sequences */
	  while ((child = node.firstChild, isTrimmable(child))) {
	    node.removeChild(child);
	  }
	  while ((child = node.lastChild, isTrimmable(child))) {
	    node.removeChild(child);
	  }
	  /* eslint-enable no-sequences */
	}

	function isTrimmable(node) {
	  return node && (node.nodeType === 3 && !node.data.trim() || node.nodeType === 8);
	}

	/**
	 * Check if an element is a template tag.
	 * Note if the template appears inside an SVG its tagName
	 * will be in lowercase.
	 *
	 * @param {Element} el
	 */

	function isTemplate(el) {
	  return el.tagName && el.tagName.toLowerCase() === 'template';
	}

	/**
	 * Create an "anchor" for performing dom insertion/removals.
	 * This is used in a number of scenarios:
	 * - fragment instance
	 * - v-html
	 * - v-if
	 * - v-for
	 * - component
	 *
	 * @param {String} content
	 * @param {Boolean} persist - IE trashes empty textNodes on
	 *                            cloneNode(true), so in certain
	 *                            cases the anchor needs to be
	 *                            non-empty to be persisted in
	 *                            templates.
	 * @return {Comment|Text}
	 */

	function createAnchor(content, persist) {
	  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
	  anchor.__v_anchor = true;
	  return anchor;
	}

	/**
	 * Find a component ref attribute that starts with $.
	 *
	 * @param {Element} node
	 * @return {String|undefined}
	 */

	var refRE = /^v-ref:/;

	function findRef(node) {
	  if (node.hasAttributes()) {
	    var attrs = node.attributes;
	    for (var i = 0, l = attrs.length; i < l; i++) {
	      var name = attrs[i].name;
	      if (refRE.test(name)) {
	        return camelize(name.replace(refRE, ''));
	      }
	    }
	  }
	}

	/**
	 * Map a function to a range of nodes .
	 *
	 * @param {Node} node
	 * @param {Node} end
	 * @param {Function} op
	 */

	function mapNodeRange(node, end, op) {
	  var next;
	  while (node !== end) {
	    next = node.nextSibling;
	    op(node);
	    node = next;
	  }
	  op(end);
	}

	/**
	 * Remove a range of nodes with transition, store
	 * the nodes in a fragment with correct ordering,
	 * and call callback when done.
	 *
	 * @param {Node} start
	 * @param {Node} end
	 * @param {Vue} vm
	 * @param {DocumentFragment} frag
	 * @param {Function} cb
	 */

	function removeNodeRange(start, end, vm, frag, cb) {
	  var done = false;
	  var removed = 0;
	  var nodes = [];
	  mapNodeRange(start, end, function (node) {
	    if (node === end) done = true;
	    nodes.push(node);
	    removeWithTransition(node, vm, onRemoved);
	  });
	  function onRemoved() {
	    removed++;
	    if (done && removed >= nodes.length) {
	      for (var i = 0; i < nodes.length; i++) {
	        frag.appendChild(nodes[i]);
	      }
	      cb && cb();
	    }
	  }
	}

	/**
	 * Check if a node is a DocumentFragment.
	 *
	 * @param {Node} node
	 * @return {Boolean}
	 */

	function isFragment(node) {
	  return node && node.nodeType === 11;
	}

	/**
	 * Get outerHTML of elements, taking care
	 * of SVG elements in IE as well.
	 *
	 * @param {Element} el
	 * @return {String}
	 */

	function getOuterHTML(el) {
	  if (el.outerHTML) {
	    return el.outerHTML;
	  } else {
	    var container = document.createElement('div');
	    container.appendChild(el.cloneNode(true));
	    return container.innerHTML;
	  }
	}

	var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i;
	var reservedTagRE = /^(slot|partial|component)$/i;

	var isUnknownElement = undefined;
	if (process.env.NODE_ENV !== 'production') {
	  isUnknownElement = function (el, tag) {
	    if (tag.indexOf('-') > -1) {
	      // http://stackoverflow.com/a/28210364/1070244
	      return el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
	    } else {
	      return (/HTMLUnknownElement/.test(el.toString()) &&
	        // Chrome returns unknown for several HTML5 elements.
	        // https://code.google.com/p/chromium/issues/detail?id=540526
	        // Firefox returns unknown for some "Interactive elements."
	        !/^(data|time|rtc|rb|details|dialog|summary)$/.test(tag)
	      );
	    }
	  };
	}

	/**
	 * Check if an element is a component, if yes return its
	 * component id.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Object|undefined}
	 */

	function checkComponentAttr(el, options) {
	  var tag = el.tagName.toLowerCase();
	  var hasAttrs = el.hasAttributes();
	  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
	    if (resolveAsset(options, 'components', tag)) {
	      return { id: tag };
	    } else {
	      var is = hasAttrs && getIsBinding(el, options);
	      if (is) {
	        return is;
	      } else if (process.env.NODE_ENV !== 'production') {
	        var expectedTag = options._componentNameMap && options._componentNameMap[tag];
	        if (expectedTag) {
	          warn('Unknown custom element: <' + tag + '> - ' + 'did you mean <' + expectedTag + '>? ' + 'HTML is case-insensitive, remember to use kebab-case in templates.');
	        } else if (isUnknownElement(el, tag)) {
	          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
	        }
	      }
	    }
	  } else if (hasAttrs) {
	    return getIsBinding(el, options);
	  }
	}

	/**
	 * Get "is" binding from an element.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Object|undefined}
	 */

	function getIsBinding(el, options) {
	  // dynamic syntax
	  var exp = el.getAttribute('is');
	  if (exp != null) {
	    if (resolveAsset(options, 'components', exp)) {
	      el.removeAttribute('is');
	      return { id: exp };
	    }
	  } else {
	    exp = getBindAttr(el, 'is');
	    if (exp != null) {
	      return { id: exp, dynamic: true };
	    }
	  }
	}

	/**
	 * Option overwriting strategies are functions that handle
	 * how to merge a parent option value and a child option
	 * value into the final value.
	 *
	 * All strategy functions follow the same signature:
	 *
	 * @param {*} parentVal
	 * @param {*} childVal
	 * @param {Vue} [vm]
	 */

	var strats = config.optionMergeStrategies = Object.create(null);

	/**
	 * Helper that recursively merges two data objects together.
	 */

	function mergeData(to, from) {
	  var key, toVal, fromVal;
	  for (key in from) {
	    toVal = to[key];
	    fromVal = from[key];
	    if (!hasOwn(to, key)) {
	      set(to, key, fromVal);
	    } else if (isObject(toVal) && isObject(fromVal)) {
	      mergeData(toVal, fromVal);
	    }
	  }
	  return to;
	}

	/**
	 * Data
	 */

	strats.data = function (parentVal, childVal, vm) {
	  if (!vm) {
	    // in a Vue.extend merge, both should be functions
	    if (!childVal) {
	      return parentVal;
	    }
	    if (typeof childVal !== 'function') {
	      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
	      return parentVal;
	    }
	    if (!parentVal) {
	      return childVal;
	    }
	    // when parentVal & childVal are both present,
	    // we need to return a function that returns the
	    // merged result of both functions... no need to
	    // check if parentVal is a function here because
	    // it has to be a function to pass previous merges.
	    return function mergedDataFn() {
	      return mergeData(childVal.call(this), parentVal.call(this));
	    };
	  } else if (parentVal || childVal) {
	    return function mergedInstanceDataFn() {
	      // instance merge
	      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
	      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
	      if (instanceData) {
	        return mergeData(instanceData, defaultData);
	      } else {
	        return defaultData;
	      }
	    };
	  }
	};

	/**
	 * El
	 */

	strats.el = function (parentVal, childVal, vm) {
	  if (!vm && childVal && typeof childVal !== 'function') {
	    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
	    return;
	  }
	  var ret = childVal || parentVal;
	  // invoke the element factory if this is instance merge
	  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
	};

	/**
	 * Hooks and param attributes are merged as arrays.
	 */

	strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = strats.activate = function (parentVal, childVal) {
	  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
	};

	/**
	 * Assets
	 *
	 * When a vm is present (instance creation), we need to do
	 * a three-way merge between constructor options, instance
	 * options and parent options.
	 */

	function mergeAssets(parentVal, childVal) {
	  var res = Object.create(parentVal || null);
	  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
	}

	config._assetTypes.forEach(function (type) {
	  strats[type + 's'] = mergeAssets;
	});

	/**
	 * Events & Watchers.
	 *
	 * Events & watchers hashes should not overwrite one
	 * another, so we merge them as arrays.
	 */

	strats.watch = strats.events = function (parentVal, childVal) {
	  if (!childVal) return parentVal;
	  if (!parentVal) return childVal;
	  var ret = {};
	  extend(ret, parentVal);
	  for (var key in childVal) {
	    var parent = ret[key];
	    var child = childVal[key];
	    if (parent && !isArray(parent)) {
	      parent = [parent];
	    }
	    ret[key] = parent ? parent.concat(child) : [child];
	  }
	  return ret;
	};

	/**
	 * Other object hashes.
	 */

	strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
	  if (!childVal) return parentVal;
	  if (!parentVal) return childVal;
	  var ret = Object.create(null);
	  extend(ret, parentVal);
	  extend(ret, childVal);
	  return ret;
	};

	/**
	 * Default strategy.
	 */

	var defaultStrat = function defaultStrat(parentVal, childVal) {
	  return childVal === undefined ? parentVal : childVal;
	};

	/**
	 * Make sure component options get converted to actual
	 * constructors.
	 *
	 * @param {Object} options
	 */

	function guardComponents(options) {
	  if (options.components) {
	    var components = options.components = guardArrayAssets(options.components);
	    var ids = Object.keys(components);
	    var def;
	    if (process.env.NODE_ENV !== 'production') {
	      var map = options._componentNameMap = {};
	    }
	    for (var i = 0, l = ids.length; i < l; i++) {
	      var key = ids[i];
	      if (commonTagRE.test(key) || reservedTagRE.test(key)) {
	        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
	        continue;
	      }
	      // record a all lowercase <-> kebab-case mapping for
	      // possible custom element case error warning
	      if (process.env.NODE_ENV !== 'production') {
	        map[key.replace(/-/g, '').toLowerCase()] = hyphenate(key);
	      }
	      def = components[key];
	      if (isPlainObject(def)) {
	        components[key] = Vue.extend(def);
	      }
	    }
	  }
	}

	/**
	 * Ensure all props option syntax are normalized into the
	 * Object-based format.
	 *
	 * @param {Object} options
	 */

	function guardProps(options) {
	  var props = options.props;
	  var i, val;
	  if (isArray(props)) {
	    options.props = {};
	    i = props.length;
	    while (i--) {
	      val = props[i];
	      if (typeof val === 'string') {
	        options.props[val] = null;
	      } else if (val.name) {
	        options.props[val.name] = val;
	      }
	    }
	  } else if (isPlainObject(props)) {
	    var keys = Object.keys(props);
	    i = keys.length;
	    while (i--) {
	      val = props[keys[i]];
	      if (typeof val === 'function') {
	        props[keys[i]] = { type: val };
	      }
	    }
	  }
	}

	/**
	 * Guard an Array-format assets option and converted it
	 * into the key-value Object format.
	 *
	 * @param {Object|Array} assets
	 * @return {Object}
	 */

	function guardArrayAssets(assets) {
	  if (isArray(assets)) {
	    var res = {};
	    var i = assets.length;
	    var asset;
	    while (i--) {
	      asset = assets[i];
	      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
	      if (!id) {
	        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
	      } else {
	        res[id] = asset;
	      }
	    }
	    return res;
	  }
	  return assets;
	}

	/**
	 * Merge two option objects into a new one.
	 * Core utility used in both instantiation and inheritance.
	 *
	 * @param {Object} parent
	 * @param {Object} child
	 * @param {Vue} [vm] - if vm is present, indicates this is
	 *                     an instantiation merge.
	 */

	function mergeOptions(parent, child, vm) {
	  guardComponents(child);
	  guardProps(child);
	  if (process.env.NODE_ENV !== 'production') {
	    if (child.propsData && !vm) {
	      warn('propsData can only be used as an instantiation option.');
	    }
	  }
	  var options = {};
	  var key;
	  if (child['extends']) {
	    parent = typeof child['extends'] === 'function' ? mergeOptions(parent, child['extends'].options, vm) : mergeOptions(parent, child['extends'], vm);
	  }
	  if (child.mixins) {
	    for (var i = 0, l = child.mixins.length; i < l; i++) {
	      var mixin = child.mixins[i];
	      var mixinOptions = mixin.prototype instanceof Vue ? mixin.options : mixin;
	      parent = mergeOptions(parent, mixinOptions, vm);
	    }
	  }
	  for (key in parent) {
	    mergeField(key);
	  }
	  for (key in child) {
	    if (!hasOwn(parent, key)) {
	      mergeField(key);
	    }
	  }
	  function mergeField(key) {
	    var strat = strats[key] || defaultStrat;
	    options[key] = strat(parent[key], child[key], vm, key);
	  }
	  return options;
	}

	/**
	 * Resolve an asset.
	 * This function is used because child instances need access
	 * to assets defined in its ancestor chain.
	 *
	 * @param {Object} options
	 * @param {String} type
	 * @param {String} id
	 * @param {Boolean} warnMissing
	 * @return {Object|Function}
	 */

	function resolveAsset(options, type, id, warnMissing) {
	  /* istanbul ignore if */
	  if (typeof id !== 'string') {
	    return;
	  }
	  var assets = options[type];
	  var camelizedId;
	  var res = assets[id] ||
	  // camelCase ID
	  assets[camelizedId = camelize(id)] ||
	  // Pascal Case ID
	  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
	  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
	    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
	  }
	  return res;
	}

	var uid$1 = 0;

	/**
	 * A dep is an observable that can have multiple
	 * directives subscribing to it.
	 *
	 * @constructor
	 */
	function Dep() {
	  this.id = uid$1++;
	  this.subs = [];
	}

	// the current target watcher being evaluated.
	// this is globally unique because there could be only one
	// watcher being evaluated at any time.
	Dep.target = null;

	/**
	 * Add a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	Dep.prototype.addSub = function (sub) {
	  this.subs.push(sub);
	};

	/**
	 * Remove a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	Dep.prototype.removeSub = function (sub) {
	  this.subs.$remove(sub);
	};

	/**
	 * Add self as a dependency to the target watcher.
	 */

	Dep.prototype.depend = function () {
	  Dep.target.addDep(this);
	};

	/**
	 * Notify all subscribers of a new value.
	 */

	Dep.prototype.notify = function () {
	  // stablize the subscriber list first
	  var subs = toArray(this.subs);
	  for (var i = 0, l = subs.length; i < l; i++) {
	    subs[i].update();
	  }
	};

	var arrayProto = Array.prototype;
	var arrayMethods = Object.create(arrayProto)

	/**
	 * Intercept mutating methods and emit events
	 */

	;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
	  // cache original method
	  var original = arrayProto[method];
	  def(arrayMethods, method, function mutator() {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length;
	    var args = new Array(i);
	    while (i--) {
	      args[i] = arguments[i];
	    }
	    var result = original.apply(this, args);
	    var ob = this.__ob__;
	    var inserted;
	    switch (method) {
	      case 'push':
	        inserted = args;
	        break;
	      case 'unshift':
	        inserted = args;
	        break;
	      case 'splice':
	        inserted = args.slice(2);
	        break;
	    }
	    if (inserted) ob.observeArray(inserted);
	    // notify change
	    ob.dep.notify();
	    return result;
	  });
	});

	/**
	 * Swap the element at the given index with a new value
	 * and emits corresponding event.
	 *
	 * @param {Number} index
	 * @param {*} val
	 * @return {*} - replaced element
	 */

	def(arrayProto, '$set', function $set(index, val) {
	  if (index >= this.length) {
	    this.length = Number(index) + 1;
	  }
	  return this.splice(index, 1, val)[0];
	});

	/**
	 * Convenience method to remove the element at given index or target element reference.
	 *
	 * @param {*} item
	 */

	def(arrayProto, '$remove', function $remove(item) {
	  /* istanbul ignore if */
	  if (!this.length) return;
	  var index = indexOf(this, item);
	  if (index > -1) {
	    return this.splice(index, 1);
	  }
	});

	var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

	/**
	 * By default, when a reactive property is set, the new value is
	 * also converted to become reactive. However in certain cases, e.g.
	 * v-for scope alias and props, we don't want to force conversion
	 * because the value may be a nested value under a frozen data structure.
	 *
	 * So whenever we want to set a reactive property without forcing
	 * conversion on the new value, we wrap that call inside this function.
	 */

	var shouldConvert = true;

	function withoutConversion(fn) {
	  shouldConvert = false;
	  fn();
	  shouldConvert = true;
	}

	/**
	 * Observer class that are attached to each observed
	 * object. Once attached, the observer converts target
	 * object's property keys into getter/setters that
	 * collect dependencies and dispatches updates.
	 *
	 * @param {Array|Object} value
	 * @constructor
	 */

	function Observer(value) {
	  this.value = value;
	  this.dep = new Dep();
	  def(value, '__ob__', this);
	  if (isArray(value)) {
	    var augment = hasProto ? protoAugment : copyAugment;
	    augment(value, arrayMethods, arrayKeys);
	    this.observeArray(value);
	  } else {
	    this.walk(value);
	  }
	}

	// Instance methods

	/**
	 * Walk through each property and convert them into
	 * getter/setters. This method should only be called when
	 * value type is Object.
	 *
	 * @param {Object} obj
	 */

	Observer.prototype.walk = function (obj) {
	  var keys = Object.keys(obj);
	  for (var i = 0, l = keys.length; i < l; i++) {
	    this.convert(keys[i], obj[keys[i]]);
	  }
	};

	/**
	 * Observe a list of Array items.
	 *
	 * @param {Array} items
	 */

	Observer.prototype.observeArray = function (items) {
	  for (var i = 0, l = items.length; i < l; i++) {
	    observe(items[i]);
	  }
	};

	/**
	 * Convert a property into getter/setter so we can emit
	 * the events when the property is accessed/changed.
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	Observer.prototype.convert = function (key, val) {
	  defineReactive(this.value, key, val);
	};

	/**
	 * Add an owner vm, so that when $set/$delete mutations
	 * happen we can notify owner vms to proxy the keys and
	 * digest the watchers. This is only called when the object
	 * is observed as an instance's root $data.
	 *
	 * @param {Vue} vm
	 */

	Observer.prototype.addVm = function (vm) {
	  (this.vms || (this.vms = [])).push(vm);
	};

	/**
	 * Remove an owner vm. This is called when the object is
	 * swapped out as an instance's $data object.
	 *
	 * @param {Vue} vm
	 */

	Observer.prototype.removeVm = function (vm) {
	  this.vms.$remove(vm);
	};

	// helpers

	/**
	 * Augment an target Object or Array by intercepting
	 * the prototype chain using __proto__
	 *
	 * @param {Object|Array} target
	 * @param {Object} src
	 */

	function protoAugment(target, src) {
	  /* eslint-disable no-proto */
	  target.__proto__ = src;
	  /* eslint-enable no-proto */
	}

	/**
	 * Augment an target Object or Array by defining
	 * hidden properties.
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function copyAugment(target, src, keys) {
	  for (var i = 0, l = keys.length; i < l; i++) {
	    var key = keys[i];
	    def(target, key, src[key]);
	  }
	}

	/**
	 * Attempt to create an observer instance for a value,
	 * returns the new observer if successfully observed,
	 * or the existing observer if the value already has one.
	 *
	 * @param {*} value
	 * @param {Vue} [vm]
	 * @return {Observer|undefined}
	 * @static
	 */

	function observe(value, vm) {
	  if (!value || typeof value !== 'object') {
	    return;
	  }
	  var ob;
	  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
	    ob = value.__ob__;
	  } else if (shouldConvert && (isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
	    ob = new Observer(value);
	  }
	  if (ob && vm) {
	    ob.addVm(vm);
	  }
	  return ob;
	}

	/**
	 * Define a reactive property on an Object.
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @param {*} val
	 */

	function defineReactive(obj, key, val) {
	  var dep = new Dep();

	  var property = Object.getOwnPropertyDescriptor(obj, key);
	  if (property && property.configurable === false) {
	    return;
	  }

	  // cater for pre-defined getter/setters
	  var getter = property && property.get;
	  var setter = property && property.set;

	  var childOb = observe(val);
	  Object.defineProperty(obj, key, {
	    enumerable: true,
	    configurable: true,
	    get: function reactiveGetter() {
	      var value = getter ? getter.call(obj) : val;
	      if (Dep.target) {
	        dep.depend();
	        if (childOb) {
	          childOb.dep.depend();
	        }
	        if (isArray(value)) {
	          for (var e, i = 0, l = value.length; i < l; i++) {
	            e = value[i];
	            e && e.__ob__ && e.__ob__.dep.depend();
	          }
	        }
	      }
	      return value;
	    },
	    set: function reactiveSetter(newVal) {
	      var value = getter ? getter.call(obj) : val;
	      if (newVal === value) {
	        return;
	      }
	      if (setter) {
	        setter.call(obj, newVal);
	      } else {
	        val = newVal;
	      }
	      childOb = observe(newVal);
	      dep.notify();
	    }
	  });
	}



	var util = Object.freeze({
		defineReactive: defineReactive,
		set: set,
		del: del,
		hasOwn: hasOwn,
		isLiteral: isLiteral,
		isReserved: isReserved,
		_toString: _toString,
		toNumber: toNumber,
		toBoolean: toBoolean,
		stripQuotes: stripQuotes,
		camelize: camelize,
		hyphenate: hyphenate,
		classify: classify,
		bind: bind,
		toArray: toArray,
		extend: extend,
		isObject: isObject,
		isPlainObject: isPlainObject,
		def: def,
		debounce: _debounce,
		indexOf: indexOf,
		cancellable: cancellable,
		looseEqual: looseEqual,
		isArray: isArray,
		hasProto: hasProto,
		inBrowser: inBrowser,
		devtools: devtools,
		isIE: isIE,
		isIE9: isIE9,
		isAndroid: isAndroid,
		isIos: isIos,
		iosVersionMatch: iosVersionMatch,
		iosVersion: iosVersion,
		hasMutationObserverBug: hasMutationObserverBug,
		get transitionProp () { return transitionProp; },
		get transitionEndEvent () { return transitionEndEvent; },
		get animationProp () { return animationProp; },
		get animationEndEvent () { return animationEndEvent; },
		nextTick: nextTick,
		get _Set () { return _Set; },
		query: query,
		inDoc: inDoc,
		getAttr: getAttr,
		getBindAttr: getBindAttr,
		hasBindAttr: hasBindAttr,
		before: before,
		after: after,
		remove: remove,
		prepend: prepend,
		replace: replace,
		on: on,
		off: off,
		setClass: setClass,
		addClass: addClass,
		removeClass: removeClass,
		extractContent: extractContent,
		trimNode: trimNode,
		isTemplate: isTemplate,
		createAnchor: createAnchor,
		findRef: findRef,
		mapNodeRange: mapNodeRange,
		removeNodeRange: removeNodeRange,
		isFragment: isFragment,
		getOuterHTML: getOuterHTML,
		mergeOptions: mergeOptions,
		resolveAsset: resolveAsset,
		checkComponentAttr: checkComponentAttr,
		commonTagRE: commonTagRE,
		reservedTagRE: reservedTagRE,
		get warn () { return warn; }
	});

	var uid = 0;

	function initMixin (Vue) {
	  /**
	   * The main init sequence. This is called for every
	   * instance, including ones that are created from extended
	   * constructors.
	   *
	   * @param {Object} options - this options object should be
	   *                           the result of merging class
	   *                           options and the options passed
	   *                           in to the constructor.
	   */

	  Vue.prototype._init = function (options) {
	    options = options || {};

	    this.$el = null;
	    this.$parent = options.parent;
	    this.$root = this.$parent ? this.$parent.$root : this;
	    this.$children = [];
	    this.$refs = {}; // child vm references
	    this.$els = {}; // element references
	    this._watchers = []; // all watchers as an array
	    this._directives = []; // all directives

	    // a uid
	    this._uid = uid++;

	    // a flag to avoid this being observed
	    this._isVue = true;

	    // events bookkeeping
	    this._events = {}; // registered callbacks
	    this._eventsCount = {}; // for $broadcast optimization

	    // fragment instance properties
	    this._isFragment = false;
	    this._fragment = // @type {DocumentFragment}
	    this._fragmentStart = // @type {Text|Comment}
	    this._fragmentEnd = null; // @type {Text|Comment}

	    // lifecycle state
	    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = this._vForRemoving = false;
	    this._unlinkFn = null;

	    // context:
	    // if this is a transcluded component, context
	    // will be the common parent vm of this instance
	    // and its host.
	    this._context = options._context || this.$parent;

	    // scope:
	    // if this is inside an inline v-for, the scope
	    // will be the intermediate scope created for this
	    // repeat fragment. this is used for linking props
	    // and container directives.
	    this._scope = options._scope;

	    // fragment:
	    // if this instance is compiled inside a Fragment, it
	    // needs to reigster itself as a child of that fragment
	    // for attach/detach to work properly.
	    this._frag = options._frag;
	    if (this._frag) {
	      this._frag.children.push(this);
	    }

	    // push self into parent / transclusion host
	    if (this.$parent) {
	      this.$parent.$children.push(this);
	    }

	    // merge options.
	    options = this.$options = mergeOptions(this.constructor.options, options, this);

	    // set ref
	    this._updateRef();

	    // initialize data as empty object.
	    // it will be filled up in _initData().
	    this._data = {};

	    // call init hook
	    this._callHook('init');

	    // initialize data observation and scope inheritance.
	    this._initState();

	    // setup event system and option events.
	    this._initEvents();

	    // call created hook
	    this._callHook('created');

	    // if `el` option is passed, start compilation.
	    if (options.el) {
	      this.$mount(options.el);
	    }
	  };
	}

	var pathCache = new Cache(1000);

	// actions
	var APPEND = 0;
	var PUSH = 1;
	var INC_SUB_PATH_DEPTH = 2;
	var PUSH_SUB_PATH = 3;

	// states
	var BEFORE_PATH = 0;
	var IN_PATH = 1;
	var BEFORE_IDENT = 2;
	var IN_IDENT = 3;
	var IN_SUB_PATH = 4;
	var IN_SINGLE_QUOTE = 5;
	var IN_DOUBLE_QUOTE = 6;
	var AFTER_PATH = 7;
	var ERROR = 8;

	var pathStateMachine = [];

	pathStateMachine[BEFORE_PATH] = {
	  'ws': [BEFORE_PATH],
	  'ident': [IN_IDENT, APPEND],
	  '[': [IN_SUB_PATH],
	  'eof': [AFTER_PATH]
	};

	pathStateMachine[IN_PATH] = {
	  'ws': [IN_PATH],
	  '.': [BEFORE_IDENT],
	  '[': [IN_SUB_PATH],
	  'eof': [AFTER_PATH]
	};

	pathStateMachine[BEFORE_IDENT] = {
	  'ws': [BEFORE_IDENT],
	  'ident': [IN_IDENT, APPEND]
	};

	pathStateMachine[IN_IDENT] = {
	  'ident': [IN_IDENT, APPEND],
	  '0': [IN_IDENT, APPEND],
	  'number': [IN_IDENT, APPEND],
	  'ws': [IN_PATH, PUSH],
	  '.': [BEFORE_IDENT, PUSH],
	  '[': [IN_SUB_PATH, PUSH],
	  'eof': [AFTER_PATH, PUSH]
	};

	pathStateMachine[IN_SUB_PATH] = {
	  "'": [IN_SINGLE_QUOTE, APPEND],
	  '"': [IN_DOUBLE_QUOTE, APPEND],
	  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
	  ']': [IN_PATH, PUSH_SUB_PATH],
	  'eof': ERROR,
	  'else': [IN_SUB_PATH, APPEND]
	};

	pathStateMachine[IN_SINGLE_QUOTE] = {
	  "'": [IN_SUB_PATH, APPEND],
	  'eof': ERROR,
	  'else': [IN_SINGLE_QUOTE, APPEND]
	};

	pathStateMachine[IN_DOUBLE_QUOTE] = {
	  '"': [IN_SUB_PATH, APPEND],
	  'eof': ERROR,
	  'else': [IN_DOUBLE_QUOTE, APPEND]
	};

	/**
	 * Determine the type of a character in a keypath.
	 *
	 * @param {Char} ch
	 * @return {String} type
	 */

	function getPathCharType(ch) {
	  if (ch === undefined) {
	    return 'eof';
	  }

	  var code = ch.charCodeAt(0);

	  switch (code) {
	    case 0x5B: // [
	    case 0x5D: // ]
	    case 0x2E: // .
	    case 0x22: // "
	    case 0x27: // '
	    case 0x30:
	      // 0
	      return ch;

	    case 0x5F: // _
	    case 0x24:
	      // $
	      return 'ident';

	    case 0x20: // Space
	    case 0x09: // Tab
	    case 0x0A: // Newline
	    case 0x0D: // Return
	    case 0xA0: // No-break space
	    case 0xFEFF: // Byte Order Mark
	    case 0x2028: // Line Separator
	    case 0x2029:
	      // Paragraph Separator
	      return 'ws';
	  }

	  // a-z, A-Z
	  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
	    return 'ident';
	  }

	  // 1-9
	  if (code >= 0x31 && code <= 0x39) {
	    return 'number';
	  }

	  return 'else';
	}

	/**
	 * Format a subPath, return its plain form if it is
	 * a literal string or number. Otherwise prepend the
	 * dynamic indicator (*).
	 *
	 * @param {String} path
	 * @return {String}
	 */

	function formatSubPath(path) {
	  var trimmed = path.trim();
	  // invalid leading 0
	  if (path.charAt(0) === '0' && isNaN(path)) {
	    return false;
	  }
	  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
	}

	/**
	 * Parse a string path into an array of segments
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	function parse(path) {
	  var keys = [];
	  var index = -1;
	  var mode = BEFORE_PATH;
	  var subPathDepth = 0;
	  var c, newChar, key, type, transition, action, typeMap;

	  var actions = [];

	  actions[PUSH] = function () {
	    if (key !== undefined) {
	      keys.push(key);
	      key = undefined;
	    }
	  };

	  actions[APPEND] = function () {
	    if (key === undefined) {
	      key = newChar;
	    } else {
	      key += newChar;
	    }
	  };

	  actions[INC_SUB_PATH_DEPTH] = function () {
	    actions[APPEND]();
	    subPathDepth++;
	  };

	  actions[PUSH_SUB_PATH] = function () {
	    if (subPathDepth > 0) {
	      subPathDepth--;
	      mode = IN_SUB_PATH;
	      actions[APPEND]();
	    } else {
	      subPathDepth = 0;
	      key = formatSubPath(key);
	      if (key === false) {
	        return false;
	      } else {
	        actions[PUSH]();
	      }
	    }
	  };

	  function maybeUnescapeQuote() {
	    var nextChar = path[index + 1];
	    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
	      index++;
	      newChar = '\\' + nextChar;
	      actions[APPEND]();
	      return true;
	    }
	  }

	  while (mode != null) {
	    index++;
	    c = path[index];

	    if (c === '\\' && maybeUnescapeQuote()) {
	      continue;
	    }

	    type = getPathCharType(c);
	    typeMap = pathStateMachine[mode];
	    transition = typeMap[type] || typeMap['else'] || ERROR;

	    if (transition === ERROR) {
	      return; // parse error
	    }

	    mode = transition[0];
	    action = actions[transition[1]];
	    if (action) {
	      newChar = transition[2];
	      newChar = newChar === undefined ? c : newChar;
	      if (action() === false) {
	        return;
	      }
	    }

	    if (mode === AFTER_PATH) {
	      keys.raw = path;
	      return keys;
	    }
	  }
	}

	/**
	 * External parse that check for a cache hit first
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	function parsePath(path) {
	  var hit = pathCache.get(path);
	  if (!hit) {
	    hit = parse(path);
	    if (hit) {
	      pathCache.put(path, hit);
	    }
	  }
	  return hit;
	}

	/**
	 * Get from an object from a path string
	 *
	 * @param {Object} obj
	 * @param {String} path
	 */

	function getPath(obj, path) {
	  return parseExpression(path).get(obj);
	}

	/**
	 * Warn against setting non-existent root path on a vm.
	 */

	var warnNonExistent;
	if (process.env.NODE_ENV !== 'production') {
	  warnNonExistent = function (path, vm) {
	    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.', vm);
	  };
	}

	/**
	 * Set on an object from a path
	 *
	 * @param {Object} obj
	 * @param {String | Array} path
	 * @param {*} val
	 */

	function setPath(obj, path, val) {
	  var original = obj;
	  if (typeof path === 'string') {
	    path = parse(path);
	  }
	  if (!path || !isObject(obj)) {
	    return false;
	  }
	  var last, key;
	  for (var i = 0, l = path.length; i < l; i++) {
	    last = obj;
	    key = path[i];
	    if (key.charAt(0) === '*') {
	      key = parseExpression(key.slice(1)).get.call(original, original);
	    }
	    if (i < l - 1) {
	      obj = obj[key];
	      if (!isObject(obj)) {
	        obj = {};
	        if (process.env.NODE_ENV !== 'production' && last._isVue) {
	          warnNonExistent(path, last);
	        }
	        set(last, key, obj);
	      }
	    } else {
	      if (isArray(obj)) {
	        obj.$set(key, val);
	      } else if (key in obj) {
	        obj[key] = val;
	      } else {
	        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
	          warnNonExistent(path, obj);
	        }
	        set(obj, key, val);
	      }
	    }
	  }
	  return true;
	}

	var path = Object.freeze({
	  parsePath: parsePath,
	  getPath: getPath,
	  setPath: setPath
	});

	var expressionCache = new Cache(1000);

	var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
	var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

	// keywords that don't make sense inside expressions
	var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'protected,static,interface,private,public';
	var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

	var wsRE = /\s/g;
	var newlineRE = /\n/g;
	var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
	var restoreRE = /"(\d+)"/g;
	var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
	var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
	var literalValueRE$1 = /^(?:true|false|null|undefined|Infinity|NaN)$/;

	function noop() {}

	/**
	 * Save / Rewrite / Restore
	 *
	 * When rewriting paths found in an expression, it is
	 * possible for the same letter sequences to be found in
	 * strings and Object literal property keys. Therefore we
	 * remove and store these parts in a temporary array, and
	 * restore them after the path rewrite.
	 */

	var saved = [];

	/**
	 * Save replacer
	 *
	 * The save regex can match two possible cases:
	 * 1. An opening object literal
	 * 2. A string
	 * If matched as a plain string, we need to escape its
	 * newlines, since the string needs to be preserved when
	 * generating the function body.
	 *
	 * @param {String} str
	 * @param {String} isString - str if matched as a string
	 * @return {String} - placeholder with index
	 */

	function save(str, isString) {
	  var i = saved.length;
	  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
	  return '"' + i + '"';
	}

	/**
	 * Path rewrite replacer
	 *
	 * @param {String} raw
	 * @return {String}
	 */

	function rewrite(raw) {
	  var c = raw.charAt(0);
	  var path = raw.slice(1);
	  if (allowedKeywordsRE.test(path)) {
	    return raw;
	  } else {
	    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
	    return c + 'scope.' + path;
	  }
	}

	/**
	 * Restore replacer
	 *
	 * @param {String} str
	 * @param {String} i - matched save index
	 * @return {String}
	 */

	function restore(str, i) {
	  return saved[i];
	}

	/**
	 * Rewrite an expression, prefixing all path accessors with
	 * `scope.` and generate getter/setter functions.
	 *
	 * @param {String} exp
	 * @return {Function}
	 */

	function compileGetter(exp) {
	  if (improperKeywordsRE.test(exp)) {
	    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
	  }
	  // reset state
	  saved.length = 0;
	  // save strings and object literal keys
	  var body = exp.replace(saveRE, save).replace(wsRE, '');
	  // rewrite all paths
	  // pad 1 space here because the regex matches 1 extra char
	  body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
	  return makeGetterFn(body);
	}

	/**
	 * Build a getter function. Requires eval.
	 *
	 * We isolate the try/catch so it doesn't affect the
	 * optimization of the parse function when it is not called.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeGetterFn(body) {
	  try {
	    /* eslint-disable no-new-func */
	    return new Function('scope', 'return ' + body + ';');
	    /* eslint-enable no-new-func */
	  } catch (e) {
	    if (process.env.NODE_ENV !== 'production') {
	      /* istanbul ignore if */
	      if (e.toString().match(/unsafe-eval|CSP/)) {
	        warn('It seems you are using the default build of Vue.js in an environment ' + 'with Content Security Policy that prohibits unsafe-eval. ' + 'Use the CSP-compliant build instead: ' + 'http://vuejs.org/guide/installation.html#CSP-compliant-build');
	      } else {
	        warn('Invalid expression. ' + 'Generated function body: ' + body);
	      }
	    }
	    return noop;
	  }
	}

	/**
	 * Compile a setter function for the expression.
	 *
	 * @param {String} exp
	 * @return {Function|undefined}
	 */

	function compileSetter(exp) {
	  var path = parsePath(exp);
	  if (path) {
	    return function (scope, val) {
	      setPath(scope, path, val);
	    };
	  } else {
	    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
	  }
	}

	/**
	 * Parse an expression into re-written getter/setters.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	function parseExpression(exp, needSet) {
	  exp = exp.trim();
	  // try cache
	  var hit = expressionCache.get(exp);
	  if (hit) {
	    if (needSet && !hit.set) {
	      hit.set = compileSetter(hit.exp);
	    }
	    return hit;
	  }
	  var res = { exp: exp };
	  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
	  // optimized super simple getter
	  ? makeGetterFn('scope.' + exp)
	  // dynamic getter
	  : compileGetter(exp);
	  if (needSet) {
	    res.set = compileSetter(exp);
	  }
	  expressionCache.put(exp, res);
	  return res;
	}

	/**
	 * Check if an expression is a simple path.
	 *
	 * @param {String} exp
	 * @return {Boolean}
	 */

	function isSimplePath(exp) {
	  return pathTestRE.test(exp) &&
	  // don't treat literal values as paths
	  !literalValueRE$1.test(exp) &&
	  // Math constants e.g. Math.PI, Math.E etc.
	  exp.slice(0, 5) !== 'Math.';
	}

	var expression = Object.freeze({
	  parseExpression: parseExpression,
	  isSimplePath: isSimplePath
	});

	// we have two separate queues: one for directive updates
	// and one for user watcher registered via $watch().
	// we want to guarantee directive updates to be called
	// before user watchers so that when user watchers are
	// triggered, the DOM would have already been in updated
	// state.

	var queue = [];
	var userQueue = [];
	var has = {};
	var circular = {};
	var waiting = false;

	/**
	 * Reset the batcher's state.
	 */

	function resetBatcherState() {
	  queue.length = 0;
	  userQueue.length = 0;
	  has = {};
	  circular = {};
	  waiting = false;
	}

	/**
	 * Flush both queues and run the watchers.
	 */

	function flushBatcherQueue() {
	  var _again = true;

	  _function: while (_again) {
	    _again = false;

	    runBatcherQueue(queue);
	    runBatcherQueue(userQueue);
	    // user watchers triggered more watchers,
	    // keep flushing until it depletes
	    if (queue.length) {
	      _again = true;
	      continue _function;
	    }
	    // dev tool hook
	    /* istanbul ignore if */
	    if (devtools && config.devtools) {
	      devtools.emit('flush');
	    }
	    resetBatcherState();
	  }
	}

	/**
	 * Run the watchers in a single queue.
	 *
	 * @param {Array} queue
	 */

	function runBatcherQueue(queue) {
	  // do not cache length because more watchers might be pushed
	  // as we run existing watchers
	  for (var i = 0; i < queue.length; i++) {
	    var watcher = queue[i];
	    var id = watcher.id;
	    has[id] = null;
	    watcher.run();
	    // in dev build, check and stop circular updates.
	    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
	      circular[id] = (circular[id] || 0) + 1;
	      if (circular[id] > config._maxUpdateCount) {
	        warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
	        break;
	      }
	    }
	  }
	  queue.length = 0;
	}

	/**
	 * Push a watcher into the watcher queue.
	 * Jobs with duplicate IDs will be skipped unless it's
	 * pushed when the queue is being flushed.
	 *
	 * @param {Watcher} watcher
	 *   properties:
	 *   - {Number} id
	 *   - {Function} run
	 */

	function pushWatcher(watcher) {
	  var id = watcher.id;
	  if (has[id] == null) {
	    // push watcher into appropriate queue
	    var q = watcher.user ? userQueue : queue;
	    has[id] = q.length;
	    q.push(watcher);
	    // queue the flush
	    if (!waiting) {
	      waiting = true;
	      nextTick(flushBatcherQueue);
	    }
	  }
	}

	var uid$2 = 0;

	/**
	 * A watcher parses an expression, collects dependencies,
	 * and fires callback when the expression value changes.
	 * This is used for both the $watch() api and directives.
	 *
	 * @param {Vue} vm
	 * @param {String|Function} expOrFn
	 * @param {Function} cb
	 * @param {Object} options
	 *                 - {Array} filters
	 *                 - {Boolean} twoWay
	 *                 - {Boolean} deep
	 *                 - {Boolean} user
	 *                 - {Boolean} sync
	 *                 - {Boolean} lazy
	 *                 - {Function} [preProcess]
	 *                 - {Function} [postProcess]
	 * @constructor
	 */
	function Watcher(vm, expOrFn, cb, options) {
	  // mix in options
	  if (options) {
	    extend(this, options);
	  }
	  var isFn = typeof expOrFn === 'function';
	  this.vm = vm;
	  vm._watchers.push(this);
	  this.expression = expOrFn;
	  this.cb = cb;
	  this.id = ++uid$2; // uid for batching
	  this.active = true;
	  this.dirty = this.lazy; // for lazy watchers
	  this.deps = [];
	  this.newDeps = [];
	  this.depIds = new _Set();
	  this.newDepIds = new _Set();
	  this.prevError = null; // for async error stacks
	  // parse expression for getter/setter
	  if (isFn) {
	    this.getter = expOrFn;
	    this.setter = undefined;
	  } else {
	    var res = parseExpression(expOrFn, this.twoWay);
	    this.getter = res.get;
	    this.setter = res.set;
	  }
	  this.value = this.lazy ? undefined : this.get();
	  // state for avoiding false triggers for deep and Array
	  // watchers during vm._digest()
	  this.queued = this.shallow = false;
	}

	/**
	 * Evaluate the getter, and re-collect dependencies.
	 */

	Watcher.prototype.get = function () {
	  this.beforeGet();
	  var scope = this.scope || this.vm;
	  var value;
	  try {
	    value = this.getter.call(scope, scope);
	  } catch (e) {
	    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
	      warn('Error when evaluating expression ' + '"' + this.expression + '": ' + e.toString(), this.vm);
	    }
	  }
	  // "touch" every property so they are all tracked as
	  // dependencies for deep watching
	  if (this.deep) {
	    traverse(value);
	  }
	  if (this.preProcess) {
	    value = this.preProcess(value);
	  }
	  if (this.filters) {
	    value = scope._applyFilters(value, null, this.filters, false);
	  }
	  if (this.postProcess) {
	    value = this.postProcess(value);
	  }
	  this.afterGet();
	  return value;
	};

	/**
	 * Set the corresponding value with the setter.
	 *
	 * @param {*} value
	 */

	Watcher.prototype.set = function (value) {
	  var scope = this.scope || this.vm;
	  if (this.filters) {
	    value = scope._applyFilters(value, this.value, this.filters, true);
	  }
	  try {
	    this.setter.call(scope, scope, value);
	  } catch (e) {
	    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
	      warn('Error when evaluating setter ' + '"' + this.expression + '": ' + e.toString(), this.vm);
	    }
	  }
	  // two-way sync for v-for alias
	  var forContext = scope.$forContext;
	  if (forContext && forContext.alias === this.expression) {
	    if (forContext.filters) {
	      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.', this.vm);
	      return;
	    }
	    forContext._withLock(function () {
	      if (scope.$key) {
	        // original is an object
	        forContext.rawValue[scope.$key] = value;
	      } else {
	        forContext.rawValue.$set(scope.$index, value);
	      }
	    });
	  }
	};

	/**
	 * Prepare for dependency collection.
	 */

	Watcher.prototype.beforeGet = function () {
	  Dep.target = this;
	};

	/**
	 * Add a dependency to this directive.
	 *
	 * @param {Dep} dep
	 */

	Watcher.prototype.addDep = function (dep) {
	  var id = dep.id;
	  if (!this.newDepIds.has(id)) {
	    this.newDepIds.add(id);
	    this.newDeps.push(dep);
	    if (!this.depIds.has(id)) {
	      dep.addSub(this);
	    }
	  }
	};

	/**
	 * Clean up for dependency collection.
	 */

	Watcher.prototype.afterGet = function () {
	  Dep.target = null;
	  var i = this.deps.length;
	  while (i--) {
	    var dep = this.deps[i];
	    if (!this.newDepIds.has(dep.id)) {
	      dep.removeSub(this);
	    }
	  }
	  var tmp = this.depIds;
	  this.depIds = this.newDepIds;
	  this.newDepIds = tmp;
	  this.newDepIds.clear();
	  tmp = this.deps;
	  this.deps = this.newDeps;
	  this.newDeps = tmp;
	  this.newDeps.length = 0;
	};

	/**
	 * Subscriber interface.
	 * Will be called when a dependency changes.
	 *
	 * @param {Boolean} shallow
	 */

	Watcher.prototype.update = function (shallow) {
	  if (this.lazy) {
	    this.dirty = true;
	  } else if (this.sync || !config.async) {
	    this.run();
	  } else {
	    // if queued, only overwrite shallow with non-shallow,
	    // but not the other way around.
	    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
	    this.queued = true;
	    // record before-push error stack in debug mode
	    /* istanbul ignore if */
	    if (process.env.NODE_ENV !== 'production' && config.debug) {
	      this.prevError = new Error('[vue] async stack trace');
	    }
	    pushWatcher(this);
	  }
	};

	/**
	 * Batcher job interface.
	 * Will be called by the batcher.
	 */

	Watcher.prototype.run = function () {
	  if (this.active) {
	    var value = this.get();
	    if (value !== this.value ||
	    // Deep watchers and watchers on Object/Arrays should fire even
	    // when the value is the same, because the value may
	    // have mutated; but only do so if this is a
	    // non-shallow update (caused by a vm digest).
	    (isObject(value) || this.deep) && !this.shallow) {
	      // set new value
	      var oldValue = this.value;
	      this.value = value;
	      // in debug + async mode, when a watcher callbacks
	      // throws, we also throw the saved before-push error
	      // so the full cross-tick stack trace is available.
	      var prevError = this.prevError;
	      /* istanbul ignore if */
	      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
	        this.prevError = null;
	        try {
	          this.cb.call(this.vm, value, oldValue);
	        } catch (e) {
	          nextTick(function () {
	            throw prevError;
	          }, 0);
	          throw e;
	        }
	      } else {
	        this.cb.call(this.vm, value, oldValue);
	      }
	    }
	    this.queued = this.shallow = false;
	  }
	};

	/**
	 * Evaluate the value of the watcher.
	 * This only gets called for lazy watchers.
	 */

	Watcher.prototype.evaluate = function () {
	  // avoid overwriting another watcher that is being
	  // collected.
	  var current = Dep.target;
	  this.value = this.get();
	  this.dirty = false;
	  Dep.target = current;
	};

	/**
	 * Depend on all deps collected by this watcher.
	 */

	Watcher.prototype.depend = function () {
	  var i = this.deps.length;
	  while (i--) {
	    this.deps[i].depend();
	  }
	};

	/**
	 * Remove self from all dependencies' subcriber list.
	 */

	Watcher.prototype.teardown = function () {
	  if (this.active) {
	    // remove self from vm's watcher list
	    // this is a somewhat expensive operation so we skip it
	    // if the vm is being destroyed or is performing a v-for
	    // re-render (the watcher list is then filtered by v-for).
	    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
	      this.vm._watchers.$remove(this);
	    }
	    var i = this.deps.length;
	    while (i--) {
	      this.deps[i].removeSub(this);
	    }
	    this.active = false;
	    this.vm = this.cb = this.value = null;
	  }
	};

	/**
	 * Recrusively traverse an object to evoke all converted
	 * getters, so that every nested property inside the object
	 * is collected as a "deep" dependency.
	 *
	 * @param {*} val
	 */

	var seenObjects = new _Set();
	function traverse(val, seen) {
	  var i = undefined,
	      keys = undefined;
	  if (!seen) {
	    seen = seenObjects;
	    seen.clear();
	  }
	  var isA = isArray(val);
	  var isO = isObject(val);
	  if ((isA || isO) && Object.isExtensible(val)) {
	    if (val.__ob__) {
	      var depId = val.__ob__.dep.id;
	      if (seen.has(depId)) {
	        return;
	      } else {
	        seen.add(depId);
	      }
	    }
	    if (isA) {
	      i = val.length;
	      while (i--) traverse(val[i], seen);
	    } else if (isO) {
	      keys = Object.keys(val);
	      i = keys.length;
	      while (i--) traverse(val[keys[i]], seen);
	    }
	  }
	}

	var text$1 = {

	  bind: function bind() {
	    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
	  },

	  update: function update(value) {
	    this.el[this.attr] = _toString(value);
	  }
	};

	var templateCache = new Cache(1000);
	var idSelectorCache = new Cache(1000);

	var map = {
	  efault: [0, '', ''],
	  legend: [1, '<fieldset>', '</fieldset>'],
	  tr: [2, '<table><tbody>', '</tbody></table>'],
	  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
	};

	map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

	map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

	map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

	map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

	/**
	 * Check if a node is a supported template node with a
	 * DocumentFragment content.
	 *
	 * @param {Node} node
	 * @return {Boolean}
	 */

	function isRealTemplate(node) {
	  return isTemplate(node) && isFragment(node.content);
	}

	var tagRE$1 = /<([\w:-]+)/;
	var entityRE = /&#?\w+?;/;
	var commentRE = /<!--/;

	/**
	 * Convert a string template to a DocumentFragment.
	 * Determines correct wrapping by tag types. Wrapping
	 * strategy found in jQuery & component/domify.
	 *
	 * @param {String} templateString
	 * @param {Boolean} raw
	 * @return {DocumentFragment}
	 */

	function stringToFragment(templateString, raw) {
	  // try a cache hit first
	  var cacheKey = raw ? templateString : templateString.trim();
	  var hit = templateCache.get(cacheKey);
	  if (hit) {
	    return hit;
	  }

	  var frag = document.createDocumentFragment();
	  var tagMatch = templateString.match(tagRE$1);
	  var entityMatch = entityRE.test(templateString);
	  var commentMatch = commentRE.test(templateString);

	  if (!tagMatch && !entityMatch && !commentMatch) {
	    // text only, return a single text node.
	    frag.appendChild(document.createTextNode(templateString));
	  } else {
	    var tag = tagMatch && tagMatch[1];
	    var wrap = map[tag] || map.efault;
	    var depth = wrap[0];
	    var prefix = wrap[1];
	    var suffix = wrap[2];
	    var node = document.createElement('div');

	    node.innerHTML = prefix + templateString + suffix;
	    while (depth--) {
	      node = node.lastChild;
	    }

	    var child;
	    /* eslint-disable no-cond-assign */
	    while (child = node.firstChild) {
	      /* eslint-enable no-cond-assign */
	      frag.appendChild(child);
	    }
	  }
	  if (!raw) {
	    trimNode(frag);
	  }
	  templateCache.put(cacheKey, frag);
	  return frag;
	}

	/**
	 * Convert a template node to a DocumentFragment.
	 *
	 * @param {Node} node
	 * @return {DocumentFragment}
	 */

	function nodeToFragment(node) {
	  // if its a template tag and the browser supports it,
	  // its content is already a document fragment. However, iOS Safari has
	  // bug when using directly cloned template content with touch
	  // events and can cause crashes when the nodes are removed from DOM, so we
	  // have to treat template elements as string templates. (#2805)
	  /* istanbul ignore if */
	  if (isRealTemplate(node)) {
	    return stringToFragment(node.innerHTML);
	  }
	  // script template
	  if (node.tagName === 'SCRIPT') {
	    return stringToFragment(node.textContent);
	  }
	  // normal node, clone it to avoid mutating the original
	  var clonedNode = cloneNode(node);
	  var frag = document.createDocumentFragment();
	  var child;
	  /* eslint-disable no-cond-assign */
	  while (child = clonedNode.firstChild) {
	    /* eslint-enable no-cond-assign */
	    frag.appendChild(child);
	  }
	  trimNode(frag);
	  return frag;
	}

	// Test for the presence of the Safari template cloning bug
	// https://bugs.webkit.org/showug.cgi?id=137755
	var hasBrokenTemplate = (function () {
	  /* istanbul ignore else */
	  if (inBrowser) {
	    var a = document.createElement('div');
	    a.innerHTML = '<template>1</template>';
	    return !a.cloneNode(true).firstChild.innerHTML;
	  } else {
	    return false;
	  }
	})();

	// Test for IE10/11 textarea placeholder clone bug
	var hasTextareaCloneBug = (function () {
	  /* istanbul ignore else */
	  if (inBrowser) {
	    var t = document.createElement('textarea');
	    t.placeholder = 't';
	    return t.cloneNode(true).value === 't';
	  } else {
	    return false;
	  }
	})();

	/**
	 * 1. Deal with Safari cloning nested <template> bug by
	 *    manually cloning all template instances.
	 * 2. Deal with IE10/11 textarea placeholder bug by setting
	 *    the correct value after cloning.
	 *
	 * @param {Element|DocumentFragment} node
	 * @return {Element|DocumentFragment}
	 */

	function cloneNode(node) {
	  /* istanbul ignore if */
	  if (!node.querySelectorAll) {
	    return node.cloneNode();
	  }
	  var res = node.cloneNode(true);
	  var i, original, cloned;
	  /* istanbul ignore if */
	  if (hasBrokenTemplate) {
	    var tempClone = res;
	    if (isRealTemplate(node)) {
	      node = node.content;
	      tempClone = res.content;
	    }
	    original = node.querySelectorAll('template');
	    if (original.length) {
	      cloned = tempClone.querySelectorAll('template');
	      i = cloned.length;
	      while (i--) {
	        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
	      }
	    }
	  }
	  /* istanbul ignore if */
	  if (hasTextareaCloneBug) {
	    if (node.tagName === 'TEXTAREA') {
	      res.value = node.value;
	    } else {
	      original = node.querySelectorAll('textarea');
	      if (original.length) {
	        cloned = res.querySelectorAll('textarea');
	        i = cloned.length;
	        while (i--) {
	          cloned[i].value = original[i].value;
	        }
	      }
	    }
	  }
	  return res;
	}

	/**
	 * Process the template option and normalizes it into a
	 * a DocumentFragment that can be used as a partial or a
	 * instance template.
	 *
	 * @param {*} template
	 *        Possible values include:
	 *        - DocumentFragment object
	 *        - Node object of type Template
	 *        - id selector: '#some-template-id'
	 *        - template string: '<div><span>{{msg}}</span></div>'
	 * @param {Boolean} shouldClone
	 * @param {Boolean} raw
	 *        inline HTML interpolation. Do not check for id
	 *        selector and keep whitespace in the string.
	 * @return {DocumentFragment|undefined}
	 */

	function parseTemplate(template, shouldClone, raw) {
	  var node, frag;

	  // if the template is already a document fragment,
	  // do nothing
	  if (isFragment(template)) {
	    trimNode(template);
	    return shouldClone ? cloneNode(template) : template;
	  }

	  if (typeof template === 'string') {
	    // id selector
	    if (!raw && template.charAt(0) === '#') {
	      // id selector can be cached too
	      frag = idSelectorCache.get(template);
	      if (!frag) {
	        node = document.getElementById(template.slice(1));
	        if (node) {
	          frag = nodeToFragment(node);
	          // save selector to cache
	          idSelectorCache.put(template, frag);
	        }
	      }
	    } else {
	      // normal string template
	      frag = stringToFragment(template, raw);
	    }
	  } else if (template.nodeType) {
	    // a direct node
	    frag = nodeToFragment(template);
	  }

	  return frag && shouldClone ? cloneNode(frag) : frag;
	}

	var template = Object.freeze({
	  cloneNode: cloneNode,
	  parseTemplate: parseTemplate
	});

	var html = {

	  bind: function bind() {
	    // a comment node means this is a binding for
	    // {{{ inline unescaped html }}}
	    if (this.el.nodeType === 8) {
	      // hold nodes
	      this.nodes = [];
	      // replace the placeholder with proper anchor
	      this.anchor = createAnchor('v-html');
	      replace(this.el, this.anchor);
	    }
	  },

	  update: function update(value) {
	    value = _toString(value);
	    if (this.nodes) {
	      this.swap(value);
	    } else {
	      this.el.innerHTML = value;
	    }
	  },

	  swap: function swap(value) {
	    // remove old nodes
	    var i = this.nodes.length;
	    while (i--) {
	      remove(this.nodes[i]);
	    }
	    // convert new value to a fragment
	    // do not attempt to retrieve from id selector
	    var frag = parseTemplate(value, true, true);
	    // save a reference to these nodes so we can remove later
	    this.nodes = toArray(frag.childNodes);
	    before(frag, this.anchor);
	  }
	};

	/**
	 * Abstraction for a partially-compiled fragment.
	 * Can optionally compile content with a child scope.
	 *
	 * @param {Function} linker
	 * @param {Vue} vm
	 * @param {DocumentFragment} frag
	 * @param {Vue} [host]
	 * @param {Object} [scope]
	 * @param {Fragment} [parentFrag]
	 */
	function Fragment(linker, vm, frag, host, scope, parentFrag) {
	  this.children = [];
	  this.childFrags = [];
	  this.vm = vm;
	  this.scope = scope;
	  this.inserted = false;
	  this.parentFrag = parentFrag;
	  if (parentFrag) {
	    parentFrag.childFrags.push(this);
	  }
	  this.unlink = linker(vm, frag, host, scope, this);
	  var single = this.single = frag.childNodes.length === 1 &&
	  // do not go single mode if the only node is an anchor
	  !frag.childNodes[0].__v_anchor;
	  if (single) {
	    this.node = frag.childNodes[0];
	    this.before = singleBefore;
	    this.remove = singleRemove;
	  } else {
	    this.node = createAnchor('fragment-start');
	    this.end = createAnchor('fragment-end');
	    this.frag = frag;
	    prepend(this.node, frag);
	    frag.appendChild(this.end);
	    this.before = multiBefore;
	    this.remove = multiRemove;
	  }
	  this.node.__v_frag = this;
	}

	/**
	 * Call attach/detach for all components contained within
	 * this fragment. Also do so recursively for all child
	 * fragments.
	 *
	 * @param {Function} hook
	 */

	Fragment.prototype.callHook = function (hook) {
	  var i, l;
	  for (i = 0, l = this.childFrags.length; i < l; i++) {
	    this.childFrags[i].callHook(hook);
	  }
	  for (i = 0, l = this.children.length; i < l; i++) {
	    hook(this.children[i]);
	  }
	};

	/**
	 * Insert fragment before target, single node version
	 *
	 * @param {Node} target
	 * @param {Boolean} withTransition
	 */

	function singleBefore(target, withTransition) {
	  this.inserted = true;
	  var method = withTransition !== false ? beforeWithTransition : before;
	  method(this.node, target, this.vm);
	  if (inDoc(this.node)) {
	    this.callHook(attach);
	  }
	}

	/**
	 * Remove fragment, single node version
	 */

	function singleRemove() {
	  this.inserted = false;
	  var shouldCallRemove = inDoc(this.node);
	  var self = this;
	  this.beforeRemove();
	  removeWithTransition(this.node, this.vm, function () {
	    if (shouldCallRemove) {
	      self.callHook(detach);
	    }
	    self.destroy();
	  });
	}

	/**
	 * Insert fragment before target, multi-nodes version
	 *
	 * @param {Node} target
	 * @param {Boolean} withTransition
	 */

	function multiBefore(target, withTransition) {
	  this.inserted = true;
	  var vm = this.vm;
	  var method = withTransition !== false ? beforeWithTransition : before;
	  mapNodeRange(this.node, this.end, function (node) {
	    method(node, target, vm);
	  });
	  if (inDoc(this.node)) {
	    this.callHook(attach);
	  }
	}

	/**
	 * Remove fragment, multi-nodes version
	 */

	function multiRemove() {
	  this.inserted = false;
	  var self = this;
	  var shouldCallRemove = inDoc(this.node);
	  this.beforeRemove();
	  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
	    if (shouldCallRemove) {
	      self.callHook(detach);
	    }
	    self.destroy();
	  });
	}

	/**
	 * Prepare the fragment for removal.
	 */

	Fragment.prototype.beforeRemove = function () {
	  var i, l;
	  for (i = 0, l = this.childFrags.length; i < l; i++) {
	    // call the same method recursively on child
	    // fragments, depth-first
	    this.childFrags[i].beforeRemove(false);
	  }
	  for (i = 0, l = this.children.length; i < l; i++) {
	    // Call destroy for all contained instances,
	    // with remove:false and defer:true.
	    // Defer is necessary because we need to
	    // keep the children to call detach hooks
	    // on them.
	    this.children[i].$destroy(false, true);
	  }
	  var dirs = this.unlink.dirs;
	  for (i = 0, l = dirs.length; i < l; i++) {
	    // disable the watchers on all the directives
	    // so that the rendered content stays the same
	    // during removal.
	    dirs[i]._watcher && dirs[i]._watcher.teardown();
	  }
	};

	/**
	 * Destroy the fragment.
	 */

	Fragment.prototype.destroy = function () {
	  if (this.parentFrag) {
	    this.parentFrag.childFrags.$remove(this);
	  }
	  this.node.__v_frag = null;
	  this.unlink();
	};

	/**
	 * Call attach hook for a Vue instance.
	 *
	 * @param {Vue} child
	 */

	function attach(child) {
	  if (!child._isAttached && inDoc(child.$el)) {
	    child._callHook('attached');
	  }
	}

	/**
	 * Call detach hook for a Vue instance.
	 *
	 * @param {Vue} child
	 */

	function detach(child) {
	  if (child._isAttached && !inDoc(child.$el)) {
	    child._callHook('detached');
	  }
	}

	var linkerCache = new Cache(5000);

	/**
	 * A factory that can be used to create instances of a
	 * fragment. Caches the compiled linker if possible.
	 *
	 * @param {Vue} vm
	 * @param {Element|String} el
	 */
	function FragmentFactory(vm, el) {
	  this.vm = vm;
	  var template;
	  var isString = typeof el === 'string';
	  if (isString || isTemplate(el) && !el.hasAttribute('v-if')) {
	    template = parseTemplate(el, true);
	  } else {
	    template = document.createDocumentFragment();
	    template.appendChild(el);
	  }
	  this.template = template;
	  // linker can be cached, but only for components
	  var linker;
	  var cid = vm.constructor.cid;
	  if (cid > 0) {
	    var cacheId = cid + (isString ? el : getOuterHTML(el));
	    linker = linkerCache.get(cacheId);
	    if (!linker) {
	      linker = compile(template, vm.$options, true);
	      linkerCache.put(cacheId, linker);
	    }
	  } else {
	    linker = compile(template, vm.$options, true);
	  }
	  this.linker = linker;
	}

	/**
	 * Create a fragment instance with given host and scope.
	 *
	 * @param {Vue} host
	 * @param {Object} scope
	 * @param {Fragment} parentFrag
	 */

	FragmentFactory.prototype.create = function (host, scope, parentFrag) {
	  var frag = cloneNode(this.template);
	  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
	};

	var ON = 700;
	var MODEL = 800;
	var BIND = 850;
	var TRANSITION = 1100;
	var EL = 1500;
	var COMPONENT = 1500;
	var PARTIAL = 1750;
	var IF = 2100;
	var FOR = 2200;
	var SLOT = 2300;

	var uid$3 = 0;

	var vFor = {

	  priority: FOR,
	  terminal: true,

	  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

	  bind: function bind() {
	    // support "item in/of items" syntax
	    var inMatch = this.expression.match(/(.*) (?:in|of) (.*)/);
	    if (inMatch) {
	      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
	      if (itMatch) {
	        this.iterator = itMatch[1].trim();
	        this.alias = itMatch[2].trim();
	      } else {
	        this.alias = inMatch[1].trim();
	      }
	      this.expression = inMatch[2];
	    }

	    if (!this.alias) {
	      process.env.NODE_ENV !== 'production' && warn('Invalid v-for expression "' + this.descriptor.raw + '": ' + 'alias is required.', this.vm);
	      return;
	    }

	    // uid as a cache identifier
	    this.id = '__v-for__' + ++uid$3;

	    // check if this is an option list,
	    // so that we know if we need to update the <select>'s
	    // v-model when the option list has changed.
	    // because v-model has a lower priority than v-for,
	    // the v-model is not bound here yet, so we have to
	    // retrive it in the actual updateModel() function.
	    var tag = this.el.tagName;
	    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

	    // setup anchor nodes
	    this.start = createAnchor('v-for-start');
	    this.end = createAnchor('v-for-end');
	    replace(this.el, this.end);
	    before(this.start, this.end);

	    // cache
	    this.cache = Object.create(null);

	    // fragment factory
	    this.factory = new FragmentFactory(this.vm, this.el);
	  },

	  update: function update(data) {
	    this.diff(data);
	    this.updateRef();
	    this.updateModel();
	  },

	  /**
	   * Diff, based on new data and old data, determine the
	   * minimum amount of DOM manipulations needed to make the
	   * DOM reflect the new data Array.
	   *
	   * The algorithm diffs the new data Array by storing a
	   * hidden reference to an owner vm instance on previously
	   * seen data. This allows us to achieve O(n) which is
	   * better than a levenshtein distance based algorithm,
	   * which is O(m * n).
	   *
	   * @param {Array} data
	   */

	  diff: function diff(data) {
	    // check if the Array was converted from an Object
	    var item = data[0];
	    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

	    var trackByKey = this.params.trackBy;
	    var oldFrags = this.frags;
	    var frags = this.frags = new Array(data.length);
	    var alias = this.alias;
	    var iterator = this.iterator;
	    var start = this.start;
	    var end = this.end;
	    var inDocument = inDoc(start);
	    var init = !oldFrags;
	    var i, l, frag, key, value, primitive;

	    // First pass, go through the new Array and fill up
	    // the new frags array. If a piece of data has a cached
	    // instance for it, we reuse it. Otherwise build a new
	    // instance.
	    for (i = 0, l = data.length; i < l; i++) {
	      item = data[i];
	      key = convertedFromObject ? item.$key : null;
	      value = convertedFromObject ? item.$value : item;
	      primitive = !isObject(value);
	      frag = !init && this.getCachedFrag(value, i, key);
	      if (frag) {
	        // reusable fragment
	        frag.reused = true;
	        // update $index
	        frag.scope.$index = i;
	        // update $key
	        if (key) {
	          frag.scope.$key = key;
	        }
	        // update iterator
	        if (iterator) {
	          frag.scope[iterator] = key !== null ? key : i;
	        }
	        // update data for track-by, object repeat &
	        // primitive values.
	        if (trackByKey || convertedFromObject || primitive) {
	          withoutConversion(function () {
	            frag.scope[alias] = value;
	          });
	        }
	      } else {
	        // new isntance
	        frag = this.create(value, alias, i, key);
	        frag.fresh = !init;
	      }
	      frags[i] = frag;
	      if (init) {
	        frag.before(end);
	      }
	    }

	    // we're done for the initial render.
	    if (init) {
	      return;
	    }

	    // Second pass, go through the old fragments and
	    // destroy those who are not reused (and remove them
	    // from cache)
	    var removalIndex = 0;
	    var totalRemoved = oldFrags.length - frags.length;
	    // when removing a large number of fragments, watcher removal
	    // turns out to be a perf bottleneck, so we batch the watcher
	    // removals into a single filter call!
	    this.vm._vForRemoving = true;
	    for (i = 0, l = oldFrags.length; i < l; i++) {
	      frag = oldFrags[i];
	      if (!frag.reused) {
	        this.deleteCachedFrag(frag);
	        this.remove(frag, removalIndex++, totalRemoved, inDocument);
	      }
	    }
	    this.vm._vForRemoving = false;
	    if (removalIndex) {
	      this.vm._watchers = this.vm._watchers.filter(function (w) {
	        return w.active;
	      });
	    }

	    // Final pass, move/insert new fragments into the
	    // right place.
	    var targetPrev, prevEl, currentPrev;
	    var insertionIndex = 0;
	    for (i = 0, l = frags.length; i < l; i++) {
	      frag = frags[i];
	      // this is the frag that we should be after
	      targetPrev = frags[i - 1];
	      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
	      if (frag.reused && !frag.staggerCb) {
	        currentPrev = findPrevFrag(frag, start, this.id);
	        if (currentPrev !== targetPrev && (!currentPrev ||
	        // optimization for moving a single item.
	        // thanks to suggestions by @livoras in #1807
	        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
	          this.move(frag, prevEl);
	        }
	      } else {
	        // new instance, or still in stagger.
	        // insert with updated stagger index.
	        this.insert(frag, insertionIndex++, prevEl, inDocument);
	      }
	      frag.reused = frag.fresh = false;
	    }
	  },

	  /**
	   * Create a new fragment instance.
	   *
	   * @param {*} value
	   * @param {String} alias
	   * @param {Number} index
	   * @param {String} [key]
	   * @return {Fragment}
	   */

	  create: function create(value, alias, index, key) {
	    var host = this._host;
	    // create iteration scope
	    var parentScope = this._scope || this.vm;
	    var scope = Object.create(parentScope);
	    // ref holder for the scope
	    scope.$refs = Object.create(parentScope.$refs);
	    scope.$els = Object.create(parentScope.$els);
	    // make sure point $parent to parent scope
	    scope.$parent = parentScope;
	    // for two-way binding on alias
	    scope.$forContext = this;
	    // define scope properties
	    // important: define the scope alias without forced conversion
	    // so that frozen data structures remain non-reactive.
	    withoutConversion(function () {
	      defineReactive(scope, alias, value);
	    });
	    defineReactive(scope, '$index', index);
	    if (key) {
	      defineReactive(scope, '$key', key);
	    } else if (scope.$key) {
	      // avoid accidental fallback
	      def(scope, '$key', null);
	    }
	    if (this.iterator) {
	      defineReactive(scope, this.iterator, key !== null ? key : index);
	    }
	    var frag = this.factory.create(host, scope, this._frag);
	    frag.forId = this.id;
	    this.cacheFrag(value, frag, index, key);
	    return frag;
	  },

	  /**
	   * Update the v-ref on owner vm.
	   */

	  updateRef: function updateRef() {
	    var ref = this.descriptor.ref;
	    if (!ref) return;
	    var hash = (this._scope || this.vm).$refs;
	    var refs;
	    if (!this.fromObject) {
	      refs = this.frags.map(findVmFromFrag);
	    } else {
	      refs = {};
	      this.frags.forEach(function (frag) {
	        refs[frag.scope.$key] = findVmFromFrag(frag);
	      });
	    }
	    hash[ref] = refs;
	  },

	  /**
	   * For option lists, update the containing v-model on
	   * parent <select>.
	   */

	  updateModel: function updateModel() {
	    if (this.isOption) {
	      var parent = this.start.parentNode;
	      var model = parent && parent.__v_model;
	      if (model) {
	        model.forceUpdate();
	      }
	    }
	  },

	  /**
	   * Insert a fragment. Handles staggering.
	   *
	   * @param {Fragment} frag
	   * @param {Number} index
	   * @param {Node} prevEl
	   * @param {Boolean} inDocument
	   */

	  insert: function insert(frag, index, prevEl, inDocument) {
	    if (frag.staggerCb) {
	      frag.staggerCb.cancel();
	      frag.staggerCb = null;
	    }
	    var staggerAmount = this.getStagger(frag, index, null, 'enter');
	    if (inDocument && staggerAmount) {
	      // create an anchor and insert it synchronously,
	      // so that we can resolve the correct order without
	      // worrying about some elements not inserted yet
	      var anchor = frag.staggerAnchor;
	      if (!anchor) {
	        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
	        anchor.__v_frag = frag;
	      }
	      after(anchor, prevEl);
	      var op = frag.staggerCb = cancellable(function () {
	        frag.staggerCb = null;
	        frag.before(anchor);
	        remove(anchor);
	      });
	      setTimeout(op, staggerAmount);
	    } else {
	      var target = prevEl.nextSibling;
	      /* istanbul ignore if */
	      if (!target) {
	        // reset end anchor position in case the position was messed up
	        // by an external drag-n-drop library.
	        after(this.end, prevEl);
	        target = this.end;
	      }
	      frag.before(target);
	    }
	  },

	  /**
	   * Remove a fragment. Handles staggering.
	   *
	   * @param {Fragment} frag
	   * @param {Number} index
	   * @param {Number} total
	   * @param {Boolean} inDocument
	   */

	  remove: function remove(frag, index, total, inDocument) {
	    if (frag.staggerCb) {
	      frag.staggerCb.cancel();
	      frag.staggerCb = null;
	      // it's not possible for the same frag to be removed
	      // twice, so if we have a pending stagger callback,
	      // it means this frag is queued for enter but removed
	      // before its transition started. Since it is already
	      // destroyed, we can just leave it in detached state.
	      return;
	    }
	    var staggerAmount = this.getStagger(frag, index, total, 'leave');
	    if (inDocument && staggerAmount) {
	      var op = frag.staggerCb = cancellable(function () {
	        frag.staggerCb = null;
	        frag.remove();
	      });
	      setTimeout(op, staggerAmount);
	    } else {
	      frag.remove();
	    }
	  },

	  /**
	   * Move a fragment to a new position.
	   * Force no transition.
	   *
	   * @param {Fragment} frag
	   * @param {Node} prevEl
	   */

	  move: function move(frag, prevEl) {
	    // fix a common issue with Sortable:
	    // if prevEl doesn't have nextSibling, this means it's
	    // been dragged after the end anchor. Just re-position
	    // the end anchor to the end of the container.
	    /* istanbul ignore if */
	    if (!prevEl.nextSibling) {
	      this.end.parentNode.appendChild(this.end);
	    }
	    frag.before(prevEl.nextSibling, false);
	  },

	  /**
	   * Cache a fragment using track-by or the object key.
	   *
	   * @param {*} value
	   * @param {Fragment} frag
	   * @param {Number} index
	   * @param {String} [key]
	   */

	  cacheFrag: function cacheFrag(value, frag, index, key) {
	    var trackByKey = this.params.trackBy;
	    var cache = this.cache;
	    var primitive = !isObject(value);
	    var id;
	    if (key || trackByKey || primitive) {
	      id = getTrackByKey(index, key, value, trackByKey);
	      if (!cache[id]) {
	        cache[id] = frag;
	      } else if (trackByKey !== '$index') {
	        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
	      }
	    } else {
	      id = this.id;
	      if (hasOwn(value, id)) {
	        if (value[id] === null) {
	          value[id] = frag;
	        } else {
	          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
	        }
	      } else if (Object.isExtensible(value)) {
	        def(value, id, frag);
	      } else if (process.env.NODE_ENV !== 'production') {
	        warn('Frozen v-for objects cannot be automatically tracked, make sure to ' + 'provide a track-by key.');
	      }
	    }
	    frag.raw = value;
	  },

	  /**
	   * Get a cached fragment from the value/index/key
	   *
	   * @param {*} value
	   * @param {Number} index
	   * @param {String} key
	   * @return {Fragment}
	   */

	  getCachedFrag: function getCachedFrag(value, index, key) {
	    var trackByKey = this.params.trackBy;
	    var primitive = !isObject(value);
	    var frag;
	    if (key || trackByKey || primitive) {
	      var id = getTrackByKey(index, key, value, trackByKey);
	      frag = this.cache[id];
	    } else {
	      frag = value[this.id];
	    }
	    if (frag && (frag.reused || frag.fresh)) {
	      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
	    }
	    return frag;
	  },

	  /**
	   * Delete a fragment from cache.
	   *
	   * @param {Fragment} frag
	   */

	  deleteCachedFrag: function deleteCachedFrag(frag) {
	    var value = frag.raw;
	    var trackByKey = this.params.trackBy;
	    var scope = frag.scope;
	    var index = scope.$index;
	    // fix #948: avoid accidentally fall through to
	    // a parent repeater which happens to have $key.
	    var key = hasOwn(scope, '$key') && scope.$key;
	    var primitive = !isObject(value);
	    if (trackByKey || key || primitive) {
	      var id = getTrackByKey(index, key, value, trackByKey);
	      this.cache[id] = null;
	    } else {
	      value[this.id] = null;
	      frag.raw = null;
	    }
	  },

	  /**
	   * Get the stagger amount for an insertion/removal.
	   *
	   * @param {Fragment} frag
	   * @param {Number} index
	   * @param {Number} total
	   * @param {String} type
	   */

	  getStagger: function getStagger(frag, index, total, type) {
	    type = type + 'Stagger';
	    var trans = frag.node.__v_trans;
	    var hooks = trans && trans.hooks;
	    var hook = hooks && (hooks[type] || hooks.stagger);
	    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
	  },

	  /**
	   * Pre-process the value before piping it through the
	   * filters. This is passed to and called by the watcher.
	   */

	  _preProcess: function _preProcess(value) {
	    // regardless of type, store the un-filtered raw value.
	    this.rawValue = value;
	    return value;
	  },

	  /**
	   * Post-process the value after it has been piped through
	   * the filters. This is passed to and called by the watcher.
	   *
	   * It is necessary for this to be called during the
	   * watcher's dependency collection phase because we want
	   * the v-for to update when the source Object is mutated.
	   */

	  _postProcess: function _postProcess(value) {
	    if (isArray(value)) {
	      return value;
	    } else if (isPlainObject(value)) {
	      // convert plain object to array.
	      var keys = Object.keys(value);
	      var i = keys.length;
	      var res = new Array(i);
	      var key;
	      while (i--) {
	        key = keys[i];
	        res[i] = {
	          $key: key,
	          $value: value[key]
	        };
	      }
	      return res;
	    } else {
	      if (typeof value === 'number' && !isNaN(value)) {
	        value = range(value);
	      }
	      return value || [];
	    }
	  },

	  unbind: function unbind() {
	    if (this.descriptor.ref) {
	      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
	    }
	    if (this.frags) {
	      var i = this.frags.length;
	      var frag;
	      while (i--) {
	        frag = this.frags[i];
	        this.deleteCachedFrag(frag);
	        frag.destroy();
	      }
	    }
	  }
	};

	/**
	 * Helper to find the previous element that is a fragment
	 * anchor. This is necessary because a destroyed frag's
	 * element could still be lingering in the DOM before its
	 * leaving transition finishes, but its inserted flag
	 * should have been set to false so we can skip them.
	 *
	 * If this is a block repeat, we want to make sure we only
	 * return frag that is bound to this v-for. (see #929)
	 *
	 * @param {Fragment} frag
	 * @param {Comment|Text} anchor
	 * @param {String} id
	 * @return {Fragment}
	 */

	function findPrevFrag(frag, anchor, id) {
	  var el = frag.node.previousSibling;
	  /* istanbul ignore if */
	  if (!el) return;
	  frag = el.__v_frag;
	  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
	    el = el.previousSibling;
	    /* istanbul ignore if */
	    if (!el) return;
	    frag = el.__v_frag;
	  }
	  return frag;
	}

	/**
	 * Find a vm from a fragment.
	 *
	 * @param {Fragment} frag
	 * @return {Vue|undefined}
	 */

	function findVmFromFrag(frag) {
	  var node = frag.node;
	  // handle multi-node frag
	  if (frag.end) {
	    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
	      node = node.nextSibling;
	    }
	  }
	  return node.__vue__;
	}

	/**
	 * Create a range array from given number.
	 *
	 * @param {Number} n
	 * @return {Array}
	 */

	function range(n) {
	  var i = -1;
	  var ret = new Array(Math.floor(n));
	  while (++i < n) {
	    ret[i] = i;
	  }
	  return ret;
	}

	/**
	 * Get the track by key for an item.
	 *
	 * @param {Number} index
	 * @param {String} key
	 * @param {*} value
	 * @param {String} [trackByKey]
	 */

	function getTrackByKey(index, key, value, trackByKey) {
	  return trackByKey ? trackByKey === '$index' ? index : trackByKey.charAt(0).match(/\w/) ? getPath(value, trackByKey) : value[trackByKey] : key || value;
	}

	if (process.env.NODE_ENV !== 'production') {
	  vFor.warnDuplicate = function (value) {
	    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.', this.vm);
	  };
	}

	var vIf = {

	  priority: IF,
	  terminal: true,

	  bind: function bind() {
	    var el = this.el;
	    if (!el.__vue__) {
	      // check else block
	      var next = el.nextElementSibling;
	      if (next && getAttr(next, 'v-else') !== null) {
	        remove(next);
	        this.elseEl = next;
	      }
	      // check main block
	      this.anchor = createAnchor('v-if');
	      replace(el, this.anchor);
	    } else {
	      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.', this.vm);
	      this.invalid = true;
	    }
	  },

	  update: function update(value) {
	    if (this.invalid) return;
	    if (value) {
	      if (!this.frag) {
	        this.insert();
	      }
	    } else {
	      this.remove();
	    }
	  },

	  insert: function insert() {
	    if (this.elseFrag) {
	      this.elseFrag.remove();
	      this.elseFrag = null;
	    }
	    // lazy init factory
	    if (!this.factory) {
	      this.factory = new FragmentFactory(this.vm, this.el);
	    }
	    this.frag = this.factory.create(this._host, this._scope, this._frag);
	    this.frag.before(this.anchor);
	  },

	  remove: function remove() {
	    if (this.frag) {
	      this.frag.remove();
	      this.frag = null;
	    }
	    if (this.elseEl && !this.elseFrag) {
	      if (!this.elseFactory) {
	        this.elseFactory = new FragmentFactory(this.elseEl._context || this.vm, this.elseEl);
	      }
	      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
	      this.elseFrag.before(this.anchor);
	    }
	  },

	  unbind: function unbind() {
	    if (this.frag) {
	      this.frag.destroy();
	    }
	    if (this.elseFrag) {
	      this.elseFrag.destroy();
	    }
	  }
	};

	var show = {

	  bind: function bind() {
	    // check else block
	    var next = this.el.nextElementSibling;
	    if (next && getAttr(next, 'v-else') !== null) {
	      this.elseEl = next;
	    }
	  },

	  update: function update(value) {
	    this.apply(this.el, value);
	    if (this.elseEl) {
	      this.apply(this.elseEl, !value);
	    }
	  },

	  apply: function apply(el, value) {
	    if (inDoc(el)) {
	      applyTransition(el, value ? 1 : -1, toggle, this.vm);
	    } else {
	      toggle();
	    }
	    function toggle() {
	      el.style.display = value ? '' : 'none';
	    }
	  }
	};

	var text$2 = {

	  bind: function bind() {
	    var self = this;
	    var el = this.el;
	    var isRange = el.type === 'range';
	    var lazy = this.params.lazy;
	    var number = this.params.number;
	    var debounce = this.params.debounce;

	    // handle composition events.
	    //   http://blog.evanyou.me/2014/01/03/composition-event/
	    // skip this for Android because it handles composition
	    // events quite differently. Android doesn't trigger
	    // composition events for language input methods e.g.
	    // Chinese, but instead triggers them for spelling
	    // suggestions... (see Discussion/#162)
	    var composing = false;
	    if (!isAndroid && !isRange) {
	      this.on('compositionstart', function () {
	        composing = true;
	      });
	      this.on('compositionend', function () {
	        composing = false;
	        // in IE11 the "compositionend" event fires AFTER
	        // the "input" event, so the input handler is blocked
	        // at the end... have to call it here.
	        //
	        // #1327: in lazy mode this is unecessary.
	        if (!lazy) {
	          self.listener();
	        }
	      });
	    }

	    // prevent messing with the input when user is typing,
	    // and force update on blur.
	    this.focused = false;
	    if (!isRange && !lazy) {
	      this.on('focus', function () {
	        self.focused = true;
	      });
	      this.on('blur', function () {
	        self.focused = false;
	        // do not sync value after fragment removal (#2017)
	        if (!self._frag || self._frag.inserted) {
	          self.rawListener();
	        }
	      });
	    }

	    // Now attach the main listener
	    this.listener = this.rawListener = function () {
	      if (composing || !self._bound) {
	        return;
	      }
	      var val = number || isRange ? toNumber(el.value) : el.value;
	      self.set(val);
	      // force update on next tick to avoid lock & same value
	      // also only update when user is not typing
	      nextTick(function () {
	        if (self._bound && !self.focused) {
	          self.update(self._watcher.value);
	        }
	      });
	    };

	    // apply debounce
	    if (debounce) {
	      this.listener = _debounce(this.listener, debounce);
	    }

	    // Support jQuery events, since jQuery.trigger() doesn't
	    // trigger native events in some cases and some plugins
	    // rely on $.trigger()
	    //
	    // We want to make sure if a listener is attached using
	    // jQuery, it is also removed with jQuery, that's why
	    // we do the check for each directive instance and
	    // store that check result on itself. This also allows
	    // easier test coverage control by unsetting the global
	    // jQuery variable in tests.
	    this.hasjQuery = typeof jQuery === 'function';
	    if (this.hasjQuery) {
	      var method = jQuery.fn.on ? 'on' : 'bind';
	      jQuery(el)[method]('change', this.rawListener);
	      if (!lazy) {
	        jQuery(el)[method]('input', this.listener);
	      }
	    } else {
	      this.on('change', this.rawListener);
	      if (!lazy) {
	        this.on('input', this.listener);
	      }
	    }

	    // IE9 doesn't fire input event on backspace/del/cut
	    if (!lazy && isIE9) {
	      this.on('cut', function () {
	        nextTick(self.listener);
	      });
	      this.on('keyup', function (e) {
	        if (e.keyCode === 46 || e.keyCode === 8) {
	          self.listener();
	        }
	      });
	    }

	    // set initial value if present
	    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
	      this.afterBind = this.listener;
	    }
	  },

	  update: function update(value) {
	    // #3029 only update when the value changes. This prevent
	    // browsers from overwriting values like selectionStart
	    value = _toString(value);
	    if (value !== this.el.value) this.el.value = value;
	  },

	  unbind: function unbind() {
	    var el = this.el;
	    if (this.hasjQuery) {
	      var method = jQuery.fn.off ? 'off' : 'unbind';
	      jQuery(el)[method]('change', this.listener);
	      jQuery(el)[method]('input', this.listener);
	    }
	  }
	};

	var radio = {

	  bind: function bind() {
	    var self = this;
	    var el = this.el;

	    this.getValue = function () {
	      // value overwrite via v-bind:value
	      if (el.hasOwnProperty('_value')) {
	        return el._value;
	      }
	      var val = el.value;
	      if (self.params.number) {
	        val = toNumber(val);
	      }
	      return val;
	    };

	    this.listener = function () {
	      self.set(self.getValue());
	    };
	    this.on('change', this.listener);

	    if (el.hasAttribute('checked')) {
	      this.afterBind = this.listener;
	    }
	  },

	  update: function update(value) {
	    this.el.checked = looseEqual(value, this.getValue());
	  }
	};

	var select = {

	  bind: function bind() {
	    var _this = this;

	    var self = this;
	    var el = this.el;

	    // method to force update DOM using latest value.
	    this.forceUpdate = function () {
	      if (self._watcher) {
	        self.update(self._watcher.get());
	      }
	    };

	    // check if this is a multiple select
	    var multiple = this.multiple = el.hasAttribute('multiple');

	    // attach listener
	    this.listener = function () {
	      var value = getValue(el, multiple);
	      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
	      self.set(value);
	    };
	    this.on('change', this.listener);

	    // if has initial value, set afterBind
	    var initValue = getValue(el, multiple, true);
	    if (multiple && initValue.length || !multiple && initValue !== null) {
	      this.afterBind = this.listener;
	    }

	    // All major browsers except Firefox resets
	    // selectedIndex with value -1 to 0 when the element
	    // is appended to a new parent, therefore we have to
	    // force a DOM update whenever that happens...
	    this.vm.$on('hook:attached', function () {
	      nextTick(_this.forceUpdate);
	    });
	    if (!inDoc(el)) {
	      nextTick(this.forceUpdate);
	    }
	  },

	  update: function update(value) {
	    var el = this.el;
	    el.selectedIndex = -1;
	    var multi = this.multiple && isArray(value);
	    var options = el.options;
	    var i = options.length;
	    var op, val;
	    while (i--) {
	      op = options[i];
	      val = op.hasOwnProperty('_value') ? op._value : op.value;
	      /* eslint-disable eqeqeq */
	      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
	      /* eslint-enable eqeqeq */
	    }
	  },

	  unbind: function unbind() {
	    /* istanbul ignore next */
	    this.vm.$off('hook:attached', this.forceUpdate);
	  }
	};

	/**
	 * Get select value
	 *
	 * @param {SelectElement} el
	 * @param {Boolean} multi
	 * @param {Boolean} init
	 * @return {Array|*}
	 */

	function getValue(el, multi, init) {
	  var res = multi ? [] : null;
	  var op, val, selected;
	  for (var i = 0, l = el.options.length; i < l; i++) {
	    op = el.options[i];
	    selected = init ? op.hasAttribute('selected') : op.selected;
	    if (selected) {
	      val = op.hasOwnProperty('_value') ? op._value : op.value;
	      if (multi) {
	        res.push(val);
	      } else {
	        return val;
	      }
	    }
	  }
	  return res;
	}

	/**
	 * Native Array.indexOf uses strict equal, but in this
	 * case we need to match string/numbers with custom equal.
	 *
	 * @param {Array} arr
	 * @param {*} val
	 */

	function indexOf$1(arr, val) {
	  var i = arr.length;
	  while (i--) {
	    if (looseEqual(arr[i], val)) {
	      return i;
	    }
	  }
	  return -1;
	}

	var checkbox = {

	  bind: function bind() {
	    var self = this;
	    var el = this.el;

	    this.getValue = function () {
	      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
	    };

	    function getBooleanValue() {
	      var val = el.checked;
	      if (val && el.hasOwnProperty('_trueValue')) {
	        return el._trueValue;
	      }
	      if (!val && el.hasOwnProperty('_falseValue')) {
	        return el._falseValue;
	      }
	      return val;
	    }

	    this.listener = function () {
	      var model = self._watcher.value;
	      if (isArray(model)) {
	        var val = self.getValue();
	        if (el.checked) {
	          if (indexOf(model, val) < 0) {
	            model.push(val);
	          }
	        } else {
	          model.$remove(val);
	        }
	      } else {
	        self.set(getBooleanValue());
	      }
	    };

	    this.on('change', this.listener);
	    if (el.hasAttribute('checked')) {
	      this.afterBind = this.listener;
	    }
	  },

	  update: function update(value) {
	    var el = this.el;
	    if (isArray(value)) {
	      el.checked = indexOf(value, this.getValue()) > -1;
	    } else {
	      if (el.hasOwnProperty('_trueValue')) {
	        el.checked = looseEqual(value, el._trueValue);
	      } else {
	        el.checked = !!value;
	      }
	    }
	  }
	};

	var handlers = {
	  text: text$2,
	  radio: radio,
	  select: select,
	  checkbox: checkbox
	};

	var model = {

	  priority: MODEL,
	  twoWay: true,
	  handlers: handlers,
	  params: ['lazy', 'number', 'debounce'],

	  /**
	   * Possible elements:
	   *   <select>
	   *   <textarea>
	   *   <input type="*">
	   *     - text
	   *     - checkbox
	   *     - radio
	   *     - number
	   */

	  bind: function bind() {
	    // friendly warning...
	    this.checkFilters();
	    if (this.hasRead && !this.hasWrite) {
	      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model="' + this.descriptor.raw + '". ' + 'You might want to use a two-way filter to ensure correct behavior.', this.vm);
	    }
	    var el = this.el;
	    var tag = el.tagName;
	    var handler;
	    if (tag === 'INPUT') {
	      handler = handlers[el.type] || handlers.text;
	    } else if (tag === 'SELECT') {
	      handler = handlers.select;
	    } else if (tag === 'TEXTAREA') {
	      handler = handlers.text;
	    } else {
	      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag, this.vm);
	      return;
	    }
	    el.__v_model = this;
	    handler.bind.call(this);
	    this.update = handler.update;
	    this._unbind = handler.unbind;
	  },

	  /**
	   * Check read/write filter stats.
	   */

	  checkFilters: function checkFilters() {
	    var filters = this.filters;
	    if (!filters) return;
	    var i = filters.length;
	    while (i--) {
	      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
	      if (typeof filter === 'function' || filter.read) {
	        this.hasRead = true;
	      }
	      if (filter.write) {
	        this.hasWrite = true;
	      }
	    }
	  },

	  unbind: function unbind() {
	    this.el.__v_model = null;
	    this._unbind && this._unbind();
	  }
	};

	// keyCode aliases
	var keyCodes = {
	  esc: 27,
	  tab: 9,
	  enter: 13,
	  space: 32,
	  'delete': [8, 46],
	  up: 38,
	  left: 37,
	  right: 39,
	  down: 40
	};

	function keyFilter(handler, keys) {
	  var codes = keys.map(function (key) {
	    var charCode = key.charCodeAt(0);
	    if (charCode > 47 && charCode < 58) {
	      return parseInt(key, 10);
	    }
	    if (key.length === 1) {
	      charCode = key.toUpperCase().charCodeAt(0);
	      if (charCode > 64 && charCode < 91) {
	        return charCode;
	      }
	    }
	    return keyCodes[key];
	  });
	  codes = [].concat.apply([], codes);
	  return function keyHandler(e) {
	    if (codes.indexOf(e.keyCode) > -1) {
	      return handler.call(this, e);
	    }
	  };
	}

	function stopFilter(handler) {
	  return function stopHandler(e) {
	    e.stopPropagation();
	    return handler.call(this, e);
	  };
	}

	function preventFilter(handler) {
	  return function preventHandler(e) {
	    e.preventDefault();
	    return handler.call(this, e);
	  };
	}

	function selfFilter(handler) {
	  return function selfHandler(e) {
	    if (e.target === e.currentTarget) {
	      return handler.call(this, e);
	    }
	  };
	}

	var on$1 = {

	  priority: ON,
	  acceptStatement: true,
	  keyCodes: keyCodes,

	  bind: function bind() {
	    // deal with iframes
	    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
	      var self = this;
	      this.iframeBind = function () {
	        on(self.el.contentWindow, self.arg, self.handler, self.modifiers.capture);
	      };
	      this.on('load', this.iframeBind);
	    }
	  },

	  update: function update(handler) {
	    // stub a noop for v-on with no value,
	    // e.g. @mousedown.prevent
	    if (!this.descriptor.raw) {
	      handler = function () {};
	    }

	    if (typeof handler !== 'function') {
	      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler, this.vm);
	      return;
	    }

	    // apply modifiers
	    if (this.modifiers.stop) {
	      handler = stopFilter(handler);
	    }
	    if (this.modifiers.prevent) {
	      handler = preventFilter(handler);
	    }
	    if (this.modifiers.self) {
	      handler = selfFilter(handler);
	    }
	    // key filter
	    var keys = Object.keys(this.modifiers).filter(function (key) {
	      return key !== 'stop' && key !== 'prevent' && key !== 'self' && key !== 'capture';
	    });
	    if (keys.length) {
	      handler = keyFilter(handler, keys);
	    }

	    this.reset();
	    this.handler = handler;

	    if (this.iframeBind) {
	      this.iframeBind();
	    } else {
	      on(this.el, this.arg, this.handler, this.modifiers.capture);
	    }
	  },

	  reset: function reset() {
	    var el = this.iframeBind ? this.el.contentWindow : this.el;
	    if (this.handler) {
	      off(el, this.arg, this.handler);
	    }
	  },

	  unbind: function unbind() {
	    this.reset();
	  }
	};

	var prefixes = ['-webkit-', '-moz-', '-ms-'];
	var camelPrefixes = ['Webkit', 'Moz', 'ms'];
	var importantRE = /!important;?$/;
	var propCache = Object.create(null);

	var testEl = null;

	var style = {

	  deep: true,

	  update: function update(value) {
	    if (typeof value === 'string') {
	      this.el.style.cssText = value;
	    } else if (isArray(value)) {
	      this.handleObject(value.reduce(extend, {}));
	    } else {
	      this.handleObject(value || {});
	    }
	  },

	  handleObject: function handleObject(value) {
	    // cache object styles so that only changed props
	    // are actually updated.
	    var cache = this.cache || (this.cache = {});
	    var name, val;
	    for (name in cache) {
	      if (!(name in value)) {
	        this.handleSingle(name, null);
	        delete cache[name];
	      }
	    }
	    for (name in value) {
	      val = value[name];
	      if (val !== cache[name]) {
	        cache[name] = val;
	        this.handleSingle(name, val);
	      }
	    }
	  },

	  handleSingle: function handleSingle(prop, value) {
	    prop = normalize(prop);
	    if (!prop) return; // unsupported prop
	    // cast possible numbers/booleans into strings
	    if (value != null) value += '';
	    if (value) {
	      var isImportant = importantRE.test(value) ? 'important' : '';
	      if (isImportant) {
	        /* istanbul ignore if */
	        if (process.env.NODE_ENV !== 'production') {
	          warn('It\'s probably a bad idea to use !important with inline rules. ' + 'This feature will be deprecated in a future version of Vue.');
	        }
	        value = value.replace(importantRE, '').trim();
	        this.el.style.setProperty(prop.kebab, value, isImportant);
	      } else {
	        this.el.style[prop.camel] = value;
	      }
	    } else {
	      this.el.style[prop.camel] = '';
	    }
	  }

	};

	/**
	 * Normalize a CSS property name.
	 * - cache result
	 * - auto prefix
	 * - camelCase -> dash-case
	 *
	 * @param {String} prop
	 * @return {String}
	 */

	function normalize(prop) {
	  if (propCache[prop]) {
	    return propCache[prop];
	  }
	  var res = prefix(prop);
	  propCache[prop] = propCache[res] = res;
	  return res;
	}

	/**
	 * Auto detect the appropriate prefix for a CSS property.
	 * https://gist.github.com/paulirish/523692
	 *
	 * @param {String} prop
	 * @return {String}
	 */

	function prefix(prop) {
	  prop = hyphenate(prop);
	  var camel = camelize(prop);
	  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
	  if (!testEl) {
	    testEl = document.createElement('div');
	  }
	  var i = prefixes.length;
	  var prefixed;
	  if (camel !== 'filter' && camel in testEl.style) {
	    return {
	      kebab: prop,
	      camel: camel
	    };
	  }
	  while (i--) {
	    prefixed = camelPrefixes[i] + upper;
	    if (prefixed in testEl.style) {
	      return {
	        kebab: prefixes[i] + prop,
	        camel: prefixed
	      };
	    }
	  }
	}

	// xlink
	var xlinkNS = 'http://www.w3.org/1999/xlink';
	var xlinkRE = /^xlink:/;

	// check for attributes that prohibit interpolations
	var disallowedInterpAttrRE = /^v-|^:|^@|^(?:is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;
	// these attributes should also set their corresponding properties
	// because they only affect the initial state of the element
	var attrWithPropsRE = /^(?:value|checked|selected|muted)$/;
	// these attributes expect enumrated values of "true" or "false"
	// but are not boolean attributes
	var enumeratedAttrRE = /^(?:draggable|contenteditable|spellcheck)$/;

	// these attributes should set a hidden property for
	// binding v-model to object values
	var modelProps = {
	  value: '_value',
	  'true-value': '_trueValue',
	  'false-value': '_falseValue'
	};

	var bind$1 = {

	  priority: BIND,

	  bind: function bind() {
	    var attr = this.arg;
	    var tag = this.el.tagName;
	    // should be deep watch on object mode
	    if (!attr) {
	      this.deep = true;
	    }
	    // handle interpolation bindings
	    var descriptor = this.descriptor;
	    var tokens = descriptor.interp;
	    if (tokens) {
	      // handle interpolations with one-time tokens
	      if (descriptor.hasOneTime) {
	        this.expression = tokensToExp(tokens, this._scope || this.vm);
	      }

	      // only allow binding on native attributes
	      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
	        process.env.NODE_ENV !== 'production' && warn(attr + '="' + descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.', this.vm);
	        this.el.removeAttribute(attr);
	        this.invalid = true;
	      }

	      /* istanbul ignore if */
	      if (process.env.NODE_ENV !== 'production') {
	        var raw = attr + '="' + descriptor.raw + '": ';
	        // warn src
	        if (attr === 'src') {
	          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.', this.vm);
	        }

	        // warn style
	        if (attr === 'style') {
	          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.', this.vm);
	        }
	      }
	    }
	  },

	  update: function update(value) {
	    if (this.invalid) {
	      return;
	    }
	    var attr = this.arg;
	    if (this.arg) {
	      this.handleSingle(attr, value);
	    } else {
	      this.handleObject(value || {});
	    }
	  },

	  // share object handler with v-bind:class
	  handleObject: style.handleObject,

	  handleSingle: function handleSingle(attr, value) {
	    var el = this.el;
	    var interp = this.descriptor.interp;
	    if (this.modifiers.camel) {
	      attr = camelize(attr);
	    }
	    if (!interp && attrWithPropsRE.test(attr) && attr in el) {
	      var attrValue = attr === 'value' ? value == null // IE9 will set input.value to "null" for null...
	      ? '' : value : value;

	      if (el[attr] !== attrValue) {
	        el[attr] = attrValue;
	      }
	    }
	    // set model props
	    var modelProp = modelProps[attr];
	    if (!interp && modelProp) {
	      el[modelProp] = value;
	      // update v-model if present
	      var model = el.__v_model;
	      if (model) {
	        model.listener();
	      }
	    }
	    // do not set value attribute for textarea
	    if (attr === 'value' && el.tagName === 'TEXTAREA') {
	      el.removeAttribute(attr);
	      return;
	    }
	    // update attribute
	    if (enumeratedAttrRE.test(attr)) {
	      el.setAttribute(attr, value ? 'true' : 'false');
	    } else if (value != null && value !== false) {
	      if (attr === 'class') {
	        // handle edge case #1960:
	        // class interpolation should not overwrite Vue transition class
	        if (el.__v_trans) {
	          value += ' ' + el.__v_trans.id + '-transition';
	        }
	        setClass(el, value);
	      } else if (xlinkRE.test(attr)) {
	        el.setAttributeNS(xlinkNS, attr, value === true ? '' : value);
	      } else {
	        el.setAttribute(attr, value === true ? '' : value);
	      }
	    } else {
	      el.removeAttribute(attr);
	    }
	  }
	};

	var el = {

	  priority: EL,

	  bind: function bind() {
	    /* istanbul ignore if */
	    if (!this.arg) {
	      return;
	    }
	    var id = this.id = camelize(this.arg);
	    var refs = (this._scope || this.vm).$els;
	    if (hasOwn(refs, id)) {
	      refs[id] = this.el;
	    } else {
	      defineReactive(refs, id, this.el);
	    }
	  },

	  unbind: function unbind() {
	    var refs = (this._scope || this.vm).$els;
	    if (refs[this.id] === this.el) {
	      refs[this.id] = null;
	    }
	  }
	};

	var ref = {
	  bind: function bind() {
	    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.', this.vm);
	  }
	};

	var cloak = {
	  bind: function bind() {
	    var el = this.el;
	    this.vm.$once('pre-hook:compiled', function () {
	      el.removeAttribute('v-cloak');
	    });
	  }
	};

	// must export plain object
	var directives = {
	  text: text$1,
	  html: html,
	  'for': vFor,
	  'if': vIf,
	  show: show,
	  model: model,
	  on: on$1,
	  bind: bind$1,
	  el: el,
	  ref: ref,
	  cloak: cloak
	};

	var vClass = {

	  deep: true,

	  update: function update(value) {
	    if (!value) {
	      this.cleanup();
	    } else if (typeof value === 'string') {
	      this.setClass(value.trim().split(/\s+/));
	    } else {
	      this.setClass(normalize$1(value));
	    }
	  },

	  setClass: function setClass(value) {
	    this.cleanup(value);
	    for (var i = 0, l = value.length; i < l; i++) {
	      var val = value[i];
	      if (val) {
	        apply(this.el, val, addClass);
	      }
	    }
	    this.prevKeys = value;
	  },

	  cleanup: function cleanup(value) {
	    var prevKeys = this.prevKeys;
	    if (!prevKeys) return;
	    var i = prevKeys.length;
	    while (i--) {
	      var key = prevKeys[i];
	      if (!value || value.indexOf(key) < 0) {
	        apply(this.el, key, removeClass);
	      }
	    }
	  }
	};

	/**
	 * Normalize objects and arrays (potentially containing objects)
	 * into array of strings.
	 *
	 * @param {Object|Array<String|Object>} value
	 * @return {Array<String>}
	 */

	function normalize$1(value) {
	  var res = [];
	  if (isArray(value)) {
	    for (var i = 0, l = value.length; i < l; i++) {
	      var _key = value[i];
	      if (_key) {
	        if (typeof _key === 'string') {
	          res.push(_key);
	        } else {
	          for (var k in _key) {
	            if (_key[k]) res.push(k);
	          }
	        }
	      }
	    }
	  } else if (isObject(value)) {
	    for (var key in value) {
	      if (value[key]) res.push(key);
	    }
	  }
	  return res;
	}

	/**
	 * Add or remove a class/classes on an element
	 *
	 * @param {Element} el
	 * @param {String} key The class name. This may or may not
	 *                     contain a space character, in such a
	 *                     case we'll deal with multiple class
	 *                     names at once.
	 * @param {Function} fn
	 */

	function apply(el, key, fn) {
	  key = key.trim();
	  if (key.indexOf(' ') === -1) {
	    fn(el, key);
	    return;
	  }
	  // The key contains one or more space characters.
	  // Since a class name doesn't accept such characters, we
	  // treat it as multiple classes.
	  var keys = key.split(/\s+/);
	  for (var i = 0, l = keys.length; i < l; i++) {
	    fn(el, keys[i]);
	  }
	}

	var component = {

	  priority: COMPONENT,

	  params: ['keep-alive', 'transition-mode', 'inline-template'],

	  /**
	   * Setup. Two possible usages:
	   *
	   * - static:
	   *   <comp> or <div v-component="comp">
	   *
	   * - dynamic:
	   *   <component :is="view">
	   */

	  bind: function bind() {
	    if (!this.el.__vue__) {
	      // keep-alive cache
	      this.keepAlive = this.params.keepAlive;
	      if (this.keepAlive) {
	        this.cache = {};
	      }
	      // check inline-template
	      if (this.params.inlineTemplate) {
	        // extract inline template as a DocumentFragment
	        this.inlineTemplate = extractContent(this.el, true);
	      }
	      // component resolution related state
	      this.pendingComponentCb = this.Component = null;
	      // transition related state
	      this.pendingRemovals = 0;
	      this.pendingRemovalCb = null;
	      // create a ref anchor
	      this.anchor = createAnchor('v-component');
	      replace(this.el, this.anchor);
	      // remove is attribute.
	      // this is removed during compilation, but because compilation is
	      // cached, when the component is used elsewhere this attribute
	      // will remain at link time.
	      this.el.removeAttribute('is');
	      this.el.removeAttribute(':is');
	      // remove ref, same as above
	      if (this.descriptor.ref) {
	        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
	      }
	      // if static, build right now.
	      if (this.literal) {
	        this.setComponent(this.expression);
	      }
	    } else {
	      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
	    }
	  },

	  /**
	   * Public update, called by the watcher in the dynamic
	   * literal scenario, e.g. <component :is="view">
	   */

	  update: function update(value) {
	    if (!this.literal) {
	      this.setComponent(value);
	    }
	  },

	  /**
	   * Switch dynamic components. May resolve the component
	   * asynchronously, and perform transition based on
	   * specified transition mode. Accepts a few additional
	   * arguments specifically for vue-router.
	   *
	   * The callback is called when the full transition is
	   * finished.
	   *
	   * @param {String} value
	   * @param {Function} [cb]
	   */

	  setComponent: function setComponent(value, cb) {
	    this.invalidatePending();
	    if (!value) {
	      // just remove current
	      this.unbuild(true);
	      this.remove(this.childVM, cb);
	      this.childVM = null;
	    } else {
	      var self = this;
	      this.resolveComponent(value, function () {
	        self.mountComponent(cb);
	      });
	    }
	  },

	  /**
	   * Resolve the component constructor to use when creating
	   * the child vm.
	   *
	   * @param {String|Function} value
	   * @param {Function} cb
	   */

	  resolveComponent: function resolveComponent(value, cb) {
	    var self = this;
	    this.pendingComponentCb = cancellable(function (Component) {
	      self.ComponentName = Component.options.name || (typeof value === 'string' ? value : null);
	      self.Component = Component;
	      cb();
	    });
	    this.vm._resolveComponent(value, this.pendingComponentCb);
	  },

	  /**
	   * Create a new instance using the current constructor and
	   * replace the existing instance. This method doesn't care
	   * whether the new component and the old one are actually
	   * the same.
	   *
	   * @param {Function} [cb]
	   */

	  mountComponent: function mountComponent(cb) {
	    // actual mount
	    this.unbuild(true);
	    var self = this;
	    var activateHooks = this.Component.options.activate;
	    var cached = this.getCached();
	    var newComponent = this.build();
	    if (activateHooks && !cached) {
	      this.waitingFor = newComponent;
	      callActivateHooks(activateHooks, newComponent, function () {
	        if (self.waitingFor !== newComponent) {
	          return;
	        }
	        self.waitingFor = null;
	        self.transition(newComponent, cb);
	      });
	    } else {
	      // update ref for kept-alive component
	      if (cached) {
	        newComponent._updateRef();
	      }
	      this.transition(newComponent, cb);
	    }
	  },

	  /**
	   * When the component changes or unbinds before an async
	   * constructor is resolved, we need to invalidate its
	   * pending callback.
	   */

	  invalidatePending: function invalidatePending() {
	    if (this.pendingComponentCb) {
	      this.pendingComponentCb.cancel();
	      this.pendingComponentCb = null;
	    }
	  },

	  /**
	   * Instantiate/insert a new child vm.
	   * If keep alive and has cached instance, insert that
	   * instance; otherwise build a new one and cache it.
	   *
	   * @param {Object} [extraOptions]
	   * @return {Vue} - the created instance
	   */

	  build: function build(extraOptions) {
	    var cached = this.getCached();
	    if (cached) {
	      return cached;
	    }
	    if (this.Component) {
	      // default options
	      var options = {
	        name: this.ComponentName,
	        el: cloneNode(this.el),
	        template: this.inlineTemplate,
	        // make sure to add the child with correct parent
	        // if this is a transcluded component, its parent
	        // should be the transclusion host.
	        parent: this._host || this.vm,
	        // if no inline-template, then the compiled
	        // linker can be cached for better performance.
	        _linkerCachable: !this.inlineTemplate,
	        _ref: this.descriptor.ref,
	        _asComponent: true,
	        _isRouterView: this._isRouterView,
	        // if this is a transcluded component, context
	        // will be the common parent vm of this instance
	        // and its host.
	        _context: this.vm,
	        // if this is inside an inline v-for, the scope
	        // will be the intermediate scope created for this
	        // repeat fragment. this is used for linking props
	        // and container directives.
	        _scope: this._scope,
	        // pass in the owner fragment of this component.
	        // this is necessary so that the fragment can keep
	        // track of its contained components in order to
	        // call attach/detach hooks for them.
	        _frag: this._frag
	      };
	      // extra options
	      // in 1.0.0 this is used by vue-router only
	      /* istanbul ignore if */
	      if (extraOptions) {
	        extend(options, extraOptions);
	      }
	      var child = new this.Component(options);
	      if (this.keepAlive) {
	        this.cache[this.Component.cid] = child;
	      }
	      /* istanbul ignore if */
	      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
	        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template, child);
	      }
	      return child;
	    }
	  },

	  /**
	   * Try to get a cached instance of the current component.
	   *
	   * @return {Vue|undefined}
	   */

	  getCached: function getCached() {
	    return this.keepAlive && this.cache[this.Component.cid];
	  },

	  /**
	   * Teardown the current child, but defers cleanup so
	   * that we can separate the destroy and removal steps.
	   *
	   * @param {Boolean} defer
	   */

	  unbuild: function unbuild(defer) {
	    if (this.waitingFor) {
	      if (!this.keepAlive) {
	        this.waitingFor.$destroy();
	      }
	      this.waitingFor = null;
	    }
	    var child = this.childVM;
	    if (!child || this.keepAlive) {
	      if (child) {
	        // remove ref
	        child._inactive = true;
	        child._updateRef(true);
	      }
	      return;
	    }
	    // the sole purpose of `deferCleanup` is so that we can
	    // "deactivate" the vm right now and perform DOM removal
	    // later.
	    child.$destroy(false, defer);
	  },

	  /**
	   * Remove current destroyed child and manually do
	   * the cleanup after removal.
	   *
	   * @param {Function} cb
	   */

	  remove: function remove(child, cb) {
	    var keepAlive = this.keepAlive;
	    if (child) {
	      // we may have a component switch when a previous
	      // component is still being transitioned out.
	      // we want to trigger only one lastest insertion cb
	      // when the existing transition finishes. (#1119)
	      this.pendingRemovals++;
	      this.pendingRemovalCb = cb;
	      var self = this;
	      child.$remove(function () {
	        self.pendingRemovals--;
	        if (!keepAlive) child._cleanup();
	        if (!self.pendingRemovals && self.pendingRemovalCb) {
	          self.pendingRemovalCb();
	          self.pendingRemovalCb = null;
	        }
	      });
	    } else if (cb) {
	      cb();
	    }
	  },

	  /**
	   * Actually swap the components, depending on the
	   * transition mode. Defaults to simultaneous.
	   *
	   * @param {Vue} target
	   * @param {Function} [cb]
	   */

	  transition: function transition(target, cb) {
	    var self = this;
	    var current = this.childVM;
	    // for devtool inspection
	    if (current) current._inactive = true;
	    target._inactive = false;
	    this.childVM = target;
	    switch (self.params.transitionMode) {
	      case 'in-out':
	        target.$before(self.anchor, function () {
	          self.remove(current, cb);
	        });
	        break;
	      case 'out-in':
	        self.remove(current, function () {
	          target.$before(self.anchor, cb);
	        });
	        break;
	      default:
	        self.remove(current);
	        target.$before(self.anchor, cb);
	    }
	  },

	  /**
	   * Unbind.
	   */

	  unbind: function unbind() {
	    this.invalidatePending();
	    // Do not defer cleanup when unbinding
	    this.unbuild();
	    // destroy all keep-alive cached instances
	    if (this.cache) {
	      for (var key in this.cache) {
	        this.cache[key].$destroy();
	      }
	      this.cache = null;
	    }
	  }
	};

	/**
	 * Call activate hooks in order (asynchronous)
	 *
	 * @param {Array} hooks
	 * @param {Vue} vm
	 * @param {Function} cb
	 */

	function callActivateHooks(hooks, vm, cb) {
	  var total = hooks.length;
	  var called = 0;
	  hooks[0].call(vm, next);
	  function next() {
	    if (++called >= total) {
	      cb();
	    } else {
	      hooks[called].call(vm, next);
	    }
	  }
	}

	var propBindingModes = config._propBindingModes;
	var empty = {};

	// regexes
	var identRE$1 = /^[$_a-zA-Z]+[\w$]*$/;
	var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

	/**
	 * Compile props on a root element and return
	 * a props link function.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Array} propOptions
	 * @param {Vue} vm
	 * @return {Function} propsLinkFn
	 */

	function compileProps(el, propOptions, vm) {
	  var props = [];
	  var names = Object.keys(propOptions);
	  var i = names.length;
	  var options, name, attr, value, path, parsed, prop;
	  while (i--) {
	    name = names[i];
	    options = propOptions[name] || empty;

	    if (process.env.NODE_ENV !== 'production' && name === '$data') {
	      warn('Do not use $data as prop.', vm);
	      continue;
	    }

	    // props could contain dashes, which will be
	    // interpreted as minus calculations by the parser
	    // so we need to camelize the path here
	    path = camelize(name);
	    if (!identRE$1.test(path)) {
	      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.', vm);
	      continue;
	    }

	    prop = {
	      name: name,
	      path: path,
	      options: options,
	      mode: propBindingModes.ONE_WAY,
	      raw: null
	    };

	    attr = hyphenate(name);
	    // first check dynamic version
	    if ((value = getBindAttr(el, attr)) === null) {
	      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
	        prop.mode = propBindingModes.TWO_WAY;
	      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
	        prop.mode = propBindingModes.ONE_TIME;
	      }
	    }
	    if (value !== null) {
	      // has dynamic binding!
	      prop.raw = value;
	      parsed = parseDirective(value);
	      value = parsed.expression;
	      prop.filters = parsed.filters;
	      // check binding type
	      if (isLiteral(value) && !parsed.filters) {
	        // for expressions containing literal numbers and
	        // booleans, there's no need to setup a prop binding,
	        // so we can optimize them as a one-time set.
	        prop.optimizedLiteral = true;
	      } else {
	        prop.dynamic = true;
	        // check non-settable path for two-way bindings
	        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
	          prop.mode = propBindingModes.ONE_WAY;
	          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value, vm);
	        }
	      }
	      prop.parentPath = value;

	      // warn required two-way
	      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
	        warn('Prop "' + name + '" expects a two-way binding type.', vm);
	      }
	    } else if ((value = getAttr(el, attr)) !== null) {
	      // has literal binding!
	      prop.raw = value;
	    } else if (process.env.NODE_ENV !== 'production') {
	      // check possible camelCase prop usage
	      var lowerCaseName = path.toLowerCase();
	      value = /[A-Z\-]/.test(name) && (el.getAttribute(lowerCaseName) || el.getAttribute(':' + lowerCaseName) || el.getAttribute('v-bind:' + lowerCaseName) || el.getAttribute(':' + lowerCaseName + '.once') || el.getAttribute('v-bind:' + lowerCaseName + '.once') || el.getAttribute(':' + lowerCaseName + '.sync') || el.getAttribute('v-bind:' + lowerCaseName + '.sync'));
	      if (value) {
	        warn('Possible usage error for prop `' + lowerCaseName + '` - ' + 'did you mean `' + attr + '`? HTML is case-insensitive, remember to use ' + 'kebab-case for props in templates.', vm);
	      } else if (options.required) {
	        // warn missing required
	        warn('Missing required prop: ' + name, vm);
	      }
	    }
	    // push prop
	    props.push(prop);
	  }
	  return makePropsLinkFn(props);
	}

	/**
	 * Build a function that applies props to a vm.
	 *
	 * @param {Array} props
	 * @return {Function} propsLinkFn
	 */

	function makePropsLinkFn(props) {
	  return function propsLinkFn(vm, scope) {
	    // store resolved props info
	    vm._props = {};
	    var inlineProps = vm.$options.propsData;
	    var i = props.length;
	    var prop, path, options, value, raw;
	    while (i--) {
	      prop = props[i];
	      raw = prop.raw;
	      path = prop.path;
	      options = prop.options;
	      vm._props[path] = prop;
	      if (inlineProps && hasOwn(inlineProps, path)) {
	        initProp(vm, prop, inlineProps[path]);
	      }if (raw === null) {
	        // initialize absent prop
	        initProp(vm, prop, undefined);
	      } else if (prop.dynamic) {
	        // dynamic prop
	        if (prop.mode === propBindingModes.ONE_TIME) {
	          // one time binding
	          value = (scope || vm._context || vm).$get(prop.parentPath);
	          initProp(vm, prop, value);
	        } else {
	          if (vm._context) {
	            // dynamic binding
	            vm._bindDir({
	              name: 'prop',
	              def: propDef,
	              prop: prop
	            }, null, null, scope); // el, host, scope
	          } else {
	              // root instance
	              initProp(vm, prop, vm.$get(prop.parentPath));
	            }
	        }
	      } else if (prop.optimizedLiteral) {
	        // optimized literal, cast it and just set once
	        var stripped = stripQuotes(raw);
	        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
	        initProp(vm, prop, value);
	      } else {
	        // string literal, but we need to cater for
	        // Boolean props with no value, or with same
	        // literal value (e.g. disabled="disabled")
	        // see https://github.com/vuejs/vue-loader/issues/182
	        value = options.type === Boolean && (raw === '' || raw === hyphenate(prop.name)) ? true : raw;
	        initProp(vm, prop, value);
	      }
	    }
	  };
	}

	/**
	 * Process a prop with a rawValue, applying necessary coersions,
	 * default values & assertions and call the given callback with
	 * processed value.
	 *
	 * @param {Vue} vm
	 * @param {Object} prop
	 * @param {*} rawValue
	 * @param {Function} fn
	 */

	function processPropValue(vm, prop, rawValue, fn) {
	  var isSimple = prop.dynamic && isSimplePath(prop.parentPath);
	  var value = rawValue;
	  if (value === undefined) {
	    value = getPropDefaultValue(vm, prop);
	  }
	  value = coerceProp(prop, value, vm);
	  var coerced = value !== rawValue;
	  if (!assertProp(prop, value, vm)) {
	    value = undefined;
	  }
	  if (isSimple && !coerced) {
	    withoutConversion(function () {
	      fn(value);
	    });
	  } else {
	    fn(value);
	  }
	}

	/**
	 * Set a prop's initial value on a vm and its data object.
	 *
	 * @param {Vue} vm
	 * @param {Object} prop
	 * @param {*} value
	 */

	function initProp(vm, prop, value) {
	  processPropValue(vm, prop, value, function (value) {
	    defineReactive(vm, prop.path, value);
	  });
	}

	/**
	 * Update a prop's value on a vm.
	 *
	 * @param {Vue} vm
	 * @param {Object} prop
	 * @param {*} value
	 */

	function updateProp(vm, prop, value) {
	  processPropValue(vm, prop, value, function (value) {
	    vm[prop.path] = value;
	  });
	}

	/**
	 * Get the default value of a prop.
	 *
	 * @param {Vue} vm
	 * @param {Object} prop
	 * @return {*}
	 */

	function getPropDefaultValue(vm, prop) {
	  // no default, return undefined
	  var options = prop.options;
	  if (!hasOwn(options, 'default')) {
	    // absent boolean value defaults to false
	    return options.type === Boolean ? false : undefined;
	  }
	  var def = options['default'];
	  // warn against non-factory defaults for Object & Array
	  if (isObject(def)) {
	    process.env.NODE_ENV !== 'production' && warn('Invalid default value for prop "' + prop.name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
	  }
	  // call factory function for non-Function types
	  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
	}

	/**
	 * Assert whether a prop is valid.
	 *
	 * @param {Object} prop
	 * @param {*} value
	 * @param {Vue} vm
	 */

	function assertProp(prop, value, vm) {
	  if (!prop.options.required && ( // non-required
	  prop.raw === null || // abscent
	  value == null) // null or undefined
	  ) {
	      return true;
	    }
	  var options = prop.options;
	  var type = options.type;
	  var valid = !type;
	  var expectedTypes = [];
	  if (type) {
	    if (!isArray(type)) {
	      type = [type];
	    }
	    for (var i = 0; i < type.length && !valid; i++) {
	      var assertedType = assertType(value, type[i]);
	      expectedTypes.push(assertedType.expectedType);
	      valid = assertedType.valid;
	    }
	  }
	  if (!valid) {
	    if (process.env.NODE_ENV !== 'production') {
	      warn('Invalid prop: type check failed for prop "' + prop.name + '".' + ' Expected ' + expectedTypes.map(formatType).join(', ') + ', got ' + formatValue(value) + '.', vm);
	    }
	    return false;
	  }
	  var validator = options.validator;
	  if (validator) {
	    if (!validator(value)) {
	      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for prop "' + prop.name + '".', vm);
	      return false;
	    }
	  }
	  return true;
	}

	/**
	 * Force parsing value with coerce option.
	 *
	 * @param {*} value
	 * @param {Object} options
	 * @return {*}
	 */

	function coerceProp(prop, value, vm) {
	  var coerce = prop.options.coerce;
	  if (!coerce) {
	    return value;
	  }
	  if (typeof coerce === 'function') {
	    return coerce(value);
	  } else {
	    process.env.NODE_ENV !== 'production' && warn('Invalid coerce for prop "' + prop.name + '": expected function, got ' + typeof coerce + '.', vm);
	    return value;
	  }
	}

	/**
	 * Assert the type of a value
	 *
	 * @param {*} value
	 * @param {Function} type
	 * @return {Object}
	 */

	function assertType(value, type) {
	  var valid;
	  var expectedType;
	  if (type === String) {
	    expectedType = 'string';
	    valid = typeof value === expectedType;
	  } else if (type === Number) {
	    expectedType = 'number';
	    valid = typeof value === expectedType;
	  } else if (type === Boolean) {
	    expectedType = 'boolean';
	    valid = typeof value === expectedType;
	  } else if (type === Function) {
	    expectedType = 'function';
	    valid = typeof value === expectedType;
	  } else if (type === Object) {
	    expectedType = 'object';
	    valid = isPlainObject(value);
	  } else if (type === Array) {
	    expectedType = 'array';
	    valid = isArray(value);
	  } else {
	    valid = value instanceof type;
	  }
	  return {
	    valid: valid,
	    expectedType: expectedType
	  };
	}

	/**
	 * Format type for output
	 *
	 * @param {String} type
	 * @return {String}
	 */

	function formatType(type) {
	  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
	}

	/**
	 * Format value
	 *
	 * @param {*} value
	 * @return {String}
	 */

	function formatValue(val) {
	  return Object.prototype.toString.call(val).slice(8, -1);
	}

	var bindingModes = config._propBindingModes;

	var propDef = {

	  bind: function bind() {
	    var child = this.vm;
	    var parent = child._context;
	    // passed in from compiler directly
	    var prop = this.descriptor.prop;
	    var childKey = prop.path;
	    var parentKey = prop.parentPath;
	    var twoWay = prop.mode === bindingModes.TWO_WAY;

	    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
	      updateProp(child, prop, val);
	    }, {
	      twoWay: twoWay,
	      filters: prop.filters,
	      // important: props need to be observed on the
	      // v-for scope if present
	      scope: this._scope
	    });

	    // set the child initial value.
	    initProp(child, prop, parentWatcher.value);

	    // setup two-way binding
	    if (twoWay) {
	      // important: defer the child watcher creation until
	      // the created hook (after data observation)
	      var self = this;
	      child.$once('pre-hook:created', function () {
	        self.childWatcher = new Watcher(child, childKey, function (val) {
	          parentWatcher.set(val);
	        }, {
	          // ensure sync upward before parent sync down.
	          // this is necessary in cases e.g. the child
	          // mutates a prop array, then replaces it. (#1683)
	          sync: true
	        });
	      });
	    }
	  },

	  unbind: function unbind() {
	    this.parentWatcher.teardown();
	    if (this.childWatcher) {
	      this.childWatcher.teardown();
	    }
	  }
	};

	var queue$1 = [];
	var queued = false;

	/**
	 * Push a job into the queue.
	 *
	 * @param {Function} job
	 */

	function pushJob(job) {
	  queue$1.push(job);
	  if (!queued) {
	    queued = true;
	    nextTick(flush);
	  }
	}

	/**
	 * Flush the queue, and do one forced reflow before
	 * triggering transitions.
	 */

	function flush() {
	  // Force layout
	  var f = document.documentElement.offsetHeight;
	  for (var i = 0; i < queue$1.length; i++) {
	    queue$1[i]();
	  }
	  queue$1 = [];
	  queued = false;
	  // dummy return, so js linters don't complain about
	  // unused variable f
	  return f;
	}

	var TYPE_TRANSITION = 'transition';
	var TYPE_ANIMATION = 'animation';
	var transDurationProp = transitionProp + 'Duration';
	var animDurationProp = animationProp + 'Duration';

	/**
	 * If a just-entered element is applied the
	 * leave class while its enter transition hasn't started yet,
	 * and the transitioned property has the same value for both
	 * enter/leave, then the leave transition will be skipped and
	 * the transitionend event never fires. This function ensures
	 * its callback to be called after a transition has started
	 * by waiting for double raf.
	 *
	 * It falls back to setTimeout on devices that support CSS
	 * transitions but not raf (e.g. Android 4.2 browser) - since
	 * these environments are usually slow, we are giving it a
	 * relatively large timeout.
	 */

	var raf = inBrowser && window.requestAnimationFrame;
	var waitForTransitionStart = raf
	/* istanbul ignore next */
	? function (fn) {
	  raf(function () {
	    raf(fn);
	  });
	} : function (fn) {
	  setTimeout(fn, 50);
	};

	/**
	 * A Transition object that encapsulates the state and logic
	 * of the transition.
	 *
	 * @param {Element} el
	 * @param {String} id
	 * @param {Object} hooks
	 * @param {Vue} vm
	 */
	function Transition(el, id, hooks, vm) {
	  this.id = id;
	  this.el = el;
	  this.enterClass = hooks && hooks.enterClass || id + '-enter';
	  this.leaveClass = hooks && hooks.leaveClass || id + '-leave';
	  this.hooks = hooks;
	  this.vm = vm;
	  // async state
	  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
	  this.justEntered = false;
	  this.entered = this.left = false;
	  this.typeCache = {};
	  // check css transition type
	  this.type = hooks && hooks.type;
	  /* istanbul ignore if */
	  if (process.env.NODE_ENV !== 'production') {
	    if (this.type && this.type !== TYPE_TRANSITION && this.type !== TYPE_ANIMATION) {
	      warn('invalid CSS transition type for transition="' + this.id + '": ' + this.type, vm);
	    }
	  }
	  // bind
	  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
	    self[m] = bind(self[m], self);
	  });
	}

	var p$1 = Transition.prototype;

	/**
	 * Start an entering transition.
	 *
	 * 1. enter transition triggered
	 * 2. call beforeEnter hook
	 * 3. add enter class
	 * 4. insert/show element
	 * 5. call enter hook (with possible explicit js callback)
	 * 6. reflow
	 * 7. based on transition type:
	 *    - transition:
	 *        remove class now, wait for transitionend,
	 *        then done if there's no explicit js callback.
	 *    - animation:
	 *        wait for animationend, remove class,
	 *        then done if there's no explicit js callback.
	 *    - no css transition:
	 *        done now if there's no explicit js callback.
	 * 8. wait for either done or js callback, then call
	 *    afterEnter hook.
	 *
	 * @param {Function} op - insert/show the element
	 * @param {Function} [cb]
	 */

	p$1.enter = function (op, cb) {
	  this.cancelPending();
	  this.callHook('beforeEnter');
	  this.cb = cb;
	  addClass(this.el, this.enterClass);
	  op();
	  this.entered = false;
	  this.callHookWithCb('enter');
	  if (this.entered) {
	    return; // user called done synchronously.
	  }
	  this.cancel = this.hooks && this.hooks.enterCancelled;
	  pushJob(this.enterNextTick);
	};

	/**
	 * The "nextTick" phase of an entering transition, which is
	 * to be pushed into a queue and executed after a reflow so
	 * that removing the class can trigger a CSS transition.
	 */

	p$1.enterNextTick = function () {
	  var _this = this;

	  // prevent transition skipping
	  this.justEntered = true;
	  waitForTransitionStart(function () {
	    _this.justEntered = false;
	  });
	  var enterDone = this.enterDone;
	  var type = this.getCssTransitionType(this.enterClass);
	  if (!this.pendingJsCb) {
	    if (type === TYPE_TRANSITION) {
	      // trigger transition by removing enter class now
	      removeClass(this.el, this.enterClass);
	      this.setupCssCb(transitionEndEvent, enterDone);
	    } else if (type === TYPE_ANIMATION) {
	      this.setupCssCb(animationEndEvent, enterDone);
	    } else {
	      enterDone();
	    }
	  } else if (type === TYPE_TRANSITION) {
	    removeClass(this.el, this.enterClass);
	  }
	};

	/**
	 * The "cleanup" phase of an entering transition.
	 */

	p$1.enterDone = function () {
	  this.entered = true;
	  this.cancel = this.pendingJsCb = null;
	  removeClass(this.el, this.enterClass);
	  this.callHook('afterEnter');
	  if (this.cb) this.cb();
	};

	/**
	 * Start a leaving transition.
	 *
	 * 1. leave transition triggered.
	 * 2. call beforeLeave hook
	 * 3. add leave class (trigger css transition)
	 * 4. call leave hook (with possible explicit js callback)
	 * 5. reflow if no explicit js callback is provided
	 * 6. based on transition type:
	 *    - transition or animation:
	 *        wait for end event, remove class, then done if
	 *        there's no explicit js callback.
	 *    - no css transition:
	 *        done if there's no explicit js callback.
	 * 7. wait for either done or js callback, then call
	 *    afterLeave hook.
	 *
	 * @param {Function} op - remove/hide the element
	 * @param {Function} [cb]
	 */

	p$1.leave = function (op, cb) {
	  this.cancelPending();
	  this.callHook('beforeLeave');
	  this.op = op;
	  this.cb = cb;
	  addClass(this.el, this.leaveClass);
	  this.left = false;
	  this.callHookWithCb('leave');
	  if (this.left) {
	    return; // user called done synchronously.
	  }
	  this.cancel = this.hooks && this.hooks.leaveCancelled;
	  // only need to handle leaveDone if
	  // 1. the transition is already done (synchronously called
	  //    by the user, which causes this.op set to null)
	  // 2. there's no explicit js callback
	  if (this.op && !this.pendingJsCb) {
	    // if a CSS transition leaves immediately after enter,
	    // the transitionend event never fires. therefore we
	    // detect such cases and end the leave immediately.
	    if (this.justEntered) {
	      this.leaveDone();
	    } else {
	      pushJob(this.leaveNextTick);
	    }
	  }
	};

	/**
	 * The "nextTick" phase of a leaving transition.
	 */

	p$1.leaveNextTick = function () {
	  var type = this.getCssTransitionType(this.leaveClass);
	  if (type) {
	    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
	    this.setupCssCb(event, this.leaveDone);
	  } else {
	    this.leaveDone();
	  }
	};

	/**
	 * The "cleanup" phase of a leaving transition.
	 */

	p$1.leaveDone = function () {
	  this.left = true;
	  this.cancel = this.pendingJsCb = null;
	  this.op();
	  removeClass(this.el, this.leaveClass);
	  this.callHook('afterLeave');
	  if (this.cb) this.cb();
	  this.op = null;
	};

	/**
	 * Cancel any pending callbacks from a previously running
	 * but not finished transition.
	 */

	p$1.cancelPending = function () {
	  this.op = this.cb = null;
	  var hasPending = false;
	  if (this.pendingCssCb) {
	    hasPending = true;
	    off(this.el, this.pendingCssEvent, this.pendingCssCb);
	    this.pendingCssEvent = this.pendingCssCb = null;
	  }
	  if (this.pendingJsCb) {
	    hasPending = true;
	    this.pendingJsCb.cancel();
	    this.pendingJsCb = null;
	  }
	  if (hasPending) {
	    removeClass(this.el, this.enterClass);
	    removeClass(this.el, this.leaveClass);
	  }
	  if (this.cancel) {
	    this.cancel.call(this.vm, this.el);
	    this.cancel = null;
	  }
	};

	/**
	 * Call a user-provided synchronous hook function.
	 *
	 * @param {String} type
	 */

	p$1.callHook = function (type) {
	  if (this.hooks && this.hooks[type]) {
	    this.hooks[type].call(this.vm, this.el);
	  }
	};

	/**
	 * Call a user-provided, potentially-async hook function.
	 * We check for the length of arguments to see if the hook
	 * expects a `done` callback. If true, the transition's end
	 * will be determined by when the user calls that callback;
	 * otherwise, the end is determined by the CSS transition or
	 * animation.
	 *
	 * @param {String} type
	 */

	p$1.callHookWithCb = function (type) {
	  var hook = this.hooks && this.hooks[type];
	  if (hook) {
	    if (hook.length > 1) {
	      this.pendingJsCb = cancellable(this[type + 'Done']);
	    }
	    hook.call(this.vm, this.el, this.pendingJsCb);
	  }
	};

	/**
	 * Get an element's transition type based on the
	 * calculated styles.
	 *
	 * @param {String} className
	 * @return {Number}
	 */

	p$1.getCssTransitionType = function (className) {
	  /* istanbul ignore if */
	  if (!transitionEndEvent ||
	  // skip CSS transitions if page is not visible -
	  // this solves the issue of transitionend events not
	  // firing until the page is visible again.
	  // pageVisibility API is supported in IE10+, same as
	  // CSS transitions.
	  document.hidden ||
	  // explicit js-only transition
	  this.hooks && this.hooks.css === false ||
	  // element is hidden
	  isHidden(this.el)) {
	    return;
	  }
	  var type = this.type || this.typeCache[className];
	  if (type) return type;
	  var inlineStyles = this.el.style;
	  var computedStyles = window.getComputedStyle(this.el);
	  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
	  if (transDuration && transDuration !== '0s') {
	    type = TYPE_TRANSITION;
	  } else {
	    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
	    if (animDuration && animDuration !== '0s') {
	      type = TYPE_ANIMATION;
	    }
	  }
	  if (type) {
	    this.typeCache[className] = type;
	  }
	  return type;
	};

	/**
	 * Setup a CSS transitionend/animationend callback.
	 *
	 * @param {String} event
	 * @param {Function} cb
	 */

	p$1.setupCssCb = function (event, cb) {
	  this.pendingCssEvent = event;
	  var self = this;
	  var el = this.el;
	  var onEnd = this.pendingCssCb = function (e) {
	    if (e.target === el) {
	      off(el, event, onEnd);
	      self.pendingCssEvent = self.pendingCssCb = null;
	      if (!self.pendingJsCb && cb) {
	        cb();
	      }
	    }
	  };
	  on(el, event, onEnd);
	};

	/**
	 * Check if an element is hidden - in that case we can just
	 * skip the transition alltogether.
	 *
	 * @param {Element} el
	 * @return {Boolean}
	 */

	function isHidden(el) {
	  if (/svg$/.test(el.namespaceURI)) {
	    // SVG elements do not have offset(Width|Height)
	    // so we need to check the client rect
	    var rect = el.getBoundingClientRect();
	    return !(rect.width || rect.height);
	  } else {
	    return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
	  }
	}

	var transition$1 = {

	  priority: TRANSITION,

	  update: function update(id, oldId) {
	    var el = this.el;
	    // resolve on owner vm
	    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
	    id = id || 'v';
	    oldId = oldId || 'v';
	    el.__v_trans = new Transition(el, id, hooks, this.vm);
	    removeClass(el, oldId + '-transition');
	    addClass(el, id + '-transition');
	  }
	};

	var internalDirectives = {
	  style: style,
	  'class': vClass,
	  component: component,
	  prop: propDef,
	  transition: transition$1
	};

	// special binding prefixes
	var bindRE = /^v-bind:|^:/;
	var onRE = /^v-on:|^@/;
	var dirAttrRE = /^v-([^:]+)(?:$|:(.*)$)/;
	var modifierRE = /\.[^\.]+/g;
	var transitionRE = /^(v-bind:|:)?transition$/;

	// default directive priority
	var DEFAULT_PRIORITY = 1000;
	var DEFAULT_TERMINAL_PRIORITY = 2000;

	/**
	 * Compile a template and return a reusable composite link
	 * function, which recursively contains more link functions
	 * inside. This top level compile function would normally
	 * be called on instance root nodes, but can also be used
	 * for partial compilation if the partial argument is true.
	 *
	 * The returned composite link function, when called, will
	 * return an unlink function that tearsdown all directives
	 * created during the linking phase.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Object} options
	 * @param {Boolean} partial
	 * @return {Function}
	 */

	function compile(el, options, partial) {
	  // link function for the node itself.
	  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
	  // link function for the childNodes
	  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && !isScript(el) && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

	  /**
	   * A composite linker function to be called on a already
	   * compiled piece of DOM, which instantiates all directive
	   * instances.
	   *
	   * @param {Vue} vm
	   * @param {Element|DocumentFragment} el
	   * @param {Vue} [host] - host vm of transcluded content
	   * @param {Object} [scope] - v-for scope
	   * @param {Fragment} [frag] - link context fragment
	   * @return {Function|undefined}
	   */

	  return function compositeLinkFn(vm, el, host, scope, frag) {
	    // cache childNodes before linking parent, fix #657
	    var childNodes = toArray(el.childNodes);
	    // link
	    var dirs = linkAndCapture(function compositeLinkCapturer() {
	      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
	      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
	    }, vm);
	    return makeUnlinkFn(vm, dirs);
	  };
	}

	/**
	 * Apply a linker to a vm/element pair and capture the
	 * directives created during the process.
	 *
	 * @param {Function} linker
	 * @param {Vue} vm
	 */

	function linkAndCapture(linker, vm) {
	  /* istanbul ignore if */
	  if (process.env.NODE_ENV === 'production') {
	    // reset directives before every capture in production
	    // mode, so that when unlinking we don't need to splice
	    // them out (which turns out to be a perf hit).
	    // they are kept in development mode because they are
	    // useful for Vue's own tests.
	    vm._directives = [];
	  }
	  var originalDirCount = vm._directives.length;
	  linker();
	  var dirs = vm._directives.slice(originalDirCount);
	  dirs.sort(directiveComparator);
	  for (var i = 0, l = dirs.length; i < l; i++) {
	    dirs[i]._bind();
	  }
	  return dirs;
	}

	/**
	 * Directive priority sort comparator
	 *
	 * @param {Object} a
	 * @param {Object} b
	 */

	function directiveComparator(a, b) {
	  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
	  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
	  return a > b ? -1 : a === b ? 0 : 1;
	}

	/**
	 * Linker functions return an unlink function that
	 * tearsdown all directives instances generated during
	 * the process.
	 *
	 * We create unlink functions with only the necessary
	 * information to avoid retaining additional closures.
	 *
	 * @param {Vue} vm
	 * @param {Array} dirs
	 * @param {Vue} [context]
	 * @param {Array} [contextDirs]
	 * @return {Function}
	 */

	function makeUnlinkFn(vm, dirs, context, contextDirs) {
	  function unlink(destroying) {
	    teardownDirs(vm, dirs, destroying);
	    if (context && contextDirs) {
	      teardownDirs(context, contextDirs);
	    }
	  }
	  // expose linked directives
	  unlink.dirs = dirs;
	  return unlink;
	}

	/**
	 * Teardown partial linked directives.
	 *
	 * @param {Vue} vm
	 * @param {Array} dirs
	 * @param {Boolean} destroying
	 */

	function teardownDirs(vm, dirs, destroying) {
	  var i = dirs.length;
	  while (i--) {
	    dirs[i]._teardown();
	    if (process.env.NODE_ENV !== 'production' && !destroying) {
	      vm._directives.$remove(dirs[i]);
	    }
	  }
	}

	/**
	 * Compile link props on an instance.
	 *
	 * @param {Vue} vm
	 * @param {Element} el
	 * @param {Object} props
	 * @param {Object} [scope]
	 * @return {Function}
	 */

	function compileAndLinkProps(vm, el, props, scope) {
	  var propsLinkFn = compileProps(el, props, vm);
	  var propDirs = linkAndCapture(function () {
	    propsLinkFn(vm, scope);
	  }, vm);
	  return makeUnlinkFn(vm, propDirs);
	}

	/**
	 * Compile the root element of an instance.
	 *
	 * 1. attrs on context container (context scope)
	 * 2. attrs on the component template root node, if
	 *    replace:true (child scope)
	 *
	 * If this is a fragment instance, we only need to compile 1.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @param {Object} contextOptions
	 * @return {Function}
	 */

	function compileRoot(el, options, contextOptions) {
	  var containerAttrs = options._containerAttrs;
	  var replacerAttrs = options._replacerAttrs;
	  var contextLinkFn, replacerLinkFn;

	  // only need to compile other attributes for
	  // non-fragment instances
	  if (el.nodeType !== 11) {
	    // for components, container and replacer need to be
	    // compiled separately and linked in different scopes.
	    if (options._asComponent) {
	      // 2. container attributes
	      if (containerAttrs && contextOptions) {
	        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
	      }
	      if (replacerAttrs) {
	        // 3. replacer attributes
	        replacerLinkFn = compileDirectives(replacerAttrs, options);
	      }
	    } else {
	      // non-component, just compile as a normal element.
	      replacerLinkFn = compileDirectives(el.attributes, options);
	    }
	  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
	    // warn container directives for fragment instances
	    var names = containerAttrs.filter(function (attr) {
	      // allow vue-loader/vueify scoped css attributes
	      return attr.name.indexOf('_v-') < 0 &&
	      // allow event listeners
	      !onRE.test(attr.name) &&
	      // allow slots
	      attr.name !== 'slot';
	    }).map(function (attr) {
	      return '"' + attr.name + '"';
	    });
	    if (names.length) {
	      var plural = names.length > 1;
	      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment-Instance');
	    }
	  }

	  options._containerAttrs = options._replacerAttrs = null;
	  return function rootLinkFn(vm, el, scope) {
	    // link context scope dirs
	    var context = vm._context;
	    var contextDirs;
	    if (context && contextLinkFn) {
	      contextDirs = linkAndCapture(function () {
	        contextLinkFn(context, el, null, scope);
	      }, context);
	    }

	    // link self
	    var selfDirs = linkAndCapture(function () {
	      if (replacerLinkFn) replacerLinkFn(vm, el);
	    }, vm);

	    // return the unlink function that tearsdown context
	    // container directives.
	    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
	  };
	}

	/**
	 * Compile a node and return a nodeLinkFn based on the
	 * node type.
	 *
	 * @param {Node} node
	 * @param {Object} options
	 * @return {Function|null}
	 */

	function compileNode(node, options) {
	  var type = node.nodeType;
	  if (type === 1 && !isScript(node)) {
	    return compileElement(node, options);
	  } else if (type === 3 && node.data.trim()) {
	    return compileTextNode(node, options);
	  } else {
	    return null;
	  }
	}

	/**
	 * Compile an element and return a nodeLinkFn.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function|null}
	 */

	function compileElement(el, options) {
	  // preprocess textareas.
	  // textarea treats its text content as the initial value.
	  // just bind it as an attr directive for value.
	  if (el.tagName === 'TEXTAREA') {
	    var tokens = parseText(el.value);
	    if (tokens) {
	      el.setAttribute(':value', tokensToExp(tokens));
	      el.value = '';
	    }
	  }
	  var linkFn;
	  var hasAttrs = el.hasAttributes();
	  var attrs = hasAttrs && toArray(el.attributes);
	  // check terminal directives (for & if)
	  if (hasAttrs) {
	    linkFn = checkTerminalDirectives(el, attrs, options);
	  }
	  // check element directives
	  if (!linkFn) {
	    linkFn = checkElementDirectives(el, options);
	  }
	  // check component
	  if (!linkFn) {
	    linkFn = checkComponent(el, options);
	  }
	  // normal directives
	  if (!linkFn && hasAttrs) {
	    linkFn = compileDirectives(attrs, options);
	  }
	  return linkFn;
	}

	/**
	 * Compile a textNode and return a nodeLinkFn.
	 *
	 * @param {TextNode} node
	 * @param {Object} options
	 * @return {Function|null} textNodeLinkFn
	 */

	function compileTextNode(node, options) {
	  // skip marked text nodes
	  if (node._skip) {
	    return removeText;
	  }

	  var tokens = parseText(node.wholeText);
	  if (!tokens) {
	    return null;
	  }

	  // mark adjacent text nodes as skipped,
	  // because we are using node.wholeText to compile
	  // all adjacent text nodes together. This fixes
	  // issues in IE where sometimes it splits up a single
	  // text node into multiple ones.
	  var next = node.nextSibling;
	  while (next && next.nodeType === 3) {
	    next._skip = true;
	    next = next.nextSibling;
	  }

	  var frag = document.createDocumentFragment();
	  var el, token;
	  for (var i = 0, l = tokens.length; i < l; i++) {
	    token = tokens[i];
	    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
	    frag.appendChild(el);
	  }
	  return makeTextNodeLinkFn(tokens, frag, options);
	}

	/**
	 * Linker for an skipped text node.
	 *
	 * @param {Vue} vm
	 * @param {Text} node
	 */

	function removeText(vm, node) {
	  remove(node);
	}

	/**
	 * Process a single text token.
	 *
	 * @param {Object} token
	 * @param {Object} options
	 * @return {Node}
	 */

	function processTextToken(token, options) {
	  var el;
	  if (token.oneTime) {
	    el = document.createTextNode(token.value);
	  } else {
	    if (token.html) {
	      el = document.createComment('v-html');
	      setTokenType('html');
	    } else {
	      // IE will clean up empty textNodes during
	      // frag.cloneNode(true), so we have to give it
	      // something here...
	      el = document.createTextNode(' ');
	      setTokenType('text');
	    }
	  }
	  function setTokenType(type) {
	    if (token.descriptor) return;
	    var parsed = parseDirective(token.value);
	    token.descriptor = {
	      name: type,
	      def: directives[type],
	      expression: parsed.expression,
	      filters: parsed.filters
	    };
	  }
	  return el;
	}

	/**
	 * Build a function that processes a textNode.
	 *
	 * @param {Array<Object>} tokens
	 * @param {DocumentFragment} frag
	 */

	function makeTextNodeLinkFn(tokens, frag) {
	  return function textNodeLinkFn(vm, el, host, scope) {
	    var fragClone = frag.cloneNode(true);
	    var childNodes = toArray(fragClone.childNodes);
	    var token, value, node;
	    for (var i = 0, l = tokens.length; i < l; i++) {
	      token = tokens[i];
	      value = token.value;
	      if (token.tag) {
	        node = childNodes[i];
	        if (token.oneTime) {
	          value = (scope || vm).$eval(value);
	          if (token.html) {
	            replace(node, parseTemplate(value, true));
	          } else {
	            node.data = _toString(value);
	          }
	        } else {
	          vm._bindDir(token.descriptor, node, host, scope);
	        }
	      }
	    }
	    replace(el, fragClone);
	  };
	}

	/**
	 * Compile a node list and return a childLinkFn.
	 *
	 * @param {NodeList} nodeList
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function compileNodeList(nodeList, options) {
	  var linkFns = [];
	  var nodeLinkFn, childLinkFn, node;
	  for (var i = 0, l = nodeList.length; i < l; i++) {
	    node = nodeList[i];
	    nodeLinkFn = compileNode(node, options);
	    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
	    linkFns.push(nodeLinkFn, childLinkFn);
	  }
	  return linkFns.length ? makeChildLinkFn(linkFns) : null;
	}

	/**
	 * Make a child link function for a node's childNodes.
	 *
	 * @param {Array<Function>} linkFns
	 * @return {Function} childLinkFn
	 */

	function makeChildLinkFn(linkFns) {
	  return function childLinkFn(vm, nodes, host, scope, frag) {
	    var node, nodeLinkFn, childrenLinkFn;
	    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
	      node = nodes[n];
	      nodeLinkFn = linkFns[i++];
	      childrenLinkFn = linkFns[i++];
	      // cache childNodes before linking parent, fix #657
	      var childNodes = toArray(node.childNodes);
	      if (nodeLinkFn) {
	        nodeLinkFn(vm, node, host, scope, frag);
	      }
	      if (childrenLinkFn) {
	        childrenLinkFn(vm, childNodes, host, scope, frag);
	      }
	    }
	  };
	}

	/**
	 * Check for element directives (custom elements that should
	 * be resovled as terminal directives).
	 *
	 * @param {Element} el
	 * @param {Object} options
	 */

	function checkElementDirectives(el, options) {
	  var tag = el.tagName.toLowerCase();
	  if (commonTagRE.test(tag)) {
	    return;
	  }
	  var def = resolveAsset(options, 'elementDirectives', tag);
	  if (def) {
	    return makeTerminalNodeLinkFn(el, tag, '', options, def);
	  }
	}

	/**
	 * Check if an element is a component. If yes, return
	 * a component link function.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function checkComponent(el, options) {
	  var component = checkComponentAttr(el, options);
	  if (component) {
	    var ref = findRef(el);
	    var descriptor = {
	      name: 'component',
	      ref: ref,
	      expression: component.id,
	      def: internalDirectives.component,
	      modifiers: {
	        literal: !component.dynamic
	      }
	    };
	    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
	      if (ref) {
	        defineReactive((scope || vm).$refs, ref, null);
	      }
	      vm._bindDir(descriptor, el, host, scope, frag);
	    };
	    componentLinkFn.terminal = true;
	    return componentLinkFn;
	  }
	}

	/**
	 * Check an element for terminal directives in fixed order.
	 * If it finds one, return a terminal link function.
	 *
	 * @param {Element} el
	 * @param {Array} attrs
	 * @param {Object} options
	 * @return {Function} terminalLinkFn
	 */

	function checkTerminalDirectives(el, attrs, options) {
	  // skip v-pre
	  if (getAttr(el, 'v-pre') !== null) {
	    return skip;
	  }
	  // skip v-else block, but only if following v-if
	  if (el.hasAttribute('v-else')) {
	    var prev = el.previousElementSibling;
	    if (prev && prev.hasAttribute('v-if')) {
	      return skip;
	    }
	  }

	  var attr, name, value, modifiers, matched, dirName, rawName, arg, def, termDef;
	  for (var i = 0, j = attrs.length; i < j; i++) {
	    attr = attrs[i];
	    name = attr.name.replace(modifierRE, '');
	    if (matched = name.match(dirAttrRE)) {
	      def = resolveAsset(options, 'directives', matched[1]);
	      if (def && def.terminal) {
	        if (!termDef || (def.priority || DEFAULT_TERMINAL_PRIORITY) > termDef.priority) {
	          termDef = def;
	          rawName = attr.name;
	          modifiers = parseModifiers(attr.name);
	          value = attr.value;
	          dirName = matched[1];
	          arg = matched[2];
	        }
	      }
	    }
	  }

	  if (termDef) {
	    return makeTerminalNodeLinkFn(el, dirName, value, options, termDef, rawName, arg, modifiers);
	  }
	}

	function skip() {}
	skip.terminal = true;

	/**
	 * Build a node link function for a terminal directive.
	 * A terminal link function terminates the current
	 * compilation recursion and handles compilation of the
	 * subtree in the directive.
	 *
	 * @param {Element} el
	 * @param {String} dirName
	 * @param {String} value
	 * @param {Object} options
	 * @param {Object} def
	 * @param {String} [rawName]
	 * @param {String} [arg]
	 * @param {Object} [modifiers]
	 * @return {Function} terminalLinkFn
	 */

	function makeTerminalNodeLinkFn(el, dirName, value, options, def, rawName, arg, modifiers) {
	  var parsed = parseDirective(value);
	  var descriptor = {
	    name: dirName,
	    arg: arg,
	    expression: parsed.expression,
	    filters: parsed.filters,
	    raw: value,
	    attr: rawName,
	    modifiers: modifiers,
	    def: def
	  };
	  // check ref for v-for and router-view
	  if (dirName === 'for' || dirName === 'router-view') {
	    descriptor.ref = findRef(el);
	  }
	  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
	    if (descriptor.ref) {
	      defineReactive((scope || vm).$refs, descriptor.ref, null);
	    }
	    vm._bindDir(descriptor, el, host, scope, frag);
	  };
	  fn.terminal = true;
	  return fn;
	}

	/**
	 * Compile the directives on an element and return a linker.
	 *
	 * @param {Array|NamedNodeMap} attrs
	 * @param {Object} options
	 * @return {Function}
	 */

	function compileDirectives(attrs, options) {
	  var i = attrs.length;
	  var dirs = [];
	  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens, matched;
	  while (i--) {
	    attr = attrs[i];
	    name = rawName = attr.name;
	    value = rawValue = attr.value;
	    tokens = parseText(value);
	    // reset arg
	    arg = null;
	    // check modifiers
	    modifiers = parseModifiers(name);
	    name = name.replace(modifierRE, '');

	    // attribute interpolations
	    if (tokens) {
	      value = tokensToExp(tokens);
	      arg = name;
	      pushDir('bind', directives.bind, tokens);
	      // warn against mixing mustaches with v-bind
	      if (process.env.NODE_ENV !== 'production') {
	        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
	          return attr.name === ':class' || attr.name === 'v-bind:class';
	        })) {
	          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.', options);
	        }
	      }
	    } else

	      // special attribute: transition
	      if (transitionRE.test(name)) {
	        modifiers.literal = !bindRE.test(name);
	        pushDir('transition', internalDirectives.transition);
	      } else

	        // event handlers
	        if (onRE.test(name)) {
	          arg = name.replace(onRE, '');
	          pushDir('on', directives.on);
	        } else

	          // attribute bindings
	          if (bindRE.test(name)) {
	            dirName = name.replace(bindRE, '');
	            if (dirName === 'style' || dirName === 'class') {
	              pushDir(dirName, internalDirectives[dirName]);
	            } else {
	              arg = dirName;
	              pushDir('bind', directives.bind);
	            }
	          } else

	            // normal directives
	            if (matched = name.match(dirAttrRE)) {
	              dirName = matched[1];
	              arg = matched[2];

	              // skip v-else (when used with v-show)
	              if (dirName === 'else') {
	                continue;
	              }

	              dirDef = resolveAsset(options, 'directives', dirName, true);
	              if (dirDef) {
	                pushDir(dirName, dirDef);
	              }
	            }
	  }

	  /**
	   * Push a directive.
	   *
	   * @param {String} dirName
	   * @param {Object|Function} def
	   * @param {Array} [interpTokens]
	   */

	  function pushDir(dirName, def, interpTokens) {
	    var hasOneTimeToken = interpTokens && hasOneTime(interpTokens);
	    var parsed = !hasOneTimeToken && parseDirective(value);
	    dirs.push({
	      name: dirName,
	      attr: rawName,
	      raw: rawValue,
	      def: def,
	      arg: arg,
	      modifiers: modifiers,
	      // conversion from interpolation strings with one-time token
	      // to expression is differed until directive bind time so that we
	      // have access to the actual vm context for one-time bindings.
	      expression: parsed && parsed.expression,
	      filters: parsed && parsed.filters,
	      interp: interpTokens,
	      hasOneTime: hasOneTimeToken
	    });
	  }

	  if (dirs.length) {
	    return makeNodeLinkFn(dirs);
	  }
	}

	/**
	 * Parse modifiers from directive attribute name.
	 *
	 * @param {String} name
	 * @return {Object}
	 */

	function parseModifiers(name) {
	  var res = Object.create(null);
	  var match = name.match(modifierRE);
	  if (match) {
	    var i = match.length;
	    while (i--) {
	      res[match[i].slice(1)] = true;
	    }
	  }
	  return res;
	}

	/**
	 * Build a link function for all directives on a single node.
	 *
	 * @param {Array} directives
	 * @return {Function} directivesLinkFn
	 */

	function makeNodeLinkFn(directives) {
	  return function nodeLinkFn(vm, el, host, scope, frag) {
	    // reverse apply because it's sorted low to high
	    var i = directives.length;
	    while (i--) {
	      vm._bindDir(directives[i], el, host, scope, frag);
	    }
	  };
	}

	/**
	 * Check if an interpolation string contains one-time tokens.
	 *
	 * @param {Array} tokens
	 * @return {Boolean}
	 */

	function hasOneTime(tokens) {
	  var i = tokens.length;
	  while (i--) {
	    if (tokens[i].oneTime) return true;
	  }
	}

	function isScript(el) {
	  return el.tagName === 'SCRIPT' && (!el.hasAttribute('type') || el.getAttribute('type') === 'text/javascript');
	}

	var specialCharRE = /[^\w\-:\.]/;

	/**
	 * Process an element or a DocumentFragment based on a
	 * instance option object. This allows us to transclude
	 * a template node/fragment before the instance is created,
	 * so the processed fragment can then be cloned and reused
	 * in v-for.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	function transclude(el, options) {
	  // extract container attributes to pass them down
	  // to compiler, because they need to be compiled in
	  // parent scope. we are mutating the options object here
	  // assuming the same object will be used for compile
	  // right after this.
	  if (options) {
	    options._containerAttrs = extractAttrs(el);
	  }
	  // for template tags, what we want is its content as
	  // a documentFragment (for fragment instances)
	  if (isTemplate(el)) {
	    el = parseTemplate(el);
	  }
	  if (options) {
	    if (options._asComponent && !options.template) {
	      options.template = '<slot></slot>';
	    }
	    if (options.template) {
	      options._content = extractContent(el);
	      el = transcludeTemplate(el, options);
	    }
	  }
	  if (isFragment(el)) {
	    // anchors for fragment instance
	    // passing in `persist: true` to avoid them being
	    // discarded by IE during template cloning
	    prepend(createAnchor('v-start', true), el);
	    el.appendChild(createAnchor('v-end', true));
	  }
	  return el;
	}

	/**
	 * Process the template option.
	 * If the replace option is true this will swap the $el.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	function transcludeTemplate(el, options) {
	  var template = options.template;
	  var frag = parseTemplate(template, true);
	  if (frag) {
	    var replacer = frag.firstChild;
	    var tag = replacer.tagName && replacer.tagName.toLowerCase();
	    if (options.replace) {
	      /* istanbul ignore if */
	      if (el === document.body) {
	        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
	      }
	      // there are many cases where the instance must
	      // become a fragment instance: basically anything that
	      // can create more than 1 root nodes.
	      if (
	      // multi-children template
	      frag.childNodes.length > 1 ||
	      // non-element template
	      replacer.nodeType !== 1 ||
	      // single nested component
	      tag === 'component' || resolveAsset(options, 'components', tag) || hasBindAttr(replacer, 'is') ||
	      // element directive
	      resolveAsset(options, 'elementDirectives', tag) ||
	      // for block
	      replacer.hasAttribute('v-for') ||
	      // if block
	      replacer.hasAttribute('v-if')) {
	        return frag;
	      } else {
	        options._replacerAttrs = extractAttrs(replacer);
	        mergeAttrs(el, replacer);
	        return replacer;
	      }
	    } else {
	      el.appendChild(frag);
	      return el;
	    }
	  } else {
	    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
	  }
	}

	/**
	 * Helper to extract a component container's attributes
	 * into a plain object array.
	 *
	 * @param {Element} el
	 * @return {Array}
	 */

	function extractAttrs(el) {
	  if (el.nodeType === 1 && el.hasAttributes()) {
	    return toArray(el.attributes);
	  }
	}

	/**
	 * Merge the attributes of two elements, and make sure
	 * the class names are merged properly.
	 *
	 * @param {Element} from
	 * @param {Element} to
	 */

	function mergeAttrs(from, to) {
	  var attrs = from.attributes;
	  var i = attrs.length;
	  var name, value;
	  while (i--) {
	    name = attrs[i].name;
	    value = attrs[i].value;
	    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
	      to.setAttribute(name, value);
	    } else if (name === 'class' && !parseText(value) && (value = value.trim())) {
	      value.split(/\s+/).forEach(function (cls) {
	        addClass(to, cls);
	      });
	    }
	  }
	}

	/**
	 * Scan and determine slot content distribution.
	 * We do this during transclusion instead at compile time so that
	 * the distribution is decoupled from the compilation order of
	 * the slots.
	 *
	 * @param {Element|DocumentFragment} template
	 * @param {Element} content
	 * @param {Vue} vm
	 */

	function resolveSlots(vm, content) {
	  if (!content) {
	    return;
	  }
	  var contents = vm._slotContents = Object.create(null);
	  var el, name;
	  for (var i = 0, l = content.children.length; i < l; i++) {
	    el = content.children[i];
	    /* eslint-disable no-cond-assign */
	    if (name = el.getAttribute('slot')) {
	      (contents[name] || (contents[name] = [])).push(el);
	    }
	    /* eslint-enable no-cond-assign */
	    if (process.env.NODE_ENV !== 'production' && getBindAttr(el, 'slot')) {
	      warn('The "slot" attribute must be static.', vm.$parent);
	    }
	  }
	  for (name in contents) {
	    contents[name] = extractFragment(contents[name], content);
	  }
	  if (content.hasChildNodes()) {
	    var nodes = content.childNodes;
	    if (nodes.length === 1 && nodes[0].nodeType === 3 && !nodes[0].data.trim()) {
	      return;
	    }
	    contents['default'] = extractFragment(content.childNodes, content);
	  }
	}

	/**
	 * Extract qualified content nodes from a node list.
	 *
	 * @param {NodeList} nodes
	 * @return {DocumentFragment}
	 */

	function extractFragment(nodes, parent) {
	  var frag = document.createDocumentFragment();
	  nodes = toArray(nodes);
	  for (var i = 0, l = nodes.length; i < l; i++) {
	    var node = nodes[i];
	    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
	      parent.removeChild(node);
	      node = parseTemplate(node, true);
	    }
	    frag.appendChild(node);
	  }
	  return frag;
	}



	var compiler = Object.freeze({
		compile: compile,
		compileAndLinkProps: compileAndLinkProps,
		compileRoot: compileRoot,
		transclude: transclude,
		resolveSlots: resolveSlots
	});

	function stateMixin (Vue) {
	  /**
	   * Accessor for `$data` property, since setting $data
	   * requires observing the new object and updating
	   * proxied properties.
	   */

	  Object.defineProperty(Vue.prototype, '$data', {
	    get: function get() {
	      return this._data;
	    },
	    set: function set(newData) {
	      if (newData !== this._data) {
	        this._setData(newData);
	      }
	    }
	  });

	  /**
	   * Setup the scope of an instance, which contains:
	   * - observed data
	   * - computed properties
	   * - user methods
	   * - meta properties
	   */

	  Vue.prototype._initState = function () {
	    this._initProps();
	    this._initMeta();
	    this._initMethods();
	    this._initData();
	    this._initComputed();
	  };

	  /**
	   * Initialize props.
	   */

	  Vue.prototype._initProps = function () {
	    var options = this.$options;
	    var el = options.el;
	    var props = options.props;
	    if (props && !el) {
	      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.', this);
	    }
	    // make sure to convert string selectors into element now
	    el = options.el = query(el);
	    this._propsUnlinkFn = el && el.nodeType === 1 && props
	    // props must be linked in proper scope if inside v-for
	    ? compileAndLinkProps(this, el, props, this._scope) : null;
	  };

	  /**
	   * Initialize the data.
	   */

	  Vue.prototype._initData = function () {
	    var dataFn = this.$options.data;
	    var data = this._data = dataFn ? dataFn() : {};
	    if (!isPlainObject(data)) {
	      data = {};
	      process.env.NODE_ENV !== 'production' && warn('data functions should return an object.', this);
	    }
	    var props = this._props;
	    // proxy data on instance
	    var keys = Object.keys(data);
	    var i, key;
	    i = keys.length;
	    while (i--) {
	      key = keys[i];
	      // there are two scenarios where we can proxy a data key:
	      // 1. it's not already defined as a prop
	      // 2. it's provided via a instantiation option AND there are no
	      //    template prop present
	      if (!props || !hasOwn(props, key)) {
	        this._proxy(key);
	      } else if (process.env.NODE_ENV !== 'production') {
	        warn('Data field "' + key + '" is already defined ' + 'as a prop. To provide default value for a prop, use the "default" ' + 'prop option; if you want to pass prop values to an instantiation ' + 'call, use the "propsData" option.', this);
	      }
	    }
	    // observe data
	    observe(data, this);
	  };

	  /**
	   * Swap the instance's $data. Called in $data's setter.
	   *
	   * @param {Object} newData
	   */

	  Vue.prototype._setData = function (newData) {
	    newData = newData || {};
	    var oldData = this._data;
	    this._data = newData;
	    var keys, key, i;
	    // unproxy keys not present in new data
	    keys = Object.keys(oldData);
	    i = keys.length;
	    while (i--) {
	      key = keys[i];
	      if (!(key in newData)) {
	        this._unproxy(key);
	      }
	    }
	    // proxy keys not already proxied,
	    // and trigger change for changed values
	    keys = Object.keys(newData);
	    i = keys.length;
	    while (i--) {
	      key = keys[i];
	      if (!hasOwn(this, key)) {
	        // new property
	        this._proxy(key);
	      }
	    }
	    oldData.__ob__.removeVm(this);
	    observe(newData, this);
	    this._digest();
	  };

	  /**
	   * Proxy a property, so that
	   * vm.prop === vm._data.prop
	   *
	   * @param {String} key
	   */

	  Vue.prototype._proxy = function (key) {
	    if (!isReserved(key)) {
	      // need to store ref to self here
	      // because these getter/setters might
	      // be called by child scopes via
	      // prototype inheritance.
	      var self = this;
	      Object.defineProperty(self, key, {
	        configurable: true,
	        enumerable: true,
	        get: function proxyGetter() {
	          return self._data[key];
	        },
	        set: function proxySetter(val) {
	          self._data[key] = val;
	        }
	      });
	    }
	  };

	  /**
	   * Unproxy a property.
	   *
	   * @param {String} key
	   */

	  Vue.prototype._unproxy = function (key) {
	    if (!isReserved(key)) {
	      delete this[key];
	    }
	  };

	  /**
	   * Force update on every watcher in scope.
	   */

	  Vue.prototype._digest = function () {
	    for (var i = 0, l = this._watchers.length; i < l; i++) {
	      this._watchers[i].update(true); // shallow updates
	    }
	  };

	  /**
	   * Setup computed properties. They are essentially
	   * special getter/setters
	   */

	  function noop() {}
	  Vue.prototype._initComputed = function () {
	    var computed = this.$options.computed;
	    if (computed) {
	      for (var key in computed) {
	        var userDef = computed[key];
	        var def = {
	          enumerable: true,
	          configurable: true
	        };
	        if (typeof userDef === 'function') {
	          def.get = makeComputedGetter(userDef, this);
	          def.set = noop;
	        } else {
	          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind(userDef.get, this) : noop;
	          def.set = userDef.set ? bind(userDef.set, this) : noop;
	        }
	        Object.defineProperty(this, key, def);
	      }
	    }
	  };

	  function makeComputedGetter(getter, owner) {
	    var watcher = new Watcher(owner, getter, null, {
	      lazy: true
	    });
	    return function computedGetter() {
	      if (watcher.dirty) {
	        watcher.evaluate();
	      }
	      if (Dep.target) {
	        watcher.depend();
	      }
	      return watcher.value;
	    };
	  }

	  /**
	   * Setup instance methods. Methods must be bound to the
	   * instance since they might be passed down as a prop to
	   * child components.
	   */

	  Vue.prototype._initMethods = function () {
	    var methods = this.$options.methods;
	    if (methods) {
	      for (var key in methods) {
	        this[key] = bind(methods[key], this);
	      }
	    }
	  };

	  /**
	   * Initialize meta information like $index, $key & $value.
	   */

	  Vue.prototype._initMeta = function () {
	    var metas = this.$options._meta;
	    if (metas) {
	      for (var key in metas) {
	        defineReactive(this, key, metas[key]);
	      }
	    }
	  };
	}

	var eventRE = /^v-on:|^@/;

	function eventsMixin (Vue) {
	  /**
	   * Setup the instance's option events & watchers.
	   * If the value is a string, we pull it from the
	   * instance's methods by name.
	   */

	  Vue.prototype._initEvents = function () {
	    var options = this.$options;
	    if (options._asComponent) {
	      registerComponentEvents(this, options.el);
	    }
	    registerCallbacks(this, '$on', options.events);
	    registerCallbacks(this, '$watch', options.watch);
	  };

	  /**
	   * Register v-on events on a child component
	   *
	   * @param {Vue} vm
	   * @param {Element} el
	   */

	  function registerComponentEvents(vm, el) {
	    var attrs = el.attributes;
	    var name, value, handler;
	    for (var i = 0, l = attrs.length; i < l; i++) {
	      name = attrs[i].name;
	      if (eventRE.test(name)) {
	        name = name.replace(eventRE, '');
	        // force the expression into a statement so that
	        // it always dynamically resolves the method to call (#2670)
	        // kinda ugly hack, but does the job.
	        value = attrs[i].value;
	        if (isSimplePath(value)) {
	          value += '.apply(this, $arguments)';
	        }
	        handler = (vm._scope || vm._context).$eval(value, true);
	        handler._fromParent = true;
	        vm.$on(name.replace(eventRE), handler);
	      }
	    }
	  }

	  /**
	   * Register callbacks for option events and watchers.
	   *
	   * @param {Vue} vm
	   * @param {String} action
	   * @param {Object} hash
	   */

	  function registerCallbacks(vm, action, hash) {
	    if (!hash) return;
	    var handlers, key, i, j;
	    for (key in hash) {
	      handlers = hash[key];
	      if (isArray(handlers)) {
	        for (i = 0, j = handlers.length; i < j; i++) {
	          register(vm, action, key, handlers[i]);
	        }
	      } else {
	        register(vm, action, key, handlers);
	      }
	    }
	  }

	  /**
	   * Helper to register an event/watch callback.
	   *
	   * @param {Vue} vm
	   * @param {String} action
	   * @param {String} key
	   * @param {Function|String|Object} handler
	   * @param {Object} [options]
	   */

	  function register(vm, action, key, handler, options) {
	    var type = typeof handler;
	    if (type === 'function') {
	      vm[action](key, handler, options);
	    } else if (type === 'string') {
	      var methods = vm.$options.methods;
	      var method = methods && methods[handler];
	      if (method) {
	        vm[action](key, method, options);
	      } else {
	        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".', vm);
	      }
	    } else if (handler && type === 'object') {
	      register(vm, action, key, handler.handler, handler);
	    }
	  }

	  /**
	   * Setup recursive attached/detached calls
	   */

	  Vue.prototype._initDOMHooks = function () {
	    this.$on('hook:attached', onAttached);
	    this.$on('hook:detached', onDetached);
	  };

	  /**
	   * Callback to recursively call attached hook on children
	   */

	  function onAttached() {
	    if (!this._isAttached) {
	      this._isAttached = true;
	      this.$children.forEach(callAttach);
	    }
	  }

	  /**
	   * Iterator to call attached hook
	   *
	   * @param {Vue} child
	   */

	  function callAttach(child) {
	    if (!child._isAttached && inDoc(child.$el)) {
	      child._callHook('attached');
	    }
	  }

	  /**
	   * Callback to recursively call detached hook on children
	   */

	  function onDetached() {
	    if (this._isAttached) {
	      this._isAttached = false;
	      this.$children.forEach(callDetach);
	    }
	  }

	  /**
	   * Iterator to call detached hook
	   *
	   * @param {Vue} child
	   */

	  function callDetach(child) {
	    if (child._isAttached && !inDoc(child.$el)) {
	      child._callHook('detached');
	    }
	  }

	  /**
	   * Trigger all handlers for a hook
	   *
	   * @param {String} hook
	   */

	  Vue.prototype._callHook = function (hook) {
	    this.$emit('pre-hook:' + hook);
	    var handlers = this.$options[hook];
	    if (handlers) {
	      for (var i = 0, j = handlers.length; i < j; i++) {
	        handlers[i].call(this);
	      }
	    }
	    this.$emit('hook:' + hook);
	  };
	}

	function noop$1() {}

	/**
	 * A directive links a DOM element with a piece of data,
	 * which is the result of evaluating an expression.
	 * It registers a watcher with the expression and calls
	 * the DOM update function when a change is triggered.
	 *
	 * @param {Object} descriptor
	 *                 - {String} name
	 *                 - {Object} def
	 *                 - {String} expression
	 *                 - {Array<Object>} [filters]
	 *                 - {Object} [modifiers]
	 *                 - {Boolean} literal
	 *                 - {String} attr
	 *                 - {String} arg
	 *                 - {String} raw
	 *                 - {String} [ref]
	 *                 - {Array<Object>} [interp]
	 *                 - {Boolean} [hasOneTime]
	 * @param {Vue} vm
	 * @param {Node} el
	 * @param {Vue} [host] - transclusion host component
	 * @param {Object} [scope] - v-for scope
	 * @param {Fragment} [frag] - owner fragment
	 * @constructor
	 */
	function Directive(descriptor, vm, el, host, scope, frag) {
	  this.vm = vm;
	  this.el = el;
	  // copy descriptor properties
	  this.descriptor = descriptor;
	  this.name = descriptor.name;
	  this.expression = descriptor.expression;
	  this.arg = descriptor.arg;
	  this.modifiers = descriptor.modifiers;
	  this.filters = descriptor.filters;
	  this.literal = this.modifiers && this.modifiers.literal;
	  // private
	  this._locked = false;
	  this._bound = false;
	  this._listeners = null;
	  // link context
	  this._host = host;
	  this._scope = scope;
	  this._frag = frag;
	  // store directives on node in dev mode
	  if (process.env.NODE_ENV !== 'production' && this.el) {
	    this.el._vue_directives = this.el._vue_directives || [];
	    this.el._vue_directives.push(this);
	  }
	}

	/**
	 * Initialize the directive, mixin definition properties,
	 * setup the watcher, call definition bind() and update()
	 * if present.
	 */

	Directive.prototype._bind = function () {
	  var name = this.name;
	  var descriptor = this.descriptor;

	  // remove attribute
	  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
	    var attr = descriptor.attr || 'v-' + name;
	    this.el.removeAttribute(attr);
	  }

	  // copy def properties
	  var def = descriptor.def;
	  if (typeof def === 'function') {
	    this.update = def;
	  } else {
	    extend(this, def);
	  }

	  // setup directive params
	  this._setupParams();

	  // initial bind
	  if (this.bind) {
	    this.bind();
	  }
	  this._bound = true;

	  if (this.literal) {
	    this.update && this.update(descriptor.raw);
	  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
	    // wrapped updater for context
	    var dir = this;
	    if (this.update) {
	      this._update = function (val, oldVal) {
	        if (!dir._locked) {
	          dir.update(val, oldVal);
	        }
	      };
	    } else {
	      this._update = noop$1;
	    }
	    var preProcess = this._preProcess ? bind(this._preProcess, this) : null;
	    var postProcess = this._postProcess ? bind(this._postProcess, this) : null;
	    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
	    {
	      filters: this.filters,
	      twoWay: this.twoWay,
	      deep: this.deep,
	      preProcess: preProcess,
	      postProcess: postProcess,
	      scope: this._scope
	    });
	    // v-model with inital inline value need to sync back to
	    // model instead of update to DOM on init. They would
	    // set the afterBind hook to indicate that.
	    if (this.afterBind) {
	      this.afterBind();
	    } else if (this.update) {
	      this.update(watcher.value);
	    }
	  }
	};

	/**
	 * Setup all param attributes, e.g. track-by,
	 * transition-mode, etc...
	 */

	Directive.prototype._setupParams = function () {
	  if (!this.params) {
	    return;
	  }
	  var params = this.params;
	  // swap the params array with a fresh object.
	  this.params = Object.create(null);
	  var i = params.length;
	  var key, val, mappedKey;
	  while (i--) {
	    key = hyphenate(params[i]);
	    mappedKey = camelize(key);
	    val = getBindAttr(this.el, key);
	    if (val != null) {
	      // dynamic
	      this._setupParamWatcher(mappedKey, val);
	    } else {
	      // static
	      val = getAttr(this.el, key);
	      if (val != null) {
	        this.params[mappedKey] = val === '' ? true : val;
	      }
	    }
	  }
	};

	/**
	 * Setup a watcher for a dynamic param.
	 *
	 * @param {String} key
	 * @param {String} expression
	 */

	Directive.prototype._setupParamWatcher = function (key, expression) {
	  var self = this;
	  var called = false;
	  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
	    self.params[key] = val;
	    // since we are in immediate mode,
	    // only call the param change callbacks if this is not the first update.
	    if (called) {
	      var cb = self.paramWatchers && self.paramWatchers[key];
	      if (cb) {
	        cb.call(self, val, oldVal);
	      }
	    } else {
	      called = true;
	    }
	  }, {
	    immediate: true,
	    user: false
	  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
	};

	/**
	 * Check if the directive is a function caller
	 * and if the expression is a callable one. If both true,
	 * we wrap up the expression and use it as the event
	 * handler.
	 *
	 * e.g. on-click="a++"
	 *
	 * @return {Boolean}
	 */

	Directive.prototype._checkStatement = function () {
	  var expression = this.expression;
	  if (expression && this.acceptStatement && !isSimplePath(expression)) {
	    var fn = parseExpression(expression).get;
	    var scope = this._scope || this.vm;
	    var handler = function handler(e) {
	      scope.$event = e;
	      fn.call(scope, scope);
	      scope.$event = null;
	    };
	    if (this.filters) {
	      handler = scope._applyFilters(handler, null, this.filters);
	    }
	    this.update(handler);
	    return true;
	  }
	};

	/**
	 * Set the corresponding value with the setter.
	 * This should only be used in two-way directives
	 * e.g. v-model.
	 *
	 * @param {*} value
	 * @public
	 */

	Directive.prototype.set = function (value) {
	  /* istanbul ignore else */
	  if (this.twoWay) {
	    this._withLock(function () {
	      this._watcher.set(value);
	    });
	  } else if (process.env.NODE_ENV !== 'production') {
	    warn('Directive.set() can only be used inside twoWay' + 'directives.');
	  }
	};

	/**
	 * Execute a function while preventing that function from
	 * triggering updates on this directive instance.
	 *
	 * @param {Function} fn
	 */

	Directive.prototype._withLock = function (fn) {
	  var self = this;
	  self._locked = true;
	  fn.call(self);
	  nextTick(function () {
	    self._locked = false;
	  });
	};

	/**
	 * Convenience method that attaches a DOM event listener
	 * to the directive element and autometically tears it down
	 * during unbind.
	 *
	 * @param {String} event
	 * @param {Function} handler
	 * @param {Boolean} [useCapture]
	 */

	Directive.prototype.on = function (event, handler, useCapture) {
	  on(this.el, event, handler, useCapture);(this._listeners || (this._listeners = [])).push([event, handler]);
	};

	/**
	 * Teardown the watcher and call unbind.
	 */

	Directive.prototype._teardown = function () {
	  if (this._bound) {
	    this._bound = false;
	    if (this.unbind) {
	      this.unbind();
	    }
	    if (this._watcher) {
	      this._watcher.teardown();
	    }
	    var listeners = this._listeners;
	    var i;
	    if (listeners) {
	      i = listeners.length;
	      while (i--) {
	        off(this.el, listeners[i][0], listeners[i][1]);
	      }
	    }
	    var unwatchFns = this._paramUnwatchFns;
	    if (unwatchFns) {
	      i = unwatchFns.length;
	      while (i--) {
	        unwatchFns[i]();
	      }
	    }
	    if (process.env.NODE_ENV !== 'production' && this.el) {
	      this.el._vue_directives.$remove(this);
	    }
	    this.vm = this.el = this._watcher = this._listeners = null;
	  }
	};

	function lifecycleMixin (Vue) {
	  /**
	   * Update v-ref for component.
	   *
	   * @param {Boolean} remove
	   */

	  Vue.prototype._updateRef = function (remove) {
	    var ref = this.$options._ref;
	    if (ref) {
	      var refs = (this._scope || this._context).$refs;
	      if (remove) {
	        if (refs[ref] === this) {
	          refs[ref] = null;
	        }
	      } else {
	        refs[ref] = this;
	      }
	    }
	  };

	  /**
	   * Transclude, compile and link element.
	   *
	   * If a pre-compiled linker is available, that means the
	   * passed in element will be pre-transcluded and compiled
	   * as well - all we need to do is to call the linker.
	   *
	   * Otherwise we need to call transclude/compile/link here.
	   *
	   * @param {Element} el
	   */

	  Vue.prototype._compile = function (el) {
	    var options = this.$options;

	    // transclude and init element
	    // transclude can potentially replace original
	    // so we need to keep reference; this step also injects
	    // the template and caches the original attributes
	    // on the container node and replacer node.
	    var original = el;
	    el = transclude(el, options);
	    this._initElement(el);

	    // handle v-pre on root node (#2026)
	    if (el.nodeType === 1 && getAttr(el, 'v-pre') !== null) {
	      return;
	    }

	    // root is always compiled per-instance, because
	    // container attrs and props can be different every time.
	    var contextOptions = this._context && this._context.$options;
	    var rootLinker = compileRoot(el, options, contextOptions);

	    // resolve slot distribution
	    resolveSlots(this, options._content);

	    // compile and link the rest
	    var contentLinkFn;
	    var ctor = this.constructor;
	    // component compilation can be cached
	    // as long as it's not using inline-template
	    if (options._linkerCachable) {
	      contentLinkFn = ctor.linker;
	      if (!contentLinkFn) {
	        contentLinkFn = ctor.linker = compile(el, options);
	      }
	    }

	    // link phase
	    // make sure to link root with prop scope!
	    var rootUnlinkFn = rootLinker(this, el, this._scope);
	    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

	    // register composite unlink function
	    // to be called during instance destruction
	    this._unlinkFn = function () {
	      rootUnlinkFn();
	      // passing destroying: true to avoid searching and
	      // splicing the directives
	      contentUnlinkFn(true);
	    };

	    // finally replace original
	    if (options.replace) {
	      replace(original, el);
	    }

	    this._isCompiled = true;
	    this._callHook('compiled');
	  };

	  /**
	   * Initialize instance element. Called in the public
	   * $mount() method.
	   *
	   * @param {Element} el
	   */

	  Vue.prototype._initElement = function (el) {
	    if (isFragment(el)) {
	      this._isFragment = true;
	      this.$el = this._fragmentStart = el.firstChild;
	      this._fragmentEnd = el.lastChild;
	      // set persisted text anchors to empty
	      if (this._fragmentStart.nodeType === 3) {
	        this._fragmentStart.data = this._fragmentEnd.data = '';
	      }
	      this._fragment = el;
	    } else {
	      this.$el = el;
	    }
	    this.$el.__vue__ = this;
	    this._callHook('beforeCompile');
	  };

	  /**
	   * Create and bind a directive to an element.
	   *
	   * @param {Object} descriptor - parsed directive descriptor
	   * @param {Node} node   - target node
	   * @param {Vue} [host] - transclusion host component
	   * @param {Object} [scope] - v-for scope
	   * @param {Fragment} [frag] - owner fragment
	   */

	  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
	    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
	  };

	  /**
	   * Teardown an instance, unobserves the data, unbind all the
	   * directives, turn off all the event listeners, etc.
	   *
	   * @param {Boolean} remove - whether to remove the DOM node.
	   * @param {Boolean} deferCleanup - if true, defer cleanup to
	   *                                 be called later
	   */

	  Vue.prototype._destroy = function (remove, deferCleanup) {
	    if (this._isBeingDestroyed) {
	      if (!deferCleanup) {
	        this._cleanup();
	      }
	      return;
	    }

	    var destroyReady;
	    var pendingRemoval;

	    var self = this;
	    // Cleanup should be called either synchronously or asynchronoysly as
	    // callback of this.$remove(), or if remove and deferCleanup are false.
	    // In any case it should be called after all other removing, unbinding and
	    // turning of is done
	    var cleanupIfPossible = function cleanupIfPossible() {
	      if (destroyReady && !pendingRemoval && !deferCleanup) {
	        self._cleanup();
	      }
	    };

	    // remove DOM element
	    if (remove && this.$el) {
	      pendingRemoval = true;
	      this.$remove(function () {
	        pendingRemoval = false;
	        cleanupIfPossible();
	      });
	    }

	    this._callHook('beforeDestroy');
	    this._isBeingDestroyed = true;
	    var i;
	    // remove self from parent. only necessary
	    // if parent is not being destroyed as well.
	    var parent = this.$parent;
	    if (parent && !parent._isBeingDestroyed) {
	      parent.$children.$remove(this);
	      // unregister ref (remove: true)
	      this._updateRef(true);
	    }
	    // destroy all children.
	    i = this.$children.length;
	    while (i--) {
	      this.$children[i].$destroy();
	    }
	    // teardown props
	    if (this._propsUnlinkFn) {
	      this._propsUnlinkFn();
	    }
	    // teardown all directives. this also tearsdown all
	    // directive-owned watchers.
	    if (this._unlinkFn) {
	      this._unlinkFn();
	    }
	    i = this._watchers.length;
	    while (i--) {
	      this._watchers[i].teardown();
	    }
	    // remove reference to self on $el
	    if (this.$el) {
	      this.$el.__vue__ = null;
	    }

	    destroyReady = true;
	    cleanupIfPossible();
	  };

	  /**
	   * Clean up to ensure garbage collection.
	   * This is called after the leave transition if there
	   * is any.
	   */

	  Vue.prototype._cleanup = function () {
	    if (this._isDestroyed) {
	      return;
	    }
	    // remove self from owner fragment
	    // do it in cleanup so that we can call $destroy with
	    // defer right when a fragment is about to be removed.
	    if (this._frag) {
	      this._frag.children.$remove(this);
	    }
	    // remove reference from data ob
	    // frozen object may not have observer.
	    if (this._data && this._data.__ob__) {
	      this._data.__ob__.removeVm(this);
	    }
	    // Clean up references to private properties and other
	    // instances. preserve reference to _data so that proxy
	    // accessors still work. The only potential side effect
	    // here is that mutating the instance after it's destroyed
	    // may affect the state of other components that are still
	    // observing the same object, but that seems to be a
	    // reasonable responsibility for the user rather than
	    // always throwing an error on them.
	    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
	    // call the last hook...
	    this._isDestroyed = true;
	    this._callHook('destroyed');
	    // turn off all instance listeners.
	    this.$off();
	  };
	}

	function miscMixin (Vue) {
	  /**
	   * Apply a list of filter (descriptors) to a value.
	   * Using plain for loops here because this will be called in
	   * the getter of any watcher with filters so it is very
	   * performance sensitive.
	   *
	   * @param {*} value
	   * @param {*} [oldValue]
	   * @param {Array} filters
	   * @param {Boolean} write
	   * @return {*}
	   */

	  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
	    var filter, fn, args, arg, offset, i, l, j, k;
	    for (i = 0, l = filters.length; i < l; i++) {
	      filter = filters[write ? l - i - 1 : i];
	      fn = resolveAsset(this.$options, 'filters', filter.name, true);
	      if (!fn) continue;
	      fn = write ? fn.write : fn.read || fn;
	      if (typeof fn !== 'function') continue;
	      args = write ? [value, oldValue] : [value];
	      offset = write ? 2 : 1;
	      if (filter.args) {
	        for (j = 0, k = filter.args.length; j < k; j++) {
	          arg = filter.args[j];
	          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
	        }
	      }
	      value = fn.apply(this, args);
	    }
	    return value;
	  };

	  /**
	   * Resolve a component, depending on whether the component
	   * is defined normally or using an async factory function.
	   * Resolves synchronously if already resolved, otherwise
	   * resolves asynchronously and caches the resolved
	   * constructor on the factory.
	   *
	   * @param {String|Function} value
	   * @param {Function} cb
	   */

	  Vue.prototype._resolveComponent = function (value, cb) {
	    var factory;
	    if (typeof value === 'function') {
	      factory = value;
	    } else {
	      factory = resolveAsset(this.$options, 'components', value, true);
	    }
	    /* istanbul ignore if */
	    if (!factory) {
	      return;
	    }
	    // async component factory
	    if (!factory.options) {
	      if (factory.resolved) {
	        // cached
	        cb(factory.resolved);
	      } else if (factory.requested) {
	        // pool callbacks
	        factory.pendingCallbacks.push(cb);
	      } else {
	        factory.requested = true;
	        var cbs = factory.pendingCallbacks = [cb];
	        factory.call(this, function resolve(res) {
	          if (isPlainObject(res)) {
	            res = Vue.extend(res);
	          }
	          // cache resolved
	          factory.resolved = res;
	          // invoke callbacks
	          for (var i = 0, l = cbs.length; i < l; i++) {
	            cbs[i](res);
	          }
	        }, function reject(reason) {
	          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component' + (typeof value === 'string' ? ': ' + value : '') + '. ' + (reason ? '\nReason: ' + reason : ''));
	        });
	      }
	    } else {
	      // normal component
	      cb(factory);
	    }
	  };
	}

	var filterRE$1 = /[^|]\|[^|]/;

	function dataAPI (Vue) {
	  /**
	   * Get the value from an expression on this vm.
	   *
	   * @param {String} exp
	   * @param {Boolean} [asStatement]
	   * @return {*}
	   */

	  Vue.prototype.$get = function (exp, asStatement) {
	    var res = parseExpression(exp);
	    if (res) {
	      if (asStatement) {
	        var self = this;
	        return function statementHandler() {
	          self.$arguments = toArray(arguments);
	          var result = res.get.call(self, self);
	          self.$arguments = null;
	          return result;
	        };
	      } else {
	        try {
	          return res.get.call(this, this);
	        } catch (e) {}
	      }
	    }
	  };

	  /**
	   * Set the value from an expression on this vm.
	   * The expression must be a valid left-hand
	   * expression in an assignment.
	   *
	   * @param {String} exp
	   * @param {*} val
	   */

	  Vue.prototype.$set = function (exp, val) {
	    var res = parseExpression(exp, true);
	    if (res && res.set) {
	      res.set.call(this, this, val);
	    }
	  };

	  /**
	   * Delete a property on the VM
	   *
	   * @param {String} key
	   */

	  Vue.prototype.$delete = function (key) {
	    del(this._data, key);
	  };

	  /**
	   * Watch an expression, trigger callback when its
	   * value changes.
	   *
	   * @param {String|Function} expOrFn
	   * @param {Function} cb
	   * @param {Object} [options]
	   *                 - {Boolean} deep
	   *                 - {Boolean} immediate
	   * @return {Function} - unwatchFn
	   */

	  Vue.prototype.$watch = function (expOrFn, cb, options) {
	    var vm = this;
	    var parsed;
	    if (typeof expOrFn === 'string') {
	      parsed = parseDirective(expOrFn);
	      expOrFn = parsed.expression;
	    }
	    var watcher = new Watcher(vm, expOrFn, cb, {
	      deep: options && options.deep,
	      sync: options && options.sync,
	      filters: parsed && parsed.filters,
	      user: !options || options.user !== false
	    });
	    if (options && options.immediate) {
	      cb.call(vm, watcher.value);
	    }
	    return function unwatchFn() {
	      watcher.teardown();
	    };
	  };

	  /**
	   * Evaluate a text directive, including filters.
	   *
	   * @param {String} text
	   * @param {Boolean} [asStatement]
	   * @return {String}
	   */

	  Vue.prototype.$eval = function (text, asStatement) {
	    // check for filters.
	    if (filterRE$1.test(text)) {
	      var dir = parseDirective(text);
	      // the filter regex check might give false positive
	      // for pipes inside strings, so it's possible that
	      // we don't get any filters here
	      var val = this.$get(dir.expression, asStatement);
	      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
	    } else {
	      // no filter
	      return this.$get(text, asStatement);
	    }
	  };

	  /**
	   * Interpolate a piece of template text.
	   *
	   * @param {String} text
	   * @return {String}
	   */

	  Vue.prototype.$interpolate = function (text) {
	    var tokens = parseText(text);
	    var vm = this;
	    if (tokens) {
	      if (tokens.length === 1) {
	        return vm.$eval(tokens[0].value) + '';
	      } else {
	        return tokens.map(function (token) {
	          return token.tag ? vm.$eval(token.value) : token.value;
	        }).join('');
	      }
	    } else {
	      return text;
	    }
	  };

	  /**
	   * Log instance data as a plain JS object
	   * so that it is easier to inspect in console.
	   * This method assumes console is available.
	   *
	   * @param {String} [path]
	   */

	  Vue.prototype.$log = function (path) {
	    var data = path ? getPath(this._data, path) : this._data;
	    if (data) {
	      data = clean(data);
	    }
	    // include computed fields
	    if (!path) {
	      var key;
	      for (key in this.$options.computed) {
	        data[key] = clean(this[key]);
	      }
	      if (this._props) {
	        for (key in this._props) {
	          data[key] = clean(this[key]);
	        }
	      }
	    }
	    console.log(data);
	  };

	  /**
	   * "clean" a getter/setter converted object into a plain
	   * object copy.
	   *
	   * @param {Object} - obj
	   * @return {Object}
	   */

	  function clean(obj) {
	    return JSON.parse(JSON.stringify(obj));
	  }
	}

	function domAPI (Vue) {
	  /**
	   * Convenience on-instance nextTick. The callback is
	   * auto-bound to the instance, and this avoids component
	   * modules having to rely on the global Vue.
	   *
	   * @param {Function} fn
	   */

	  Vue.prototype.$nextTick = function (fn) {
	    nextTick(fn, this);
	  };

	  /**
	   * Append instance to target
	   *
	   * @param {Node} target
	   * @param {Function} [cb]
	   * @param {Boolean} [withTransition] - defaults to true
	   */

	  Vue.prototype.$appendTo = function (target, cb, withTransition) {
	    return insert(this, target, cb, withTransition, append, appendWithTransition);
	  };

	  /**
	   * Prepend instance to target
	   *
	   * @param {Node} target
	   * @param {Function} [cb]
	   * @param {Boolean} [withTransition] - defaults to true
	   */

	  Vue.prototype.$prependTo = function (target, cb, withTransition) {
	    target = query(target);
	    if (target.hasChildNodes()) {
	      this.$before(target.firstChild, cb, withTransition);
	    } else {
	      this.$appendTo(target, cb, withTransition);
	    }
	    return this;
	  };

	  /**
	   * Insert instance before target
	   *
	   * @param {Node} target
	   * @param {Function} [cb]
	   * @param {Boolean} [withTransition] - defaults to true
	   */

	  Vue.prototype.$before = function (target, cb, withTransition) {
	    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
	  };

	  /**
	   * Insert instance after target
	   *
	   * @param {Node} target
	   * @param {Function} [cb]
	   * @param {Boolean} [withTransition] - defaults to true
	   */

	  Vue.prototype.$after = function (target, cb, withTransition) {
	    target = query(target);
	    if (target.nextSibling) {
	      this.$before(target.nextSibling, cb, withTransition);
	    } else {
	      this.$appendTo(target.parentNode, cb, withTransition);
	    }
	    return this;
	  };

	  /**
	   * Remove instance from DOM
	   *
	   * @param {Function} [cb]
	   * @param {Boolean} [withTransition] - defaults to true
	   */

	  Vue.prototype.$remove = function (cb, withTransition) {
	    if (!this.$el.parentNode) {
	      return cb && cb();
	    }
	    var inDocument = this._isAttached && inDoc(this.$el);
	    // if we are not in document, no need to check
	    // for transitions
	    if (!inDocument) withTransition = false;
	    var self = this;
	    var realCb = function realCb() {
	      if (inDocument) self._callHook('detached');
	      if (cb) cb();
	    };
	    if (this._isFragment) {
	      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
	    } else {
	      var op = withTransition === false ? removeWithCb : removeWithTransition;
	      op(this.$el, this, realCb);
	    }
	    return this;
	  };

	  /**
	   * Shared DOM insertion function.
	   *
	   * @param {Vue} vm
	   * @param {Element} target
	   * @param {Function} [cb]
	   * @param {Boolean} [withTransition]
	   * @param {Function} op1 - op for non-transition insert
	   * @param {Function} op2 - op for transition insert
	   * @return vm
	   */

	  function insert(vm, target, cb, withTransition, op1, op2) {
	    target = query(target);
	    var targetIsDetached = !inDoc(target);
	    var op = withTransition === false || targetIsDetached ? op1 : op2;
	    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
	    if (vm._isFragment) {
	      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
	        op(node, target, vm);
	      });
	      cb && cb();
	    } else {
	      op(vm.$el, target, vm, cb);
	    }
	    if (shouldCallHook) {
	      vm._callHook('attached');
	    }
	    return vm;
	  }

	  /**
	   * Check for selectors
	   *
	   * @param {String|Element} el
	   */

	  function query(el) {
	    return typeof el === 'string' ? document.querySelector(el) : el;
	  }

	  /**
	   * Append operation that takes a callback.
	   *
	   * @param {Node} el
	   * @param {Node} target
	   * @param {Vue} vm - unused
	   * @param {Function} [cb]
	   */

	  function append(el, target, vm, cb) {
	    target.appendChild(el);
	    if (cb) cb();
	  }

	  /**
	   * InsertBefore operation that takes a callback.
	   *
	   * @param {Node} el
	   * @param {Node} target
	   * @param {Vue} vm - unused
	   * @param {Function} [cb]
	   */

	  function beforeWithCb(el, target, vm, cb) {
	    before(el, target);
	    if (cb) cb();
	  }

	  /**
	   * Remove operation that takes a callback.
	   *
	   * @param {Node} el
	   * @param {Vue} vm - unused
	   * @param {Function} [cb]
	   */

	  function removeWithCb(el, vm, cb) {
	    remove(el);
	    if (cb) cb();
	  }
	}

	function eventsAPI (Vue) {
	  /**
	   * Listen on the given `event` with `fn`.
	   *
	   * @param {String} event
	   * @param {Function} fn
	   */

	  Vue.prototype.$on = function (event, fn) {
	    (this._events[event] || (this._events[event] = [])).push(fn);
	    modifyListenerCount(this, event, 1);
	    return this;
	  };

	  /**
	   * Adds an `event` listener that will be invoked a single
	   * time then automatically removed.
	   *
	   * @param {String} event
	   * @param {Function} fn
	   */

	  Vue.prototype.$once = function (event, fn) {
	    var self = this;
	    function on() {
	      self.$off(event, on);
	      fn.apply(this, arguments);
	    }
	    on.fn = fn;
	    this.$on(event, on);
	    return this;
	  };

	  /**
	   * Remove the given callback for `event` or all
	   * registered callbacks.
	   *
	   * @param {String} event
	   * @param {Function} fn
	   */

	  Vue.prototype.$off = function (event, fn) {
	    var cbs;
	    // all
	    if (!arguments.length) {
	      if (this.$parent) {
	        for (event in this._events) {
	          cbs = this._events[event];
	          if (cbs) {
	            modifyListenerCount(this, event, -cbs.length);
	          }
	        }
	      }
	      this._events = {};
	      return this;
	    }
	    // specific event
	    cbs = this._events[event];
	    if (!cbs) {
	      return this;
	    }
	    if (arguments.length === 1) {
	      modifyListenerCount(this, event, -cbs.length);
	      this._events[event] = null;
	      return this;
	    }
	    // specific handler
	    var cb;
	    var i = cbs.length;
	    while (i--) {
	      cb = cbs[i];
	      if (cb === fn || cb.fn === fn) {
	        modifyListenerCount(this, event, -1);
	        cbs.splice(i, 1);
	        break;
	      }
	    }
	    return this;
	  };

	  /**
	   * Trigger an event on self.
	   *
	   * @param {String|Object} event
	   * @return {Boolean} shouldPropagate
	   */

	  Vue.prototype.$emit = function (event) {
	    var isSource = typeof event === 'string';
	    event = isSource ? event : event.name;
	    var cbs = this._events[event];
	    var shouldPropagate = isSource || !cbs;
	    if (cbs) {
	      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
	      // this is a somewhat hacky solution to the question raised
	      // in #2102: for an inline component listener like <comp @test="doThis">,
	      // the propagation handling is somewhat broken. Therefore we
	      // need to treat these inline callbacks differently.
	      var hasParentCbs = isSource && cbs.some(function (cb) {
	        return cb._fromParent;
	      });
	      if (hasParentCbs) {
	        shouldPropagate = false;
	      }
	      var args = toArray(arguments, 1);
	      for (var i = 0, l = cbs.length; i < l; i++) {
	        var cb = cbs[i];
	        var res = cb.apply(this, args);
	        if (res === true && (!hasParentCbs || cb._fromParent)) {
	          shouldPropagate = true;
	        }
	      }
	    }
	    return shouldPropagate;
	  };

	  /**
	   * Recursively broadcast an event to all children instances.
	   *
	   * @param {String|Object} event
	   * @param {...*} additional arguments
	   */

	  Vue.prototype.$broadcast = function (event) {
	    var isSource = typeof event === 'string';
	    event = isSource ? event : event.name;
	    // if no child has registered for this event,
	    // then there's no need to broadcast.
	    if (!this._eventsCount[event]) return;
	    var children = this.$children;
	    var args = toArray(arguments);
	    if (isSource) {
	      // use object event to indicate non-source emit
	      // on children
	      args[0] = { name: event, source: this };
	    }
	    for (var i = 0, l = children.length; i < l; i++) {
	      var child = children[i];
	      var shouldPropagate = child.$emit.apply(child, args);
	      if (shouldPropagate) {
	        child.$broadcast.apply(child, args);
	      }
	    }
	    return this;
	  };

	  /**
	   * Recursively propagate an event up the parent chain.
	   *
	   * @param {String} event
	   * @param {...*} additional arguments
	   */

	  Vue.prototype.$dispatch = function (event) {
	    var shouldPropagate = this.$emit.apply(this, arguments);
	    if (!shouldPropagate) return;
	    var parent = this.$parent;
	    var args = toArray(arguments);
	    // use object event to indicate non-source emit
	    // on parents
	    args[0] = { name: event, source: this };
	    while (parent) {
	      shouldPropagate = parent.$emit.apply(parent, args);
	      parent = shouldPropagate ? parent.$parent : null;
	    }
	    return this;
	  };

	  /**
	   * Modify the listener counts on all parents.
	   * This bookkeeping allows $broadcast to return early when
	   * no child has listened to a certain event.
	   *
	   * @param {Vue} vm
	   * @param {String} event
	   * @param {Number} count
	   */

	  var hookRE = /^hook:/;
	  function modifyListenerCount(vm, event, count) {
	    var parent = vm.$parent;
	    // hooks do not get broadcasted so no need
	    // to do bookkeeping for them
	    if (!parent || !count || hookRE.test(event)) return;
	    while (parent) {
	      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
	      parent = parent.$parent;
	    }
	  }
	}

	function lifecycleAPI (Vue) {
	  /**
	   * Set instance target element and kick off the compilation
	   * process. The passed in `el` can be a selector string, an
	   * existing Element, or a DocumentFragment (for block
	   * instances).
	   *
	   * @param {Element|DocumentFragment|string} el
	   * @public
	   */

	  Vue.prototype.$mount = function (el) {
	    if (this._isCompiled) {
	      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.', this);
	      return;
	    }
	    el = query(el);
	    if (!el) {
	      el = document.createElement('div');
	    }
	    this._compile(el);
	    this._initDOMHooks();
	    if (inDoc(this.$el)) {
	      this._callHook('attached');
	      ready.call(this);
	    } else {
	      this.$once('hook:attached', ready);
	    }
	    return this;
	  };

	  /**
	   * Mark an instance as ready.
	   */

	  function ready() {
	    this._isAttached = true;
	    this._isReady = true;
	    this._callHook('ready');
	  }

	  /**
	   * Teardown the instance, simply delegate to the internal
	   * _destroy.
	   *
	   * @param {Boolean} remove
	   * @param {Boolean} deferCleanup
	   */

	  Vue.prototype.$destroy = function (remove, deferCleanup) {
	    this._destroy(remove, deferCleanup);
	  };

	  /**
	   * Partially compile a piece of DOM and return a
	   * decompile function.
	   *
	   * @param {Element|DocumentFragment} el
	   * @param {Vue} [host]
	   * @param {Object} [scope]
	   * @param {Fragment} [frag]
	   * @return {Function}
	   */

	  Vue.prototype.$compile = function (el, host, scope, frag) {
	    return compile(el, this.$options, true)(this, el, host, scope, frag);
	  };
	}

	/**
	 * The exposed Vue constructor.
	 *
	 * API conventions:
	 * - public API methods/properties are prefixed with `$`
	 * - internal methods/properties are prefixed with `_`
	 * - non-prefixed properties are assumed to be proxied user
	 *   data.
	 *
	 * @constructor
	 * @param {Object} [options]
	 * @public
	 */

	function Vue(options) {
	  this._init(options);
	}

	// install internals
	initMixin(Vue);
	stateMixin(Vue);
	eventsMixin(Vue);
	lifecycleMixin(Vue);
	miscMixin(Vue);

	// install instance APIs
	dataAPI(Vue);
	domAPI(Vue);
	eventsAPI(Vue);
	lifecycleAPI(Vue);

	var slot = {

	  priority: SLOT,
	  params: ['name'],

	  bind: function bind() {
	    // this was resolved during component transclusion
	    var name = this.params.name || 'default';
	    var content = this.vm._slotContents && this.vm._slotContents[name];
	    if (!content || !content.hasChildNodes()) {
	      this.fallback();
	    } else {
	      this.compile(content.cloneNode(true), this.vm._context, this.vm);
	    }
	  },

	  compile: function compile(content, context, host) {
	    if (content && context) {
	      if (this.el.hasChildNodes() && content.childNodes.length === 1 && content.childNodes[0].nodeType === 1 && content.childNodes[0].hasAttribute('v-if')) {
	        // if the inserted slot has v-if
	        // inject fallback content as the v-else
	        var elseBlock = document.createElement('template');
	        elseBlock.setAttribute('v-else', '');
	        elseBlock.innerHTML = this.el.innerHTML;
	        // the else block should be compiled in child scope
	        elseBlock._context = this.vm;
	        content.appendChild(elseBlock);
	      }
	      var scope = host ? host._scope : this._scope;
	      this.unlink = context.$compile(content, host, scope, this._frag);
	    }
	    if (content) {
	      replace(this.el, content);
	    } else {
	      remove(this.el);
	    }
	  },

	  fallback: function fallback() {
	    this.compile(extractContent(this.el, true), this.vm);
	  },

	  unbind: function unbind() {
	    if (this.unlink) {
	      this.unlink();
	    }
	  }
	};

	var partial = {

	  priority: PARTIAL,

	  params: ['name'],

	  // watch changes to name for dynamic partials
	  paramWatchers: {
	    name: function name(value) {
	      vIf.remove.call(this);
	      if (value) {
	        this.insert(value);
	      }
	    }
	  },

	  bind: function bind() {
	    this.anchor = createAnchor('v-partial');
	    replace(this.el, this.anchor);
	    this.insert(this.params.name);
	  },

	  insert: function insert(id) {
	    var partial = resolveAsset(this.vm.$options, 'partials', id, true);
	    if (partial) {
	      this.factory = new FragmentFactory(this.vm, partial);
	      vIf.insert.call(this);
	    }
	  },

	  unbind: function unbind() {
	    if (this.frag) {
	      this.frag.destroy();
	    }
	  }
	};

	var elementDirectives = {
	  slot: slot,
	  partial: partial
	};

	var convertArray = vFor._postProcess;

	/**
	 * Limit filter for arrays
	 *
	 * @param {Number} n
	 * @param {Number} offset (Decimal expected)
	 */

	function limitBy(arr, n, offset) {
	  offset = offset ? parseInt(offset, 10) : 0;
	  n = toNumber(n);
	  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
	}

	/**
	 * Filter filter for arrays
	 *
	 * @param {String} search
	 * @param {String} [delimiter]
	 * @param {String} ...dataKeys
	 */

	function filterBy(arr, search, delimiter) {
	  arr = convertArray(arr);
	  if (search == null) {
	    return arr;
	  }
	  if (typeof search === 'function') {
	    return arr.filter(search);
	  }
	  // cast to lowercase string
	  search = ('' + search).toLowerCase();
	  // allow optional `in` delimiter
	  // because why not
	  var n = delimiter === 'in' ? 3 : 2;
	  // extract and flatten keys
	  var keys = Array.prototype.concat.apply([], toArray(arguments, n));
	  var res = [];
	  var item, key, val, j;
	  for (var i = 0, l = arr.length; i < l; i++) {
	    item = arr[i];
	    val = item && item.$value || item;
	    j = keys.length;
	    if (j) {
	      while (j--) {
	        key = keys[j];
	        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
	          res.push(item);
	          break;
	        }
	      }
	    } else if (contains(item, search)) {
	      res.push(item);
	    }
	  }
	  return res;
	}

	/**
	 * Filter filter for arrays
	 *
	 * @param {String|Array<String>|Function} ...sortKeys
	 * @param {Number} [order]
	 */

	function orderBy(arr) {
	  var comparator = null;
	  var sortKeys = undefined;
	  arr = convertArray(arr);

	  // determine order (last argument)
	  var args = toArray(arguments, 1);
	  var order = args[args.length - 1];
	  if (typeof order === 'number') {
	    order = order < 0 ? -1 : 1;
	    args = args.length > 1 ? args.slice(0, -1) : args;
	  } else {
	    order = 1;
	  }

	  // determine sortKeys & comparator
	  var firstArg = args[0];
	  if (!firstArg) {
	    return arr;
	  } else if (typeof firstArg === 'function') {
	    // custom comparator
	    comparator = function (a, b) {
	      return firstArg(a, b) * order;
	    };
	  } else {
	    // string keys. flatten first
	    sortKeys = Array.prototype.concat.apply([], args);
	    comparator = function (a, b, i) {
	      i = i || 0;
	      return i >= sortKeys.length - 1 ? baseCompare(a, b, i) : baseCompare(a, b, i) || comparator(a, b, i + 1);
	    };
	  }

	  function baseCompare(a, b, sortKeyIndex) {
	    var sortKey = sortKeys[sortKeyIndex];
	    if (sortKey) {
	      if (sortKey !== '$key') {
	        if (isObject(a) && '$value' in a) a = a.$value;
	        if (isObject(b) && '$value' in b) b = b.$value;
	      }
	      a = isObject(a) ? getPath(a, sortKey) : a;
	      b = isObject(b) ? getPath(b, sortKey) : b;
	    }
	    return a === b ? 0 : a > b ? order : -order;
	  }

	  // sort on a copy to avoid mutating original array
	  return arr.slice().sort(comparator);
	}

	/**
	 * String contain helper
	 *
	 * @param {*} val
	 * @param {String} search
	 */

	function contains(val, search) {
	  var i;
	  if (isPlainObject(val)) {
	    var keys = Object.keys(val);
	    i = keys.length;
	    while (i--) {
	      if (contains(val[keys[i]], search)) {
	        return true;
	      }
	    }
	  } else if (isArray(val)) {
	    i = val.length;
	    while (i--) {
	      if (contains(val[i], search)) {
	        return true;
	      }
	    }
	  } else if (val != null) {
	    return val.toString().toLowerCase().indexOf(search) > -1;
	  }
	}

	var digitsRE = /(\d{3})(?=\d)/g;

	// asset collections must be a plain object.
	var filters = {

	  orderBy: orderBy,
	  filterBy: filterBy,
	  limitBy: limitBy,

	  /**
	   * Stringify value.
	   *
	   * @param {Number} indent
	   */

	  json: {
	    read: function read(value, indent) {
	      return typeof value === 'string' ? value : JSON.stringify(value, null, arguments.length > 1 ? indent : 2);
	    },
	    write: function write(value) {
	      try {
	        return JSON.parse(value);
	      } catch (e) {
	        return value;
	      }
	    }
	  },

	  /**
	   * 'abc' => 'Abc'
	   */

	  capitalize: function capitalize(value) {
	    if (!value && value !== 0) return '';
	    value = value.toString();
	    return value.charAt(0).toUpperCase() + value.slice(1);
	  },

	  /**
	   * 'abc' => 'ABC'
	   */

	  uppercase: function uppercase(value) {
	    return value || value === 0 ? value.toString().toUpperCase() : '';
	  },

	  /**
	   * 'AbC' => 'abc'
	   */

	  lowercase: function lowercase(value) {
	    return value || value === 0 ? value.toString().toLowerCase() : '';
	  },

	  /**
	   * 12345 => $12,345.00
	   *
	   * @param {String} sign
	   * @param {Number} decimals Decimal places
	   */

	  currency: function currency(value, _currency, decimals) {
	    value = parseFloat(value);
	    if (!isFinite(value) || !value && value !== 0) return '';
	    _currency = _currency != null ? _currency : '$';
	    decimals = decimals != null ? decimals : 2;
	    var stringified = Math.abs(value).toFixed(decimals);
	    var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
	    var i = _int.length % 3;
	    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
	    var _float = decimals ? stringified.slice(-1 - decimals) : '';
	    var sign = value < 0 ? '-' : '';
	    return sign + _currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
	  },

	  /**
	   * 'item' => 'items'
	   *
	   * @params
	   *  an array of strings corresponding to
	   *  the single, double, triple ... forms of the word to
	   *  be pluralized. When the number to be pluralized
	   *  exceeds the length of the args, it will use the last
	   *  entry in the array.
	   *
	   *  e.g. ['single', 'double', 'triple', 'multiple']
	   */

	  pluralize: function pluralize(value) {
	    var args = toArray(arguments, 1);
	    var length = args.length;
	    if (length > 1) {
	      var index = value % 10 - 1;
	      return index in args ? args[index] : args[length - 1];
	    } else {
	      return args[0] + (value === 1 ? '' : 's');
	    }
	  },

	  /**
	   * Debounce a handler function.
	   *
	   * @param {Function} handler
	   * @param {Number} delay = 300
	   * @return {Function}
	   */

	  debounce: function debounce(handler, delay) {
	    if (!handler) return;
	    if (!delay) {
	      delay = 300;
	    }
	    return _debounce(handler, delay);
	  }
	};

	function installGlobalAPI (Vue) {
	  /**
	   * Vue and every constructor that extends Vue has an
	   * associated options object, which can be accessed during
	   * compilation steps as `this.constructor.options`.
	   *
	   * These can be seen as the default options of every
	   * Vue instance.
	   */

	  Vue.options = {
	    directives: directives,
	    elementDirectives: elementDirectives,
	    filters: filters,
	    transitions: {},
	    components: {},
	    partials: {},
	    replace: true
	  };

	  /**
	   * Expose useful internals
	   */

	  Vue.util = util;
	  Vue.config = config;
	  Vue.set = set;
	  Vue['delete'] = del;
	  Vue.nextTick = nextTick;

	  /**
	   * The following are exposed for advanced usage / plugins
	   */

	  Vue.compiler = compiler;
	  Vue.FragmentFactory = FragmentFactory;
	  Vue.internalDirectives = internalDirectives;
	  Vue.parsers = {
	    path: path,
	    text: text,
	    template: template,
	    directive: directive,
	    expression: expression
	  };

	  /**
	   * Each instance constructor, including Vue, has a unique
	   * cid. This enables us to create wrapped "child
	   * constructors" for prototypal inheritance and cache them.
	   */

	  Vue.cid = 0;
	  var cid = 1;

	  /**
	   * Class inheritance
	   *
	   * @param {Object} extendOptions
	   */

	  Vue.extend = function (extendOptions) {
	    extendOptions = extendOptions || {};
	    var Super = this;
	    var isFirstExtend = Super.cid === 0;
	    if (isFirstExtend && extendOptions._Ctor) {
	      return extendOptions._Ctor;
	    }
	    var name = extendOptions.name || Super.options.name;
	    if (process.env.NODE_ENV !== 'production') {
	      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
	        warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
	        name = null;
	      }
	    }
	    var Sub = createClass(name || 'VueComponent');
	    Sub.prototype = Object.create(Super.prototype);
	    Sub.prototype.constructor = Sub;
	    Sub.cid = cid++;
	    Sub.options = mergeOptions(Super.options, extendOptions);
	    Sub['super'] = Super;
	    // allow further extension
	    Sub.extend = Super.extend;
	    // create asset registers, so extended classes
	    // can have their private assets too.
	    config._assetTypes.forEach(function (type) {
	      Sub[type] = Super[type];
	    });
	    // enable recursive self-lookup
	    if (name) {
	      Sub.options.components[name] = Sub;
	    }
	    // cache constructor
	    if (isFirstExtend) {
	      extendOptions._Ctor = Sub;
	    }
	    return Sub;
	  };

	  /**
	   * A function that returns a sub-class constructor with the
	   * given name. This gives us much nicer output when
	   * logging instances in the console.
	   *
	   * @param {String} name
	   * @return {Function}
	   */

	  function createClass(name) {
	    /* eslint-disable no-new-func */
	    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
	    /* eslint-enable no-new-func */
	  }

	  /**
	   * Plugin system
	   *
	   * @param {Object} plugin
	   */

	  Vue.use = function (plugin) {
	    /* istanbul ignore if */
	    if (plugin.installed) {
	      return;
	    }
	    // additional parameters
	    var args = toArray(arguments, 1);
	    args.unshift(this);
	    if (typeof plugin.install === 'function') {
	      plugin.install.apply(plugin, args);
	    } else {
	      plugin.apply(null, args);
	    }
	    plugin.installed = true;
	    return this;
	  };

	  /**
	   * Apply a global mixin by merging it into the default
	   * options.
	   */

	  Vue.mixin = function (mixin) {
	    Vue.options = mergeOptions(Vue.options, mixin);
	  };

	  /**
	   * Create asset registration methods with the following
	   * signature:
	   *
	   * @param {String} id
	   * @param {*} definition
	   */

	  config._assetTypes.forEach(function (type) {
	    Vue[type] = function (id, definition) {
	      if (!definition) {
	        return this.options[type + 's'][id];
	      } else {
	        /* istanbul ignore if */
	        if (process.env.NODE_ENV !== 'production') {
	          if (type === 'component' && (commonTagRE.test(id) || reservedTagRE.test(id))) {
	            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
	          }
	        }
	        if (type === 'component' && isPlainObject(definition)) {
	          if (!definition.name) {
	            definition.name = id;
	          }
	          definition = Vue.extend(definition);
	        }
	        this.options[type + 's'][id] = definition;
	        return definition;
	      }
	    };
	  });

	  // expose internal transition API
	  extend(Vue.transition, transition);
	}

	installGlobalAPI(Vue);

	Vue.version = '1.0.26';

	// devtools global hook
	/* istanbul ignore next */
	setTimeout(function () {
	  if (config.devtools) {
	    if (devtools) {
	      devtools.emit('init', Vue);
	    } else if (process.env.NODE_ENV !== 'production' && inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
	      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
	    }
	  }
	}, 0);

	module.exports = Vue;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strictUriEncode = __webpack_require__(4);
	var objectAssign = __webpack_require__(5);

	function encode(value, opts) {
		if (opts.encode) {
			return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
		}

		return value;
	}

	exports.extract = function (str) {
		return str.split('?')[1] || '';
	};

	exports.parse = function (str) {
		// Create an object with no prototype
		// https://github.com/sindresorhus/query-string/issues/47
		var ret = Object.create(null);

		if (typeof str !== 'string') {
			return ret;
		}

		str = str.trim().replace(/^(\?|#|&)/, '');

		if (!str) {
			return ret;
		}

		str.split('&').forEach(function (param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			// Firefox (pre 40) decodes `%3D` to `=`
			// https://github.com/sindresorhus/query-string/pull/37
			var key = parts.shift();
			var val = parts.length > 0 ? parts.join('=') : undefined;

			key = decodeURIComponent(key);

			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (ret[key] === undefined) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}
		});

		return ret;
	};

	exports.stringify = function (obj, opts) {
		var defaults = {
			encode: true,
			strict: true
		};

		opts = objectAssign(defaults, opts);

		return obj ? Object.keys(obj).sort().map(function (key) {
			var val = obj[key];

			if (val === undefined) {
				return '';
			}

			if (val === null) {
				return encode(key, opts);
			}

			if (Array.isArray(val)) {
				var result = [];

				val.slice().forEach(function (val2) {
					if (val2 === undefined) {
						return;
					}

					if (val2 === null) {
						result.push(encode(key, opts));
					} else {
						result.push(encode(key, opts) + '=' + encode(val2, opts));
					}
				});

				return result.join('&');
			}

			return encode(key, opts) + '=' + encode(val, opts);
		}).filter(function (x) {
			return x.length > 0;
		}).join('&') : '';
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function (str) {
		return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
			return '%' + c.charCodeAt(0).toString(16).toUpperCase();
		});
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Vue = __webpack_require__(1),
	    request = __webpack_require__(7),
	    Modal = __webpack_require__(12);

	// testing call
	//var apiUrl = 'https://labs.bootstrap.fyre.co/bs3/v3.1/labs.fyre.co/315833/ZGVzaWduZXItYXBwLTE0NzMxOTk2OTQ3NDE=/';

	//prod call
	var apiUrl = 'https://adobecom.bootstrap.fyre.co/bs3/v3.1/adobecom.fyre.co/382839/ZGVzaWduZXItYXBwLTE0NzMxODczMzUxMzQ=/';

	module.exports = Vue.extend({
	  template: __webpack_require__(13),
	  props: {
	    isMobile: {
	      type: Boolean,
	      required: true
	    }
	  },
	  data: function() {
	    return {
	      archiveInfo: null,
	      extraItems: [],
	      currentPage: 0,
	      showMore: true,
	      items: []
	    }
	  },
	  methods: {
	    getMore: function () {
	      var self = this,
	          nextPage = self.currentPage - 1;

	      if(self.extraItems.length < 6 && (nextPage >= 0)) {
	        request.get(apiUrl + nextPage + '.json')
	        .end(function(err, res) {
	          if(err) {
	            console.log(err);
	            return;
	          }

	          var content = self.filterResults(res.body.content).reverse();

	          self.extraItems = self.extraItems.concat(content);
	          self.items = self.items.concat(self.extraItems.splice(0, 6));
	          self.currentPage = nextPage;

	          if(self.extraItems === 0 && self.currentPage === 0) {
	            self.showMore = false;
	          }
	        });
	      } else {
	        self.items = self.items.concat(self.extraItems.splice(0, 6));

	        if(self.extraItems.length === 0 && self.currentPage === 0) {
	          self.showMore = false;
	        }
	      }
	    },
	    filterResults: function(results) {
	      return results.filter(function(item) {
	        var data = item.content.attachments || [],
	            mainAttachment;

	        data.some(function(attachment) {
	          if(attachment.type === 'photo' &&
	              (attachment.provider_name === 'Twitter' || attachment.provider_name === 'Instagram')) {
	            mainAttachment = attachment;
	          }

	          return mainAttachment != null;
	        });

	        if(data && mainAttachment) {
	          data[0] = mainAttachment;
	          return true;
	        } else {
	          return false;
	        }
	      });
	    },
	    enlargeImage: function(item) {

	      var modalProps = {
	        imageSrc: item.content.attachments[0].url,
	        author: item.content.attachments[0].author_name,
	        source: item.content.attachments[0].provider_name,
	        link: item.content.attachments[0].link
	      };

	      if(item.content.attachments[0].provider_name === 'Instagram') {
	        modalProps.imageSrc = modalProps.imageSrc.replace('/s640x640', '');
	      }

	      Modal.show(modalProps);

	      s_adbadobenonacdc.linkTrackVars = 'channel,prop3,prop4,prop5,eVar12';
	      s_adbadobenonacdc.tl(this, 'o', 'max.adobe.com:logobuilder:gallery');
	    }
	  },
	  created: function() {
	    var self = this;

	    request.get(
	        apiUrl + 'init'
	    ).end(function(err, res) {
	      if(err) {
	        console.log(err);
	        return;
	      }

	      self.archiveInfo = res.body.collectionSettings.archiveInfo;

	      self.currentPage = self.archiveInfo.nPages - 1;

	      request.get(
	          apiUrl + self.currentPage + '.json'
	      ).end(function(err, res) {
	        var content = self.filterResults(res.body.content);
	            content = content.reverse();

	        self.items = content.splice(0, 6);
	        self.extraItems = content;

	        if(self.extraItems.length === 0) {
	          self.showMore = false;
	        }
	      });
	    });
	  }
	});


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Root reference for iframes.
	 */

	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  console.warn("Using browser-only version of superagent in non-browser environment");
	  root = this;
	}

	var Emitter = __webpack_require__(8);
	var requestBase = __webpack_require__(9);
	var isObject = __webpack_require__(10);

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Expose `request`.
	 */

	var request = module.exports = __webpack_require__(11).bind(null, Request);

	/**
	 * Determine XHR.
	 */

	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  throw Error("Browser-only verison of superagent could not find XHR");
	};

	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */

	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */

	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    pushEncodedKeyValuePair(pairs, key, obj[key]);
	  }
	  return pairs.join('&');
	}

	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */

	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (val != null) {
	    if (Array.isArray(val)) {
	      val.forEach(function(v) {
	        pushEncodedKeyValuePair(pairs, key, v);
	      });
	    } else if (isObject(val)) {
	      for(var subkey in val) {
	        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
	      }
	    } else {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(val));
	    }
	  } else if (val === null) {
	    pairs.push(encodeURIComponent(key));
	  }
	}

	/**
	 * Expose serialization method.
	 */

	 request.serializeObject = serialize;

	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */

	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var pair;
	  var pos;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    pos = pair.indexOf('=');
	    if (pos == -1) {
	      obj[decodeURIComponent(pair)] = '';
	    } else {
	      obj[decodeURIComponent(pair.slice(0, pos))] =
	        decodeURIComponent(pair.slice(pos + 1));
	    }
	  }

	  return obj;
	}

	/**
	 * Expose parser.
	 */

	request.parseString = parseString;

	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */

	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };

	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */

	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};

	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;

	  lines.pop(); // trailing CRLF

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }

	  return fields;
	}

	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */

	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function type(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function params(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */),
	        key = parts.shift(),
	        val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */

	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this._setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this._setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this._parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype._setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);

	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};

	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */

	Response.prototype._parseBody = function(str){
	  var parse = request.parse[this.type];
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype._setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }

	  var type = status / 100 | 0;

	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;

	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;

	  return err;
	};

	/**
	 * Expose `Response`.
	 */

	request.Response = Response;

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */

	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;

	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
	      return self.callback(err);
	    }

	    self.emit('response', res);

	    var new_err;
	    try {
	      if (res.status < 200 || res.status >= 300) {
	        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	        new_err.original = err;
	        new_err.response = res;
	        new_err.status = res.status;
	      }
	    } catch(e) {
	      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
	    }

	    // #1000 don't catch errors from the callback to avoid double calling it
	    if (new_err) {
	      self.callback(new_err, res);
	    } else {
	      self.callback(null, res);
	    }
	  });
	}

	/**
	 * Mixin `Emitter` and `requestBase`.
	 */

	Emitter(Request.prototype);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}

	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};

	/**
	 * Set responseType to `val`. Presently valid responseTypes are 'blob' and
	 * 'arraybuffer'.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};

	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'basic'
	    }
	  }

	  switch (options.type) {
	    case 'basic':
	      var str = btoa(user + ':' + pass);
	      this.set('Authorization', 'Basic ' + str);
	    break;

	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};

	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/

	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  this._getFormData().append(field, file, filename || file.name);
	  return this;
	};

	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};

	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */

	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;

	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;

	  this.callback(err);
	};

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	Request.prototype._timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};

	/**
	 * Compose querystring to append to req.url
	 *
	 * @api private
	 */

	Request.prototype._appendQueryString = function(){
	  var query = this._query.join('&');
	  if (query) {
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }
	};

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var timeout = this._timeout;
	  var data = this._formData || this._data;

	  // store callback
	  this._callback = fn || noop;

	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;

	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }

	    if (0 == status) {
	      if (self.timedout) return self._timeoutError();
	      if (self._aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = 'download';
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }

	  // querystring
	  this._appendQueryString();

	  // initiate request
	  if (this.username && this.password) {
	    xhr.open(this.method, this.url, true, this.username, this.password);
	  } else {
	    xhr.open(this.method, this.url, true);
	  }

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }

	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }

	  // send stuff
	  this.emit('request', this);

	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};


	/**
	 * Expose `Request`.
	 */

	request.Request = Request;

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * OPTIONS query to `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.options = function(url, data, fn){
	  var req = request('OPTIONS', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};

	request['del'] = del;
	request['delete'] = del;

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	if (true) {
	  module.exports = Emitter;
	}

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(10);

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Override default response body parser
	 *
	 * This function will be called to convert incoming data into request.body
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Override default request body serializer
	 *
	 * This function will be called to convert data set via .send or .attach into payload to send
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.serialize = function serialize(fn){
	  this._serializer = fn;
	  return this;
	};

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Promise support
	 *
	 * @param {Function} resolve
	 * @param {Function} reject
	 * @return {Request}
	 */

	exports.then = function then(resolve, reject) {
	  if (!this._fullfilledPromise) {
	    var self = this;
	    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
	      self.end(function(err, res){
	        if (err) innerReject(err); else innerResolve(res);
	      });
	    });
	  }
	  return this._fullfilledPromise.then(resolve, reject);
	}

	/**
	 * Allow for extension
	 */

	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}


	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */

	exports.getHeader = exports.get;

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	  this._getFormData().append(name, val);
	  return this;
	};

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	exports.abort = function(){
	  if (this._aborted) {
	    return this;
	  }
	  this._aborted = true;
	  this.xhr && this.xhr.abort(); // browser
	  this.req && this.req.abort(); // node
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */

	exports.withCredentials = function(){
	  // This is browser-only functionality. Node side is no-op.
	  this._withCredentials = true;
	  return this;
	};

	/**
	 * Set the max redirects to `n`. Does noting in browser XHR implementation.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.redirects = function(n){
	  this._maxRedirects = n;
	  return this;
	};

	/**
	 * Convert to a plain javascript object (not JSON string) of scalar properties.
	 * Note as this method is designed to return a useful non-this value,
	 * it cannot be chained.
	 *
	 * @return {Object} describing method, url, and data of this request
	 * @api public
	 */

	exports.toJSON = function(){
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data,
	    headers: this._header
	  };
	};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	exports._isHost = function _isHost(obj) {
	  var str = {}.toString.call(obj);

	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}

	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	 *      request.post('/user')
	 *        .send('name=tobi')
	 *        .send('species=ferret')
	 *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];

	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj || this._isHost(data)) return this;

	  // default to json
	  if (!type) this.type('json');
	  return this;
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null !== obj && 'object' === typeof obj;
	}

	module.exports = isObject;


/***/ },
/* 11 */
/***/ function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }

	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }

	  return new RequestConstructor(method, url);
	}

	module.exports = request;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var Vue = __webpack_require__(1);

	modalView = new Vue({
	  el: "#image-enlarge-modal",
	  data: {
	    isOpen: false,
	    image: '',
	    link: '',
	    author: '',
	    source: '',
	    modalStyles: {
	      top: 0
	    }
	  },
	  methods: {
	    show: function(item) {
	      this.image = item.imageSrc;
	      this.author = item.author;
	      this.link = item.link;
	      this.source = item.source;
	      this.isOpen = true;
	      this.modalStyles.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
	      document.body.classList.add('modal-open');
	    },
	    hide: function() {
	      document.body.classList.remove('modal-open');
	      this.isOpen = false;
	    }
	  }
	});

	module.exports = modalView;


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = "<section id=\"gallery\">\n    <h2>gallery</h2>\n    <p class=\"gallery-details\">\n        Want your MAX logo included in our gallery? Share it on Twitter or Instagram, set post to public, and add the hashtag in your post with\n        <span class=\"logo-hashtag\">#myMAXlogo</span>\n        so we can find it. Check back often as we continue to post new logos.\n    </p>\n    <ul class=\"logo-list\">\n        <li v-for=\"item in items\" v-if=\"item.content.attachments\">\n            <template v-if=\"isMobile\">\n                <a href=\"{{item.content.attachments[0].link}}\" target=\"_blank\">\n                    <img v-if=\"item.content.attachments[0].provider_name === 'Instagram'\" v-bind:src=\"item.content.attachments[0].thumbnail_url.replace('/s320x320', '')\" alt=\"\" />\n                    <img v-else v-bind:src=\"item.content.attachments[0].thumbnail_url\" alt=\"\"  />\n                    {{item.content.attachments[0].author_name}}\n                </a>\n            </template>\n            <template v-else>\n                <a href=\"#\" @click.prevent=\"enlargeImage(item)\">\n                    <img v-if=\"item.content.attachments[0].provider_name === 'Instagram'\" v-bind:src=\"item.content.attachments[0].thumbnail_url.replace('/s320x320', '')\" alt=\"\" />\n                    <img v-else v-bind:src=\"item.content.attachments[0].thumbnail_url\" alt=\"\"  />\n                    {{item.content.attachments[0].author_name}}\n                </a>\n\n            </template>\n        </li>\n    </ul>\n    <button @click=\"getMore\" v-show=\"showMore\">See more</button>\n</section>\n";

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "<section id=\"logo-creator\" xmlns:v-bind=\"http://www.w3.org/1999/xhtml\">\n    <div class=\"desktop-controls\" v-if=\"!isMobile\">\n        <div class=\"logo-creator-canvas\">\n            <figure>\n                <img src=\"img/desktop-canvas.jpg\" alt=\"\">\n            </figure>\n            <div class=\"selected-images\">\n                <div class=\"canvas-wrap\" v-canvas-append=\"letters.m.elemResult\"></div>\n                <div class=\"canvas-wrap\" v-canvas-append=\"letters.a.elemResult\"></div>\n                <div class=\"canvas-wrap\" v-canvas-append=\"letters.x.elemResult\"></div>\n            </div>\n        </div>\n        <div class=\"logo-creator-canvas-controls\">\n            <image-selector v-on:image-selected=\"updateLetter\" v-bind:letter=\"letters.m\"></image-selector>\n            <image-selector v-on:image-selected=\"updateLetter\" v-bind:letter=\"letters.a\"></image-selector>\n            <image-selector v-on:image-selected=\"updateLetter\" v-bind:letter=\"letters.x\"></image-selector>\n        </div>\n        <div class=\"save\">\n            <div class=\"terms\">\n                <div class=\"terms-checkbox\">\n                    <span class=\"checkbox-wrap\">\n                        <input type=\"checkbox\" v-model=\"termsAgreed\" id=\"terms-check\">\n                        <label for=\"terms-check\">\n                            <span></span>\n                        </label>\n                    </span>\n                </div>\n                <div class=\"terms-text\">\n                    By clicking this box, I agree to abide by the <a href=\"http://www.adobe.com/legal/terms.html\" target=\"_blank\">terms and conditions</a> and <a href=\"http://www.adobe.com/privacy.html\" target=\"_blank\"> Privacy Policy.</a>\n                    <span class=\"read-more-content\" v-show=\"expandTerms\">\n                    I additionally also grant Adobe, a worldwide, royalty-free, non-exclusive license, under any and all rights, to use, publicly perform and publically display, publish (or not publish), in whole or in part, in the gallery on this website and MAX keynote screen, your publically shared post created at this website and tagged with #myMAXlogo, together with your name, and/or likeness.\n                    </span>\n                </div>\n                <a class=\"read-more-link\" v-on:click=\"expandTerms = !expandTerms\">Read <span v-if=\"expandTerms\">less</span> <span v-else>more</span> <span class=\"arrow\" v-bind:class=\"{'expanded': expandTerms}\"></span></a>\n            </div>\n\n            <button class=\"save-btn btn-secondary\" v-on:click=\"saveImage(true)\" v-bind:class=\"{'disabled': !termsAgreed || !isPreviewReady()}\">Save</button>\n        </div>\n        <hr class=\"save-divider\" />\n        <div class=\"share-text-wrap\">\n            <div class=\"share-icons\">\n                <a href=\"//twitter.com\" class=\"icon tw\" target=\"_blank\"></a>\n                <a href=\"//instagram.com\" class=\"icon insta\" target=\"_blank\"></a>\n            </div>\n            <p class=\"share-text\">\n                Then log in to Twitter or Instagram, post your logo, and add this hashtag in your post\n                <div class=\"share-details\">\n                    <span class=\"logo-hashtag\">#myMAXlogo</span>\n                </div>\n            </p>\n        </div>\n    </div>\n    <div class=\"mobile-controls\" v-else>\n        <div class=\"builder\" v-if=\"!previewImage\">\n            <figure class=\"active-image\">\n                <img v-bind:src=\"currentLetter.canvasBg\" alt=\"\">\n                <div class=\"image-wrap\" v-canvas-append=\"currentLetter.elemResult\">\n                </div>\n\n                <image-selector v-on:image-selected=\"updateLetter\"></image-selector>\n            </figure>\n            <ul class=\"selector\">\n                <li @click=\"currentLetter = letters.m\" v-bind:class=\"{ 'active': currentLetter === letters.m}\">\n                    <figure class=\"selector-image\">\n                        <span class=\"logo-m\"></span>\n                    </figure>\n                    <span class=\"active-dot\" v-bind:class=\"{ 'image-selected': letters.m.elemResult != null}\"></span>\n                </li>\n                <li @click=\"currentLetter = letters.a\" v-bind:class=\"{ 'active': currentLetter === letters.a}\">\n                    <figure class=\"selector-image\">\n                        <span class=\"logo-a\"></span>\n                    </figure>\n                    <span class=\"active-dot\" v-bind:class=\"{ 'image-selected': letters.a.elemResult != null}\"></span>\n                </li>\n                <li @click=\"currentLetter = letters.x\" v-bind:class=\"{ 'active': currentLetter === letters.x}\">\n                    <figure class=\"selector-image\">\n                        <span class=\"logo-x\"></span>\n                    </figure>\n                    <span class=\"active-dot\" v-bind:class=\"{ 'image-selected': letters.x.elemResult != null}\"></span>\n                </li>\n            </ul>\n\n            <button class=\"preview-btn btn-secondary\" v-show=\"isPreviewReady()\" v-on:click=\"generatePreview\">Preview</button>\n        </div>\n        <div class=\"preview\" v-else>\n            <figure class=\"preview-image\">\n                <img v-bind:src=\"previewImage\">\n            </figure>\n\n            <div class=\"save-prompt\" v-show=\"previewImage\">\n                <div class=\"terms\">\n                    <div class=\"terms-checkbox\">\n                    <span class=\"checkbox-wrap\">\n                        <input type=\"checkbox\" v-model=\"termsAgreed\" id=\"terms-check\">\n                        <label for=\"terms-check\">\n                            <span></span>\n                        </label>\n                    </span>\n                    </div>\n                    <div class=\"terms-text\">\n                        By clicking this box, I agree to abide by the <a href=\"http://www.adobe.com/legal/terms.html\" target=\"_blank\">terms and conditions</a> and <a href=\"http://www.adobe.com/privacy.html\" target=\"_blank\"> Privacy Policy.</a>\n                        <span class=\"read-more-content\" v-show=\"expandTerms\">\n                            I additionally also grant Adobe, a worldwide, royalty-free, non-exclusive license, under any and all rights, to use, publicly perform and publically display, publish (or not publish), in whole or in part, in the gallery on this website and MAX keynote screen, your publically shared post created at this website and tagged with #myMAXlogo, together with your name, and/or likeness.\n                        </span>\n                    </div>\n                    <a class=\"read-more-link\" v-on:click=\"expandTerms = !expandTerms\">Read <span v-if=\"expandTerms\">less</span> <span v-else>more</span> <span class=\"arrow\" v-bind:class=\"{'expanded': expandTerms}\"></span></a>\n                </div>\n                <div class=\"save-buttons\">\n                    <button v-on:click=\"saveImage\" v-bind:class=\"{'disabled': !termsAgreed || !isPreviewReady()}\">Save</button>\n                    <button class=\"btn-secondary\" v-on:click=\"revertToLogo\">Edit</button>\n                </div>\n            </div>\n        </div>\n        <hr />\n        <div class=\"share-text-wrap\">\n            <div class=\"share-logos\">\n                <a href=\"//twitter.com\" class=\"icon tw\" target=\"_blank\"></a>\n                <a href=\"//instagram.com\" class=\"icon insta\" target=\"_blank\"></a>\n            </div>\n\n            <p class=\"share-text\">\n                Then log in to Twitter or Instagram, post your logo, and add this hashtag in your post\n                <div class=\"share-details\">\n                    <span class=\"logo-hashtag\">#myMAXlogo</span>\n                </div>\n            </p>\n        </div>\n    </div>\n</section>\n";

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "<span class=\"selector-wrap\">\n    <button class=\"select-image-btn\">\n        Choose an image\n    </button>\n    <input type=\"file\" v-el:image-selector @change=\"onFileSelected\" @click=\"setValToNull\">\n</span>\n";

/***/ }
/******/ ]);