<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useProblemScrollScene } from "~/composables/useProblemScrollScene.client";
import ProblemPointHandoffsVisual from "~/components/home/problem/ProblemPointHandoffsVisual.vue";
import ProblemPointManualErrorsVisual from "~/components/home/problem/ProblemPointManualErrorsVisual.vue";
import ProblemPointVisibilityVisual from "~/components/home/problem/ProblemPointVisibilityVisual.vue";
import ProblemSectionYouCursor from "~/components/home/problem/ProblemSectionYouCursor.vue";

defineProps<{
  locale: "en" | "es";
  title: string;
  description: string;
  bullets: string[];
}>();

const sectionRef = ref<HTMLElement | null>(null);
const visualRef = ref<HTMLElement | null>(null);
const isYouCursorActive = ref(false);
const { sceneMode, activeBulletIndex, initScene, setActiveIndex } = useProblemScrollScene();

const pointComponents = [
  ProblemPointHandoffsVisual,
  ProblemPointManualErrorsVisual,
  ProblemPointVisibilityVisual
];

const activeVisualComponent = computed(() => pointComponents[activeBulletIndex.value] ?? pointComponents[0]);

onMounted(() => {
  initScene(sectionRef.value);
});

function handleYouCursorActiveChange(isActive: boolean) {
  isYouCursorActive.value = isActive;
}
</script>

<template>
  <section
    id="problem"
    ref="sectionRef"
    class="section problem"
    data-aida="problem"
    :data-scene-mode="sceneMode"
  >
    <div class="container problem__container">
      <div class="problem__copy content-stack content-stack--4">
        <h2 class="section__title">{{ title }}</h2>
        <p class="problem__text typo-p-body-muted">{{ description }}</p>
        <ul class="problem__list">
          <li
            v-for="(bullet, index) in bullets"
            :key="bullet"
            class="problem__item"
            :class="{ 'problem__item--active': activeBulletIndex === index }"
          >
            <button
              type="button"
              class="problem__item-button"
              @click="setActiveIndex(index)"
            >
              {{ bullet }}
            </button>
          </li>
        </ul>
      </div>
      <div
        ref="visualRef"
        class="problem__visual"
        :class="{ 'problem__visual--you-cursor-active': isYouCursorActive }"
        aria-hidden="true"
      >
        <component :is="activeVisualComponent" :key="activeBulletIndex" :active="true" :locale="locale" />
        <ProblemSectionYouCursor :locale="locale" :target-el="visualRef" @active-change="handleYouCursorActiveChange" />
      </div>
    </div>
  </section>
</template>
