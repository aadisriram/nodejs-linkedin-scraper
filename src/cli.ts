#!/usr/bin/env node
import { readFileSync } from "node:fs";
import scrapeProfile, {
  LinkedInScraperError,
  exitCodeForError,
  normalizeProfileUrl,
  scrapeProfileFromHtml,
} from "./index.js";

const HELP = `linkedin-scraper — parse public LinkedIn profile HTML into JSON

Primary (no network):
  linkedin-scraper --html <file.html> --url <https://www.linkedin.com/in/slug>

Optional live fetch (fails closed; HTTP 429, 999, and auth walls are terminal):
  linkedin-scraper --url <https://www.linkedin.com/in/slug> [--timeout <ms>] [--proxy <url>]
  linkedin-scraper <https://www.linkedin.com/in/slug>

--timeout  Request timeout in milliseconds (fetch only; default 20000)
--proxy    One explicit proxy URL for the fetch, e.g. http://host:port
--help     Show this help

Exit codes:
  0  success
  1  usage error
  2  INVALID_URL
  3  NOT_FOUND
  4  RATE_LIMITED (HTTP 429 or 999 — stop; this tool does not retry)
  5  AUTH_CHALLENGE
  6  FETCH_ERROR
  7  PARSE_ERROR
`;

interface CliArgs {
  help: boolean;
  htmlPath?: string;
  url?: string;
  timeoutMs?: number;
  proxyUrl?: string;
}

function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = { help: false };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--html" || token === "--url" || token === "--timeout" || token === "--proxy") {
      const value = rest[++i];
      if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${token}`);
      }
      if (token === "--html") args.htmlPath = value;
      else if (token === "--url") args.url = value;
      else if (token === "--proxy") args.proxyUrl = value;
      else {
        const timeoutMs = Number(value);
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
          throw new Error(`Invalid --timeout value: ${value}`);
        }
        args.timeoutMs = timeoutMs;
      }
      continue;
    }
    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }
    if (args.url) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    args.url = token;
  }
  return args;
}

async function main(): Promise<void> {
  let args: CliArgs;
  try {
    args = parseCliArgs(process.argv);
  } catch (err) {
    console.error((err as Error).message);
    console.error(HELP);
    process.exit(1);
  }

  if (args.help || process.argv.length <= 2) {
    process.stdout.write(HELP);
    process.exit(process.argv.length <= 2 && !args.help ? 1 : 0);
  }

  try {
    if (args.htmlPath) {
      if (!args.url) {
        console.error("--html requires --url <https://www.linkedin.com/in/slug>");
        process.exit(1);
      }
      const publicProfileUrl = normalizeProfileUrl(args.url);
      const html = readFileSync(args.htmlPath, "utf8");
      const profile = scrapeProfileFromHtml(html, publicProfileUrl);
      process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
      return;
    }

    if (!args.url) {
      console.error("Missing profile HTML file or URL.");
      console.error(HELP);
      process.exit(1);
    }

    normalizeProfileUrl(args.url);
    const profile = await scrapeProfile(args.url, {
      timeoutMs: args.timeoutMs,
      proxyUrl: args.proxyUrl,
    });
    process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
  } catch (err) {
    const message =
      err instanceof LinkedInScraperError
        ? `${err.name}: ${err.message}`
        : (err as Error)?.message ?? String(err);
    console.error(message);
    process.exit(exitCodeForError(err));
  }
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("cli.js") || process.argv[1].endsWith("cli.ts"));

if (isDirectRun) {
  void main();
}
