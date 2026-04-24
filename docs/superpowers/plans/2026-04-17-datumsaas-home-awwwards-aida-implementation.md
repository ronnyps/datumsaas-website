# DatumSaaS Home Awwwards AIDA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the EN Home page with AIDA structure, gapless bento interest section, and medium GSAP motion while preserving DatumSaaS brand colors and enterprise tone.

**Architecture:** Keep the existing Nuxt/Vue Home composition and evolve current section components in place. Add one client-only GSAP helper composable for ScrollTrigger orchestration and keep animation concerns isolated from content loading. Validate outcomes with Vitest unit plus static output assertions.

**Tech Stack:** Nuxt 4, Vue 3 SFC, TypeScript, CSS, Vitest, GSAP (`gsap`, `@gsap/react` optional but not required in Vue implementation).

---

## File Structure and Responsibilities

- Modify: `app/pages/index.vue`
  - Enforce AIDA section order in Home root and add stable section markers for testing.
- Modify: `app/components/home/HeroSection.vue`
  - Implement Attention hero with editorial split, wide headline container, and dual CTA hierarchy.
- Modify: `app/components/home/ServicesSection.vue`
  - Implement Interest section as gapless dense bento with narrative sequence and hover physics hooks.
- Modify: `app/components/home/WhyUsSection.vue`
  - Implement Desire section with pinned layout hooks for GSAP and reduced-motion fallback markup.
- Modify: `app/components/home/CtaSection.vue`
  - Implement Action section with strong conversion hierarchy and micro-trust line.
- Create: `app/composables/useGsapDesireMotion.client.ts`
  - Register GSAP plugin and run ScrollTrigger pin/scale/fade choreography in client runtime.
- Modify: `app/assets/css/main.css`
  - Add AIDA spacing rhythm, gapless bento grid, hover transforms, GSAP target classes, and reduced-motion protections.
- Modify: `tests/ssg/smoke.spec.ts`
  - Assert new Home AIDA section anchors are present in generated HTML.
- Create: `tests/ssg/home-aida.spec.ts`
  - Assert bento dense markers, desire motion hooks, and CTA trust copy are rendered in output.
- Modify: `package.json`
  - Add missing motion dependency once user approves install.

User preference constraint:
- Do not include git commit steps in execution. Use checkpoints only.

---

### Task 1: Dependency Gate for GSAP

**Files:**
- Modify: `package.json`
- Test: `tests/ssg/smoke.spec.ts`

- [ ] **Step 1: Add a failing dependency check test**

```ts
// tests/ssg/smoke.spec.ts
import { readFileSync } from "node:fs";

it("includes motion dependency metadata in package json", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as {
    dependencies?: Record<string, string>;
  };
  expect(pkg.dependencies?.gsap).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ssg/smoke.spec.ts`  
Expected: FAIL on missing `dependencies.gsap`.

- [ ] **Step 3: Ask user approval and install dependency**

Run after approval: `npm install gsap`  
Expected: `added 1 package` and lockfile update.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/ssg/smoke.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Confirm:
- `package.json` contains `"gsap": "<version>"`.
- No other unrelated dependency changes were introduced.

---

### Task 2: Establish AIDA Shell and Stable Test Markers

**Files:**
- Modify: `app/pages/index.vue`
- Test: `tests/ssg/home-aida.spec.ts`

- [ ] **Step 1: Write failing AIDA structure test**

```ts
// tests/ssg/home-aida.spec.ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("home aida structure", () => {
  it("renders attention, interest, desire, and action anchors", () => {
    const en = readFileSync(".output/public/index.html", "utf-8");
    expect(en).toContain('id="attention"');
    expect(en).toContain('id="interest"');
    expect(en).toContain('id="desire"');
    expect(en).toContain('id="action"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ssg/home-aida.spec.ts`  
Expected: FAIL because markers are not rendered yet.

- [ ] **Step 3: Implement AIDA root wrapper and order**

```vue
<!-- app/pages/index.vue -->
<template>
  <main class="home home--en overflow-x-hidden w-full max-w-full" data-page="home-aida">
    <LayoutSiteHeader locale="en" />
    <HomeHeroSection id="attention" v-bind="content.hero" />
    <HomeServicesSection id="interest" v-bind="content.services" />
    <HomeWhyUsSection id="desire" v-bind="content.whyUs" />
    <HomeCtaSection id="action" v-bind="content.cta" />
    <LayoutSiteFooter v-bind="content.footer" />
  </main>
</template>
```

- [ ] **Step 4: Rebuild static output and run test**

Run:
- `npm run generate`
- `npm test -- tests/ssg/home-aida.spec.ts`

Expected: PASS.

- [ ] **Step 5: Checkpoint**

Confirm section order in generated HTML is Hero -> Services -> WhyUs -> CTA.

---

### Task 3: Attention Section Redesign (Hero)

**Files:**
- Modify: `app/components/home/HeroSection.vue`
- Modify: `app/assets/css/main.css`
- Test: `tests/ssg/home-aida.spec.ts`

- [ ] **Step 1: Add failing hero assertions**

```ts
// tests/ssg/home-aida.spec.ts
it("renders wide hero and dual-cta structure", () => {
  const en = readFileSync(".output/public/index.html", "utf-8");
  expect(en).toContain('class="hero__title hero__title--wide"');
  expect(en).toContain('data-cta="primary"');
  expect(en).toContain('data-cta="secondary"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ssg/home-aida.spec.ts`  
Expected: FAIL on missing hero classes and secondary CTA marker.

- [ ] **Step 3: Implement hero markup changes**

```vue
<!-- app/components/home/HeroSection.vue -->
<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}>();
</script>

<template>
  <section id="attention" class="section hero" data-aida="attention">
    <div class="container hero__container">
      <div class="hero__copy">
        <h1 class="hero__title hero__title--wide">
          Build clarity
          <span class="hero__inline-media" aria-hidden="true" />
          across operations
        </h1>
        <p class="hero__subtitle">{{ subtitle }}</p>
        <div class="hero__actions">
          <a class="btn btn--primary" data-cta="primary" :href="ctaHref">{{ ctaLabel }}</a>
          <a class="btn btn--ghost" data-cta="secondary" href="#interest">Explore platform flow</a>
        </div>
      </div>
      <div class="hero__visual" aria-hidden="true" />
    </div>
  </section>
</template>
```

- [ ] **Step 4: Implement hero styles**

```css
/* app/assets/css/main.css */
.hero__title--wide {
  max-width: 24ch;
  font-size: clamp(3rem, 5vw, 5.5rem);
  line-height: 1.02;
  text-wrap: balance;
}

.hero__inline-media {
  display: inline-block;
  width: clamp(64px, 9vw, 112px);
  height: clamp(32px, 4vw, 52px);
  margin: 0 0.35rem;
  vertical-align: middle;
  border-radius: 999px;
  background: url("https://picsum.photos/seed/datum-hero/320/180") center/cover no-repeat;
}

.btn--ghost {
  border: 1px solid rgba(0, 85, 255, 0.28);
  color: #061027;
  background: rgba(255, 255, 255, 0.8);
}
```

- [ ] **Step 5: Generate and verify**

Run:
- `npm run generate`
- `npm test -- tests/ssg/home-aida.spec.ts`

Expected: PASS with hero markers present.

---

### Task 4: Interest Section as Gapless Dense Bento

**Files:**
- Modify: `app/components/home/ServicesSection.vue`
- Modify: `app/assets/css/main.css`
- Test: `tests/ssg/home-aida.spec.ts`

- [ ] **Step 1: Add failing bento density test**

```ts
// tests/ssg/home-aida.spec.ts
it("renders dense bento interest grid with no generic timeline markers", () => {
  const en = readFileSync(".output/public/index.html", "utf-8");
  expect(en).toContain('class="services__bento"');
  expect(en).toContain("grid-flow-dense");
  expect(en).not.toContain("services__timeline");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ssg/home-aida.spec.ts`  
Expected: FAIL because current section still uses timeline list.

- [ ] **Step 3: Replace timeline with bento markup**

```vue
<!-- app/components/home/ServicesSection.vue -->
<template>
  <section id="interest" class="section services" data-aida="interest">
    <div class="container">
      <div class="services__heading">
        <h2 class="section__title">{{ title }}</h2>
      </div>
      <div class="services__bento grid-flow-dense" data-layout="12-col">
        <article class="services__card services__card--a">
          <h3>{{ items[0]?.title }}</h3>
          <p>{{ items[0]?.description }}</p>
        </article>
        <article class="services__card services__card--b">
          <h3>{{ items[1]?.title }}</h3>
          <p>{{ items[1]?.description }}</p>
        </article>
        <article class="services__card services__card--c">
          <h3>{{ items[2]?.title }}</h3>
          <p>{{ items[2]?.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Add dense-grid styles**

```css
/* app/assets/css/main.css */
.services__bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  grid-auto-flow: dense;
}

.services__card--a { grid-column: span 7; min-height: 260px; }
.services__card--b { grid-column: span 5; min-height: 160px; }
.services__card--c { grid-column: span 5; min-height: 160px; }

@media (max-width: 960px) {
  .services__bento { grid-template-columns: 1fr; }
  .services__card--a,
  .services__card--b,
  .services__card--c { grid-column: auto; min-height: 0; }
}
```

- [ ] **Step 5: Generate and verify**

Run:
- `npm run generate`
- `npm test -- tests/ssg/home-aida.spec.ts`

Expected: PASS with bento markers rendered.

---

### Task 5: Desire Section with GSAP Pin and Scrub

**Files:**
- Create: `app/composables/useGsapDesireMotion.client.ts`
- Modify: `app/components/home/WhyUsSection.vue`
- Modify: `app/assets/css/main.css`
- Test: `tests/ssg/home-aida.spec.ts`

- [ ] **Step 1: Add failing desire hook test**

```ts
// tests/ssg/home-aida.spec.ts
it("renders desire section motion hooks", () => {
  const en = readFileSync(".output/public/index.html", "utf-8");
  expect(en).toContain('data-motion="desire-pin-root"');
  expect(en).toContain('data-motion="desire-panel"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ssg/home-aida.spec.ts`  
Expected: FAIL because hooks do not exist yet.

- [ ] **Step 3: Create client-only GSAP composable**

```ts
// app/composables/useGsapDesireMotion.client.ts
import { onMounted, onBeforeUnmount, type Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useGsapDesireMotion(root: Ref<HTMLElement | null>) {
  let ctx: gsap.Context | null = null;

  onMounted(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!root.value) return;
    gsap.registerPlugin(ScrollTrigger);

    ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-motion="desire-panel"]');
      panels.forEach((panel) => {
        gsap.fromTo(panel, { scale: 0.88, opacity: 0.5 }, {
          scale: 1,
          opacity: 1,
          scrollTrigger: { trigger: panel, start: "top 80%", end: "top 30%", scrub: true }
        });
      });
    }, root.value);
  });

  onBeforeUnmount(() => ctx?.revert());
}
```

- [ ] **Step 4: Wire composable into WhyUs section**

```vue
<!-- app/components/home/WhyUsSection.vue -->
<script setup lang="ts">
const root = ref<HTMLElement | null>(null);
useGsapDesireMotion(root);
</script>

<template>
  <section id="desire" ref="root" class="section why-us" data-aida="desire" data-motion="desire-pin-root">
    <div class="container why-us__panel">
      <div class="why-us__sticky">
        <h2 class="section__title section__title--light">{{ title }}</h2>
      </div>
      <ul class="why-us__list">
        <li v-for="point in points" :key="point" class="why-us__item" data-motion="desire-panel">{{ point }}</li>
      </ul>
    </div>
  </section>
</template>
```

- [ ] **Step 5: Add sticky and motion-safe styles, then verify**

```css
/* app/assets/css/main.css */
.why-us__panel { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 24px; }
.why-us__sticky { position: sticky; top: 96px; align-self: start; }

@media (max-width: 960px) {
  .why-us__panel { grid-template-columns: 1fr; }
  .why-us__sticky { position: static; }
}

@media (prefers-reduced-motion: reduce) {
  [data-motion="desire-panel"] { transform: none !important; opacity: 1 !important; }
}
```

Run:
- `npm run generate`
- `npm test -- tests/ssg/home-aida.spec.ts`

Expected: PASS.

---

### Task 6: Action Section and Final Conversion Polish

**Files:**
- Modify: `app/components/home/CtaSection.vue`
- Modify: `app/assets/css/main.css`
- Test: `tests/ssg/home-aida.spec.ts`

- [ ] **Step 1: Add failing action test**

```ts
// tests/ssg/home-aida.spec.ts
it("renders action section with trust line and strong primary cta", () => {
  const en = readFileSync(".output/public/index.html", "utf-8");
  expect(en).toContain('data-aida="action"');
  expect(en).toContain('class="cta__micro-trust"');
  expect(en).toContain('data-cta="action-primary"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ssg/home-aida.spec.ts`  
Expected: FAIL on missing markers.

- [ ] **Step 3: Implement CTA structure updates**

```vue
<!-- app/components/home/CtaSection.vue -->
<template>
  <section id="action" class="section cta" data-aida="action">
    <div class="container cta__panel">
      <h2 class="section__title">{{ title }}</h2>
      <p class="cta__text">{{ description }}</p>
      <a class="btn btn--primary" data-cta="action-primary" :href="buttonHref">{{ buttonLabel }}</a>
      <p v-if="microTrust" class="cta__micro-trust">{{ microTrust }}</p>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Add action spacing and contrast rules**

```css
/* app/assets/css/main.css */
.cta {
  padding-top: clamp(5rem, 10vw, 8rem);
  padding-bottom: clamp(5rem, 10vw, 8rem);
}

.cta__panel {
  background: linear-gradient(160deg, rgba(6, 16, 39, 0.04), rgba(0, 85, 255, 0.12));
  border: 1px solid rgba(0, 85, 255, 0.22);
}
```

- [ ] **Step 5: Generate and verify**

Run:
- `npm run generate`
- `npm test -- tests/ssg/home-aida.spec.ts`

Expected: PASS.

---

### Task 7: Full Regression Verification

**Files:**
- Modify: `tests/ssg/smoke.spec.ts`
- Modify: `tests/ssg/seo.spec.ts` (only if metadata assertions need updates)
- Test: `tests/unit/home-content.spec.ts`, `tests/ssg/*.spec.ts`

- [ ] **Step 1: Add regression assertion for no horizontal overflow guard**

```ts
// tests/ssg/smoke.spec.ts
it("keeps overflow guard on home root", () => {
  const en = readFileSync(".output/public/index.html", "utf-8");
  expect(en).toContain("overflow-x-hidden");
});
```

- [ ] **Step 2: Run full test suite**

Run: `npm test`  
Expected: PASS for unit and ssg tests.

- [ ] **Step 3: Run production build checks**

Run:
- `npm run build`
- `npm run generate`

Expected:
- Build completes without SSR errors.
- Static files generated for `/` and `/es`.

- [ ] **Step 4: Manual QA checklist**

Verify in browser:
- Hero headline remains 2-3 lines on desktop.
- Bento has no visual holes at desktop.
- Desire section pins and scrubs smoothly.
- Reduced motion disables heavy animation.
- CTA remains high contrast and readable.

- [ ] **Step 5: Checkpoint**

Document final pass/fail notes in PR description or local implementation notes file.

---

## Self-Review

### 1. Spec Coverage
- AIDA structure: covered in Tasks 2, 3, 4, 5, 6.
- Gapless bento: covered in Task 4 with dense grid markers and CSS.
- GSAP medium motion: covered in Task 5 with pin/scrub and reduced-motion fallback.
- Brand color preservation: enforced via CSS snippets in Tasks 3, 5, 6.
- Validation and rollback safety: covered in Task 7 plus checkpoint pattern.

### 2. Placeholder Scan
- No `TODO`, `TBD`, or deferred implementation markers present.
- Each task has exact file paths, runnable commands, and expected outcomes.

### 3. Type and Naming Consistency
- AIDA ids and data markers are consistent: `attention`, `interest`, `desire`, `action`.
- GSAP hooks are consistent: `desire-pin-root`, `desire-panel`.
- Primary CTA markers are consistent: `data-cta="primary"` and `data-cta="action-primary"`.

