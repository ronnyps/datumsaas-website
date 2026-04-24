<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import dashboardMockEn from "~/data/hero-dashboard-mock.json";
import dashboardMockEs from "~/data/hero-dashboard-mock.es.json";
import HeroDashboardCenterOverview from "~/components/home/dashboard/HeroDashboardCenterOverview.vue";
import HeroDashboardSidebar from "~/components/home/dashboard/HeroDashboardSidebar.vue";
import HeroDashboardTopbar from "~/components/home/dashboard/HeroDashboardTopbar.vue";

const props = withDefaults(
  defineProps<{
    locale?: "en" | "es";
  }>(),
  {
    locale: "en"
  }
);

const legendToneClassMap = {
  green: "legend__pill--green",
  blue: "legend__pill--blue",
  red: "legend__pill--red"
} as const;

type DashboardRangeKey = keyof typeof dashboardMockEn.ranges;

const dashboardMock = computed(() => (props.locale === "es" ? dashboardMockEs : dashboardMockEn));

const selectedRange = ref<DashboardRangeKey>(dashboardMockEn.activeRange as DashboardRangeKey);

const activeRangeData = computed(() => dashboardMock.value.ranges[selectedRange.value]);

const chartTitle = computed(
  () => `${dashboardMock.value.activityChart.title} ${activeRangeData.value.chart.periodLabel}`
);

type MetricFormat = {
  prefix: string;
  suffix: string;
  decimals: number;
};

const animatedStatNumbers = ref<Record<string, number>>({});
const metricFormats = ref<Record<string, MetricFormat>>({});
let statAnimationFrame = 0;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const parseMetric = (raw: string): { number: number; format: MetricFormat } => {
  const match = raw.match(/-?\d[\d,]*(?:\.\d+)?/);
  if (!match) {
    return {
      number: 0,
      format: { prefix: "", suffix: raw, decimals: 0 }
    };
  }

  const token = match[0];
  const number = Number(token.replace(/,/g, ""));
  const decimals = token.includes(".") ? token.split(".")[1].length : 0;
  const prefix = raw.slice(0, match.index ?? 0);
  const suffix = raw.slice((match.index ?? 0) + token.length);

  return {
    number,
    format: { prefix, suffix, decimals }
  };
};

const formatAnimatedMetric = (label: string, fallbackRaw: string): string => {
  const value = animatedStatNumbers.value[label];
  const format = metricFormats.value[label];
  if (value === undefined || !format) return fallbackRaw;

  const formattedNumber = value.toLocaleString("en-US", {
    minimumFractionDigits: format.decimals,
    maximumFractionDigits: format.decimals
  });

  return `${format.prefix}${formattedNumber}${format.suffix}`;
};

const animateStatsToRange = (rangeKey: DashboardRangeKey, animate: boolean) => {
  const stats = dashboardMock.value.ranges[rangeKey].stats;
  const startValues: Record<string, number> = {};
  const endValues: Record<string, number> = {};

  for (const stat of stats) {
    const parsed = parseMetric(stat.value);
    metricFormats.value[stat.label] = parsed.format;
    startValues[stat.label] = animatedStatNumbers.value[stat.label] ?? parsed.number;
    endValues[stat.label] = parsed.number;
  }

  if (statAnimationFrame) {
    cancelAnimationFrame(statAnimationFrame);
    statAnimationFrame = 0;
  }

  if (!animate || !import.meta.client) {
    animatedStatNumbers.value = endValues;
    return;
  }

  const durationMs = 560;
  const startTime = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - startTime) / durationMs);
    const eased = easeOutCubic(t);
    const nextValues: Record<string, number> = {};

    for (const stat of stats) {
      const label = stat.label;
      const from = startValues[label];
      const to = endValues[label];
      nextValues[label] = from + (to - from) * eased;
    }

    animatedStatNumbers.value = nextValues;

    if (t < 1) {
      statAnimationFrame = requestAnimationFrame(tick);
      return;
    }

    statAnimationFrame = 0;
  };

  statAnimationFrame = requestAnimationFrame(tick);
};

watch(
  () => selectedRange.value,
  (nextRange) => {
    animateStatsToRange(nextRange, true);
  },
  { immediate: true }
);

watch(
  () => props.locale,
  () => {
    const fallbackRange = dashboardMock.value.activeRange as DashboardRangeKey;
    if (!(selectedRange.value in dashboardMock.value.ranges)) {
      selectedRange.value = fallbackRange;
    }
    animateStatsToRange(selectedRange.value, false);
  }
);

onBeforeUnmount(() => {
  if (import.meta.client && statAnimationFrame) cancelAnimationFrame(statAnimationFrame);
});
</script>

<template>
  <section class="dash-shot" :aria-label="dashboardMock.labels.previewAriaLabel">
    <HeroDashboardSidebar
      :brand-name="dashboardMock.brandName"
      :search-aria-label="dashboardMock.labels.searchAriaLabel"
      :search-placeholder="dashboardMock.searchPlaceholder"
      :navigation-aria-label="dashboardMock.labels.navigationAriaLabel"
      :menu-items="dashboardMock.menuItems"
    />

    <div class="dash-shot__main">
      <HeroDashboardTopbar
        :breadcrumb="dashboardMock.breadcrumb"
        :profile-name="dashboardMock.profileName"
      />

      <HeroDashboardCenterOverview
        :dashboard-mock="dashboardMock"
        :selected-range="selectedRange"
        :active-range-data="activeRangeData"
        :chart-title="chartTitle"
        :legend-tone-class-map="legendToneClassMap"
        :format-animated-metric="formatAnimatedMetric"
        @select-range="selectedRange = $event as DashboardRangeKey"
      />
    </div>
  </section>
</template>
