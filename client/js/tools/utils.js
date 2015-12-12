(function(ns) {

	var util = {};

	var fs;
	var path;

	var request;
	var extend;

	var $;

	var serverside = false;

	if ("undefined" === typeof window) {
		// on the server-side
		serverside = true;

		fs = require("fs");
		path = require("path");
		try {
			extend = require("extend");
		} catch (e){}
		try {
			request = require("request");
		} catch (e){}
	} else {
		// in browser
		$ = ns.$ || ns.jQuery || ""; // if jquery not available, make the $ a falsy object
		extend = $.extend;
		request = $.ajax;
	}

	/*
	 General use
	 */

	var merge = util.merge = function() {
		var result = {}, obj, keys;
		for (var i = 0; i < arguments.length; i++) {
			obj = arguments[i] || {};
			keys = Object.keys(obj);
			for (var j = 0; j < keys.length; j++) {
				result[keys[j]] = obj[keys[j]];
			}
		}
		return result;
	};

	var recurseObject = util.recurseObject = function (object, onKeypathFn, keypathPrefix) {
		for (var property in object) {
			if (object.hasOwnProperty(property)) {
				if (typeof object[property] === "object"){
					recurseObject(object[property], onKeypathFn, keypathPrefix ? keypathPrefix + "." + property : property);
				} else {
					onKeypathFn(keypathPrefix ? keypathPrefix + "." + property : property, object[property]);
				}
			}
		}
	};

	var resolveType = util.resolve = util.resolveType = function (token) {
		// guesses and resolves type of a string
		if( typeof token != "string")
			return token;

		if( token.length < 15 && token.match(/^-?\d+(\.\d+)?$/) ){
			token = parseFloat(token);
		} else if( token.match(/^true|false$/i) ){
			token = Boolean( token.match(/true/i) );
		} else if(token === "undefined" ) {
			token = undefined;
		} else if(token === "null" ){
			token = null;
		}

		return token;
	};

	var augmentFunction = util.augmentFn = util.augmentFunction = function (base, extra, context) {
		return (function () {
			return function () {
				base.apply(context || this, arguments);
				extra.apply(context || this, arguments);
			};
		})();
	};

	var noop = util.noop = function(s) {
		return s;
	};

	var buildFunction = util.buildFn = util.buildFunction = function(js, argsNames, returnVarName) {
		var fn;

		argsNames = argsNames || [];
		try {
			fn = Function.apply(null, [argsNames.join(','), (js || '') + '\nreturn ' + (returnVarName || '') + ';' ]);
		} catch (e) {
			console.warn(js + '\nhas invalid javascript, ignoring...', e);
			fn = noop;
		}
		try {
			fn("test"); // meh
		} catch (e) {
			console.warn(js + '\n fn("test"); caused a runtime error, either fix your code or be more defensive, ignoring...', e);
			fn = noop;
		}
		return fn;
	};

	//todo: get rid of this, use moment.js
	var ago = util.ago = function(timestamp) {
		var seconds = Math.floor((+new Date() - timestamp) / 1000),
				interval = Math.floor(seconds / 31536000);
		if (interval > 1)
			return interval + " years";
		interval = Math.floor(seconds / 2592000);
		if (interval > 1)
			return interval + " months";
		interval = Math.floor(seconds / 86400);
		if (interval > 1)
			return interval + " days";
		interval = Math.floor(seconds / 3600);
		if (interval > 1)
			return interval + " hours";
		interval = Math.floor(seconds / 60);
		if (interval > 1)
			return interval + " minutes";
		return Math.floor(seconds) + " seconds";
	};

	var isNumber = util.isNumber = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};

	var daysInMonth = util.daysInMonth = function (m, y) {
		y = y || (new Date).getFullYear();
		return /8|3|5|10/.test(m) ? 30 : m == 1 ? (!(y % 4) && y % 100) || !(y % 400) ? 29 : 28 : 31;
	};

	var titlelize = util.titlelize = function (str) {
		str || (str = "");
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	};

	var hasNumber = util.hasNumber = function (n) {
		return !isNaN(parseFloat(n));
	};

	var truncate = util.truncate = function (str, len) {
		if (typeof str != "string") return str;
		len = util.isNumber(len) ? len : 20;
		return str.length <= len ? str : str.substr(0, len - 3) + "...";
	};

	var padding = util.padding = function(value, len, character) {
		var pad = new Array(len + 1).join("" + (character || "0"));
		value = "" + value;
		return pad.substring(0, pad.length - value.length) + value;
	};

	var arrMin = util.arrMin = function (arr) {
		return Math.min.apply(null, arr);
	};

	var arrMax = util.arrMax = function (arr) {
		return Math.max.apply(null, arr);
	};

	//http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript
	var slugify = util.slugify = function(str) {
		str = str.replace(/^\s+|\s+$/g, "");
		str = str.toLowerCase();
		if(/^[\w]+$/.test(str)) {
			str = str.replace(/[^\w\s\d\-_]/g, "-");
		}
		str = str.replace(/\s+/g, "-");
		str = str.replace(/-+/g, "-");
		str = str.replace(/-$/g, "");
		str = str.replace(/^-/g, "");
		return str;
	};

	var fileExtension = util.fileExtension = function (path) {
		return ("" + path).split(".").pop();
	};

	// stolen from Angular https://github.com/angular/angular.js/blob/master/src/ng/directive/input.js#L11
	// then closed over the pattern for performance
	var isValidUrl = util.isValidUrl = (function(){
		var pattern = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
		return function (url) {
			return url && url.length < 2083 && url.match(pattern);
		};
	})();

	var printStack = util.printStack = function() {
		var e = new Error('dummy');
		var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
				.replace(/^\s+at\s+/gm, '')
				.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
				.split('\n');
		console.log(stack);
	};


	// http://stackoverflow.com/a/2117523/493756
	var generateUUID = util.generateUUID = function() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
					v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	// Safely get/set chained properties on an object
	// set example: key(A, "a.b.c.d", 10) // sets A to {a: {b: {c: {d: 10}}}}, and returns 10
	// get example: key(A, "a.b.c") // returns {d: 10}
	// get example: key(A, "a.b.c.foo.bar") // returns undefined without throwing a TypeError
	// credits to github.com/gkindel
	var key = util.key = function(obj, keypath, value) {
		if (obj === undefined) {
			obj = window;
		}
		if (keypath == null) {
			return undefined;
		}
		var i = keypath.indexOf(".");

		if (i == -1) {
			if (value !== undefined)
				obj[keypath] = value;
			return obj[keypath];
		}

		var prop = keypath.slice(0, i);
		var newProps = keypath.slice(i + 1);

		if (keypath !== undefined && !(obj[prop] instanceof Object)) {
			obj[prop] = {};
		}

		return key(obj[prop], newProps, value);
	};

	// meh
	var minVersion = util.minVersion = function(url) {
		var arr = ("" + url).split(".");
		arr.splice(arr.length - 1, 0, "min");
		return arr.join(".");
	};

	var prefixedName = util.prefixedName = function (prefix, name) {
		var parts = (name || "")
				.replace(/\s{2,}/g, " ")
				.split(" ");

		return $.map(parts, function(v, i) {
			return prefix + (v || "");
		}).join(" ");
	};

	// from mdn
	var trim = util.trim = $.trim || function(s) {
		s = s || "";
		return s.trim ? s.trim() : s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};

	// copied/edited from https://github.com/enricomarino/is/blob/master/index.js
	// to support the extend function below
	var is = util.is = {
		object: function (value) {
			return "[object Object]" === Object.prototype.toString.call(value);
		},
		fn: function (value) {
			return "[object Function]" === Object.prototype.toString.call(value);
		},
		hash: function (value) {
			return value && is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
		},
		array: function (value) {
			return "[object Array]" === Object.prototype.toString.call(value);
		}
	};

	var forEach = util.forEach = function (arr, callback) {
		var a = arr || [];
		var i, l = a.length, ret;
		if( a instanceof Array || a.length >= 0 ){
			for(i=0;i<l;i++){
				ret = callback(i, a[i]);
				if( ret == false)
					break;
			}
		} else if( a instanceof Object ){
			for( i in a ){
				if(! a.hasOwnProperty(i) )
					continue;
				ret = callback(i, a[i]);
				if( ret == false)
					break;
			}
		}
	};

	// https://github.com/dreamerslab/node.extend/blob/master/lib/extend.js
	extend = util.extend = extend || function () {
		var target = arguments[0] || {};
		var i = 1;
		var length = arguments.length;
		var deep = false;
		var options, name, src, copy, copy_is_array, clone;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== "object" && !is.fn(target)) {
			target = {};
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			options = arguments[i];
			if (options != null) {
				if (typeof options === "string") {
					options = options.split("");
				}
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we"re merging plain objects or arrays
					if (deep && copy && (is.hash(copy) || (copy_is_array = is.array(copy)))) {
						if (copy_is_array) {
							copy_is_array = false;
							clone = src && is.array(src) ? src : [];
						} else {
							clone = src && is.hash(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

						// Don"t bring in undefined values
					} else if (typeof copy !== "undefined") {
						target[name] = copy;
					}
				}
			}
		}
		// Return the modified object
		return target;
	};


	/*
	 Browser only
	 */

	var injectScripts = util.injectScripts = function (arr, callback, options) {
		if (arr && arr.length) {
			util.injectScript(arr[0], util.merge({}, options, {onload: function() { util.injectScripts(arr.slice(1), callback, options);}}));
		} else {
			if (typeof(callback) == "function")
				callback();
		}
	};

	var injectStyles = util.injectStyles = function(arr, callback, options) {
		if (arr && arr.length) {
			injectStyle(arr[0], merge({}, options, {onload: function() { util.injectStyles(arr.slice(1), callback, options)}}));
		} else {
			if (typeof(callback) == "function")
				callback();
		}
	};

	var injectScript = util.injectScript = function(src, options) {
		options || (options = {});
		injectTag("script", {src: src, type: "text/javascript"}, options);
	};

	var injectStyle = util.injectStyle = function(href, options) {
		options || (options = {});
		var img = document.createElement("img");

		img.onerror = options.onload || null;
		delete options.onload;

		var tag = injectTag("link", {type: "text/css", rel: "stylesheet"}, options);

		// ie8/9 do not respect DOM tree order if dynamically injected <style>, so need to inject first then set href
		tag.href = href;
		img.src = href;
	};

	var injectTag = util.injectTag = function (tagName, attrs, options) {
		options || (options = {});

		var node = document.createElement(tagName);
		var onload = options.onload || function(){};
		var onerror = options.onerror || onload;

		var inject = function() {
			if (options.insertBefore) {
				options.insertBefore.parentNode.insertBefore(node, options.insertBefore);
			} else if (options.appendChild) {
				options.appendChild.appendChild(node);
			} else {
				var scripts = document.getElementsByTagName("script");
				scripts[scripts.length - 1].parentNode.appendChild(node);
			}
		};

		var setAttrs = function() {
			forEach(attrs, function (key, value) {
				node.setAttribute(key, value);
			});
		};

		// ie8
		// https://github.com/jrburke/requirejs/blob/26404fe700440c81c1748b542afb163b0001ac35/require.js#L1852-L1893
		if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf("[native code") < 0)) {
			node.attachEvent("onreadystatechange", function(e) {
				if (/^(complete|loaded)$/.test((e.currentTarget || e.srcElement).readyState)) {
					if (onload) {
						onload();
						onload = null;
					}
				}
			});
			//inject in dom, then setAttributes, order so the e.srcElement will be defined
			inject();
			setAttrs();
		} else {
			node.onload = onload;
			node.onerror = onerror;
			setAttrs();
			inject();
		}
		return node;

	};

	var selectContent = util.selectContent = function(target) {
		if (target && typeof target === "string") {
			target = document.querySelector(target);
		}
		if (!target) return;

		var tagName = target.tagName;
		var range;

		if (tagName === "INPUT" || tagName === "TEXTAREA") {
			return target.select();
		}

		if (document.body.createTextRange) { // ms
			range = document.body.createTextRange();
			range.moveToElementText(target);
			range.select();
		} else if (window.getSelection) { // moz, opera, webkit
			var selection = window.getSelection();
			range = document.createRange();
			range.selectNodeContents(target);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	};


	var scrollTo = util.scrollTo = $ ? function(target, duration) {
		duration = duration || 500;

		var offset = $(target).offset();
		if (offset) {
			$("body, html").stop().animate({scrollTop: parseInt(offset.top, 10)}, duration);
		}
	} : function (target, duration) {
		clearTimeout(util._scrollToTimeout);

		var body = document.body;
		var html = document.body.parentNode;

		if (target && typeof target === "string") {
			target = document.querySelector(target);
		}
		duration = duration || 500;

		var to = target.scrollTop;
		var difference = to - body.scrollTop;

		var changeScrollTop = function (val) {
			body.scrollTop += val;
			html.scrollTop += val;
		};

		var tick = difference / duration * 10;

		util._scrollToTimeout = setTimeout(function() {
			changeScrollTop(tick);
			if (body.scrollTop === to) {
				return;
			}
			scrollTo(target, duration - 10);
		}, 10);
	};

	var toggleVisible = util.toggleVisible = function($el, toggle) {
		$el = $($el);

		if (toggle === true) {
			return $el.show().removeClass('hidden');
		}
		if (toggle === false) {
			return $el.hide().addClass('hidden');
		}

		if ($el.is(':visible')) {
			$el.hide().addClass('hidden');
		} else {
			$el.show().removeClass('hidden');
		}
	};

	var toggleAvailable = util.toggleAvailable = function($el, toggle) {
		$el = $($el);

		if (toggle === true) {
			return $el.prop('disabled', false).removeClass('disabled');
		}
		if (toggle === false) {
			return $el.prop('disabled', true).addClass('disabled');
		}
		if ($el.prop('disabled') || $el.hasClass('disabled')) {
			$el.prop('disabled', false).removeClass('disabled');
		} else {
			$el.prop('disabled', true).addClass('disabled')
		}
	};

	var toggleHorizontal = utils.toggleHorizontal = function($el, toggle) {
		$el = $($el);
		if (!$el || !$el.length) return;

		var visible = $el.is(':visible');
		var show = function() {
			$el.stop().css({opacity: 1}).show().animate({width: $el.data('width') || '100%'});
			return true;
		};
		var hide = function() {
			$el.data('width', $el.width());
			$el.stop().css({opacity: 0}).animate({width: 0}, {done: $el.hide.bind($el)});
			return false;
		};

		return (toggle === false || visible) && toggle !== true ? hide() : show();
	};

	var toggleVertical = function($el, toggle, visibleDirection) {
		$el = $($el);

		var show, hide;

		if (!$el || !$el.length) return;

		if (toggle === 'up' || toggle === 'down') {
			visibleDirection = toggle;
			toggle = undefined;
		}
		visibleDirection = visibleDirection || 'down';

		if (visibleDirection === 'down') {
			show = function() { $el.slideDown(); return true; };
			hide = function() { $el.slideUp(); return false; };
		} else {
			show = function() { $el.slideUp(); return true; };
			hide = function() { $el.slideDown(); return false; };
		}
		return (toggle === false || $el.is(':visible')) && toggle !== true ? hide() : show();
	};

	var urlToLocation = util.urlToLocation = function(url) {
		var a = document.createElement("a");
		a.href = url;
		// now this has a host, hostname, pathname, just like like window.location
		return a;
	};

	var toParams = util.toParam = function (params, options) {
		options = options || {};
		var search = "", i = 0;
		forEach(params, function(k, v) {
			if (v == null && options.excludeNull) {
				return;
			}
			search += (i ? "&" : "" ) + encodeURIComponent(k) + "=" + encodeURIComponent(is.hash(v) ? toQueryParam(v, options) : v);
			i++;
		});
		return search;
	};

	var params = util.params = function(options) {
		var a, hash = {}, params;

		options = options || {};
		options.skipToType = options.skipToType || {};

		if (options.url) {
			a = util.urlToLocation(options.url);
		}
		params = (a ? a.search : window.location.search).substring(1).split("&");

		params.forEach(function(param) {
			var val = param.split("="),
					key = decodeURI(val[0]),
					value = options.skipToType[key] ? decodeURI(val[1]) : resolveType(decodeURI(val[1]));

			if (key)
				hash[key] = value;
		});
		return hash;
	};

	// get all the url params in a single key/value hash
	// also, if value passed, the key param is set
	var param = util.param = function(key, value) {
		if (value !== undefined) {
			var search;
			if (util.param(key)) {
				search = location.search.replace(new RegExp("([?|&]"+name + "=)" + "(.+?)(&|$)"), "$1" + encodeURIComponent(value) + "$3");
			} else if (location.search.length) {
				search = location.search + "&" + key + "=" + encodeURIComponent(value);
			} else {
				search = "?" + key + "=" + encodeURIComponent(value);
			}
			location.search = search;
			return value;
		} else {
			return util.params()[key];
		}
	};

	var log = util.log = function () {
		if (window.console) {
			var args = Array.prototype.slice.call(arguments);
			try {
				if(console.log.apply) {
					console.log.apply(console, args);
				}
				else {
					console.log(args.join(", "));
				}
			}
			catch(e) {}
		}
	};

	util.storage = {
		session: {
			get: function (key, options) {
				options = options || {};
				options.type = "session";
				return util.storage._get(key, options);
			},
			set: function (key, value, options) {
				options = options || {};
				options.type = "session";
				return util.storage._set(key, value, options);
			},
			remove: function(key, options) {
				options = options || {};
				options.type = "session";
				return util.storage._remove(key, options);
			},
			clear: function(key, options) {
				options = options || {};
				options.type = "session";
				return util.storage._clear(options);
			}
		},

		local: {
			get: function (key, options) {
				options = options || {};
				options.type = "local";
				return util.storage._get(key, options);
			},
			set: function (key, value, options) {
				options = options || {};
				options.type = "local";
				return util.storage._set(key, value, options);
			},
			remove: function(key, options) {
				options = options || {};
				options.type = "local";
				return util.storage._remove(key, options);
			},
			clear: function(key, options) {
				options = options || {};
				options.type = "local";
				return util.storage._clear(options);
			}
		},

		_get: function (key, options) {
			options = options || {};
			var storage = util.storage["_" + options.type] && util.storage._session;
			var value = storage.get(key);
			var ttl = storage.get(key + "-ttl");
			var expired = isNumber(ttl) && ttl < (new Date()).getTime();

			if (expired) {
				util.storage._remove(key, options);
			} else {
				return value;
			}
		},

		_set: function (key, value, options) {
			options = options || {};
			var storage = util.storage["_" + options.type] && util.storage._session;
			var ttl = options.ttl ? isNumber(options.ttl) ? options.ttl : 4 * 7 * 24 * 60 * 60 * 1000 /* 4 weeks */ : false;
			storage.set(key, value);
			if (ttl) {
				storage.set(key + "-ttl", (new Date()).getTime() + ttl);
			}
			return storage.get(key, options);
		},

		_remove: function (key, options) {
			options = options || {};
			var storage = util.storage["_" + options.type] && util.storage._session;
			storage.remove(key);
			storage.remove(key + "-ttl");
		},

		_clear: function (options) {
			options = options || {};
			var storage = util.storage["_" + options.type] && util.storage._session;
			return storage.clear();
		},

		_session: {
			get: function (key) {
				return resolveType(sessionStorage.getItem(key));
			},
			set: function (key, value) {
				sessionStorage.setItem(key, serializeValue(value));
				return util.storage.session.get(key);
			},
			remove: function(key) {
				return sessionStorage.removeItem(key);
			},
			clear: function() {
				return sessionStorage.clear();
			}
		},

		_local: {
			get: function (key) {
				return resolveType(localStorage.getItem(key));
			},
			set: function (key, value) {
				localStorage.setItem(key, serializeValue(value));
				return util.storage.local.get(key);
			},
			remove: function(key) {
				return localStorage.removeItem(key);
			},
			clear: function() {
				return localStorage.clear();
			}
		}
	};

	/*! CC BY-SA 2.5 hasFlashVersionOrBetter http://stackoverflow.com/a/5230001/369724 (Martin Jespersen)*/
	var hasFlashVersionOrBetter = util.hasFlashVersionOrBetter = function (major, minor) {
		minor = minor || 0;
		var v;
		if (navigator.plugins && navigator.plugins.length > 0) {
			var type = "application/x-shockwave-flash";
			var mimeTypes = navigator.mimeTypes;
			if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description) {
				v = mimeTypes[type].enabledPlugin.description.replace(/^.*?([0-9]+)\.([0-9])+.*$/, "$1,$2").split(",");
			}
		}
		else {
			var flashObj = null;
			try {
				flashObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			} catch (ex) {
				return false;
			}
			if (flashObj != null) {
				var fV;
				try {
					fV = flashObj.GetVariable("$version");
				} catch (err) {
					return false;
				}
				v = fV.replace(/^.*?([0-9]+,[0-9]+).*$/, "$1").split(",");
			}
		}
		if (v) {
			var majorVersion = parseInt(v[0], 10);
			return major < majorVersion || major == majorVersion && minor <= parseInt(v[1], 10);
		}
		return false;
	};

	var on = util.on = function (el, type, handler, useCapture) {
		var fn = "addEventListener";
		if (!el.addEventListener) {
			fn = "attachEvent";
			type = "on" + type;
		}
		return el[fn](type, handler, !!useCapture);
	};

	var off = util.off = function (el, type, handler, useCapture) {
		var fn = "removeEventListener";
		if (!el.removeEventListener) {
			fn = "detachEvent";
			type = "on" + type;
		}
		return el[fn](type, handler, !!useCapture);
	};

	var send = util.send = function (url, options) {
		options = options || {};

		if (options.async === false) {
			// this utility cannot handle sync requests
			// todo: maybe don"t use util.send anymore? or just require jquery or something?
			return request(url, options);
		}

		var img = document.createElement("img");

		// ie8, we don"t know if it errors, but we should still fire an onload as if it"s there, so we don"t let the callback waiting forever
		// https://github.com/jrburke/requirejs/blob/26404fe700440c81c1748b542afb163b0001ac35/require.js#L1852-L1893
		if (img.attachEvent && !(img.attachEvent.toString && img.attachEvent.toString().indexOf("[native code") < 0)) {
			img.attachEvent("onreadystatechange", function(e) {
				if (e && /^(complete|loaded)$/.test((e.currentTarget || e.srcElement || {}).readyState)) {
					if (options.success) {
						options.success();
						options.success = null;
					}
				}
			});
		} else {
			img.onload = options.success || null;
			img.onerror = options.error || null;
			img.onreadystatechange = options.progress || null;
		}

		if (!url) {
			options.error && options.error();
			return false;
		}

		img.src = url;
		return img;
	};


	request = util.request = request || function(url, options, callback) {
		if (typeof options === "function") {
			callback = options;
		}
		if (typeof url === "object") {
			options = url;
			callback = options;
		}
		options = options || {};
		if (typeof url === "string") {
			options.url = url;
		}

		options.async = options.async != null ? options.async : true;

		var xhr;
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				throw e;
			}
		} else {
			xhr = new XMLHttpRequest();
		}

		var onready = function () {
			if (xhr.status == 200) {
				options.success && options.success(xhr.responseText);
				callback && callback(null, xhr.responseText);
			} else {
				var error = xhr.responseText || "Something went wrong :(";
				options.error && options.error(error);
				callback && callback(error);
			}
			options.complete && options.complete(xhr.responseText);
		};

		if (options.async) {
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					onready();
				}
			};
		}

		xhr.open(options.method || "GET", options.url, options.async);
		xhr.send();

		if (options.async === false) {
			onready();
		}
		return xhr;
	};

	// calculate how deep of frame is code running on
	var frameDepth = util.frameDepth = function (w) {
		w = w || window;
		if (w === window.top) {
			return 0;
		} else if (w.parent === window.top) {
			return 1;
		}
		return 1 + frameDepth(w.parent);
	};

	// basic on domready
	var ondomready = util.ondomready = $ || function (callback) {
		callback = callback || function() {};

		var complete = function() {
			if (document.removeEventListener) {
				document.removeEventListener("DOMContentLoaded", complete, false);
				callback();
			} else if (document.readyState === "complete") {
				document.detachEvent("onreadystatechange", complete);
				callback();
			}
		};

		if (document.addEventListener) {
			document.addEventListener( "DOMContentLoaded", complete, false );
		} else if (document.attachEvent) {
			document.attachEvent("onreadystatechange", complete);
		}
	};


	/*
	 Server only
	 */

	// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
	var walk = util.walk = function(dir, done) {
		var results = [];

		fs.readdir(dir, function(err, list) {
			if (err) {
				return done(err);
			}
			var pending = list.length;
			if (!pending) {
				return done(null, results);
			}
			list.forEach(function(file) {
				file = dir + "/" + file;
				fs.stat(file, function(err, stat) {
					if (stat && stat.isDirectory()) {
						util.walk(file, function(err, res) {
							results = results.concat(res);
							if (!--pending) {
								done(null, results);
							}
						});
					} else {
						results.push(file);
						if (!--pending) {
							done(null, results);
						}
					}
				});
			});
		});
	};

	// https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js#L209
	var recurse = util.recurse = function (rootdir, callback, subdir) {
		var abspath = subdir ? path.join(rootdir, subdir) : rootdir;

		fs.readdirSync(abspath).forEach(function(filename) {
			var filepath = path.join(abspath, filename);
			if (fs.statSync(filepath).isDirectory()) {
				util.recurse(rootdir, callback, path.join(subdir || "", filename || ""));
			} else {
				callback(filepath, rootdir, subdir, filename);
			}
		});
	};

	var customWalk = util.customWalk = function (dir, options) {
		options || (options = {});
		var arr = [],
				parse = typeof options.parse == "function" ? options.parse : function(s) { return s;},
				pre = Array.isArray(options.pre) ? options.pre : [],
				post = Array.isArray(options.post) ? options.post : [],
				skip = Array.isArray(options.skip) ? options.skip : [];

		if (fs.existsSync(dir)) {
			util.recurse(dir, function(file) {
				var ext = ("" + file).split(".").pop();
				if (pre.indexOf(file) === -1 && post.indexOf(file) === -1 && skip.indexOf(file) === -1 && (!options.ext || options.ext === ext)) {
					arr.push(parse(file));
				}
			});
		}

		return pre.map(parse).concat(arr, post.map(parse));
	};

	if (serverside) {
		ns.exports = util;
	} else {
		ns.util = util;
	}

})(typeof module !== "undefined" ? module : window);