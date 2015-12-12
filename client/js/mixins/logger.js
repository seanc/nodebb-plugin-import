(function(module) {

	var asLogger = module.exports = (function() {

		var levels = {
			error: 7,
			success: 6,
			info: 5,
			warn: 4,
			log: 3,
			debug: 2,
			trace: 1
		};

		var _console = console;

		var wrapFunction = function (base, extra) {
			return (function () {
				return function () {
					base.apply(this, arguments);
					extra.apply(this, arguments);
				};
			})();
		};

		var level = function(val) {
			if (val !== undefined) {
				this.asLogger.config.level = val;
			}
			return this.asLogger.config.level;
		};

		var prefix = function(val) {
			if (val !== undefined) {
				this.asLogger.config = val;
			}
			return this.asLogger.config.prefix;
		};

		var can = function(level) {
			return !! (typeof _console[level] === "function" && (this.asLogger.config.level >= 1 ? this.asLogger.config.level : levels[this.asLogger.config.level]) >= levels[level]);
		};

		var print = function(level, args) {
			args = Array.prototype.slice.call(args, 0);

			if (this.asLogger.config.prefix) {
				args.unshift(this.asLogger.config.prefix);
			}
			if (this.asLogger.config.timestamp) {
				args.unshift('[' + (new Date()).toLocaleString() + ']');
			}

			return _console[level].apply(_console, args);
		};

		var error = function () {
			if (can.call(this, "error")) {
				print.apply(this, "error", arguments);
			}
		};

		var log = function() {
			if (can.call(this, "log")) {
				print.apply(this, "log", arguments);
			}
		};

		var info = function() {
			if (can.call(this, "info")) {
				print.apply(this, "info", arguments);
			}
		};

		var success = function() {
			if (can.call(this, "success")) {
				print.apply(this, "success", arguments);
			}
		};

		var warn = function() {
			if (can.call(this, "warn")) {
				print.apply(this, "warn", arguments);
			}
		};

		var debug = function() {
			if (can.call(this, "debug")) {
				print.apply(this, "debug", arguments);
			}
		};

		var trace = function() {
			if (can.call(this, "trace")) {
				print.apply(this, "trace", arguments);
			}
		};

		var defaults = {
			prefix: "",
			level: "warn",
			timestamp: true
		};

		return function(context, config) {

			this.asLogger = this.asLogger || {};

			this.asLogger.config = config;
			this.asLogger.config.prefix = this.asLogger.config.prefix || defaults.prefix;
			this.asLogger.config.level = this.asLogger.config.level || defaults.level;
			this.asLogger.config.timestamp = this.asLogger.config.timestamp || defaults.timestamp;

			this.error = this.error ? wrapFunction(this.error, error) : error;
			this.success = this.success ? wrapFunction(this.success, success) : success;
			this.info = this.info ? wrapFunction(this.info, info) : info;
			this.warn = this.warn ? wrapFunction(this.warn, warn) : warn;

			// low level logging
			this.log = this.log ? wrapFunction(this.log, log) : log;
			this.trace = this.trace ? wrapFunction(this.trace, trace) : trace;
			this.debug = this.debug ? wrapFunction(this.debug, debug) : debug;

			this.loggerLevel = level;
			this.loggerPrefix = prefix;
			this.loggerCan = can;

			return this;
		};
	})();

	if ("undefined" !== typeof window) {
		window.plugins.import.asLogger = module.exports;
	}

})("undefined" === typeof module ? {module:{exports:{}}}: module);
