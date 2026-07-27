# linkedin-scraper

Scrape **public** LinkedIn profile pages into structured JSON. Written in TypeScript, uses Cheerio (no jQuery, no jsdom), and ships with a CLI plus an optional MCP server for AI clients.

> Public guest HTML varies by profile. Some people expose experience and education; others only projects, skills, or a top card. This library returns whatever is present and never assumes a fixed shape.

## Install

```bash
npm install linkedin-scraper
```

Requires **Node.js 20+**.

## Library usage

```ts
import { scrapeProfile } from "linkedin-scraper";

const profile = await scrapeProfile("https://www.linkedin.com/in/williamhgates");
console.log(profile.name, profile.headline, profile.positions);
```

Options:

```ts
await scrapeProfile(url, {
  timeoutMs: 20_000,
  proxyUrl: process.env.PROXY_HOST, // or set PROXY_HOST / HTTPS_PROXY
  userAgent: "...",
  acceptLanguage: "en-US,en;q=0.9",
});
```

Parse HTML you already fetched:

```ts
import { scrapeProfileFromHtml } from "linkedin-scraper";

const profile = scrapeProfileFromHtml(html, "https://www.linkedin.com/in/someone");
```

### Profile shape

Core fields: `publicProfileUrl`, `name`, `headline`, `location`, `pictureUrl`, `summary`.

Arrays (often empty): `positions`, `educations`, `skills`, `projects`, `honors`, `languages`, `volunteering`, `publications`, `recommendations`, `websites`.

`sectionsPresent` lists the `data-section` values found on the page so you can see what LinkedIn exposed to guests.

## CLI

```bash
npx linkedin-scraper https://www.linkedin.com/in/williamhgates
```

Prints JSON to stdout. Non-zero exit on errors.

## MCP server

Exposes a `get_profile` tool over stdio for Cursor, Claude Desktop, and other MCP clients.

```bash
npx linkedin-scraper-mcp
```

Example Cursor / Claude Desktop config:

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

Or after a local build:

```json
{
  "mcpServers": {
    "linkedin-scraper": {
      "command": "node",
      "args": ["/absolute/path/to/nodejs-linkedin-scraper/dist/mcp/server.js"]
    }
  }
}
```

## Errors

| Error | When |
|-------|------|
| `InvalidProfileUrlError` | Not a `/in/{slug}` LinkedIn URL |
| `ProfileNotFoundError` | HTTP 404 / unparseable empty page |
| `RateLimitedError` | HTTP 999 / 429 |
| `AuthChallengeError` | Auth wall / challenge HTML |
| `FetchError` | Network / timeout |
| `ParseError` | Unexpected HTML parse failure |

## Testing

```bash
npm test                 # offline fixtures (CI)
npm run test:live        # hits LinkedIn (LIVE_LINKEDIN=1)
npm run test:coverage
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for fixture refresh notes.

## Notes & limits

- **Public only** — no login, cookies, or Voyager API.
- LinkedIn may return HTTP **999** or challenge pages from datacenter IPs; retries, backoff, or a proxy can help.
- Respect LinkedIn’s terms of service and applicable law. You are responsible for how you use this tool.
- Package license: **MIT**.

## Migrating from 1.x

Version 2.0 is a full rewrite:

- Callback API removed → `await scrapeProfile(url)`
- `jquery` / `jsdom` removed → Cheerio + `fetch`
- Selectors updated for current public profile markup
- Sections are optional; check `sectionsPresent`
