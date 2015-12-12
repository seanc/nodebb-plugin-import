
var plugin = require("../plugin");

var exporter = require("../tools/exporter");
var importer = require("../tools/importer");

(function(controller) {

	var _state = {};
	function state(name, data) {
		_state.name = name;
		_state.importer = data.importer;
		_state.exporter = data.exporter;
		return _state;
	}

	var _phase = {};
	function phase(p, data) {
		_phase.name = name;
		_phase.timestamp = data.timestamp;
		progress({count: 0, total: 1});
		return _phase;
	}

	var _progress = {};
	function progress(data) {
		_progress.count = data.count;
		_progress.total = data.total;
		return _progress;
	}

	function init() {
		state("idle");
	}

	controller.render = function(req, res) {
		res.render('admin/plugins/' + plugin.name, {
			json: plugin.json || {},
			config: plugin.config || {},
			package: plugin.package,
			// clean this when https://github.com/psychobunny/templates.js/issues/19 is resolved
			exporters: Object.keys(plugin.exporters).map(function(k) { return {name: k}; }),
		});
	};

	controller.config = function (req, res) {
		plugin.settings(req.body, function(err, config) {
			if (err) res.status(500).send(err);

			res.status(200).send(config);
		});
	};

	controller.state = function (req, res) {
		res.status(200).send(_state);
	};

	controller.phase = function (req, res) {
		res.status(200).send(_phase);
	};

	controller.exporters = function (req, res) {
		exporter.search(function(err, results) {
			if (err) res.status(500).send(err);

			res.status(200).send(results);
		});
	};

	controller.start = function (req, res) {};

	controller.resume = function (req, res) {

	};

	controller.csvUsers = function (req, res) {

	};

	controller.jsonUsers = function (req, res) {

	};

	controller.redirectionMap = function (req, res) {

	};

	controller.deleteAddedFields = function (req, res) {

	};


})(module.exports);
