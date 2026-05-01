import { LegalContentSchema, type LegalContent, type LegalPageKind } from "../types/legal";

type LocaleCode = "en" | "es";

const localeLoaders: Record<LocaleCode, () => Promise<{ default: unknown }>> = {
  en: () => import("../../content/en/legal.json"),
  es: () => import("../../content/es/legal.json"),
};

const legalContentCache = new Map<LocaleCode, LegalContent>();

export async function getLegalContent(locale: LocaleCode): Promise<LegalContent> {
  const cached = legalContentCache.get(locale);
  if (cached) return cached;

  const module = await localeLoaders[locale]();
  const parsed = LegalContentSchema.parse(module.default);
  legalContentCache.set(locale, parsed);
  return parsed;
}

export async function getLegalPageContent(locale: LocaleCode, page: LegalPageKind) {
  const content = await getLegalContent(locale);
  return content[page];
}
