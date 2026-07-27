import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { DateRange } from "../types.js";
import { parseDateRange } from "../dates.js";

export function textOf($el: Cheerio<Element> | null | undefined): string {
  if (!$el || $el.length === 0) return "";
  return $el.text().replace(/\s+/g, " ").trim();
}

export function attrOf(
  $el: Cheerio<Element> | null | undefined,
  name: string,
): string | undefined {
  if (!$el || $el.length === 0) return undefined;
  const value = $el.attr(name);
  return value?.trim() || undefined;
}

export function firstImageUrl($: CheerioAPI, root: Cheerio<Element>): string | undefined {
  const img = root.find("img").first();
  return (
    attrOf(img, "data-delayed-url") ||
    attrOf(img, "src") ||
    undefined
  );
}

export function parseDatesFrom($el: Cheerio<Element>): DateRange | undefined {
  const range = textOf($el.find(".date-range").first());
  if (range) return parseDateRange(range);
  const timeTexts = $el
    .find("time")
    .map((_, el) => textOf($el.find(el)))
    .get()
    .filter(Boolean);
  if (timeTexts.length >= 2) {
    return parseDateRange(`${timeTexts[0]} - ${timeTexts[1]}`);
  }
  if (timeTexts.length === 1) {
    const siblingText = textOf($el.find(".date-range, .experience-item__meta-item").first());
    return parseDateRange(siblingText || timeTexts[0]);
  }
  return undefined;
}

export function sectionRoot($: CheerioAPI, name: string): Cheerio<Element> {
  return $(`section[data-section="${name}"], [data-section="${name}"]`).first();
}

export function cleanHref(href?: string): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href, "https://www.linkedin.com");
    if (url.pathname.startsWith("/redir/redirect")) {
      const target = url.searchParams.get("url");
      return target ? decodeURIComponent(target) : url.toString();
    }
    return url.toString();
  } catch {
    return href;
  }
}
