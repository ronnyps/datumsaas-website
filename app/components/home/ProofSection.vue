<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  items: { title: string; description: string; videoSrc?: string; videoPoster?: string }[];
}>();
</script>

<template>
  <HomeSharedInfoCardSection
    section-id="proof"
    section-class="proof"
    data-aida="proof"
    :title="title"
    :description="description"
    :items="items"
  />
</template>
