<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import TriggerFormNode from "./flow/TriggerFormNode.vue";
import SystemNode from "./flow/SystemNode.vue";
import EntityNode from "./flow/EntityNode.vue";
import ActionNode from "./flow/ActionNode.vue";
import OutputNode from "./flow/OutputNode.vue";

type WorkflowStage =
  | "typing"
  | "submit"
  | "ingest"
  | "split"
  | "quote"
  | "proposal_sent"
  | "proposal_accepted"
  | "payment_approved"
  | "reporting"
  | "reset";

type TriggerForm = {
  title: string;
  fields: {
    companyName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  productOptions: string[];
  submitLabel: string;
};

type WorkflowContactRecord = {
  companyName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  productService: string;
};

type WorkflowNodeType = "trigger" | "system" | "entity" | "action" | "output";

type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  x: number;
  y: number;
  xMobile?: number;
  yMobile?: number;
  variant?: string;
};

type WorkflowEdge = {
  from: string;
  to: string;
  style: "solid" | "dotted";
  accent?: boolean;
  animated?: boolean;
};

type WorkflowData = {
  triggerForm: TriggerForm;
  contactsTable: WorkflowContactRecord[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  sequence: string[];
  mobileVisibleNodeIds: string[];
};

type Point = {
  x: number;
  y: number;
};
type ProposalDecision = "payment" | "cancel";
type ReportEntry = {
  id: number;
  customerName: string;
  status: ProposalDecision;
};
type DashboardStats = {
  rate: number;
  quotes: number;
  sales: number;
};

const props = defineProps<{
  locale?: "en" | "es";
  title: string;
  description: string;
  steps: string[];
  workflow: WorkflowData;
}>();

const rootEl = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLElement | null>(null);
const stage = ref<WorkflowStage>("typing");
const isMobile = ref(false);
const typingProgress = ref(1);
const currentContact = ref<WorkflowContactRecord | null>(null);
const proposalRecord = ref<WorkflowContactRecord | null>(null);
const recentContacts = ref<WorkflowContactRecord[]>([]);
const reportEntries = ref<ReportEntry[]>([]);
const latestReportEntryId = ref<number | null>(null);
const dashboardStats = ref<DashboardStats>({
  rate: 22,
  quotes: 84,
  sales: 100,
});
const canvasSize = ref({ width: 1, height: 1 });
const quoteNumber = ref(100);
const quoteAnimateToken = ref(0);
const quoteHistory = ref<number[]>([100, 99, 98]);
const proposalAnimateToken = ref(0);

const packetRefs = new Map<string, HTMLElement>();
const nodeSlotRefs = new Map<string, HTMLElement>();
const edgePathRefs = new Map<string, SVGPathElement>();
let resizeObserver: ResizeObserver | null = null;
let cycleToken = 0;
let gsapRef: typeof import("gsap").gsap | null = null;
let contactPointer = 0;
let typingTimer: number | null = null;
let measureFrame: number | null = null;
let activeLoopToken: number | null = null;
const pendingTimeouts = new Map<number, () => void>();
let proposalDecisionResolver:
  | ((decision: ProposalDecision | null) => void)
  | null = null;
let reportEntryCounter = 0;

const STAGE_DURATIONS: Record<WorkflowStage, number> = {
  typing: 1600,
  submit: 780,
  ingest: 720,
  split: 860,
  quote: 720,
  proposal_sent: 640,
  proposal_accepted: 640,
  payment_approved: 640,
  reporting: 1320,
  reset: 380,
};
const QUOTE_TO_PROPOSAL_PAUSE_MS = 220;
const PROPOSAL_DECISION_HOLD_MS = 380;

const STAGE_FOCUS: Record<WorkflowStage, { nodes: string[]; edges: string[] }> =
  {
    typing: { nodes: ["form-submit"], edges: [] },
    submit: {
      nodes: ["form-submit"],
      edges: ["form-submit->customer-table", "form-submit->contact-table"],
    },
    ingest: {
      nodes: ["customer-table", "contact-table"],
      edges: ["form-submit->customer-table", "form-submit->contact-table"],
    },
    split: {
      nodes: ["customer-table", "contact-table"],
      edges: ["form-submit->customer-table", "form-submit->contact-table"],
    },
    quote: {
      nodes: ["customer-table", "contact-table", "quote"],
      edges: ["customer-table->quote", "contact-table->quote"],
    },
    proposal_sent: { nodes: ["quote", "proposal"], edges: ["quote->proposal"] },
    proposal_accepted: { nodes: ["proposal"], edges: [] },
    payment_approved: { nodes: ["proposal"], edges: [] },
    reporting: {
      nodes: ["proposal", "live-reporting"],
      edges: ["proposal->live-reporting"],
    },
    reset: { nodes: [], edges: [] },
  };

const activeNodeIds = computed(() => new Set(STAGE_FOCUS[stage.value].nodes));
const activeEdgeIds = computed(() => new Set(STAGE_FOCUS[stage.value].edges));

const visibleNodes = computed(() => {
  if (!isMobile.value) return props.workflow.nodes;
  const visible = new Set(props.workflow.mobileVisibleNodeIds);
  return props.workflow.nodes.filter((node) => visible.has(node.id));
});

const customerRows = computed(() =>
  recentContacts.value.slice(0, 3).map((item) => item.companyName),
);

const contactRows = computed(() =>
  recentContacts.value
    .slice(0, 3)
    .map((item) => `${item.fullName}   ${item.email}   ${item.phoneNumber}`),
);

function roundedPolylinePath(points: Point[], radius: number) {
  if (points.length < 2) return "";
  let path = `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (!prev || !curr) continue;

    if (!next) {
      path += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (len1 < 0.001 || len2 < 0.001) {
      path += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const corner = Math.min(radius, len1 / 2, len2 / 2);
    const fromX = curr.x - (v1x / len1) * corner;
    const fromY = curr.y - (v1y / len1) * corner;
    const toX = curr.x + (v2x / len2) * corner;
    const toY = curr.y + (v2y / len2) * corner;

    path += ` L ${fromX} ${fromY} Q ${curr.x} ${curr.y} ${toX} ${toY}`;
  }

  return path;
}

function setPacketRef(edgeId: string, el: Element | null) {
  if (!(el instanceof HTMLElement)) {
    packetRefs.delete(edgeId);
    return;
  }
  packetRefs.set(edgeId, el);
}

function setNodeSlotRef(nodeId: string, el: Element | null) {
  if (!(el instanceof HTMLElement)) {
    nodeSlotRefs.delete(nodeId);
    return;
  }
  nodeSlotRefs.set(nodeId, el);
}

function setEdgePathRef(edgeId: string, el: Element | null) {
  if (!(el instanceof SVGPathElement)) {
    edgePathRefs.delete(edgeId);
    return;
  }
  edgePathRefs.set(edgeId, el);
}

function scheduleMeasure() {
  if (typeof window === "undefined") return;
  if (measureFrame !== null) return;

  measureFrame = window.requestAnimationFrame(() => {
    measureFrame = null;
    const canvas = canvasEl.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    canvasSize.value = { width: rect.width, height: rect.height };
  });
}

function getFallbackPoint(nodeId: string) {
  const node = props.workflow.nodes.find((item) => item.id === nodeId);
  if (!node) return null;

  const xPercent = isMobile.value ? (node.xMobile ?? node.x) : node.x;
  const yPercent = isMobile.value ? (node.yMobile ?? node.y) : node.y;

  return {
    x: (xPercent / 100) * canvasSize.value.width,
    y: (yPercent / 100) * canvasSize.value.height,
  };
}

function getNodeCenter(nodeId: string) {
  const canvas = canvasEl.value;
  const slot = nodeSlotRefs.get(nodeId);
  if (!canvas || !slot || !(slot.firstElementChild instanceof HTMLElement)) {
    return getFallbackPoint(nodeId);
  }

  const canvasRect = canvas.getBoundingClientRect();
  const nodeRect = slot.firstElementChild.getBoundingClientRect();

  return {
    x: nodeRect.left - canvasRect.left + nodeRect.width / 2,
    y: nodeRect.top - canvasRect.top + nodeRect.height / 2,
  };
}

function getNodePort(nodeId: string, side: "left" | "right") {
  const canvas = canvasEl.value;
  const slot = nodeSlotRefs.get(nodeId);
  if (!canvas || !slot || !(slot.firstElementChild instanceof HTMLElement)) {
    return getFallbackPoint(nodeId);
  }

  const canvasRect = canvas.getBoundingClientRect();
  const nodeRect = slot.firstElementChild.getBoundingClientRect();

  return {
    x:
      side === "left"
        ? nodeRect.left - canvasRect.left
        : nodeRect.right - canvasRect.left,
    y: nodeRect.top - canvasRect.top + nodeRect.height / 2,
  };
}

function buildEdgePath(from: Point, to: Point) {
  const dx = to.x - from.x;
  const isForward = dx >= 0;

  const pivotRaw = isForward
    ? from.x + Math.max(44, Math.min(170, Math.abs(dx) * 0.48))
    : from.x - Math.max(56, Math.min(210, Math.abs(dx) * 0.68));

  const pivotX = Math.max(16, Math.min(canvasSize.value.width - 16, pivotRaw));

  const points =
    Math.abs(to.y - from.y) < 10
      ? [from, { x: pivotX, y: from.y }, to]
      : [from, { x: pivotX, y: from.y }, { x: pivotX, y: to.y }, to];

  return roundedPolylinePath(points, 13);
}

const lineSegments = computed(() => {
  const visible = new Set(visibleNodes.value.map((node) => node.id));

  return props.workflow.edges
    .filter((edge) => visible.has(edge.from) && visible.has(edge.to))
    .map((edge, index) => {
      const fromCenter = getNodeCenter(edge.from);
      const toCenter = getNodeCenter(edge.to);
      if (!fromCenter || !toCenter) return null;

      const fromSide = fromCenter.x <= toCenter.x ? "right" : "left";
      const toSide = fromCenter.x <= toCenter.x ? "left" : "right";
      const from = getNodePort(edge.from, fromSide);
      const to = getNodePort(edge.to, toSide);
      if (!from || !to) return null;

      return {
        key: `${edge.from}-${edge.to}-${index}`,
        id: `${edge.from}->${edge.to}`,
        d: buildEdgePath(from, to),
        style: edge.style,
        accent: edge.accent ?? false,
      };
    })
    .filter((segment): segment is NonNullable<typeof segment> =>
      Boolean(segment),
    );
});

function resolveNodeComponent(type: WorkflowNodeType) {
  if (type === "trigger") return TriggerFormNode;
  if (type === "system") return SystemNode;
  if (type === "entity") return EntityNode;
  if (type === "output") return OutputNode;
  return ActionNode;
}

function clearTypingTimer() {
  if (typingTimer === null) return;
  window.clearInterval(typingTimer);
  typingTimer = null;
}

function waitFor(ms: number) {
  return new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      pendingTimeouts.delete(timeoutId);
      resolve();
    }, ms);

    pendingTimeouts.set(timeoutId, resolve);
  });
}

function clearPendingTimeouts() {
  for (const [timeoutId, resolve] of pendingTimeouts) {
    window.clearTimeout(timeoutId);
    resolve();
  }
  pendingTimeouts.clear();
}

function startTypingAnimation(duration: number) {
  clearTypingTimer();
  typingProgress.value = 0;
  const startedAt = Date.now();
  typingTimer = window.setInterval(() => {
    const elapsed = Date.now() - startedAt;
    typingProgress.value = Math.min(1, elapsed / duration);
    if (typingProgress.value >= 1) {
      clearTypingTimer();
    }
  }, 60);
}

function nextContactFromTable() {
  const source = props.workflow.contactsTable;
  if (source.length === 0) return null;
  const next = source[contactPointer % source.length] ?? null;
  contactPointer += 1;
  return next;
}

function hydrateRecentContacts() {
  const source = props.workflow.contactsTable.slice(0, 4);
  if (source.length === 0) return;
  recentContacts.value = source;
}

function pushCurrentContactToTables() {
  if (!currentContact.value) return;
  recentContacts.value = [currentContact.value, ...recentContacts.value].slice(
    0,
    4,
  );
}

function advanceQuoteOrder() {
  quoteNumber.value += 1;
  quoteHistory.value = [quoteNumber.value, ...quoteHistory.value].slice(0, 3);
  quoteAnimateToken.value += 1;
}

function materializeProposal() {
  if (!currentContact.value) return;
  proposalRecord.value = { ...currentContact.value };
  proposalAnimateToken.value += 1;
}

function pushReportEntry(decision: ProposalDecision) {
  if (!proposalRecord.value) return;
  reportEntryCounter += 1;
  const nextEntry: ReportEntry = {
    id: reportEntryCounter,
    customerName: proposalRecord.value.companyName,
    status: decision,
  };
  reportEntries.value = [
    nextEntry,
    ...reportEntries.value,
  ].slice(0, 4);
  latestReportEntryId.value = nextEntry.id;
  dashboardStats.value = {
    quotes: dashboardStats.value.quotes + 1,
    rate: Number(
      Math.max(
        0,
        Math.min(100, dashboardStats.value.rate + (Math.random() * 6 - 3)),
      ).toFixed(1),
    ),
    sales:
      decision === "payment"
        ? Math.max(100, dashboardStats.value.sales) +
          Math.floor(Math.random() * 100) +
          1
        : Math.max(100, dashboardStats.value.sales),
  };
}

function resolveRowsForNode(nodeId: string) {
  if (nodeId === "customer-table") return customerRows.value;
  if (nodeId === "contact-table") return contactRows.value;
  if (nodeId === "live-reporting") return reportEntries.value;
  return undefined;
}

function updateViewportFlags() {
  if (typeof window === "undefined") return;
  isMobile.value = window.matchMedia("(max-width: 60em)").matches;
  scheduleMeasure();
}

function shouldRunLoop() {
  return isInViewport.value && !isReducedMotion.value;
}

async function ensureGsap() {
  if (gsapRef) return gsapRef;
  const module = await import("gsap");
  gsapRef = module.gsap;
  return gsapRef;
}

async function animatePacket(edgeId: string) {
  const gsap = await ensureGsap();
  const packet = packetRefs.get(edgeId);
  const pathEl = edgePathRefs.get(edgeId);
  if (!packet || !pathEl) return;

  const totalLength = pathEl.getTotalLength();
  if (!Number.isFinite(totalLength) || totalLength <= 0) return;

  const carrier = { progress: 0 };
  const start = pathEl.getPointAtLength(0);

  gsap.killTweensOf(packet);
  gsap.killTweensOf(carrier);
  gsap.set(packet, {
    autoAlpha: 0,
    x: start.x,
    y: start.y,
    xPercent: -50,
    yPercent: -50,
    scale: 0.75,
  });
  gsap.to(packet, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.12,
    ease: "power1.out",
  });
  gsap.to(carrier, {
    progress: 1,
    duration: 0.7,
    ease: "power2.inOut",
    onUpdate: () => {
      const point = pathEl.getPointAtLength(carrier.progress * totalLength);
      gsap.set(packet, { x: point.x, y: point.y });
    },
  });
  gsap.to(packet, {
    autoAlpha: 0,
    scale: 0.72,
    duration: 0.2,
    delay: 0.48,
    ease: "power1.out",
  });
}

async function runSingleCycle(token: number) {
  const runStage = async (
    nextStage: WorkflowStage,
    packetEdges: string[] = [],
    onAfterPackets?: () => void,
  ) => {
    if (token !== cycleToken) return;
    stage.value = nextStage;
    if (nextStage === "typing") {
      startTypingAnimation(STAGE_DURATIONS.typing);
    } else {
      typingProgress.value = 1;
      clearTypingTimer();
    }
    await nextTick();
    scheduleMeasure();
    if (packetEdges.length > 0) {
      await Promise.all(packetEdges.map((edgeId) => animatePacket(edgeId)));
    }
    onAfterPackets?.();
    await waitFor(STAGE_DURATIONS[nextStage]);
  };

  currentContact.value = nextContactFromTable();
  await runStage("typing");
  await runStage("submit", [
    "form-submit->customer-table",
    "form-submit->contact-table",
  ]);
  pushCurrentContactToTables();
  await runStage("ingest");
  await runStage("split");
  await runStage(
    "quote",
    ["customer-table->quote", "contact-table->quote"],
    advanceQuoteOrder,
  );
  await waitFor(QUOTE_TO_PROPOSAL_PAUSE_MS);
  const decisionPromise = waitForProposalDecision(token);
  await runStage("proposal_sent", ["quote->proposal"], materializeProposal);
  const decision = await decisionPromise;
  if (!decision || token !== cycleToken) return;
  await waitFor(PROPOSAL_DECISION_HOLD_MS);
  if (decision === "payment") {
    await runStage("payment_approved");
  } else {
    await runStage("proposal_accepted");
  }
  await runStage("reporting", ["proposal->live-reporting"], () => {
    pushReportEntry(decision);
  });
  await runStage("reset", [], () => {
    proposalRecord.value = null;
  });
}

async function runLoop(token: number) {
  while (token === cycleToken && shouldRunLoop()) {
    await runSingleCycle(token);
  }
}

function startLoopIfNeeded() {
  if (!shouldRunLoop()) return;
  if (activeLoopToken !== null) return;
  cycleToken += 1;
  const token = cycleToken;
  activeLoopToken = token;
  void runLoop(token).finally(() => {
    if (activeLoopToken === token) {
      activeLoopToken = null;
    }
  });
}

function stopLoop() {
  cycleToken += 1;
  activeLoopToken = null;
  clearTypingTimer();
  clearPendingTimeouts();
  if (proposalDecisionResolver) {
    proposalDecisionResolver(null);
    proposalDecisionResolver = null;
  }
}

function waitForProposalDecision(token: number) {
  return new Promise<ProposalDecision | null>((resolve) => {
    if (token !== cycleToken) {
      resolve(null);
      return;
    }
    proposalDecisionResolver = (decision) => {
      proposalDecisionResolver = null;
      resolve(decision);
    };
  });
}

function handleProposalDecision(decision: ProposalDecision) {
  if (!proposalDecisionResolver || stage.value !== "proposal_sent") return;
  proposalDecisionResolver(decision);
}

onMounted(() => {
  hydrateRecentContacts();
  currentContact.value = nextContactFromTable();
  updateViewportFlags();

  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateViewportFlags, { passive: true });
  }

  if (typeof ResizeObserver !== "undefined" && canvasEl.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleMeasure();
    });
    resizeObserver.observe(canvasEl.value);
  }

  scheduleMeasure();
});

onBeforeUnmount(() => {
  stopLoop();
  clearTypingTimer();
  clearPendingTimeouts();

  if (measureFrame !== null && typeof window !== "undefined") {
    window.cancelAnimationFrame(measureFrame);
    measureFrame = null;
  }

  resizeObserver?.disconnect();
  resizeObserver = null;

  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateViewportFlags);
  }
});

useDotsHover(rootEl);

const { isInViewport, prefersReducedMotion: isReducedMotion } =
  useViewportAnimationGate({
    target: rootEl,
    threshold: 0.24,
    rootMargin: "0px 0px -10% 0px",
    onStart: () => {
      startLoopIfNeeded();
    },
    onStop: () => {
      stopLoop();
    },
    onReducedMotion: () => {
      proposalRecord.value = currentContact.value
        ? { ...currentContact.value }
        : null;
      stage.value = "reporting";
    },
  });

watch(
  () => visibleNodes.value.map((node) => node.id).join("|"),
  async () => {
    await nextTick();
    scheduleMeasure();
  },
);

watch(stage, async () => {
  await nextTick();
  scheduleMeasure();
});
</script>

<template>
  <section
    id="flow"
    ref="rootEl"
    class="section flow"
    data-aida="flow"
    data-flow="workflow-canvas"
  >
    <span class="dots-layer" aria-hidden="true" />
    <span class="dots-layer dots-layer--interactive" aria-hidden="true" />
    <div class="container">
      <div class="flow__heading content-stack content-stack--6">
        <h2 class="section__title">{{ props.title }}</h2>
        <p class="flow__text typo-p-body-muted">{{ props.description }}</p>
      </div>

      <div ref="canvasEl" class="flow-workflow ui-app-view ui-app-table-scale-compact" aria-hidden="true">
        <svg
          class="flow-workflow__lines ui-abs-fill ui-size-full"
          :viewBox="`0 0 ${canvasSize.width} ${canvasSize.height}`"
          preserveAspectRatio="none"
        >
          <path
            v-for="segment in lineSegments"
            :key="segment.key"
            class="flow-workflow__line"
            :class="[
              segment.style === 'dotted'
                ? 'flow-workflow__line--dotted'
                : 'flow-workflow__line--solid',
              segment.accent ? 'flow-workflow__line--accent' : '',
              activeEdgeIds.has(segment.id) ? 'is-active' : '',
            ]"
            :d="segment.d"
            :ref="(el) => setEdgePathRef(segment.id, el)"
          />
        </svg>

        <div class="flow-workflow__packets ui-abs-fill">
          <span
            v-for="edge in props.workflow.edges.filter((item) => item.animated)"
            :key="`packet-${edge.from}-${edge.to}`"
            class="flow-workflow__packet"
            :ref="(el) => setPacketRef(`${edge.from}->${edge.to}`, el)"
          />
        </div>

        <ul class="flow-workflow__nodes ui-list-reset ui-abs-fill" role="presentation">
          <li
            v-for="node in visibleNodes"
            :key="node.id"
            class="flow-workflow__node-slot"
            :class="`flow-workflow__node-slot--${node.id}`"
            :ref="(el) => setNodeSlotRef(node.id, el)"
          >
            <component
              :is="resolveNodeComponent(node.type)"
              :locale="props.locale ?? 'en'"
              :label="node.label"
              :variant="node.variant"
              :active="activeNodeIds.has(node.id)"
              :stage="stage"
              :form="props.workflow.triggerForm"
              :record="node.id === 'proposal' ? proposalRecord : currentContact"
              :rows="resolveRowsForNode(node.id)"
              :latest-entry-id="node.id === 'live-reporting' ? latestReportEntryId : null"
              :stats="node.id === 'live-reporting' ? dashboardStats : undefined"
              :typing-progress="typingProgress"
              :quote-number="quoteNumber"
              :quote-animate-token="quoteAnimateToken"
              :quote-history="quoteHistory"
              :proposal-animate-token="proposalAnimateToken"
              @proposal-decision="handleProposalDecision"
            />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
