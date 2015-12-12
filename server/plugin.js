
var pkg = require("../package.json");
var meta = module.parent.require("./meta");

var plg = require("../plugin.json");
plg.Name = plg.name[0].toUpperCase() + plg.name.toLowerCase().slice(1);
plg.name = plg.name.toLowerCase();

var plugin = {
	json: plg,
	name: plg.name,
	package: pkg,
	exporters: plg.exporters,

	// plugin persist settings
	settings: function(settings, callback) {
		if (typeof settings === "function") {
			callback = settings;
			settings = undefined;
		}
		var fns = [function(next) {
			meta.settings.get(plg.name, next);
		}];
		if (settings) {
			fns.unshift(function(next) {
				meta.settings.set(plg.name, settings, function(err){ next(err); /* only pass err */ });
			});
		}
		async.waterfall(fns, function(err, config) {
			if (err) {
				winston.warn("[plugins/" + plg.name + "] Settings are not set or could not be retrieved!");
				return callback(err);
			}
			plugin.config = config;
			callback && callback(null, config);
		});
	},

	// hooks
	menu: function(custom_header, callback) {
		custom_header.plugins.push({
			"route": '/plugins/' + plg.name,
			"icon": plg.faIcon,
			"name": plg.Name
		});
		callback(null, custom_header);
	},

	load: function(params, callback) {
		plugin.settings(function(err, config) {
			if (err) {
				throw err;
			}
			require('./api/routes').setup(params, plugin);
			callback && callback();
		});
	}
};

module.exports = plugin;