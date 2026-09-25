#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import scrapeProfile, { LinkedInScraperError } from "../index.js";

export function readPackageVersion(): string {
  const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
  return pkg.version;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "linkedin-scraper",
    version: readPackageVersion(),
  });

  server.tool(
    "get_profile",
    "Fetch a public LinkedIn profile URL and return structured JSON. Only public guest HTML is available; sections vary by profile.",
    {
      url: z
        .string()
        .describe("Public LinkedIn profile URL, e.g. https://www.linkedin.com/in/username"),
    },
    async ({ url }) => {
      try {
        const profile = await scrapeProfile(url);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(profile, null, 2),
            },
          ],
        };
      } catch (err) {
        const message =
          err instanceof LinkedInScraperError
            ? `${err.name}: ${err.message}`
            : (err as Error)?.message ?? String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: message }],
        };
      }
    },
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("linkedin-scraper MCP server running on stdio");
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("mcp/server.js") ||
    process.argv[1].endsWith("mcp/server.ts") ||
    process.argv[1].includes("linkedin-scraper-mcp"));

if (isDirectRun) {
  void main();
}
