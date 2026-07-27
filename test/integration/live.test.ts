import { describe, expect, it } from "vitest";
import { scrapeProfile } from "../../src/index.js";

const live = process.env.LIVE_LINKEDIN === "1";

describe.runIf(live)("live LinkedIn smoke", () => {
  it(
    "scrapes Bill Gates public profile",
    async () => {
      const profile = await scrapeProfile("https://www.linkedin.com/in/williamhgates");
      expect(profile.name).toBeTruthy();
      expect(profile.headline).toBeTruthy();
      // Soft checks — sections vary
      if (profile.sectionsPresent.includes("experience")) {
        expect(profile.positions.length).toBeGreaterThan(0);
      }
    },
    45_000,
  );

  it(
    "scrapes Satya Nadella public profile",
    async () => {
      const profile = await scrapeProfile("https://www.linkedin.com/in/satyanadella");
      expect(profile.name).toBeTruthy();
      expect(profile.headline).toBeTruthy();
    },
    45_000,
  );
});

describe.runIf(!live)("live LinkedIn smoke (skipped)", () => {
  it("skips unless LIVE_LINKEDIN=1", () => {
    expect(live).toBe(false);
  });
});
