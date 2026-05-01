<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import BrandLogo from "~/components/common/BrandLogo.vue";

const props = defineProps<{
  open: boolean;
  nav: Array<{ label: string; href: string }>;
  signInLabel: string;
  signInHref: string;
  contactLabel: string;
  contactHref: string;
  switchLabel: string;
  switchHref: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const overlayEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const linkEls = ref<HTMLElement[]>([]);
let gsapRef: typeof import("gsap").gsap | null = null;
let opening = false;

function setLinkRef(el: unknown) {
  if (!el) return;
  const element =
    el instanceof HTMLElement
      ? el
      : (typeof el === "object" && el !== null && "$el" in el
          ? (el as { $el?: unknown }).$el
          : null);
  if (!(element instanceof HTMLElement)) return;
  if (!linkEls.value.includes(element)) linkEls.value.push(element);
}

async function getGsap() {
  if (gsapRef) return gsapRef;
  const mod = await import("gsap");
  gsapRef = mod.gsap;
  return gsapRef;
}

function clearLinkRefs() {
  linkEls.value = [];
}

function lockBody(locked: boolean) {
  if (typeof document === "undefined") return;
  document.body.style.overflow = locked ? "hidden" : "";
}

async function animateOpen() {
  if (!overlayEl.value || !panelEl.value) return;
  const gsap = await getGsap();
  opening = true;
  lockBody(true);
  gsap.killTweensOf([overlayEl.value, panelEl.value, ...linkEls.value]);
  gsap.set(overlayEl.value, { autoAlpha: 0 });
  gsap.set(panelEl.value, { yPercent: -14, autoAlpha: 0.01 });
  gsap.set(linkEls.value, { y: 16, autoAlpha: 0 });
  gsap.to(overlayEl.value, {
    autoAlpha: 1,
    duration: 0.3,
    ease: "power2.out",
  });
  gsap.to(panelEl.value, {
    yPercent: 0,
    autoAlpha: 1,
    duration: 0.5,
    ease: "power3.out",
  });
  gsap.to(linkEls.value, {
    y: 0,
    autoAlpha: 1,
    duration: 0.34,
    ease: "power2.out",
    stagger: 0.045,
    delay: 0.08,
    onComplete: () => {
      opening = false;
    },
  });
}

async function animateClose() {
  if (!overlayEl.value || !panelEl.value) return;
  const gsap = await getGsap();
  gsap.killTweensOf([overlayEl.value, panelEl.value, ...linkEls.value]);
  gsap.to(linkEls.value, {
    y: 10,
    autoAlpha: 0,
    duration: 0.2,
    ease: "power2.in",
    stagger: 0.02,
  });
  gsap.to(panelEl.value, {
    yPercent: -12,
    autoAlpha: 0.01,
    duration: 0.32,
    ease: "power2.in",
  });
  gsap.to(overlayEl.value, {
    autoAlpha: 0,
    duration: 0.24,
    ease: "power1.inOut",
    onComplete: () => {
      lockBody(false);
      emit("close");
    },
  });
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target !== overlayEl.value) return;
  void animateClose();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !props.open || opening) return;
  void animateClose();
}

watch(
  () => props.open,
  (open) => {
    clearLinkRefs();
    if (!open) {
      lockBody(false);
      return;
    }
    void animateOpen();
  },
);

onBeforeUnmount(() => {
  lockBody(false);
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeydown);
  }
});

if (typeof window !== "undefined") {
  window.addEventListener("keydown", handleKeydown);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="overlayEl"
      class="site-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      @click="handleOverlayClick"
    >
      <div ref="panelEl" class="site-mobile-menu__panel">
        <div class="site-mobile-menu__topbar">
          <NuxtLink class="site-mobile-menu__brand" to="/" @click="animateClose">
            <BrandLogo label="DatumSaaS" size="sm" variant="dot" />
          </NuxtLink>
          <button
            type="button"
            class="site-mobile-menu__close"
            aria-label="Close menu"
            @click="animateClose"
          >
            <span />
            <span />
          </button>
        </div>
        <nav class="site-mobile-menu__nav" aria-label="Primary">
          <NuxtLink
            v-for="link in nav"
            :ref="setLinkRef"
            :key="link.href"
            class="site-mobile-menu__link"
            :to="link.href"
            @click="animateClose"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="site-mobile-menu__actions">
          <NuxtLink :ref="setLinkRef" class="site-mobile-menu__signin" :to="signInHref" @click="animateClose">{{ signInLabel }}</NuxtLink>
          <NuxtLink :ref="setLinkRef" class="site-mobile-menu__contact" :to="contactHref" @click="animateClose">{{ contactLabel }}</NuxtLink>
          <NuxtLink :ref="setLinkRef" class="site-mobile-menu__lang" :to="switchHref" @click="animateClose">{{ switchLabel }}</NuxtLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>
