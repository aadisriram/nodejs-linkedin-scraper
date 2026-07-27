import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

function load(name: string): string {
  return readFileSync(join(fixturesDir, name), "utf8");
}

describe("top card parsing", () => {
  it("parses name, headline, location, picture from real fixture", () => {
    const profile = scrapeProfileFromHtml(
      load("williamhgates.html"),
      "https://www.linkedin.com/in/williamhgates",
    );
    expect(profile.name).toBe("Bill Gates");
    expect(profile.headline).toContain("Gates Foundation");
    expect(profile.location).toContain("Seattle");
    expect(profile.pictureUrl).toMatch(/^https:\/\//);
  });

  it("parses minimal synthetic top card", () => {
    const profile = scrapeProfileFromHtml(
      load("minimal-topcard.html"),
      "https://www.linkedin.com/in/jane-doe",
    );
    expect(profile.name).toBe("Jane Doe");
    expect(profile.headline).toBe("Software Engineer");
    expect(profile.location).toContain("San Francisco");
    expect(profile.pictureUrl).toBe("https://example.com/jane.jpg");
  });

  it("falls back to Open Graph tags", () => {
    const profile = scrapeProfileFromHtml(
      load("og-fallback.html"),
      "https://www.linkedin.com/in/fallback",
    );
    expect(profile.name).toBe("Fallback Only");
    expect(profile.headline).toContain("Engineer");
    expect(profile.pictureUrl).toBe("https://example.com/fallback.jpg");
  });
});
