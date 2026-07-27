import type { CheerioAPI } from "cheerio";
import type { Position } from "../types.js";
import { attrOf, cleanHref, parseDatesFrom, textOf } from "./helpers.js";

export function parsePositions($: CheerioAPI): Position[] {
  const positions: Position[] = [];
  const seen = new Set<string>();

  const items = $(
    'section[data-section="experience"] li.experience-item, li.experience-item',
  );

  items.each((_, el) => {
    const $el = $(el);
    // Skip nested duplicates from top-card currentPositionsDetails if already captured via experience list
    const title =
      textOf($el.find(".experience-item__title").first()) ||
      textOf($el.find("h3").first());
    const companyName =
      textOf($el.find(".experience-item__subtitle").first()) ||
      textOf($el.find("h4").first());
    const companyUrl = cleanHref(
      attrOf($el.find('a[href*="/company/"]').first(), "href"),
    );
    const locality = textOf(
      $el.find(".experience-item__meta-item .location, span.location, .experience-item__location").first(),
    );
    const description = textOf(
      $el
        .find(".show-more-less-text__text--less, .show-more-less-text > p")
        .first(),
    );
    const dates = parseDatesFrom($el);

    if (!title && !companyName) return;

    const key = `${title}|${companyName}|${dates?.raw ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);

    positions.push({
      title: title || undefined,
      companyName: companyName || undefined,
      companyUrl,
      locality: locality || undefined,
      description: description && description !== title && description !== companyName
        ? description
        : undefined,
      dates,
    });
  });

  return positions;
}
