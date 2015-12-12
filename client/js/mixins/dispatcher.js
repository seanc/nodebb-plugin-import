(function(module) {

	var asDispatcher = module.exports = (function() {

		var on = function(type, callback) {
			this._events[type] = this._events[type] || [];
			if (this._events[type]) {
				this._events[type].push(callback);
			}
			return this;
		};

		var fire = function(type, data) {
			if (this._events[type]) {
				var listeners = this._events[type];
				var len = listeners.length;
				while (len--) {
					listeners[len]({type: type, data: data});
				}
			}
			return this;
		};

		var one = function(type, callback) {
			var that = this;
			var newCallback = function (e) {
				callback(e);
				that.off(type, newCallback);
			};
			this.on(type, newCallback);
		};

		var off = function(type, callback) {
			if (this._events[type]) {
				var listeners = this._events[type];
				if (callback) {
					for (var i = listeners.length - 1; i >= 0; --i) {
						if (listeners[i] === callback) {
							listeners.splice(i, 1);
							return this;
						}
					}
				} else {
					this._events[type] = [];
				}
			}
			return this;
		};

		return function(context) {
			if (context) {
				return asDispatcher.call(context);
			}

			this._events = {};
			this.on = on;
			this.fire = fire;
			this.one = one;
			this.off = off;

			/* aliases */
			this.listen = on;
			this.addEventListener = on;
			this.once = one;
			this.forget = off;
			this.removeEventListener = off;
			this.dispatch = fire;
			this.trigger = fire;
			this.dispatchEvent = fire;
			return this;
		};
	})();

	if ("undefined" !== typeof window) {
		window.plugins.import.asDispatcher = module.exports;
	}

})("undefined" === typeof module ? {module:{exports:{}}}: module);
