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

/** Process exit codes for the CLI. `0` is success. `1` is usage or an unknown failure. */
export const EXIT_CODES = {
  OK: 0,
  USAGE: 1,
  INVALID_URL: 2,
  NOT_FOUND: 3,
  RATE_LIMITED: 4,
  AUTH_CHALLENGE: 5,
  FETCH_ERROR: 6,
  PARSE_ERROR: 7,
} as const;

const EXIT_CODE_BY_ERROR: Record<string, number> = {
  INVALID_URL: EXIT_CODES.INVALID_URL,
  NOT_FOUND: EXIT_CODES.NOT_FOUND,
  RATE_LIMITED: EXIT_CODES.RATE_LIMITED,
  AUTH_CHALLENGE: EXIT_CODES.AUTH_CHALLENGE,
  FETCH_ERROR: EXIT_CODES.FETCH_ERROR,
  PARSE_ERROR: EXIT_CODES.PARSE_ERROR,
};

export function exitCodeForError(err: unknown): number {
  if (err instanceof LinkedInScraperError) {
    return EXIT_CODE_BY_ERROR[err.code] ?? EXIT_CODES.USAGE;
  }
  return EXIT_CODES.USAGE;
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
