import type { CheerioAPI } from "cheerio";
import { attrOf, cleanHref, firstImageUrl, textOf } from "./helpers.js";

export interface TopCard {
  name?: string;
  headline?: string;
  location?: string;
  pictureUrl?: string;
}

export function parseTopCard($: CheerioAPI): TopCard {
  const name =
    textOf($(".top-card-layout__title").first()) ||
    textOf($("h1").first()) ||
    undefined;

  const headline =
    textOf($(".top-card-layout__headline").first()) || undefined;

  const location =
    textOf($(".profile-info-subheader > span").first()) ||
    textOf($(".top-card__subline-item").first()) ||
    undefined;

  const pictureContainer = $('[data-section="picture"]').first();
  let pictureUrl = firstImageUrl($, pictureContainer);
  if (!pictureUrl) {
    pictureUrl =
      attrOf($('meta[property="og:image"]').first(), "content") || undefined;
  }

  return {
    name: name || metaName($),
    headline: headline || metaHeadline($),
    location,
    pictureUrl,
  };
}

function metaName($: CheerioAPI): string | undefined {
  const og = attrOf($('meta[property="og:title"]').first(), "content");
  if (!og) return undefined;
  return og.split(" - ")[0]?.trim() || og.trim();
}

function metaHeadline($: CheerioAPI): string | undefined {
  const og = attrOf($('meta[property="og:title"]').first(), "content");
  if (og && og.includes(" - ")) {
    const rest = og.split(" - ").slice(1).join(" - ");
    return rest.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim() || undefined;
  }
  const desc = attrOf($('meta[property="og:description"]').first(), "content");
  if (!desc) return undefined;
  return desc.split("·")[0]?.trim() || undefined;
}

export function parseWebsites($: CheerioAPI): string[] {
  const urls = new Set<string>();
  $('[data-section="websites"] a[href]').each((_, el) => {
    const href = cleanHref(attrOf($(el), "href"));
    if (href && !href.includes("linkedin.com/uas/login")) {
      urls.add(href);
    }
  });
  return [...urls];
}
