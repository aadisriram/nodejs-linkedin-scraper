import * as cheerio from "cheerio";
import { AuthChallengeError, ParseError, ProfileNotFoundError } from "../errors.js";
import { assertNotChallengePage } from "../fetch.js";
import type { LinkedInProfile } from "../types.js";
import { parseEducations } from "./education.js";
import { parsePositions } from "./experience.js";
import {
  parseHonors,
  parseLanguages,
  parseProjects,
  parsePublications,
  parseRecommendations,
  parseSkills,
  parseSummary,
  parseVolunteering,
} from "./sections.js";
import { parseTopCard, parseWebsites } from "./top-card.js";

export function listSectionsPresent(html: string): string[] {
  const $ = cheerio.load(html);
  const sections = new Set<string>();
  $("[data-section]").each((_, el) => {
    const value = $(el).attr("data-section");
    if (value) sections.add(value);
  });
  return [...sections].sort();
}

/**
 * Parse a public LinkedIn profile from HTML (no network).
 */
export function scrapeProfileFromHtml(
  html: string,
  publicProfileUrl: string,
): LinkedInProfile {
  try {
    assertNotChallengePage(html);

    const $ = cheerio.load(html);
    const sectionsPresent = listSectionsPresent(html);
    const top = parseTopCard($);

    if (!top.name && !top.headline && sectionsPresent.length === 0) {
      throw new ProfileNotFoundError(
        "Could not find a public LinkedIn profile in the HTML response",
      );
    }

    // Extra guard: authwall pages sometimes still mention linkedin
    if (!top.name && html.toLowerCase().includes("authwall")) {
      throw new AuthChallengeError();
    }

    return {
      publicProfileUrl,
      name: top.name,
      headline: top.headline,
      location: top.location,
      pictureUrl: top.pictureUrl,
      summary: parseSummary($),
      positions: parsePositions($),
      educations: parseEducations($),
      skills: parseSkills($),
      projects: parseProjects($),
      honors: parseHonors($),
      languages: parseLanguages($),
      volunteering: parseVolunteering($),
      publications: parsePublications($),
      recommendations: parseRecommendations($),
      websites: parseWebsites($),
      sectionsPresent,
    };
  } catch (err) {
    if (
      err instanceof AuthChallengeError ||
      err instanceof ProfileNotFoundError ||
      err instanceof ParseError
    ) {
      throw err;
    }
    throw new ParseError(
      `Failed to parse LinkedIn profile HTML: ${(err as Error)?.message ?? String(err)}`,
      err,
    );
  }
}
