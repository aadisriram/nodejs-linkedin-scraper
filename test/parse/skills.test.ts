import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

describe("skills parsing", () => {
  it("extracts skill pills when present", () => {
    const html = readFileSync(join(fixturesDir, "jeffweiner08.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/jeffweiner08",
    );
    expect(profile.skills).toContain("Leadership");
    expect(profile.skills.length).toBeGreaterThan(3);
  });

  it("returns empty skills when section absent", () => {
    const html = readFileSync(join(fixturesDir, "williamhgates.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/williamhgates",
    );
    expect(profile.skills).toEqual([]);
  });
});
