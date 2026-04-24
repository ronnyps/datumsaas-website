import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("static output smoke", () => {
  it("expects localized entry points to exist after generate", () => {
    expect(existsSync(".output/public/index.html")).toBe(true);
    expect(existsSync(".output/public/es/index.html")).toBe(true);
  });

  it("keeps overflow guard on home root", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain("overflow-x-hidden");
  });

  it("includes gsap dependency metadata in package json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as {
      dependencies?: Record<string, string>;
    };

    expect(pkg.dependencies?.gsap).toBeTruthy();
  });
});
