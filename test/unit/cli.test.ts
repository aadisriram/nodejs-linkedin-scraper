import { describe, expect, it } from "vitest";
import { InvalidProfileUrlError, normalizeProfileUrl } from "../../src/index.js";

describe("CLI argv behavior", () => {
  it("rejects missing/invalid URLs the same way the CLI would", () => {
    expect(() => normalizeProfileUrl("https://example.com")).toThrow(
      InvalidProfileUrlError,
    );
  });

  it("accepts a normal profile URL for CLI use", () => {
    expect(normalizeProfileUrl("https://www.linkedin.com/in/williamhgates")).toContain(
      "/in/williamhgates",
    );
  });
});
