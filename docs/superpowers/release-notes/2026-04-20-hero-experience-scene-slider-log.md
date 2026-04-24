# DatumSaaS Hero Experience Scene Slider Log
Date: 2026-04-20
Scope: Home hero + bridge synchronization

## Objective
Implement a synchronized hero visual system where:
- the hero visual area (`hero__video-shell`) rotates through 3 scenes,
- bridge cards act as scene selectors,
- autoplay runs every 8 seconds,
- manual interaction pauses autoplay,
- each active bridge card shows a blue timeline progress line.

## Approved Functional Behavior
1. Scene 1 (`Fast start`):
- Futuristic installation animation.
- Status text sequence (system setup, dependencies, data import).
- At the end of the scene, transition fluidly to the base shell state.

2. Scene 2 (`Connected processes`):
- Base shell view with sidebar + topbar and center area reserved.
- Center remains intentionally minimal/blank for now.

3. Scene 3 (`Operational control`):
- Existing metrics dashboard view (current dashboard mock).

4. Playback controls:
- Autoplay cycle every 8 seconds.
- Manual click on any bridge card changes scene immediately.
- Manual interaction pauses autoplay until explicitly resumed in a future iteration.

## Technical Plan Snapshot
- Create shared scene state composable for hero/bridge synchronization.
- Create new hero experience stage component inside `hero__video-shell`.
- Introduce dedicated scene components for install/base/control visual states.
- Add dedicated CSS (no inline styles).
- Keep all user-facing copy externalized in locale data files.

## Constraints
- No inline CSS.
- Keep visual consistency with current design system.
- Maintain existing dashboard mock as one scene (not removed).

## 2026-04-20 Update: WebGL Install Orb (Style B)
- Installed `three` and replaced the install ring with a client-only WebGL liquid orb.
- Added component: `app/components/home/experience/HeroLiquidOrbWebgl.client.vue`.
- Integrated orb into scene 1 install overlay in `HeroSceneInstall.vue`.
- Preserved install progress sync through a circular progress stroke around the orb.
- Kept autoplay/manual scene behavior unchanged.
