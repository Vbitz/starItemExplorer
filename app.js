(function (window) {
	var fs = require("fs"),
		path = require("path");

	function getExtention(name) {
		return name.substring(name.lastIndexOf("."));
	}

	function getConfigs (dir, cb) {
		var items = [];
		fs.readdir(dir, function (err, res) {
			if (err) throw err;
			var finished = res.length;
			res.forEach(function (i) {
				var fullPath = path.join(dir, i);
				fs.stat(fullPath, function (err, stats) {
					if (stats.isDirectory()) {
						getConfigs(fullPath, function (subItems) {
							subItems.forEach(function (i) {
								items.push(i);
							});
							finished--;
							if (finished < 1) {
								cb(items);
							}
						});
					} else {
						items.push(fullPath);
						finished--;
						if (finished < 1) {
							cb(items);
						}
					}
				});
			});
		});
	};

	function filterConfigs (items, exclude, listType, cb) {
		var ret = [];
		items.forEach(function (i) {
			if (listType) {
				if (!exclude[getExtention(i)]) {
					ret.push(i);
				}
			} else {
				if (exclude[getExtention(i)]) {
					ret.push(i);
				}
			}
		});
		cb(ret);
	};

	window.loadStarBoundJSON = function (filename, cb) {
		fs.readFile(filename, "utf8", function (err, res) {
			if (err) {
				console.log("Error loading: " + filename);
				setTimeout(function () {
					loadStarBoundJSON(filename, cb);
				}, 5000);
			} else {
				res = "(" + res + ")";
				cb(eval(res));
			}
		});
	};

	window.getAllConfigs = function (path, exclude, listType, cb) {
		getConfigs(path, function (items) {
			filterConfigs(items, exclude, listType, function (configs) {
				cb(configs);
			});
		});
	};

	window.sbResolvePath = function (basePath, p1, p2, cb) {
		if (p1.indexOf(basePath) !== 0) {
			cb("");
		} else {
			p1 = p1.substring(0, p1.lastIndexOf("/"));
			var pth = path.join(p1, p2);
			fs.exists(pth, function (e) {
				if (e) {
					cb(pth);
				} else {
					sbResolvePath(basePath, p1.substring(0, p1.lastIndexOf("/")), p2, cb);
				}
			});
		}
	};
})(window);