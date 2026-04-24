import { describe, expect, it } from "vitest";
import enHome from "../../content/en/home.json";
import { getHomeContent } from "../../app/composables/useHomeContent";
import { HomeContentSchema } from "../../app/types/home";

describe("home content", () => {
  it("returns english home content", async () => {
    const data = await getHomeContent("en");
    expect(data.hero.title.length).toBeGreaterThan(0);
    expect(data.flow.workflow.triggerForm.title.length).toBeGreaterThan(0);
    expect(data.flow.workflow.contactsTable.length).toBeGreaterThanOrEqual(4);
    expect(data.flow.workflow.nodes.length).toBeGreaterThanOrEqual(6);
  });

  it("returns spanish home content", async () => {
    const data = await getHomeContent("es");
    expect(data.hero.title.length).toBeGreaterThan(0);
    expect(data.flow.workflow.edges.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects content when workflow is missing", () => {
    const invalid: any = structuredClone(enHome);
    delete invalid.flow.workflow;

    const parsed = HomeContentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects content when workflow has unknown edge nodes", () => {
    const invalid: any = structuredClone(enHome);
    invalid.flow.workflow.edges[0].to = "ghost-node";

    const parsed = HomeContentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects content when workflow sequence references unknown edge", () => {
    const invalid: any = structuredClone(enHome);
    invalid.flow.workflow.sequence[1] = "edge:ghost->edge";

    const parsed = HomeContentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects content when triggerForm fields are incomplete", () => {
    const invalid: any = structuredClone(enHome);
    delete invalid.flow.workflow.triggerForm.fields.email;

    const parsed = HomeContentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects content when contactsTable is empty", () => {
    const invalid: any = structuredClone(enHome);
    invalid.flow.workflow.contactsTable = [];

    const parsed = HomeContentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
