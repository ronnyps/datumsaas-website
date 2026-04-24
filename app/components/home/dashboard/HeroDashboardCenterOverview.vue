<script setup lang="ts">
type LegendToneClassMap = Record<string, string>;

type DashboardRange = {
  periodLabel: string;
  stats: Array<{ label: string; value: string; delta: string }>;
  topCustomers: Array<{ name: string; amount: string }>;
  chart: {
    periodLabel: string;
    approvedArea: string;
    pendingArea: string;
    approvedLine: string;
    pendingLine: string;
  };
};

type DashboardMock = {
  welcomeTitle: string;
  rangeTabs: Array<{ key: string; label: string }>;
  notice: { message: string; ctaLabel: string };
  topCustomers: { title: string };
  activityChart: { legend: Array<{ label: string; tone: string }> };
  labels: { chartAriaLabel: string };
};

const props = defineProps<{
  dashboardMock: DashboardMock;
  selectedRange: string;
  activeRangeData: DashboardRange;
  chartTitle: string;
  legendToneClassMap: LegendToneClassMap;
  formatAnimatedMetric: (label: string, fallbackRaw: string) => string;
}>();

const emit = defineEmits<{
  "select-range": [rangeKey: string];
}>();

const onSelectRange = (rangeKey: string) => {
  emit("select-range", rangeKey);
};
</script>

<template>
  <div class="content">
    <div class="content__head">
      <h3>{{ props.dashboardMock.welcomeTitle }}</h3>
      <div class="range-tabs">
        <button
          v-for="tab in props.dashboardMock.rangeTabs"
          :key="tab.key"
          type="button"
          class="range-tabs__item"
          :class="{ 'range-tabs__active': tab.key === props.selectedRange }"
          :aria-pressed="tab.key === props.selectedRange"
          @click="onSelectRange(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="notice">
      <div class="notice__left">
        <span class="dot"></span>
        <span>{{ props.dashboardMock.notice.message }}</span>
      </div>
      <button type="button">{{ props.dashboardMock.notice.ctaLabel }}</button>
    </div>

    <div class="metrics-layout">
      <div class="stats">
        <article
          v-for="stat in props.activeRangeData.stats"
          :key="stat.label"
          class="stat-card"
        >
          <p>{{ stat.label }}</p>
          <strong class="stat-card__value">{{ props.formatAnimatedMetric(stat.label, stat.value) }}</strong>
          <small>{{ stat.delta }}</small>
        </article>
      </div>

      <article class="stat-card stat-card--top-customers">
        <p class="stat-card__top-title">
          <span>{{ props.dashboardMock.topCustomers.title }}</span>
          <span class="stat-card__info-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="stat-card__info">
              <path
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 14.5a1 1 0 1 1 1-1 1 1 0 0 1-1 1Zm1-4h-2V7h2Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <small>{{ props.activeRangeData.periodLabel }}</small>
        </p>
        <TransitionGroup tag="ul" name="customer-fade" class="top-customers-list ui-list-reset">
          <li
            v-for="customer in props.activeRangeData.topCustomers"
            :key="`${props.selectedRange}-${customer.name}`"
            class="top-customers-list__item"
          >
            <span class="top-customers-list__name">{{ customer.name }}</span>
            <span class="top-customers-list__amount">{{ customer.amount }}</span>
          </li>
        </TransitionGroup>
      </article>

      <article class="chart-card" :aria-label="props.dashboardMock.labels.chartAriaLabel">
        <div class="chart-card__head">
          <p>{{ props.chartTitle }}</p>
          <div class="legend">
            <span
              v-for="item in props.dashboardMock.activityChart.legend"
              :key="item.label"
              class="legend__pill"
              :class="props.legendToneClassMap[item.tone]"
            >
              {{ item.label }}
            </span>
          </div>
        </div>

        <Transition name="chart-fade" mode="out-in">
          <svg :key="props.selectedRange" viewBox="0 0 1000 300" role="img" :aria-label="props.dashboardMock.labels.chartAriaLabel">
            <defs>
              <linearGradient id="fillGreen" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#16a34a" stop-opacity="0.20" />
                <stop offset="100%" stop-color="#16a34a" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="fillBlue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#2563eb" stop-opacity="0.15" />
                <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
              </linearGradient>
            </defs>

            <g class="grid-lines">
              <line x1="0" y1="60" x2="1000" y2="60" />
              <line x1="0" y1="120" x2="1000" y2="120" />
              <line x1="0" y1="180" x2="1000" y2="180" />
              <line x1="0" y1="240" x2="1000" y2="240" />
            </g>

            <path :d="props.activeRangeData.chart.approvedArea" fill="url(#fillGreen)" />
            <path :d="props.activeRangeData.chart.pendingArea" fill="url(#fillBlue)" />

            <path :d="props.activeRangeData.chart.approvedLine" stroke="#16a34a" stroke-width="4" fill="none" stroke-linecap="round" />
            <path :d="props.activeRangeData.chart.pendingLine" stroke="#2563eb" stroke-width="4" fill="none" stroke-linecap="round" />
          </svg>
        </Transition>
      </article>
    </div>
  </div>
</template>
