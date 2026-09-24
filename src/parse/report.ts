import type { ParseReport, ParseReportKey, SectionParseReport } from "../types.js";

/** data-section values this parser knows how to turn into profile fields. */
export const KNOWN_SECTION_SOURCES: Record<ParseReportKey, readonly string[]> = {
  summary: ["summary"],
  positions: ["experience"],
  educations: ["educations", "educationsDetails"],
  skills: ["skills"],
  projects: ["projects"],
  honors: ["honors-and-awards"],
  languages: ["languages"],
  volunteering: ["volunteering"],
  publications: ["publications"],
  recommendations: ["recommendations"],
  websites: ["websites"],
};

export function buildParseReport(
  sectionsPresent: readonly string[],
  counts: Record<ParseReportKey, number>,
): ParseReport {
  const present = new Set(sectionsPresent);
  const report = {} as ParseReport;

  for (const key of Object.keys(KNOWN_SECTION_SOURCES) as ParseReportKey[]) {
    const count = counts[key] ?? 0;
    const sources = KNOWN_SECTION_SOURCES[key].filter((name) => present.has(name));
    const entry: SectionParseReport =
      count > 0
        ? { status: "parsed", count }
        : sources.length > 0
          ? { status: "empty", count: 0 }
          : { status: "absent", count: 0 };
    report[key] = entry;

    if (entry.status === "empty") {
      console.warn(
        `linkedin-scraper: known section "${sources.join(", ")}" is present but ${key} count is 0`,
      );
    }
  }

  return report;
}
