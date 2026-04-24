import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("home aida structure", () => {
  it("renders v2 homepage structure markers", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain('data-aida="attention"');
    expect(en).toContain('data-aida="problem"');
    expect(en).toContain('data-aida="flow"');
    expect(en).toContain('data-aida="capabilities"');
    expect(en).toContain('data-aida="hierarchy"');
    expect(en).toContain('data-aida="demo-process"');
    expect(en).toContain('data-aida="action"');
    expect(en).toContain('data-flow="workflow-canvas"');
  });

  it("renders wide hero and dual cta structure", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain("hero__title hero__title--wide");
    expect(en).toContain('data-cta="primary"');
    expect(en).toContain('data-cta="secondary"');
  });

  it("renders dense bento interest grid", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain("services__bento");
    expect(en).toContain("grid-flow-dense");
  });

  it("renders hierarchy and role value markers", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain('data-aida="hierarchy"');
    expect(en).toContain('data-motion="desire-panel"');
    expect(en).toContain('data-aida="role-value"');
  });

  it("renders action cta with trust line markers", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain('data-cta="action-primary"');
    expect(en).toContain("cta__micro-trust");
  });
});
