/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "0.0.0.0", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1","172.16.100.133", "::ffff:172.16.100.133", "::1"], // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "en",
	timeFormat: 24,
	units: "metric",

	modules: [
	{
		module: 'MMM-BeforeImage',
		position: 'top_center',
		header:"전 사진 ! ",
		config: {
			imagePaths: ['modules/MMM-BeforeAfter/before']
		}
	},
	{
		module: 'MMM-AfterImage',
		position: 'top_center',
		header:"후 사진! ",
		config: {
			imagePaths: ['modules/MMM-BeforeAfter/before']
		}
	},
		
        {
            module: "MMM-Modulebar",
            position: "lower_third", 
			classes: "default everyone", 
			header:"사진 전후 캡쳐",
            config: {
				buttons: {
				"1": {
					
					module: "MMM-ImageSlideshow",
					text: "Current Weather",
					symbol: "cloud",
				  },
				}
            }
		},
		//3
		
        
        {
            module: "MMM-Dynamic-Modules",
        },
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		

		{
			module: "MMM-BeforeAfter",
			position: "top_right",
			config:{
				foo:"yellow"
			}
			
		},
	{
		module: 'MMM-ImageFileWatcher',
		position: 'middle_center',	// This can be any of the regions.		
		config: {
			// See 'Configuration options' for more information.
			imagePaths: ['modules/MMM-ImageFileWatcher/Images']
		}
	}
	

	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}