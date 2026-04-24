import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("localized routes", () => {
  it("has generated english and spanish pages", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    const es = readFileSync(".output/public/es/index.html", "utf-8");
    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBeGreaterThan(0);
  });

  it("root is english content (no /en prefix)", () => {
    const root = readFileSync(".output/public/index.html", "utf-8");
    expect(root).toContain("One System to Run Your Entire Operation");
  });
});
