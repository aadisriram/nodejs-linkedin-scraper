import type { DateRange } from "./types.js";

/**
 * Parse LinkedIn public date strings such as:
 * - "2000 - Present"
 * - "Apr 1995 – May 2000" (en-dash or hyphen)
 * - "1973 - 1975"
 */
export function parseDateRange(raw?: string | null): DateRange | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;

  // Drop duration suffixes like "26 years" after the range when callers pass full meta text
  const withoutDuration = cleaned.replace(/\s+\d+\s+(year|years|mo|mos|month|months).*$/i, "").trim();

  const parts = withoutDuration.split(/\s*[–—-]\s*/);
  const startRaw = parts[0]?.trim();
  const endRaw = parts[1]?.trim();

  const current = Boolean(endRaw && /present/i.test(endRaw));
  const start = toIsoDate(startRaw);
  const end = current ? undefined : toIsoDate(endRaw);

  return {
    start,
    end,
    current: current || undefined,
    raw: cleaned,
  };
}

function toIsoDate(value?: string): string | undefined {
  if (!value || /present/i.test(value)) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Year only
  if (/^\d{4}$/.test(trimmed)) {
    return new Date(Date.UTC(Number(trimmed), 0, 1)).toISOString();
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString();
}
