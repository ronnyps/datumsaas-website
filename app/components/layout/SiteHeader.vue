<script setup lang="ts">
import { computed } from "vue";
import BrandLogo from "~/components/common/BrandLogo.vue";

const props = defineProps<{
  locale: "en" | "es";
}>();

const nav = computed(() =>
  props.locale === "es"
    ? [
        { label: "Plataforma", href: "#flow" },
        { label: "Como funciona", href: "#demo" },
        { label: "Por que DatumSaaS", href: "#why-us" },
        { label: "Seguridad", href: "#contact" }
      ]
    : [
        { label: "Platform", href: "#flow" },
        { label: "How It Works", href: "#demo" },
        { label: "Why DatumSaaS", href: "#why-us" },
        { label: "Security", href: "#contact" }
      ]
);

const switchLabel = computed(() => (props.locale === "es" ? "EN" : "ES"));
const switchHref = computed(() => (props.locale === "es" ? "/" : "/es"));
const signInLabel = computed(() => (props.locale === "es" ? "Iniciar sesion" : "Sign in"));
const contactLabel = computed(() => (props.locale === "es" ? "Contactar ventas" : "Contact sales"));
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="site-header__brand" href="/">
        <BrandLogo label="DatumSaaS" size="md" variant="dot" />
      </a>

      <nav class="site-header__nav" aria-label="Primary">
        <a
          v-for="link in nav"
          :key="link.href"
          class="site-header__nav-link"
          :href="link.href"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="site-header__actions">
        <a class="site-header__signin" href="#demo">{{ signInLabel }}</a>
        <a class="site-header__contact" href="#contact">{{ contactLabel }}</a>
        <a class="site-header__lang" :href="switchHref">{{ switchLabel }}</a>
      </div>
    </div>
  </header>
</template>
