(function(module) {

	var serverside;
	if ("undefned" === typeof navigator) {
		serverside = true;
	}

	var env = module.exports = {

		os: (function() {
			if (serverside) {
				return require("os").platform();
			}

			var av = navigator.appVersion;
			if (/Win/.test(av))
				return "windows";
			if (/Mac/.test(av))
				return "mac";
			if (/X11/.test(av))
				return "unix";
			if (/Linux/.test(av))
				return "linux";
			return "unknown";
		})(),

		device: (function() {
			return /webOS|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
		})(),

		// http://stackoverflow.com/a/16938481/493756
		browser: (function() {
			var ua = navigator.userAgent,
					tem,
					M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

			if (serverside) {
				return null;
			}

			if(/trident/i.test(M[1])){
				tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
				return {
					name:'ie',
					version: parseInt(tem[1] || '', 10) || undefined,
					// inspired from https://github.com/Gavin-Paolucci-Kleinow/ie-truth
					emulator: parseInt((ua.match(/MSIE (\d+)/) || [])[1] || "", 10) || undefined
				};
			}

			if(M[1] === 'Chrome') {
				tem = ua.match(/\bOPR\/(\d+)/);
				if (tem != null) {
					return {
						name: 'opera',
						version: tem[1]
					};
				}
			}

			M= M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

			if((tem = ua.match(/version\/(\d+)/i)) != null) {
				M.splice(1, 1,tem[1]);
			}

			return {
				name: (M[0] || '').toLowerCase(),
				version: M[1]
			};
		})(),

		supports: {
			dndupload: (function () {
				if (serverside) {
					return false;
				}
				// inspired from Modernizr source
				var div = document.createElement('div');
				return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
						&& !!(window.File && window.FileList && window.FileReader);
			})()
		}
	};

	if ("undefined" !== typeof window) {
		window.plugins.import.env = module.exports;
	}

})("undefined" === typeof module ? {module:{exports:{}}}: module);
