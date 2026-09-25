import { describe, expect, it } from "vitest";
import {
  AuthChallengeError,
  EXIT_CODES,
  FetchError,
  InvalidProfileUrlError,
  ParseError,
  ProfileNotFoundError,
  RateLimitedError,
  errorFromHttpStatus,
  exitCodeForError,
} from "../../src/errors.js";

describe("errorFromHttpStatus", () => {
  it("maps 404 to ProfileNotFoundError", () => {
    expect(errorFromHttpStatus(404)).toBeInstanceOf(ProfileNotFoundError);
  });

  it("maps 999 and 429 to RateLimitedError", () => {
    expect(errorFromHttpStatus(999)).toBeInstanceOf(RateLimitedError);
    expect(errorFromHttpStatus(429)).toBeInstanceOf(RateLimitedError);
  });

  it("maps 401/403 to AuthChallengeError", () => {
    expect(errorFromHttpStatus(401)).toBeInstanceOf(AuthChallengeError);
    expect(errorFromHttpStatus(403)).toBeInstanceOf(AuthChallengeError);
  });

  it("maps other statuses to FetchError code", () => {
    const err = errorFromHttpStatus(500);
    expect(err.code).toBe("FETCH_ERROR");
  });
});

describe("exitCodeForError", () => {
  it("uses a distinct exit code for each error code", () => {
    const cases = [
      [new InvalidProfileUrlError("bad"), EXIT_CODES.INVALID_URL],
      [new ProfileNotFoundError(), EXIT_CODES.NOT_FOUND],
      [new RateLimitedError(), EXIT_CODES.RATE_LIMITED],
      [new AuthChallengeError(), EXIT_CODES.AUTH_CHALLENGE],
      [new FetchError("network"), EXIT_CODES.FETCH_ERROR],
      [new ParseError("html"), EXIT_CODES.PARSE_ERROR],
    ] as const;
    const codes = cases.map(([, code]) => code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const [err, code] of cases) {
      expect(exitCodeForError(err)).toBe(code);
    }
    expect(exitCodeForError(new Error("other"))).toBe(EXIT_CODES.USAGE);
  });
});
