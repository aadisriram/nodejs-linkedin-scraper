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
    expect(first.dates?.start).toBe("2000");
    expect(first.dates?.current).toBe(true);
    expect(first.dates?.raw).toContain("2000");
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
    expect(profile.positions[0]?.locality).toBe("Greater Seattle Area");
    expect(profile.positions[0]?.dates?.start).toBe("2014-02");
    expect(profile.positions[0]?.dates?.current).toBe(true);
  });

  it("parses grouped roles and attaches the group company", () => {
    const html = `
      <html><head><meta name="pageKey" content="public_profile_v3_desktop"></head>
      <body>
        <h1 class="top-card-layout__title">Group Person</h1>
        <section data-section="experience">
          <ul class="experience__list">
            <li class="experience-group">
              <a class="experience-group-header__url" href="https://www.linkedin.com/company/acme" title="Acme">
                <h4 class="experience-group-header__company">Acme</h4>
              </a>
              <ul class="experience-group__positions">
                <li class="experience-group-position">
                  <span class="experience-item__title">Engineer</span>
                  <p class="experience-item__meta-item">
                    <span class="date-range"><time>Apr 1995</time> - <time>May 2000</time></span>
                  </p>
                  <p class="experience-item__meta-item">San Francisco Bay Area</p>
                </li>
                <li class="experience-group-position">
                  <span class="experience-item__title">Advisor</span>
                </li>
              </ul>
            </li>
            <li class="experience-item">
              <span class="experience-item__title">Director</span>
              <span class="experience-item__subtitle">Other Co</span>
              <p class="experience-item__meta-item">
                <span class="date-range"><time>2001</time> - Present</span>
              </p>
            </li>
          </ul>
        </section>
      </body></html>`;
    const profile = scrapeProfileFromHtml(html, "https://www.linkedin.com/in/group-person");
    expect(profile.positions.map((p) => p.title)).toEqual(["Engineer", "Advisor", "Director"]);
    expect(profile.positions[0]).toMatchObject({
      companyName: "Acme",
      companyUrl: "https://www.linkedin.com/company/acme",
      locality: "San Francisco Bay Area",
      dates: { start: "1995-04", end: "2000-05" },
    });
    expect(profile.positions[1]?.companyName).toBe("Acme");
    expect(profile.positions[2]).toMatchObject({
      companyName: "Other Co",
      dates: { start: "2001", current: true },
    });
  });

  it("reads grouped fixture roles with company, dates, and locality", () => {
    const html = readFileSync(join(fixturesDir, "jeffweiner08.html"), "utf8");
    const profile = scrapeProfileFromHtml(
      html,
      "https://www.linkedin.com/in/jeffweiner08",
    );
    expect(profile.positions.length).toBeGreaterThan(11);
    const founding = profile.positions.find((p) => p.title === "Founding Partner");
    expect(founding).toMatchObject({
      companyName: "Next Play Ventures",
      locality: "San Francisco Bay Area",
      dates: { start: "2020-07", current: true },
    });
    const linkedIn = profile.positions.find(
      (p) => p.companyName === "LinkedIn" && p.title,
    );
    expect(linkedIn?.companyName).toBe("LinkedIn");
    expect(linkedIn?.dates?.start).toMatch(/^\d{4}(-\d{2})?$/);
  });
});
