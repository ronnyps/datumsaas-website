type LocalizedSeoInput = {
  locale: "en" | "es";
  path: string;
  title: string;
  description: string;
  enPath?: string;
  esPath?: string;
};

export function useLocalizedSeo(input: LocalizedSeoInput) {
  const siteUrl = "https://www.datumsaas.com";
  const canonical = `${siteUrl}${input.path}`;
  const enAlt = `${siteUrl}${input.enPath ?? "/"}`;
  const esAlt = `${siteUrl}${input.esPath ?? "/es"}`;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DatumSaas",
    url: siteUrl,
    logo: `${siteUrl}/imago.svg`,
    email: "info@datumsaas.com"
  };
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DatumSaas",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "ERP SaaS",
    operatingSystem: "Web",
    url: canonical,
    provider: {
      "@type": "Organization",
      name: "DatumSaas",
      url: siteUrl,
      email: "info@datumsaas.com"
    }
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DatumSaas",
    url: siteUrl,
    inLanguage: ["en", "es"]
  };
  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: canonical,
    inLanguage: input.locale
  };

  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description,
    ogUrl: canonical,
    ogType: "website",
    ogImage: `${siteUrl}/datumsaas.webp`,
    ogImageAlt: "DatumSaaS platform preview",
    twitterCard: "summary_large_image",
    twitterTitle: input.title,
    twitterDescription: input.description,
    twitterImage: `${siteUrl}/datumsaas.webp`
  });

  useHead({
    htmlAttrs: { lang: input.locale },
    link: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hreflang: "en", href: enAlt },
      { rel: "alternate", hreflang: "es", href: esAlt },
      { rel: "alternate", hreflang: "x-default", href: enAlt }
    ],
    script: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationSchema)
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(softwareApplicationSchema)
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteSchema)
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(webpageSchema)
      }
    ]
  });
}
