# Problem Section Redesign Spec (Control Room, Enterprise Sober)

Date: 2026-04-22  
Status: Approved concept, pending implementation plan  
Scope: `app/components/home/ProblemSection.vue` and related style/animation assets

## 1. Objective

Redesign the home Problem section to communicate a clear transition from disconnected tools to a unified operating ecosystem.  
The section must feel technically robust and elegant, with high-quality motion and microinteractions, while preserving enterprise visual restraint.

## 2. Inputs and Constraints

- Keep the core metaphor: `Disconnected stack` vs `Connected flow`.
- Use advanced motion with GSAP + ScrollTrigger and a short pinned scrollytelling sequence.
- Follow project operating rules in `AGENT.md` and best practices in `docs/superpowers/specs/2026-04-20-datumsaas-best-practices-system.md`.
- No inline presentation styles (`style=""` or Vue `:style` for visual styling).
- Use existing design tokens only (no new tokens without explicit approval).
- Respect accessibility: visible focus, AA contrast, `prefers-reduced-motion`, no hover layout shifts.
- Keep copy source architecture unchanged (no new hardcoded marketing copy outside the approved content flow).

## 3. UX Concept

### 3.1 Core Experience

The section behaves like a compact executive "control room":

- Left side: business narrative (title, supporting description, key pain bullets).
- Right side: visual system comparison with two panels.
- Scroll progression transforms the system from fragmentation to coordinated execution.

### 3.2 Emotional Outcome

- Initial state: friction, delay, operational fragmentation.
- Middle state: synchronization in progress.
- Final state: unified control and predictable execution.

Target emotional read: confidence and operational clarity, not flashy futurism.

## 4. Motion Architecture (Pinned Scrollytelling)

### 4.1 Timeline Phases

1. Fragmentation (0-30%)
- Section pins.
- Disconnected panel appears unstable: offset rows, inconsistent rhythm, muted warning cues.
- Bullets reveal progressively and map to fragmented visual regions.

2. Convergence (30-75%)
- Connector lines bridge from disconnected regions to the connected panel.
- Noise and offset reduce progressively.
- Active bullet drives visual emphasis state.

3. Control (75-100%)
- Connected panel reaches stable synchronized grid/flow state.
- Pulse settles to low-amplitude confidence signal.
- End frame leaves a clear "single ecosystem" mental model.

### 4.2 Scroll Behavior

- Pin duration: approximately one viewport for strong impact without over-holding.
- Scrub: enabled with smooth interpolation for continuity.
- Exit transition: clean release to next section without abrupt jumps.

## 5. Microinteractions

- Bullet hover/focus highlights corresponding system lane in the visual.
- Subtle pulse and line progression in connected panel (no aggressive glow effects).
- Layered depth via minimal parallax between background grid and active flow elements.
- Interaction timing window: approximately 180-260ms for non-scroll micro states.

## 6. Responsive Behavior

### 6.1 Desktop/Tablet

- Full pin + phase-based narrative.
- Side-by-side layout remains primary.

### 6.2 Mobile

- No long pin behavior.
- Convert to sequential reveal model with simplified timeline cues.
- Preserve narrative order and visual metaphor while reducing animation complexity.

## 7. Accessibility and Motion Safety

- `prefers-reduced-motion: reduce`:
  - Disable pin/scrub timeline.
  - Use static or minimal fade-in state changes.
  - Preserve all content and comprehension without motion dependency.
- Ensure keyboard access for interactive bullet buttons.
- Keep focus indicators clearly visible and consistent.
- Do not rely only on color for state distinction.

## 8. Technical Boundaries

- Use composable-based orchestration (`useProblemScrollScene`) as the animation control layer.
- Keep component responsibilities clear:
  - Component markup/state wiring in Vue component.
  - Visual styling in dedicated CSS file(s) under project style structure.
  - Motion timeline logic in composable/client-side animation utilities.
- Avoid introducing runtime style injection for presentational concerns.

## 9. Performance and Quality Targets

- Prioritize GPU-friendly transforms and opacity transitions.
- Avoid layout-triggering animation properties where possible.
- Ensure no measurable layout shift caused by hover/focus transitions.
- Keep the pinned sequence lightweight to protect scroll smoothness.

## 10. Acceptance Criteria

- Visual direction reads as enterprise-sober and technically strong.
- User clearly understands the shift from fragmented tooling to single-ecosystem control.
- GSAP + ScrollTrigger pin narrative runs smoothly on desktop.
- Mobile version remains legible and polished without long pinned behavior.
- `prefers-reduced-motion` path is complete and accessible.
- No inline CSS or token rule violations.
- No accidental copy hardcoding outside approved content architecture.

## 11. Out of Scope

- Rewriting global homepage narrative outside this section.
- Introducing new brand token sets.
- Broad refactors unrelated to this section's UX and animation behavior.


