var controller = require("./controller");

module.exports =  {
	setup: function(params, Plugin) {
		var router = params.router;
		var middleware = params.middleware;

		var prefix = '/admin/plugins/import';
		var apiPrefix = '/api' + prefix;

		router.get(prefix, middleware.applyCSRF, middleware.admin.buildHeader, controller.render);
		router.get(apiPrefix, middleware.applyCSRF, controller.render);

		router.get(apiPrefix + '/state', controller.state);
		router.get(apiPrefix + '/exporters', controller.exporters);
		router.get(apiPrefix + '/config', controller.config);

		router.post(apiPrefix + '/config', middleware.applyCSRF, middleware.admin.isAdmin, controller.config);
		router.post(apiPrefix + '/start', middleware.applyCSRF, middleware.admin.isAdmin, controller.start);
		router.post(apiPrefix + '/resume', middleware.applyCSRF, middleware.admin.isAdmin, controller.resume);
		router.post(apiPrefix + '/convert', middleware.admin.isAdmin, controller.convert);

		router.get(apiPrefix + '/download/users.csv', middleware.admin.isAdmin, controller.csvUsers);
		router.get(apiPrefix + '/download/users.csv', middleware.admin.isAdmin, controller.jsonUsers);
		router.get(apiPrefix + '/download/redirect.json', middleware.admin.isAdmin, controller.redirectionMap);

		router.delete(apiPrefix + '/addedFields', middleware.applyCSRF, middleware.admin.isAdmin, controller.deleteAddedFields);

	}
};
