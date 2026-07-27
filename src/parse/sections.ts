import type { CheerioAPI } from "cheerio";
import type {
  Honor,
  Language,
  Project,
  Publication,
  Recommendation,
  Volunteering,
} from "../types.js";
import {
  attrOf,
  cleanHref,
  parseDatesFrom,
  sectionRoot,
  textOf,
} from "./helpers.js";

export function parseSummary($: CheerioAPI): string | undefined {
  const section = sectionRoot($, "summary");
  if (!section.length) return undefined;
  const text = textOf(section.find(".core-section-container__content p").first())
    || textOf(section.find(".core-section-container__content").first());
  // Avoid capturing the "About" heading alone
  if (!text || /^about$/i.test(text)) return undefined;
  return text.replace(/^about\s+/i, "").trim() || undefined;
}

export function parseSkills($: CheerioAPI): string[] {
  const skills: string[] = [];
  const seen = new Set<string>();
  $('section[data-section="skills"] li.skills__item a, [data-section="skills"] li.skills__item a').each(
    (_, el) => {
      const name = textOf($(el));
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      skills.push(name);
    },
  );
  return skills;
}

export function parseProjects($: CheerioAPI): Project[] {
  const projects: Project[] = [];
  $('section[data-section="projects"] li.personal-project, section[data-section="projects"] li.profile-section-card').each(
    (_, el) => {
      const $el = $(el);
      const name = textOf($el.find("h3").first());
      if (!name) return;
      const projectLink = $el
        .find('h3 a[href], a[href*="/pulse/"], a[href*="project"]')
        .filter((_, a) => {
          const href = attrOf($(a), "href") ?? "";
          return Boolean(href) && !/\/in\//.test(href);
        })
        .first();
      projects.push({
        name,
        description: textOf($el.find(".show-more-less-text__text--less, .show-more-less-text > p").first()) || undefined,
        url: cleanHref(attrOf(projectLink, "href")),
        dates: parseDatesFrom($el),
      });
    },
  );
  return projects;
}

export function parseHonors($: CheerioAPI): Honor[] {
  const honors: Honor[] = [];
  $('section[data-section="honors-and-awards"] li.profile-section-card, [data-section="honors-and-awards"] li.profile-section-card').each(
    (_, el) => {
      const $el = $(el);
      const title = textOf($el.find("h3").first());
      if (!title) return;
      honors.push({
        title,
        issuer: textOf($el.find("h4").first()) || undefined,
        description: textOf($el.find("p").first()) || undefined,
        dates: parseDatesFrom($el),
      });
    },
  );
  return honors;
}

export function parseLanguages($: CheerioAPI): Language[] {
  const languages: Language[] = [];
  $('section[data-section="languages"] li, [data-section="languages"] li.profile-section-card').each(
    (_, el) => {
      const $el = $(el);
      const name = textOf($el.find("h3, h4, .language-item__name").first()) || textOf($el);
      if (!name) return;
      languages.push({
        name,
        proficiency: textOf($el.find(".languages-proficiency, h4, p").last()) || undefined,
      });
    },
  );
  return languages;
}

export function parseVolunteering($: CheerioAPI): Volunteering[] {
  const items: Volunteering[] = [];
  $('section[data-section="volunteering"] li.profile-section-card').each((_, el) => {
    const $el = $(el);
    const role = textOf($el.find("h3").first());
    const organization =
      textOf($el.find("h4").first()) ||
      textOf($el.find('a[href*="/company/"]').first());
    if (!role && !organization) return;
    items.push({
      role: role || undefined,
      organization: organization || undefined,
      organizationUrl: cleanHref(attrOf($el.find('a[href*="/company/"]').first(), "href")),
      description: textOf($el.find("p").first()) || undefined,
      dates: parseDatesFrom($el),
    });
  });
  return items;
}

export function parsePublications($: CheerioAPI): Publication[] {
  const items: Publication[] = [];
  $('section[data-section="publications"] li.profile-section-card, [data-section="publications"] li').each(
    (_, el) => {
      const $el = $(el);
      const title = textOf($el.find("h3").first());
      if (!title) return;
      items.push({
        title,
        publisher: textOf($el.find("h4").first()) || undefined,
        description: textOf($el.find("p").first()) || undefined,
        url: cleanHref(attrOf($el.find("a[href]").first(), "href")),
        dates: parseDatesFrom($el),
      });
    },
  );
  return items;
}

export function parseRecommendations($: CheerioAPI): Recommendation[] {
  const items: Recommendation[] = [];
  $('section[data-section="recommendations"] li, [data-section="recommendations"] .recommendation-card').each(
    (_, el) => {
      const $el = $(el);
      const text =
        textOf($el.find(".show-more-less-text__text--less, p").first()) ||
        textOf($el);
      if (!text || text.length < 10) return;
      items.push({
        text,
        recommenderName: textOf($el.find("h3, .recommendation-card__name").first()) || undefined,
        recommenderTitle: textOf($el.find("h4, .recommendation-card__headline").first()) || undefined,
      });
    },
  );
  return items;
}
