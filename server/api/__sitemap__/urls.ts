const SITEMAP_URLS = [
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/es", changefreq: "weekly", priority: 0.8 }
] as const;

export default defineSitemapEventHandler(() => SITEMAP_URLS);
