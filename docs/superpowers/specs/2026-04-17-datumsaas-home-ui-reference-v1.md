# DatumSaas Home UI Reference v1

## Status
Approved visual direction for initial Home reference design.

## Intent
Create a high-impact tech-business landing inspired by Stripe, with a sober enterprise tone and strong conversion clarity.

## Chosen Direction
- Hero: abstract premium composition (no product UI mockup as main visual)
- Overall tone: sober enterprise
- Hero background: light dominant
- Hero primary CTA: solid blue button
- Header: minimal sticky transparent/white
- Services: vertical narrative stack (not 3-card grid)
- Why Choose Us: premium dark block with 3-4 differentiators
- Final CTA: commercial block (title + text + button + micro trust)

## Section Blueprint

### 1. Header
- Sticky on scroll.
- Transparent-to-white behavior with subtle blur.
- Compact nav with high legibility.
- Language switch visible and simple (`EN` / `ES`).

### 2. Hero
- Left: value proposition and concise enterprise copy.
- Right/background: abstract geometric/light composition in brand blues.
- One primary CTA (`Request a Demo`) and optional low-emphasis secondary link.
- Spacious vertical rhythm and restrained motion.

### 3. Services (Narrative Vertical)
- Section introduces operational transformation path.
- 3 narrative steps:
- Step 1: unify operations
- Step 2: centralize finance and control
- Step 3: align teams and execution
- Each step includes short benefit and subtle visual marker.

### 4. Why Choose Us (Dark Premium Block)
- Dark surface with strong contrast typography.
- 3-4 differentiators in concise statements.
- Optional minimal proof cue (enterprise-ready, scalable, reliable).
- Keep it compact, authoritative, and non-salesy.

### 5. Final CTA (Commercial)
- Outcome-focused title.
- Supporting paragraph clarifying business value.
- Primary button.
- Micro trust line below CTA (example: response time, no obligation, enterprise-friendly onboarding).

### 6. Footer
- Clean and minimal.
- Legal/copyright + basic links.
- Maintain neutral visual density.

## UI/UX Constraints (ui-ux-pro-max aligned)
- WCAG AA contrast for text and CTA states.
- Visible focus states on all interactive controls.
- Minimum touch target ~44px.
- No layout shift on hover.
- Respect `prefers-reduced-motion`.
- Avoid visual noise and over-decoration.

## Visual Guardrails
- Blue-led system; orange is sparse accent only.
- Do not clone Stripe layouts directly.
- No emoji iconography.
- Keep enterprise trust over “trendy AI” look.

## Next Execution Step
Implement this blueprint in the existing Nuxt Home as visual reference v1, then iterate section-by-section with your content updates.
