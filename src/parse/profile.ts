import * as cheerio from "cheerio";
import { assertNotChallengePage } from "../challenge.js";
import { AuthChallengeError, ParseError, ProfileNotFoundError } from "../errors.js";
import { SCHEMA_VERSION, type LinkedInProfile } from "../types.js";
import { parseEducations } from "./education.js";
import { parsePositions } from "./experience.js";
import { buildParseReport } from "./report.js";
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

    const summary = parseSummary($);
    const positions = parsePositions($);
    const educations = parseEducations($);
    const skills = parseSkills($);
    const projects = parseProjects($);
    const honors = parseHonors($);
    const languages = parseLanguages($);
    const volunteering = parseVolunteering($);
    const publications = parsePublications($);
    const recommendations = parseRecommendations($);
    const websites = parseWebsites($);

    return {
      schemaVersion: SCHEMA_VERSION,
      publicProfileUrl,
      name: top.name,
      headline: top.headline,
      location: top.location,
      pictureUrl: top.pictureUrl,
      summary,
      positions,
      educations,
      skills,
      projects,
      honors,
      languages,
      volunteering,
      publications,
      recommendations,
      websites,
      sectionsPresent,
      parseReport: buildParseReport(sectionsPresent, {
        summary: summary ? 1 : 0,
        positions: positions.length,
        educations: educations.length,
        skills: skills.length,
        projects: projects.length,
        honors: honors.length,
        languages: languages.length,
        volunteering: volunteering.length,
        publications: publications.length,
        recommendations: recommendations.length,
        websites: websites.length,
      }),
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
