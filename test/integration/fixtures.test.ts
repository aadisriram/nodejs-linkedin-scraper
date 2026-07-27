import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

const cases = [
  ["williamhgates", "https://www.linkedin.com/in/williamhgates"],
  ["satyanadella", "https://www.linkedin.com/in/satyanadella"],
  ["jeffweiner08", "https://www.linkedin.com/in/jeffweiner08"],
  ["reidhoffman", "https://www.linkedin.com/in/reidhoffman"],
  ["guidovanrossum", "https://www.linkedin.com/in/guido-van-rossum-4a0756"],
] as const;

describe("fixture integration", () => {
  for (const [name, url] of cases) {
    it(`matches golden expectations for ${name}`, () => {
      const html = readFileSync(join(fixturesDir, `${name}.html`), "utf8");
      const expected = JSON.parse(
        readFileSync(join(fixturesDir, `${name}.expected.json`), "utf8"),
      ) as {
        name: string;
        headlineIncludes: string;
        minPositions: number;
        minEducations: number;
        hasSummary: boolean;
        hasSkills: boolean;
        hasProjects: boolean;
        hasHonors: boolean;
        hasVolunteering: boolean;
        sectionsInclude: string[];
        positionCount: number;
        educationCount: number;
        skillCount: number;
        projectCount: number;
        honorCount: number;
      };

      const profile = scrapeProfileFromHtml(html, url);
      expect(profile.name).toBe(expected.name);
      expect(profile.headline).toContain(expected.headlineIncludes);
      expect(profile.positions.length).toBeGreaterThanOrEqual(expected.minPositions);
      expect(profile.educations.length).toBeGreaterThanOrEqual(expected.minEducations);
      expect(Boolean(profile.summary)).toBe(expected.hasSummary);
      expect(profile.skills.length > 0).toBe(expected.hasSkills);
      expect(profile.projects.length > 0).toBe(expected.hasProjects);
      expect(profile.honors.length > 0).toBe(expected.hasHonors);
      expect(profile.volunteering.length > 0).toBe(expected.hasVolunteering);
      expect(profile.positions.length).toBe(expected.positionCount);
      expect(profile.educations.length).toBe(expected.educationCount);
      expect(profile.skills.length).toBe(expected.skillCount);
      expect(profile.projects.length).toBe(expected.projectCount);
      expect(profile.honors.length).toBe(expected.honorCount);
      for (const section of expected.sectionsInclude) {
        expect(profile.sectionsPresent).toContain(section);
      }
      expect(profile.publicProfileUrl).toBe(url);
    });
  }
});
