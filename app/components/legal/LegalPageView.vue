<script setup lang="ts">
type LegalSection = {
  heading: string;
  paragraphs: string[];
};

defineProps<{
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}>();
</script>

<template>
  <section class="section legal-page__section section--dark-guides">
    <span class="dots-layer" aria-hidden="true" />
    <div class="container legal-page__container">
      <article class="legal-page__card surface-pastel">
        <header class="legal-page__header">
          <h1 class="section__title legal-page__title">{{ title }}</h1>
          <p class="legal-page__intro typo-p-body-muted">{{ intro }}</p>
          <p class="legal-page__updated typo-p-micro-muted">{{ updatedAt }}</p>
        </header>

        <div class="legal-page__body">
          <section v-for="section in sections" :key="section.heading" class="legal-page__block">
            <h2 class="legal-page__heading typo-h3-sm">{{ section.heading }}</h2>
            <p v-for="paragraph in section.paragraphs" :key="paragraph" class="legal-page__paragraph typo-p-body-muted">
              {{ paragraph }}
            </p>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.legal-page__section {
  padding-top: clamp(4.5rem, 7vw, 6rem);
  padding-bottom: 0;
}

.legal-page__container {
  position: relative;
  z-index: 1;
  padding-inline: var(--content-inset);
}

.legal-page__card {
  border: 1px solid var(--surface-border-subtle);
  border-radius: var(--surface-radius-panel);
  padding: clamp(1rem, 2.2vw, 1.75rem);
  max-width: min(100%, 74rem);
  margin-inline: auto;
  overflow: hidden;
}

.legal-page__card.surface-pastel::before {
  content: none;
}

.legal-page__header {
  display: grid;
  gap: var(--space-2);
  margin-bottom: 1.1rem;
}

.legal-page__title {
  margin-bottom: var(--space-1);
  max-width: none;
}

.legal-page__intro,
.legal-page__updated,
.legal-page__paragraph {
  margin: 0;
}

.legal-page__updated {
  color: rgb(var(--color-midnight-500-ch) / 0.62);
}

.legal-page__body {
  display: grid;
  gap: var(--space-4);
}

.legal-page__block {
  display: grid;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--surface-border-subtle);
}

.legal-page__heading {
  margin: 0;
}

@media (max-width: 60em) {
  .legal-page__card {
    border-radius: var(--surface-radius-card);
    padding: 1rem;
  }

  .legal-page__section {
    padding-top: clamp(4rem, 9vw, 5rem);
  }
}
</style>
