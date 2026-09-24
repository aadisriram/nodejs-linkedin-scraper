import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { Position } from "../types.js";
import { attrOf, cleanHref, parseDatesFrom, textOf } from "./helpers.js";

interface GroupCompany {
  companyName?: string;
  companyUrl?: string;
}

export function parsePositions($: CheerioAPI): Position[] {
  const positions: Position[] = [];
  const seen = new Set<string>();
  const section = $('section[data-section="experience"]').first();
  const root = section.length ? section : $("html");
  const list = root.find("ul.experience__list").first();

  if (list.length) {
    list.children("li").each((_, el) => {
      collectEntry($, $(el), positions, seen);
    });
    return positions;
  }

  root.find("li.experience-group").each((_, el) => {
    collectEntry($, $(el), positions, seen);
  });
  root.find("li.experience-item").each((_, el) => {
    const $el = $(el);
    if ($el.closest("li.experience-group").length) return;
    collectEntry($, $el, positions, seen);
  });

  return positions;
}

function collectEntry(
  $: CheerioAPI,
  $el: Cheerio<Element>,
  positions: Position[],
  seen: Set<string>,
): void {
  if ($el.hasClass("experience-group")) {
    const group = readGroup($, $el);
    $el.find("li.experience-group-position").each((_, pos) => {
      pushPosition($, $(pos), positions, seen, group);
    });
    return;
  }
  if ($el.hasClass("experience-item") || $el.hasClass("experience-group-position")) {
    pushPosition($, $el, positions, seen);
  }
}

function readGroup($: CheerioAPI, $group: Cheerio<Element>): GroupCompany {
  const headerLink = $group.find("a.experience-group-header__url").first();
  const companyName =
    textOf($group.find(".experience-group-header__company").first()) ||
    attrOf(headerLink, "title");
  return {
    companyName: companyName || undefined,
    companyUrl: cleanHref(attrOf(headerLink, "href")),
  };
}

function pushPosition(
  $: CheerioAPI,
  $el: Cheerio<Element>,
  positions: Position[],
  seen: Set<string>,
  group?: GroupCompany,
): void {
  const title =
    textOf($el.find(".experience-item__title").first()) ||
    textOf($el.find("h3").first());
  const ownCompany =
    textOf($el.find(".experience-item__subtitle").first()) ||
    textOf($el.find("h4").first());
  const companyName = ownCompany || group?.companyName || "";
  const companyUrl =
    cleanHref(attrOf($el.find('a[href*="/company/"]').first(), "href")) ||
    group?.companyUrl;
  const locality = readLocality($, $el);
  const description = textOf(
    $el.find(".show-more-less-text__text--less, .show-more-less-text > p").first(),
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
    locality,
    description:
      description && description !== title && description !== companyName
        ? description
        : undefined,
    dates,
  });
}

/**
 * Locality in guest HTML is a bare `.experience-item__meta-item` line
 * ("San Francisco Bay Area"), not a `.location` node.
 */
function readLocality($: CheerioAPI, $el: Cheerio<Element>): string | undefined {
  const classed = textOf(
    $el
      .find(
        ".experience-item__location, .experience-item__meta-item .location, span.location",
      )
      .first(),
  );
  if (classed) return classed;

  let locality: string | undefined;
  $el.find(".experience-item__meta-item").each((_, meta) => {
    if (locality) return;
    const $meta = $(meta);
    if ($meta.find(".date-range, time, .show-more-less-text").length > 0) return;
    if ($meta.attr("data-section") === "currentPositions") return;
    const text = textOf($meta);
    if (!text) return;
    if (/\d/.test(text) && /\b(year|years|month|months)\b/i.test(text)) return;
    locality = text;
  });
  return locality;
}
