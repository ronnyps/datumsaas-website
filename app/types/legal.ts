import { z } from "zod";

const LegalSectionSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const LegalEntrySchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  updatedAt: z.string().min(1),
  sections: z.array(LegalSectionSchema).min(1),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const LegalContentSchema = z.object({
  terms: LegalEntrySchema,
  privacy: LegalEntrySchema,
});

export type LegalContent = z.infer<typeof LegalContentSchema>;
export type LegalPageKind = keyof LegalContent;
