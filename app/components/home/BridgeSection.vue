<script setup lang="ts">
import { computed } from "vue";
import { useHeroExperience } from "~/composables/useHeroExperience";

const props = defineProps<{
  introTitle: string;
  introDescription: string;
  items: Array<{
    title: string;
    description: string;
  }>;
}>();

const { activeIndex, progress, setActiveIndex } = useHeroExperience();

const sliderItems = computed(() => props.items.slice(0, 3));

const isActive = (index: number) => activeIndex.value === index;

const getItemProgress = (index: number) =>
  isActive(index) ? progress.value : 0;

const onSelectStep = (index: number) => {
  setActiveIndex(index, { pauseAutoplay: false, resetProgress: true });
};
</script>

<template>
  <section class="section bridge" data-aida="interest">
    <div class="container bridge__container">
      <span class="bridge__accent" aria-hidden="true" />

      <article class="bridge__intro content-stack content-stack--3">
        <h2 class="section__title bridge__intro-title typo-h2-bridge">
          {{ props.introTitle }}
        </h2>
        <p class="bridge__intro-description typo-p-lead-muted">
          {{ props.introDescription }}
        </p>
      </article>

      <button
        v-for="(item, index) in sliderItems"
        :key="`${item.title}-${index}`"
        type="button"
        class="bridge__item bridge__item--button"
        :class="{ 'bridge__item--active': isActive(index) }"
        :aria-pressed="isActive(index)"
        @click="onSelectStep(index)"
      >
        <span class="bridge__item-progress-wrap" aria-hidden="true">
          <progress
            class="bridge__item-progress"
            max="1"
            :value="getItemProgress(index)"
          ></progress>
        </span>
        <h3 class="bridge__item-title typo-h3-md">{{ item.title }}</h3>
        <p class="bridge__item-description typo-p-lead-muted">
          {{ item.description }}
        </p>
      </button>
    </div>
  </section>
</template>
