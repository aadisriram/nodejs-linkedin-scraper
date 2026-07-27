import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scrapeProfileFromHtml } from "../../src/index.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

describe("optional sections", () => {
  it("parses honors and volunteering for Reid Hoffman", () => {
    const html = readFileSync(join(fixturesDir, "reidhoffman.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/reidhoffman",
    );
    expect(profile.honors.length).toBeGreaterThan(0);
    expect(profile.honors[0]?.title).toBeTruthy();
    expect(profile.volunteering.length).toBeGreaterThan(0);
    expect(profile.publications.length).toBeGreaterThanOrEqual(0);
  });

  it("parses projects for Guido van Rossum", () => {
    const html = readFileSync(join(fixturesDir, "guidovanrossum.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/guido-van-rossum-4a0756",
    );
    expect(profile.projects.length).toBeGreaterThan(0);
    expect(profile.projects[0]?.name).toContain("Knowbot");
    expect(profile.volunteering.length).toBeGreaterThanOrEqual(1);
  });

  it("parses websites from top card", () => {
    const html = readFileSync(join(fixturesDir, "williamhgates.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/williamhgates",
    );
    expect(profile.websites.some((w) => w.includes("gatesnot.es"))).toBe(true);
  });
});
