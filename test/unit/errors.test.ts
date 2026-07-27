import { describe, expect, it } from "vitest";
import {
  AuthChallengeError,
  ProfileNotFoundError,
  RateLimitedError,
  errorFromHttpStatus,
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
