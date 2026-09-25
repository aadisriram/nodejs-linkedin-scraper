import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer, readPackageVersion } from "../../src/mcp/server.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");
const packageVersion = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../..", "package.json"), "utf8"),
) as { version: string };

async function callGetProfile(url: string) {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "linkedin-scraper-test", version: "0.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const version = client.getServerVersion()?.version;
    const result = await client.callTool({
      name: "get_profile",
      arguments: { url },
    });
    return { version, result };
  } finally {
    await client.close();
    await server.close();
  }
}

describe("MCP get_profile tool", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the server version from package.json", () => {
    expect(readPackageVersion()).toBe(packageVersion.version);
  });

  it("invokes get_profile against fixture HTML", async () => {
    const html = readFileSync(join(fixturesDir, "williamhgates.html"), "utf8");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(html, { status: 200 })),
    );

    const { version, result } = await callGetProfile(
      "https://www.linkedin.com/in/williamhgates",
    );
    expect(version).toBe(packageVersion.version);
    expect(result.isError).toBeFalsy();
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    const profile = JSON.parse(text) as { name?: string; schemaVersion?: number };
    expect(profile.name).toBe("Bill Gates");
    expect(profile.schemaVersion).toBe(1);
  });

  it("returns the error path when fetch is rate limited", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("slow down", { status: 429 })),
    );

    const { result } = await callGetProfile("https://www.linkedin.com/in/williamhgates");
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(text).toContain("RateLimitedError");
  });
});
