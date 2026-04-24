<script setup lang="ts">
defineProps<{
  sectionId: string;
  sectionClass: string;
  dataAida: string;
  title: string;
  description: string;
  items: { title: string; description: string }[];
  tone?: "default" | "confidence";
}>();
</script>

<template>
  <section :id="sectionId" class="section" :class="sectionClass" :data-aida="dataAida">
    <div class="container home-section__container">
      <HomeSharedSectionIntro :title="title" :description="description" />
      <div class="info-card-grid">
        <article
          v-for="item in items"
          :key="item.title"
          class="info-card"
          :class="{ 'info-card--confidence': tone === 'confidence' }"
        >
          <h3 class="info-card__title typo-h3-sm">{{ item.title }}</h3>
          <p class="info-card__text typo-p-body-md-muted">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
