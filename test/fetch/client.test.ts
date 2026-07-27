import { describe, expect, it, vi } from "vitest";
import { fetchProfileHtml } from "../../src/fetch.js";
import { DEFAULT_USER_AGENT } from "../../src/types.js";

describe("fetchProfileHtml client", () => {
  it("sends browser-like User-Agent and Accept-Language", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        `<html><head><meta name="pageKey" content="public_profile_v3_desktop"><meta property="og:type" content="profile"></head><body><h1 class="top-card-layout__title">Test</h1></body></html>`,
        { status: 200, headers: { "content-type": "text/html" } },
      );
    });

    await fetchProfileHtml("https://www.linkedin.com/in/test", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["User-Agent"]).toBe(DEFAULT_USER_AGENT);
    expect(headers["Accept-Language"]).toContain("en-US");
  });

  it("honors custom timeout by aborting", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      await new Promise<void>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
          return;
        }
        signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        });
      });
      return new Response("never");
    });

    await expect(
      fetchProfileHtml("https://www.linkedin.com/in/test", {
        timeoutMs: 20,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "FETCH_ERROR" });
  });
});
