# Problem Section Control Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Control Room redesign in the home Problem section with pinned GSAP scrollytelling on desktop, simplified motion on mobile, and reduced-motion-safe behavior.

**Architecture:** Keep structure centered on `ProblemSection.vue` + `useProblemScrollScene.client.ts` + `.problem__*` CSS in `app/assets/css/main.css`. Use data attributes (`data-scene-phase`, `data-scene-step`, `data-scene-mode`) to drive visual state in CSS instead of inline styles.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, GSAP ScrollTrigger, project design tokens in `assets/design-tokens.css`, global styles in `app/assets/css/main.css`.

---

### Task 1: Extend Scene Controller for Pinned/Desktop + Compact/Mobile

**Files:**
- Modify: `app/composables/useProblemScrollScene.client.ts`

- [x] Add scene mode state (`pinned | compact | reduced`) and expose it.
- [x] Implement desktop pinned ScrollTrigger timeline (`pin`, `scrub`, phase mapping).
- [x] Implement compact-screen non-pinned progressive trigger.
- [x] Keep reduced-motion fallback deterministic and animation-safe.
- [x] Preserve hover/focus bullet overrides and cleanup on unmount.

### Task 2: Upgrade ProblemSection Markup for Control Room Visual Layers

**Files:**
- Modify: `app/components/home/ProblemSection.vue`

- [x] Add `data-scene-mode` binding from composable state.
- [x] Add non-text visual layers (bridge lines and phase meter) inside existing visual block.
- [x] Keep existing copy contract (`title`, `description`, `bullets`) unchanged.
- [x] Keep interactions keyboard-safe and no inline styling.

### Task 3: Redesign `.problem__*` CSS States and Motion

**Files:**
- Modify: `app/assets/css/main.css`

- [x] Replace/upgrade the problem section style block to match Control Room direction.
- [x] Add phase-specific styling for fragmentation, convergence, and control.
- [x] Add bridge/phase-meter visual behavior tied to scene phase/step.
- [x] Add compact-screen adjustments and reduced-motion safe fallbacks.
- [x] Ensure no layout shift on hover/focus transitions.

### Task 4: Verification

**Files:**
- Validate: `app/components/home/ProblemSection.vue`
- Validate: `app/composables/useProblemScrollScene.client.ts`
- Validate: `app/assets/css/main.css`

- [x] Run search checks for inline style regressions in modified files.
- [x] Run project checks (`npm run lint` if available, `npm run build`).
- [x] Report any limitations and residual risks.
