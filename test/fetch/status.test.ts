import { describe, expect, it, vi } from "vitest";
import {
  AuthChallengeError,
  ProfileNotFoundError,
  RateLimitedError,
} from "../../src/errors.js";
import { fetchProfileHtml } from "../../src/fetch.js";

describe("fetchProfileHtml status handling", () => {
  it("maps HTTP 999 to RateLimitedError", async () => {
    const fetchImpl = vi.fn(async () => {
      return {
        ok: false,
        status: 999,
        url: "https://www.linkedin.com/in/x",
        text: async () => "",
      } as unknown as Response;
    });
    await expect(
      fetchProfileHtml("https://www.linkedin.com/in/x", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toBeInstanceOf(RateLimitedError);
  });

  it("maps HTTP 404 to ProfileNotFoundError", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("missing", { status: 404 }),
    );
    await expect(
      fetchProfileHtml("https://www.linkedin.com/in/x", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toBeInstanceOf(ProfileNotFoundError);
  });

  it("maps authwall body to AuthChallengeError", async () => {
    const html = `<html><body><div class="authwall"><form class="challenge-form">Security challenge</form></div></body></html>`;
    const fetchImpl = vi.fn(
      async () => new Response(html, { status: 200 }),
    );
    await expect(
      fetchProfileHtml("https://www.linkedin.com/in/x", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toBeInstanceOf(AuthChallengeError);
  });

  it("wraps network failures", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });
    await expect(
      fetchProfileHtml("https://www.linkedin.com/in/x", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "FETCH_ERROR" });
  });
});
