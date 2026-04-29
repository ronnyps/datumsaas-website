<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

type Locale = "en" | "es";

type StatusKey = "approved" | "pending" | "rejected";

type TopCustomer = {
  id: string;
  name: string;
  amount: number;
};

const props = defineProps<{
  locale?: Locale;
  active?: boolean;
}>();

const locale = computed<Locale>(() => props.locale ?? "en");
const isActive = computed(() => Boolean(props.active));

const copy = computed(() => {
  if (locale.value === "es") {
    return {
      welcome: "Bienvenido de vuelta",
      today: "Hoy",
      yesterday: "Ayer",
      last7: "Ultimos 7 dias",
      last30: "Ultimos 30 dias",
      allTime: "Todo el tiempo",
      notice: "Nuevo catalogo disponible para cotizar mas rapido.",
      noticeCta: "Explorar",
      conversion: "Conversion",
      quotesCreated: "Cotizaciones",
      projectedSales: "Venta proyectada",
      totalSales: "Ventas totales",
      chartTitle: "Actividad de cotizaciones por estado",
      approved: "Aprobadas",
      pending: "Pendientes",
      rejected: "Rechazadas",
      topCustomers: "Top clientes",
      rangeLabel: "ultimos 30 dias",
    };
  }

  return {
    welcome: "Welcome back",
    today: "Today",
    yesterday: "Yesterday",
    last7: "Last 7 days",
    last30: "Last 30 days",
    allTime: "All time",
    notice: "New catalog is now available. Explore and quote faster.",
    noticeCta: "Explore",
    conversion: "Conversion rate",
    quotesCreated: "Quotes created",
    projectedSales: "Projected sales",
    totalSales: "Total sales",
    chartTitle: "Quotes activity by status",
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    topCustomers: "Top customers",
    rangeLabel: "last 30 days",
  };
});

const conversionValue = ref(22.1);
const quotesValue = ref(84);
const projectedSalesValue = ref(128400);
const totalSalesValue = ref(96120);

const approvedSeries = ref<number[]>([66, 68, 72, 76, 79, 82, 84, 86, 88, 90]);
const pendingSeries = ref<number[]>([34, 36, 38, 41, 39, 42, 45, 43, 41, 40]);
const rejectedSeries = ref<number[]>([20, 19, 21, 20, 19, 20, 21, 19, 18, 17]);

const topCustomers = ref<TopCustomer[]>([
  { id: "1", name: "Northline Manufacturing", amount: 21480 },
  { id: "2", name: "BluePeak Logistics", amount: 17260 },
  { id: "3", name: "Vertex Retail Group", amount: 14930 },
  { id: "4", name: "Nova IT Services", amount: 12450 },
]);

let ticker: number | null = null;
let animationFrame: number | null = null;
const ANIMATION_DURATION_MS = 900;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function clearTicker() {
  if (ticker !== null) {
    window.clearInterval(ticker);
    ticker = null;
  }

  if (animationFrame !== null) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function toPolyline(series: number[]) {
  const stepX = 66;
  const maxY = 240;
  const minY = 48;
  return series
    .map((value, index) => {
      const x = index * stepX;
      const normalized = Math.min(100, Math.max(0, value));
      const y = Math.round(maxY - ((maxY - minY) * normalized) / 100);
      return `${x},${y}`;
    })
    .join(" ");
}

function toLinePath(series: number[]) {
  const stepX = 66;
  const maxY = 240;
  const minY = 48;
  return series
    .map((value, index) => {
      const x = index * stepX;
      const normalized = Math.min(100, Math.max(0, value));
      const y = Math.round(maxY - ((maxY - minY) * normalized) / 100);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

function toAreaPath(series: number[]) {
  if (!series.length) return "";
  const line = toLinePath(series);
  const stepX = 66;
  const baselineY = 248;
  const lastX = (series.length - 1) * stepX;
  return `${line} L${lastX} ${baselineY} L0 ${baselineY} Z`;
}

const approvedLine = computed(() => toPolyline(approvedSeries.value));
const pendingLine = computed(() => toPolyline(pendingSeries.value));
const rejectedLine = computed(() => toPolyline(rejectedSeries.value));
const approvedArea = computed(() => toAreaPath(approvedSeries.value));
const pendingArea = computed(() => toAreaPath(pendingSeries.value));

function driftSeries(series: number[], min: number, max: number, delta: number) {
  const next = [...series];
  const last = next[next.length - 1] ?? min;
  const variation = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
  const value = Math.min(max, Math.max(min, last + variation));
  next.shift();
  next.push(value);
  return next;
}

function animateTick() {
  const startTime = performance.now();
  const fromConversion = conversionValue.value;
  const fromQuotes = quotesValue.value;
  const fromProjected = projectedSalesValue.value;
  const fromTotal = totalSalesValue.value;
  const fromApproved = [...approvedSeries.value];
  const fromPending = [...pendingSeries.value];
  const fromRejected = [...rejectedSeries.value];

  const toConversion = Math.max(10, Math.min(36, Number((conversionValue.value + (Math.random() * 1.4 - 0.6)).toFixed(1))));
  const toQuotes = Math.max(40, quotesValue.value + Math.floor(Math.random() * 3));
  const projectedDelta = Math.floor(Math.random() * 2600) + 420;
  const toProjected = projectedSalesValue.value + projectedDelta;
  const totalDelta = Math.floor(projectedDelta * (0.45 + Math.random() * 0.35));
  const toTotal = totalSalesValue.value + totalDelta;
  const toApproved = driftSeries(approvedSeries.value, 62, 96, 5);
  const toPending = driftSeries(pendingSeries.value, 28, 68, 4);
  const toRejected = driftSeries(rejectedSeries.value, 12, 36, 3);

  const nextCustomers = [...topCustomers.value];
  const idx = Math.floor(Math.random() * nextCustomers.length);
  const target = nextCustomers[idx];
  if (target) {
    nextCustomers[idx] = {
      ...target,
      amount: Math.max(9000, target.amount + Math.floor(Math.random() * 700) - 120),
    };
    topCustomers.value = nextCustomers.sort((a, b) => b.amount - a.amount);
  }

  if (animationFrame !== null) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / ANIMATION_DURATION_MS);
    const eased = easeOutCubic(progress);

    conversionValue.value = Number(lerp(fromConversion, toConversion, eased).toFixed(1));
    quotesValue.value = Math.round(lerp(fromQuotes, toQuotes, eased));
    projectedSalesValue.value = Math.round(lerp(fromProjected, toProjected, eased));
    totalSalesValue.value = Math.round(lerp(fromTotal, toTotal, eased));

    approvedSeries.value = fromApproved.map((value, i) => lerp(value, toApproved[i] ?? value, eased));
    pendingSeries.value = fromPending.map((value, i) => lerp(value, toPending[i] ?? value, eased));
    rejectedSeries.value = fromRejected.map((value, i) => lerp(value, toRejected[i] ?? value, eased));

    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(step);
      return;
    }

    animationFrame = null;
  };

  animationFrame = window.requestAnimationFrame(step);
}

function startTicker() {
  clearTicker();
  animateTick();
  ticker = window.setInterval(animateTick, 1900);
}

watch(
  isActive,
  (next) => {
    if (next) startTicker();
    else clearTicker();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearTicker();
});
</script>

<template>
  <div class="services-dashboard ui-glass-apple ui-app-view ui-app-table-scale-compact" aria-hidden="true">
    <div class="services-dashboard__surface">
      <header class="services-dashboard__toolbar">
        <p class="services-dashboard__welcome ui-app-heading">{{ copy.welcome }}, James Smith</p>
        <div class="services-dashboard__ranges ui-app-border-soft">
          <span class="ui-app-table-badge">{{ copy.today }}</span>
          <span class="ui-app-table-badge">{{ copy.yesterday }}</span>
          <span class="ui-app-table-badge">{{ copy.last7 }}</span>
          <span class="ui-app-tag ui-app-tag--info ui-app-table-badge">{{ copy.last30 }}</span>
          <span class="ui-app-table-badge">{{ copy.allTime }}</span>
        </div>
      </header>

      <div class="services-dashboard__notice ui-app-border-soft">
        <div class="services-dashboard__notice-dot" aria-hidden="true" />
        <p class="services-dashboard__notice-text ui-app-table-row-text">{{ copy.notice }}</p>
        <span class="services-dashboard__notice-cta ui-app-btn ui-app-btn--neutral">{{ copy.noticeCta }}</span>
      </div>

      <div class="services-dashboard__content-grid">
        <div class="services-dashboard__content-main">
          <div class="services-dashboard__kpis">
            <article class="services-dashboard__kpi ui-app-border-soft">
              <p class="ui-app-table-head-text">{{ copy.conversion }}</p>
              <p class="ui-app-table-row-value">{{ conversionValue.toFixed(1) }}%</p>
            </article>
            <article class="services-dashboard__kpi ui-app-border-soft">
              <p class="ui-app-table-head-text">{{ copy.quotesCreated }}</p>
              <p class="ui-app-table-row-value">{{ quotesValue }}</p>
            </article>
            <article class="services-dashboard__kpi ui-app-border-soft">
              <p class="ui-app-table-head-text">{{ copy.projectedSales }}</p>
              <p class="ui-app-table-row-value">{{ formatCurrency(projectedSalesValue) }}</p>
            </article>
            <article class="services-dashboard__kpi ui-app-border-soft">
              <p class="ui-app-table-head-text">{{ copy.totalSales }}</p>
              <p class="ui-app-table-row-value">{{ formatCurrency(totalSalesValue) }}</p>
            </article>
          </div>

          <section class="services-dashboard__chart-panel ui-app-border-soft">
            <div class="services-dashboard__chart-head">
              <p class="ui-app-table-row-text">{{ copy.chartTitle }} ({{ copy.rangeLabel }})</p>
              <div class="services-dashboard__legend">
                <span class="ui-app-tag ui-app-table-badge ui-app-tag--success">{{ copy.approved }}</span>
                <span class="ui-app-tag ui-app-table-badge ui-app-tag--info">{{ copy.pending }}</span>
                <span class="ui-app-tag ui-app-table-badge ui-app-tag--danger">{{ copy.rejected }}</span>
              </div>
            </div>

            <svg class="services-dashboard__chart-svg" viewBox="0 0 600 260" aria-hidden="true">
              <defs>
                <linearGradient id="servicesDashFillGreen" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#16a34a" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#16a34a" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="servicesDashFillBlue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
                </linearGradient>
              </defs>
              <g class="services-dashboard__grid-lines">
                <line x1="0" y1="56" x2="600" y2="56" />
                <line x1="0" y1="104" x2="600" y2="104" />
                <line x1="0" y1="152" x2="600" y2="152" />
                <line x1="0" y1="200" x2="600" y2="200" />
                <line x1="0" y1="248" x2="600" y2="248" />
              </g>
              <path :d="approvedArea" fill="url(#servicesDashFillGreen)" />
              <path :d="pendingArea" fill="url(#servicesDashFillBlue)" />
              <polyline class="services-dashboard__line services-dashboard__line--approved" :points="approvedLine" />
              <polyline class="services-dashboard__line services-dashboard__line--pending" :points="pendingLine" />
              <polyline class="services-dashboard__line services-dashboard__line--rejected" :points="rejectedLine" />
            </svg>
          </section>
        </div>

        <aside class="services-dashboard__customers ui-app-border-soft">
          <div class="services-dashboard__customers-head">
            <p class="ui-app-table-row-text">{{ copy.topCustomers }}</p>
            <span class="ui-app-micro-text">{{ copy.rangeLabel }}</span>
          </div>

          <ul class="services-dashboard__customers-list ui-list-reset">
            <li v-for="customer in topCustomers" :key="customer.id" class="services-dashboard__customer-row">
              <span class="ui-app-table-row-text">{{ customer.name }}</span>
              <strong class="ui-app-table-row-value">{{ formatCurrency(customer.amount) }}</strong>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>
