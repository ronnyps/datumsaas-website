const SITEMAP_URLS = [
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/es", changefreq: "weekly", priority: 0.8 },
  { loc: "/terms", changefreq: "monthly", priority: 0.4 },
  { loc: "/privacy", changefreq: "monthly", priority: 0.4 },
  { loc: "/es/terms", changefreq: "monthly", priority: 0.4 },
  { loc: "/es/privacy", changefreq: "monthly", priority: 0.4 }
] as const;

export default defineSitemapEventHandler(() => SITEMAP_URLS);
