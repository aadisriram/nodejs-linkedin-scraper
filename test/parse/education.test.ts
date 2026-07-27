import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

describe("education parsing", () => {
  it("parses Harvard for Bill Gates", () => {
    const html = readFileSync(join(fixturesDir, "williamhgates.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/williamhgates",
    );
    expect(profile.educations.length).toBeGreaterThanOrEqual(1);
    expect(profile.educations[0]?.school).toContain("Harvard");
    expect(profile.educations[0]?.dates?.start).toMatch(/^1973/);
  });

  it("returns empty educations when section absent", () => {
    const html = readFileSync(join(fixturesDir, "jeffweiner08.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/jeffweiner08",
    );
    expect(profile.educations).toEqual([]);
  });
});
