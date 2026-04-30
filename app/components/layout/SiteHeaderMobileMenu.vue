<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";

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

function setLinkRef(el: Element | null) {
  if (!(el instanceof HTMLElement)) return;
  if (!linkEls.value.includes(el)) linkEls.value.push(el);
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
  gsap.set(panelEl.value, { yPercent: -6, autoAlpha: 0.01 });
  gsap.set(linkEls.value, { y: 16, autoAlpha: 0 });
  gsap.to(overlayEl.value, {
    autoAlpha: 1,
    duration: 0.3,
    ease: "power2.out",
  });
  gsap.to(panelEl.value, {
    yPercent: 0,
    autoAlpha: 1,
    duration: 0.46,
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
    yPercent: -4,
    autoAlpha: 0.01,
    duration: 0.28,
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
          <a
            v-for="link in nav"
            :ref="setLinkRef"
            :key="link.href"
            class="site-mobile-menu__link"
            :href="link.href"
            @click="animateClose"
          >
            {{ link.label }}
          </a>
        </nav>
        <div class="site-mobile-menu__actions">
          <a :ref="setLinkRef" class="site-mobile-menu__signin" :href="signInHref" @click="animateClose">{{ signInLabel }}</a>
          <a :ref="setLinkRef" class="site-mobile-menu__contact" :href="contactHref" @click="animateClose">{{ contactLabel }}</a>
          <a :ref="setLinkRef" class="site-mobile-menu__lang" :href="switchHref" @click="animateClose">{{ switchLabel }}</a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
