import { z } from "zod";

const TitleDescriptionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  videoSrc: z.string().min(1).optional(),
  videoPoster: z.string().min(1).optional()
});

const SectionTitleDescriptionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1)
});

const CardSectionSchema = SectionTitleDescriptionSchema.extend({
  items: z.array(TitleDescriptionItemSchema).min(3)
});

const WorkflowNodeSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  type: z.enum(["trigger", "system", "entity", "action", "output"]),
  label: z.string().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  xMobile: z.number().min(0).max(100).optional(),
  yMobile: z.number().min(0).max(100).optional(),
  variant: z.string().min(1).optional()
});

const WorkflowEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  style: z.enum(["solid", "dotted"]),
  accent: z.boolean().optional(),
  animated: z.boolean().optional()
});

const WorkflowContactRecordSchema = z.object({
  companyName: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  productService: z.string().min(1)
});

const WorkflowSchema = z.object({
  triggerForm: z.object({
    title: z.string().min(1),
    fields: z.object({
      companyName: z.string().min(1),
      fullName: z.string().min(1),
      email: z.string().min(1),
      phoneNumber: z.string().min(1)
    }),
    productOptions: z.array(z.string().min(1)).min(2),
    submitLabel: z.string().min(1)
  }),
  contactsTable: z.array(WorkflowContactRecordSchema).min(4),
  nodes: z.array(WorkflowNodeSchema).min(6),
  edges: z.array(WorkflowEdgeSchema).min(6),
  sequence: z.array(z.string().regex(/^(node|edge):.+$/)).min(6),
  mobileVisibleNodeIds: z.array(z.string().min(1)).min(4)
}).superRefine((workflow, ctx) => {
  const nodeIds = new Set<string>();

  for (const [index, node] of workflow.nodes.entries()) {
    if (nodeIds.has(node.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate node id: ${node.id}`,
        path: ["nodes", index, "id"]
      });
      continue;
    }

    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  for (const [index, edge] of workflow.edges.entries()) {
    for (const endpoint of ["from", "to"] as const) {
      const id = edge[endpoint];
      if (!nodeIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown workflow node reference: ${id}`,
          path: ["edges", index, endpoint]
        });
      }
    }
    edgeIds.add(`${edge.from}->${edge.to}`);
  }

  for (const [index, nodeId] of workflow.mobileVisibleNodeIds.entries()) {
    if (!nodeIds.has(nodeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown mobileVisibleNodeId: ${nodeId}`,
        path: ["mobileVisibleNodeIds", index]
      });
    }
  }

  for (const [index, item] of workflow.sequence.entries()) {
    const [kind, id] = item.split(":");
    if (kind === "node" && !nodeIds.has(id ?? "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown workflow sequence node: ${id}`,
        path: ["sequence", index]
      });
    }
    if (kind === "edge" && !edgeIds.has(id ?? "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown workflow sequence edge: ${id}`,
        path: ["sequence", index]
      });
    }
  }
});

const InventoryVariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  imageLabel: z.string().min(1)
});

const InventoryProductSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: z.string().min(1),
  baseSku: z.string().min(1),
  warehouse: z.string().min(1),
  reorderPoint: z.number().int().min(1),
  variants: z.array(InventoryVariantSchema).min(2)
});

export const HomeContentSchema = z.object({
  hero: z.object({
    announce: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1),
    secondaryCtaLabel: z.string().min(1),
    secondaryCtaHref: z.string().min(1),
    microTrust: z.string().min(1).optional()
  }),
  bridge: z.object({
    introTitle: z.string().min(1),
    introDescription: z.string().min(1),
    items: z.array(TitleDescriptionItemSchema).min(3)
  }),
  problem: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(3)
  }),
  flow: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    steps: z.array(z.string().min(1)).min(5),
    workflow: WorkflowSchema
  }),
  services: z.object({
    title: z.string().min(1),
    modulesTitle: z.string().min(1).optional(),
    items: z
      .array(
        z.object({
          label: z.string().min(1),
          title: TitleDescriptionItemSchema.shape.title,
          description: TitleDescriptionItemSchema.shape.description
        })
      )
      .min(2),
    inventoryProducts: z
      .array(InventoryProductSchema)
      .min(3),
    modules: z
      .array(
        z.object({
          label: z.string().min(1),
          title: TitleDescriptionItemSchema.shape.title,
          description: TitleDescriptionItemSchema.shape.description,
          chip: z.string().min(1)
        })
      )
      .min(5)
  }),
  whyUs: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    points: z.array(z.string().min(1)).min(3),
    roles: z.array(
      z.object({
        role: z.string().min(1),
        value: z.string().min(1)
      })
    ).min(3)
  }),
  proof: CardSectionSchema,
  support: CardSectionSchema,
  confidence: CardSectionSchema,
  demoProcess: z.object({
    title: z.string().min(1),
    steps: z.array(z.string().min(1)).min(3),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1)
  }),
  faq: SectionTitleDescriptionSchema.extend({
    items: z.array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1)
      })
    ).min(4)
  }),
  cta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    buttonLabel: z.string().min(1),
    buttonHref: z.string().min(1),
    secondaryButtonLabel: z.string().min(1),
    microTrust: z.string().min(1).optional()
  }),
  footer: z.object({
    copyright: z.string().min(1)
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1)
  })
});

export type HomeContent = z.infer<typeof HomeContentSchema>;
