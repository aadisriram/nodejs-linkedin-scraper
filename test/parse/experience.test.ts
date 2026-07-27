import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

describe("experience parsing", () => {
  it("extracts positions with current flag", () => {
    const html = readFileSync(join(fixturesDir, "williamhgates.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/williamhgates",
    );
    expect(profile.positions.length).toBeGreaterThanOrEqual(1);
    const first = profile.positions[0];
    expect(first.title).toBe("Co-chair");
    expect(first.companyName).toBe("Gates Foundation");
    expect(first.dates?.current).toBe(true);
    expect(first.description).toBeUndefined();
  });

  it("parses Satya Nadella CEO role", () => {
    const html = readFileSync(join(fixturesDir, "satyanadella.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/satyanadella",
    );
    expect(profile.positions[0]?.title).toMatch(/CEO/i);
    expect(profile.positions[0]?.companyName).toBe("Microsoft");
  });
});
