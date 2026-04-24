import { HomeContentSchema, type HomeContent } from "../types/home";

type LocaleCode = "en" | "es";

const localeLoaders: Record<LocaleCode, () => Promise<{ default: unknown }>> = {
  en: () => import("../../content/en/home.json"),
  es: () => import("../../content/es/home.json")
};
const contentCache = new Map<LocaleCode, HomeContent>();

export async function getHomeContent(locale: LocaleCode): Promise<HomeContent> {
  const cached = contentCache.get(locale);
  if (cached) return cached;

  const module = await localeLoaders[locale]();
  const parsed = HomeContentSchema.parse(module.default);
  contentCache.set(locale, parsed);
  return parsed;
}
