# nodejs-linkedin-scraper
A simple linkedin profile scraper for nodejs

To use, check out home.js in the root module folder

NPM : npm install linkedin-scraper

<h1> Example Usage </h1>
<code>

var LinkedIn = require("linkedin-scraper");::

var temp = new LinkedIn( <br />
                "https://www.linkedin.com/pub/aaditya-sriram/31/228/603", <br />
                function(obj) { <br />
                        console.log(obj); <br />
                } <br />
        ); <br />
</code>

<h1> Sample Output </h1>

http://pastebin.com/0tDYCjPv
