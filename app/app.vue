<script setup lang="ts">
const asset = useAssetPath();

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: asset("/imago.svg"),
    },
  ],
});
</script>

<template>
  <NuxtPage />
</template>
