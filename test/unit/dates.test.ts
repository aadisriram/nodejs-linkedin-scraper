import { describe, expect, it } from "vitest";
import { parseDateRange } from "../../src/dates.js";

describe("parseDateRange", () => {
  it("parses year to Present", () => {
    const range = parseDateRange("2000 - Present");
    expect(range?.start).toBe("2000-01-01T00:00:00.000Z");
    expect(range?.current).toBe(true);
    expect(range?.end).toBeUndefined();
  });

  it("parses month year ranges with en-dash", () => {
    const range = parseDateRange("Apr 1995 – May 2000");
    expect(range?.start).toMatch(/^1995-04/);
    expect(range?.end).toMatch(/^2000-05/);
    expect(range?.current).toBeUndefined();
  });

  it("strips duration suffixes", () => {
    const range = parseDateRange("Feb 2014 - Present 12 years 6 months");
    expect(range?.start).toMatch(/^2014-02/);
    expect(range?.current).toBe(true);
  });

  it("returns undefined for empty input", () => {
    expect(parseDateRange("")).toBeUndefined();
    expect(parseDateRange(null)).toBeUndefined();
  });

  it("handles invalid dates without throwing", () => {
    const range = parseDateRange("Totally Invalid - Also Bad");
    expect(range?.raw).toContain("Totally Invalid");
    expect(range?.start).toBeUndefined();
    expect(range?.end).toBeUndefined();
  });
});
