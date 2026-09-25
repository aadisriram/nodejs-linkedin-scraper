# linkedin-scraper

Parse **public LinkedIn profile HTML** into structured JSON.

This package is an ESM-only TypeScript library for **Node.js 20+**. The durable API is `scrapeProfileFromHtml`: HTML in, JSON out. Cheerio does the parsing. There is no browser and no login.

Live fetch of a profile URL is a thin optional client. HTTP **429**, **999**, and auth-wall responses are terminal. This library does not retry them.

## Install

```bash
npm install linkedin-scraper
```

Requires **Node.js 20 or newer**. The package is **ESM only** (`"type": "module"`, no CommonJS `require` export).

The default install is the parser: Cheerio, plus undici when a fetch uses a proxy. The MCP server's `@modelcontextprotocol/sdk` and `zod` packages are optional dependencies.

## Parse HTML you already have

```ts
import { scrapeProfileFromHtml } from "linkedin-scraper";
import { readFileSync } from "node:fs";

const html = readFileSync("profile.html", "utf8");
const profile = scrapeProfileFromHtml(html, "https://www.linkedin.com/in/williamhgates");
console.log(profile.name, profile.positions);
```

Use HTML you are allowed to process: a page you saved, a fixture, or another export you already have. Parsing does not contact LinkedIn.

### Sample

This document is the parser output for the checked-in Bill Gates public-profile fixture (`schemaVersion` 1).

```json
{
  "schemaVersion": 1,
  "publicProfileUrl": "https://www.linkedin.com/in/williamhgates",
  "name": "Bill Gates",
  "headline": "Chair, Gates Foundation and Founder, Breakthrough Energy",
  "location": "Seattle, Washington, United States",
  "pictureUrl": "https://media.licdn.com/dms/image/v2/D5603AQF-RYZP55jmXA/profile-displayphoto-shrink_200_200/B56ZRi8g.aGsAY-/0/1736826818802?e=2147483647&v=beta&t=bKWfN6UwwtiCqFWsG7rBELbd48qJOAMLdxhBzzkJV0k",
  "summary": "Chair of the Gates Foundation. Founder of Breakthrough Energy. Co-founder of Microsoft. Voracious reader. Avid traveler. Active blogger.",
  "positions": [
    {
      "title": "Co-chair",
      "companyName": "Gates Foundation",
      "companyUrl": "https://www.linkedin.com/company/gates-foundation?trk=public_profile_experience-item_profile-section-card_image-click",
      "dates": {
        "start": "2000",
        "current": true,
        "raw": "2000 - Present 26 years"
      }
    },
    {
      "title": "Founder",
      "companyName": "Breakthrough Energy",
      "companyUrl": "https://www.linkedin.com/company/breakthrough-energy?trk=public_profile_experience-item_profile-section-card_image-click",
      "dates": {
        "start": "2015",
        "current": true,
        "raw": "2015 - Present 11 years"
      }
    },
    {
      "title": "Co-founder",
      "companyName": "Microsoft",
      "companyUrl": "https://www.linkedin.com/company/microsoft?trk=public_profile_experience-item_profile-section-card_image-click",
      "dates": {
        "start": "1975",
        "current": true,
        "raw": "1975 - Present 51 years"
      }
    }
  ],
  "educations": [
    {
      "school": "Harvard University",
      "schoolUrl": "https://www.linkedin.com/school/harvard-university/?trk=public_profile_school_profile-section-card_image-click",
      "dates": {
        "start": "1973",
        "end": "1975",
        "raw": "1973 - 1975"
      }
    },
    {
      "school": "Lakeside School",
      "schoolUrl": "https://www.linkedin.com/school/lakeside-school/?trk=public_profile_school_profile-section-card_image-click"
    }
  ],
  "skills": [],
  "projects": [],
  "honors": [],
  "languages": [],
  "volunteering": [],
  "publications": [],
  "recommendations": [],
  "websites": [
    "https://gatesnot.es/sourcecode-li"
  ],
  "sectionsPresent": [
    "articles",
    "currentPositionsDetails",
    "educationsDetails",
    "experience",
    "picture",
    "posts",
    "summary",
    "websites"
  ],
  "parseReport": {
    "summary": { "status": "parsed", "count": 1 },
    "positions": { "status": "parsed", "count": 3 },
    "educations": { "status": "parsed", "count": 2 },
    "skills": { "status": "absent", "count": 0 },
    "projects": { "status": "absent", "count": 0 },
    "honors": { "status": "absent", "count": 0 },
    "languages": { "status": "absent", "count": 0 },
    "volunteering": { "status": "absent", "count": 0 },
    "publications": { "status": "absent", "count": 0 },
    "recommendations": { "status": "absent", "count": 0 },
    "websites": { "status": "parsed", "count": 1 }
  }
}
```

Guest HTML varies. Another profile may fill `skills` or `projects` and leave `positions` empty. Empty arrays mean the parser did not emit items. Use `parseReport` to tell a missing section from a section that was on the page.

### Field notes

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Integer for this JSON contract. Currently `1`. |
| `publicProfileUrl` | The profile URL you passed in. |
| `name`, `headline`, `location`, `pictureUrl`, `summary` | Top card and About text, when present. |
| `positions` | Roles, including several titles under one company group. `companyName` comes from the role, or from the group header when the role does not repeat it. |
| `positions[].locality` | Place line from the role meta text (for example `San Francisco Bay Area`). Omitted when the HTML has no place line. |
| `positions[].dates.start` / `end` | Calendar date: `YYYY` or `YYYY-MM`. Not a timezone-shifted instant. |
| `dates.raw` | Whitespace-normalized text from the page, including a duration suffix when LinkedIn printed one. |
| `dates.current` | `true` when the range ends in Present. |
| `educations`, `skills`, `projects`, `honors`, `languages`, `volunteering`, `publications`, `recommendations`, `websites` | Optional lists. Often empty. |
| `sectionsPresent` | Every `data-section` value found in the HTML, including sections this parser does not model. |
| `parseReport` | One entry per known field: `absent` (section not in the HTML), `empty` (section present, item count 0), or `parsed` (with `count`). |

The parser warns on stderr when a known section is in `sectionsPresent` and the item count is 0.

### Sections you will not get

These show up on public pages and are **not** profile fields:

- Articles (`articles`)
- Posts (`posts`)
- Instructor courses (`instructor-courses`)
- Any other `data-section` that is only listed in `sectionsPresent`

`parseReport` marks known fields `absent` when their section is missing. It does not invent articles, posts, or courses.

## When not to use a fetch

Fetching `https://www.linkedin.com/in/{slug}` is a convenience for public guest HTML that LinkedIn still returns. LinkedIn’s terms restrict automated collection, and guest HTML is often replaced by an auth wall or HTTP 429/999. When that happens, **stop**. Do not retry, rotate proxies, or look for a private API.

Use a source that matches the data you are allowed to process:

- **LinkedIn’s official APIs** (Marketing, Community Management, and partner programs) for an approved integration. Those APIs are not a directory of arbitrary people.
- **Sign In with LinkedIn** (OpenID Connect) when the product needs the signed-in member’s own identity fields, under the scopes that product is approved to use.
- **The member’s own LinkedIn data download** (“Download your data”), parsed offline from the archive LinkedIn gives that member.
- **HTML you already have**, passed to `scrapeProfileFromHtml`.

Respect LinkedIn’s terms and applicable law. You are responsible for how you use this tool.

## Live fetch

`scrapeProfile` fetches, then parses. It is optional. A single explicit `proxyUrl` is an operator network setting, not a pool or a bypass.

```ts
import { scrapeProfile } from "linkedin-scraper";

const profile = await scrapeProfile("https://www.linkedin.com/in/williamhgates", {
  timeoutMs: 20_000,
  proxyUrl: process.env.HTTPS_PROXY,
});
```

| Error | When | CLI exit |
| --- | --- | --- |
| `InvalidProfileUrlError` | Not a `/in/{slug}` LinkedIn URL | 2 |
| `ProfileNotFoundError` | HTTP 404, or HTML with no profile | 3 |
| `RateLimitedError` | HTTP 429 or 999. Terminal. Do not retry. | 4 |
| `AuthChallengeError` | Auth wall or challenge HTML. Terminal. Do not retry. | 5 |
| `FetchError` | Network failure or timeout | 6 |
| `ParseError` | Unexpected HTML parse failure | 7 |

Usage mistakes exit `1`. Success exits `0`.

## CLI

Parse a local file (primary):

```bash
npx linkedin-scraper --html profile.html --url https://www.linkedin.com/in/williamhgates
```

Fetch, with a timeout and one proxy URL:

```bash
npx linkedin-scraper --url https://www.linkedin.com/in/williamhgates --timeout 20000 --proxy http://host:port
```

JSON goes to stdout. 429, 999, and auth walls are terminal exit codes (4 and 5).

## MCP server

`get_profile` is a stdio tool that calls the same fetch-and-parse path. Install the optional MCP packages if npm omitted them:

```bash
npm install linkedin-scraper @modelcontextprotocol/sdk zod
npx linkedin-scraper-mcp
```

The server version is the `version` in `package.json`.

```json
{
  "mcpServers": {
    "linkedin-scraper": {
      "command": "npx",
      "args": ["-y", "linkedin-scraper-mcp"]
    }
  }
}
```

Library code can import the server from `linkedin-scraper/mcp` without pulling it into the main parser entry.

## Testing

```bash
npm test
npm run test:live        # hits LinkedIn only when LIVE_LINKEDIN=1
npm run test:coverage
```

Live tests stay off unless you opt in. See [CONTRIBUTING.md](CONTRIBUTING.md) for fixture refresh notes.

## Migrating from 1.x

Version 2.0 is a full rewrite:

- Callback API removed. Use `scrapeProfileFromHtml` or `await scrapeProfile(url)`.
- `jquery` / `jsdom` removed. Parsing uses Cheerio.
- Sections are optional. Check `parseReport` and `sectionsPresent`.
- Date fields are calendar `YYYY` or `YYYY-MM`, plus `raw` and `current`.

License: **MIT**.
