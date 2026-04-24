# DatumSaas Static Home MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Nuxt 3 static, SEO-ready bilingual (en/es) corporate Home MVP using local JSON content and deployable static output for Apache + Cloudflare.

**Architecture:** Nuxt 3 SSG with localized routes (`/en`, `/es`), JSON-driven section content, reusable Home components, and centralized SEO metadata helpers. Build output is generated with `nuxi generate` and deployed as static files only.

**Tech Stack:** Nuxt 3, TypeScript, @nuxtjs/i18n, @nuxtjs/sitemap, zod, Vitest

---

### Task 1: Scaffold Nuxt project and baseline static build

**Files:**
- Create: `package.json` (from Nuxt scaffold)
- Create: `nuxt.config.ts`
- Create: `app.vue`
- Create: `tsconfig.json` (from Nuxt scaffold)
- Modify: `package.json` (scripts/deps after module install)

- [ ] **Step 1: Initialize Nuxt in current folder**

Run:
```powershell
npx nuxi@latest init . --packageManager npm --force
```

Expected: Nuxt project files are created in current directory without deleting `docs/` and `.agents/`.

- [ ] **Step 2: Install dependencies for i18n, sitemap, and content validation**

Run:
```powershell
npm install
npm install @nuxtjs/i18n @nuxtjs/sitemap zod
npm install -D vitest @vitest/ui
```

Expected: install completes and `package-lock.json` includes added packages.

- [ ] **Step 3: Write a failing static output smoke test first**

Create `tests/ssg/smoke.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";

describe("static output smoke", () => {
  it("expects localized entry points to exist after generate", () => {
    expect(existsSync(".output/public/en/index.html")).toBe(true);
    expect(existsSync(".output/public/es/index.html")).toBe(true);
  });
});
```

Run:
```powershell
npx vitest run tests/ssg/smoke.spec.ts
```

Expected: FAIL (files do not exist yet).

- [ ] **Step 4: Set baseline Nuxt config for static generation**

Replace `nuxt.config.ts`:
```ts
export default defineNuxtConfig({
  compatibilityDate: "2026-04-17",
  devtools: { enabled: true },
  ssr: true,
  nitro: {
    prerender: {
      routes: ["/en", "/es"]
    }
  }
});
```

Run:
```powershell
npm run generate
```

Expected: generate completes and `.output/public/` is produced.

- [ ] **Step 5: Re-run smoke test to confirm baseline static generation**

Run:
```powershell
npx vitest run tests/ssg/smoke.spec.ts
```

Expected: PASS.


### Task 2: Configure i18n routes and deterministic root redirect

**Files:**
- Modify: `nuxt.config.ts`
- Create: `pages/index.vue`
- Create: `pages/en.vue`
- Create: `pages/es.vue`
- Create: `tests/ssg/routes.spec.ts`

- [ ] **Step 1: Write failing test for root redirect and localized pages**

Create `tests/ssg/routes.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("localized routes", () => {
  it("has generated english and spanish pages", () => {
    const en = readFileSync(".output/public/en/index.html", "utf-8");
    const es = readFileSync(".output/public/es/index.html", "utf-8");
    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBeGreaterThan(0);
  });

  it("root redirects to /en", () => {
    const root = readFileSync(".output/public/index.html", "utf-8");
    expect(root).toContain("/en");
  });
});
```

Run:
```powershell
npm run generate
npx vitest run tests/ssg/routes.spec.ts
```

Expected: FAIL (redirect/page behavior not implemented yet).

- [ ] **Step 2: Configure i18n module**

Update `nuxt.config.ts`:
```ts
export default defineNuxtConfig({
  compatibilityDate: "2026-04-17",
  devtools: { enabled: true },
  ssr: true,
  modules: ["@nuxtjs/i18n", "@nuxtjs/sitemap"],
  i18n: {
    strategy: "prefix",
    defaultLocale: "en",
    locales: [
      { code: "en", iso: "en-US", name: "English" },
      { code: "es", iso: "es-ES", name: "Español" }
    ]
  },
  nitro: {
    prerender: {
      routes: ["/", "/en", "/es"]
    }
  },
  site: {
    url: "https://www.datumsaas.com"
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"]
  }
});
```

- [ ] **Step 3: Implement root redirect and localized page shells**

Create `pages/index.vue`:
```vue
<script setup lang="ts">
await navigateTo("/en", { redirectCode: 301 });
</script>

<template>
  <div />
</template>
```

Create `pages/en.vue`:
```vue
<template>
  <main>
    <h1>DatumSaas</h1>
  </main>
</template>
```

Create `pages/es.vue`:
```vue
<template>
  <main>
    <h1>DatumSaas</h1>
  </main>
</template>
```

- [ ] **Step 4: Generate static output and run route tests**

Run:
```powershell
npm run generate
npx vitest run tests/ssg/routes.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Verify output paths manually**

Run:
```powershell
Get-ChildItem .output/public -Recurse -Filter index.html | Select-Object FullName
```

Expected: includes root, `/en`, and `/es` generated HTML entries.


### Task 3: Add JSON content model with schema validation

**Files:**
- Create: `content/en/home.json`
- Create: `content/es/home.json`
- Create: `types/home.ts`
- Create: `composables/useHomeContent.ts`
- Create: `tests/unit/home-content.spec.ts`

- [ ] **Step 1: Write failing tests for content schema**

Create `tests/unit/home-content.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getHomeContent } from "../../composables/useHomeContent";

describe("home content", () => {
  it("returns english home content", async () => {
    const data = await getHomeContent("en");
    expect(data.hero.title.length).toBeGreaterThan(0);
  });

  it("returns spanish home content", async () => {
    const data = await getHomeContent("es");
    expect(data.hero.title.length).toBeGreaterThan(0);
  });
});
```

Run:
```powershell
npx vitest run tests/unit/home-content.spec.ts
```

Expected: FAIL (composable/files not implemented yet).

- [ ] **Step 2: Define typed schema**

Create `types/home.ts`:
```ts
import { z } from "zod";

export const HomeContentSchema = z.object({
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1)
  }),
  services: z.object({
    title: z.string().min(1),
    items: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1)
      })
    ).min(1)
  }),
  whyUs: z.object({
    title: z.string().min(1),
    points: z.array(z.string().min(1)).min(1)
  }),
  cta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    buttonLabel: z.string().min(1),
    buttonHref: z.string().min(1)
  }),
  footer: z.object({
    copyright: z.string().min(1)
  }),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1)
  })
});

export type HomeContent = z.infer<typeof HomeContentSchema>;
```

- [ ] **Step 3: Add localized JSON content**

Create `content/en/home.json`:
```json
{
  "hero": {
    "title": "The All-in-One ERP Platform for Growing U.S. Companies",
    "subtitle": "Unify operations, finance, and teams in one system designed to scale with your business.",
    "ctaLabel": "Request a Demo",
    "ctaHref": "#contact"
  },
  "services": {
    "title": "What You Can Centralize with DatumSaas",
    "items": [
      { "title": "Operations", "description": "Coordinate workflows and remove process bottlenecks." },
      { "title": "Finance", "description": "Get visibility and control over financial performance." },
      { "title": "People & Productivity", "description": "Align teams and execution around one source of truth." }
    ]
  },
  "whyUs": {
    "title": "Why Companies Choose DatumSaas",
    "points": [
      "Faster decision-making with centralized data",
      "Lower tool fragmentation across departments",
      "Built to support SMB, mid-market, and enterprise growth"
    ]
  },
  "cta": {
    "title": "Ready to simplify your business operations?",
    "description": "See how DatumSaas helps your team work smarter with an ERP built for scale.",
    "buttonLabel": "Talk to Sales",
    "buttonHref": "#contact"
  },
  "footer": {
    "copyright": "© DatumSaas. All rights reserved."
  },
  "seo": {
    "title": "DatumSaas | All-in-One ERP Platform",
    "description": "DatumSaas helps U.S. companies centralize operations, finance, and execution in one ERP platform."
  }
}
```

Create `content/es/home.json`:
```json
{
  "hero": {
    "title": "La plataforma ERP todo en uno para empresas en crecimiento",
    "subtitle": "Centraliza operaciones, finanzas y equipos en un solo sistema preparado para escalar.",
    "ctaLabel": "Solicitar demo",
    "ctaHref": "#contact"
  },
  "services": {
    "title": "Lo que puedes centralizar con DatumSaas",
    "items": [
      { "title": "Operaciones", "description": "Coordina flujos y elimina cuellos de botella." },
      { "title": "Finanzas", "description": "Obtén visibilidad y control del rendimiento financiero." },
      { "title": "Personas y productividad", "description": "Alinea equipos y ejecución con una sola fuente de verdad." }
    ]
  },
  "whyUs": {
    "title": "Por qué las empresas eligen DatumSaas",
    "points": [
      "Decisiones más rápidas con datos centralizados",
      "Menor fragmentación de herramientas",
      "Preparado para pymes, medianas y grandes empresas"
    ]
  },
  "cta": {
    "title": "¿Listo para simplificar tu operación?",
    "description": "Descubre cómo DatumSaas ayuda a tu equipo a trabajar mejor con un ERP escalable.",
    "buttonLabel": "Hablar con ventas",
    "buttonHref": "#contact"
  },
  "footer": {
    "copyright": "© DatumSaas. Todos los derechos reservados."
  },
  "seo": {
    "title": "DatumSaas | Plataforma ERP todo en uno",
    "description": "DatumSaas ayuda a empresas a centralizar operaciones, finanzas y ejecución en una sola plataforma ERP."
  }
}
```

- [ ] **Step 4: Implement content loader with strict validation**

Create `composables/useHomeContent.ts`:
```ts
import enHome from "../content/en/home.json";
import esHome from "../content/es/home.json";
import { HomeContentSchema, type HomeContent } from "../types/home";

type LocaleCode = "en" | "es";

const byLocale: Record<LocaleCode, unknown> = {
  en: enHome,
  es: esHome
};

export async function getHomeContent(locale: LocaleCode): Promise<HomeContent> {
  const raw = byLocale[locale];
  return HomeContentSchema.parse(raw);
}
```

- [ ] **Step 5: Run unit tests**

Run:
```powershell
npx vitest run tests/unit/home-content.spec.ts
```

Expected: PASS.


### Task 4: Build reusable Home sections and localized page rendering

**Files:**
- Create: `components/home/HeroSection.vue`
- Create: `components/home/ServicesSection.vue`
- Create: `components/home/WhyUsSection.vue`
- Create: `components/home/CtaSection.vue`
- Create: `components/layout/SiteFooter.vue`
- Modify: `pages/en.vue`
- Modify: `pages/es.vue`

- [ ] **Step 1: Create section components**

Create `components/home/HeroSection.vue`:
```vue
<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}>();
</script>

<template>
  <section class="section hero">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
    <a :href="ctaHref">{{ ctaLabel }}</a>
  </section>
</template>
```

Create `components/home/ServicesSection.vue`:
```vue
<script setup lang="ts">
defineProps<{
  title: string;
  items: { title: string; description: string }[];
}>();
</script>

<template>
  <section class="section services">
    <h2>{{ title }}</h2>
    <ul>
      <li v-for="item in items" :key="item.title">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </li>
    </ul>
  </section>
</template>
```

Create `components/home/WhyUsSection.vue`:
```vue
<script setup lang="ts">
defineProps<{
  title: string;
  points: string[];
}>();
</script>

<template>
  <section class="section why-us">
    <h2>{{ title }}</h2>
    <ul>
      <li v-for="point in points" :key="point">{{ point }}</li>
    </ul>
  </section>
</template>
```

Create `components/home/CtaSection.vue`:
```vue
<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
}>();
</script>

<template>
  <section id="contact" class="section cta">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <a :href="buttonHref">{{ buttonLabel }}</a>
  </section>
</template>
```

Create `components/layout/SiteFooter.vue`:
```vue
<script setup lang="ts">
defineProps<{
  copyright: string;
}>();
</script>

<template>
  <footer class="section footer">
    <small>{{ copyright }}</small>
  </footer>
</template>
```

- [ ] **Step 2: Render English page from content**

Replace `pages/en.vue`:
```vue
<script setup lang="ts">
const content = await getHomeContent("en");
</script>

<template>
  <main>
    <HeroSection v-bind="content.hero" />
    <ServicesSection v-bind="content.services" />
    <WhyUsSection v-bind="content.whyUs" />
    <CtaSection v-bind="content.cta" />
    <SiteFooter v-bind="content.footer" />
  </main>
</template>
```

- [ ] **Step 3: Render Spanish page from content**

Replace `pages/es.vue`:
```vue
<script setup lang="ts">
const content = await getHomeContent("es");
</script>

<template>
  <main>
    <HeroSection v-bind="content.hero" />
    <ServicesSection v-bind="content.services" />
    <WhyUsSection v-bind="content.whyUs" />
    <CtaSection v-bind="content.cta" />
    <SiteFooter v-bind="content.footer" />
  </main>
</template>
```

- [ ] **Step 4: Run dev server and validate both routes manually**

Run:
```powershell
npm run dev
```

Manual check:
- `http://localhost:3000/en`
- `http://localhost:3000/es`

Expected: both pages render the 5 sections with localized content.

- [ ] **Step 5: Run full static generation**

Run:
```powershell
npm run generate
```

Expected: build succeeds with localized pages.


### Task 5: Implement SEO metadata, canonical, hreflang, sitemap, and robots

**Files:**
- Create: `composables/useLocalizedSeo.ts`
- Modify: `pages/en.vue`
- Modify: `pages/es.vue`
- Create: `server/api/__sitemap__/urls.ts`
- Create: `public/robots.txt`
- Create: `tests/ssg/seo.spec.ts`

- [ ] **Step 1: Write failing SEO output test**

Create `tests/ssg/seo.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("seo output", () => {
  it("contains localized metadata and alternates", () => {
    const en = readFileSync(".output/public/en/index.html", "utf-8");
    expect(en).toContain("DatumSaas");
    expect(en).toContain("hreflang");
    expect(en).toContain("og:title");
  });
});
```

Run:
```powershell
npm run generate
npx vitest run tests/ssg/seo.spec.ts
```

Expected: FAIL.

- [ ] **Step 2: Create reusable SEO composable**

Create `composables/useLocalizedSeo.ts`:
```ts
type LocalizedSeoInput = {
  locale: "en" | "es";
  path: "/en" | "/es";
  title: string;
  description: string;
};

export function useLocalizedSeo(input: LocalizedSeoInput) {
  const siteUrl = "https://www.datumsaas.com";
  const canonical = `${siteUrl}${input.path}`;
  const enAlt = `${siteUrl}/en`;
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
    link: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hreflang: "en", href: enAlt },
      { rel: "alternate", hreflang: "es", href: esAlt },
      { rel: "alternate", hreflang: "x-default", href: enAlt }
    ],
    htmlAttrs: { lang: input.locale }
  });
}
```

- [ ] **Step 3: Apply localized SEO in both pages**

Update `pages/en.vue`:
```vue
<script setup lang="ts">
const content = await getHomeContent("en");
useLocalizedSeo({
  locale: "en",
  path: "/en",
  title: content.seo.title,
  description: content.seo.description
});
</script>

<template>
  <main>
    <HeroSection v-bind="content.hero" />
    <ServicesSection v-bind="content.services" />
    <WhyUsSection v-bind="content.whyUs" />
    <CtaSection v-bind="content.cta" />
    <SiteFooter v-bind="content.footer" />
  </main>
</template>
```

Update `pages/es.vue`:
```vue
<script setup lang="ts">
const content = await getHomeContent("es");
useLocalizedSeo({
  locale: "es",
  path: "/es",
  title: content.seo.title,
  description: content.seo.description
});
</script>

<template>
  <main>
    <HeroSection v-bind="content.hero" />
    <ServicesSection v-bind="content.services" />
    <WhyUsSection v-bind="content.whyUs" />
    <CtaSection v-bind="content.cta" />
    <SiteFooter v-bind="content.footer" />
  </main>
</template>
```

- [ ] **Step 4: Add sitemap source and robots**

Create `server/api/__sitemap__/urls.ts`:
```ts
export default defineSitemapEventHandler(() => {
  return [
    { loc: "/en", changefreq: "weekly", priority: 1.0 },
    { loc: "/es", changefreq: "weekly", priority: 0.8 }
  ];
});
```

Create `public/robots.txt`:
```txt
User-agent: *
Allow: /

Sitemap: https://www.datumsaas.com/sitemap.xml
```

- [ ] **Step 5: Generate and verify SEO tests**

Run:
```powershell
npm run generate
npx vitest run tests/ssg/seo.spec.ts
```

Expected: PASS.


### Task 6: Add build/deploy scripts and manual deployment runbook for Apache

**Files:**
- Modify: `package.json`
- Create: `README.md`
- Create: `tests/ssg/deploy-artifact.spec.ts`

- [ ] **Step 1: Add failing test for deploy artifact presence**

Create `tests/ssg/deploy-artifact.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";

describe("deploy artifacts", () => {
  it("creates static output directory for apache upload", () => {
    expect(existsSync(".output/public")).toBe(true);
  });
});
```

Run:
```powershell
Remove-Item -Recurse -Force ".output" -ErrorAction SilentlyContinue
npx vitest run tests/ssg/deploy-artifact.spec.ts
```

Expected: FAIL.

- [ ] **Step 2: Ensure build scripts are explicit**

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Add deployment instructions**

Create `README.md`:
```md
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
```

- [ ] **Step 4: Build and run deploy artifact test**

Run:
```powershell
npm run generate
npx vitest run tests/ssg/deploy-artifact.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Run full verification suite**

Run:
```powershell
npx vitest run
```

Expected: all tests PASS for smoke, routes, content, SEO, and deploy artifacts.


### Task 7: Final SEO and static sanity verification checklist

**Files:**
- Modify: `README.md` (append verification checklist)

- [ ] **Step 1: Append release checklist**

Append to `README.md`:
```md
## Pre-release checklist

- [ ] `npm run generate` succeeds
- [ ] `/` redirects to `/en`
- [ ] `/en` and `/es` load localized content
- [ ] canonical/hreflang tags are present on both localized pages
- [ ] `sitemap.xml` lists `/en` and `/es`
- [ ] `robots.txt` is reachable
```

- [ ] **Step 2: Validate generated english metadata**

Run:
```powershell
Get-Content ".output/public/en/index.html" | Select-String -Pattern "canonical|hreflang|og:title|twitter:card"
```

Expected: output contains all required SEO markers.

- [ ] **Step 3: Validate generated spanish metadata**

Run:
```powershell
Get-Content ".output/public/es/index.html" | Select-String -Pattern "canonical|hreflang|og:title|twitter:card"
```

Expected: output contains all required SEO markers.

- [ ] **Step 4: Validate robots and sitemap in generated output**

Run:
```powershell
Test-Path ".output/public/robots.txt"
Test-Path ".output/public/sitemap.xml"
```

Expected: both commands return `True`.

- [ ] **Step 5: Save a local release snapshot note**

Create `docs/superpowers/release-notes/2026-04-17-static-home-mvp.md`:
```md
# DatumSaas Static Home MVP Snapshot

- Build mode: static (`nuxt generate`)
- Locales: `/en`, `/es`
- Content source: local JSON (`content/en`, `content/es`)
- SEO: canonical, hreflang, OG, Twitter, sitemap, robots
- Deployment target: Apache origin + Cloudflare edge
```

Expected: release context is documented even without git.
