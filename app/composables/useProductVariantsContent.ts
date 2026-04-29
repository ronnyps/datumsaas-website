import type { ProductVariantsContent } from "~/types/product-variants";

type LocaleCode = "en" | "es";

const loaders: Record<LocaleCode, () => Promise<{ default: unknown }>> = {
  en: () => import("../../content/en/product-variants.json"),
  es: () => import("../../content/es/product-variants.json"),
};

const cache = new Map<LocaleCode, ProductVariantsContent>();

export async function getProductVariantsContent(locale: LocaleCode): Promise<ProductVariantsContent> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const module = await loaders[locale]();
  const data = module.default as ProductVariantsContent;
  cache.set(locale, data);
  return data;
}
