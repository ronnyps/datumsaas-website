<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  secondaryButtonLabel: string;
  microTrust?: string;
}>();
</script>

<template>
  <section id="contact" class="section cta" data-aida="action">
    <div class="container cta__panel content-stack content-stack--6">
      <h2 class="section__title">{{ title }}</h2>
      <p class="cta__text typo-p-body-muted">{{ description }}</p>
      <div class="cta__actions">
        <a class="btn btn--primary" data-cta="action-primary" :href="buttonHref">{{ buttonLabel }}</a>
        <a class="btn btn--ghost" href="#contact">{{ secondaryButtonLabel }}</a>
      </div>
      <p v-if="microTrust" class="cta__micro-trust typo-p-micro">{{ microTrust }}</p>
    </div>
  </section>
</template>
