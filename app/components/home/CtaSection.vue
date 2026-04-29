<script setup lang="ts">
import { ref } from "vue";
import { useDotsHover } from "~/composables/useDotsHover.client";

defineProps<{
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  secondaryButtonLabel: string;
  microTrust?: string;
}>();

const sectionRef = ref<HTMLElement | null>(null);
useDotsHover(sectionRef);
</script>

<template>
  <section id="contact" ref="sectionRef" class="section cta section--dark-guides" data-aida="action">
    <span class="dots-layer" aria-hidden="true" />
    <span class="dots-layer dots-layer--interactive" aria-hidden="true" />
    <div class="container cta__panel content-stack content-stack--6">
      <h2 class="section__title cta__title typo-h1-display">{{ title }}</h2>
      <p class="cta__text typo-p-body-muted">{{ description }}</p>
      <div class="cta__actions">
        <a class="btn btn--primary" data-cta="action-primary" :href="buttonHref">{{ buttonLabel }}</a>
        <a class="btn btn--ghost" href="#contact">{{ secondaryButtonLabel }}</a>
      </div>
      <p v-if="microTrust" class="cta__micro-trust typo-p-micro">{{ microTrust }}</p>
    </div>
  </section>
</template>
