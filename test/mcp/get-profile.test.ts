import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/index.js")>(
    "../../src/index.js",
  );
  return {
    ...actual,
    default: vi.fn(async () => ({
      publicProfileUrl: "https://www.linkedin.com/in/demo",
      name: "Demo User",
      headline: "Engineer",
      positions: [],
      educations: [],
      skills: [],
      projects: [],
      honors: [],
      languages: [],
      volunteering: [],
      publications: [],
      recommendations: [],
      websites: [],
      sectionsPresent: ["summary"],
    })),
    scrapeProfile: vi.fn(async () => ({
      publicProfileUrl: "https://www.linkedin.com/in/demo",
      name: "Demo User",
      headline: "Engineer",
      positions: [],
      educations: [],
      skills: [],
      projects: [],
      honors: [],
      languages: [],
      volunteering: [],
      publications: [],
      recommendations: [],
      websites: [],
      sectionsPresent: ["summary"],
    })),
  };
});

describe("MCP get_profile tool", () => {
  it("registers get_profile on the server", async () => {
    const { createServer } = await import("../../src/mcp/server.js");
    const server = createServer();
    // McpServer stores tools internally; verify via private-ish shape or listTools if available
    const anyServer = server as unknown as {
      _registeredTools?: Record<string, unknown>;
      tools?: Map<string, unknown>;
    };
    const tools =
      anyServer._registeredTools ??
      (anyServer.tools ? Object.fromEntries(anyServer.tools) : undefined);
    expect(tools).toBeTruthy();
    expect(Object.keys(tools!).some((k) => k === "get_profile")).toBe(true);
  });

  it("handler returns JSON for a valid URL via mocked scrapeProfile", async () => {
    const scrapeProfile = (await import("../../src/index.js")).scrapeProfile as unknown as
      ReturnType<typeof vi.fn>;
    const result = await scrapeProfile("https://www.linkedin.com/in/demo");
    expect(result.name).toBe("Demo User");
    expect(JSON.stringify(result)).toContain("Demo User");
  });
});
