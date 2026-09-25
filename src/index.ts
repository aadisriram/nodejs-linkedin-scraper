import { fetchProfileHtml } from "./fetch.js";
import { scrapeProfileFromHtml } from "./parse/profile.js";
import type { LinkedInProfile, ScrapeOptions } from "./types.js";
import { normalizeProfileUrl } from "./url.js";

export type {
  DateRange,
  Education,
  Honor,
  Language,
  LinkedInProfile,
  ParseReport,
  ParseReportKey,
  Position,
  Project,
  Publication,
  Recommendation,
  ScrapeOptions,
  SectionParseReport,
  SectionParseStatus,
  Volunteering,
} from "./types.js";

export { SCHEMA_VERSION } from "./types.js";

export {
  AuthChallengeError,
  EXIT_CODES,
  FetchError,
  InvalidProfileUrlError,
  LinkedInScraperError,
  ParseError,
  ProfileNotFoundError,
  RateLimitedError,
  exitCodeForError,
} from "./errors.js";

export { normalizeProfileUrl, isLinkedInProfileUrl } from "./url.js";
export { parseDateRange } from "./dates.js";
export { scrapeProfileFromHtml, listSectionsPresent } from "./parse/profile.js";
export { fetchProfileHtml } from "./fetch.js";

/**
 * Fetch and parse a public LinkedIn profile.
 */
export async function scrapeProfile(
  url: string,
  options: ScrapeOptions = {},
): Promise<LinkedInProfile> {
  const normalized = normalizeProfileUrl(url);
  const { html } = await fetchProfileHtml(normalized, options);
  return scrapeProfileFromHtml(html, normalized);
}

export default scrapeProfile;
