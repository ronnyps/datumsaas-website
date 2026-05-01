<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ShieldCheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  locale: "en" | "es";
}>();

const STORAGE_KEY = "datumsaas-cookie-consent-v1";
const isVisible = ref(false);
let heroObserver: IntersectionObserver | null = null;

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      text: "Usamos cookies para mejorar tu experiencia.",
      accept: "Aceptar",
      reject: "Rechazar",
      close: "Cerrar aviso de cookies"
    };
  }

  return {
    text: "We use cookies to improve your experience.",
    accept: "Accept",
    reject: "Reject",
    close: "Close cookie notice"
  };
});

onMounted(() => {
  if (typeof window === "undefined") return;
  isVisible.value = window.localStorage.getItem(STORAGE_KEY) !== "accepted";

  const heroEl = document.querySelector(".hero");
  if (!heroEl) return;

  heroObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry || !isVisible.value) return;
      if (!entry.isIntersecting) {
        closeWithChoice("accepted");
      }
    },
    { threshold: 0.08 }
  );
  heroObserver.observe(heroEl);
});

function closeWithChoice(choice: "accepted" | "rejected") {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, choice);
  }
  isVisible.value = false;
}

onBeforeUnmount(() => {
  if (heroObserver) {
    heroObserver.disconnect();
    heroObserver = null;
  }
});
</script>

<template>
  <Transition name="cookie-pop">
    <aside
      v-if="isVisible"
      class="site-cookie-notice"
      role="status"
      aria-live="polite"
      :aria-label="copy.close"
    >
      <div class="site-cookie-notice__content">
        <ShieldCheckIcon class="site-cookie-notice__icon" aria-hidden="true" />
        <p class="site-cookie-notice__text">{{ copy.text }}</p>
      </div>
      <div class="site-cookie-notice__actions">
        <button type="button" class="site-cookie-notice__btn site-cookie-notice__btn--ghost" @click="closeWithChoice('rejected')">
          {{ copy.reject }}
        </button>
        <button type="button" class="site-cookie-notice__btn" @click="closeWithChoice('accepted')">
          {{ copy.accept }}
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.site-cookie-notice {
  position: fixed;
  right: clamp(0.75rem, 2vw, 1.25rem);
  bottom: clamp(0.75rem, 2vw, 1.25rem);
  z-index: 90;
  width: min(22rem, calc(100vw - 1.5rem));
  border: 1px solid var(--ink-a10);
  border-radius: 0.6rem;
  background: rgb(var(--color-neutral-0-ch) / 0.96);
  box-shadow: 0 10px 28px var(--ink-a12);
  padding: 0.65rem 0.7rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem;
}

.site-cookie-notice__content {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.site-cookie-notice__icon {
  width: 0.9rem;
  height: 0.9rem;
  color: rgb(var(--color-midnight-500-ch) / 0.64);
  flex: 0 0 auto;
}

.site-cookie-notice__text {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.3;
  color: rgb(var(--color-midnight-500-ch) / 0.76);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-cookie-notice__btn {
  border: 1px solid var(--ink-a12);
  border-radius: 0.45rem;
  background: var(--semantic-primary);
  color: rgb(var(--color-neutral-0-ch) / 1);
  min-height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.site-cookie-notice__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

.site-cookie-notice__btn--ghost {
  background: rgb(var(--color-neutral-0-ch) / 0.96);
  color: rgb(var(--color-midnight-500-ch) / 0.84);
}

.cookie-pop-enter-active,
.cookie-pop-leave-active {
  transition: opacity 220ms ease, transform 240ms ease;
}

.cookie-pop-enter-from,
.cookie-pop-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 60em) {
  .site-cookie-notice {
    left: 0.5rem;
    right: 0.5rem;
    width: auto;
    max-width: none;
    bottom: 0.5rem;
    padding: 0.58rem 0.62rem;
    grid-template-columns: 1fr;
    align-items: center;
    justify-items: center;
    text-align: center;
  }

  .site-cookie-notice__text {
    font-size: 0.75rem;
    white-space: normal;
    text-align: center;
  }

  .site-cookie-notice__btn {
    min-height: 1.9rem;
    padding: 0 0.65rem;
    font-size: 0.74rem;
  }

  .site-cookie-notice__actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    justify-items: stretch;
  }

  .site-cookie-notice__btn {
    width: 100%;
  }
}
</style>
