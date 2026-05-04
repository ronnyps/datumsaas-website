<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  locale: "en" | "es";
}>();
const contactHref = computed(() => (props.locale === "es" ? "/es/contact" : "/contact"));
const asset = useAssetPath();

const STORAGE_KEY = "datumsaas-scroll-cta-dismissed-v1";
const isVisible = ref(false);
const isDismissed = ref(false);
let heroObserver: IntersectionObserver | null = null;
let footerObserver: IntersectionObserver | null = null;
const isHeroIntersecting = ref(true);
const isFooterIntersecting = ref(false);

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      text: "Descubre todo lo que DatumSaaS puede hacer por ti",
      cta: "Pide una demo",
      close: "Cerrar CTA"
    };
  }
  return {
    text: "See everything DatumSaaS can do for you",
    cta: "Book a demo",
    close: "Close CTA"
  };
});

function dismiss() {
  isVisible.value = false;
  isDismissed.value = true;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  }
}

function syncVisibility() {
  if (isDismissed.value) {
    isVisible.value = false;
    return;
  }

  isVisible.value = !isHeroIntersecting.value && !isFooterIntersecting.value;
}

onMounted(() => {
  if (typeof window === "undefined") return;
  isDismissed.value = window.sessionStorage.getItem(STORAGE_KEY) === "1";

  const heroEl = document.querySelector(".hero");
  if (heroEl) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isHeroIntersecting.value = entry.isIntersecting;
        syncVisibility();
      },
      { threshold: 0.12 }
    );
    heroObserver.observe(heroEl);
  }

  const footerEl = document.querySelector(".footer");
  if (footerEl) {
    footerObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isFooterIntersecting.value = entry.isIntersecting;
        syncVisibility();
      },
      { threshold: 0.02 }
    );
    footerObserver.observe(footerEl);
  }

  syncVisibility();
});

onBeforeUnmount(() => {
  if (heroObserver) {
    heroObserver.disconnect();
    heroObserver = null;
  }
  if (footerObserver) {
    footerObserver.disconnect();
    footerObserver = null;
  }
});
</script>

<template>
  <Transition name="scroll-cta-pop">
    <aside v-if="isVisible" class="site-scroll-cta" role="complementary" aria-live="polite">
      <div class="site-scroll-cta__avatars" aria-hidden="true">
        <img :src="asset('/avatarCEO.webp')" alt="" />
        <img :src="asset('/users/Olivia-johnson.webp')" alt="" />
      </div>
      <p class="site-scroll-cta__text">{{ copy.text }}</p>
      <NuxtLink class="site-scroll-cta__button" :to="contactHref">{{ copy.cta }}</NuxtLink>
      <button type="button" class="site-scroll-cta__close" :aria-label="copy.close" @click="dismiss">
        <XMarkIcon />
      </button>
    </aside>
  </Transition>
</template>

<style scoped>
.site-scroll-cta {
  position: fixed;
  left: 50%;
  bottom: 1.05rem;
  transform: translateX(-50%);
  z-index: 85;
  width: fit-content;
  max-width: min(58rem, calc(100vw - 2.5rem));
  min-height: 4rem;
  border-radius: 999px;
  border: 1px solid rgb(var(--color-neutral-0-ch) / 0.2);
  background: rgb(var(--color-midnight-500-ch) / 0.94);
  color: rgb(var(--color-neutral-0-ch) / 0.96);
  box-shadow: 0 16px 36px rgb(var(--color-midnight-500-ch) / 0.26);
  padding: 0.5rem 0.6rem 0.5rem 0.6rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.8rem;
}

.site-scroll-cta__avatars {
  display: inline-flex;
  align-items: center;
  margin-left: 0.2rem;
}

.site-scroll-cta__avatars img {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid rgb(var(--color-neutral-0-ch) / 0.9);
}

.site-scroll-cta__avatars img + img {
  margin-left: -0.45rem;
}

.site-scroll-cta__text {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  max-width: 30rem;
}

.site-scroll-cta__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  padding: 0 1.05rem;
  border-radius: 0.7rem;
  background: rgb(var(--color-neutral-0-ch) / 0.96);
  color: rgb(var(--color-midnight-500-ch) / 0.9);
  font-size: 1rem;
  font-weight: 700;
}

.site-scroll-cta__close {
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgb(var(--color-neutral-0-ch) / 0.78);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.site-scroll-cta__close svg {
  width: 1.2rem;
  height: 1.2rem;
}

.scroll-cta-pop-enter-active,
.scroll-cta-pop-leave-active {
  transition: opacity 220ms ease, transform 240ms ease;
}

.scroll-cta-pop-enter-from,
.scroll-cta-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}

@media (max-width: 60em) {
  .site-scroll-cta {
    width: calc(100vw - 1rem);
    border-radius: 0.9rem;
    bottom: 0.5rem;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.55rem;
    padding: 0.45rem 0.45rem 0.45rem 0.45rem;
  }

  .site-scroll-cta__avatars img {
    width: 1.7rem;
    height: 1.7rem;
  }

  .site-scroll-cta__text {
    font-size: 0.78rem;
    white-space: normal;
    line-height: 1.25;
  }

  .site-scroll-cta__button {
    min-height: 2.2rem;
    font-size: 0.82rem;
    padding: 0 0.72rem;
    border-radius: 0.55rem;
  }

  .site-scroll-cta__close {
    display: none;
  }
}
</style>
