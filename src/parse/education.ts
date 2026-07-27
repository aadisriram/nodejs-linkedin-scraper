import type { CheerioAPI } from "cheerio";
import type { Education } from "../types.js";
import { attrOf, cleanHref, parseDatesFrom, textOf } from "./helpers.js";

export function parseEducations($: CheerioAPI): Education[] {
  const educations: Education[] = [];
  const seen = new Set<string>();

  // Full education list may use data-section="educations" or "educationsDetails"
  // (top-card school links also use educationsDetails — those lack education__list).
  const section = $(
    'section[data-section="educations"], section[data-section="educationsDetails"].education, section.education',
  ).filter((_, el) => $(el).find("ul.education__list, li.education__list-item").length > 0)
    .first();

  const items =
    section.length > 0
      ? section.find("li.education__list-item, ul.education__list > li.profile-section-card")
      : $("li.education__list-item");

  items.each((_, el) => {
    const $el = $(el);
    // Skip guest-blurred / gated cards
    if ($el.find(".blur, .blurred").length > 0 && textOf($el.find("h3")).includes("*")) {
      return;
    }

    // Ignore top-card compact school chips (not inside education__list)
    if (
      $el.closest("ul.education__list").length === 0 &&
      $el.closest(".profile-info-subheader, .top-card-layout").length > 0
    ) {
      return;
    }

    const schoolLink = $el.find('a[href*="/school/"]').first();
    const school =
      textOf($el.find("h3").first()) ||
      textOf(schoolLink) ||
      textOf($el.find(".top-card-link__description").first());

    const schoolUrl = cleanHref(attrOf(schoolLink, "href"));
    const degreeLine = textOf($el.find("h4").first());
    const dates = parseDatesFrom($el);
    const description = textOf(
      $el.find(".show-more-less-text__text--less, .show-more-less-text p").first(),
    );

    if (!school) return;
    // Skip cards that are clearly not education (e.g. blurred "see more" placeholders)
    if (/^\*+$/.test(school.replace(/\s/g, ""))) return;

    const key = `${school}|${degreeLine}|${dates?.raw ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);

    const { degree, fieldOfStudy } = splitDegree(degreeLine);

    educations.push({
      school,
      schoolUrl,
      degree,
      fieldOfStudy,
      dates,
      description: description || undefined,
    });
  });

  return educations;
}

function splitDegree(line?: string): { degree?: string; fieldOfStudy?: string } {
  if (!line) return {};
  // Common pattern: "Bachelor of Science, Computer Science" or "Degree · Field"
  const parts = line.split(/,|·/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) {
    if (parts[0] === "-" || parts[0] === "—") return {};
    return { degree: parts[0] };
  }
  return { degree: parts[0], fieldOfStudy: parts.slice(1).join(", ") };
}
