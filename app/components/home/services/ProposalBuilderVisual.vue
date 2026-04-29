<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

type Locale = "en" | "es";

const props = defineProps<{
  locale?: Locale;
  active?: boolean;
}>();

const locale = computed<Locale>(() => props.locale ?? "en");
const isActive = computed(() => Boolean(props.active));

const copy = computed(() => {
  if (locale.value === "es") {
    return {
      title: "Proposal",
      creatingTitle: "Creando proposal",
      creatingSubtitle: "Vinculando cliente, items y aprobaciones…",
      statusCreating: "Creando",
      statusBuilding: "Construyendo",
      statusReady: "Lista",
      statusApproved: "Aprobada",
      statusCancelled: "Cancelada",
      customer: "Cliente",
      subtotal: "Subtotal",
      taxes: "Impuestos",
      total: "Total",
      pay: "Pay",
      cancel: "Cancel",
      approved: "Pay",
      cancelled: "Cancel",
    };
  }

  return {
    title: "Proposal",
    creatingTitle: "Creating proposal",
    creatingSubtitle: "Linking customer, items, and approvals…",
    statusCreating: "Creating",
    statusBuilding: "Building",
    statusReady: "Ready",
    statusApproved: "Approved",
    statusCancelled: "Cancelled",
    customer: "Customer",
    subtotal: "Subtotal",
    taxes: "Taxes",
    total: "Total",
    pay: "Pay",
    cancel: "Cancel",
    approved: "Pay",
    cancelled: "Cancel",
  };
});

type ProposalCustomer = {
  name: string;
  company: string;
  email: string;
};

type ProposalItem = {
  label: string;
  qty: number;
  price: number;
};

type ProposalDraft = {
  id: string;
  customer: ProposalCustomer;
  items: ProposalItem[];
  taxRate: number; // 0..1
};

const customers: ProposalCustomer[] = [
  { name: "Olivia Bennett", company: "Summit Property Care", email: "olivia@summitpropertycare.com" },
  { name: "Sofia Martinez", company: "Vertex Home Services", email: "sofia@vertexhomeservices.com" },
  { name: "Jason Clark", company: "Blue Harbor Medical", email: "jason@blueharbormedical.com" },
  { name: "Emma Rodriguez", company: "Northstar Logistics", email: "emma@northstarlogistics.com" },
];

const itemPool: ProposalItem[] = [
  { label: "Installation", qty: 1, price: 240 },
  { label: "On-site setup", qty: 1, price: 180 },
  { label: "Monthly service", qty: 1, price: 79 },
  { label: "Training session", qty: 2, price: 95 },
  { label: "Support add-on", qty: 1, price: 49 },
];

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)] as T;
}

function buildDraft(): ProposalDraft {
  const cust = pick(customers);
  const count = 3;
  const items = Array.from({ length: count }, () => pick(itemPool)).map((it, idx) => ({
    ...it,
    // Slight per-line variation so it doesn't look identical.
    qty: Math.max(1, it.qty + (idx % 2 === 0 ? 0 : 1)),
    price: Math.max(12, it.price + (idx * 7)),
  }));

  const idSeed = 100 + Math.floor(Math.random() * 900);

  return {
    id: `#${idSeed}`,
    customer: cust,
    items,
    taxRate: 0.07 + Math.random() * 0.06,
  };
}

const prefersReducedMotion = ref(false);

type Phase = "idle" | "paper-in" | "header" | "customer" | "items" | "totals" | "decision" | "result";
const phase = ref<Phase>("idle");
const draft = ref<ProposalDraft>(buildDraft());
const decision = ref<"pay" | "cancel" | null>(null);
const isPressingPay = ref(false);
const isPressingCancel = ref(false);
const isSheetSwapping = ref(false);

const subtotal = computed(() => draft.value.items.reduce((sum, it) => sum + it.qty * it.price, 0));
const taxes = computed(() => Math.round(subtotal.value * draft.value.taxRate));
const total = computed(() => subtotal.value + taxes.value);

let timers: number[] = [];

function clearTimers() {
  for (const t of timers) window.clearTimeout(t);
  timers = [];
}

function at(fn: () => void, ms: number) {
  const t = window.setTimeout(fn, ms);
  timers.push(t);
}

type ProposalSnapshot = {
  key: string;
  id: string;
  company: string;
  total: number;
  decision: "pay" | "cancel";
};

const stack = ref<ProposalSnapshot[]>([]);
const leavingSheet = ref<ProposalSnapshot | null>(null);

function resetToIdle(animated = true) {
  clearTimers();
  isPressingPay.value = false;
  isPressingCancel.value = false;
  decision.value = null;
  isSheetSwapping.value = false;
  draft.value = buildDraft();
  phase.value = animated ? "idle" : "idle";
  stack.value = [];
  leavingSheet.value = null;
}

function startBuildCycle(opts?: { keepDraft?: boolean; withSlide?: boolean }) {
  const resultHoldMs = 980;
  const swapDurationMs = 620;

  clearTimers();
  decision.value = null;
  isPressingPay.value = false;
  isPressingCancel.value = false;
  if (!opts?.keepDraft) draft.value = buildDraft();

  if (opts?.withSlide) {
    isSheetSwapping.value = true;
    at(() => {
      isSheetSwapping.value = false;
      leavingSheet.value = null;
    }, swapDurationMs);
  } else {
    isSheetSwapping.value = false;
    leavingSheet.value = null;
  }

  phase.value = "paper-in";

  // Faster + more readable stagger: header -> customer -> totals -> decision.
  at(() => (phase.value = "header"), 220);
  at(() => (phase.value = "customer"), 420);
  at(() => (phase.value = "totals"), 680);
  at(() => (phase.value = "decision"), 1040);

  at(() => {
    const nextDecision = Math.random() > 0.35 ? "pay" : "cancel";
    decision.value = nextDecision;
    if (nextDecision === "pay") isPressingPay.value = true;
    else isPressingCancel.value = true;
  }, 1420);

  at(() => {
    isPressingPay.value = false;
    isPressingCancel.value = false;
    phase.value = "result";
  }, 1640);

  // Keep looping while active: archive the current proposal and start a new one.
  at(() => {
    if (!isActive.value || prefersReducedMotion.value) {
      phase.value = "idle";
      return;
    }

    const decided = decision.value ?? (Math.random() > 0.5 ? "pay" : "cancel");
    const snap: ProposalSnapshot = {
      key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      id: draft.value.id,
      company: draft.value.customer.company,
      total: total.value,
      decision: decided,
    };

    stack.value = [snap, ...stack.value].slice(0, 3);
    leavingSheet.value = snap;
    startBuildCycle({ withSlide: true });
  }, 2520 + resultHoldMs);
}

watch(
  isActive,
  (next) => {
    if (prefersReducedMotion.value) {
      resetToIdle(false);
      phase.value = "totals";
      return;
    }

    if (!next) {
      // Smoothly fall back to idle.
      clearTimers();
      isPressingPay.value = false;
      isPressingCancel.value = false;
      at(() => resetToIdle(true), 220);
      return;
    }

    startBuildCycle();
  },
  { immediate: true }
);

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
});

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<template>
  <div class="services-proposal ui-glass-apple ui-app-view ui-app-table-scale-compact" aria-hidden="true">
    <header class="services-proposal__head">
      <p class="services-proposal__title ui-app-mode-title">{{ copy.title }}</p>
      <div class="services-proposal__status">
        <span
          class="ui-app-tag ui-app-table-badge"
          :class="[
            decision === 'pay' && 'ui-app-tag--success',
            decision === 'cancel' && 'ui-app-tag--danger',
            !isActive && !decision && 'ui-app-tag--info',
            !decision && phase !== 'idle' && 'ui-app-tag--info',
            phase === 'idle' && !decision && 'ui-app-tag--slate'
          ]"
        >
          <template v-if="decision === 'pay'">{{ copy.statusApproved }}</template>
          <template v-else-if="decision === 'cancel'">{{ copy.statusCancelled }}</template>
          <template v-else-if="!isActive">{{ copy.statusCreating }}</template>
          <template v-else-if="phase !== 'idle'">{{ copy.statusBuilding }}</template>
          <template v-else>{{ copy.statusReady }}</template>
        </span>
      </div>
    </header>

    <div class="services-proposal__surface ui-app-border-soft">
      <div class="services-proposal__stage" :class="{ 'is-active': isActive }">
        <div class="services-proposal__stack" aria-hidden="true">
          <div
            v-for="(snap, idx) in stack"
            :key="snap.key"
            class="services-proposal__sheet ui-app-border-soft"
            :class="`is-level-${idx + 1}`"
          >
            <div class="services-proposal__sheet-head">
              <span class="ui-app-table-head-text">{{ snap.company }}</span>
              <span
                class="ui-app-tag ui-app-table-badge"
                :class="[snap.decision === 'pay' ? 'ui-app-tag--success' : 'ui-app-tag--danger']"
              >
                {{ snap.decision === 'pay' ? copy.statusApproved : copy.statusCancelled }}
              </span>
            </div>
            <div class="services-proposal__sheet-body">
              <span class="ui-app-table-row-text">Proposal {{ snap.id }}</span>
              <span class="ui-app-table-row-value">${{ snap.total }}</span>
            </div>
          </div>
        </div>

        <div v-if="leavingSheet" class="services-proposal__swap-leaving ui-app-border-soft" aria-hidden="true">
          <div class="services-proposal__swap-head">
            <span class="ui-app-mode-title">{{ copy.title }}</span>
            <span
              class="ui-app-tag ui-app-table-badge"
              :class="[leavingSheet.decision === 'pay' ? 'ui-app-tag--success' : 'ui-app-tag--danger']"
            >
              {{ leavingSheet.decision === 'pay' ? copy.statusApproved : copy.statusCancelled }}
            </span>
          </div>
          <div class="services-proposal__swap-body">
            <span class="ui-app-table-row-text">Proposal {{ leavingSheet.id }}</span>
            <span class="ui-app-table-row-value">${{ leavingSheet.total }}</span>
          </div>
          <div class="services-proposal__swap-lines">
            <span class="services-proposal__approval-line services-proposal__approval-line--w1" />
            <span class="services-proposal__approval-line services-proposal__approval-line--w2" />
          </div>
        </div>

        <div class="services-proposal__placeholder" :class="{ 'is-reduced': prefersReducedMotion }">
          <div class="services-proposal__placeholder-box ui-app-border-soft">
            <p class="services-proposal__placeholder-title ui-app-table-row-text">{{ copy.creatingTitle }}</p>
            <p class="services-proposal__placeholder-sub ui-app-micro-text">{{ copy.creatingSubtitle }}</p>
            <div class="services-proposal__skeleton" aria-hidden="true">
              <span class="services-proposal__sk services-proposal__sk--w1" />
              <span class="services-proposal__sk services-proposal__sk--w2" />
              <span class="services-proposal__sk services-proposal__sk--w3" />
              <span class="services-proposal__sk services-proposal__sk--w4" />
            </div>
          </div>
        </div>

        <div class="services-proposal__builder-shell" :class="{ 'is-swap-enter': isSheetSwapping }">
        <div class="services-proposal__builder" :class="`is-${phase}`">
        <div class="services-proposal__builder-head">
          <div class="services-proposal__builder-title">
            <span class="services-proposal__kicker ui-app-table-head-text">{{ draft.customer.company }}</span>
            <p class="services-proposal__h ui-app-heading">Proposal {{ draft.id }}</p>
          </div>
          <div class="services-proposal__builder-meta">
            <span class="services-proposal__meta-line ui-app-micro-text">{{ draft.customer.name }}</span>
            <span class="services-proposal__meta-line ui-app-micro-text services-proposal__meta-line--ghost" aria-hidden="true" />
          </div>
        </div>

        <div class="services-proposal__divider" />

        <div class="services-proposal__content">
          <div class="services-proposal__layout">
          <div class="services-proposal__left">
            <section class="services-proposal__block services-proposal__block--customer ui-app-border-soft">
              <p class="services-proposal__section-label ui-app-table-head-text">{{ copy.customer }}</p>
              <div class="services-proposal__customer">
                <span class="services-proposal__customer-line ui-app-table-row-text">{{ draft.customer.company }}</span>
                <span class="services-proposal__customer-line ui-app-micro-text services-proposal__customer-line--ghost" aria-hidden="true" />
              </div>
            </section>

            <section class="services-proposal__block services-proposal__block--summary ui-app-border-soft">
              <p class="services-proposal__section-label ui-app-table-head-text">{{ copy.total }}</p>
              <div class="services-proposal__totals services-proposal__totals--summary">
                <div class="services-proposal__total-row">
                  <span class="ui-app-micro-text">{{ copy.subtotal }}</span>
                  <span class="ui-app-table-row-text">${{ subtotal }}</span>
                </div>
                <div class="services-proposal__total-divider" aria-hidden="true" />
                <div class="services-proposal__total-row">
                  <span class="ui-app-micro-text">{{ copy.taxes }}</span>
                  <span class="ui-app-table-row-text">${{ taxes }}</span>
                </div>
                <div class="services-proposal__total-divider" aria-hidden="true" />
                <div class="services-proposal__total-row services-proposal__total-row--strong">
                  <span class="ui-app-table-row-text">{{ copy.total }}</span>
                  <span class="ui-app-table-row-value">${{ total }}</span>
                </div>
              </div>
            </section>
          </div>

          <aside class="services-proposal__right ui-app-border-soft" aria-label="Approval steps" aria-hidden="true">
            <div class="services-proposal__approvals">
              <span class="services-proposal__approval-line services-proposal__approval-line--w1" />
              <span class="services-proposal__approval-line services-proposal__approval-line--w2" />
              <span class="services-proposal__approval-line services-proposal__approval-line--w3" />
            </div>
          </aside>
          </div>
        </div>

        <div class="services-proposal__footer">
          <div class="services-proposal__actions">
            <button
              type="button"
              class="ui-app-btn ui-app-btn--neutral services-proposal__btn"
              :class="isPressingCancel && 'is-pressing'"
            >
              {{ copy.cancel }}
            </button>
            <button
              type="button"
              class="ui-app-btn ui-app-btn--primary services-proposal__btn"
              :class="[
                isPressingPay && 'is-pressing',
                decision === 'pay' && phase === 'result' && 'is-active'
              ]"
            >
              {{ copy.pay }}
            </button>
          </div>
        </div>

        <div class="services-proposal__waiting" :class="phase === 'idle' && 'is-visible'">
          <div class="services-proposal__waiting-dot" aria-hidden="true" />
        </div>
      </div>
      </div>
      </div>
    </div>
  </div>
</template>
