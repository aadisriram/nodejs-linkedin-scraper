# nodejs-linkedin-scraper
A simple linkedin profile scraper for nodejs

To use, check out home.js in the root module folder

<h1> Example Usage </h1>

var LinkedIn = require("linkedin-scraper");

var temp = new LinkedIn("https://www.linkedin.com/pub/aaditya-sriram/31/228/603", function(obj) {
        console.log(obj);
});

<h1> Sample Output </h1>

http://pastebin.com/0tDYCjPv
