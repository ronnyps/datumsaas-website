<script setup lang="ts">
import HeroExperienceStage from "~/components/home/HeroExperienceStage.vue";

defineProps<{
  locale: "en" | "es";
  announce: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  microTrust?: string;
}>();
</script>

<template>
  <section class="section hero" data-aida="attention">
    <div class="container hero__container">
      <div class="hero__copy">
        <p class="hero__announce typo-p-announce">{{ announce }}</p>
        <h1 class="hero__title hero__title--wide typo-h1-display">{{ title }}</h1>
        <p class="hero__subtitle typo-p-hero-subtitle">{{ subtitle }}</p>
        <div class="hero__actions">
          <a class="btn btn--primary" data-cta="primary" :href="ctaHref">{{ ctaLabel }}</a>
          <a class="btn btn--ghost" data-cta="secondary" :href="secondaryCtaHref">{{ secondaryCtaLabel }}</a>
        </div>
        <p v-if="microTrust" class="hero__micro-trust typo-p-micro-muted">{{ microTrust }}</p>
      </div>
      <div class="hero__video-shell" aria-label="Video placeholder">
        <HeroExperienceStage :locale="locale" />
      </div>
    </div>
  </section>
</template>
