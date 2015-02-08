var LinkedInProfile = require("./index.js");

var prof = new LinkedInProfile(process.argv.slice(2)[0], function(profile) {
	console.log(profile);
});