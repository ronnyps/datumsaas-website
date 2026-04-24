import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("seo output", () => {
  it("contains localized metadata and alternates", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain("DatumSaas");
    expect(en).toContain("hreflang");
    expect(en).toContain("og:title");
  });
});
