<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

type ProposalDecision = "payment" | "cancel";

const props = defineProps<{
  locale?: "en" | "es";
  label: string;
  variant?: string;
  stage?: string;
  active?: boolean;
  quoteNumber?: number;
  quoteAnimateToken?: number;
  quoteHistory?: number[];
  proposalAnimateToken?: number;
  record?: {
    companyName: string;
    fullName: string;
    email: string;
  } | null;
}>();

const emit = defineEmits<{
  (e: "proposal-decision", decision: ProposalDecision): void;
}>();

const autoDecision = ref<ProposalDecision | null>(null);
const autoDecisionCursor = ref<ProposalDecision>("payment");
const lastAutoCycleKey = ref<string | null>(null);
const confirmDecision = ref<ProposalDecision | null>(null);
const settledDecision = ref<ProposalDecision | null>(null);
let autoDecisionTimer: number | null = null;
let autoDecisionCommitTimer: number | null = null;
let autoDecisionReleaseTimer: number | null = null;
let confirmDecisionStartTimer: number | null = null;
let confirmDecisionTimer: number | null = null;

function clearAutoDecisionTimer() {
  if (autoDecisionTimer === null) return;
  window.clearTimeout(autoDecisionTimer);
  autoDecisionTimer = null;
}

function clearAutoDecisionCommitTimer() {
  if (autoDecisionCommitTimer === null) return;
  window.clearTimeout(autoDecisionCommitTimer);
  autoDecisionCommitTimer = null;
}

function clearAutoDecisionReleaseTimer() {
  if (autoDecisionReleaseTimer === null) return;
  window.clearTimeout(autoDecisionReleaseTimer);
  autoDecisionReleaseTimer = null;
}

function clearConfirmDecisionTimer() {
  if (confirmDecisionTimer === null) return;
  window.clearTimeout(confirmDecisionTimer);
  confirmDecisionTimer = null;
}

function clearConfirmDecisionStartTimer() {
  if (confirmDecisionStartTimer === null) return;
  window.clearTimeout(confirmDecisionStartTimer);
  confirmDecisionStartTimer = null;
}

function emitDecision(decision: ProposalDecision) {
  if (props.variant !== "proposal" || props.stage !== "proposal_sent" || !props.record) return;
  clearAutoDecisionTimer();
  clearAutoDecisionCommitTimer();
  settledDecision.value = decision;
  clearConfirmDecisionStartTimer();
  clearConfirmDecisionTimer();
  confirmDecisionStartTimer = window.setTimeout(() => {
    confirmDecision.value = decision;
    clearConfirmDecisionTimer();
    confirmDecisionTimer = window.setTimeout(() => {
      if (confirmDecision.value === decision) {
        confirmDecision.value = null;
      }
    }, 420);
  }, 140);
  emit("proposal-decision", decision);
  clearAutoDecisionReleaseTimer();
  autoDecisionReleaseTimer = window.setTimeout(() => {
    if (autoDecision.value === decision) {
      autoDecision.value = null;
    }
  }, 220);
}

function handleDecision(decision: ProposalDecision) {
  emitDecision(decision);
}

function scheduleAutoDecision() {
  const PRE_CLICK_WAIT_MS = 920;
  const CLICK_PRESS_MS = 620;

  if (
    props.variant !== "proposal" ||
    props.stage !== "proposal_sent" ||
    !props.record ||
    !props.active
  ) {
    clearAutoDecisionTimer();
    clearAutoDecisionCommitTimer();
    clearAutoDecisionReleaseTimer();
    clearConfirmDecisionStartTimer();
    clearConfirmDecisionTimer();
    autoDecision.value = null;
    confirmDecision.value = null;
    if (!props.record || props.stage === "reset" || props.stage === "typing") {
      settledDecision.value = null;
    }
    return;
  }

  const cycleKey = `${props.record.email}-${props.proposalAnimateToken ?? 0}`;
  if (cycleKey === lastAutoCycleKey.value) return;
  lastAutoCycleKey.value = cycleKey;
  settledDecision.value = null;
  confirmDecision.value = null;

  const decision = autoDecisionCursor.value;
  autoDecisionCursor.value = autoDecisionCursor.value === "payment" ? "cancel" : "payment";
  autoDecision.value = null;
  clearAutoDecisionTimer();
  clearAutoDecisionCommitTimer();

  autoDecisionTimer = window.setTimeout(() => {
    autoDecision.value = decision;
    clearAutoDecisionCommitTimer();
    autoDecisionCommitTimer = window.setTimeout(() => {
      emitDecision(decision);
    }, CLICK_PRESS_MS);
  }, PRE_CLICK_WAIT_MS);
}

const visibleDecision = computed<ProposalDecision | null>(
  () => confirmDecision.value ?? settledDecision.value,
);
const quotePrefix = computed(() =>
  props.locale === "es" ? "Cotizacion" : "Quote",
);
const paymentLabel = computed(() =>
  props.locale === "es" ? "Pago" : "Payment",
);
const cancelLabel = computed(() =>
  props.locale === "es" ? "Cancelar" : "Cancel",
);
const payLabel = computed(() =>
  props.locale === "es" ? "Pagar" : "Pay",
);

watch(
  () => [props.stage, props.record?.email ?? "", props.proposalAnimateToken ?? 0] as const,
  () => {
    scheduleAutoDecision();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearAutoDecisionTimer();
  clearAutoDecisionCommitTimer();
  clearAutoDecisionReleaseTimer();
  clearConfirmDecisionStartTimer();
  clearConfirmDecisionTimer();
});
</script>

<template>
  <div class="flow-node-shell surface-pastel" :class="{ 'is-active': active }">
    <article
      class="flow-workflow-node flow-workflow-node--action"
      :class="[{ 'is-active': active }, variant ? `flow-workflow-node--${variant}` : '']"
    >
      <p class="flow-workflow-node__title ui-app-mode-title">{{ label }}</p>
      <ul v-if="variant === 'quote'" class="flow-action-node__quote-list ui-list-reset">
        <li
          v-for="(orderNumber, index) in (quoteHistory?.length ? quoteHistory : [quoteNumber ?? 101])"
          :key="index === 0 ? `quote-${orderNumber}-${quoteAnimateToken ?? 0}` : `quote-${orderNumber}-${index}`"
          class="flow-action-node__quote-id ui-app-table-row-text"
          :class="{ 'flow-action-node__quote-id--entering': index === 0 }"
        >
          {{ quotePrefix }} #{{ orderNumber }}
        </li>
      </ul>
      <div
        v-if="variant === 'proposal'"
        :key="`proposal-${record?.email ?? 'placeholder'}-${proposalAnimateToken ?? 0}`"
        class="flow-action-node__proposal"
        :class="{ 'flow-action-node__proposal--entering': Boolean(record && proposalAnimateToken) }"
      >
        <template v-if="record">
          <div class="flow-action-node__proposal-meta">
            <span class="ui-app-micro-text">{{ record.companyName }}</span>
            <span class="ui-app-micro-text">{{ record.fullName }}</span>
            <span class="ui-app-micro-text">{{ record.email }}</span>
          </div>
          <div class="flow-action-node__proposal-lines">
            <span />
            <span />
            <span />
          </div>
          <div class="flow-action-node__proposal-lines flow-action-node__proposal-lines--short">
            <span />
            <span />
          </div>
          <div
            class="flow-action-node__proposal-actions"
          >
            <transition name="flow-proposal-decision" mode="out-in">
              <span
                v-if="visibleDecision"
                :key="`decision-${visibleDecision}`"
                class="flow-action-node__proposal-decision-tag ui-app-tag ui-app-table-badge"
                :class="visibleDecision === 'payment' ? 'ui-app-tag--success' : 'ui-app-tag--danger'"
              >
                {{ visibleDecision === "payment" ? paymentLabel : cancelLabel }}
              </span>
              <div
                v-else-if="stage === 'proposal_sent'"
                key="decision-buttons"
                class="flow-action-node__proposal-actions-buttons"
              >
                <button
                  type="button"
                  class="flow-action-node__proposal-button"
                  :class="{ 'is-auto-pressing': autoDecision === 'cancel' }"
                  @click="handleDecision('cancel')"
                >
                  {{ cancelLabel }}
                </button>
                <button
                  type="button"
                  class="flow-action-node__proposal-button is-active"
                  :class="{ 'is-auto-pressing': autoDecision === 'payment' }"
                  @click="handleDecision('payment')"
                >
                  {{ payLabel }}
                </button>
              </div>
            </transition>
          </div>
        </template>
        <div v-else class="flow-action-node__proposal-waiting" />
      </div>
    </article>
  </div>
</template>
