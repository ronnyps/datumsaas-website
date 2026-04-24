# DatumSaas Brand Guidelines v1.2

## Quick Reference
| Item | Value |
|------|-------|
| Primary Color | `#0055FF` (Datum Blue) |
| Secondary Color | `#061027` (Midnight Core) |
| Accent Color | `#FF6600` (Signal Orange, minimal use) |
| Heading Font | `Manrope` |
| Body Font | `Inter` |
| Voice | Clear, competent, outcome-focused, decision-safe |
| Primary Market | U.S.-led and bilingual markets (EN/ES), with Miami as priority context |
| Website Language Routing | `/` = EN, `/es` = ES |

## 1. Brand Core

### Positioning
DatumSaas is a connected operating system for growing businesses that need operational clarity, control, and scalable execution without forced all-at-once migration.

### Personality
- Enterprise trust
- Modern momentum
- Practical intelligence

### Visual Direction
- Inspiration level: medium Stripe-like cleanliness and rhythm.
- Identity rule: no direct visual cloning; keep DatumSaas own brand cues (strong blue system, minimal orange, operational tone).

## 2. Color System

### Primary Colors
| Color | Hex | Usage |
|------|-----|-------|
| **Midnight Core** | #061027 | Deep surfaces, dark hero blocks, premium contrast areas |
| **Blue Anchor** | #001BBA | Supporting deep blue in gradients and emphasis |
| **Datum Blue (Primary)** | #0055FF | Primary CTAs, links, core highlights |
| **Sky Action** | #0092FF | Secondary action and supporting accents |

### Secondary Colors
| Color | Hex | Usage |
|------|-----|-------|
| **Cloud Blue** | #94C5FF | Soft background accents, badges, low-emphasis containers |
| **Mist Blue** | #C7E0FF | Section tint, info backgrounds, subtle contrast blocks |
| **Frost** | #F3F8FF | Main light background variant |

### Accent Colors (minimal)
| Color | Hex | Usage |
|------|-----|-------|
| **Signal Orange** | #FF6600 | Rare highlight moments only |
| **Warm Soft** | #FBB348 | Supporting tone for soft highlight states |

### Neutral Palette
| Color | Hex | Usage |
|------|-----|-------|
| **White** | #FFFFFF | Primary surface, cards |
| **Gray 50** | #F5F5F5 | Neutral section background |
| **Gray 900** | #0F172A | Primary text on light surfaces |
| **Gray 600** | #475569 | Secondary text |
| **Gray 300** | #CBD5E1 | Borders and dividers |

### Accessibility Rules
- Body text contrast must be >= 4.5:1 (WCAG AA).
- CTA text and background must be >= 4.5:1.
- Orange must not be the only visual indicator for status.

## 3. Typography

### Font Stack
```css
--font-heading: "Manrope", sans-serif;
--font-body: "Inter", sans-serif;
--font-mono: "IBM Plex Mono", monospace;
```

### Type Scale
| Element | Font | Weight | Desktop | Mobile | Line Height |
|---------|------|--------|---------|--------|-------------|
| H1 | Manrope | 700 | 56px | 36px | 1.1 |
| H2 | Manrope | 700 | 42px | 30px | 1.15 |
| H3 | Manrope | 600 | 32px | 24px | 1.2 |
| H4 | Manrope | 600 | 24px | 20px | 1.25 |
| Body L | Inter | 400 | 18px | 17px | 1.6 |
| Body | Inter | 400 | 16px | 16px | 1.6 |
| Small | Inter | 500 | 14px | 14px | 1.5 |
| Caption | Inter | 500 | 12px | 12px | 1.4 |

### Typography Rules
- Use Manrope only for headings and high-impact labels.
- Use Inter for all paragraph/UI copy.
- Avoid all-caps blocks except micro labels or tags.

## 4. Layout and Composition

### Grid and Spacing
- Desktop: 12-column grid.
- Tablet: 8-column grid.
- Mobile: 4-column behavior with fixed content gutters.
- Base spacing unit: 8px (`4, 8, 12, 16, 24, 32, 48, 64, 96`).

### Shape Language
- Border radius:
  - Buttons and inputs: 10px
  - Cards: 14px
  - Large panels: 18px
- Shadows: soft and restrained; avoid heavy "floating" look.

### Background Language
- Prefer light, clean backgrounds with subtle blue gradients.
- Use dark sections sparingly to punctuate key narrative blocks.

## 5. Motion (Baseline)

- Transition duration: `150ms-250ms`.
- Easing: `ease-out` for hover/focus, `cubic-bezier(0.22, 1, 0.36, 1)` for section reveals.
- Keep movement functional, not decorative.
- Respect `prefers-reduced-motion`.

## 6. Voice and Tone

### Core Voice
- Clear
- Competent
- Outcome-focused

### Writing Principles
- Lead with business outcomes, not feature lists.
- Use concise, concrete language.
- Avoid hype and inflated claims.
- Reduce switching anxiety with practical, low-risk adoption language.
- Prefer workflow language (`lead -> work -> sale -> payment -> report`) over module dumping.
- When possible, anchor value in near-term windows (first 30-90 days).
- Distinguish implementation speed vs value horizon:
  - Go-live in days (around 5 days, depending on migration complexity)
  - Benefits consolidate over the first 90 days

### Tone by Context
| Context | Tone | Example |
|---------|------|---------|
| Hero | Ambitious and clear | "Unify operations, finance, and teams in one ERP platform." |
| Product blocks | Practical and specific | "Centralize workflows and reduce tool fragmentation." |
| CTA | Direct, specific, low-friction | "Request your 45-min demo" / "Get your go-live plan" |
| Error/support copy | Calm and helpful | "We could not complete this action. Please try again." |

## 7. Do and Don't

### Do
- Keep orange usage minimal and intentional.
- Maintain consistent heading/body font split.
- Preserve generous whitespace and visual rhythm.
- Keep CTA hierarchy clear (one primary action per section).

### Don't
- Do not overload pages with multiple saturated accents.
- Do not use emoji as UI iconography.
- Do not mix multiple visual styles in one page.
- Do not use low-contrast text in light backgrounds.

## 8. QA Checklist

- [ ] Color roles respected (blue-led, orange minimal).
- [ ] Contrast passes WCAG AA.
- [ ] Typography hierarchy follows Manrope/Inter system.
- [ ] Layout spacing follows 8px scale.
- [ ] Motion stays subtle and functional.
- [ ] Copy matches brand voice and U.S. B2B context.

## 9. Messaging Framework (Website MVP)

### Core Promise
One connected platform to run operations, finance, and team execution with clarity and control as the business grows.

### Value Pillars
| Pillar | Meaning | Proof Direction |
|--------|---------|-----------------|
| Operational Clarity | All key workflows in one place | Unified dashboards, shared data model |
| Execution Speed | Less friction between teams and processes | Faster handoffs, fewer disconnected tools |
| Scalable Control | Foundation that grows with operational complexity | Fits growing teams without enterprise rollout burden |

### Message Hierarchy by Section
- Hero: Business outcome first, platform second.
- Services: Practical capability framing with short benefit statements.
- Why Us: Trust + efficiency + growth-readiness.
- CTA: Single high-intent action, no competing CTA in same block.
- Proof blocks: show live workflow fit + phased rollout, never fabricated social proof.

## 10. Bilingual Content Rules (EN/ES)

- Source language is English; Spanish is localization, not literal translation.
- Keep equivalent meaning and conversion intent across both locales.
- Avoid regional slang; prefer neutral, professional Spanish.
- Keep CTA semantics aligned:
  - EN: "Request a Demo", "Talk to Sales", "Get My Go-Live Plan"
  - ES: "Solicitar demo", "Hablar con ventas", "Recibir plan de go-live"
- Use proper UTF-8 encoding in all content files to preserve accents and punctuation.

## 11. UI Brand Application Rules

### Component Intent
- Buttons:
  - Primary: Datum Blue fill + white text.
  - Secondary: white surface + blue border/text.
- Cards:
  - Light surface by default with soft border and restrained shadow.
- Dark panels:
  - Use for emphasis sections only (e.g., Why Us, key differentiator block).

### Visual Rhythm
- Alternate visual density by section (light -> dense -> light).
- Keep one visual focal point per section.
- Prefer structured whitespace over decorative elements.

### Iconography and Imagery
- Icon style: outline or duotone, consistent stroke family.
- No emoji as interface iconography.
- Imagery style: business-operational context, realistic and credible.
- Avoid generic "stock-y success pose" images as primary hero focus.

## 12. SEO + Metadata Brand Rules

- Brand naming in titles:
  - Primary format: `DatumSaas | <Page Value Proposition>`
- Meta description style:
  - 140-160 characters, concrete business outcome, no hype language.
- Locale alternates:
  - EN canonical at `/`
  - ES alternate at `/es`
- Avoid keyword stuffing; use natural B2B language aligned with ERP search intent.

## 13. Governance and Update Workflow

- `docs/brand-guidelines.md` is the brand source of truth.
- Token artifacts must stay aligned:
  - `assets/design-tokens.json`
  - `assets/design-tokens.css`
- Any color/typography/radius change requires:
  1. Update guideline
  2. Update tokens
  3. Verify UI contrast and hierarchy in Home
- Versioning rule:
  - Patch (`v1.0.x`): wording clarifications
  - Minor (`v1.x.0`): new rules/sections
  - Major (`v2.0.0`): identity direction change

## 14. Reference Mix (Approved)

### Influence Weight
- Stripe: 70% (enterprise clarity, layout rhythm, trust-first polish)
- Attio: 20% (product storytelling, modern SaaS energy)
- MiTrust: 10% (credibility cues, compliance/trust framing)

### Selective Inputs
- Tailwind CSS: structure clarity and technical readability only.
- Cartage: selective motion and AI-forward accents only.

### Guardrails
- No direct visual cloning of any reference.
- Keep DatumSaas identity blue-led with minimal orange.
- Avoid over-stylized AI aesthetics in corporate conversion pages.



## 15. Discourse Projection Rules (Commercial Narrative)

### Narrative Position
- We are not "another tool bundle"; we are the operational system connecting the full business flow.
- We prioritize practical control and adoption safety over feature inflation.

### 90-Day Promise Frame
- Organization: clearer process ownership across teams.
- Lead Management: better lead tracking and handoff continuity.
- Sales Execution: cleaner progression from proposal to payment visibility.

### Implementation Speed Frame
- Implementation is not positioned as a 90-day rollout.
- Default framing: teams can start operating in around 5 days after close.
- Always qualify timeline by data migration volume and process complexity.

### Proof Ladder (Pre-Case-Study Stage)
1. Live demo mapped to prospect workflow.
2. Role-based view (leadership, operations, finance/sales).
3. Phased rollout proposal (guided setup + done-with-you + ongoing support).
4. Explicit fit/no-fit recommendation at the end of discovery.

### Claim Integrity Policy
- Do not present fabricated performance numbers, customer counts, or testimonials.
- Use "what we will do" and "how we implement" claims until first-party evidence exists.
- Quantified outcomes may be published only after verification from real deployments.

### Risk-Reduction Language Requirements
- Include low-friction adoption cues near primary CTAs.
- Preferred framing: "Start with one workflow first" and "no forced all-at-once migration."
- Avoid pressure language and false urgency.

