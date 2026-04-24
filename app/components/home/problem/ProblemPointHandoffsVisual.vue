<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { ShieldExclamationIcon } from "@heroicons/vue/24/outline";
import DocFileGlyph from "~/components/home/problem/DocFileGlyph.vue";
import RolePointerTag from "~/components/shared/RolePointerTag.vue";
import {
  ROLE_POINTER_ROLES,
  type RolePointerRoleKey
} from "~/data/role-pointer-roles";

const props = defineProps<{
  active?: boolean;
  locale?: "en" | "es";
}>();

type GsapInstance = typeof import("gsap").gsap;
type GsapTimeline = import("gsap").gsap.core.Timeline;

type DocFileType = "pdf" | "doc" | "xls" | "ppt" | "txt" | "csv" | "zip" | "json";

const documentTiles: DocFileType[] = [
  "pdf", "doc", "xls",
  "ppt", "txt", "csv",
  "zip", "json", "doc"
];

type HandoffPhase = "idle" | "enter" | "click" | "exit";
type LinkPhase = "idle" | "wire" | "error";

type GridCell = {
  index: number;
  row: number;
  col: number;
};

type PointerRouteSide = "left" | "right" | "top" | "bottom";
type PointerRouteKey =
  | "left-high"
  | "left-mid"
  | "left-low"
  | "right-high"
  | "right-mid"
  | "right-low"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
type PointerCurveKey = "curve-a" | "curve-b" | "curve-c" | "curve-d";

type PointerRoute = {
  key: PointerRouteKey;
  side: PointerRouteSide;
};

const ENTER_MS = 1260;
const CLICK_MS = 480;
const WIRE_MS = 1320;
const ERROR_HOLD_MS = 1000;
const ERROR_FADE_MS = 760;
const ERROR_MS = ERROR_HOLD_MS + ERROR_FADE_MS;
const EXIT_MS = 1480;
const REST_MS = 280;
const INTRO_START_DELAY_MS = 560;
const BLOCK_MS = Math.max(EXIT_MS, WIRE_MS + ERROR_MS);
const CYCLE_MS = ENTER_MS + CLICK_MS + BLOCK_MS + REST_MS;
const MAX_TARGET_PAIR_ATTEMPTS = 10;

const gridCells: GridCell[] = [
  { index: 0, row: 0, col: 0 },
  { index: 1, row: 0, col: 1 },
  { index: 2, row: 0, col: 2 },
  { index: 3, row: 1, col: 0 },
  { index: 4, row: 1, col: 1 },
  { index: 5, row: 1, col: 2 },
  { index: 6, row: 2, col: 0 },
  { index: 7, row: 2, col: 1 },
  { index: 8, row: 2, col: 2 }
];

const roleKeys = (Object.keys(ROLE_POINTER_ROLES) as RolePointerRoleKey[]).filter((roleKey) => roleKey !== "you");
const pointerRoutes: PointerRoute[] = [
  { key: "left-high", side: "left" },
  { key: "left-mid", side: "left" },
  { key: "left-low", side: "left" },
  { key: "right-high", side: "right" },
  { key: "right-mid", side: "right" },
  { key: "right-low", side: "right" },
  { key: "top-left", side: "top" },
  { key: "top-right", side: "top" },
  { key: "bottom-left", side: "bottom" },
  { key: "bottom-right", side: "bottom" }
];
const pointerCurves: PointerCurveKey[] = ["curve-a", "curve-b", "curve-c", "curve-d"];

const pointerRoleA = ref<RolePointerRoleKey>("ceo");
const pointerRoleB = ref<RolePointerRoleKey>("hr");
const pointerATargetIndex = ref<number>(0);
const pointerBTargetIndex = ref<number>(8);
const pointerPhase = ref<HandoffPhase>("idle");
const linkPhase = ref<LinkPhase>("idle");
const pointerAEntryRoute = ref<PointerRouteKey>("left-high");
const pointerAExitRoute = ref<PointerRouteKey>("top-right");
const pointerBEntryRoute = ref<PointerRouteKey>("right-low");
const pointerBExitRoute = ref<PointerRouteKey>("top-left");
const pointerACurve = ref<PointerCurveKey>("curve-a");
const pointerBCurve = ref<PointerCurveKey>("curve-c");
const introEntered = ref(false);
const wirePathAEl = ref<SVGPathElement | null>(null);
const wirePathBEl = ref<SVGPathElement | null>(null);
const conflictBadgeEl = ref<HTMLElement | null>(null);
const handoffsRootEl = ref<HTMLElement | null>(null);

let gsapRef: GsapInstance | null = null;
let libsLoadingPromise: Promise<void> | null = null;
let isCycleRunning = false;

const isHighlightPhase = computed(() => {
  const pointerFocused = pointerPhase.value === "click" || pointerPhase.value === "exit";
  const linkFocused = linkPhase.value === "wire" || linkPhase.value === "error";
  return pointerFocused || linkFocused;
});

const targetAxisPositions = [16.5, 50, 83.5] as const;
const conflictAxisPositions = [16.5, 33.25, 50, 66.75, 83.5] as const;

const pointerATargetPoint = computed(() => {
  const targetCell = gridCells[pointerATargetIndex.value];
  if (!targetCell) return { x: 50, y: 50 };
  return {
    x: targetAxisPositions[targetCell.col] ?? 50,
    y: targetAxisPositions[targetCell.row] ?? 50
  };
});

const pointerBTargetPoint = computed(() => {
  const targetCell = gridCells[pointerBTargetIndex.value];
  if (!targetCell) return { x: 50, y: 50 };
  return {
    x: targetAxisPositions[targetCell.col] ?? 50,
    y: targetAxisPositions[targetCell.row] ?? 50
  };
});

const conflictPoint = computed(() => {
  const a = pointerATargetPoint.value;
  const b = pointerBTargetPoint.value;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
});

function findClosestAxisIndex(value: number): number {
  let closestIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < conflictAxisPositions.length; index += 1) {
    const axisValue = conflictAxisPositions[index];
    if (typeof axisValue !== "number") continue;
    const distance = Math.abs(axisValue - value);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

const conflictXIndex = computed(() => findClosestAxisIndex(conflictPoint.value.x));
const conflictYIndex = computed(() => findClosestAxisIndex(conflictPoint.value.y));

const wirePathA = computed(() => {
  const a = pointerATargetPoint.value;
  const c = conflictPoint.value;
  return `M ${a.x} ${a.y} L ${c.x} ${a.y} L ${c.x} ${c.y}`;
});

const wirePathB = computed(() => {
  const b = pointerBTargetPoint.value;
  const c = conflictPoint.value;
  return `M ${b.x} ${b.y} L ${b.x} ${c.y} L ${c.x} ${c.y}`;
});

const scheduledTimers: ReturnType<typeof setTimeout>[] = [];
let wireTimeline: GsapTimeline | null = null;
let conflictTimeline: GsapTimeline | null = null;
let introStartTimeoutId: ReturnType<typeof setTimeout> | null = null;

function getGsap() {
  return gsapRef;
}

async function loadAnimationLibs() {
  if (gsapRef) return;
  if (!libsLoadingPromise) {
    libsLoadingPromise = Promise.all([
      import("gsap"),
      import("gsap/DrawSVGPlugin")
    ]).then(([gsapModule, drawSvgModule]) => {
      gsapRef = gsapModule.gsap;
      gsapRef.registerPlugin(drawSvgModule.DrawSVGPlugin);
    });
  }
  await libsLoadingPromise;
}

function scheduleStep(fn: () => void, delayMs: number) {
  const timer = setTimeout(fn, delayMs);
  scheduledTimers.push(timer);
}

function scheduleCycleStep(fn: () => void, delayMs: number) {
  scheduleStep(() => {
    if (!isCycleRunning) return;
    fn();
  }, delayMs);
}

function clearScheduledSteps() {
  while (scheduledTimers.length > 0) {
    const timer = scheduledTimers.pop();
    if (!timer) continue;
    clearTimeout(timer);
  }
}

function clearIntroStartTimeout() {
  if (!introStartTimeoutId) return;
  clearTimeout(introStartTimeoutId);
  introStartTimeoutId = null;
}

function clearWireTimeline() {
  if (!wireTimeline) return;
  wireTimeline.kill();
  wireTimeline = null;
}

function clearConflictTimeline() {
  if (!conflictTimeline) return;
  conflictTimeline.kill();
  conflictTimeline = null;
}

function resetWirePaths() {
  const pathA = wirePathAEl.value;
  const pathB = wirePathBEl.value;
  const gsap = getGsap();
  if (!pathA || !pathB) return;
  clearWireTimeline();
  if (!gsap) return;
  gsap.killTweensOf([pathA, pathB]);
  gsap.set([pathA, pathB], {
    clearProps: "strokeDasharray,strokeDashoffset,opacity"
  });
}

function resetConflictBadge() {
  const badge = conflictBadgeEl.value;
  const gsap = getGsap();
  if (!badge) return;
  clearConflictTimeline();
  if (!gsap) return;
  const icon = badge.querySelector(".problem-handoffs__conflict-icon") as HTMLElement | null;
  gsap.killTweensOf(badge);
  if (icon) gsap.killTweensOf(icon);
  gsap.set(badge, { clearProps: "opacity,visibility,transform" });
  if (icon) gsap.set(icon, { clearProps: "opacity,visibility,transform" });
}

function playConflictBadgeAnimation() {
  const badge = conflictBadgeEl.value;
  const gsap = getGsap();
  if (!badge || !gsap) return;
  const icon = badge.querySelector(".problem-handoffs__conflict-icon") as HTMLElement | null;

  clearConflictTimeline();
  gsap.killTweensOf(badge);
  if (icon) gsap.killTweensOf(icon);

  conflictTimeline = gsap.timeline();
  conflictTimeline.set(
    badge,
    {
      scale: 0.9,
      y: 2,
      transformOrigin: "50% 50%"
    },
    0
  );

  if (icon) {
    conflictTimeline.set(
      icon,
      {
        autoAlpha: 0,
        scale: 0.78,
        rotate: -8,
        transformOrigin: "50% 50%"
      },
      0
    );
  }

  conflictTimeline.to(
    badge,
    {
      scale: 1,
      y: 0,
      duration: 0.32,
      ease: "power2.out"
    },
    0
  );

  if (icon) {
    conflictTimeline.to(
      icon,
      {
        autoAlpha: 1,
        scale: 1,
        rotate: 0,
        duration: 0.38,
        ease: "power3.out"
      },
      0.04
    );
  }

  conflictTimeline.to(
    badge,
    {
      autoAlpha: 0,
      scale: 0.96,
      duration: ERROR_FADE_MS / 1000,
      ease: "power2.out"
    },
    `+=${ERROR_HOLD_MS / 1000}`
  );

  if (icon) {
    conflictTimeline.to(
      icon,
      {
        autoAlpha: 0,
        scale: 0.92,
        duration: ERROR_FADE_MS / 1000,
        ease: "power2.out"
      },
      `<`
    );
  }
}

function playWireDrawAnimation() {
  const pathA = wirePathAEl.value;
  const pathB = wirePathBEl.value;
  const gsap = getGsap();
  if (!pathA || !pathB || !gsap) return;

  clearWireTimeline();
  gsap.killTweensOf([pathA, pathB]);
  gsap.set([pathA, pathB], {
    opacity: 1,
    drawSVG: "0% 0%"
  });

  wireTimeline = gsap.timeline();
  wireTimeline.to([pathA, pathB], {
    drawSVG: "0% 100%",
    duration: WIRE_MS / 1000,
    ease: "none"
  });
}

function playWireErrorFadeAnimation() {
  const pathA = wirePathAEl.value;
  const pathB = wirePathBEl.value;
  const gsap = getGsap();
  if (!pathA || !pathB || !gsap) return;

  clearWireTimeline();
  gsap.killTweensOf([pathA, pathB]);
  gsap.set([pathA, pathB], {
    drawSVG: "0% 100%",
    opacity: 1
  });

  wireTimeline = gsap.timeline();
  wireTimeline.to({}, { duration: ERROR_HOLD_MS / 1000 });
  wireTimeline.to([pathA, pathB], {
    opacity: 0,
    duration: ERROR_FADE_MS / 1000,
    ease: "power2.out"
  });
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pickRandomRole(exclude?: RolePointerRoleKey): RolePointerRoleKey {
  if (!exclude) return roleKeys[randomInt(roleKeys.length)] ?? "ceo";
  const candidates = roleKeys.filter((roleKey) => roleKey !== exclude);
  const randomIndex = randomInt(candidates.length);
  return candidates[randomIndex] ?? exclude;
}

function pickRoute(excludeSide?: PointerRouteSide): PointerRoute {
  if (!excludeSide) return pointerRoutes[randomInt(pointerRoutes.length)] ?? pointerRoutes[0];
  const candidates = pointerRoutes.filter((route) => route.side !== excludeSide);
  return candidates[randomInt(candidates.length)] ?? pointerRoutes[0];
}

function pickCurve(exclude?: PointerCurveKey): PointerCurveKey {
  if (!exclude) return pointerCurves[randomInt(pointerCurves.length)] ?? "curve-a";
  const candidates = pointerCurves.filter((curve) => curve !== exclude);
  return candidates[randomInt(candidates.length)] ?? exclude;
}

function isAdjacentByChebyshev(a: GridCell, b: GridCell): boolean {
  const rowDelta = Math.abs(a.row - b.row);
  const colDelta = Math.abs(a.col - b.col);
  return Math.max(rowDelta, colDelta) === 1;
}

function pickValidTargetPair(): [number, number] {
  for (let attempt = 0; attempt < MAX_TARGET_PAIR_ATTEMPTS; attempt += 1) {
    const targetA = gridCells[randomInt(gridCells.length)];
    if (!targetA) continue;

    const validCandidates = gridCells.filter((candidate) => {
      if (candidate.index === targetA.index) return false;
      return !isAdjacentByChebyshev(targetA, candidate);
    });

    if (validCandidates.length === 0) continue;

    const targetB = validCandidates[randomInt(validCandidates.length)];
    if (!targetB) continue;

    return [targetA.index, targetB.index];
  }

  return [0, 8];
}

function rotatePointerRoles() {
  const nextRoleA = pickRandomRole(pointerRoleB.value);
  const nextRoleB = pickRandomRole(nextRoleA);

  pointerRoleA.value = nextRoleA;
  pointerRoleB.value = nextRoleB;
}

function rotatePointerRoutes() {
  const entryA = pickRoute();
  const entryB = pickRoute(entryA.side);
  const exitA = pickRoute(entryA.side);
  const exitB = pickRoute(entryB.side);

  pointerAEntryRoute.value = entryA.key;
  pointerAExitRoute.value = exitA.key;
  pointerBEntryRoute.value = entryB.key;
  pointerBExitRoute.value = exitB.key;
}

function rotatePointerCurves() {
  const nextCurveA = pickCurve();
  const nextCurveB = pickCurve(nextCurveA);
  pointerACurve.value = nextCurveA;
  pointerBCurve.value = nextCurveB;
}

function runCycle() {
  if (!isCycleRunning) return;
  const [targetA, targetB] = pickValidTargetPair();
  pointerATargetIndex.value = targetA;
  pointerBTargetIndex.value = targetB;
  rotatePointerRoles();
  rotatePointerRoutes();
  rotatePointerCurves();
  pointerPhase.value = "idle";
  linkPhase.value = "idle";
  resetWirePaths();
  resetConflictBadge();

  scheduleCycleStep(() => {
    pointerPhase.value = "enter";
  }, 24);

  scheduleCycleStep(() => {
    pointerPhase.value = "click";
  }, ENTER_MS);

  scheduleCycleStep(() => {
    pointerPhase.value = "exit";
    linkPhase.value = "wire";
    playWireDrawAnimation();
  }, ENTER_MS + CLICK_MS);

  scheduleCycleStep(() => {
    linkPhase.value = "error";
    playWireErrorFadeAnimation();
    playConflictBadgeAnimation();
  }, ENTER_MS + CLICK_MS + WIRE_MS);

  scheduleCycleStep(() => {
    linkPhase.value = "idle";
    resetWirePaths();
  }, ENTER_MS + CLICK_MS + WIRE_MS + ERROR_MS);

  scheduleCycleStep(() => {
    runCycle();
  }, CYCLE_MS);
}

function stopCycle() {
  isCycleRunning = false;
  clearIntroStartTimeout();
  clearScheduledSteps();
  clearWireTimeline();
  clearConflictTimeline();
  introEntered.value = false;
  pointerPhase.value = "idle";
  linkPhase.value = "idle";
  resetWirePaths();
  resetConflictBadge();
}

function triggerIntro() {
  if (typeof window === "undefined") {
    introEntered.value = true;
    return;
  }

  if (prefersReducedMotion.value) {
    introEntered.value = true;
    return;
  }

  introEntered.value = false;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      introEntered.value = true;
    });
  });
}

async function startCycleIfEligible() {
  if (!isActive.value) return;
  if (!isInViewport.value) return;
  if (isCycleRunning) return;
  await loadAnimationLibs();
  if (!isActive.value || !isInViewport.value || isCycleRunning) return;
  triggerIntro();
  isCycleRunning = true;
  clearIntroStartTimeout();
  introStartTimeoutId = setTimeout(() => {
    introStartTimeoutId = null;
    if (!isCycleRunning) return;
    runCycle();
  }, INTRO_START_DELAY_MS);
}

const isActive = computed(() => Boolean(props.active ?? true));
const { isInViewport, prefersReducedMotion } = useViewportAnimationGate({
  target: handoffsRootEl,
  active: isActive,
  threshold: 0.2,
  rootMargin: "0px 0px -10% 0px",
  onStart: () => {
    void startCycleIfEligible();
  },
  onStop: () => {
    stopCycle();
  }
});

onUnmounted(() => {
  stopCycle();
});
</script>

<template>
  <article class="problem-visual problem-visual--handoffs surface-pastel">
    <div ref="handoffsRootEl" class="problem-handoffs" :class="{ 'problem-handoffs--entered': introEntered }" aria-hidden="true">
      <svg
        class="problem-handoffs__links"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        :class="[
          linkPhase === 'wire' && 'problem-handoffs__links--wire',
          linkPhase === 'error' && 'problem-handoffs__links--error'
        ]"
      >
        <path ref="wirePathAEl" class="problem-handoffs__link problem-handoffs__link--a" :d="wirePathA" pathLength="100" />
        <path ref="wirePathBEl" class="problem-handoffs__link problem-handoffs__link--b" :d="wirePathB" pathLength="100" />
      </svg>

      <div
        ref="conflictBadgeEl"
        class="problem-handoffs__conflict-badge"
        :class="[
          linkPhase === 'error' && 'problem-handoffs__conflict-badge--visible',
          `problem-handoffs__conflict-badge--x-${conflictXIndex}`,
          `problem-handoffs__conflict-badge--y-${conflictYIndex}`
        ]"
      >
        <ShieldExclamationIcon class="problem-handoffs__conflict-icon" aria-hidden="true" />
      </div>

      <div class="problem-handoffs__pointers">
        <div
          class="problem-handoffs__pointer problem-handoffs__pointer--a problem-handoffs__pointer--from-top"
          :class="[
            `problem-handoffs__pointer--target-${pointerATargetIndex}`,
            `problem-handoffs__pointer--entry-${pointerAEntryRoute}`,
            `problem-handoffs__pointer--exit-${pointerAExitRoute}`,
            `problem-handoffs__pointer--${pointerACurve}`,
            `problem-handoffs__pointer--phase-${pointerPhase}`
          ]"
        >
          <RolePointerTag :role-key="pointerRoleA" :lang="locale ?? 'en'" variant="soft" size="sm" :pointer-rotation="0" />
        </div>
        <div
          class="problem-handoffs__pointer problem-handoffs__pointer--b problem-handoffs__pointer--from-bottom"
          :class="[
            `problem-handoffs__pointer--target-${pointerBTargetIndex}`,
            `problem-handoffs__pointer--entry-${pointerBEntryRoute}`,
            `problem-handoffs__pointer--exit-${pointerBExitRoute}`,
            `problem-handoffs__pointer--${pointerBCurve}`,
            `problem-handoffs__pointer--phase-${pointerPhase}`
          ]"
        >
          <RolePointerTag :role-key="pointerRoleB" :lang="locale ?? 'en'" variant="soft" size="sm" :pointer-rotation="-90" />
        </div>
      </div>

      <div class="problem-handoffs__grid" :class="[isHighlightPhase && 'problem-handoffs__grid--focus']">
        <article
          v-for="(fileType, index) in documentTiles"
          :key="`tile-${index}`"
          class="problem-handoffs__tile"
          :class="[
            `problem-handoffs__tile--${fileType}`,
            isHighlightPhase && index === pointerATargetIndex && 'problem-handoffs__tile--target-a',
            isHighlightPhase && index === pointerBTargetIndex && 'problem-handoffs__tile--target-b'
          ]"
        >
          <DocFileGlyph :type="fileType" />
        </article>
      </div>
    </div>
  </article>
</template>
