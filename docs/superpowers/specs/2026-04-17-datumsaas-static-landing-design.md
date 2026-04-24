# DatumSaas Static Corporate Landing Design

## Objective

Build a Nuxt-based static website MVP for DatumSaas focused on SEO and search discoverability in the United States market, with English as primary and Spanish as secondary language.

The first release scope is Home only, but architecture must support adding many pages later without redesigning the system.

## Goals

- Generate a fully static build artifact for deployment on personal hosting with Apache and Cloudflare in front.
- Provide language-specific routes for English and Spanish.
- Keep all marketing copy in local JSON files (no backend).
- Ship a conversion-oriented Home MVP with temporary clean corporate copy.
- Implement foundational SEO (metadata, canonical, hreflang, sitemap, robots, social tags).

## Non-goals (MVP)

- No CMS integration.
- No runtime backend APIs.
- No blog in v1.
- No advanced design system rollout in v1.

## Deployment and Runtime Model

### Build

- Use Nuxt 3 static generation workflow (`nuxi generate`).
- The output is static files only, deployable to Apache.
- No server-side Node runtime in production.

### Hosting

- Origin: personal hosting with Apache.
- Edge: Cloudflare as DNS/CDN/cache layer.
- Release flow:
  1. Run static generation locally.
  2. Upload generated static folder to hosting.
  3. Apache serves static content, Cloudflare handles caching/distribution.

## Information Architecture

### Current MVP pages

- `/en` (English Home)
- `/es` (Spanish Home)

### Root handling

- `/` redirects to `/en` for deterministic indexing and default language behavior.

### Future expansion model

When new pages are added, keep language symmetry:

- `/en/<page-slug>`
- `/es/<page-slug>`

## Content Model

Use local JSON files per language:

- `content/en/home.json`
- `content/es/home.json`

Each file stores only page content for now and includes these section blocks:

- Hero
- Services
- Why Choose Us
- CTA
- Footer

This model remains backend-free and supports frequent copy changes by editing JSON only.

## UI Composition

Home will be assembled from reusable section components:

- `components/home/HeroSection.vue`
- `components/home/ServicesSection.vue`
- `components/home/WhyUsSection.vue`
- `components/home/CtaSection.vue`
- `components/layout/SiteFooter.vue`

Components receive structured content from JSON, avoiding hardcoded marketing text in component templates.

## SEO Architecture

Implement SEO in pages/composables, not in visual section components.

### Required SEO elements per language page

- Localized `<title>` and `meta description`
- Canonical URL for each route
- `hreflang` links for `en`, `es`, and `x-default`
- Open Graph tags
- Twitter card tags

### Site-level SEO assets

- Static `sitemap.xml` including `/en` and `/es`
- `robots.txt` allowing indexation
- Base site URL set to `https://www.datumsaas.com` (treated as provisional and editable)

## i18n Behavior

- Supported locales: English (`en`) and Spanish (`es`)
- URL strategy: prefixed routes (`/en`, `/es`)
- English is primary business language
- Spanish is secondary but equally indexable for localized discovery

## Data and Rendering Flow

1. Request hits a localized route (`/en` or `/es`).
2. Page loads matching JSON content file.
3. Page passes JSON slices into section components.
4. SEO metadata is emitted based on locale and route.
5. Static HTML is generated during build for crawler-friendly output.

## Error Handling Strategy

- If content file is missing for a locale/page, fail fast during build instead of silently rendering incomplete content.
- Use conservative defaults only for optional section fields.
- Keep schema shape strict enough to catch content regressions early.

## Testing and Verification Strategy

### Build verification

- Static generation must complete without runtime fetch dependencies.
- Generated output must include both `/en` and `/es`.

### Functional checks

- Root redirect from `/` to `/en`.
- Language routes render expected section order and content.

### SEO checks

- Confirm localized title/description for both routes.
- Confirm canonical/hreflang correctness.
- Confirm sitemap includes both localized routes.
- Confirm robots is present and index-friendly.

## Technical Stack

- Nuxt 3
- TypeScript
- `@nuxtjs/i18n`
- `@nuxtjs/sitemap`

## Architectural Principles

- Keep MVP simple and deterministic.
- Prioritize static SEO correctness over premature abstraction.
- Separate content, presentation, and SEO concerns.
- Design for incremental growth (add pages/sections without structural rewrites).

## Open Decisions Deferred (Intentional)

- Final production domain confirmation.
- Final brand copy and long-form messaging.
- Additional page inventory beyond Home.
- Advanced visual system and motion language.

These are intentionally deferred to preserve delivery speed for MVP launch.
