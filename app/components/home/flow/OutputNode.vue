<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{
  locale?: "en" | "es";
  label: string;
  active?: boolean;
  stats?: {
    rate: number;
    quotes: number;
    sales: number;
  };
  rows?: Array<{
    id: number;
    customerName: string;
    status: "payment" | "cancel";
  }>;
  latestEntryId?: number | null;
}>();

function getStatusLabel(value: "payment" | "cancel") {
  if (props.locale === "es") {
    return value === "payment" ? "Pago" : "Cancelado";
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const displayedRate = ref<number>(props.stats?.rate ?? 22);
const displayedQuotes = ref<number>(props.stats?.quotes ?? 84);
const displayedSales = ref<number>(props.stats?.sales ?? 100);

let statsAnimationFrame: number | null = null;

function clearStatsAnimationFrame() {
  if (statsAnimationFrame === null) return;
  window.cancelAnimationFrame(statsAnimationFrame);
  statsAnimationFrame = null;
}

function animateStats(nextRate: number, nextQuotes: number, nextSales: number) {
  const startRate = displayedRate.value;
  const startQuotes = displayedQuotes.value;
  const startSales = displayedSales.value;
  const safeNextSales = Math.max(startSales, nextSales, 100);
  const startedAt = performance.now();
  const durationMs = 960;

  clearStatsAnimationFrame();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = 1 - Math.pow(1 - progress, 4);

    displayedRate.value = startRate + (nextRate - startRate) * eased;
    displayedQuotes.value = Math.round(
      startQuotes + (nextQuotes - startQuotes) * eased,
    );
    displayedSales.value = Math.round(
      startSales + (safeNextSales - startSales) * eased,
    );

    if (progress < 1) {
      statsAnimationFrame = window.requestAnimationFrame(tick);
      return;
    }
    statsAnimationFrame = null;
  };

  statsAnimationFrame = window.requestAnimationFrame(tick);
}

watch(
  () => [props.stats?.rate ?? 22, props.stats?.quotes ?? 84, props.stats?.sales ?? 100] as const,
  ([nextRate, nextQuotes, nextSales]) => {
    if (typeof window === "undefined") {
      displayedRate.value = nextRate;
      displayedQuotes.value = nextQuotes;
      displayedSales.value = nextSales;
      return;
    }
    animateStats(nextRate, nextQuotes, nextSales);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearStatsAnimationFrame();
});

const rateText = computed(() => `${displayedRate.value.toFixed(1)}%`);
const quotesText = computed(() => `${displayedQuotes.value}`);
const salesText = computed(
  () => `$${displayedSales.value.toLocaleString(props.locale === "es" ? "es-ES" : "en-US")}`,
);
const statRateLabel = computed(() => (props.locale === "es" ? "Tasa" : "Rate"));
const statQuotesLabel = computed(() => (props.locale === "es" ? "Cotizaciones" : "Quotes"));
const statSalesLabel = computed(() => (props.locale === "es" ? "Ventas" : "Sales"));
const orderPrefix = computed(() => (props.locale === "es" ? "Orden" : "Order"));
</script>

<template>
  <div class="flow-node-shell surface-pastel" :class="{ 'is-active': active }">
    <article class="flow-workflow-node flow-workflow-node--output" :class="{ 'is-active': active }">
      <p class="flow-workflow-node__title ui-app-mode-title">{{ label }}</p>
      <div class="flow-output-node__stats" aria-hidden="true">
        <div>
          <small class="ui-app-micro-text">{{ statRateLabel }}</small>
          <strong class="ui-app-mode-title">{{ rateText }}</strong>
        </div>
        <div>
          <small class="ui-app-micro-text">{{ statQuotesLabel }}</small>
          <strong class="ui-app-mode-title">{{ quotesText }}</strong>
        </div>
        <div>
          <small class="ui-app-micro-text">{{ statSalesLabel }}</small>
          <strong class="ui-app-mode-title">{{ salesText }}</strong>
        </div>
      </div>
      <div class="flow-output-node__rows" aria-hidden="true">
        <span
          v-for="row in (props.rows ?? [])"
          :key="row.id"
          class="flow-output-node__row ui-app-table-row-text"
          :class="{ 'flow-output-node__row--entering': row.id === props.latestEntryId }"
        >
          <span class="flow-output-node__row-order ui-app-table-row-text">{{ orderPrefix }}: {{ row.customerName }}</span>
          <span
            class="flow-output-node__row-tag ui-app-tag ui-app-table-badge"
            :class="row.status === 'payment' ? 'ui-app-tag--success' : 'ui-app-tag--danger'"
          >
            {{ getStatusLabel(row.status) }}
          </span>
        </span>
      </div>
    </article>
  </div>
</template>
