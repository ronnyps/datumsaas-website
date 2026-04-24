<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import HeroDashboardMock from "~/components/home/HeroDashboardMock.vue";
import HeroSceneInstall from "~/components/home/experience/HeroSceneInstall.vue";
import HeroSceneUserImport from "~/components/home/experience/HeroSceneUserImport.vue";
import experienceEn from "~/data/hero-experience.json";
import experienceEs from "~/data/hero-experience.es.json";
import dashboardMockEn from "~/data/hero-dashboard-mock.json";
import dashboardMockEs from "~/data/hero-dashboard-mock.es.json";
import userImportEn from "~/data/hero-user-import.json";
import userImportEs from "~/data/hero-user-import.es.json";
import { useHeroExperience } from "~/composables/useHeroExperience";

const props = withDefaults(
  defineProps<{
    locale?: "en" | "es";
  }>(),
  {
    locale: "en"
  }
);

const experience = computed(() => (props.locale === "es" ? experienceEs : experienceEn));
const dashboardMock = computed(() => (props.locale === "es" ? dashboardMockEs : dashboardMockEn));
const userImport = computed(() => (props.locale === "es" ? userImportEs : userImportEn));

const {
  activeIndex,
  progress,
  userPaused,
  autoplayMs,
  resetExperience,
  setProgress,
  setAutoplayDuration,
  advanceToNextScene
} = useHeroExperience();

const sceneKey = computed(() => `scene-${activeIndex.value}`);

let rafId = 0;
let sceneStartTime = 0;

const startLoop = () => {
  const tick = (now: number) => {
    if (!sceneStartTime) sceneStartTime = now - progress.value * autoplayMs.value;

    if (!userPaused.value) {
      const elapsed = now - sceneStartTime;
      const nextProgress = elapsed / autoplayMs.value;

      if (nextProgress >= 1) {
        advanceToNextScene();
        sceneStartTime = now;
        setProgress(0);
      } else {
        setProgress(nextProgress);
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
};

watch(
  () => activeIndex.value,
  () => {
    sceneStartTime = 0;
  }
);

watch(
  () => userPaused.value,
  (paused) => {
    if (paused) setProgress(0);
    sceneStartTime = 0;
  }
);

onMounted(() => {
  resetExperience();
  setAutoplayDuration(12000);
  startLoop();
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="hero-experience-stage" aria-live="polite">
    <Transition name="hero-scene-fade" mode="out-in">
      <HeroSceneInstall
        v-if="activeIndex === 0"
        :key="sceneKey"
        class="ui-size-full"
        :progress="progress"
        :brand-name="dashboardMock.brandName"
        :search-aria-label="dashboardMock.labels.searchAriaLabel"
        :search-placeholder="dashboardMock.searchPlaceholder"
        :navigation-aria-label="dashboardMock.labels.navigationAriaLabel"
        :menu-items="dashboardMock.menuItems"
        :breadcrumb="dashboardMock.breadcrumb"
        :profile-name="dashboardMock.profileName"
        :topbar-label="experience.install.topbarLabel"
        :steps="experience.install.steps"
      />

      <HeroSceneUserImport
        v-else-if="activeIndex === 1"
        :key="sceneKey"
        class="ui-size-full"
        :progress="progress"
        :brand-name="dashboardMock.brandName"
        :search-aria-label="dashboardMock.labels.searchAriaLabel"
        :search-placeholder="dashboardMock.searchPlaceholder"
        :navigation-aria-label="dashboardMock.labels.navigationAriaLabel"
        :menu-items="dashboardMock.menuItems"
        :breadcrumb="dashboardMock.breadcrumb"
        :profile-name="dashboardMock.profileName"
        :title="userImport.title"
        :subtitle="userImport.subtitle"
        :filters-label="userImport.filtersLabel"
        :group-label="userImport.groupLabel"
        :new-user-label="userImport.newUserLabel"
        :progress-label="userImport.progressLabel"
        :user-search-placeholder="userImport.searchPlaceholder"
        :columns="userImport.columns"
        :rows="userImport.rows"
      />

      <div v-else :key="sceneKey" class="hero-experience-stage__control ui-size-full">
        <HeroDashboardMock :locale="locale" />
      </div>
    </Transition>
  </div>
</template>
