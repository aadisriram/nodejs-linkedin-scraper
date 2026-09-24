import type { DateRange } from "./types.js";

const MONTHS: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

/**
 * Parse LinkedIn public date strings such as:
 * - "2000 - Present"
 * - "Apr 1995 – May 2000" (en-dash or hyphen)
 * - "1973 - 1975"
 *
 * `start` and `end` are calendar dates (`YYYY` or `YYYY-MM`), not instants.
 * Month names are mapped directly so the result does not depend on the machine timezone.
 */
export function parseDateRange(raw?: string | null): DateRange | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;

  const withoutDuration = cleaned
    .replace(/\s+\d+\s+(year|years|mo|mos|month|months).*$/i, "")
    .trim();

  const parts = withoutDuration.split(/\s*[–—-]\s*/);
  const startRaw = parts[0]?.trim();
  const endRaw = parts[1]?.trim();

  const current = Boolean(endRaw && /present/i.test(endRaw));
  const start = toCalendarDate(startRaw);
  const end = current ? undefined : toCalendarDate(endRaw);

  return {
    start,
    end,
    current: current || undefined,
    raw: cleaned,
  };
}

function toCalendarDate(value?: string): string | undefined {
  if (!value || /present/i.test(value)) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^\d{4}$/.test(trimmed)) return trimmed;

  const match =
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})$/i.exec(
      trimmed,
    );
  if (!match) return undefined;
  const month = MONTHS[match[1].slice(0, 3).toLowerCase()];
  return `${match[2]}-${month}`;
}
