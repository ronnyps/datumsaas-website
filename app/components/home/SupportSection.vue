<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  items: { title: string; description: string }[];
}>();
</script>

<template>
  <HomeSharedInfoCardSection
    section-id="support"
    section-class="support"
    data-aida="support"
    :title="title"
    :description="description"
    :items="items"
  />
</template>
