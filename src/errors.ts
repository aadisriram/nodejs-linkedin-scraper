export class LinkedInScraperError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);
    this.name = "LinkedInScraperError";
    this.code = code;
    this.cause = cause;
  }
}

export class InvalidProfileUrlError extends LinkedInScraperError {
  constructor(message: string) {
    super(message, "INVALID_URL");
    this.name = "InvalidProfileUrlError";
  }
}

export class ProfileNotFoundError extends LinkedInScraperError {
  constructor(message = "LinkedIn profile not found") {
    super(message, "NOT_FOUND");
    this.name = "ProfileNotFoundError";
  }
}

export class RateLimitedError extends LinkedInScraperError {
  constructor(message = "LinkedIn rate-limited or blocked this request (HTTP 999)") {
    super(message, "RATE_LIMITED");
    this.name = "RateLimitedError";
  }
}

export class AuthChallengeError extends LinkedInScraperError {
  constructor(message = "LinkedIn returned an auth/challenge wall instead of a public profile") {
    super(message, "AUTH_CHALLENGE");
    this.name = "AuthChallengeError";
  }
}

export class FetchError extends LinkedInScraperError {
  constructor(message: string, cause?: unknown) {
    super(message, "FETCH_ERROR", cause);
    this.name = "FetchError";
  }
}

export class ParseError extends LinkedInScraperError {
  constructor(message: string, cause?: unknown) {
    super(message, "PARSE_ERROR", cause);
    this.name = "ParseError";
  }
}

export function errorFromHttpStatus(status: number): LinkedInScraperError {
  if (status === 404) {
    return new ProfileNotFoundError(`LinkedIn profile not found (HTTP ${status})`);
  }
  if (status === 999 || status === 429) {
    return new RateLimitedError(`LinkedIn rate-limited or blocked this request (HTTP ${status})`);
  }
  if (status === 401 || status === 403) {
    return new AuthChallengeError(`LinkedIn denied access (HTTP ${status})`);
  }
  return new FetchError(`Unexpected LinkedIn HTTP status ${status}`);
}
