# nodejs-linkedin-scraper
A simple linkedin profile scraper for nodejs

To use, check out home.js in the root module folder

NPM Link : <a href="https://www.npmjs.com/package/linkedin-scraper">linkedin-scraper</a>

Installation : <code>npm install linkedin-scraper</code>

<h1> Example Usage </h1>

<div class="highlight highlight-js"><pre><span class="pl-c">// Scrape a linkedin profile for the public contents</span>
<span class="pl-s">var</span> linkedinScraper <span class="pl-k">=</span> <span class="pl-s3">require</span>(<span class="pl-s1"><span class="pl-pds">"</span>linkedin-scraper<span class="pl-pds">"</span></span>);

linkedinScraper(url,
  <span class="pl-st">function</span> (<span class="pl-vpf">linkedinObject</span>) {
    <span class="pl-en">console</span><span class="pl-s3">.log</span>(<span class="pl-s1">linkedinObject</span>);
  }
);</pre></div>

<h1> Sample Output </h1>

http://pastebin.com/qNZGfA1W
