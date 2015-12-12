
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var extend = require("extend");

function notImplemented () { throw "Not Implemented" };
function noop (callback) { callback && callback(); };

var properties = {
	count: notImplemented,
	each: notImplemented,
	eachId: notImplemented,
	batchEach: notImplemented,
	batchEachId: notImplemented,

	deleteAugmentedValues: notImplemented,
	deleteAllAugmentedValues: notImplemented,

	import: notImplemented,
	beforeImport: noop,
	afterImport: noop,

	eachImported: notImplemented,
	eachImportedId: notImplemented,
	batchEachImportedId: notImplemented,
	batchEachImported: notImplemented,

	countImported: notImplemented,
	setImported: notImplemented,
	getImported: notImplemented,

	deleteImported: notImplemented,
	deleteAllImported: notImplemented,

	isImported: notImplemented,
	phase: function (){}
};

var defaults = {
	DEFAULT_BATCH_SIZE: 100
};

var copy = function (options) {
	var type = {
		options: extend(true, {}, defaults, options)
	};
	return extend(true, {}, type, properties);
};

module.exports = copy;


