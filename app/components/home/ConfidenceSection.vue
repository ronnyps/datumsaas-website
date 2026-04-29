<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  items: { title: string; description: string; videoSrc?: string; videoPoster?: string }[];
}>();
</script>

<template>
  <HomeSharedInfoCardSection
    section-id="confidence"
    section-class="confidence"
    data-aida="confidence"
    tone="confidence"
    :title="title"
    :description="description"
    :items="items"
  />
</template>
