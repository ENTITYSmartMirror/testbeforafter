//기본 Main.js / config.js
- Main.js
var MM = (function() {

	var modules = [];

	/* Private Methods */

	/* createDomObjects()
	 * Create dom objects for all modules that
	 * are configured for a specific position.
	 */
	var createDomObjects = function() {
		var domCreationPromises = [];

		modules.forEach(function(module) {
			if (typeof module.data.position !== "string") {
				return;
			}

			var wrapper = selectWrapper(module.data.position);

			var dom = document.createElement("div");
			dom.id = module.identifier;
			dom.className = module.name;

			if (typeof module.data.classes === "string") {
				dom.className = "module " + dom.className + " " + module.data.classes;
			}

			dom.opacity = 0;
			wrapper.appendChild(dom);

			if (typeof module.data.header !== "undefined" && module.data.header !== "") {
				if(module.data.header=="55")
				{
					Log.log("fucking");
				}
				else{
				var moduleHeader = document.createElement("header");
				moduleHeader.innerHTML = module.data.header;
				moduleHeader.className = "module-header";
				dom.appendChild(moduleHeader);
				}
				
			}

			var moduleContent = document.createElement("div");
			moduleContent.className = "module-content";
			dom.appendChild(moduleContent);

			var domCreationPromise = updateDom(module, 0);
			domCreationPromises.push(domCreationPromise);
			domCreationPromise.then(function() {
				sendNotification("MODULE_DOM_CREATED", null, null, module);
			}).catch(Log.error);
		});

		updateWrapperStates();

		Promise.all(domCreationPromises).then(function() {
			sendNotification("DOM_OBJECTS_CREATED");
		});
	};

	/* selectWrapper(position)
	 * Select the wrapper dom object for a specific position.
	 *
	 * argument position string - The name of the position.
	 */
	var selectWrapper = function(position) {
		var classes = position.replace("_"," ");
		var parentWrapper = document.getElementsByClassName(classes);
		if (parentWrapper.length > 0) {
			var wrapper = parentWrapper[0].getElementsByClassName("container");
			if (wrapper.length > 0) {
				return wrapper[0];
			}
		}
	};

	/* sendNotification(notification, payload, sender)
	 * Send a notification to all modules.
	 *
	 * argument notification string - The identifier of the notification.
	 * argument payload mixed - The payload of the notification.
	 * argument sender Module - The module that sent the notification.
	 * argument sendTo Module - The module to send the notification to. (optional)
	 */
	var sendNotification = function(notification, payload, sender, sendTo) {
		for (var m in modules) {
			var module = modules[m];
			if (module !== sender && (!sendTo || module === sendTo)) {
				module.notificationReceived(notification, payload, sender);
			}
		}
	};

	/* updateDom(module, speed)
	 * Update the dom for a specific module.
	 *
	 * argument module Module - The module that needs an update.
	 * argument speed Number - The number of microseconds for the animation. (optional)
	 *
	 * return Promise - Resolved when the dom is fully updated.
	 */
	var updateDom = function(module, speed) {
		return new Promise(function(resolve) {
			var newContentPromise = module.getDom();
			var newHeader = module.getHeader();

			if (!(newContentPromise instanceof Promise)) {
				// convert to a promise if not already one to avoid if/else's everywhere
				newContentPromise = Promise.resolve(newContentPromise);
			}

			newContentPromise.then(function(newContent) {
				var updatePromise = updateDomWithContent(module, speed, newHeader, newContent);

				updatePromise.then(resolve).catch(Log.error);
			}).catch(Log.error);
		});
	};

	/* updateDomWithContent(module, speed, newHeader, newContent)
	 * Update the dom with the specified content
	 *
	 * argument module Module - The module that needs an update.
	 * argument speed Number - The number of microseconds for the animation. (optional)
	 * argument newHeader String - The new header that is generated.
	 * argument newContent Domobject - The new content that is generated.
	 *
	 * return Promise - Resolved when the module dom has been updated.
	 */
	var updateDomWithContent = function(module, speed, newHeader, newContent) {
		return new Promise(function(resolve) {
			if (module.hidden || !speed) {
				updateModuleContent(module, newHeader, newContent);
				resolve();
				return;
			}

			if (!moduleNeedsUpdate(module, newHeader, newContent)) {
				resolve();
				return;
			}

			if (!speed) {
				updateModuleContent(module, newHeader, newContent);
				resolve();
				return;
			}

			hideModule(module, speed / 2, function() {
				updateModuleContent(module, newHeader, newContent);
				if (!module.hidden) {
					showModule(module, speed / 2);
				}
				resolve();
			});
		});
	};

	/* moduleNeedsUpdate(module, newContent)
	 * Check if the content has changed.
	 *
	 * argument module Module - The module to check.
	 * argument newHeader String - The new header that is generated.
	 * argument newContent Domobject - The new content that is generated.
	 *
	 * return bool - Does the module need an update?
	 */
	var moduleNeedsUpdate = function(module, newHeader, newContent) {
		var moduleWrapper = document.getElementById(module.identifier);
		var contentWrapper = moduleWrapper.getElementsByClassName("module-content");
		var headerWrapper = moduleWrapper.getElementsByClassName("module-header");

		var headerNeedsUpdate = false;
		var contentNeedsUpdate = false;

		if (headerWrapper.length > 0) {
			headerNeedsUpdate = newHeader !== headerWrapper[0].innerHTML;
		}

		var tempContentWrapper = document.createElement("div");
		tempContentWrapper.appendChild(newContent);
		contentNeedsUpdate = tempContentWrapper.innerHTML !== contentWrapper[0].innerHTML;

		return headerNeedsUpdate || contentNeedsUpdate;
	};

	/* moduleNeedsUpdate(module, newContent)
	 * Update the content of a module on screen.
	 *
	 * argument module Module - The module to check.
	 * argument newHeader String - The new header that is generated.
	 * argument newContent Domobject - The new content that is generated.
	 */
	var updateModuleContent = function(module, newHeader, newContent) {
		var moduleWrapper = document.getElementById(module.identifier);
		var headerWrapper = moduleWrapper.getElementsByClassName("module-header");
		var contentWrapper = moduleWrapper.getElementsByClassName("module-content");

		contentWrapper[0].innerHTML = "";
		contentWrapper[0].appendChild(newContent);

		if( headerWrapper.length > 0 && newHeader) {
			headerWrapper[0].innerHTML = newHeader;
		}
	};

	/* hideModule(module, speed, callback)
	 * Hide the module.
	 *
	 * argument module Module - The module to hide.
	 * argument speed Number - The speed of the hide animation.
	 * argument callback function - Called when the animation is done.
	 */
	var hideModule = function(module, speed, callback, options) {
		options = options || {};

		// set lockString if set in options.
		if (options.lockString) {
			// Log.log("Has lockstring: " + options.lockString);
			if (module.lockStrings.indexOf(options.lockString) === -1) {
				module.lockStrings.push(options.lockString);
			}
		}

		var moduleWrapper = document.getElementById(module.identifier);
		if (moduleWrapper !== null) {
			moduleWrapper.style.transition = "opacity " + speed / 1000 + "s";
			moduleWrapper.style.opacity = 0;

			clearTimeout(module.showHideTimer);
			module.showHideTimer = setTimeout(function() {
				// To not take up any space, we just make the position absolute.
				// since it's fade out anyway, we can see it lay above or
				// below other modules. This works way better than adjusting
				// the .display property.
				moduleWrapper.style.position = "fixed";

				updateWrapperStates();

				if (typeof callback === "function") { callback(); }
			}, speed);
		} else {
			// invoke callback even if no content, issue 1308
			if (typeof callback === "function") { callback(); }
		}
	};

	/* showModule(module, speed, callback)
	 * Show the module.
	 *
	 * argument module Module - The module to show.
	 * argument speed Number - The speed of the show animation.
	 * argument callback function - Called when the animation is done.
	 */
	var showModule = function(module, speed, callback, options) {
		options = options || {};

		// remove lockString if set in options.
		if (options.lockString) {
			var index = module.lockStrings.indexOf(options.lockString);
			if ( index !== -1) {
				module.lockStrings.splice(index, 1);
			}
		}

		// Check if there are no more lockstrings set, or the force option is set.
		// Otherwise cancel show action.
		if (module.lockStrings.length !== 0 && options.force !== true) {
			Log.log("Will not show " + module.name + ". LockStrings active: " + module.lockStrings.join(","));
			return;
		}

		module.hidden = false;

		// If forced show, clean current lockstrings.
		if (module.lockStrings.length !== 0 && options.force === true) {
			Log.log("Force show of module: " + module.name);
			module.lockStrings = [];
		}

		var moduleWrapper = document.getElementById(module.identifier);
		if (moduleWrapper !== null) {
			moduleWrapper.style.transition = "opacity " + speed / 1000 + "s";
			// Restore the postition. See hideModule() for more info.
			moduleWrapper.style.position = "static";

			updateWrapperStates();

			// Waiting for DOM-changes done in updateWrapperStates before we can start the animation.
			var dummy = moduleWrapper.parentElement.parentElement.offsetHeight;
			moduleWrapper.style.opacity = 1;

			clearTimeout(module.showHideTimer);
			module.showHideTimer = setTimeout(function() {
				if (typeof callback === "function") { callback(); }
			}, speed);

		}
	};

	/* updateWrapperStates()
	 * Checks for all positions if it has visible content.
	 * If not, if will hide the position to prevent unwanted margins.
	 * This method schould be called by the show and hide methods.
	 *
	 * Example:
	 * If the top_bar only contains the update notification. And no update is available,
	 * the update notification is hidden. The top bar still occupies space making for
	 * an ugly top margin. By using this function, the top bar will be hidden if the
	 * update notification is not visible.
	 */

	var updateWrapperStates = function() {
		var positions = ["top_bar", "top_left", "top_center", "top_right", "upper_third", "middle_center", "lower_third", "bottom_left", "bottom_center", "bottom_right", "bottom_bar", "fullscreen_above", "fullscreen_below"];

		positions.forEach(function(position) {
			var wrapper = selectWrapper(position);
			var moduleWrappers = wrapper.getElementsByClassName("module");

			var showWrapper = false;
			Array.prototype.forEach.call(moduleWrappers, function(moduleWrapper) {
				if (moduleWrapper.style.position == "" || moduleWrapper.style.position == "static") {
					showWrapper = true;
				}
			});

			wrapper.style.display = showWrapper ? "block" : "none";
		});
	};

	/* loadConfig()
	 * Loads the core config and combines it with de system defaults.
	 */
	var loadConfig = function() {
		if (typeof config === "undefined") {
			config = defaults;
			Log.error("Config file is missing! Please create a config file.");
			return;
		}

		config = Object.assign({}, defaults, config);
	};

	/* setSelectionMethodsForModules()
	 * Adds special selectors on a collection of modules.
	 *
	 * argument modules array - Array of modules.
	 */
	var setSelectionMethodsForModules = function(modules) {

		/* withClass(className)
		 * calls modulesByClass to filter modules with the specified classes.
		 *
		 * argument className string/array - one or multiple classnames. (array or space divided)
		 *
		 * return array - Filtered collection of modules.
		 */
		var withClass = function(className) {
			return modulesByClass(className, true);
		};

		/* exceptWithClass(className)
		 * calls modulesByClass to filter modules without the specified classes.
		 *
		 * argument className string/array - one or multiple classnames. (array or space divided)
		 *
		 * return array - Filtered collection of modules.
		 */
		var exceptWithClass  = function(className) {
			return modulesByClass(className, false);
		};

		/* modulesByClass(className, include)
		 * filters a collection of modules based on classname(s).
		 *
		 * argument className string/array - one or multiple classnames. (array or space divided)
		 * argument include boolean - if the filter should include or exclude the modules with the specific classes.
		 *
		 * return array - Filtered collection of modules.
		 */
		var modulesByClass = function(className, include) {
			var searchClasses = className;
			if (typeof className === "string") {
				searchClasses = className.split(" ");
			}

			var newModules = modules.filter(function(module) {
				var classes = module.data.classes.toLowerCase().split(" ");

				for (var c in searchClasses) {
					var searchClass = searchClasses[c];
					if (classes.indexOf(searchClass.toLowerCase()) !== -1) {
						return include;
					}
				}

				return !include;
			});

			setSelectionMethodsForModules(newModules);
			return newModules;
		};

		/* exceptModule(module)
		 * Removes a module instance from the collection.
		 *
		 * argument module Module object - The module instance to remove from the collection.
		 *
		 * return array - Filtered collection of modules.
		 */
		var exceptModule = function(module) {
			var newModules = modules.filter(function(mod) {
				return mod.identifier !== module.identifier;
			});

			setSelectionMethodsForModules(newModules);
			return newModules;
		};

		/* enumerate(callback)
		 * Walks thru a collection of modules and executes the callback with the module as an argument.
		 *
		 * argument callback function - The function to execute with the module as an argument.
		 */
		var enumerate = function(callback) {
			modules.map(function(module) {
				callback(module);
			});
		};

		if (typeof modules.withClass === "undefined") { Object.defineProperty(modules, "withClass",  {value: withClass, enumerable: false}); }
		if (typeof modules.exceptWithClass === "undefined") { Object.defineProperty(modules, "exceptWithClass",  {value: exceptWithClass, enumerable: false}); }
		if (typeof modules.exceptModule === "undefined") { Object.defineProperty(modules, "exceptModule",  {value: exceptModule, enumerable: false}); }
		if (typeof modules.enumerate === "undefined") { Object.defineProperty(modules, "enumerate",  {value: enumerate, enumerable: false}); }
	};

	return {
		/* Public Methods */

		/* init()
		 * Main init method.
		 */
		init: function() {
			Log.info("Initializing MagicMirror.");
			loadConfig();
			Translator.loadCoreTranslations(config.language);
			Loader.loadModules();
		},

		/* modulesStarted(moduleObjects)
		 * Gets called when all modules are started.
		 *
		 * argument moduleObjects array<Module> - All module instances.
		 */
		modulesStarted: function(moduleObjects) {
			modules = [];
			for (var m in moduleObjects) {
				var module = moduleObjects[m];
				modules[module.data.index] = module;
			}

			Log.info("All modules started!");
			sendNotification("ALL_MODULES_STARTED");

			createDomObjects();
		},

		/* sendNotification(notification, payload, sender)
		 * Send a notification to all modules.
		 *
		 * argument notification string - The identifier of the noitication.
		 * argument payload mixed - The payload of the notification.
		 * argument sender Module - The module that sent the notification.
		 */
		sendNotification: function(notification, payload, sender) {
			if (arguments.length < 3) {
				Log.error("sendNotification: Missing arguments.");
				return;
			}

			if (typeof notification !== "string") {
				Log.error("sendNotification: Notification should be a string.");
				return;
			}

			if (!(sender instanceof Module)) {
				Log.error("sendNotification: Sender should be a module.");
				return;
			}

			// Further implementation is done in the private method.
			sendNotification(notification, payload, sender);
		},

		/* updateDom(module, speed)
		 * Update the dom for a specific module.
		 *
		 * argument module Module - The module that needs an update.
		 * argument speed Number - The number of microseconds for the animation. (optional)
		 */
		updateDom: function(module, speed) {
			if (!(module instanceof Module)) {
				Log.error("updateDom: Sender should be a module.");
				return;
			}

			// Further implementation is done in the private method.
			updateDom(module, speed);
		},

		/* getModules(module, speed)
		 * Returns a collection of all modules currently active.
		 *
		 * return array - A collection of all modules currently active.
		 */
		getModules: function() {
			setSelectionMethodsForModules(modules);
			return modules;
		},

		/* hideModule(module, speed, callback)
		 * Hide the module.
		 *
		 * argument module Module - The module hide.
		 * argument speed Number - The speed of the hide animation.
		 * argument callback function - Called when the animation is done.
		 * argument options object - Optional settings for the hide method.
		 */
		hideModule: function(module, speed, callback, options) {
			module.hidden = true;
			hideModule(module, speed, callback, options);
		},

		/* showModule(module, speed, callback)
		 * Show the module.
		 *
		 * argument module Module - The module show.
		 * argument speed Number - The speed of the show animation.
		 * argument callback function - Called when the animation is done.
		 * argument options object - Optional settings for the hide method.
		 */
		showModule: function(module, speed, callback, options) {
			// do not change module.hidden yet, only if we really show it later
			showModule(module, speed, callback, options);
		}
	};

})();

// Add polyfill for Object.assign.
if (typeof Object.assign != "function") {
	(function() {
		Object.assign = function(target) {
			"use strict";
			if (target === undefined || target === null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}
			var output = Object(target);
			for (var index = 1; index < arguments.length; index++) {
				var source = arguments[index];
				if (source !== undefined && source !== null) {
					for (var nextKey in source) {
						if (source.hasOwnProperty(nextKey)) {
							output[nextKey] = source[nextKey];
						}
					}
				}
			}
			return output;
		};
	})();
}

MM.init();

- Config.js
var config = {
	address: "127.0.0.1", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 9000,
	
    ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1","172.16.99.254", "::ffff:172.16.99.254", "::1"], // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "en",
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: "clock",
			position: "top_left",
			config : {
			display:"none", 
			}
		},
		{
			module: "CategoryHairstyle",
			position: "lower_third", // This can be any of the regions.
			header: "헤어스타일", // Optional
			classes: "default everyone", // Optional
			config: {
				// See "Configuration options" for more information.
			}
		},
		{
			module: "CategoryManhair",
			position: "middle_center", // This can be any of the regions.
			header: "남자헤어", // Optional
			classes: "default everyone", // Optional
			config: {
				hidden : "true",
				// See "Configuration options" for more information.
			}
		},
		{
			module: "CategoryWomanhair",
			position: "middle_center", // This can be any of the regions.
			header: "여자헤어", // Optional
			
			classes: "default everyone", // Optional
			config: {
				hidden : "true",
				// See "Configuration options" for more information.
			}
		},
		{
			module: "ManCutdandy",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자컷댄디.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "ManCutRegent",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자컷리젠트.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "ManCutTwoBlock",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자컷투블럭.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "ManCutPomade",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자컷포마드.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "ManPermPart",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자펌가르마.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "ManPermRegent",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자펌리젠트.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "ManPermIron",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자펌아이롱.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanCutLayered",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자컷레이어드.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanCutBob",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자컷보브.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanCutShort",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자컷숏.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanCutHime",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자컷히메.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanPermGlam",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자펌글램.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanPermBody",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자펌바디.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "WomanPermHippie",
			position: "bottom_left",	// This can be any of the regions.
			hide : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자펌히피.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "Man10s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자10대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "Man20s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "true",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자20대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "Man30s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자30대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "Man40s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자40대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "Man50s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/남자50대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
			}
		},
		{
			module: "Woman10s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자10대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe		
					hidden : "true",
			}
		},
		{ 
			module: "CategoryChoicehairMenu", //23
			position: "top_left", // This can be any of the regions.
			header: "메뉴선택", // Optional
			classes: "default everyone", // Optional
			config: {
		
				// See "Configuration options" for more information.
			}
		},
		{
			module: "ShowWebtoon", //24
			position: "bottom_center",	// This can be any of the regions.
			config: {
				// See "Configuration options" for more information.
					url: ["https://comic.naver.com/webtoon/weekday.nhn"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1800", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe
					hide: "true",
				}
		},

		//1
		{
			module: "MMM-EmbedYoutube1",  //25
			position: "bottom_bar",	
			config: {
				video_id: "w3jLJU7DT5E",
				searchlist1: "쯔위",
				loop: true
			}
		},
		//2	
		{
			module: "CategoryChoiceEntMenu", //26
			position: "top_left", 
			classes: "default everyone",
			config: {
			}
		},
		//3
		{
			module: "CategoryChoiceYoutube", //27
			position: "top_left",
			classes: "default everyone", 
			config: {
			}
		},
		{
			module: "Woman20s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자20대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1800", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe
					hidden : "true",
			}
		},
		{
			module: "Woman30s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자30대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1800", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe
					hidden : "true",
			}
		},
		{
			module: "Woman40s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자40대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1800", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe
					hidden : "true",
			}
		},
		{
			module: "Woman50s",
			position: "bottom_left",	// This can be any of the regions.
			visible : "false",
			config: {
				// See "Configuration options" for more information.
					url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/여자50대.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1800", // height of iframe
					frameWidth: "980", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe
					hidden : "true",
			}
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "MMM-Testpython",
			position: "top_right",
			config:{
			}
			
		},
		{
			module: "MMM-Dynamic-Modules",
		},
		{
			module: "MMM-Remote-Control",
			position: "center",
			// uncomment the following line to show the URL of the remote control on the mirror
			// , position: "center"
			// you can hide this module afterwards from the remote control itself
			config: {
				customCommand: {},  // Optional, See "Using Custom Commands" below
				customMenu: "custom_menu.json", // Optional, See "Custom Menu Items" below
				showModuleApiMenu: true, // Optional, Enable the Module Controls menu
				apiKey: "",         // Optional, See API/README.md for details
			}
		},
		
		  {
			module: "MMM-MovieInfo",
			position: "top_right",
			config: {
				api_key: "08f29ef45bc98817d77bf4c03c8a6664",
				discover: {
					"sort_by": "popularity.desc"
				},
				useLanguage: "ko",
			}
		},

		{
			module: "MMM-darksky-hourly",
			position: "top_left",  // This can be any of the regions.
			config: {
				// See "Configuration options" for more information.
				apiKey: "8d7f5d22ed1974d6b4869c9304b39f50", // Dark Sky API key.
				latitude:   37.37988109409138,
				longitude: 126.9287487782795,
				language: "ko",
			}
		},
		{
				module: "MMM-GoogleMapsTraffic",
				position: "top_center",
				config: {
						key: "AIzaSyCun0rD3ujduOli6jrYWJzFjKw9K1HKqww",
						lat: 37.37988109409138,
						lng: 126.9287487782795,
						height: "300px",
						width: "300px",
						styledMapType: "transparent",
						disableDefaultUI: true,
						//backgroundColor: "hsla(0, 0%, 0%, 0)",
						markers: [
								{
										lat: 37.37988109409138,
										lng: 126.9287487782795,
										fillColor: "#9966ff"
								},
						],
				},
		},

		{
			module: "MMM-Carousel",
			position: "bottom_bar", // Required only for navigation controls
			config: {
				ignoreModules: ["alert"],
				mode: "slides",
				showPageIndicators: true,
				showPageControls: true,
				slides: {
					main: ["clock","currentweather","weatherforecast","MMM-Globe","newsfeed","mm-hide-all","clock"],
					"Slide 2": ["clock","CategoryHairstyle", "CategoryManhair", "CategoryWomanhair", "CategoryChoicehairMenu","mm-hide-all"],
					"Slide 3": ["MMM-Testpython","Man10s","Man20s","Man30s","Man40s","Man50s","Woman10s","MMM-Dynamic-Modules","mm-hide-all","clock"],
					"Slide 4": ["clock","MMM-AfterImage","MMM-BeforeImage","MMM-BeforeAfter","MMM-DeleteImage"],
					"Slide 5": ["MMM-HistoryImage1","MMM-HistoryImage2","MMM-HistoryImage3","mm-hide-all","clock","MMM-DeleteImage"],
					"Slide 6": ["CategoryChoiceYoutube","CategoryChoiceEntMenu","MMM-EmbedYoutube1","MMM-EmbedYoutube2","ShowWebtoon","mm-hide-all","clock"],
					"Slide 7": ["MMM-MovieInfo","ShowRemoteControl","mm-hide-all","clock"],
				},
				keyBindings: { 
					enabled: true,
					map: {
						NextSlide: "ArrowRight", 
						PrevSlide: "ArrowLeft", 
						Slide0:    "Home"
					},
					mode: "DEFAULT"
				}
			}
			
		},
		
	{
	module: "MMM-soccer",
  	position: "top_left",
  	config: {
    	     api_key: "e353fb53195b43b1a574d8f829f35d13",
    	     show: "ENGLAND",
	      leagues: {
               ENGLAND: "PL",
    	               },
  	        }
	},
	
	
  {
		module: "currentweather",
		position: "top_right",
		header: "    오늘의 날씨",
		config: {
			location: "Seoul",
			locationID: "1835847",  //ID from http://bulk.openweathermap.org/sample/; unzip the gz file and find your city
			appid: "f167f10ed5044b1a287054c8ccfb6730",                            
		}
	},
	{
		module: "weatherforecast",
		position: "top_right",
		header: "날씨",
		config: {
			location: "Anyang",
			locationID: "1835847",  //ID from http://www.openweathermap.org/help/city_list.txt
			appid: "f167f10ed5044b1a287054c8ccfb6730"
		}
	},            
	{
	  module: "MMM-Globe",                 // photo
	  position: "middle_center",
	  config: {
			style: "geoColor",
		  imageSize: 300,
		  ownImagePath:"http://rammb.cira.colostate.edu/ramsdis/online/images/thumb/himawari-8/full_disk_ahi_natural_color.jpg",
		  updateInterval: 10*60*1000
	  }
  },     
	{
		module: "alert",
	},
	{
		module: "compliments",
		position: "lower_third"
	},
	{
		module: "newsfeed",
		position: "bottom_center",
		config: {
		feeds: 
			[{
			title: "사회 , 경제  ",
			url: "http://media.daum.net/rss/part/primary/entertain/rss2.xml" 
			},
			{
			title: "스포츠  ",
			url: "http://media.daum.net/rss/today/primary/sports/rss2.xml" 
			},
			{
			title: "연예  ",
			url: "http://api.sbs.co.kr/xml/news/rss.jsp?pmDiv=entertainment" 
			},
			{
			title: "IT , 과학  ",
			url: "http://media.daum.net/rss/part/primary/digital/rss2.xml" 
			},
			],
			showSourceTitle: true,
			showPublishDate: false
		}
	},
	
	{
		module: "MMM-BeforeImage",
		position: "middle_center",
		header:"전 사진 ! ",
		config: {
			imagePaths: ["modules/MMM-BeforeAfter/before"]
		}
	},
	{
		module: "MMM-AfterImage",
		position: "middle_center",
		header:"후 사진! ",
		config: {
			imagePaths: ["modules/MMM-BeforeAfter/before"]
		}
	},
	{
			module: "MMM-BeforeAfter",
			position: "bottom_right",
			config:{
				foo:"yellow"
			}
			
		},
{
			module: "mm-hide-all",
			position: "bottom_right"
		},
		{
			module: "MMM-DeleteImage",
			position: "bottom_right"
		},
		{
			module: "MMM-HistoryImage1",
			position: "top_center",
			header:"asdf",
			config: {
			imagePaths: ["modules/MMM-BeforeAfter/minsoo"]
			}
		},
		{
			module: "MMM-HistoryImage2",
			position: "top_center",
			header:" 최근 두번째 사진입니다. ",
			config: {
			imagePaths: ["modules/MMM-BeforeAfter/minsoo"]
			}
		},
		{
			module: "MMM-HistoryImage3",
			position: "top_center",
			header:" 최근 세번째 사진입니다. ",
			config: {
			imagePaths: ["modules/MMM-BeforeAfter/minsoo"]
			}
		},
		{
			module: "ShowRemoteControl", //24
			position: "bottom_center",	// This can be any of the regions.
			config: {
				// See "Configuration options" for more information.
					url: ["http://127.0.0.1:9000/remote.html"],  // as many URLs you want or you can just ["ENTER IN URL"] if single URL.
					updateInterval: 0.5 * 60 * 1000, // rotate URLs every 30 seconds
					width: "1000", // width of iframe
					height: "1000", // height of iframe
					frameWidth: "600", // width of embedded iframe, height is beeing calculated by aspect ratio of iframe
				}
		},
		
		
			
		
		
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}

//홈화면 clock / currentweather / weatherforecast / Globe / newsfeed

- Clock/clock.js
//현재 시간 표시
Module.register("clock",{
	// Module config defaults.
	defaults: {
		displayType: "digital", // options: digital, analog, both

		timeFormat: config.timeFormat,
		displaySeconds: true,
		showPeriod: true,
		showPeriodUpper: false,
		clockBold: false,
		showDate: true,
		showWeek: false,
		dateFormat: "dddd, LL",

		/* specific to the analog clock */
		analogSize: "200px",
		analogFace: "simple", // options: 'none', 'simple', 'face-###' (where ### is 001 to 012 inclusive)
		analogPlacement: "bottom", // options: 'top', 'bottom', 'left', 'right'
		analogShowDate: "top", // options: false, 'top', or 'bottom'
		secondsColor: "#888888",
		timezone: null,
	},
	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "moment-timezone.js"];
	},
	// Define styles.
	getStyles: function() {
		return ["clock_styles.css"];
	},
	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Schedule update interval.
		var self = this;
		setInterval(function() {
			self.updateDom();
		}, 1000);

		// Set locale.
		moment.locale(config.language);

	},
	// Override dom generator.
	getDom: function() {

		var wrapper = document.createElement("div");

		/************************************
		 * Create wrappers for DIGITAL clock
		 */

		var dateWrapper = document.createElement("div");
		var timeWrapper = document.createElement("div");
		var secondsWrapper = document.createElement("sup");
		var periodWrapper = document.createElement("span");
		var weekWrapper = document.createElement("div")
		// Style Wrappers
		dateWrapper.className = "date normal medium";
		timeWrapper.className = "time bright large light";
		secondsWrapper.className = "dimmed";
		weekWrapper.className = "week dimmed medium"

		// Set content of wrappers.
		// The moment().format("h") method has a bug on the Raspberry Pi.
		// So we need to generate the timestring manually.
		// See issue: https://github.com/MichMich/MagicMirror/issues/181
		var timeString;
		var now = moment();
		if (this.config.timezone) {
			now.tz(this.config.timezone);
		}

		var hourSymbol = "HH";
		if (this.config.timeFormat !== 24) {
			hourSymbol = "h";
		}

		if (this.config.clockBold === true) {
			timeString = now.format(hourSymbol + "[<span class=\"bold\">]mm[</span>]");
		} else {
			timeString = now.format(hourSymbol + ":mm");
		}

		if(this.config.showDate){
			dateWrapper.innerHTML = now.format(this.config.dateFormat);
		}
		if (this.config.showWeek) {
			weekWrapper.innerHTML = this.translate("WEEK", { weekNumber: now.week() });
		}
		timeWrapper.innerHTML = timeString;
		secondsWrapper.innerHTML = now.format("ss");
		if (this.config.showPeriodUpper) {
			periodWrapper.innerHTML = now.format("A");
		} else {
			periodWrapper.innerHTML = now.format("a");
		}
		if (this.config.displaySeconds) {
			timeWrapper.appendChild(secondsWrapper);
		}
		if (this.config.showPeriod && this.config.timeFormat !== 24) {
			timeWrapper.appendChild(periodWrapper);
		}

		/****************************************************************
		 * Create wrappers for ANALOG clock, only if specified in config
		 */

		 if (this.config.displayType !== "digital") {
			// If it isn't 'digital', then an 'analog' clock was also requested

			// Calculate the degree offset for each hand of the clock
			var now = moment();
			if (this.config.timezone) {
				now.tz(this.config.timezone);
			}
			var	second = now.seconds() * 6,
				minute = now.minute() * 6 + second / 60,
				hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

			// Create wrappers
			var clockCircle = document.createElement("div");
			clockCircle.className = "clockCircle";
			clockCircle.style.width = this.config.analogSize;
			clockCircle.style.height = this.config.analogSize;

			if (this.config.analogFace != "" && this.config.analogFace != "simple" && this.config.analogFace != "none") {
				clockCircle.style.background = "url("+ this.data.path + "faces/" + this.config.analogFace + ".svg)";
				clockCircle.style.backgroundSize = "100%";

				// The following line solves issue: https://github.com/MichMich/MagicMirror/issues/611
				clockCircle.style.border = "1px solid black";

			} else if (this.config.analogFace != "none") {
				clockCircle.style.border = "2px solid white";
			}
			var clockFace = document.createElement("div");
			clockFace.className = "clockFace";

			var clockHour = document.createElement("div");
			clockHour.id = "clockHour";
			clockHour.style.transform = "rotate(" + hour + "deg)";
			clockHour.className = "clockHour";
			var clockMinute = document.createElement("div");
			clockMinute.id = "clockMinute";
			clockMinute.style.transform = "rotate(" + minute + "deg)";
			clockMinute.className = "clockMinute";

			// Combine analog wrappers
			clockFace.appendChild(clockHour);
			clockFace.appendChild(clockMinute);

			if (this.config.displaySeconds) {
				var clockSecond = document.createElement("div");
				clockSecond.id = "clockSecond";
				clockSecond.style.transform = "rotate(" + second + "deg)";
				clockSecond.className = "clockSecond";
				clockSecond.style.backgroundColor = this.config.secondsColor;
				clockFace.appendChild(clockSecond);
			}
			clockCircle.appendChild(clockFace);
		}

		/*******************************************
		 * Combine wrappers, check for .displayType
		 */

		if (this.config.displayType === "digital") {
			// Display only a digital clock
			wrapper.appendChild(dateWrapper);
			wrapper.appendChild(timeWrapper);
			wrapper.appendChild(weekWrapper);
		} else if (this.config.displayType === "analog") {
			// Display only an analog clock

			if (this.config.showWeek) {
				weekWrapper.style.paddingBottom = "15px";
			} else {
				dateWrapper.style.paddingBottom = "15px";
			}

			if (this.config.analogShowDate === "top") {
				wrapper.appendChild(dateWrapper);
				wrapper.appendChild(weekWrapper);
				wrapper.appendChild(clockCircle);
			} else if (this.config.analogShowDate === "bottom") {
				wrapper.appendChild(clockCircle);
				wrapper.appendChild(dateWrapper);
				wrapper.appendChild(weekWrapper);
			} else {
				wrapper.appendChild(clockCircle);
			}
		} else {
			// Both clocks have been configured, check position
			var placement = this.config.analogPlacement;

			analogWrapper = document.createElement("div");
			analogWrapper.id = "analog";
			analogWrapper.style.cssFloat = "none";
			analogWrapper.appendChild(clockCircle);
			digitalWrapper = document.createElement("div");
			digitalWrapper.id = "digital";
			digitalWrapper.style.cssFloat = "none";
			digitalWrapper.appendChild(dateWrapper);
			digitalWrapper.appendChild(timeWrapper);
			digitalWrapper.appendChild(weekWrapper);

			var appendClocks = function(condition, pos1, pos2) {
				var padding = [0,0,0,0];
				padding[(placement === condition) ? pos1 : pos2] = "20px";
				analogWrapper.style.padding = padding.join(" ");
				if (placement === condition) {
					wrapper.appendChild(analogWrapper);
					wrapper.appendChild(digitalWrapper);
				} else {
					wrapper.appendChild(digitalWrapper);
					wrapper.appendChild(analogWrapper);
				}
			};

			if (placement === "left" || placement === "right") {
				digitalWrapper.style.display = "inline-block";
				digitalWrapper.style.verticalAlign = "top";
				analogWrapper.style.display = "inline-block";

				appendClocks("left", 1, 3);
			} else {
				digitalWrapper.style.textAlign = "center";

				appendClocks("top", 2, 0);
			}
		}

		// Return the wrapper to the dom.
		return wrapper;
	}
});

- Weather
//날씨 정보 (현재, 한 주)
- currentweather/currentweather.js
Module.register("currentweather",{

	// Default module config.
	defaults: {
		location: false,
		locationID: false,
		appid: "",
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		showPeriod: true,
		showPeriodUpper: false,
		showWindDirection: true,
		showWindDirectionAsArrow: false,
		useBeaufort: true,
		useKMPHwind: false,
		lang: config.language,
		decimalSymbol: ".",
		showHumidity: false,
		degreeLabel: false,
		showIndoorTemperature: false,
		showIndoorHumidity: false,
		showFeelsLike: true,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,

		apiVersion: "2.5",
		apiBase: "https://api.openweathermap.org/data/",
		weatherEndpoint: "weather",

		appendLocationNameToHeader: true,
		calendarClass: "calendar",

		onlyTemp: false,
		roundTemp: false,

		iconTable: {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-cloudy-windy",
			"09d": "wi-showers",
			"10d": "wi-rain",
			"11d": "wi-thunderstorm",
			"13d": "wi-snow",
			"50d": "wi-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		},
	},

	// create a variable for the first upcoming calendar event. Used if no location is specified.
	firstEvent: false,

	// create a variable to hold the location name based on the API result.
	fetchedLocatioName: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["weather-icons.css", "currentweather.css"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.sunriseSunsetTime = null;
		this.sunriseSunsetIcon = null;
		this.temperature = null;
		this.indoorTemperature = null;
		this.indoorHumidity = null;
		this.weatherType = null;
		this.feelsLike = null;
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

	},

	// add extra information of current weather
	// windDirection, humidity, sunrise and sunset
	addExtraInfoWeather: function(wrapper) {

		var small = document.createElement("div");
		small.className = "normal medium";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind dimmed";
		small.appendChild(windIcon);

		var windSpeed = document.createElement("span");
		windSpeed.innerHTML = " " + this.windSpeed;
		small.appendChild(windSpeed);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("sup");
			if (this.config.showWindDirectionAsArrow) {
				if(this.windDeg !== null) {
					windDirection.innerHTML = " &nbsp;<i class=\"fa fa-long-arrow-down\" style=\"transform:rotate("+this.windDeg+"deg);\"></i>&nbsp;";
				}
			} else {
				windDirection.innerHTML = " " + this.translate(this.windDirection);
			}
			small.appendChild(windDirection);
		}
		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		if (this.config.showHumidity) {
			var humidity = document.createElement("span");
			humidity.innerHTML = this.humidity;

			var spacer = document.createElement("sup");
			spacer.innerHTML = "&nbsp;";

			var humidityIcon = document.createElement("sup");
			humidityIcon.className = "wi wi-humidity humidityIcon";
			humidityIcon.innerHTML = "&nbsp;";

			small.appendChild(humidity);
			small.appendChild(spacer);
			small.appendChild(humidityIcon);
		}

		var sunriseSunsetIcon = document.createElement("span");
		sunriseSunsetIcon.className = "wi dimmed " + this.sunriseSunsetIcon;
		small.appendChild(sunriseSunsetIcon);

		var sunriseSunsetTime = document.createElement("span");
		sunriseSunsetTime.innerHTML = " " + this.sunriseSunsetTime;
		small.appendChild(sunriseSunsetTime);

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.onlyTemp === false) {
			this.addExtraInfoWeather(wrapper);
		}

		var large = document.createElement("div");
		large.className = "large light";

		var weatherIcon = document.createElement("span");
		weatherIcon.className = "wi weathericon " + this.weatherType;
		large.appendChild(weatherIcon);

		var degreeLabel = "";
		if (this.config.degreeLabel) {
			switch (this.config.units ) {
			case "metric":
				degreeLabel = "C";
				break;
			case "imperial":
				degreeLabel = "F";
				break;
			case "default":
				degreeLabel = "K";
				break;
			}
		}

		if (this.config.decimalSymbol === "") {
			this.config.decimalSymbol = ".";
		}

		var temperature = document.createElement("span");
		temperature.className = "bright";
		temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
		large.appendChild(temperature);

		if (this.config.showIndoorTemperature && this.indoorTemperature) {
			var indoorIcon = document.createElement("span");
			indoorIcon.className = "fa fa-home";
			large.appendChild(indoorIcon);

			var indoorTemperatureElem = document.createElement("span");
			indoorTemperatureElem.className = "bright";
			indoorTemperatureElem.innerHTML = " " + this.indoorTemperature.replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
			large.appendChild(indoorTemperatureElem);
		}

		if (this.config.showIndoorHumidity && this.indoorHumidity) {
			var indoorHumidityIcon = document.createElement("span");
			indoorHumidityIcon.className = "fa fa-tint";
			large.appendChild(indoorHumidityIcon);

			var indoorHumidityElem = document.createElement("span");
			indoorHumidityElem.className = "bright";
			indoorHumidityElem.innerHTML = " " + this.indoorHumidity + "%";
			large.appendChild(indoorHumidityElem);
		}

		wrapper.appendChild(large);

		if (this.config.showFeelsLike && this.config.onlyTemp === false){
			var small = document.createElement("div");
			small.className = "normal medium";

			var feelsLike = document.createElement("span");
			feelsLike.className = "dimmed";
			feelsLike.innerHTML = this.translate("FEELS") + " " + this.feelsLike + "&deg;" + degreeLabel;
			small.appendChild(feelsLike);

			wrapper.appendChild(small);
		}

		return wrapper;
	},

	// Override getHeader method.
	getHeader: function() {
		if (this.config.appendLocationNameToHeader) {
			return this.data.header + " " + this.fetchedLocatioName;
		}

		return this.data.header;
	},

	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, {lockString: this.identifier});
			}
		}
		if (notification === "CALENDAR_EVENTS") {
			var senderClasses = sender.data.classes.toLowerCase().split(" ");
			if (senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1) {
				this.firstEvent = false;

				for (var e in payload) {
					var event = payload[e];
					if (event.location || event.geo) {
						this.firstEvent = event;
						//Log.log("First upcoming event with location: ", event);
						break;
					}
				}
			}
		}
		if (notification === "INDOOR_TEMPERATURE") {
			this.indoorTemperature = this.roundValue(payload);
			this.updateDom(this.config.animationSpeed);
		}
		if (notification === "INDOOR_HUMIDITY") {
			this.indoorHumidity = this.roundValue(payload);
			this.updateDom(this.config.animationSpeed);
		}
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function() {
		if (this.config.appid === "") {
			Log.error("CurrentWeather: APPID not set!");
			return;
		}

		var url = this.config.apiBase + this.config.apiVersion + "/" + this.config.weatherEndpoint + this.getParams();
		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function() {
		var params = "?";
		if(this.config.locationID) {
			params += "id=" + this.config.locationID;
		} else if(this.config.location) {
			params += "q=" + this.config.location;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon
		} else if (this.firstEvent && this.firstEvent.location) {
			params += "q=" + this.firstEvent.location;
		} else {
			this.hide(this.config.animationSpeed, {lockString:this.identifier});
			return;
		}

		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;

		return params;
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function(data) {

		if (!data || !data.main || typeof data.main.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.humidity = parseFloat(data.main.humidity);
		this.temperature = this.roundValue(data.main.temp);
		this.feelsLike = 0;

		if (this.config.useBeaufort){
			this.windSpeed = this.ms2Beaufort(this.roundValue(data.wind.speed));
		} else if (this.config.useKMPHwind) {
			this.windSpeed = parseFloat((data.wind.speed * 60 * 60) / 1000).toFixed(0);
		} else {
			this.windSpeed = parseFloat(data.wind.speed).toFixed(0);
		}

		// ONLY WORKS IF TEMP IN C //
		var windInMph = parseFloat(data.wind.speed * 2.23694);

		var tempInF = 0;
		switch (this.config.units){
		case "metric": tempInF = 1.8 * this.temperature + 32;
			break;
		case "imperial": tempInF = this.temperature;
			break;
		case "default":
			var tc = this.temperature - 273.15;
			tempInF = 1.8 * tc + 32;
			break;
		}

		if (windInMph > 3 && tempInF < 50){
			// windchill
			var windChillInF = Math.round(35.74+0.6215*tempInF-35.75*Math.pow(windInMph,0.16)+0.4275*tempInF*Math.pow(windInMph,0.16));
			var windChillInC = (windChillInF - 32) * (5/9);
			// this.feelsLike = windChillInC.toFixed(0);

			switch (this.config.units){
			case "metric": this.feelsLike = windChillInC.toFixed(0);
				break;
			case "imperial": this.feelsLike = windChillInF.toFixed(0);
				break;
			case "default":
				var tc = windChillInC + 273.15;
				this.feelsLike = tc.toFixed(0);
				break;
			}

		} else if (tempInF > 80 && this.humidity > 40){
			// heat index
			var Hindex = -42.379 + 2.04901523*tempInF + 10.14333127*this.humidity
				- 0.22475541*tempInF*this.humidity - 6.83783*Math.pow(10,-3)*tempInF*tempInF
				- 5.481717*Math.pow(10,-2)*this.humidity*this.humidity
				+ 1.22874*Math.pow(10,-3)*tempInF*tempInF*this.humidity
				+ 8.5282*Math.pow(10,-4)*tempInF*this.humidity*this.humidity
				- 1.99*Math.pow(10,-6)*tempInF*tempInF*this.humidity*this.humidity;

			switch (this.config.units){
			case "metric": this.feelsLike = parseFloat((Hindex - 32) / 1.8).toFixed(0);
				break;
			case "imperial": this.feelsLike = Hindex.toFixed(0);
				break;
			case "default":
				var tc = parseFloat((Hindex - 32) / 1.8) + 273.15;
				this.feelsLike = tc.toFixed(0);
				break;
			}
		} else {
			this.feelsLike = parseFloat(this.temperature).toFixed(0);
		}

		this.windDirection = this.deg2Cardinal(data.wind.deg);
		this.windDeg = data.wind.deg;
		this.weatherType = this.config.iconTable[data.weather[0].icon];

		var now = new Date();
		var sunrise = new Date(data.sys.sunrise * 1000);
		var sunset = new Date(data.sys.sunset * 1000);

		// The moment().format('h') method has a bug on the Raspberry Pi.
		// So we need to generate the timestring manually.
		// See issue: https://github.com/MichMich/MagicMirror/issues/181
		var sunriseSunsetDateObject = (sunrise < now && sunset > now) ? sunset : sunrise;
		var timeString = moment(sunriseSunsetDateObject).format("HH:mm");
		if (this.config.timeFormat !== 24) {
			//var hours = sunriseSunsetDateObject.getHours() % 12 || 12;
			if (this.config.showPeriod) {
				if (this.config.showPeriodUpper) {
					//timeString = hours + moment(sunriseSunsetDateObject).format(':mm A');
					timeString = moment(sunriseSunsetDateObject).format("h:mm A");
				} else {
					//timeString = hours + moment(sunriseSunsetDateObject).format(':mm a');
					timeString = moment(sunriseSunsetDateObject).format("h:mm a");
				}
			} else {
				//timeString = hours + moment(sunriseSunsetDateObject).format(':mm');
				timeString = moment(sunriseSunsetDateObject).format("h:mm");
			}
		}

		this.sunriseSunsetTime = timeString;
		this.sunriseSunsetIcon = (sunrise < now && sunset > now) ? "wi-sunset" : "wi-sunrise";

		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
		this.sendNotification("CURRENTWEATHER_DATA", {data: data});
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateWeather();
		}, nextLoad);
	},

	/* ms2Beaufort(ms)
	 * Converts m2 to beaufort (windspeed).
	 *
	 * see:
	 *  http://www.spc.noaa.gov/faq/tornado/beaufort.html
	 *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
	 *
	 * argument ms number - Windspeed in m/s.
	 *
	 * return number - Windspeed in beaufort.
	 */
	ms2Beaufort: function(ms) {
		var kmh = ms * 60 * 60 / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	deg2Cardinal: function(deg) {
		if (deg>11.25 && deg<=33.75){
			return "NNE";
		} else if (deg > 33.75 && deg <= 56.25) {
			return "NE";
		} else if (deg > 56.25 && deg <= 78.75) {
			return "ENE";
		} else if (deg > 78.75 && deg <= 101.25) {
			return "E";
		} else if (deg > 101.25 && deg <= 123.75) {
			return "ESE";
		} else if (deg > 123.75 && deg <= 146.25) {
			return "SE";
		} else if (deg > 146.25 && deg <= 168.75) {
			return "SSE";
		} else if (deg > 168.75 && deg <= 191.25) {
			return "S";
		} else if (deg > 191.25 && deg <= 213.75) {
			return "SSW";
		} else if (deg > 213.75 && deg <= 236.25) {
			return "SW";
		} else if (deg > 236.25 && deg <= 258.75) {
			return "WSW";
		} else if (deg > 258.75 && deg <= 281.25) {
			return "W";
		} else if (deg > 281.25 && deg <= 303.75) {
			return "WNW";
		} else if (deg > 303.75 && deg <= 326.25) {
			return "NW";
		} else if (deg > 326.25 && deg <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	},

	/* function(temperature)
	 * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
	 *
	 * argument temperature number - Temperature.
	 *
	 * return string - Rounded Temperature.
	 */
	roundValue: function(temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		return parseFloat(temperature).toFixed(decimals);
	}

});

- weatherforecast/weatherforecast.js
Module.register("weatherforecast",{

	// Default module config.
	defaults: {
		location: false,
		locationID: false,
		appid: "",
		units: config.units,
		maxNumberOfDays: 7,
		showRainAmount: false,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		lang: config.language,
		decimalSymbol: ".",
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
		colored: false,
		scale: false,

		initialLoadDelay: 2500, // 2.5 seconds delay. This delay is used to keep the OpenWeather API happy.
		retryDelay: 2500,

		apiVersion: "2.5",
		apiBase: "https://api.openweathermap.org/data/",
		forecastEndpoint: "forecast/daily",

		appendLocationNameToHeader: true,
		calendarClass: "calendar",
		tableClass: "small",

		roundTemp: false,

		iconTable: {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-cloudy-windy",
			"09d": "wi-showers",
			"10d": "wi-rain",
			"11d": "wi-thunderstorm",
			"13d": "wi-snow",
			"50d": "wi-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		},
	},

	// create a variable for the first upcoming calendaar event. Used if no location is specified.
	firstEvent: false,

	// create a variable to hold the location name based on the API result.
	fetchedLocationName: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["weather-icons.css", "weatherforecast.css"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build yiur own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.forecast = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = this.config.tableClass;

		for (var f in this.forecast) {
			var forecast = this.forecast[f];

			var row = document.createElement("tr");
			if (this.config.colored) {
				row.className = "colored";
			}
			table.appendChild(row);

			var dayCell = document.createElement("td");
			dayCell.className = "day";
			dayCell.innerHTML = forecast.day;
			row.appendChild(dayCell);

			var iconCell = document.createElement("td");
			iconCell.className = "bright weather-icon";
			row.appendChild(iconCell);

			var icon = document.createElement("span");
			icon.className = "wi weathericon " + forecast.icon;
			iconCell.appendChild(icon);

			var degreeLabel = "";
			if(this.config.scale) {
				switch(this.config.units) {
				case "metric":
					degreeLabel = " &deg;C";
					break;
				case "imperial":
					degreeLabel = " &deg;F";
					break;
				case "default":
					degreeLabel = "K";
					break;
				}
			}

			if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
				this.config.decimalSymbol = ".";
			}

			var maxTempCell = document.createElement("td");
			maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
			maxTempCell.className = "align-right bright max-temp";
			row.appendChild(maxTempCell);

			var minTempCell = document.createElement("td");
			minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
			minTempCell.className = "align-right min-temp";
			row.appendChild(minTempCell);

			if (this.config.showRainAmount) {
				var rainCell = document.createElement("td");
				if (isNaN(forecast.rain)) {
					rainCell.innerHTML = "";
				} else {
					if(config.units !== "imperial") {
						rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1) + " mm";
					} else {
						rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2) + " in";
					}
				}
				rainCell.className = "align-right bright rain";
				row.appendChild(rainCell);
			}

			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = this.forecast.length * this.config.fadePoint;
				var steps = this.forecast.length - startingPoint;
				if (f >= startingPoint) {
					var currentStep = f - startingPoint;
					row.style.opacity = 1 - (1 / steps * currentStep);
				}
			}
		}

		return table;
	},

	// Override getHeader method.
	getHeader: function() {
		if (this.config.appendLocationNameToHeader) {
			return this.data.header + " " + this.fetchedLocationName;
		}

		return this.data.header;
	},

	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, {lockString: this.identifier});
			}
		}
		if (notification === "CALENDAR_EVENTS") {
			var senderClasses = sender.data.classes.toLowerCase().split(" ");
			if (senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1) {
				this.firstEvent = false;

				for (var e in payload) {
					var event = payload[e];
					if (event.location || event.geo) {
						this.firstEvent = event;
						//Log.log("First upcoming event with location: ", event);
						break;
					}
				}
			}
		}
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function() {
		if (this.config.appid === "") {
			Log.error("WeatherForecast: APPID not set!");
			return;
		}

		var url = this.config.apiBase + this.config.apiVersion + "/" + this.config.forecastEndpoint + this.getParams();
		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					if (self.config.forecastEndpoint == "forecast/daily") {
						self.config.forecastEndpoint = "forecast";
						Log.warn(self.name + ": Your AppID does not support long term forecasts. Switching to fallback endpoint.");
					}

					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function() {
		var params = "?";
		if(this.config.locationID) {
			params += "id=" + this.config.locationID;
		} else if(this.config.location) {
			params += "q=" + this.config.location;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon
		} else if (this.firstEvent && this.firstEvent.location) {
			params += "q=" + this.firstEvent.location;
		} else {
			this.hide(this.config.animationSpeed, {lockString:this.identifier});
			return;
		}

		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;

		return params;
	},

	/*
	 * parserDataWeather(data)
	 *
	 * Use the parse to keep the same struct between daily and forecast Endpoint
	 * from Openweather
	 *
	 */
	parserDataWeather: function(data) {
		if (data.hasOwnProperty("main")) {
			data["temp"] = {"min": data.main.temp_min, "max": data.main.temp_max}
		}
		return data;
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function(data) {
		this.fetchedLocationName = data.city.name + ", " + data.city.country;

		this.forecast = [];
		var lastDay = null;
		var forecastData = {}

		for (var i = 0, count = data.list.length; i < count; i++) {

			var forecast = data.list[i];
			this.parserDataWeather(forecast); // hack issue #1017

			var day;
			var hour;
			if(!!forecast.dt_txt) {
				day = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("ddd");
				hour = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("H");
			} else {
				day = moment(forecast.dt, "X").format("ddd");
				hour = moment(forecast.dt, "X").format("H");
			}

			if (day !== lastDay) {
				var forecastData = {
					day: day,
					icon: this.config.iconTable[forecast.weather[0].icon],
					maxTemp: this.roundValue(forecast.temp.max),
					minTemp: this.roundValue(forecast.temp.min),
					rain: forecast.rain
				};

				this.forecast.push(forecastData);
				lastDay = day;

				// Stop processing when maxNumberOfDays is reached
				if (this.forecast.length === this.config.maxNumberOfDays) {
					break;
				}
			} else {
				//Log.log("Compare max: ", forecast.temp.max, parseFloat(forecastData.maxTemp));
				forecastData.maxTemp = forecast.temp.max > parseFloat(forecastData.maxTemp) ? this.roundValue(forecast.temp.max) : forecastData.maxTemp;
				//Log.log("Compare min: ", forecast.temp.min, parseFloat(forecastData.minTemp));
				forecastData.minTemp = forecast.temp.min < parseFloat(forecastData.minTemp) ? this.roundValue(forecast.temp.min) : forecastData.minTemp;

				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour >= 8 && hour <= 17) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		//Log.log(this.forecast);
		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateWeather();
		}, nextLoad);
	},

	/* ms2Beaufort(ms)
	 * Converts m2 to beaufort (windspeed).
	 *
	 * see:
	 *  http://www.spc.noaa.gov/faq/tornado/beaufort.html
	 *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
	 *
	 * argument ms number - Windspeed in m/s.
	 *
	 * return number - Windspeed in beaufort.
	 */
	ms2Beaufort: function(ms) {
		var kmh = ms * 60 * 60 / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	/* function(temperature)
	 * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
	 *
	 * argument temperature number - Temperature.
	 *
	 * return string - Rounded Temperature.
	 */
	roundValue: function(temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		return parseFloat(temperature).toFixed(decimals);
	}
});

- MMM-Globe/MMM-Globe.js
//홈 배경화면
const loadImage = src =>
  new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve({ image, isError: false });
    image.onerror = () => resolve({ image, isError: true });
    image.src = src;
  });

// Store last successfully loaded image in case the next one fails to load
let successfullyLoadedImageWrapper = null;

Module.register("MMM-Globe", {
  // Default module config.
  defaults: {
    style: "geoColor",
    imageSize: 600,
    ownImagePath: "",
    updateInterval: 10 * 60 * 1000  // 10 minutes
  },

  start: function() {
    self = this;
    this.url = "";
    this.imageUrls = {
      natColor:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest/himawari-8/full_disk_ahi_natural_color.jpg",
      geoColor:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest/himawari-8/full_disk_ahi_true_color.jpg",
      airMass:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest/himawari-8/full_disk_ahi_rgb_airmass.jpg",
      fullBand:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest/himawari-8/himawari-8_band_03_sector_02.gif",
      europeDiscNat:
        "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBNatColour_LowResolution.jpg",
      europeDiscSnow:
        "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBSolarDay_CentralEurope.jpg",
      centralAmericaDiscNat:
        "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/678x678.jpg"
    };
    this.hiResImageUrls = {
      natColor:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest_hi_res/himawari-8/full_disk_ahi_natural_color.jpg",
      geoColor:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest_hi_res/himawari-8/full_disk_ahi_true_color.jpg",
      airMass:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest_hi_res/himawari-8/full_disk_ahi_rgb_airmass.jpg",
      fullBand:
        "http://rammb.cira.colostate.edu/ramsdis/online/images/latest/himawari-8/himawari-8_band_03_sector_02.gif",
      europeDiscNat:
        "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBNatColour_LowResolution.jpg",
      europePartSnow:
        "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBSolarDay_CentralEurope.jpg",
      centralAmericaDiscNat:
        "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg"
    };
    if (this.config.ownImagePath != "") {
      this.url = this.config.ownImagePath;
    } else {
      if (this.config.imageSize > 800) {
        this.url = this.hiResImageUrls[this.config.style];
      } else {
        this.url = this.imageUrls[this.config.style];
      }
      setInterval(function() {
        self.updateDom(1000);
      }, this.config.updateInterval);
    }
  },

  getStyles: function() {
    return ["MMM-Globe.css"];
  },

  getDom: async function() {
    const { image, isError } = await loadImage(
      this.url + "?" + new Date().getTime()
    );

    if (!isError) {
      // If the image loaded show it
      var wrapper = document.createElement("div");
      if (this.config.style == "europeDiscNat") {
        wrapper.style.height = 0.98 * this.config.imageSize - 1 + "px";
        wrapper.style.overflow = "hidden";
      }

      if (this.config.style === "centralAmericaDiscNat") {
        image.className = "MMM-Globe-image-centralAmericaDiscNat";
      } else {
        image.className = "MMM-Globe-image";
      }

      image.width = this.config.imageSize.toString();
      image.height = this.config.imageSize.toString();
      wrapper.appendChild(image);
      successfullyLoadedImageWrapper = wrapper;
      return wrapper;
    } else if (successfullyLoadedImageWrapper) {
      // If there was an error loading the image show the last successfully loaded image
      return successfullyLoadedImageWrapper;
    }
    // If we haven't successfully loaded an image yet show nothing
    return document.createElement("div");
  }
});

- newsfeed/newsfeed.js
//뉴스 헤드라인 정보
Module.register("newsfeed",{

	// Default module config.
	defaults: {
		feeds: [
			{
				title: "New York Times",
				url: "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
				encoding: "UTF-8" //ISO-8859-1
			}
		],
		showSourceTitle: true,
		showPublishDate: true,
		showDescription: false,
		wrapTitle: true,
		wrapDescription: true,
		truncDescription: true,
		lengthDescription: 400,
		hideLoading: false,
		reloadInterval: 5 * 60 * 1000, // every 5 minutes
		updateInterval: 10 * 1000,
		animationSpeed: 2.5 * 1000,
		maxNewsItems: 0, // 0 for unlimited
		ignoreOldItems: false,
		ignoreOlderThan: 24 * 60 * 60 * 1000, // 1 day
		removeStartTags: "",
		removeEndTags: "",
		startTags: [],
		endTags: [],
		prohibitedWords: [],
		scrollLength: 500,
		logFeedWarnings: false
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.newsItems = [];
		this.loaded = false;
		this.activeItem = 0;
		this.scrollPosition = 0;

		this.registerFeeds();

		this.isShowingDescription = this.config.showDescription;
	},

	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "NEWS_ITEMS") {
			this.generateFeed(payload);

			if (!this.loaded) {
				this.scheduleUpdateInterval();
			}

			this.loaded = true;
		}
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.feedUrl) {
			wrapper.className = "small bright";
			wrapper.innerHTML = this.translate("configuration_changed");
			return wrapper;
		}

		if (this.activeItem >= this.newsItems.length) {
			this.activeItem = 0;
		}

		if (this.newsItems.length > 0) {

			// this.config.showFullArticle is a run-time configuration, triggered by optional notifications
			if (!this.config.showFullArticle && (this.config.showSourceTitle || this.config.showPublishDate)) {
				var sourceAndTimestamp = document.createElement("div");
				sourceAndTimestamp.className = "light small dimmed";

				if (this.config.showSourceTitle && this.newsItems[this.activeItem].sourceTitle !== "") {
					sourceAndTimestamp.innerHTML = this.newsItems[this.activeItem].sourceTitle;
				}
				if (this.config.showSourceTitle && this.newsItems[this.activeItem].sourceTitle !== "" && this.config.showPublishDate) {
					sourceAndTimestamp.innerHTML += ", ";
				}
				if (this.config.showPublishDate) {
					sourceAndTimestamp.innerHTML += moment(new Date(this.newsItems[this.activeItem].pubdate)).fromNow();
				}
				if (this.config.showSourceTitle && this.newsItems[this.activeItem].sourceTitle !== "" || this.config.showPublishDate) {
					sourceAndTimestamp.innerHTML += ":";
				}

				wrapper.appendChild(sourceAndTimestamp);
			}

			//Remove selected tags from the beginning of rss feed items (title or description)

			if (this.config.removeStartTags === "title" || this.config.removeStartTags === "both") {

				for (f=0; f<this.config.startTags.length;f++) {
					if (this.newsItems[this.activeItem].title.slice(0,this.config.startTags[f].length) === this.config.startTags[f]) {
						this.newsItems[this.activeItem].title = this.newsItems[this.activeItem].title.slice(this.config.startTags[f].length,this.newsItems[this.activeItem].title.length);
					}
				}

			}

			if (this.config.removeStartTags === "description" || this.config.removeStartTags === "both") {

				if (this.isShowingDescription) {
					for (f=0; f<this.config.startTags.length;f++) {
						if (this.newsItems[this.activeItem].description.slice(0,this.config.startTags[f].length) === this.config.startTags[f]) {
							this.newsItems[this.activeItem].title = this.newsItems[this.activeItem].description.slice(this.config.startTags[f].length,this.newsItems[this.activeItem].description.length);
						}
					}
				}

			}

			//Remove selected tags from the end of rss feed items (title or description)

			if (this.config.removeEndTags) {
				for (f=0; f<this.config.endTags.length;f++) {
					if (this.newsItems[this.activeItem].title.slice(-this.config.endTags[f].length)===this.config.endTags[f]) {
						this.newsItems[this.activeItem].title = this.newsItems[this.activeItem].title.slice(0,-this.config.endTags[f].length);
					}
				}

				if (this.isShowingDescription) {
					for (f=0; f<this.config.endTags.length;f++) {
						if (this.newsItems[this.activeItem].description.slice(-this.config.endTags[f].length)===this.config.endTags[f]) {
							this.newsItems[this.activeItem].description = this.newsItems[this.activeItem].description.slice(0,-this.config.endTags[f].length);
						}
					}
				}

			}

			if(!this.config.showFullArticle){
				var title = document.createElement("div");
				title.className = "bright medium light" + (!this.config.wrapTitle ? " no-wrap" : "");
				title.innerHTML = this.newsItems[this.activeItem].title;
				wrapper.appendChild(title);
			}

			if (this.isShowingDescription) {
				var description = document.createElement("div");
				description.className = "small light" + (!this.config.wrapDescription ? " no-wrap" : "");
				var txtDesc = this.newsItems[this.activeItem].description;
				description.innerHTML = (this.config.truncDescription ? (txtDesc.length > this.config.lengthDescription ? txtDesc.substring(0, this.config.lengthDescription) + "..." : txtDesc) : txtDesc);
				wrapper.appendChild(description);
			}

			if (this.config.showFullArticle) {
				var fullArticle = document.createElement("iframe");
				fullArticle.className = "";
				fullArticle.style.width = "100vw";
				// very large height value to allow scrolling
				fullArticle.height = "3000";
				fullArticle.style.height = "3000";
				fullArticle.style.top = "0";
				fullArticle.style.left = "0";
				fullArticle.style.border = "none";
				fullArticle.src = typeof this.newsItems[this.activeItem].url  === "string" ? this.newsItems[this.activeItem].url : this.newsItems[this.activeItem].url.href;
				fullArticle.style.zIndex = 1;
				wrapper.appendChild(fullArticle);
			}

			if (this.config.hideLoading) {
				this.show();
			}

		} else {
			if (this.config.hideLoading) {
				this.hide();
			} else {
				wrapper.innerHTML = this.translate("LOADING");
				wrapper.className = "small dimmed";
			}
		}

		return wrapper;
	},

	/* registerFeeds()
	 * registers the feeds to be used by the backend.
	 */
	registerFeeds: function() {
		for (var f in this.config.feeds) {
			var feed = this.config.feeds[f];
			this.sendSocketNotification("ADD_FEED", {
				feed: feed,
				config: this.config
			});
		}
	},

	/* generateFeed()
	 * Generate an ordered list of items for this configured module.
	 *
	 * attribute feeds object - An object with feeds returned by the node helper.
	 */
	generateFeed: function(feeds) {
		var newsItems = [];
		for (var feed in feeds) {
			var feedItems = feeds[feed];
			if (this.subscribedToFeed(feed)) {
				for (var i in feedItems) {
					var item = feedItems[i];
					item.sourceTitle = this.titleForFeed(feed);
					if (!(this.config.ignoreOldItems && ((Date.now() - new Date(item.pubdate)) > this.config.ignoreOlderThan))) {
						newsItems.push(item);
					}
				}
			}
		}
		newsItems.sort(function(a,b) {
			var dateA = new Date(a.pubdate);
			var dateB = new Date(b.pubdate);
			return dateB - dateA;
		});
		if(this.config.maxNewsItems > 0) {
			newsItems = newsItems.slice(0, this.config.maxNewsItems);
		}

		if(this.config.prohibitedWords.length > 0) {
			newsItems = newsItems.filter(function(value){
				for (var i=0; i < this.config.prohibitedWords.length; i++) {
					if (value["title"].toLowerCase().indexOf(this.config.prohibitedWords[i].toLowerCase()) > -1) {
						return false;
					}
				}
				return true;
			}, this);
		}

		this.newsItems = newsItems;
	},

	/* subscribedToFeed(feedUrl)
	 * Check if this module is configured to show this feed.
	 *
	 * attribute feedUrl string - Url of the feed to check.
	 *
	 * returns bool
	 */
	subscribedToFeed: function(feedUrl) {
		for (var f in this.config.feeds) {
			var feed = this.config.feeds[f];
			if (feed.url === feedUrl) {
				return true;
			}
		}
		return false;
	},

	/* titleForFeed(feedUrl)
	 * Returns title for a specific feed Url.
	 *
	 * attribute feedUrl string - Url of the feed to check.
	 *
	 * returns string
	 */
	titleForFeed: function(feedUrl) {
		for (var f in this.config.feeds) {
			var feed = this.config.feeds[f];
			if (feed.url === feedUrl) {
				return feed.title || "";
			}
		}
		return "";
	},

	/* scheduleUpdateInterval()
	 * Schedule visual update.
	 */
	scheduleUpdateInterval: function() {
		var self = this;

		self.updateDom(self.config.animationSpeed);

		timer = setInterval(function() {
			self.activeItem++;
			self.updateDom(self.config.animationSpeed);
		}, this.config.updateInterval);
	},

	/* capitalizeFirstLetter(string)
	 * Capitalizes the first character of a string.
	 *
	 * argument string string - Input string.
	 *
	 * return string - Capitalized output string.
	 */
	capitalizeFirstLetter: function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	resetDescrOrFullArticleAndTimer: function() {
		this.isShowingDescription = this.config.showDescription;
		this.config.showFullArticle = false;
		this.scrollPosition = 0;
		// reset bottom bar alignment
		document.getElementsByClassName("region bottom bar")[0].style.bottom = "0";
		document.getElementsByClassName("region bottom bar")[0].style.top = "inherit";
		if(!timer){
			this.scheduleUpdateInterval();
		}
	},

	notificationReceived: function(notification, payload, sender) {
		Log.info(this.name + " - received notification: " + notification);
		if(notification === "ARTICLE_NEXT"){
			var before = this.activeItem;
			this.activeItem++;
			if (this.activeItem >= this.newsItems.length) {
				this.activeItem = 0;
			}
			this.resetDescrOrFullArticleAndTimer();
			Log.info(this.name + " - going from article #" + before + " to #" + this.activeItem + " (of " + this.newsItems.length + ")");
			this.updateDom(100);
		} else if(notification === "ARTICLE_PREVIOUS"){
			var before = this.activeItem;
			this.activeItem--;
			if (this.activeItem < 0) {
				this.activeItem = this.newsItems.length - 1;
			}
			this.resetDescrOrFullArticleAndTimer();
			Log.info(this.name + " - going from article #" + before + " to #" + this.activeItem + " (of " + this.newsItems.length + ")");
			this.updateDom(100);
		}
		// if "more details" is received the first time: show article summary, on second time show full article
		else if(notification === "ARTICLE_MORE_DETAILS"){
			// full article is already showing, so scrolling down
			if(this.config.showFullArticle === true){
				this.scrollPosition += this.config.scrollLength;
				window.scrollTo(0, this.scrollPosition);
				Log.info(this.name + " - scrolling down");
				Log.info(this.name + " - ARTICLE_MORE_DETAILS, scroll position: " + this.config.scrollLength);
			}
			else {
				this.showFullArticle();
			}
		} else if(notification === "ARTICLE_SCROLL_UP"){
			if(this.config.showFullArticle === true){
				this.scrollPosition -= this.config.scrollLength;
				window.scrollTo(0, this.scrollPosition);
				Log.info(this.name + " - scrolling up");
				Log.info(this.name + " - ARTICLE_SCROLL_UP, scroll position: " + this.config.scrollLength);
			}
		} else if(notification === "ARTICLE_LESS_DETAILS"){
			this.resetDescrOrFullArticleAndTimer();
			Log.info(this.name + " - showing only article titles again");
			this.updateDom(100);
		} else if (notification === "ARTICLE_TOGGLE_FULL"){
			if (this.config.showFullArticle){
				this.activeItem++;
				this.resetDescrOrFullArticleAndTimer();
			} else {
				this.showFullArticle();
			}
		} else {
			Log.info(this.name + " - unknown notification, ignoring: " + notification);
		}
	},

	showFullArticle: function() {
		this.isShowingDescription = !this.isShowingDescription;
		this.config.showFullArticle = !this.isShowingDescription;
		// make bottom bar align to top to allow scrolling
		if(this.config.showFullArticle === true){
			document.getElementsByClassName("region bottom bar")[0].style.bottom = "inherit";
			document.getElementsByClassName("region bottom bar")[0].style.top = "-90px";
		}
		clearInterval(timer);
		timer = null;
		Log.info(this.name + " - showing " + this.isShowingDescription ? "article description" : "full article");
		this.updateDom(100);
	}

});

- HairStyle Choice 메뉴선택 / 헤어스타일 선택 / 헤어스타일 목록선택 / 각자사진뜨는 프레임
CategoryHairstyle/CategoryHairstyle.js
//성별 구분
Module.register("CategoryHairstyle",{
	
	requiresVersion: "2.1.0",
	
    defaults: {
        // Allow the module to force modules to be shown (if hidden and locked by another module ex. profile-switcher).
        allowForce: true,
        // Determines if the border around the buttons should be shown.
        showBorder: false,
        // The minimum width for all the buttons.
        minWidth: "0px",
        // The minimum height for all the buttons.
        minHeight: "0px",
        // The location of the symbol relative to the text. Options: left, right, top or bottom
        picturePlacement: "top",
        // The direction of the bar. Options: row, column, row-reverse or column-reverse
        direction: "row",
		// The speed of the hide and show animation.
		animationSpeed: 300,
	
        // The default button 1. Add your buttons in the config.
		buttons: {
			
			"1": {
				module: "CategoryManhair",
				text:   "남자헤어",
				img:"modules/CategoryHairstyle/man.jpg",
				width: "450",
				height: "450",
			},

			"2": {
				module: "CategoryWomanhair",
				text:   "여자헤어",
				img : "modules/CategoryHairstyle/women.jpg",
				width: "450",
				height: "450",
			}
		}
	},
	start(){
		CategoryHairStyle = this;	
	},
	

    // Define required styles.
	getStyles: function(){
		return ["font-awesome.css", "CategoryHairstyle.css"];
	},

    // Override dom generator.
    getDom: function() {
        var menu = document.createElement("span");
        menu.className = "modulebar-menu";
        menu.id = this.identifier + "_menu";
        menu.style.flexDirection = this.config.direction;
		// Sends each button to the "createButton" function be created.
		for (var num in this.config.buttons) {
			menu.appendChild(this.createButton(this, num, this.config.buttons[num], this.config.picturePlacement));
		}
		
        return menu;
    },

	// Creates the buttons.
    createButton: function (self, num, data, placement) {
		// Creates the span elemet to contain all the buttons.
		var item = document.createElement("span");
        // Builds a uniqe indentity / button.
		item.id = self.identifier + "_button_" + num;
        // Sets a class to all buttons.
		item.className = "modulebar-button";
        // Makes sure the width and height is at least the defined minimum.
		item.style.minWidth = self.config.minWidth;
        item.style.minHeight = self.config.minHeight;
		// Collects all modules loaded in MagicMirror.
		var modules = MM.getModules();
		

		// When a button is clicked, the module either gets hidden or shown depending on current module status.
		item.addEventListener("click", function () {
			// Lists through all modules for testing.
			for (var i = 1; i < modules.length; i++) {
				// Check if the curent module is the one.
				if (modules[i].name === data.module) {
					// Splits out the module number of the module with the same name.
					var idnr = modules[i].data.identifier.split("_");
					// Checks if idnum is set in config.js. If it is, it only hides that module, if not hides all modules with the same name.
					if (idnr[2] == data.idnum || data.idnum == null) {
						// Check if the module is hidden.
						if (!modules[i].hidden) {
							// Hides the module.
							modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
							// Prints in the console what just happend (adding the ID). 
							console.log("Hiding "+modules[i].name+" ID: "+idnr[2]);
							// Check if there is a "hideURL" defined.
							if (data.hideUrl != null) {
								// Visiting the the URL.
								fetch(data.hideUrl);
								// Prints the visited hideURL.
								console.log("Visiting hide URL: "+data.hideUrl);
							}
							for (var k = 1; k < 18; k++){
								console.log("Hiding opend "+ modules[k].name+" ID: "+idnr[2]);
								modules[k].hide(self.config.animationSpeed, {force: self.config.allowForce});	
							}
						}
						else {
							// Check if there is a "showURL" defined.
							if (data.showUrl != null) {
								// Visiting the show URL.
								fetch(data.showUrl);
								// Prints the visited hideURL.
								console.log("Visiting show URL: "+data.showUrl);
							}
							if (modules[i].name == 'CategoryWomanhair') {
								console.log("Hiding opend "+ modules[2].name+" ID: "+idnr[2]);
								modules[2].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								
								
								for (var k = 1; k < 18; k++){
									console.log("Hiding opend "+ modules[k].name+" ID: "+idnr[2]);
									modules[k].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								}

								console.log("Showing "+modules[i].name+" ID: "+idnr[2]);	
								setTimeout(function(){
									modules[3].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
								CategoryHairStyle.sendNotification("Modulebar0 is Clicked");
							}
							else {
								console.log("Hiding opend "+ modules[3].name+" ID: "+idnr[2]);			
								modules[3].hide(self.config.animationSpeed, {force: self.config.allowForce});

								for (var k = 1; k < 18; k++){
									console.log("Hiding opend "+ modules[k].name+" ID: "+idnr[2]);
									modules[k].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								}

								console.log("Showing "+modules[i].name+" ID: "+idnr[2]);	
								setTimeout(function(){
								modules[2].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
								CategoryHairStyle.sendNotification("Modulebar0 is Clicked");
							}
						}
					}
				}
			}
		});
		// Fixes the aligning.
        item.style.flexDirection = {
            "right"  : "row-reverse",
            "left"   : "row",
            "top"    : "column",
            "bottom" : "column-reverse"
        }[placement];
		// Sets the border around the symbol/picture/text to black.
        if (!self.config.showBorder) {
            item.style.borderColor = "black";
        }
		// Adds the Font-Awesome symbol if specified.
        if (data.symbol) {
            var symbol = document.createElement("span");
            symbol.className = "modulebar-picture fa fa-" + data.symbol;
			// Sets the size on the symbol if specified.
            if (data.size) {
                symbol.className += " fa-" + data.size;
                symbol.className += data.size == 1 ? "g" : "x";
            }
			// Align the symbol with a margin.
            if (data.text && placement === "left") {
                symbol.style.marginRight = "4px";
            }
			// Adds the symbol to the item.
            item.appendChild(symbol);

		// Adds a picture if specified.
		} else if (data.img) {
            var image = document.createElement("img");
            image.className = "modulebar-picture";
            image.src = data.img;
			// Sets the size of the picture if specified.
            if (data.width)  image.width  = data.width;
            if (data.height) image.height = data.height;
			// Align the picture with a margin.
            if (data.text && placement === "left") {
                image.style.marginRight = "4px";
            }
			// Adds the picture to the item.
            item.appendChild(image);
        }
		// Adds the text if specified.
        if (data.text) {
            var text = document.createElement("span");
            text.className = "modulebar-text";
            text.innerHTML = data.text;
			// Align the text with a margin.
            if ((data.symbol || data.img) && placement === "right") {
                text.style.marginRight = "4px";
            }
			// Adds the text to the item.
            item.appendChild(text);
        }
		// All done. :)
        return item;
    }
});	

CategoryManhair/CategoryManhair.js
//남자 헤어 목록
Module.register("CategoryManhair",{
	
	requiresVersion: "2.1.0",
	
    defaults: {
        // Allow the module to force modules to be shown (if hidden and locked by another module ex. profile-switcher).
        allowForce: true,
        // Determines if the border around the buttons should be shown.
        showBorder: false,
        // The minimum width for all the buttons.
        minWidth: "0px",
        // The minimum height for all the buttons.
        minHeight: "0px",
        // The location of the symbol relative to the text. Options: left, right, top or bottom
        picturePlacement: "left",
        // The direction of the bar. Options: row, column, row-reverse or column-reverse
        direction: "column",
		// The speed of the hide and show animation.
		animationSpeed: 500,
        // The default button 1. Add your buttons in the config.
		buttons: {
            "1": {
				module: "ManCutDandy",
				text:   "댄디컷",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},
			
			"2": {
				module: "ManCutRegent",
				text:   "리젠트컷",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},

			"3": {
				module: "ManCutTwoBlock",
				text:   "투블럭컷",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},

			"4": {
				module: "ManCutPomade",
				text:   "포마드",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},
			
			"5": {
				module: "ManPermPart",
				text:   "가르마펌",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},

			"6": {
				module: "ManPermRegent",
				text:   "리젠트펌",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},

			"7": {
				module: "ManPermIron",
				text:   "아이롱펌",
				img: "https://image.flaticon.com/icons/svg/1751/1751524.svg",
				width: "50",
				height: "50",
			},

		}
	},
	start(){
		CategoryManhair = this;
	},

    // Define required styles.
	getStyles: function(){
		return ["font-awesome.css", "MMM-Modulebar.css"];
	},

    // Override dom generator.
    getDom: function() {
        var menu = document.createElement("span");
        menu.className = "modulebar-menu";
        menu.id = this.identifier + "_menu";
        menu.style.flexDirection = this.config.direction;
		// Sends each button to the "createButton" function be created.
		for (var num in this.config.buttons) {
			menu.appendChild(this.createButton(this, num, this.config.buttons[num], this.config.picturePlacement));
		}


		return menu;
	},
	// Creates the buttons.
    createButton: function (self, num, data, placement) {
		// Creates the span elemet to contain all the buttons.
		var item = document.createElement("span");
        // Builds a uniqe indentity / button.
		item.id = self.identifier + "_button_" + num;
        // Sets a class to all buttons.
		item.className = "modulebar-button";
        // Makes sure the width and height is at least the defined minimum.
		item.style.minWidth = self.config.minWidth;
        item.style.minHeight = self.config.minHeight;
		// Collects all modules loaded in MagicMirror.
		var modules = MM.getModules();
		// When a button is clicked, the module either gets hidden or shown depending on current module status.
		item.addEventListener("click", function () {
			// Lists through all modules for testing.
			for (var i = 1; i < modules.length; i++) {
				// Check if the curent module is the one.
				if (modules[i].name === data.module) {
					// Splits out the module number of the module with the same name.
					var idnr = modules[i].data.identifier.split("_");
					// Checks if idnum is set in config.js. If it is, it only hides that module, if not hides all modules with the same name.
					if (idnr[1] == data.idnum || data.idnum == null) {
						// Check if the module is hidden.
						if (!modules[i].hidden) {
							// Hides the module.
							modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
							// Prints in the console what just happend (adding the ID). 
							console.log("Hiding "+modules[i].name+" ID: "+idnr[1]);
							// Check if there is a "hideURL" defined.
							if (data.hideUrl != null) {
								// Visiting the the URL.
								fetch(data.hideUrl);
								// Prints the visited hideURL.
								console.log("Visiting hide URL: "+data.hideUrl);
							}
						}
						else {
							// Check if there is a "showURL" defined.
							if (data.showUrl != null) {
								// Visiting the show URL.
								fetch(data.showUrl);
								// Prints the visited hideURL.
								console.log("Visiting show URL: "+data.showUrl);
							}
							if (modules[i].name == 'ManCutDandy') {
								
								for(var num=1; num<18; num++ ){
								console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
								modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								}
								console.log("Showing "+modules[4].name+" ID: "+idnr[1]);	
								setTimeout(function(){
									modules[4].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
							}
							else if (modules[i].name == 'ManCutRegent') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[5].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[5].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'ManCutTwoBlock') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[6].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[6].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'ManCutPomade') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[7].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[7].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'ManPermPart') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[8].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[8].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'ManPermRegent') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[9].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[9].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
								console.log("Showing "+modules[10].name+" ID: "+idnr[1]);	
								setTimeout(function(){
									modules[10].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
							}
							CategoryManhair.sendNotification("CategoryManhair is Clicked");
						}
					}
				}
			}
		});
		// Fixes the aligning.
        item.style.flexDirection = {
            "right"  : "row-reverse",
            "left"   : "row",
            "top"    : "column",
            "bottom" : "column-reverse"
        }[placement];
		// Sets the border around the symbol/picture/text to black.
        if (!self.config.showBorder) {
            item.style.borderColor = "black";
        }
		// Adds the Font-Awesome symbol if specified.
        if (data.symbol) {
            var symbol = document.createElement("span");
            symbol.className = "modulebar-picture fa fa-" + data.symbol;
			// Sets the size on the symbol if specified.
            if (data.size) {
                symbol.className += " fa-" + data.size;
                symbol.className += data.size == 1 ? "g" : "x";
            }
			// Align the symbol with a margin.
            if (data.text && placement === "left") {
                symbol.style.marginRight = "4px";
            }
			// Adds the symbol to the item.
            item.appendChild(symbol);

		// Adds a picture if specified.
		} else if (data.img) {
            var image = document.createElement("img");
            image.className = "modulebar-picture";
            image.src = data.img;
			// Sets the size of the picture if specified.
            if (data.width)  image.width  = data.width;
            if (data.height) image.height = data.height;
			// Align the picture with a margin.
            if (data.text && placement === "left") {
                image.style.marginRight = "4px";
            }
			// Adds the picture to the item.
            item.appendChild(image);
        }
		// Adds the text if specified.
        if (data.text) {
            var text = document.createElement("span");
            text.className = "modulebar-text";
            text.innerHTML = data.text;
			// Align the text with a margin.
            if ((data.symbol || data.img) && placement === "right") {
                text.style.marginRight = "4px";
            }
			// Adds the text to the item.
            item.appendChild(text);
		}
		
		// All done. :)
        return item;
	},
	notificationReceived: function(notification, payload){
		Log.info(this.name + " - received norification : " + notification);

		if(notification === 'Modules All Change'){
			this.hide();
		}
	}
});	

CategoryWomanhair/CategoryWomanhair.js
//여자 헤어 목록
Module.register("CategoryWomanhair",{
	
	requiresVersion: "2.1.0",
	
    defaults: {
        // Allow the module to force modules to be shown (if hidden and locked by another module ex. profile-switcher).
        allowForce: true,
        // Determines if the border around the buttons should be shown.
        showBorder: false,
        // The minimum width for all the buttons.
        minWidth: "0px",
        // The minimum height for all the buttons.
        minHeight: "0px",
        // The location of the symbol relative to the text. Options: left, right, top or bottom
        picturePlacement: "left",
        // The direction of the bar. Options: row, column, row-reverse or column-reverse
        direction: "column",
		// The speed of the hide and show animation.
		animationSpeed: 500,
        // The default button 1. Add your buttons in the config.
		buttons: {
			"1": {
				module: "WomanCutLayered",
				text:   "레이어드",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},
			
			"2": {
				module: "WomanCutBob",
				text:   "보브",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},

			"3": {
				module: "WomanCutShort",
				text:   "숏",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},
			"4": {
				module: "MMM-iFrame13",
				text:   "히메",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},
			"5": {
				module: "WomanPermGlam",
				text:   "글램펌",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},
			"6": {
				module: "WomanPermBody",
				text:   "바디펌",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},
			"7": {
				module: "WomanPermHippie",
				text:   "히피펌",
				img: "https://image.flaticon.com/icons/svg/1751/1751349.svg",
				width: "50",
				height: "50",
			},
			

		}
    },
    // Define required styles.
	getStyles: function(){
		return ["font-awesome.css", "MMM-Modulebar.css"];
	},
	start () {
		modulebar2 = this;
	},

    // Override dom generator.
    getDom: function() {
        var menu = document.createElement("span");
        menu.className = "modulebar-menu";
        menu.id = this.identifier + "_menu";
        menu.style.flexDirection = this.config.direction;
		// Sends each button to the "createButton" function be created.
		for (var num in this.config.buttons) {
			menu.appendChild(this.createButton(this, num, this.config.buttons[num], this.config.picturePlacement));
		}
        return menu;
    },

	// Creates the buttons.
    createButton: function (self, num, data, placement) {
		// Creates the span elemet to contain all the buttons.
		var item = document.createElement("span");
        // Builds a uniqe indentity / button.
		item.id = self.identifier + "_button_" + num;
        // Sets a class to all buttons.
		item.className = "modulebar-button";
        // Makes sure the width and height is at least the defined minimum.
		item.style.minWidth = self.config.minWidth;
        item.style.minHeight = self.config.minHeight;
		// Collects all modules loaded in MagicMirror.
		var modules = MM.getModules();
		// When a button is clicked, the module either gets hidden or shown depending on current module status.
		item.addEventListener("click", function () {
			// Lists through all modules for testing.
			for (var i = 1; i < modules.length; i++) {
				// Check if the curent module is the one.
				if (modules[i].name === data.module) {
					// Splits out the module number of the module with the same name.
					var idnr = modules[i].data.identifier.split("_");
					// Checks if idnum is set in config.js. If it is, it only hides that module, if not hides all modules with the same name.
					if (idnr[2] == data.idnum || data.idnum == null) {
						// Check if the module is hidden.						if (!modules[i].hidden) {
							// Hides the module.
						if (!modules[i].hidden) {
							// Hides the module.
							modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
							// Prints in the console what just happend (adding the ID). 
							console.log("Hiding "+modules[i].name+" ID: "+idnr[1]);
							// Check if there is a "hideURL" defined.
							if (data.hideUrl != null) {
								// Visiting the the URL.
								fetch(data.hideUrl);
								// Prints the visited hideURL.
								console.log("Visiting hide URL: "+data.hideUrl);
							}
						}
						else {
							// Check if there is a "showURL" defined.
							if (data.showUrl != null) {
							// Visiting the show URL.
								fetch(data.showUrl);
								// Prints the visited hideURL.
								console.log("Visiting show URL: "+data.showUrl);
							}
							if (modules[i].name == 'WomanCutLayered') {
								for(var num=1; num<18; num++ ){
								console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
								modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								}
								console.log("Showing "+modules[11].name+" ID: "+idnr[1]);	
								setTimeout(function(){
									modules[11].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
							}
							else if (modules[i].name == 'WomanCutBob') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[12].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[12].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'WomanCutShort') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[13].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[13].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'MMM-iFrame13') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[14].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[14].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'WomanPermGlam') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[15].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[15].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else if (modules[i].name == 'WomanPermBody') {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
									console.log("Showing "+modules[16].name+" ID: "+idnr[1]);	
									setTimeout(function(){
										modules[16].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
							}
							else {
								for(var num=1; num<18; num++ ){
									console.log("Hiding opend "+ modules[num].name+" ID: "+idnr[1]);
									modules[num].hide(self.config.animationSpeed, {force: self.config.allowForce});	
									}
								console.log("Showing "+modules[17].name+" ID: "+idnr[1]);	
								setTimeout(function(){
									modules[17].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
							}
							modulebar2.sendNotification("Modulebar2 is Clicked");
						}
					}
				}
			}
		});
		// Fixes the aligning.
        item.style.flexDirection = {
            "right"  : "row-reverse",
            "left"   : "row",
            "top"    : "column",
            "bottom" : "column-reverse"
        }[placement];
		// Sets the border around the symbol/picture/text to black.
        if (!self.config.showBorder) {
            item.style.borderColor = "black";
        }
		// Adds the Font-Awesome symbol if specified.
        if (data.symbol) {
            var symbol = document.createElement("span");
            symbol.className = "modulebar-picture fa fa-" + data.symbol;
			// Sets the size on the symbol if specified.
            if (data.size) {
                symbol.className += " fa-" + data.size;
                symbol.className += data.size == 1 ? "g" : "x";
            }
			// Align the symbol with a margin.
            if (data.text && placement === "left") {
                symbol.style.marginRight = "4px";
            }
			// Adds the symbol to the item.
            item.appendChild(symbol);

		// Adds a picture if specified.
		} else if (data.img) {
            var image = document.createElement("img");
            image.className = "modulebar-picture";
            image.src = data.img;
			// Sets the size of the picture if specified.
            if (data.width)  image.width  = data.width;
            if (data.height) image.height = data.height;
			// Align the picture with a margin.
            if (data.text && placement === "left") {
                image.style.marginRight = "4px";
            }
			// Adds the picture to the item.
            item.appendChild(image);
        }
		// Adds the text if specified.
        if (data.text) {
            var text = document.createElement("span");
            text.className = "modulebar-text";
            text.innerHTML = data.text;
			// Align the text with a margin.
            if ((data.symbol || data.img) && placement === "right") {
                text.style.marginRight = "4px";
            }
			// Adds the text to the item.
            item.appendChild(text);
        }
		// All done. :)
        return item;
	},
	
	notificationReceived: function(notification, payload){
		Log.info(this.name + " - received norification : " + notification);

		if(notification === 'Modules All Change'){
			this.hide();
		}
	}
});	

CategoryChoicehairMenu/CategoryChoicehairMenu.js
//메뉴 조작
Module.register("CategoryChoicehairMenu",{
	
	requiresVersion: "2.1.0",
	
    defaults: {
        // Allow the module to force modules to be shown (if hidden and locked by another module ex. profile-switcher).
        allowForce: true,
        // Determines if the border around the buttons should be shown.
        showBorder: false,
        // The minimum width for all the buttons.
        minWidth: "0px",
        // The minimum height for all the buttons.
        minHeight: "0px",
        // The location of the symbol relative to the text. Options: left, right, top or bottom
        picturePlacement: "top",
        // The direction of the bar. Options: row, column, row-reverse or column-reverse
        direction: "row",
		// The speed of the hide and show animation.
		animationSpeed: 300,
	
        // The default button 1. Add your buttons in the config.
		buttons: {
			
			"1": {
				module: "CategoryHairstyle",
				img:"https://image.flaticon.com/icons/svg/137/137531.svg",
				width:"50",
				height:"50",
				text:   "뒤로가기",
			},

			"2": {
				module: "CategoryWomanhair",
				text:   "메인화면",
				img:"https://image.flaticon.com/icons/svg/609/609803.svg",
				width:"50",
				height:"50",
			}
		}
	},
	start(){
		CategoryChoicehairMenu = this;	
	},
	

    // Define required styles.
	getStyles: function(){
		return ["font-awesome.css", "MMM-Modulebar.css"];
	},

	notificationReceived: function(notification, payload){
		Log.info(this.name + " - received norification : " + notification);
		
		if (notification === 'Modulebar1 is Clicked') {
			module1 = 'Modulebar1 is Clicked';
			Log.info(module1 + " adadadadad : " + notification);
		}
		else if (notification === 'Modulebar2 is Clicked') {
			module1 = 'Modulebar2 is Clicked';
			Log.info(module1 + " adadadadad : " + notification);
		}
		else if (notification === 'Modulebar0 is Clicked'){
			module1 = 'Modulebar0 is Clicked';
			Log.info(module1 + " adadadadad : " + notification);
		}
	},

    // Override dom generator.
    getDom: function() {
        var menu = document.createElement("span");
        menu.className = "modulebar-menu";
        menu.id = this.identifier + "_menu";
        menu.style.flexDirection = this.config.direction;
		// Sends each button to the "createButton" function be created.
		for (var num in this.config.buttons) {
			menu.appendChild(this.createButton(this, num, this.config.buttons[num], this.config.picturePlacement));
		}
		
        return menu;
    },

	// Creates the buttons.
    createButton: function (self, num, data, placement) {
		// Creates the span elemet to contain all the buttons.
		var item = document.createElement("span");
        // Builds a uniqe indentity / button.
		item.id = self.identifier + "_button_" + num;
        // Sets a class to all buttons.
		item.className = "modulebar-button";
        // Makes sure the width and height is at least the defined minimum.
		item.style.minWidth = self.config.minWidth;
        item.style.minHeight = self.config.minHeight;
		// Collects all modules loaded in MagicMirror.
		var modules = MM.getModules();
		

		// When a button is clicked, the module either gets hidden or shown depending on current module status.
		item.addEventListener("click", function () {
			// Lists through all modules for testing.
			for (var i = 1; i < modules.length; i++) {
				// Check if the curent module is the one.
				if (modules[i].name === data.module) {
					// Splits out the module number of the module with the same name.
					var idnr = modules[i].data.identifier.split("_");
					// Checks if idnum is set in config.js. If it is, it only hides that module, if not hides all modules with the same name.
					if (idnr[1] == data.idnum || data.idnum == null) {
						// Check if the module is hidden.
						if (!modules[i].hidden) {
							// Hides the module.
							modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
							// Prints in the console what just happend (adding the ID). 
							console.log("Hiding "+modules[i].name+" ID: "+idnr[1]);
							// Check if there is a "hideURL" defined.
							if (data.hideUrl != null) {
								// Visiting the the URL.
								fetch(data.hideUrl);
								// Prints the visited hideURL.
								console.log("Visiting hide URL: "+data.hideUrl);
							}
							for (var k = 1; k < 18; k++){
								console.log("Hiding opend "+ modules[k].name+" ID: "+idnr[1]);
								modules[k].hide(self.config.animationSpeed, {force: self.config.allowForce});	
							}
						}
						else {
							// Check if there is a "showURL" defined.
							if (data.showUrl != null) {
								// Visiting the show URL.
								fetch(data.showUrl);
								// Prints the visited hideURL.
								console.log("Visiting show URL: "+data.showUrl);
							}
							if (modules[i].name === 'CategoryHairstyle') {
								for (var k = 1; k < 18; k++){
									console.log("Hiding opend "+ modules[k].name+" ID: "+idnr[1]);
									modules[k].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								}

								if (module1 === 'Modulebar0 is Clicked') {
								console.log("Showing0 "+modules[1].name+" ID: "+idnr[1]);
								module1 = 'Modulebar0 is Clicked';	
									setTimeout(function(){
										modules[1].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
								}

								else if (module1 === 'Modulebar1 is Clicked') { 
								console.log("Showing1 "+modules[2].name+" ID: "+idnr[1]);	
								module1 = 'Modulebar0 is Clicked';
									setTimeout(function(){
										modules[2].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
								}
								
								else if (module1 === 'Modulebar2 is Clicked'){
								console.log("Showing2 "+modules[3].name+" ID: "+idnr[1]);	
								module1 = 'Modulebar0 is Clicked';
									setTimeout(function(){
										modules[3].show(self.config.animationSpeed, {force: self.config.allowForce});
									},500);
								}					
							}
							else {
								console.log("Hiding opend "+ modules[3].name+" ID: "+idnr[1]);			
								modules[3].hide(self.config.animationSpeed, {force: self.config.allowForce});
								for (var k = 1; k < 18; k++){
									console.log("Hiding opend "+ modules[k].name+" ID: "+idnr[1]);
									modules[k].hide(self.config.animationSpeed, {force: self.config.allowForce});	
								}
								console.log("Showing "+modules[i].name+" ID: "+idnr[1]);	
								setTimeout(function(){
								modules[1].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);								
							}
						}					
					}
				}
			}
		});
		// Fixes the aligning.
        item.style.flexDirection = {
            "right"  : "row-reverse",
            "left"   : "row",
            "top"    : "column",
            "bottom" : "column-reverse"
        }[placement];
		// Sets the border around the symbol/picture/text to black.
        if (!self.config.showBorder) {
            item.style.borderColor = "black";
        }
		// Adds the Font-Awesome symbol if specified.
        if (data.symbol) {
            var symbol = document.createElement("span");
            symbol.className = "modulebar-picture fa fa-" + data.symbol;
			// Sets the size on the symbol if specified.
            if (data.size) {
                symbol.className += " fa-" + data.size;
                symbol.className += data.size == 1 ? "g" : "x";
            }
			// Align the symbol with a margin.
            if (data.text && placement === "left") {
                symbol.style.marginRight = "4px";
            }
			// Adds the symbol to the item.
            item.appendChild(symbol);

		// Adds a picture if specified.
		} else if (data.img) {
            var image = document.createElement("img");
            image.className = "modulebar-picture";
            image.src = data.img;
			// Sets the size of the picture if specified.
            if (data.width)  image.width  = data.width;
            if (data.height) image.height = data.height;
			// Align the picture with a margin.
            if (data.text && placement === "left") {
                image.style.marginRight = "4px";
            }
			// Adds the picture to the item.
            item.appendChild(image);
        }
		// Adds the text if specified.
        if (data.text) {
            var text = document.createElement("span");
            text.className = "modulebar-text";
            text.innerHTML = data.text;
			// Align the text with a margin.
            if ((data.symbol || data.img) && placement === "right") {
                text.style.marginRight = "4px";
            }
			// Adds the text to the item.
            item.appendChild(text);
        }
		// All done. :)
        return item;
    }
});	

////////////////////////////// 나이추측 인공지능 헤어추천 /////////////////////////////
// 버튼 클릭 
MMM-Testpython/MMM-Testpython.js
var Testpythons;
Module.register("MMM-Testpython", {

    defaults: {},
    start: function (){
        Testpythons = this;
    },

  getDom: function() {
    var element = document.createElement("div")
    element.className = "myContent"
    element.id="divid1"
    element.font = 4
    var subElement = document.createElement("p")
    subElement.innerHTML = "여기를 클릭하세요."
    subElement.id = "clickid1"
    subElement.className = "click"
    subElement.style.fontSize = "2em"
    element.appendChild(subElement)
    var subelement2 = document.createElement("p")
    subelement2.innerHTML = "이 곳에 예상 나이가 표시됩니다."
    subelement2.id = "showage"
    subelement2.className = "showage"
    subelement2.style.fontSize = "2em"
    element.appendChild(subelement2)
    return element
  },
  

  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
      var elem = document.getElementById("clickid1")
      elem.addEventListener("click", () => {
        Testpythons.sendSocketNotification("TEST")
        var showage2 = document.getElementById("showage")
        showage2.innerHTML = "당신의 나이를 분석중입니다."
        Testpythons.sendNotification('CHANGE_POSITIONS', 
        modules = {
              'Man10s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man20s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man30s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man40s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Man50s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman10s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman20s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman30s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman40s':{
                visible: 'false',
                position: 'bottom_left',
              },
              'Woman50s':{
                visible: 'false',
                position: 'bottom_left',
              },
            });
        console.log("hello~hello~hello~hello~hello~hello~hello~hello~hello~hello~")
      }) 
      break;
      case "Modules All Change" :
      var ele2 = document.getElementById("showage")
      ele2.innerHTML =  "이 곳에 예상 나이가 표시됩니다."
      }
  },
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "I_DID":
        console.log("Socket recevied 1: " + payload);
        var payload3;
        payload3=payload.toString().split(",");
        console.log("Socket recevied 1: " + payload3);
        var elemk = document.getElementById("clickid1")
        var elemk2 = document.getElementById("showage");
        var gender = payload3[0];
        console.log("Socket recevied 1: " + gender);
        var age = payload3[1];
        console.log("Socket recevied 1: " + age);
        var change;
        if (gender == "male"){
          if(age <= 19){
            change = 1;
            console.log(age);
            console.log(change);
          }
          else if(19 < age && age < 30){
            change = 2;
            console.log(age);
            console.log(change);
          }
          else if(29 < age && age < 40){
            change = 3; 
            console.log(age);
            console.log(change);
          }
          else if(39 < age && age < 50){
            change = 4;  
            console.log(age);
            console.log(change);
          }
          else if(49 < age){
            change = 5;
            console.log(age);
            console.log(change);
          }
        }
        else if (gender == "female"){
          if(age <= 19){
            change = 6;
            console.log(age);
            console.log(change);
          }
          else if(19 < age && age < 30){
            change = 7;
            console.log(age);
            console.log(change);
          }
          else if(29 < age && age < 40){
            change = 8; 
            console.log(age);
            console.log(change);
          }
          else if(39 < age && age < 50){
            change = 9;  
            console.log(age);
            console.log(change);
          }
          else if(49 < age){
            change = 10;
            console.log(age);
            console.log(change);
          }
        }
          switch(change){
            case 1 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man10s':{
                  visible: 'true',
                  position: 'bottom_left',
                }
              })
              break
            case 2 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man20s':{
                  visible: 'true',
                  position: 'bottom_left',
              }
            })
            break
            case 3 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man30s':{
                  visible: 'true',
                  position: 'bottom_left',
              }
            })
            break
            case 4 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man40s':{
                  visible: 'true',
                  position: 'top_right',
              }
            })
            break
            case 5 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Man50s':{
                  visible: 'true',
                  position: 'bottom_left',
              }
            })
            break
            case 6 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman10s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 7 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman20s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 8 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman30s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 9 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman40s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
            case 10 : 
              this.sendNotification('CHANGE_POSITIONS', 
              modules = {
                'Woman50s':{
                  visible: 'true',
                  position: 'bottom_left',
              } 
            })
            break
          } 
        elemk.innerHTML = "";
        elemk2.innerHTML = "고객님의 예상나이" + age + "세의 추천헤어입니다.";   
      break
    }
  }
})
//AzureAPI python code
//MMM-Testpython/FCF.py
/*
import requests
import matplotlib.pyplot as plt
from PIL import Image
from matplotlib import patches
from io import BytesIO
import os
import cv2
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cv2.imwrite('C:/BeautyM/modules/MMM-Testpython/CognitiveFace/CognitiveFace.jpg', frame)
cap.release()
cv2.destroyAllWindows()
subscription_key = "2ad26e5076914e9ca6ab0e80877d3e4a"
image_path = os.path.join('C:/BeautyM/modules/MMM-Testpython/CognitiveFace/CognitiveFace.jpg')
assert subscription_key
face_api_url = 'https://koreacentral.api.cognitive.microsoft.com/face/v1.0/detect'
image_data = open(image_path, "rb")
headers = {'Content-Type': 'application/octet-stream',
           'Ocp-Apim-Subscription-Key': subscription_key}
params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
    'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
}
response = requests.post(face_api_url, params=params, headers=headers, data=image_data)
response.raise_for_status()
faces = response.json()
image_read = open(image_path, "rb").read()
image = Image.open(BytesIO(image_read))
plt.figure(figsize=(8, 8))
ax = plt.imshow(image, alpha=1)
for face in faces:
    fr = face["faceRectangle"]
    fa = face["faceAttributes"]
    origin = (fr["left"], fr["top"])
    p = patches.Rectangle(
        origin, fr["width"], fr["height"], fill=False, linewidth=2, color='dodgerblue')
    ax.axes.add_patch(p)
    plt.text(origin[0], origin[1], "%s, %d"%(fa["gender"].capitalize(), fa["age"]),
             fontsize=20, weight="bold", va="bottom", color='dodgerblue')
_ = plt.axis("off")
plt.show()
print(fa["gender"])
print(fa["age"])
*/

//MMM-Testpython/node_helper.js
//python과 인터페이스(MMM-Testpython)연결
var NodeHelper = require("node_helper");
var {PythonShell} = require('python-shell');
var socketTestpython;
module.exports = NodeHelper.create({
  start: function() {
    socketTestpython=this;
    console.log(this.name+"node_helper started")
  },
  
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "TEST":
        console.log("notification : " + notification)
	    PythonShell.run('C:/BeautyM/modules/MMM-Testpython/FCF.py', null, function (err, result) {
            if (err) throw err;
            console.log("gender : " + result);          
            socketTestpython.sendSocketNotification("I_DID",result);
          });
	       
        break
    }
  }
}) 

////////////////////////////////전후사진찍기////////////////////////
//메뉴선택인터페이스, 
//MMM-BeforeAfter/MMM-BeforeAfter.js
var BeforeAfterMoudule;
Module.register("MMM-BeforeAfter", {

    defaults: {},
    start: function (){
        BeforeAfterMoudule = this;
    },
  
  getDom: function() {
    var BAelement = document.createElement("div")
    BAelement.className = "BeforeAftercontent"
    BAelement.id="BeforeAfterdiv"
    BAelement.innerHTML = "전 후 사진 비교입니다 !"
    var BAsubElement = document.createElement("p")
    BAsubElement.innerHTML = "전 사진 찍기" 
    BAsubElement.id = "BeforeAfterClickid"
    BAelement.appendChild(BAsubElement)
    var BAsubElement2 = document.createElement("p")
    BAsubElement2.innerHTML = "후 사진 찍기" 
    BAsubElement2.id = "BeforeAfterClickid2"
    BAelement.appendChild(BAsubElement2)

    return BAelement
  },
  
  notificationReceived: function(notification, payload, sender) {
    switch(notification) {
      case "BEFOREIMAGECLICK" :
        var baelem = document.getElementById("BeforeAfterClickid")     
          BeforeAfterMoudule.sendSocketNotification("BEFORECAPTURE")
          baelem.innerHTML = "카메라 로딩 중"       
        break;
      case "AFTERIMAGECLICK" :
      var baelem2 = document.getElementById("BeforeAfterClickid2")
        BeforeAfterMoudule.sendSocketNotification("AFTERCAPTURE")
        //BeforeAfterMoudule.sendNotification("LOADINGAFTER")
        baelem2.innerHTML = "카메라 로딩 중"       
        break;
    }
  },
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "BEFORECAPTURESUCCESS":
        console.log("Socket recevied payload1: "+payload)
        var baelem = document.getElementById("BeforeAfterClickid")
        BeforeAfterMoudule.sendNotification("BEFOREIMAGE")
        //
        BeforeAfterMoudule.sendNotification('SHOWCHANGEDIMAGE');
        //
        baelem.innerHTML = "자르기 전 사진찍기 완료!"
        break
      case "AFTERCAPTURESUCCESS":
        console.log("Socket recevied payload1: "+payload)
        var baelem2 = document.getElementById("BeforeAfterClickid2")
        BeforeAfterMoudule.sendNotification("AFTERIMAGE")
        //
        BeforeAfterMoudule.sendNotification('SHOWCHANGEDIMAGE');
        //
        BeforeAfterMoudule.sendNotification("CUTDAY",payload)

        baelem2.innerHTML = "자르기 후 사진찍기 완료!"
      break
    }
  }

})
//MMM-BeforeAfter/before.py
//컷팅 전 사진 캡쳐
/*
import cv2
cap = cv2.VideoCapture(0)
cap.set(3,640)
cap.set(4,480)
ret, frame = cap.read()
cv2.imshow('frame', frame)
cv2.imwrite('C:/BeautyM/modules/MMM-BeforeAfter/before/before.png', frame)
cap.release()
cv2.destroyAllWindows()
print("python success !")
*/

//MMM-BeforeAfter/before2.py
//컷팅 후 캡쳐
/*
# -*- coding: utf-8 -*-
import datetime
import cv2
cap = cv2.VideoCapture(0)
cap.set(3,640)
cap.set(4,480)
ret, frame = cap.read()
#now = datetime.datetime.now().strftime("%d_%H-%M-%S")
now = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
cv2.imshow('frame', frame)
cv2.imwrite('C:/BeautyM/modules/MMM-BeforeAfter/before/before2.png', frame)
cv2.imwrite("C:/BeautyM/modules/MMM-BeforeAfter/minsoo/" + str(now) + ".png", frame)
cap.release()
cv2.destroyAllWindows()
print(now)
*/

//

//MMM-BeforeAfter/node_helper.js
// before.py,before2.py와 js 연결코드
var NodeHelper = require("node_helper");
var {PythonShell} = require('python-shell');
var socketTestpython;
module.exports = NodeHelper.create({
  start: function() {
    socketTestpython=this;
    console.log(this.name+"node_helper started")
  },
  
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "BEFORECAPTURE":
        console.log("notification : " + notification)
	      PythonShell.run('C:/BeautyM/modules/MMM-BeforeAfter/before.py', null, function (err, result) {
            if (err) throw err;
            console.log(result);          
            socketTestpython.sendSocketNotification("BEFORECAPTURESUCCESS",result);
          });
	       
        break
      case "AFTERCAPTURE":
        console.log("notification : " + notification)
        PythonShell.run('C:/BeautyM/modules/MMM-BeforeAfter/before2.py', null, function (err, result) {
          if (err) throw err;
          console.log(result);          
          socketTestpython.sendSocketNotification("AFTERCAPTURESUCCESS",result);
        });
        
      break
    }
  }
}) 

//MMM-BeforeImage/MMM-BeforeImage.js
//컷팅 전 사진을 띄어줌
var BeforeImages;
Module.register("MMM-BeforeImage", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 50,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,

		a:0,

	},

    // load function

	start: function () {
		BeforeImages = this;
        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file
					image.addEventListener("click", () => {
						console.log(" image click !!!!!");
						this.config.a=3;
						BeforeImages.sendNotification("BEFOREIMAGECLICK");
                                              });
					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/					
					
					if(this.config.a==0){
					image.src = this.imageList[0];
					
					}
					if(this.config.a==1){
						image.src = this.imageList[this.imageList.length-1];
						}
					if(this.config.a==2){
						image.src = this.imageList[this.imageList.length-2];
						}
					if(this.config.a==3){
						image.src = this.imageList[2];
						}
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
					
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		if(notification === "BEFOREIMAGE"){
			//console.log("this a ", this.config.a)
			this.config.a=1;
		}
		if(notification === "setDefault"){
			//console.log("this a ", this.config.a)
			this.config.a=0;
		}
		if(notification === "AFTERIMAGE"){
			//console.log("this a ", this.config.a)
			this.config.a=2;
		}
		if(notification === "LOADINGBEFORE"){
			//console.log("this a ", this.config.a)
			this.config.a=3;
		}
/*
		if(notification === "LOADINGAFTER"){
			console.log("this a ", this.config.a)
			this.config.a=3;
		}
*/
	}

});

//MMM-AfterImage/MMM-AfterImage.js
//컷팅 후 사진을 보여줌

Module.register("MMM-AfterImage", {
	// Default module config.
	defaults: {
        // an array of strings, each is a path to a directory with images
        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],
        // the speed at which to switch between images, in milliseconds
		slideshowSpeed: 10 * 50,
        // if zero do nothing, otherwise set width to a pixel value
        fixedImageWidth: 0,
        // if zero do nothing, otherwise set height to a pixel value        
        fixedImageHeight: 0,
        // if true randomize image order, otherwise do alphabetical
        randomizeImageOrder: false,
        // if true combine all images in all the paths
        // if false each path with be viewed seperately in the order listed
        treatAllPathsAsOne: false,
	// if true reload the image list after each iteration
	reloadImageList: true,
        // if true, all images will be made grayscale, otherwise as they are
        makeImagesGrayscale: false,
        // list of valid file extensions, seperated by commas
        validImageFileExtensions: 'bmp,jpg,gif,png',
		// a delay timer after all images have been shown, to wait to restart (in ms)
		delayUntilRestart: 0,
		a: 0,
	},
    // load function
	start: function () {
        // add identifier to the config
        this.config.identifier = this.identifier;
        // ensure file extensions are lower case
        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();
        // set no error
		this.errorMessage = null;
        if (this.config.imagePaths.length == 0) {
			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."
        }
        else {
            // create an empty image list
            this.imageList = [];
            // set beginning image index to -1, as it will auto increment on start
            this.imageIndex = -1;
            // ask helper function to get the image list
            console.log("MMM-ImageSlideshow sending socket notification");
            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);
			// do one update time to clear the html
			this.updateDom();
			// set a blank timer
			this.interval = null;
			this.loaded = false;
        }
	},
	// Define required scripts.
	getStyles: function() {
        // the css contains the make grayscale code
		return ["imageslideshow.css"];
	},    
	// the socket handler
	socketNotificationReceived: function(notification, payload) {
                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);
		// if an update was received
		if (notification === "IMAGESLIDESHOW_FILELIST") {
			// check this is for this module based on the woeid
			if (payload.identifier === this.identifier)
			{
				// extract new list
				var newImageList = payload.imageList;
				//console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@imageList : ",newImageList.length,this.imageList.length)
				// check if anything has changed. return if not.
				if (newImageList.length == this.imageList.length) {
					var unchanged = true;
					for (var i = 0 ; i < newImageList.length; i++) {
						unchanged = this.imageList[i] == newImageList[i];
						if (!unchanged)
							break;
					}
					if (unchanged)
						return;
				}
				// set the image list
				this.imageList = payload.imageList;
                // if image list actually contains images
                // set loaded flag to true and update dom
                if (this.imageList.length > 0 && !this.loaded) {
                    this.loaded = true;
                    this.updateDom();
					// set the timer schedule to the slideshow speed			
					var self = this;
					this.interval = setInterval(function() {
						self.updateDom();
						}, this.config.slideshowSpeed);					
                }
			}
		}
    },    
	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
        // if an error, say so (currently no errors can occur)
        if (this.errorMessage != null) {
            wrapper.innerHTML = this.errorMessage;
        }
        // if no errors
        else {
            // if the image list has been loaded
            if (this.loaded === true) {
				// if was delayed until restart, reset index reset timer
				if (this.imageIndex == -2) {
					this.imageIndex = -1;
					clearInterval(this.interval);
					var self = this;
					this.interval = setInterval(function() {
						self.updateDom(0);
						}, this.config.slideshowSpeed);						
				}				
                // iterate the image list index
                this.imageIndex += 1;
				// set flag to show stuff
				var showSomething = true;
                // if exceeded the size of the list, go back to zero
                if (this.imageIndex == this.imageList.length) {
                                       // console.log("MMM-ImageSlideshow sending reload request");
				       // reload image list at end of iteration, if config option set
                                       if (this.config.reloadImageList) 
                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);

					// if delay after last image, set to wait
					if (this.config.delayUntilRestart > 0) {
						this.imageIndex = -2;
						wrapper.innerHTML = "&nbsp;";
						showSomething = false;
						clearInterval(this.interval);
						var self = this;
						this.interval = setInterval(function() {
							self.updateDom(0);
							}, this.config.delayUntilRestart);									
					}
					// if not reset index
					else
						this.imageIndex = 0;
				}
				if (showSomething) {
					// create the image dom bit
					var image = document.createElement("img");
					// if set to make grayscale, flag the class set in the .css file
					
					image.addEventListener("click", () => {
						console.log(" after image click !!!!!");
						this.config.a=3;
						BeforeImages.sendNotification("AFTERIMAGECLICK");
                                              });
					if (this.config.makeImagesGrayscale)
						image.className = "desaturate";
					// create an empty string
					var styleString = '';
					// if width or height or non-zero, add them to the style string
					if (this.config.fixedImageWidth != 0)
						styleString += 'width:' + this.config.fixedImageWidth + 'px;';
					if (this.config.fixedImageHeight != 0)
						styleString += 'height:' + this.config.fixedImageHeight + 'px;';
					// if style string has antyhing, set it
					if (styleString != '')
						image.style = styleString;
					// set the image location
					//console.log("this.imageList.length]",this.imageList.length)
					//console.log("this a",this.config.a)
					if(this.config.a==0){
					this.hide();
					}
					if(this.config.a==1){
						image.src = this.imageList[1];
						}
					if(this.config.a==2){
						image.src = this.imageList[this.imageList.length-1];
						}
					if(this.config.a==3){
						image.src = this.imageList[2];
						}
					// ad the image to the dom
					wrapper.appendChild(image);					
				}
            }
            else {
                // if no data loaded yet, empty html
                wrapper.innerHTML = "&nbsp;";
            }
        }
        // return the dom
		return wrapper;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		if(notification === "Modules All Change"){
			//console.log("this a ", this.config.a)
			//this.hide()

		}
		if(notification === "setDefault"){
			//console.log("this a ", this.config.a)
			this.hide();
			this.config.a=0;
			
		}
		if(notification === "BEFOREIMAGE"){
			//console.log("this a ", this.config.a)
			this.show()
			this.config.a=1;

		}
		if(notification === "AFTERIMAGE"){
			//console.log("this a ", this.config.a)
			this.config.a=2;

		}
		if(notification === "LOADINGAFTER"){
			//console.log("this a ", this.config.a)
			this.config.a=3;

		}
	}
});




///////////////////////////////////컷팅히스토리////////////////////////
//MMM-HistoryImage1/MMM-HistoryImage1.js
//컷팅히스토리파일에 저장되있는 첫번째 사진을 보여줌(MMM-BeforeAfter/minsoo 파일에 있는 사진)
Module.register("MMM-HistoryImage1", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 500,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,
		d:0,
		a:0,
		payload3:0,
		c:0,

	},

    // load function

	start: function () {

        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file

					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/					
					image.src = this.imageList[this.imageList.length-1];
					//image.src.lastIndexOf("/");
					this.config.c=image.src.toString().match(/.*\/(.+?)\./);
					this.config.d=this.config.c[1];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
        			this.config.payload3=this.config.d.split("-");
					console.log("filenameeeeeeeeeeeeeeeeeeeeeeedd",this.config.payload3[0],"file name end");
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	
	getHeader: function() {
		if(this.config.c[1]==1)
		{
			return "컷트를 한 기록이 없습니다!";
			
		}
		else
		{
			return this.config.payload3[0]+"년"+this.config.payload3[1]+"월"+this.config.payload3[2]+"일"+this.config.payload3[3]+"시"+this.config.payload3[4]+"분"+this.config.payload3[5]+"초"+"에 하신 컷트 사진입니다.";
		}
		//return '2019-05-'+this.data.header;
	},
	
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		/*
		if(notification === "CUTDAY"){
			console.log("cut day notification success!", payload)
			this.data.header=payload;
			this.updateDom();
			
		}
		*/
		
	}

});

//MMM-HistoryImage2/MMM-HistoryImage2.js
//컷팅히스토리파일에 저장되있는 두번째 사진을 보여줌(MMM-BeforeAfter/minsoo 파일에 있는 사진)
Module.register("MMM-HistoryImage2", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 500,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,

		a:0,
		d:0,
		payload3:0,
		c:0,
	},

    // load function

	start: function () {

        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file

					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/
					if(this.config.a==0){
						image.src = this.imageList[this.imageList.length-2];
						
						}		
					if(this.config.a==1){
						image.src = this.imageList[0];
						}		
					this.config.c=image.src.toString().match(/.*\/(.+?)\./);
					this.config.d=this.config.c[1];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
        			this.config.payload3=this.config.d.split("-");
				
					console.log("filenameeeeeeeeeeeeeeeeeeeeeee",this.config.c[1],"file name end");
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
					
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	getHeader: function() {
		if(this.config.c[1]==127)
		{
			return " ";
			
		}
		else if(this.config.c[1]=1)
		{
			return "더이상 컷트기록이 없습니다!";
		}
		else{
			return this.config.payload3[0]+"년"+this.config.payload3[1]+"월"+this.config.payload3[2]+"일"+this.config.payload3[3]+"시"+this.config.payload3[4]+"분"+this.config.payload3[5]+"초"+"에 하신 컷트 사진입니다.";
		}
		//return '2019-05-'+this.data.header;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		/*
		if(notification === "setDefault"){
			console.log("Delete notification success!", payload)
			this.config.a=1;
			this.updateDom();
			
		}
		*/
		
	}

});

//MMM-HistoryImage3/MMM-HistoryImage3.js
//컷팅히스토리파일에 저장되있는 두번째 사진을 보여줌(MMM-BeforeAfter/minsoo 파일에 있는 사진)
Module.register("MMM-HistoryImage3", {

	// Default module config.

	defaults: {

        // an array of strings, each is a path to a directory with images

        imagePaths: [ 'modules/MMM-ImageSlideshow/exampleImages' ],

        // the speed at which to switch between images, in milliseconds

		slideshowSpeed: 10 * 500,

        // if zero do nothing, otherwise set width to a pixel value

        fixedImageWidth: 0,

        // if zero do nothing, otherwise set height to a pixel value        

        fixedImageHeight: 0,

        // if true randomize image order, otherwise do alphabetical

        randomizeImageOrder: false,

        // if true combine all images in all the paths

        // if false each path with be viewed seperately in the order listed

        treatAllPathsAsOne: false,

	// if true reload the image list after each iteration

	reloadImageList: true,

        // if true, all images will be made grayscale, otherwise as they are

        makeImagesGrayscale: false,

        // list of valid file extensions, seperated by commas

        validImageFileExtensions: 'bmp,jpg,gif,png',

		// a delay timer after all images have been shown, to wait to restart (in ms)

		delayUntilRestart: 0,
		d:0,
		payload3:0,
		a:0,
		c:0,
	},

    // load function

	start: function () {

        // add identifier to the config

        this.config.identifier = this.identifier;

        // ensure file extensions are lower case

        this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();

        // set no error

		this.errorMessage = null;

        if (this.config.imagePaths.length == 0) {

			this.errorMessage = "MMM-ImageSlideshow: Missing required parameter."

        }

        else {

            // create an empty image list

            this.imageList = [];

            // set beginning image index to -1, as it will auto increment on start

            this.imageIndex = -1;

            // ask helper function to get the image list

            console.log("MMM-ImageSlideshow sending socket notification");

            this.sendSocketNotification('IMAGESLIDESHOW_REGISTER_CONFIG', this.config);

			// do one update time to clear the html

			this.updateDom();

			// set a blank timer

			this.interval = null;

			this.loaded = false;

        }

	},

	// Define required scripts.

	getStyles: function() {

        // the css contains the make grayscale code

		return ["imageslideshow.css"];

	},    

	// the socket handler

	socketNotificationReceived: function(notification, payload) {

                console.log("MMM-ImageSlideshow recieved a socket notification: " + notification);

		// if an update was received

		if (notification === "IMAGESLIDESHOW_FILELIST") {

			// check this is for this module based on the woeid

			if (payload.identifier === this.identifier)

			{

				// extract new list

				var newImageList = payload.imageList;

				

				// check if anything has changed. return if not.

				if (newImageList.length == this.imageList.length) {

					var unchanged = true;

					for (var i = 0 ; i < newImageList.length; i++) {

						unchanged = this.imageList[i] == newImageList[i];

						if (!unchanged)

							break;

					}

					if (unchanged)

						return;

				}

				// set the image list

				this.imageList = payload.imageList;

                // if image list actually contains images

                // set loaded flag to true and update dom

                if (this.imageList.length > 0 && !this.loaded) {

                    this.loaded = true;

                    this.updateDom();

					// set the timer schedule to the slideshow speed			

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom();

						}, this.config.slideshowSpeed);					

                }

			}

		}

    },    

	// Override dom generator.

	getDom: function () {

		var wrapper = document.createElement("div");

        // if an error, say so (currently no errors can occur)

        if (this.errorMessage != null) {

            wrapper.innerHTML = this.errorMessage;

        }

        // if no errors

        else {

            // if the image list has been loaded

            if (this.loaded === true) {

				// if was delayed until restart, reset index reset timer

				if (this.imageIndex == -2) {

					this.imageIndex = -1;

					clearInterval(this.interval);

					var self = this;

					this.interval = setInterval(function() {

						self.updateDom(0);

						}, this.config.slideshowSpeed);						

				}				

                // iterate the image list index

                this.imageIndex += 1;

				// set flag to show stuff

				var showSomething = true;

                // if exceeded the size of the list, go back to zero

                if (this.imageIndex == this.imageList.length) {

                                       // console.log("MMM-ImageSlideshow sending reload request");

				       // reload image list at end of iteration, if config option set

                                       if (this.config.reloadImageList) 

                                           this.sendSocketNotification('IMAGESLIDESHOW_RELOAD_FILELIST', this.config);



					// if delay after last image, set to wait

					if (this.config.delayUntilRestart > 0) {

						this.imageIndex = -2;

						wrapper.innerHTML = "&nbsp;";

						showSomething = false;

						clearInterval(this.interval);

						var self = this;

						this.interval = setInterval(function() {

							self.updateDom(0);

							}, this.config.delayUntilRestart);									

					}

					// if not reset index

					else

						this.imageIndex = 0;

				}

				if (showSomething) {

					// create the image dom bit

					var image = document.createElement("img");
					image.id="imgid";
					// if set to make grayscale, flag the class set in the .css file

					
					
					if (this.config.makeImagesGrayscale)

						image.className = "desaturate";

					// create an empty string

					var styleString = '';

					// if width or height or non-zero, add them to the style string

					if (this.config.fixedImageWidth != 0)

						styleString += 'width:' + this.config.fixedImageWidth + 'px;';

					if (this.config.fixedImageHeight != 0)

						styleString += 'height:' + this.config.fixedImageHeight + 'px;';

					// if style string has antyhing, set it

					if (styleString != '')

						image.style = styleString;

					// set the image location
					/*
					image.addEventListener("click", () => {
					  
					  console.log(" click success !");
					  this.config.a==1;
							
					}) 
					*/					
					image.src = this.imageList[this.imageList.length-3];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
					this.config.c=image.src.toString().match(/.*\/(.+?)\./);
					this.config.d=this.config.c[1];
					
					// ad the image to the dom
					//var elem = document.getElementById("imageclick")
					
        			this.config.payload3=this.config.d.split("-");
					console.log("filenameeeeeeeeeeeeeeeeeeeeeee",this.config.c[1],"file name end");
					
					wrapper.appendChild(image);					

				}

            }

            else {

                // if no data loaded yet, empty html

                wrapper.innerHTML = "&nbsp;";

            }

        }
		
        // return the dom

		return wrapper;

	},
	getHeader: function() {
		if(this.config.c[1]==127)
		{
			return " ";
			
		}
		else if(this.config.c[1]=1)
		{
			return "더이상 컷트기록이 없습니다!";
		}
		else{
			return this.config.payload3[0]+"년"+this.config.payload3[1]+"월"+this.config.payload3[2]+"일"+this.config.payload3[3]+"시"+this.config.payload3[4]+"분"+this.config.payload3[5]+"초"+"에 하신 컷트 사진입니다.";
		}
		//return '2019-05-'+this.data.header;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		
	}

});

//MMM-DeleteImage/MMM-DeleteImage.js
//사진을 지우기의 인터페이스
/* global Module */

/* Magic Mirror
 * Module: MM Hide All
 *
 * By EoF https://forum.magicmirror.builders/user/eof
 * MIT Licensed.
 */
var DeleteImageS;
Module.register("MMM-DeleteImage",{
	defaults: {},
    start: function (){
        DeleteImageS = this;
    },
	getScripts: function() {
		return ["modules/MMM-DeleteImage/js/jquery.js"];
	},

	getStyles: function() {
		return ["MMM-DeleteImage-style.css"];
	},
	
	getDom: function() {
		var wrapper = document.createElement("div");
		var button = document.createElement("div");
		var text = document.createElement("span");
		var overlay = document.createElement("div");
		var hidden = true;
		
		overlay.className = "paint-it-black";
		
		button.className = "hide-toggle";
		button.appendChild(text);
		text.innerHTML = "끝내기";
		
		wrapper.appendChild(button);
		wrapper.appendChild(overlay);
		
		$(button).on("click", function(){
			if(hidden){

				DeleteImageS.sendNotification("REMOTE_ACTION", {action: "MONITOROFF"});
				DeleteImageS.sendNotification("REMOTE_ACTION", {action: "REFRESH"});
				DeleteImageS.sendNotification("setDefault")
				DeleteImageS.sendSocketNotification("DELETE")
				$(text).html('접속');
				hidden = false;
			}else{
				$(overlay).fadeOut(1000);
				$(button).fadeTo(1000, 1);
				$(text).html('끝내기');
				hidden = true;
			}
		});
		
		return wrapper;
	}
});

//MMM-DeleteImage/Delete.py
//실제로 특정사진을 지우는 파이썬코드
/*
import os
def removeExtensionFile(filePath, fileExtension):
    if os.path.exists(filePath):
        for file in os.scandir(filePath):
            if file.name.endswith(fileExtension):
                os.remove(file.path)
        return 'Remove File:' + fileExtension
    else:
        return 'Directory Not Found'
print(removeExtensionFile('C:/BeautyM/modules/MMM-BeforeAfter/minsoo','.png'))
print(removeExtensionFile('C:/BeautyM/modules/MMM-BeforeAfter/before','.png'))
*/

//MMM-Testpython/node_helper.js
//파이썬코드와 js연결코드
var NodeHelper = require("node_helper");
var {PythonShell} = require('python-shell');
var socketDeleteImage;
module.exports = NodeHelper.create({
  start: function() {
    socketDeleteImage=this;
    console.log(this.name+"node_helper started")
  },
  
  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "DELETE":
        console.log("notification : " + notification)
	    PythonShell.run('C:/BeautyM/modules/MMM-DeleteImage/Delete.py', null, function (err, result) {
            if (err) throw err;
            console.log("Delete Success" + result);          
            //socketDeleteImage.sendSocketNotification("I_DID",result);
          });
	       
        break
    }
  }
}) 
- Entertainment 유튜브웹툰선택버튼 / 웹툰 / 유튜브 / 유튜브종류 선택모듈
CategoryChoiceYoutube/CategoryChoiceYoutube.js
//유튜브 주제별 목록
Module.register("CategoryChoiceYoutube",{
	
	requiresVersion: "2.1.0",
	
    defaults: {
        // Allow the module to force modules to be shown (if hidden and locked by another module ex. profile-switcher).
        allowForce: false,
        // Determines if the border around the buttons should be shown.
        showBorder: false,
        // The minimum width for all the buttons.
        minWidth: "0px",
        // The minimum height for all the buttons.
        minHeight: "0px",
        // The location of the symbol relative to the text. Options: left, right, top or bottom
        picturePlacement: "left",
        // The direction of the bar. Options: row, column, row-reverse or column-reverse
        direction: "column",
		// The speed of the hide and show animation.
		animationSpeed: 1000,
        // The default button 1. Add your buttons in the config.
        buttons: {
										"1": {
												module: "MMM-EmbedYoutube1",
												width:"50",
												height:"50",
												text:"게임",
												img:"http://2.bp.blogspot.com/-HqSOKIIV59A/U8WP4WFW28I/AAAAAAAAT5U/qTSiV9UgvUY/s1600/icon.png",
											},
										"2": {
												module: "MMM-EmbedYoutube1",
												img:"https://image.flaticon.com/icons/svg/1628/1628000.svg",
												width:"50",
												height:"50",
												text:"뮤직비디오",
											},
										"3": {
											module: "MMM-EmbedYoutube1",
											img:"https://image.flaticon.com/icons/svg/254/254072.svg",
											width:"50",
											height:"50",
											text:"영화",
										},
										"4": {
											module: "MMM-EmbedYoutube1",
											img:"https://image.flaticon.com/icons/svg/1040/1040232.svg",
											width:"50",
											height:"50",
											text:"뉴스",
										},
										"5": {
											module: "MMM-EmbedYoutube1",
											img:"https://image.flaticon.com/icons/svg/861/861512.svg",
											width:"50",
											height:"50",
											text:"스포츠",
										},
										"6": {
											module: "MMM-EmbedYoutube1",
											img:"https://image.flaticon.com/icons/svg/135/135644.svg",
											width:"50",
											height:"50",
											text:"먹방",
										},
										"7": {
											module: "MMM-EmbedYoutube1",
											img:"https://image.flaticon.com/icons/svg/1626/1626000.svg",
											width:"50",
											height:"50",
											text:"여행",
										},
										"8": {
											module: "MMM-EmbedYoutube1",
											img:"https://image.flaticon.com/icons/svg/356/356764.svg",
											width:"50",
											height:"50",
											text:"유머",
										},
											
            }
    },
	start(){
		CategoryChoiceYoutube=this;
	},
    // Define required styles.
	getStyles: function(){
		return ["font-awesome.css", "MMM-Modulebar.css"];
	},

    // Override dom generator.
    getDom: function() {
        var menu = document.createElement("span");
        menu.className = "modulebar-menu";
        menu.id = this.identifier + "_menu";
        menu.style.flexDirection = this.config.direction;
		// Sends each button to the "createButton" function be created.
		for (var num in this.config.buttons) {
			menu.appendChild(this.createButton(this, num, this.config.buttons[num], this.config.picturePlacement));
        }
        return menu;
    },

	// Creates the buttons.
    createButton: function (self, num, data, placement) {
		// Creates the span elemet to contain all the buttons.
		var item = document.createElement("span");
        // Builds a uniqe indentity / button.
		item.id = self.identifier + "_button_" + num;
        // Sets a class to all buttons.
		item.className = "modulebar-button";
        // Makes sure the width and height is at least the defined minimum.
		item.style.minWidth = self.config.minWidth;
        item.style.minHeight = self.config.minHeight;
		// Collects all modules loaded in MagicMirror.
		var modules = MM.getModules();
		// When a button is clicked, the module either gets hidden or shown depending on current module status.
		item.addEventListener("click", function () {
			// Lists through all modules for testing.
			for (var i = 0; i < modules.length; i++) {
				// Check if the curent module is the one.
				if (modules[i].name === data.module) {
					// Splits out the module number of the module with the same name.
					var idnr = modules[i].data.identifier.split("_");					
					// Checks if idnum is set in config.js. If it is, it only hides that module, if not hides all modules with the same name.
					if (idnr[1] == data.idnum || data.idnum == null) {
						// Check if the module is hidden.
						if (modules[i].hidden) {
							// Check if there is a "showURL" defined.
							if (data.showUrl != null) {
								// Visiting the show URL.
								fetch(data.showUrl);
								// Prints the visited hideURL.
								console.log("Visiting show URL: "+data.showUrl);
								
							}
							// add code
							
							if(num==1){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"YCcE9oGkOw8_롤");			
									} 
							else	if(num==2){
										CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"ScSn235gQx0_뮤직비디오");			
											} 
							else	if(num==3){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"KUiouwhozkQ_영화");			
									} 
							else	if(num==4){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"L0oei9OH7Yo_뉴스");			
									}
							else	if(num==5){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"Bxg1CqqkzE0_스포츠");			
									}
							else	if(num==6){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"egyB02dbJKE_먹방");			
									}
							else	if(num==7){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"Vw39vVf2HCI_해외여행");			
									}
							else	if(num==8){
								CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"MFWtM11WJn0_몰카");			
									}
									
							// 
							modules[i].show(self.config.animationSpeed, {force: self.config.allowForce});
							// Prints in the console what just happend (adding the ID). 
							console.log("Showing "+modules[i].name+" ID: "+idnr[1]);
						}else{
							if(num==1){
								if (modules[i].config.video_id == "YCcE9oGkOw8") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"YCcE9oGkOw8_롤");			
									} 
							else	if(num==2){
								if (modules[i].config.video_id == "ScSn235gQx0") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"ScSn235gQx0_뮤직비디오");	
											
									} 
							else	if(num==3){
								if (modules[i].config.video_id == "KUiouwhozkQ") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"KUiouwhozkQ_영화");	
											
									} 
							else	if(num==4){
								if (modules[i].config.video_id == "L0oei9OH7Yo") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"L0oei9OH7Yo_뉴스");	
											
											} 
							else	if(num==5){
								if (modules[i].config.video_id == "Bxg1CqqkzE0") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"Bxg1CqqkzE0_스포츠");	
											
											} 
							else	if(num==6){
								if (modules[i].config.video_id == "egyB02dbJKE") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"egyB02dbJKE_먹방");	
											
											} 
							else	if(num==7){
								if (modules[i].config.video_id == "Vw39vVf2HCI") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"Vw39vVf2HCI_해외여행");	
											
											} 
							else	if(num==8){
								if (modules[i].config.video_id == "MFWtM11WJn0") {
									                                console.log("modules[i].config.video_id ?"+ modules[i].config.video_id);
																	modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                                //modules[5].hide(self.config.animationSpeed, {force: self.config.allowForce});
									                            }
								else
									CategoryChoiceYoutube.sendNotification('PLAYLISTCHANGE',"MFWtM11WJn0_몰카");	
											
											} 
							// Hides the module.
							
							// Prints in the console what just happend (adding the ID). 
							console.log("Hiding "+modules[i].name+" ID: "+idnr[1]);
							// Check if there is a "hideURL" defined.
							if (data.hideUrl != null) {
								// Visiting the the URL.
								fetch(data.hideUrl);
								// Prints the visited hideURL.
								console.log("Visiting hide URL: "+data.hideUrl);
							}
						}
					}
				}
			}
		});
		// Fixes the aligning.
        item.style.flexDirection = {
            "right"  : "row-reverse",
            "left"   : "row",
            "top"    : "column",
            "bottom" : "column-reverse"
        }[placement];
		// Sets the border around the symbol/picture/text to black.
        if (!self.config.showBorder) {
            item.style.borderColor = "black";
        }
		// Adds the Font-Awesome symbol if specified.
        if (data.symbol) {
            var symbol = document.createElement("span");
            symbol.className = "modulebar-picture fa fa-" + data.symbol;
			// Sets the size on the symbol if specified.
            if (data.size) {
                symbol.className += " fa-" + data.size;
                symbol.className += data.size == 1 ? "g" : "x";
            }
			// Align the symbol with a margin.
            if (data.text && placement === "left") {
                symbol.style.marginRight = "4px";
            }
			// Adds the symbol to the item.
            item.appendChild(symbol);

		// Adds a picture if specified.
		} else if (data.img) {
            var image = document.createElement("img");
            image.className = "modulebar-picture";
            image.src = data.img;
			// Sets the size of the picture if specified.
            if (data.width)  image.width  = data.width;
            if (data.height) image.height = data.height;
			// Align the picture with a margin.
            if (data.text && placement === "left") {
                image.style.marginRight = "4px";
            }
			// Adds the picture to the item.
            item.appendChild(image);
        }
		// Adds the text if specified.
        if (data.text) {
            var text = document.createElement("span");
            text.className = "modulebar-text";
            text.innerHTML = data.text;
			// Align the text with a margin.
            if ((data.symbol || data.img) && placement === "right") {
                text.style.marginRight = "4px";
            }
			// Adds the text to the item.
            item.appendChild(text);
        }
		// All done. :)
        return item;
	},
	
	notificationReceived: function(notification, payload) {
		if(notification === 'Modules All Change'){
			this.hide()
		}
	}
	
});	

CategoryChoiceEntMenu/CategoryChoiceEntMenu.js
//유튜브, 웹툰 선택
Module.register("CategoryChoiceEntMenu",{
	
	requiresVersion: "2.1.0",
	
    defaults: {
        // Allow the module to force modules to be shown (if hidden and locked by another module ex. profile-switcher).
        allowForce: false,
        // Determines if the border around the buttons should be shown.
        showBorder: false,
        // The minimum width for all the buttons.
        minWidth: "0px",
        // The minimum height for all the buttons.
        minHeight: "0px",
        // The location of the symbol relative to the text. Options: left, right, top or bottom
        picturePlacement: "left",
        // The direction of the bar. Options: row, column, row-reverse or column-reverse
        direction: "row",
		// The speed of the hide and show animation.
		animationSpeed: 500,
        // The default button 1. Add your buttons in the config.
        buttons: {
                    "1": {
	                  		module: "ShowWebtoon",
												img:"https://apprecs.org/gp/images/app-icons/300/ec/com.nhn.android.webtoon.jpg",
												width:"50",
												height:"50",
                          },
										"2": {
												module: "CategoryChoiceYoutube",
												img:"https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-256.png",
												width:"50",
												height:"50",
											},
            }
    },

    // Define required styles.
	getStyles: function(){
		return ["font-awesome.css", "MMM-Modulebar.css"];
	},

    // Override dom generator.
    getDom: function() {
        var menu = document.createElement("span");
        menu.className = "modulebar-menu";
        menu.id = this.identifier + "_menu";
        menu.style.flexDirection = this.config.direction;
		// Sends each button to the "createButton" function be created.
		for (var num in this.config.buttons) {
			menu.appendChild(this.createButton(this, num, this.config.buttons[num], this.config.picturePlacement));
        }

        return menu;
    },

	// 버튼 생성
    createButton: function (self, num, data, placement) {
		// span Element 생성
		var item = document.createElement("span");
        // 모듈 id 설정
		item.id = self.identifier + "_button_" + num;
        // 모든 모듈 클래스 지정
		item.className = "modulebar-button";
		//최소의 넓이 높이 지정.
		item.style.minWidth = self.config.minWidth;
        item.style.minHeight = self.config.minHeight;
		// 매직미러에 로드된 모든 모듈들을 호출
		var modules = MM.getModules();
		// 클릭시
		item.addEventListener("click", function () {
			// 모든 모듈체크
			for (var i = 1; i < modules.length; i++) {
				// 현재 모듈 확인
				if (modules[i].name === data.module) {
					var idnr = modules[i].data.identifier.split("_");
					console.log("idnr : "+idnr+"idnum"+data.idnum);
					if (idnr[1] == data.idnum || data.idnum == null) {
						// 모듈이 숨겨져있는 상태일때
						if (modules[i].hidden) {
							// Showurl 설정 확인
							if (data.showUrl != null) {
								//Show url
								fetch(data.showUrl);
								console.log("Visiting show URL: "+data.showUrl);
							}
							//한 프레임에 두가지이상의 모듈이 뜨지 않게 하기.
							
							if (modules[i].name == 'ShowWebtoon') {
								console.log("Hiding opend "+ modules[i].name+" ID: "+idnr[1]+"button number"+num);
								modules[26].hide(self.config.animationSpeed, {force: self.config.allowForce});
								modules[28].hide(self.config.animationSpeed, {force: self.config.allowForce});
								setTimeout(function(){
									modules[25].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
							}
							else if (modules[i].name == 'CategoryChoiceYoutube') {
								console.log("Hiding opend "+ modules[i].name+" ID: "+idnr[1]+"button number"+num);
								modules[25].hide(self.config.animationSpeed, {force: self.config.allowForce});
								setTimeout(function(){
									modules[28].show(self.config.animationSpeed, {force: self.config.allowForce});
								},500);
							}
						}else{
							// 모듈이 켜있는 상태일때 
							modules[i].hide(self.config.animationSpeed, {force: self.config.allowForce});
							console.log("Hiding "+modules[i].name+" ID: "+idnr[1]);
							// hideURL이 설정되 있을 때
							if (data.hideUrl != null) {
								fetch(data.hideUrl);
								console.log("Visiting hide URL: "+data.hideUrl);
							}
						}
					}
				}
			}
		});

		// 버튼 배열
        item.style.flexDirection = {
            "right"  : "row-reverse",
            "left"   : "row",
            "top"    : "column",
            "bottom" : "column-reverse"
        }[placement];
		// Sets the border around the symbol/picture/text to black.
        if (!self.config.showBorder) {
            item.style.borderColor = "black";
        }
		// Adds the Font-Awesome symbol if specified.
        if (data.symbol) {
            var symbol = document.createElement("span");
            symbol.className = "modulebar-picture fa fa-" + data.symbol;
			// Sets the size on the symbol if specified.
            if (data.size) {
                symbol.className += " fa-" + data.size;
                symbol.className += data.size == 1 ? "g" : "x";
            }
			// Align the symbol with a margin.
            if (data.text && placement === "left") {
                symbol.style.marginRight = "4px";
            }
			// Adds the symbol to the item.
            item.appendChild(symbol);

		// Adds a picture if specified.
		} else if (data.img) {
            var image = document.createElement("img");
            image.className = "modulebar-picture";
            image.src = data.img;
			// Sets the size of the picture if specified.
            if (data.width)  image.width  = data.width;
            if (data.height) image.height = data.height;
			// Align the picture with a margin.
            if (data.text && placement === "left") {
                image.style.marginRight = "4px";
            }
			// Adds the picture to the item.
            item.appendChild(image);
        }
		// Adds the text if specified.
        if (data.text) {
            var text = document.createElement("span");
            text.className = "modulebar-text";
            text.innerHTML = data.text;
			// Align the text with a margin.
            if ((data.symbol || data.img) && placement === "right") {
                text.style.marginRight = "4px";
            }
			// Adds the text to the item.
            item.appendChild(text);
        }
		// All done. :)
        return item;
	},
});

MMM-EmbedYoutube1/MMM-EmbedYoutube1.js
Module.register("MMM-EmbedYoutube1", {
	defaults: {
		autoplay: false,
		color: "red",
		controls : true,
		disablekb: false,
		fs: true,
		height: 800,
		width: 1000,
		loop: false,
		modestbranding: false,
		rel : false,
		showinfo : false,
		video_id : "r6A7Fsci7Ds",
		playlist: "",
		
		searchlist1: "쯔위"
	},
	getDom: function () {
		var wrapper = document.createElement("div");

		// Parameter
		var params = "";
		var search_list="&listType=search&list=";
		search_list += this.config.searchlist1;

		params += (this.config.autoplay) ? "autoplay=1" : "autoplay=0";
		params += (typeof this.config.color !== "undefined" && this.config.color != "red")? "&color=" + this.config.color:"";
		params += (this.config.controls)? "&controls=1":"&controls=0";
		params += (this.config.disablekb)? "&disablekb=1":"";
		params += (this.config.fs)? "":"&fs=0";
		//params += (videoList != "" && (typeof this.config.playlist === "undefined" || this.config.playlist == "")) ? videoList : "&playlist=" + this.config.video_id; // required playlist to loopable
		params += (this.config.loop) ? "&loop=1" : "";
		params += (this.config.modestbranding) ? "&modestbranding=1" : "";
		params += (this.config.rel)? "&rel=1": "&rel=0";
		params += (this.config.showinfo)? "&showinfo=1": "&showinfo=0";
		params += search_list; 

		var videoId = this.config.video_id +"?version=3";
		if (typeof this.config.playlist !== "undefined" && this.config.playlist != "")
			videoId = "playlist?list=" + this.config.playlist + "&";

		wrapper.innerHTML = "<iframe width=\"" 
		+ this.config.width +"\" height=\"" 
		+ this.config.height 
		+ "\" src=\"https://www.youtube.com/embed/" 
		+ videoId + "&"+ params +"\" frameborder=\"0\" allowfullscreen></iframe>";
		return wrapper;
	},
	notificationReceived: function(notification, payload) {
		Log.info(this.name + " - received notification: " + notification);
		
		if(notification === "Modules All Change"){
			this.hide()
		}
		
		if(notification === "PLAYLISTCHANGE"){
			var payload1=payload.split("_");
			console.log("thisconfigid : "+payload)
			this.config.video_id=payload1[0]
			this.config.searchlist1=payload1[1]
			console.log("thisconfigid : "+this.config.searchlist1)
			this.updateDom()

			console.log("thisconfigid : "+this.config.video_id)
		}
	}
});

MMM-EmbedYoutube2/MMM-EmbedYoutube2.js
Module.register("MMM-EmbedYoutube2", {
	defaults: {
		autoplay: false,
		color: "red",
		controls : true,
		disablekb: false,
		fs: true,
		height: 400,
		width: 600,
		loop: false,
		modestbranding: false,
		rel : false,
		showinfo : false,
		video_id : "",
		playlist: "",
		
		searchlist1: "롤"
	},
	getDom: function () {
		var wrapper = document.createElement("div");

		// Parameter
		var params = "";
		var search_list="&listType=search&list=";
		search_list += this.config.searchlist1;

		params += (this.config.autoplay) ? "autoplay=1" : "autoplay=0";
		params += (typeof this.config.color !== "undefined" && this.config.color != "red")? "&color=" + this.config.color:"";
		params += (this.config.controls)? "&controls=1":"&controls=0";
		params += (this.config.disablekb)? "&disablekb=1":"";
		params += (this.config.fs)? "":"&fs=0";
		//params += (videoList != "" && (typeof this.config.playlist === "undefined" || this.config.playlist == "")) ? videoList : "&playlist=" + this.config.video_id; // required playlist to loopable
		params += (this.config.loop) ? "&loop=1" : "";
		params += (this.config.modestbranding) ? "&modestbranding=1" : "";
		params += (this.config.rel)? "&rel=1": "&rel=0";
		params += (this.config.showinfo)? "&showinfo=1": "&showinfo=0";
		params += search_list; 

		var videoId = this.config.video_id +"?version=3";
		if (typeof this.config.playlist !== "undefined" && this.config.playlist != "")
			videoId = "playlist?list=" + this.config.playlist + "&";

		wrapper.innerHTML = "<iframe width=\"" 
		+ this.config.width +"\" height=\"" 
		+ this.config.height 
		+ "\" src=\"https://www.youtube.com/embed/" 
		+ videoId + "&"+ params +"\" frameborder=\"0\" allowfullscreen></iframe>";
		return wrapper;
	}/*
	notificationReceived: function(notification, payload) {
		if(notification === "DOM_OBJECTS_CREATED"){
			this.hide()
		}
	}*/
});

ShowWebtoon
//웹툰
Module.register("ShowWebtoon",{
        // Default module config.
        defaults: {
                        frameWidth: "1500",
                        width:"100%",
                        updateInterval: 0.5 * 60 * 1000,
                        url: ["http://s3.us-east-2.amazonaws.com/beautymirror.com/demo/index.html"],
                        scrolling: "yes",
                        visible : "false",
                        hidden : "true"
        },

start: function () {
        self = this;
        var count = 0;
        if (this.config.url.length > 0 ) {
              setInterval( function () { 
                 self.updateDom(1000);
                 console.log('update' + count++)
                 }, this.config.updateInterval);
        }
},
getRandomInt: function (min, max) {
return Math.floor(Math.random() * (max - min)) + min;
},
resume: function() {
console.log("Resuming");
return this.getDom();
},
getStyles: function() {
        return [
                "MMM-iFrame.css",
        ];
},

// Override dom generator.
getDom: function() {
        var { width, height } = this.config;
        var wrapper = document.createElement("div");
        
        wrapper.className = "mmm-iframe"
        wrapper.style.width = `${this.config.frameWidth}px`;

        var html = `
                <div class="mmm-iframe-wrapper" style="padding-top: ${100 / (width / height)}%;">
                        <iframe
                                src="${this.config.url[this.getRandomInt(0, this.config.url.length)]}"
                                width="${width}"
                                height="${height}"
                                scrolling="${this.config.scrolling}"
                        ></iframe>
                </div>
        `;

        wrapper.insertAdjacentHTML("afterbegin", html);

        return wrapper;
        },      
        notificationReceived: function(notification, payload){
                Log.info(this.name + " - received norification : " + notification);

                if(notification === 'Modules All Change'){
                        this.hide();
                }
        }       
});

- Etc 영화정보 / 모듈 제어 / Hide All
MMM-MovieInf/MMM-MovieInfo.js
//영화 상영 정보
Module.register('MMM-MovieInfo', {

    index: 0,

    defaults: {
        api_key: false,
        updateInterval: 180 * 60 * 1000,
        rotateInterval: 3 * 60 * 1000,
        genre: true,
        rating: true,
        plot: true,
        useLanguage: true,
        discover: {}
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.genres = {
            28: this.translate('ACTION'),
            12: this.translate('ADVENTURE'),
            16: this.translate('ANIMATION'),
            35: this.translate('COMEDY'),
            80: this.translate('CRIME'),
            99: this.translate('DOCUMENTARY'),
            18: this.translate('DRAMA'),
            10751: this.translate('FAMILY'),
            14: this.translate('FANTASY'),
            10769: this.translate('FOREIGN'),
            36: this.translate('HISTORY'),
            27: this.translate('HORROR'),
            10402: this.translate('MUSIC'),
            9648: this.translate('MYSTERY'),
            10749: this.translate('ROMANCE'),
            878: this.translate('SCIENCE_FICTION'),
            10770: this.translate('TV_MOVIE'),
            53: this.translate('THRILLER'),
            10752: this.translate('WAR'),
            37: this.translate('WESTERN')
        };
        if (this.config.useLanguage) {
            this.config.language = config.language;
        }
        this.sendSocketNotification('CONFIG', this.config);
        setInterval(() => {
            this.index += 1;
            this.updateDom(1000);
        }, this.config.rotateInterval);
    },

    getStyles() {
        return ['font-awesome.css', 'MMM-MovieInfo.css'];
    },

    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json'
        };
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'DATA') {
            this.upcoming = payload;
            this.updateDom(1000);
        }
    },

    getDom() {
        const wrapper = document.createElement('div');
        if (this.upcoming) {
            if (this.index >= this.upcoming.results.length) {
                this.index = 0;
            }
            wrapper.classList.add('wrapper', 'align-left');

            const movie = this.upcoming.results[this.index];

            const title = document.createElement('div');
            title.classList.add('bright', 'small');
            title.innerHTML = movie.title;
            wrapper.appendChild(title);

            const poster = document.createElement('img');
            poster.classList.add('poster');
            poster.src = `https://image.tmdb.org/t/p/w185_and_h278_bestv2/${movie.poster_path}`;
            wrapper.appendChild(poster);

            if (this.config.genre) {
                const genres = document.createElement('div');
                const genrespan = document.createElement('span');
                genrespan.classList.add('xsmall', 'float-left');
                genrespan.innerHTML = `${this.translate('GENRES')}: `;
                genres.appendChild(genrespan);
                const max = Math.min(3, movie.genre_ids.length);
                for (let i = 0; i < max; i += 1) {
                    if (Object.prototype.hasOwnProperty.call(this.genres, movie.genre_ids[i])) {
                        const genre = document.createElement('span');
                        genre.classList.add('xsmall', 'thin', 'badge', 'float-left');
                        genre.innerHTML = this.genres[movie.genre_ids[i]];
                        genres.appendChild(genre);
                    }
                }
                wrapper.appendChild(genres);
            }

            if (this.config.rating) {
                const stars = document.createElement('div');
                stars.classList.add('xsmall');
                const star = document.createElement('i');
                star.classList.add('fa', 'fa-star-o');
                stars.appendChild(star);
                const starspan = document.createElement('span');
                starspan.innerHTML = ` ${movie.vote_average}`;
                stars.appendChild(starspan);
                wrapper.appendChild(stars);
            }

            if (this.config.plot) {
                const plot = document.createElement('div');
                plot.classList.add('xsmall', 'plot');
                plot.innerHTML = movie.overview.length > 250 ?
                    `${movie.overview.substring(0, 248)}&#8230;` : movie.overview;
                wrapper.appendChild(plot);
            }
        }
        return wrapper;
    }
});

ShowRemoteControl
//BeautyMirror 제어
Module.register("ShowRemoteControl",{
        // Default module config.
        defaults: {
                        frameWidth: "1500",
                        width:"100%",
                        updateInterval: 0.5 * 60 * 1000,
                        url: ["http://172.16.98.14:9000/remote.html"],
                        scrolling: "yes",
                        visible : "true",
                        hidden : "false"
        },

start: function () {
        self = this;
        var count = 0;
        if (this.config.url.length > 0 ) {
              setInterval( function () { 
                 self.updateDom(1000);
                 console.log('update' + count++)
                 }, this.config.updateInterval);
        }
},
getRandomInt: function (min, max) {
return Math.floor(Math.random() * (max - min)) + min;
},
resume: function() {
console.log("Resuming");
return this.getDom();
},
getStyles: function() {
        return [
                "MMM-iFrame.css",
        ];
},

// Override dom generator.
getDom: function() {
        var { width, height } = this.config;
        var wrapper = document.createElement("div");
        
        wrapper.className = "mmm-iframe"
        wrapper.style.width = `${this.config.frameWidth}px`;

        var html = `
                <div class="mmm-iframe-wrapper" style="padding-top: ${100 / (width / height)}%;">
                        <iframe
                                src="${this.config.url[this.getRandomInt(0, this.config.url.length)]}"
                                width="${width}"
                                height="${height}"
                                scrolling="${this.config.scrolling}"
                        ></iframe>
                </div>
        `;

        wrapper.insertAdjacentHTML("afterbegin", html);

        return wrapper;
        },      
        notificationReceived: function(notification, payload){
                Log.info(this.name + " - received norification : " + notification);
        }       
});

mm-hide-all/mm-hide-all.js
//모든 모듈 숨기기
Module.register("mm-hide-all",{

	getScripts: function() {
		return ["modules/mm-hide-all/js/jquery.js"];
	},

	getStyles: function() {
		return ["mm-hide-all-style.css"];
	},
	
	getDom: function() {
		var wrapper = document.createElement("div");
		var button = document.createElement("div");
		var text = document.createElement("span");
		var overlay = document.createElement("div");
		var hidden = true;
		
		overlay.className = "paint-it-black";
		
		button.className = "hide-toggle";
		button.appendChild(text);
		text.innerHTML = "Hide";
		
		wrapper.appendChild(button);
		wrapper.appendChild(overlay);
		
		$(button).on("click", function(){
			if(hidden){
				$(overlay).fadeIn(1000);
				$(button).fadeTo(1000, 0.3);
				$(text).html('Show');
				hidden = false;
			}else{
				$(overlay).fadeOut(1000);
				$(button).fadeTo(1000, 1);
				$(text).html('Hide');
				hidden = true;
			}
		});
		
		return wrapper;
	}
});

MMM-remote-control
//모듈을 제어할 수 있는 실제 remote control
Module.register("MMM-Remote-Control", {

    requiresVersion: "2.4.0",

    // Default module config.
    defaults: {
        customCommand: {}
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);

        this.settingsVersion = 2;

        this.addresses = [];

        this.brightness = 100;
    },

    getStyles: function() {
        return ["remote-control.css"];
    },

    notificationReceived: function(notification, payload, sender) {
        // Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
        if (notification === "DOM_OBJECTS_CREATED") {
            this.sendSocketNotification("REQUEST_DEFAULT_SETTINGS");
            this.sendCurrentData();
        }
        if (notification === "REMOTE_ACTION") {
            console.log(payload);
            this.sendSocketNotification(notification, payload);
        }
        if (notification === "REGISTER_API") {
            this.sendSocketNotification(notification, payload);
        }
        if (notification === "USER_PRESENCE") {
            this.sendSocketNotification(notification, payload);
        }
    },

    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
        if (notification === "UPDATE") {
            this.sendCurrentData();
            if (notification === "IP_ADDRESSES") {}
            this.addresses = payload;
            if (this.data.position) {
                this.updateDom();
            }
        }
        if (notification === "USER_PRESENCE") {
            this.sendNotification(notification, payload);
        }
        if (notification === "DEFAULT_SETTINGS") {
            let settingsVersion = payload.settingsVersion;

            if (settingsVersion === undefined) {
                settingsVersion = 0;
            }
            if (settingsVersion < this.settingsVersion) {
                if (settingsVersion === 0) {
                    // move old data into moduleData
                    payload = { moduleData: payload, brightness: 100 };
                }
            }

            let moduleData = payload.moduleData;
            let hideModules = {};
            for (let i = 0; i < moduleData.length; i++) {
                for (let k = 0; k < moduleData[i].lockStrings.length; k++) {
                    if (moduleData[i].lockStrings[k].indexOf("MMM-Remote-Control") >= 0) {
                        hideModules[moduleData[i].identifier] = true;
                        break;
                    }
                }
            }

            let modules = MM.getModules();

            let options = { lockString: this.identifier };

            modules.enumerate(function(module) {
                if (hideModules.hasOwnProperty(module.identifier)) {
                    module.hide(0, options);
                }
            });

            this.setBrightness(payload.brightness);
        }
        if (notification === "BRIGHTNESS") {
            this.setBrightness(parseInt(payload));
        }
        if (notification === "REFRESH") {
            document.location.reload();
        }
        if (notification === "RESTART") {
            setTimeout(function() {
                document.location.reload();
                console.log('Delayed REFRESH');
            }, 60000);
        }
        if (notification === "SHOW_ALERT") {
            this.sendNotification(notification, payload);
        }
        if (notification === "HIDE_ALERT") {
            this.sendNotification(notification);
        }
        if (notification === "HIDE" || notification === "SHOW" || notification === "TOGGLE") {
            let options = { lockString: this.identifier };
            if (payload.force) { options.force = true; }
            let modules = (payload.module === "all") ? MM.getModules() :
                MM.getModules().filter(m => {
                    return (m.identifier === payload.module || m.name === payload.module);
                });
            if (typeof modules === "undefined") { return; }
            modules.forEach((mod) => {
                if (notification === "HIDE" ||
                    (notification === "TOGGLE" && !mod.hidden)) {
                    mod.hide(1000, options);
                } else if (notification === "SHOW" ||
                    (notification === "TOGGLE" && mod.hidden)) {
                    mod.show(1000, options);
                }
            });
        }
        if (notification === "NOTIFICATION") {
            this.sendNotification(payload.notification, payload.payload);
        }
    },

    buildCssContent: function(brightness) {
        var css = "";

        var defaults = {
            "body": parseInt("aa", 16),
            "header": parseInt("99", 16),
            ".dimmed": parseInt("66", 16),
            ".normal": parseInt("99", 16),
            ".bright": parseInt("ff", 16)
        };

        for (var key in defaults) {
            var value = defaults[key] / 100 * brightness;
            value = Math.round(value);
            value = Math.min(value, 255);
            if (value < 16) {
                value = "0" + value.toString(16);
            } else {
                value = value.toString(16);
            }
            var extra = "";
            if (key === "header") {
                extra = "border-bottom: 1px solid #" + value + value + value + ";";
            }
            css += key + " { color: #" + value + value + value + "; " + extra + "} ";
        }
        return css;
    },

    setBrightness: function(newBrightnessValue) {
        if (newBrightnessValue < 10) {
            newBrightnessValue = 10;
        }
        if (newBrightnessValue > 200) {
            newBrightnessValue = 200;
        }

        this.brightness = newBrightnessValue;

        var style = document.getElementById('remote-control-styles');
        if (!style) {
            // create custom css if not existing
            style = document.createElement('style');
            style.type = 'text/css';
            style.id = 'remote-control-styles';
            var parent = document.getElementsByTagName('head')[0];
            parent.appendChild(style);
        }

        if (newBrightnessValue < 100) {
            style.innerHTML = "";
            this.createOverlay(newBrightnessValue);
            return;
        }
        if (newBrightnessValue > 100) {
            style.innerHTML = this.buildCssContent(newBrightnessValue);
            this.removeOverlay();
            return;
        }
        // default brightness
        style.innerHTML = "";
        this.removeOverlay();
    },

    createOverlay: function(brightness) {
        var overlay = document.getElementById('remote-control-overlay');
        if (!overlay) {
            // if not existing, create overlay
            overlay = document.createElement("div");
            overlay.id = "remote-control-overlay";
            var parent = document.body;
            parent.insertBefore(overlay, parent.firstChild);
        }
        var bgColor = "rgba(0,0,0," + (100 - brightness) / 100 + ")";
        overlay.style.backgroundColor = bgColor;
    },

    removeOverlay: function() {
        var overlay = document.getElementById('remote-control-overlay');
        if (overlay) {
            var parent = document.body;
            parent.removeChild(overlay);
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        if (this.addresses.length === 0) {
            this.addresses = ["127.0.0.1"];
        }
        wrapper.innerHTML = "http://127.0.0.1:9000/remote.html";
        wrapper.className = "normal xsmall";
        return wrapper;
    },

    sendCurrentData: function() {
        var self = this;

        var modules = MM.getModules();
        var currentModuleData = [];
        modules.enumerate(function(module) {
            let modData = Object.assign({}, module.data);
            modData.hidden = module.hidden;
            modData.lockStrings = module.lockStrings;
            modData.config = module.config;
            currentModuleData.push(modData);
        });
        var configData = {
            moduleData: currentModuleData,
            brightness: this.brightness,
            settingsVersion: this.settingsVersion,
            remoteConfig: this.config
        };
        this.sendSocketNotification("CURRENT_STATUS", configData);
    }
});
