<script setup lang="ts">
defineProps<{
  title: string;
  steps: string[];
  ctaLabel: string;
  ctaHref: string;
}>();
</script>

<template>
  <section id="demo" class="section demo-process" data-aida="demo-process">
    <div class="container demo-process__panel">
      <div class="content-stack content-stack--6">
        <h2 class="section__title">{{ title }}</h2>
        <NuxtLink class="btn btn--primary" :to="ctaHref">{{ ctaLabel }}</NuxtLink>
      </div>
      <ol class="demo-process__list ui-list-reset">
        <li v-for="(step, index) in steps" :key="step" class="demo-process__item">
          <span class="demo-process__index">{{ index + 1 }}</span>
          <p class="demo-process__text typo-p-body-strong">{{ step }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
