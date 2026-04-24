<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="home-section__intro content-stack content-stack--6">
    <h2 class="section__title">{{ title }}</h2>
    <p class="home-section__text typo-p-body-muted">{{ description }}</p>
  </div>
</template>
