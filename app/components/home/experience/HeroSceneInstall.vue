<script setup lang="ts">
import { computed } from "vue";
import { gsap } from "gsap";
import HeroLiquidOrbWebgl from "~/components/home/experience/HeroLiquidOrbWebgl.client.vue";
import HeroSceneShellBase from "~/components/home/experience/HeroSceneShellBase.vue";

type MenuItem = {
  key: string;
  label: string;
  icon: string;
  active: boolean;
};

const props = defineProps<{
  progress: number;
  brandName: string;
  searchAriaLabel: string;
  searchPlaceholder: string;
  navigationAriaLabel: string;
  menuItems: MenuItem[];
  breadcrumb: string;
  profileName: string;
  topbarLabel: string;
  steps: string[];
}>();

const installCutoff = 0.46;

const installPhaseProgress = computed(() =>
  Math.min(1, props.progress / installCutoff)
);

const installMode = computed(() => props.progress < installCutoff);

const activeStepIndex = computed(() =>
  Math.min(props.steps.length - 1, Math.floor(installPhaseProgress.value * props.steps.length))
);

const currentStep = computed(() => props.steps[activeStepIndex.value] ?? "");
const onStepBeforeEnter = (element: Element) => {
  gsap.set(element, {
    y: 18,
    autoAlpha: 0,
    filter: "blur(2.2px)"
  });
};

const onStepEnter = (element: Element, done: () => void) => {
  gsap.to(element, {
    y: 0,
    autoAlpha: 1,
    filter: "blur(0px)",
    duration: 0.44,
    ease: "power4.out",
    onComplete: done
  });
};

const onStepLeave = (element: Element, done: () => void) => {
  gsap.to(element, {
    y: -18,
    autoAlpha: 0,
    filter: "blur(2px)",
    duration: 0.62,
    ease: "power2.inOut",
    onComplete: done
  });
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const onOverlayBeforeEnter = (element: Element) => {
  gsap.set(element, { autoAlpha: 0 });
};

const onOverlayEnter = (element: Element, done: () => void) => {
  gsap.to(element, {
    autoAlpha: 1,
    duration: 0.24,
    ease: "power2.out",
    onComplete: done
  });
};

const onOverlayBeforeLeave = (element: Element) => {
  gsap.set(element, {
    autoAlpha: 1,
    clipPath: "inset(0% 0% 0% 0%)"
  });

  const flash = element.querySelector(".hero-scene-install__exit-flash");
  if (flash) gsap.set(flash, { autoAlpha: 0 });

  const wave = element.querySelector(".hero-scene-install__exit-wave");
  if (wave) gsap.set(wave, { autoAlpha: 0 });
};

const onOverlayLeave = (element: Element, done: () => void) => {
  if (prefersReducedMotion()) {
    gsap.set(element, { autoAlpha: 0 });
    done();
    return;
  }

  const panel = element.querySelector(".hero-scene-install__panel");
  const orb = element.querySelector(".hero-scene-install__ring-wrap");
  const orbRim = element.querySelector(".hero-liquid-orb__rim");
  const status = element.querySelector(".hero-scene-install__status");
  const stepTicker = element.querySelector(".hero-scene-install__step-current-wrap");
  const flash = element.querySelector(".hero-scene-install__exit-flash");
  const wave = element.querySelector(".hero-scene-install__exit-wave");

  const timeline = gsap.timeline({ onComplete: done });

  if (flash) {
    timeline.to(
      flash,
      {
        autoAlpha: 0.5,
        duration: 0.2,
        ease: "power2.out"
      },
      0.12
    );
    timeline.to(
      flash,
      {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.out"
      },
      0.28
    );
  }

  if (stepTicker) {
    timeline.to(
      stepTicker,
      {
        scale: 1.03,
        transformOrigin: "center center",
        duration: 0.24,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      },
      0
    );
  }

  if (orb) {
    timeline.to(
      orb,
      {
        scale: 1.26,
        rotation: 12,
        filter: "brightness(1.22) saturate(1.18)",
        duration: 0.56,
        ease: "power3.out"
      },
      0.06
    );
  }

  if (orbRim) {
    timeline.to(
      orbRim,
      {
        boxShadow: "0 0 0 16px rgba(59, 130, 246, 0.22), 0 0 42px rgba(37, 99, 235, 0.35)",
        borderColor: "rgba(147, 197, 253, 0.92)",
        duration: 0.5,
        ease: "power2.out"
      },
      0.08
    );
  }

  if (status) {
    timeline.to(
      status,
      {
        y: -12,
        duration: 0.76,
        ease: "power2.inOut"
      },
      0.22
    );
  }

  if (panel) {
    timeline.to(
      panel,
      {
        y: -58,
        scale: 0.965,
        autoAlpha: 0.84,
        duration: 1.34,
        ease: "power2.inOut"
      },
      0.24
    );
  }

  if (wave && orb) {
    const overlayRect = element.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();
    const centerX = orbRect.left + orbRect.width / 2 - overlayRect.left;
    const centerY = orbRect.top + orbRect.height / 2 - overlayRect.top;
    const maxX = Math.max(centerX, overlayRect.width - centerX);
    const maxY = Math.max(centerY, overlayRect.height - centerY);
    const maxRadius = Math.hypot(maxX, maxY) * 1.12;

    gsap.set(wave, {
      autoAlpha: 1,
      clipPath: `circle(0px at ${centerX}px ${centerY}px)`,
      scale: 0.78,
      rotation: -16,
      transformOrigin: "50% 50%",
      filter: "saturate(1.05) blur(0px)"
    });

    timeline.to(
      wave,
      {
        clipPath: `circle(${maxRadius}px at ${centerX}px ${centerY}px)`,
        scale: 1.18,
        rotation: 14,
        filter: "saturate(1.22) blur(0.6px)",
        duration: 1.28,
        ease: "power2.inOut"
      },
      0.24
    );
  }

  timeline.to(
    element,
    {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 1.36,
      ease: "power2.inOut"
    },
    0.24
  );
};

</script>

<template>
  <div class="hero-scene-install">
    <HeroSceneShellBase
      :brand-name="brandName"
      :search-aria-label="searchAriaLabel"
      :search-placeholder="searchPlaceholder"
      :navigation-aria-label="navigationAriaLabel"
      :menu-items="menuItems"
      :breadcrumb="breadcrumb"
      :profile-name="profileName"
      variant="blank"
      headline=""
      subline=""
    />

    <transition
      :css="false"
      @before-enter="onOverlayBeforeEnter"
      @enter="onOverlayEnter"
      @before-leave="onOverlayBeforeLeave"
      @leave="onOverlayLeave"
    >
      <div v-if="installMode" class="hero-scene-install__overlay">
        <span class="hero-scene-install__exit-flash" aria-hidden="true"></span>
        <span class="hero-scene-install__exit-wave" aria-hidden="true"></span>
        <div class="hero-scene-install__topbar" aria-hidden="true">
          <span class="hero-scene-install__topbar-label">{{ topbarLabel }}</span>
          <span class="hero-scene-install__topbar-dots">
            <span class="hero-scene-install__topbar-dot"></span>
            <span class="hero-scene-install__topbar-dot"></span>
            <span class="hero-scene-install__topbar-dot"></span>
          </span>
        </div>
        <div class="hero-scene-install__panel">
          <div class="hero-scene-install__ring-wrap" aria-hidden="true">
            <HeroLiquidOrbWebgl :progress="installPhaseProgress" />
          </div>

          <div class="hero-scene-install__status">
            <div class="hero-scene-install__step-current-wrap">
              <transition
                mode="out-in"
                @before-enter="onStepBeforeEnter"
                @enter="onStepEnter"
                @leave="onStepLeave"
              >
                <p :key="`${currentStep}-${activeStepIndex}`" class="hero-scene-install__step-current">
                  <span class="hero-scene-install__step-label">{{ currentStep }}</span>
                </p>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>
