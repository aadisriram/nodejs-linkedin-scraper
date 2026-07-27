import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AuthChallengeError, scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

describe("public profile variance", () => {
  it("does not throw when experience/summary are missing", () => {
    const html = readFileSync(join(fixturesDir, "guidovanrossum.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/guido-van-rossum-4a0756",
    );
    expect(profile.name).toBe("Guido van Rossum");
    expect(profile.positions).toEqual([]);
    expect(profile.summary).toBeUndefined();
    expect(profile.skills).toEqual([]);
    expect(profile.sectionsPresent).toContain("projects");
    expect(profile.sectionsPresent).not.toContain("experience");
  });

  it("handles empty section containers", () => {
    const html = readFileSync(join(fixturesDir, "empty-sections.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/empty",
    );
    expect(profile.name).toBe("Empty Sections Person");
    expect(profile.positions).toEqual([]);
    expect(profile.educations).toEqual([]);
    expect(profile.skills).toEqual([]);
    expect(profile.sectionsPresent).toEqual(
      expect.arrayContaining(["summary", "experience", "skills", "educationsDetails"]),
    );
  });

  it("throws AuthChallengeError for auth wall HTML", () => {
    const html = readFileSync(join(fixturesDir, "auth-challenge.html"), "utf8");
    expect(() =>
      scrapeProfileFromHtml(html, "https://www.linkedin.com/in/someone"),
    ).toThrow(AuthChallengeError);
  });
});
