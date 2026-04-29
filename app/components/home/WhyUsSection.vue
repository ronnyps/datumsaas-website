<script setup lang="ts">
import {
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ChartBarSquareIcon,
} from "@heroicons/vue/24/outline";

const activeRole = ref(0);

const props = defineProps<{
  title: string;
  description: string;
  points: string[];
  roles: { role: string; value: string }[];
  backgroundVideoSrc?: string;
}>();

const backgroundVideo = computed(() => props.backgroundVideoSrc?.trim() || "/videos/scene1-sectionwhylp.mp4");

const pointIcons = [BuildingOffice2Icon, ShieldCheckIcon, ChartBarSquareIcon];
</script>

<template>
  <section id="why-us" class="section why-us section--dark-guides" data-aida="hierarchy">
    <div class="container why-us__panel">
      <video
        v-if="backgroundVideo"
        class="why-us__bg-video"
        :src="backgroundVideo"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
      />
      <div v-if="backgroundVideo" class="why-us__bg-overlay" aria-hidden="true" />
      <div
        class="why-us__sticky content-stack content-stack--3"
        data-motion="desire-pin-root"
      >
        <p class="why-us__eyebrow">Hierarchy and governance</p>
        <h2 class="section__title section__title--light">{{ title }}</h2>
        <p class="why-us__summary typo-p-panel-muted">{{ description }}</p>
      </div>
      <ul class="why-us__list ui-list-reset">
        <li
          v-for="(point, index) in points"
          :key="point"
          class="why-us__item"
          data-motion="desire-panel"
        >
          <component :is="pointIcons[Math.min(index, pointIcons.length - 1)]" class="why-us__item-icon" aria-hidden="true" />
          {{ point }}
        </li>
      </ul>
    </div>
  </section>
</template>
