import { ProxyAgent, fetch as undiciFetch } from "undici";
import {
  AuthChallengeError,
  FetchError,
  ProfileNotFoundError,
  RateLimitedError,
  errorFromHttpStatus,
} from "./errors.js";
import {
  DEFAULT_ACCEPT_LANGUAGE,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_USER_AGENT,
  type ScrapeOptions,
} from "./types.js";

export interface FetchResult {
  url: string;
  status: number;
  html: string;
}

function resolveProxyUrl(options: ScrapeOptions): string | undefined {
  return options.proxyUrl || process.env.PROXY_HOST || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
}

export async function fetchProfileHtml(
  url: string,
  options: ScrapeOptions = {},
): Promise<FetchResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const acceptLanguage = options.acceptLanguage ?? DEFAULT_ACCEPT_LANGUAGE;
  const proxyUrl = resolveProxyUrl(options);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": acceptLanguage,
    "User-Agent": userAgent,
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };

  try {
    let response: Response;

    if (options.fetchImpl) {
      response = await options.fetchImpl(url, {
        method: "GET",
        headers,
        redirect: "follow",
        signal: controller.signal,
      });
    } else if (proxyUrl) {
      const dispatcher = new ProxyAgent(proxyUrl);
      response = (await undiciFetch(url, {
        method: "GET",
        headers,
        redirect: "follow",
        signal: controller.signal,
        dispatcher,
      })) as unknown as Response;
    } else {
      response = await fetch(url, {
        method: "GET",
        headers,
        redirect: "follow",
        signal: controller.signal,
      });
    }

    const html = await response.text();

    if (!response.ok) {
      throw errorFromHttpStatus(response.status);
    }

    assertNotChallengePage(html);

    return {
      url: response.url || url,
      status: response.status,
      html,
    };
  } catch (err) {
    if (
      err instanceof AuthChallengeError ||
      err instanceof RateLimitedError ||
      err instanceof ProfileNotFoundError ||
      err instanceof FetchError ||
      (err as { code?: string })?.code === "RATE_LIMITED" ||
      (err as { code?: string })?.code === "NOT_FOUND" ||
      (err as { code?: string })?.code === "AUTH_CHALLENGE" ||
      (err as { code?: string })?.code === "FETCH_ERROR"
    ) {
      throw err;
    }

    if ((err as Error)?.name === "AbortError") {
      throw new FetchError(`Request timed out after ${timeoutMs}ms`, err);
    }

    throw new FetchError(
      `Failed to fetch LinkedIn profile: ${(err as Error)?.message ?? String(err)}`,
      err,
    );
  } finally {
    clearTimeout(timer);
  }
}

export function assertNotChallengePage(html: string): void {
  const lower = html.toLowerCase();
  const looksLikeChallenge =
    lower.includes("authwall") ||
    lower.includes('name="pagekey" content="auth_wall') ||
    lower.includes("challenge-form") ||
    (lower.includes("security challenge") && !lower.includes("public_profile"));

  const hasPublicMarker =
    lower.includes("public_profile") ||
    lower.includes("top-card-layout__title") ||
    lower.includes('property="og:type" content="profile"');

  if (looksLikeChallenge && !hasPublicMarker) {
    throw new AuthChallengeError();
  }
}
