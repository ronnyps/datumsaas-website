import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";

describe("deploy artifacts", () => {
  it("creates static output directory for apache upload", () => {
    expect(existsSync(".output/public")).toBe(true);
  });
});
