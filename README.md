# DatumSaas Website (Nuxt Static)

## Local development

```bash
npm install
npm run dev
```

## Static build for hosting

```bash
npm run generate
```

Static files are generated in `.output/public`.

## Apache deployment

1. Build locally with `npm run generate`.
2. Upload contents of `.output/public` to your Apache document root.
3. Keep `robots.txt` and `sitemap.xml` accessible from root.
4. Purge Cloudflare cache after deploy.

## Pre-release checklist

- [ ] `npm run generate` succeeds
- [ ] `/` and `/es` load localized content
- [ ] canonical/hreflang tags are present on both localized pages
- [ ] `sitemap.xml` lists `/` and `/es`
- [ ] `robots.txt` is reachable
