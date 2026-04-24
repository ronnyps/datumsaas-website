<script setup lang="ts">
import ProblemMobileFilesPhone from "~/components/home/problem/ProblemMobileFilesPhone.vue";

defineProps<{
  active?: boolean;
  locale?: "en" | "es";
}>();
</script>

<template>
  <article class="problem-visual problem-visual--manual surface-pastel" :class="{ 'is-active': active }">
    <ProblemMobileFilesPhone :locale="locale" />
  </article>
</template>
