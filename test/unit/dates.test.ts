import { describe, expect, it } from "vitest";
import { parseDateRange } from "../../src/dates.js";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

describe("parseDateRange", () => {
  it("parses year to Present as a calendar year", () => {
    const range = parseDateRange("2000 - Present");
    expect(range?.start).toBe("2000");
    expect(range?.current).toBe(true);
    expect(range?.end).toBeUndefined();
    expect(range?.raw).toBe("2000 - Present");
  });

  it("parses month year ranges with en-dash as YYYY-MM", () => {
    const range = parseDateRange("Apr 1995 – May 2000");
    expect(range?.start).toBe("1995-04");
    expect(range?.end).toBe("2000-05");
    expect(range?.current).toBeUndefined();
    expect(range?.raw).toContain("Apr 1995");
  });

  it("strips duration suffixes", () => {
    const range = parseDateRange("Feb 2014 - Present 12 years 6 months");
    expect(range?.start).toBe("2014-02");
    expect(range?.current).toBe(true);
    expect(range?.end).toBeUndefined();
    expect(range?.raw).toContain("12 years");
  });

  it("returns undefined for empty input", () => {
    expect(parseDateRange("")).toBeUndefined();
    expect(parseDateRange(null)).toBeUndefined();
  });

  it("handles invalid dates without throwing", () => {
    const range = parseDateRange("Totally Invalid - Also Bad");
    expect(range?.raw).toContain("Totally Invalid");
    expect(range?.start).toBeUndefined();
    expect(range?.end).toBeUndefined();
  });

  it("keeps April 1995 in April when the process timezone is east of UTC", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../src/dates.ts", import.meta.url)),
      "utf8",
    );
    const js = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const dir = mkdtempSync(join(tmpdir(), "dates-tz-"));
    try {
      writeFileSync(join(dir, "package.json"), '{"type":"module"}\n');
      writeFileSync(join(dir, "dates.js"), js);
      writeFileSync(
        join(dir, "run.js"),
        `
        import { parseDateRange } from "./dates.js";
        const range = parseDateRange("Apr 1995 – May 2000");
        const year = parseDateRange("2000 - Present");
        if (range?.start !== "1995-04" || range?.end !== "2000-05") {
          console.error("shifted", JSON.stringify(range));
          process.exit(1);
        }
        if (year?.start !== "2000" || year?.current !== true) {
          console.error("year", JSON.stringify(year));
          process.exit(1);
        }
        `,
      );
      const result = spawnSync(process.execPath, ["run.js"], {
        cwd: dir,
        env: { ...process.env, TZ: "Asia/Tokyo" },
        encoding: "utf8",
      });
      expect(result.status, result.stderr || result.stdout).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
