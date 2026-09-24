import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const cliPath = join(repoRoot, "dist/cli.js");

function runCli(args: string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

describe("CLI binary", () => {
  beforeAll(() => {
    execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], {
      cwd: repoRoot,
      stdio: "inherit",
    });
  }, 120_000);

  it("prints help and exits 0", () => {
    const result = runCli(["--help"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--html");
    expect(result.stdout).toContain("429");
    expect(result.stdout).toContain("999");
  });

  it("exits 2 for an invalid URL", () => {
    const result = runCli(["https://example.com/in/someone"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("InvalidProfileUrlError");
  });

  it("parses a local fixture file", () => {
    const result = runCli([
      "--html",
      "test/fixtures/williamhgates.html",
      "--url",
      "https://www.linkedin.com/in/williamhgates",
    ]);
    expect(result.status, result.stderr).toBe(0);
    const profile = JSON.parse(result.stdout) as {
      name?: string;
      schemaVersion?: number;
      positions?: Array<{ title?: string; dates?: { start?: string } }>;
    };
    expect(profile.name).toBe("Bill Gates");
    expect(profile.schemaVersion).toBe(1);
    expect(profile.positions?.[0]?.title).toBe("Co-chair");
    expect(profile.positions?.[0]?.dates?.start).toBe("2000");
  });

  it("exits 5 for auth-wall HTML", () => {
    const result = runCli([
      "--html",
      "test/fixtures/auth-challenge.html",
      "--url",
      "https://www.linkedin.com/in/someone",
    ]);
    expect(result.status).toBe(5);
    expect(result.stderr).toContain("AuthChallengeError");
  });

  it("passes timeout and an explicit proxy through to fetch and fails closed", () => {
    const result = runCli([
      "--url",
      "https://www.linkedin.com/in/williamhgates",
      "--timeout",
      "2000",
      "--proxy",
      "http://127.0.0.1:9",
    ]);
    expect(result.status).toBe(6);
    expect(result.stderr).toContain("FetchError");
  }, 20_000);
});
