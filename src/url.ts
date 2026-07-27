import { InvalidProfileUrlError } from "./errors.js";

const PROFILE_PATH = /^\/in\/([^/?#]+)\/?$/i;

/**
 * Normalize a LinkedIn public profile URL to https://www.linkedin.com/in/{slug}
 * Accepts country subdomains (e.g. uk.linkedin.com) and http schemes.
 */
export function normalizeProfileUrl(input: string): string {
  let raw = input.trim();
  if (!raw) {
    throw new InvalidProfileUrlError("Profile URL is empty");
  }

  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new InvalidProfileUrlError(`Invalid URL: ${input}`);
  }

  const host = url.hostname.toLowerCase();
  if (!host.endsWith("linkedin.com")) {
    throw new InvalidProfileUrlError(`Not a LinkedIn URL: ${input}`);
  }

  const match = url.pathname.match(PROFILE_PATH);
  if (!match) {
    throw new InvalidProfileUrlError(
      `Not a public profile URL (expected /in/{slug}): ${input}`,
    );
  }

  const slug = decodeURIComponent(match[1]).replace(/\/+$/, "");
  if (!slug) {
    throw new InvalidProfileUrlError(`Missing profile slug: ${input}`);
  }

  return `https://www.linkedin.com/in/${encodeURIComponent(slug)}`;
}

export function isLinkedInProfileUrl(input: string): boolean {
  try {
    normalizeProfileUrl(input);
    return true;
  } catch {
    return false;
  }
}
