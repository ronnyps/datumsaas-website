<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  items: { question: string; answer: string }[];
}>();
</script>

<template>
  <section id="faq" class="section faq" data-aida="faq">
    <div class="container home-section__container">
      <HomeSharedSectionIntro :title="title" :description="description" />
      <div class="faq-list">
        <article
          v-for="item in items"
          :key="item.question"
          class="faq-card"
        >
          <h3 class="faq-card__question typo-h3-xs">{{ item.question }}</h3>
          <p class="faq-card__answer typo-p-body-md-muted">{{ item.answer }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
