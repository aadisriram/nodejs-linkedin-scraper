#!/usr/bin/env node
import scrapeProfile, {
  LinkedInScraperError,
  normalizeProfileUrl,
} from "./index.js";

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url || url === "--help" || url === "-h") {
    console.error("Usage: linkedin-scraper <linkedin-profile-url>");
    process.exit(url ? 0 : 1);
  }

  try {
    normalizeProfileUrl(url);
    const profile = await scrapeProfile(url);
    process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
  } catch (err) {
    const message =
      err instanceof LinkedInScraperError
        ? `${err.name}: ${err.message}`
        : (err as Error)?.message ?? String(err);
    console.error(message);
    process.exit(1);
  }
}

void main();
