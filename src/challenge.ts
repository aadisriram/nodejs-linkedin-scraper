import { AuthChallengeError } from "./errors.js";

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
