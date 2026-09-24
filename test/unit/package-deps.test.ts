import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../..", "package.json"), "utf8"),
) as {
  dependencies: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

describe("package dependencies", () => {
  it("keeps the MCP SDK and zod out of the default dependency set", () => {
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["cheerio", "undici"]);
    expect(pkg.optionalDependencies?.["@modelcontextprotocol/sdk"]).toBeTruthy();
    expect(pkg.optionalDependencies?.zod).toBeTruthy();
    expect(pkg.dependencies["@modelcontextprotocol/sdk"]).toBeUndefined();
    expect(pkg.dependencies.zod).toBeUndefined();
  });
});
