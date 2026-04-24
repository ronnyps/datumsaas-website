type LocalizedSeoInput = {
  locale: "en" | "es";
  path: "/" | "/es";
  title: string;
  description: string;
};

export function useLocalizedSeo(input: LocalizedSeoInput) {
  const siteUrl = "https://www.datumsaas.com";
  const canonical = `${siteUrl}${input.path}`;
  const enAlt = `${siteUrl}/`;
  const esAlt = `${siteUrl}/es`;

  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description,
    ogUrl: canonical,
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: input.title,
    twitterDescription: input.description
  });

  useHead({
    htmlAttrs: { lang: input.locale },
    link: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hreflang: "en", href: enAlt },
      { rel: "alternate", hreflang: "es", href: esAlt },
      { rel: "alternate", hreflang: "x-default", href: enAlt }
    ]
  });
}
