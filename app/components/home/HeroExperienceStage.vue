<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import HeroDashboardMock from "~/components/home/HeroDashboardMock.vue";
import HeroSceneInstall from "~/components/home/experience/HeroSceneInstall.vue";
import HeroSceneCompaniesImport from "~/components/home/experience/HeroSceneCompaniesImport.vue";
import HeroSceneCustomersImport from "~/components/home/experience/HeroSceneCustomersImport.vue";
import experienceEn from "~/data/hero-experience.json";
import experienceEs from "~/data/hero-experience.es.json";
import dashboardMockEn from "~/data/hero-dashboard-mock.json";
import dashboardMockEs from "~/data/hero-dashboard-mock.es.json";
import userImportEn from "~/data/hero-user-import.json";
import userImportEs from "~/data/hero-user-import.es.json";
import customersImportEn from "~/data/hero-customers-import.json";
import customersImportEs from "~/data/hero-customers-import.es.json";
import companiesImportEn from "~/data/hero-companies-import.json";
import companiesImportEs from "~/data/hero-companies-import.es.json";
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
const customersImport = computed(() => (props.locale === "es" ? customersImportEs : customersImportEn));
const companiesImport = computed(() => (props.locale === "es" ? companiesImportEs : companiesImportEn));
const userImportMenuItems = computed(() =>
  dashboardMock.value.menuItems.map((item) => ({
    ...item,
    active: item.key === "users"
  }))
);
const customersImportMenuItems = computed(() =>
  dashboardMock.value.menuItems.map((item) => ({
    ...item,
    active: item.key === "customers"
  }))
);
const companiesImportMenuItems = computed(() =>
  dashboardMock.value.menuItems.map((item) => ({
    ...item,
    active: item.key === "companies"
  }))
);
const userImportBreadcrumb = computed(() => {
  const usersEntry = dashboardMock.value.menuItems.find((item) => item.key === "users");
  return usersEntry?.label ?? (props.locale === "es" ? "Usuarios" : "Users");
});
const customersImportBreadcrumb = computed(() => {
  const customersEntry = dashboardMock.value.menuItems.find((item) => item.key === "customers");
  return customersEntry?.label ?? (props.locale === "es" ? "Clientes" : "Customers");
});
const companiesImportBreadcrumb = computed(() => {
  const companiesEntry = dashboardMock.value.menuItems.find((item) => item.key === "companies");
  return companiesEntry?.label ?? (props.locale === "es" ? "Empresas" : "Companies");
});
const secondCardIsCompanies = computed(() => progress.value >= 0.5);
const secondCardProgress = computed(() =>
  secondCardIsCompanies.value
    ? (progress.value - 0.5) / 0.5
    : progress.value / 0.5
);

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
        :import-menu-items="userImportMenuItems"
        :breadcrumb="dashboardMock.breadcrumb"
        :import-breadcrumb="userImportBreadcrumb"
        :profile-name="dashboardMock.profileName"
        :topbar-label="experience.install.topbarLabel"
        :steps="experience.install.steps"
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

      <HeroSceneCustomersImport
        v-else-if="activeIndex === 1 && !secondCardIsCompanies"
        :key="sceneKey"
        class="ui-size-full"
        :progress="secondCardProgress"
        :brand-name="dashboardMock.brandName"
        :search-aria-label="dashboardMock.labels.searchAriaLabel"
        :search-placeholder="dashboardMock.searchPlaceholder"
        :navigation-aria-label="dashboardMock.labels.navigationAriaLabel"
        :menu-items="customersImportMenuItems"
        :breadcrumb="customersImportBreadcrumb"
        :profile-name="dashboardMock.profileName"
        :title="customersImport.title"
        :subtitle="customersImport.subtitle"
        :filters-label="customersImport.filtersLabel"
        :group-label="customersImport.groupLabel"
        :new-user-label="customersImport.newUserLabel"
        :progress-label="customersImport.progressLabel"
        :user-search-placeholder="customersImport.searchPlaceholder"
        :columns="customersImport.columns"
        :rows="customersImport.rows"
      />

      <HeroSceneCompaniesImport
        v-else-if="activeIndex === 1"
        :key="`${sceneKey}-companies`"
        class="ui-size-full"
        :progress="secondCardProgress"
        :brand-name="dashboardMock.brandName"
        :search-aria-label="dashboardMock.labels.searchAriaLabel"
        :search-placeholder="dashboardMock.searchPlaceholder"
        :navigation-aria-label="dashboardMock.labels.navigationAriaLabel"
        :menu-items="companiesImportMenuItems"
        :breadcrumb="companiesImportBreadcrumb"
        :profile-name="dashboardMock.profileName"
        :title="companiesImport.title"
        :subtitle="companiesImport.subtitle"
        :filters-label="companiesImport.filtersLabel"
        :group-label="companiesImport.groupLabel"
        :new-user-label="companiesImport.newUserLabel"
        :progress-label="companiesImport.progressLabel"
        :user-search-placeholder="companiesImport.searchPlaceholder"
        :columns="companiesImport.columns"
        :rows="companiesImport.rows"
      />

      <div v-else :key="sceneKey" class="hero-experience-stage__control ui-size-full">
        <HeroDashboardMock :locale="locale" />
      </div>
    </Transition>
  </div>
</template>
