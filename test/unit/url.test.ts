import { describe, expect, it } from "vitest";
import { InvalidProfileUrlError } from "../../src/errors.js";
import { isLinkedInProfileUrl, normalizeProfileUrl } from "../../src/url.js";

describe("normalizeProfileUrl", () => {
  it("normalizes www profile URLs", () => {
    expect(normalizeProfileUrl("https://www.linkedin.com/in/williamhgates")).toBe(
      "https://www.linkedin.com/in/williamhgates",
    );
  });

  it("adds https and maps country subdomains to www", () => {
    expect(normalizeProfileUrl("uk.linkedin.com/in/jane-doe/")).toBe(
      "https://www.linkedin.com/in/jane-doe",
    );
  });

  it("accepts http scheme", () => {
    expect(normalizeProfileUrl("http://linkedin.com/in/foo")).toBe(
      "https://www.linkedin.com/in/foo",
    );
  });

  it("rejects empty input", () => {
    expect(() => normalizeProfileUrl("")).toThrow(InvalidProfileUrlError);
  });

  it("rejects non-LinkedIn hosts", () => {
    expect(() => normalizeProfileUrl("https://example.com/in/foo")).toThrow(
      InvalidProfileUrlError,
    );
  });

  it("rejects company URLs", () => {
    expect(() =>
      normalizeProfileUrl("https://www.linkedin.com/company/microsoft"),
    ).toThrow(InvalidProfileUrlError);
  });

  it("rejects malformed URLs", () => {
    expect(() => normalizeProfileUrl("not a url")).toThrow(InvalidProfileUrlError);
  });
});

describe("isLinkedInProfileUrl", () => {
  it("returns true for profiles and false otherwise", () => {
    expect(isLinkedInProfileUrl("https://www.linkedin.com/in/x")).toBe(true);
    expect(isLinkedInProfileUrl("https://www.linkedin.com/company/x")).toBe(false);
  });
});
