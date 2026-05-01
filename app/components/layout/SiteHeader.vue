<script setup lang="ts">
import { computed, ref } from "vue";
import BrandLogo from "~/components/common/BrandLogo.vue";
import SiteHeaderMobileMenu from "~/components/layout/SiteHeaderMobileMenu.vue";
import { useSiteHeaderIntroMotion } from "~/composables/useSiteHeaderIntroMotion";

const props = defineProps<{
  locale: "en" | "es";
}>();

const nav = computed(() =>
  props.locale === "es"
    ? [
        { label: "Plataforma", href: "#flow" },
        { label: "Como funciona", href: "#demo" },
        { label: "Por que DatumSaaS", href: "#why-us" },
        { label: "Seguridad", href: "/es/contact" }
      ]
    : [
        { label: "Platform", href: "#flow" },
        { label: "How It Works", href: "#demo" },
        { label: "Why DatumSaaS", href: "#why-us" },
        { label: "Security", href: "/contact" }
      ]
);

const switchLabel = computed(() => (props.locale === "es" ? "EN" : "ES"));
const switchHref = computed(() => (props.locale === "es" ? "/" : "/es"));
const signInLabel = computed(() => (props.locale === "es" ? "Iniciar sesion" : "Sign in"));
const signInHref = "https://client-bridge.xshow.io/login";
const contactLabel = computed(() => (props.locale === "es" ? "Contactar ventas" : "Contact sales"));
const contactHref = computed(() => (props.locale === "es" ? "/es/contact" : "/contact"));
const isMobileMenuOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

useSiteHeaderIntroMotion({ root: rootRef });
</script>

<template>
  <header ref="rootRef" class="site-header" data-intro="pending">
    <div class="container site-header__inner">
      <NuxtLink class="site-header__brand" to="/">
        <BrandLogo label="DatumSaaS" size="md" variant="dot" />
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Primary">
        <NuxtLink
          v-for="link in nav"
          :key="link.href"
          class="site-header__nav-link"
          :to="link.href"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="site-header__actions">
        <a class="site-header__signin" :href="signInHref" target="_blank" rel="noopener noreferrer">{{ signInLabel }}</a>
        <NuxtLink class="site-header__contact" :to="contactHref">{{ contactLabel }}</NuxtLink>
        <NuxtLink class="site-header__lang" :to="switchHref">{{ switchLabel }}</NuxtLink>
        <button
          type="button"
          class="site-header__burger"
          :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
          aria-controls="site-mobile-menu"
          aria-label="Open menu"
          @click="isMobileMenuOpen = true"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
    <SiteHeaderMobileMenu
      :open="isMobileMenuOpen"
      :nav="nav"
      :sign-in-label="signInLabel"
      :sign-in-href="signInHref"
      :contact-label="contactLabel"
      :contact-href="contactHref"
      :switch-label="switchLabel"
      :switch-href="switchHref"
      @close="isMobileMenuOpen = false"
    />
  </header>
</template>
