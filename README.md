# DatumSaas Website (Nuxt Static)

## Local development

```bash
npm install
npm run dev
```

## Contact Us -> n8n webhook

The Contact Us modal sends form data directly to your n8n webhook from the client.

1. Copy `.env.example` to `.env`.
2. Set:

```bash
NUXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL=https://your-n8n-domain/webhook/your-id
```

Config location:
- Environment variable: `.env`
- Nuxt runtime config key: `runtimeConfig.public.n8nContactWebhookUrl` in `nuxt.config.ts`
- Submit logic: `app/composables/useContactWebhook.ts`

## Static build for hosting

For root-domain deploys:

```bash
npm run generate:root
```

For subdirectory deploys like `https://domain.com/datumsaas/`:

```bash
npm run generate:datumsaas
```

Generic static build using the current `NUXT_APP_BASE_URL` value:

```bash
npm run generate:static
```

Static files are generated in `.output/public`.

Current behavior:

- `generate:root` builds assets for `/`
- `generate:datumsaas` builds assets for `/datumsaas/`
- `generate:static` respects `NUXT_APP_BASE_URL` if you want a custom subpath

## One-command git publish

Use this command to stage all changes, create a commit, and push to the repository in one step:

```bash
npm run git:publish -- -Message "your commit message"
```

Optional: publish to a different branch:

```bash
npm run git:publish -- -Message "your commit message" -Branch "branch-name"
```

## Apache deployment

1. Build locally with `npm run generate:root` or `npm run generate:datumsaas`, depending on where the site will be mounted.
2. On server, remove old deploy files first (at minimum old `_nuxt` and old html files) to avoid stale asset references.
3. Upload contents of `.output/public` to your Apache document root (or subdirectory root if using `NUXT_APP_BASE_URL`).
4. Keep `robots.txt` and `sitemap.xml` accessible from root.
5. Purge Cloudflare cache after deploy.

## Pre-release checklist

- [ ] `npm run generate` succeeds
- [ ] `/` and `/es` load localized content
- [ ] canonical/hreflang tags are present on both localized pages
- [ ] `sitemap.xml` lists `/` and `/es`
- [ ] `robots.txt` is reachable
