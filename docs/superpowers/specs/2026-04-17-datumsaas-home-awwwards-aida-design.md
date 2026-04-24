# DatumSaaS Home Awwwards AIDA Design Spec

## Status
Draft completed for review.

## Date
2026-04-17

## Scope
- In scope: `app/pages/index.vue` and Home sections used by this page.
- Out of scope: `app/pages/es.vue` and any global redesign beyond Home.

## Context
This spec defines a Home-only redesign using:
- AIDA structure (`Attention`, `Interest`, `Desire`, `Action`)
- Gapless bento layout in the Interest block
- Medium-intensity GSAP motion
- Existing brand direction preserved (sober enterprise, blue-led palette, clear conversion path)

The user explicitly wants this as an experiment and accepts easy rollback if needed.

## Goals
1. Upgrade Home visual quality to a high-end editorial-tech feel without changing brand colors.
2. Maintain enterprise trust tone and conversion clarity from the approved v1 reference.
3. Introduce GSAP motion in a controlled, performant way (medium intensity).
4. Keep the implementation reviewable and low-risk by evolving existing Home architecture.

## Non-Goals
1. No full-site redesign.
2. No i18n content expansion in this pass.
3. No framework migration or structural rewrite of the Nuxt app.

## Chosen Approach
Evolve current Home components in place (no parallel v2 page), with targeted section redesign and motion orchestration.

Why this approach:
- Lowest regression risk.
- Fastest iteration loop for experimental visual direction.
- Easy rollback by reverting Home component edits only.

## Pre-Flight Design Plan (gpt-taste aligned)
```xml
<design_plan>
  <python_rng>
    seed = len(user_prompt) % 97 = 58
    hero_layout = "Editorial Split"
    components = ["Inline Typography Images", "Horizontal Accordions", "Infinite Marquee"]
    gsap_patterns = ["Scroll Pinning Split", "Image Scale and Fade Scroll"]
    font_stack = "Geist + Geist Mono"
  </python_rng>
  <aida_check>
    Navigation + Attention Hero + Interest Bento + Desire GSAP + Action CTA/Footer are all present.
  </aida_check>
  <hero_math>
    H1 container uses max-w-6xl, clamp sizing, and balanced line breaks to keep 2-3 lines.
    No stamp icons, no spam tags under hero.
  </hero_math>
  <bento_density>
    12-column dense grid with interlocking spans:
    Card A: col-span-7 row-span-2
    Card B: col-span-5 row-span-1
    Card C: col-span-3 row-span-1
    Card D: col-span-4 row-span-1
    Card E: col-span-5 row-span-1
    Row math closes with no empty cells via grid-flow-dense.
  </bento_density>
  <quality_sweep>
    No meta labels (e.g., "SECTION 01"), strong button contrast, no emoji usage.
  </quality_sweep>
</design_plan>
```

## Information Architecture (AIDA)

### 1. Navigation (Pre-AIDA wrapper)
- Premium, compact top nav.
- Sticky behavior with transparent-to-solid surface transition and subtle blur.
- Primary links with clear active/hover/focus states.
- Language switch remains visible and simple.

### 2. Attention (Hero)
- Editorial split layout with wide typographic container (`max-w-6xl`).
- Blue-led abstract background composition with controlled overlays (no neon/purple drift).
- One primary high-contrast CTA and one low-emphasis secondary action.
- Inline micro-image treatment inside headline for premium personality, without compromising readability.

### 3. Interest (Gapless Bento + Narrative)
- 4-5 block bento section using `grid-flow-dense`, no visual holes.
- Integrate the current narrative sequence (unify operations -> centralize finance -> align teams).
- Mix of metric-forward copy, structural visuals, and concise functional proof points.
- Hover physics on cards/images (transform-only).

### 4. Desire (GSAP section)
- ScrollTrigger split section:
  - Left title/content panel pinned.
  - Right visual/story panels transition with scale and opacity interpolation.
- Motion intent:
  - Entry scale from 0.88 to 1.0
  - Fade down to ~0.25 when exiting focus
  - Controlled scrub to support enterprise tone (not flashy scroll-jacking)
- Respect `prefers-reduced-motion` fallback to static sequence.

### 5. Action (Final CTA + Footer)
- Large commercial CTA block with outcome-focused message.
- Primary CTA emphasized with strong contrast.
- Micro-trust line below CTA (response speed, no-obligation tone).
- Clean footer continuity with legal and core links.

## Component-Level Plan
- `app/components/home/HeroSection.vue`
  - Rebuild as editorial split and wide H1 structure.
  - Add ambient background layers and inline visual token.
- `app/components/home/ServicesSection.vue`
  - Replace simple narrative stack with dense, gapless bento narrative hybrid.
- `app/components/home/WhyUsSection.vue`
  - Convert to premium dark anchor block that bridges Interest -> Desire.
- `app/components/home/CtaSection.vue`
  - Refine as Action chapter with stronger conversion hierarchy.
- `app/pages/index.vue`
  - Ensure section sequencing follows AIDA and wraps in overflow-safe root.
- `app/assets/css/main.css` (or scoped style blocks where appropriate)
  - Add shared motion-safe utility classes, spacing rhythm, and optional grain layer tokens.

## Data Flow and Content Strategy
- Keep existing composable-driven content flow where present.
- Preserve copy intent from v1 reference; tune wording for tighter rhythm and hierarchy.
- Avoid placeholder cliches and synthetic labels.

## Motion and Performance Engineering
- GSAP stack: `gsap`, `ScrollTrigger`, `@gsap/react` (installed only after user confirmation).
- Register plugins in client-only lifecycle hooks.
- Animate only `transform` and `opacity`.
- Avoid scroll listeners for custom animation loops when ScrollTrigger can orchestrate.
- Prevent horizontal overflow from off-canvas motion using page root constraints.

## Accessibility and UX Constraints
- Maintain WCAG AA contrast, especially CTA and dark-block text.
- Visible keyboard focus styles on all interactives.
- Minimum touch target around 44px.
- No layout shift on hover/active states.
- Respect reduced motion settings with static alternatives.

## Error Handling and Failure Modes
1. Missing GSAP dependency
- Guard: check package before import.
- Action: prompt for install approval before implementation.

2. SSR/client mismatch for animation code
- Guard: run GSAP only in client lifecycle.
- Action: keep motion logic isolated in mounted hooks/client components.

3. Mobile overflow from bento and motion
- Guard: strict mobile collapse and `overflow-x-hidden`.
- Action: validate at breakpoints before completion.

## Testing and Verification Plan
1. Run unit tests: `npm test`.
2. Build verification: `npm run build`.
3. Manual QA:
- Desktop + mobile layout pass.
- Keyboard focus pass.
- Reduced-motion pass.
- CTA contrast and interaction states.
- Scroll-motion smoothness check with no jitter or overflow.

## Rollback Plan
If the experiment is not accepted:
1. Revert only modified Home files.
2. Keep spec for future design explorations.
3. Reapply selected parts incrementally in a smaller follow-up iteration.

## Implementation Entry Criteria
- User approves this spec.
- User approves GSAP installation request when implementation starts.

## Exit Criteria
- Home (`index.vue`) reflects AIDA structure and upgraded visual quality.
- Interest bento is dense and hole-free.
- Desire section uses GSAP medium-intensity motion and has reduced-motion fallback.
- Brand palette and enterprise tone remain intact.
