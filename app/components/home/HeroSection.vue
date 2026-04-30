<script setup lang="ts">
import { ref } from "vue";
import HeroExperienceStage from "~/components/home/HeroExperienceStage.vue";
import { useHeroIntroLinesMotion } from "~/composables/useHeroIntroLinesMotion";

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

const rootRef = ref<HTMLElement | null>(null);
const visualRef = ref<HTMLElement | null>(null);

useHeroIntroLinesMotion({
  root: rootRef,
  visual: visualRef
});
</script>

<template>
  <section ref="rootRef" class="section hero" data-aida="attention" data-intro="pending">
    <div class="hero__bg-glow" aria-hidden="true"></div>
    <div class="container hero__container">
      <div class="hero__copy">
        <p class="hero__announce typo-p-announce hero-line">
          <span class="hero-line__inner">{{ announce }}</span>
        </p>
        <h1 class="hero__title hero__title--wide typo-h1-display hero-line">
          <span class="hero-line__inner">{{ title }}</span>
        </h1>
        <p class="hero__subtitle typo-p-hero-subtitle hero-line">
          <span class="hero-line__inner">{{ subtitle }}</span>
        </p>
        <div class="hero__actions">
          <a class="btn btn--primary" data-cta="primary" :href="ctaHref">{{
            ctaLabel
          }}</a>
          <a
            class="btn btn--ghost"
            data-cta="secondary"
            :href="secondaryCtaHref"
            >{{ secondaryCtaLabel }}</a
          >
        </div>
        <p v-if="microTrust" class="hero__micro-trust typo-p-micro-muted hero-line">
          <span class="hero-line__inner">{{ microTrust }}</span>
        </p>
      </div>
      <div ref="visualRef" class="hero__video-shell" aria-label="Video placeholder">
        <HeroExperienceStage class="ui-size-full" :locale="locale" />
      </div>
    </div>
  </section>
</template>
