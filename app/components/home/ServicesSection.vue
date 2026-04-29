<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue";
import InventoryHolderVisual from "./services/InventoryHolderVisual.vue";
import CrmGlobeVisual from "./services/CrmGlobeVisual.vue";
import ProductCardVisual from "./services/ProductCardVisual.vue";
import UsersAccessVisual from "./services/UsersAccessVisual.vue";
import SchedulingVisual from "./services/SchedulingVisual.vue";
import ProposalBuilderVisual from "./services/ProposalBuilderVisual.vue";
import DashboardVisual from "./services/DashboardVisual.vue";
import { useHoverActivation } from "~/composables/useHoverActivation";
import type { ProductCardItem } from "~/types/product-variants";

const inventoryCardEl = ref<HTMLElement | null>(null);
const { isActive: inventoryIsActive } = useHoverActivation(inventoryCardEl);

const crmCardEl = ref<HTMLElement | null>(null);
const { isActive: crmIsActive } = useHoverActivation(crmCardEl);

const productCardEl = ref<HTMLElement | null>(null);
const { isActive: productCardIsActive } = useHoverActivation(productCardEl);

const proposalCardEl = ref<HTMLElement | null>(null);
const { isActive: proposalIsActive } = useHoverActivation(proposalCardEl);

const dashboardCardEl = ref<HTMLElement | null>(null);
const { isActive: dashboardIsActive } = useHoverActivation(dashboardCardEl);

const usersAccessIsActive = ref(false);

function setInventoryCardRef(el: Element | ComponentPublicInstance | null) {
  inventoryCardEl.value = el instanceof HTMLElement ? el : null;
}

function setCrmCardRef(el: Element | ComponentPublicInstance | null) {
  crmCardEl.value = el instanceof HTMLElement ? el : null;
}

function setProductCardRef(el: Element | ComponentPublicInstance | null) {
  productCardEl.value = el instanceof HTMLElement ? el : null;
}

function setProposalCardRef(el: Element | ComponentPublicInstance | null) {
  proposalCardEl.value = el instanceof HTMLElement ? el : null;
}

function setDashboardCardRef(el: Element | ComponentPublicInstance | null) {
  dashboardCardEl.value = el instanceof HTMLElement ? el : null;
}

function onUsersAccessEnter() {
  usersAccessIsActive.value = true;
}

function onUsersAccessLeave() {
  usersAccessIsActive.value = false;
}

function getServicesWaveId(cardId: string, token: string) {
  const safe = String(cardId).replace(/[^a-z0-9_-]/gi, "-").slice(0, 52);
  return `services-wave-${token}-${safe}`;
}

type CoreItem = { label: string; title: string; description: string };
type ModuleItem = {
  label: string;
  title: string;
  description: string;
  chip: string;
};
type InventoryVariant = {
  id: string;
  label: string;
  sku: string;
  price: number;
  stock: number;
  imageLabel: string;
};
type InventoryProduct = {
  id: string;
  name: string;
  category: string;
  baseSku: string;
  warehouse: string;
  reorderPoint: number;
  variants: InventoryVariant[];
};

const props = defineProps<{
  locale?: "en" | "es";
  title: string;
  items: CoreItem[];
  modulesTitle?: string;
  inventoryProducts: InventoryProduct[];
  modules: ModuleItem[];
  productVariants?: ProductCardItem[];
}>();

const coreCardClassByIndex = ["services__card--a", "services__card--b"];

const moduleCardClassByIndex = [
  "services__card--c",
  "services__card--d",
  "services__card--e",
  "services__card--f",
  "services__card--g",
];

const unifiedCards = computed(() => {
  const coreCards = props.items.slice(0, 2).map((item, index) => ({
    id: `core-${index}-${item.title}`,
    kind: "core" as const,
    label: item.label,
    title: item.title,
    description: item.description,
    chip: "",
    hasInventoryVisual: index === 0,
    hasProductVisual: index === 1,
    hasCrmGlobe: false,
    cardClass: coreCardClassByIndex[index] ?? "services__card--a",
  }));

  const moduleCards = props.modules.slice(0, 5).map((module, index) => ({
    id: `module-${index}-${module.title}`,
    kind: "module" as const,
    label: module.label,
    title: module.title,
    description: module.description,
    chip: module.chip,
    hasInventoryVisual: false,
    hasProductVisual: false,
    hasCrmGlobe: index === 0,
    hasUsersAccessVisual: index === 1,
    hasSchedulingVisual: index === 2,
    hasProposalVisual: index === 3,
    hasDashboardVisual: index === 4,
    cardClass: moduleCardClassByIndex[index] ?? "services__card--c",
  }));

  return [...coreCards, ...moduleCards];
});
</script>

<template>
  <section id="services" class="section services" data-aida="capabilities">
    <div class="container">
      <div class="services__heading content-stack content-stack--6">
        <h2 class="section__title">{{ title }}</h2>
      </div>

      <div
        class="services__bento grid-flow-dense"
        data-layout="12-col"
        data-tier="unified"
      >
        <article
          v-for="card in unifiedCards"
          :key="card.id"
          :ref="card.hasInventoryVisual
            ? setInventoryCardRef
            : card.hasCrmGlobe
              ? setCrmCardRef
              : card.hasProductVisual
                ? setProductCardRef
                : card.hasProposalVisual
                  ? setProposalCardRef
                  : card.hasDashboardVisual
                    ? setDashboardCardRef
                  : undefined"
          class="services__card"
            :class="[
              card.cardClass,
              { 'services__card--module': card.kind === 'module' },
              { 'services__card--with-holder': card.hasInventoryVisual },
              { 'services__card--with-crm-globe': card.hasCrmGlobe },
              { 'services__card--with-product-visual': card.hasProductVisual },
              { 'services__card--with-wave-bg': card.hasInventoryVisual || card.hasUsersAccessVisual },
              { 'services__card--with-users-access': card.hasUsersAccessVisual },
              { 'services__card--with-scheduling': card.hasSchedulingVisual },
              { 'services__card--with-proposal': card.hasProposalVisual },
              { 'services__card--with-dashboard': card.hasDashboardVisual },
            ]"
          @mouseenter="card.hasUsersAccessVisual && onUsersAccessEnter()"
          @mouseleave="card.hasUsersAccessVisual && onUsersAccessLeave()"
        >
          <svg
            v-if="card.hasInventoryVisual || card.hasUsersAccessVisual"
            class="services__card-wave-bg"
            :class="[
              card.hasInventoryVisual && 'services__card-wave-bg--inventory',
              card.hasUsersAccessVisual && 'services__card-wave-bg--access',
            ]"
            viewBox="0 0 1200 900"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient
                :id="getServicesWaveId(card.id, 'gradient-primary')"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stop-color="rgb(var(--color-accent-indigo-ch))"
                  stop-opacity="0.32"
                />
                <stop
                  offset="40%"
                  stop-color="rgb(var(--color-accent-violet-ch))"
                  stop-opacity="0.26"
                />
                <stop
                  offset="72%"
                  stop-color="rgb(var(--color-accent-pink-ch))"
                  stop-opacity="0.24"
                />
                <stop
                  offset="100%"
                  stop-color="rgb(var(--color-blue-400-ch))"
                  stop-opacity="0.28"
                />
              </linearGradient>
              <linearGradient
                :id="getServicesWaveId(card.id, 'gradient-secondary')"
                x1="8%"
                y1="100%"
                x2="92%"
                y2="8%"
              >
                <stop
                  offset="0%"
                  stop-color="rgb(var(--color-accent-indigo-ch))"
                  stop-opacity="0.22"
                />
                <stop
                  offset="55%"
                  stop-color="rgb(var(--color-accent-violet-ch))"
                  stop-opacity="0.18"
                />
                <stop
                  offset="100%"
                  stop-color="rgb(var(--color-blue-400-ch))"
                  stop-opacity="0.24"
                />
              </linearGradient>
              <filter
                :id="getServicesWaveId(card.id, 'blur-soft')"
                x="-20%"
                y="-30%"
                width="140%"
                height="190%"
              >
                <feGaussianBlur stdDeviation="16" />
              </filter>
              <filter
                :id="getServicesWaveId(card.id, 'blur-wide')"
                x="-24%"
                y="-36%"
                width="148%"
                height="196%"
              >
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>
            <path
              class="services__card-wave-path services__card-wave-path--primary"
              d="M0 660C62 636 122 620 186 604C266 584 350 568 448 568C548 568 640 572 724 568C804 564 874 546 932 512C988 480 1032 438 1068 386C1098 344 1124 304 1200 262V900H0V660Z"
              :filter="`url(#${getServicesWaveId(card.id, 'blur-soft')})`"
              :fill="`url(#${getServicesWaveId(card.id, 'gradient-primary')})`"
            />
            <path
              class="services__card-wave-path services__card-wave-path--secondary"
              d="M0 708C78 680 156 664 240 648C326 632 420 622 512 622C614 622 706 626 794 620C886 614 966 590 1028 548C1084 510 1128 460 1166 410C1180 392 1190 378 1200 362V900H0V708Z"
              :filter="`url(#${getServicesWaveId(card.id, 'blur-wide')})`"
              :fill="`url(#${getServicesWaveId(card.id, 'gradient-secondary')})`"
            />
          </svg>
          <div class="services__card-copy content-stack content-stack--2">
            <p class="services__card-kicker">{{ card.label }}</p>
            <h3 class="services__card-title typo-h3-xl">{{ card.title }}</h3>
            <p class="services__card-text typo-p-body-md-muted">
              {{ card.description }}
            </p>
          </div>
          <ClientOnly v-if="card.hasInventoryVisual">
            <InventoryHolderVisual
              class="services__inventory-holder-mount"
              :locale="props.locale ?? 'en'"
              :products="props.inventoryProducts"
              :active="inventoryIsActive"
            />
          </ClientOnly>
          <ClientOnly v-if="card.hasCrmGlobe">
            <div class="services__crm-globe-mount">
              <CrmGlobeVisual :active="crmIsActive" />
            </div>
          </ClientOnly>
          <ClientOnly v-if="card.hasProductVisual && props.productVariants?.length">
            <ProductCardVisual
              :locale="props.locale ?? 'en'"
              :products="props.productVariants ?? []"
              :active="productCardIsActive"
            />
          </ClientOnly>
          <UsersAccessVisual
            v-if="card.hasUsersAccessVisual"
            class="services__users-access-mount"
            :locale="props.locale ?? 'en'"
            :active="usersAccessIsActive"
          />

          <ClientOnly v-if="card.hasSchedulingVisual">
            <SchedulingVisual class="services__scheduling-mount" :locale="props.locale ?? 'en'" />
          </ClientOnly>

          <ClientOnly v-if="card.hasProposalVisual">
            <ProposalBuilderVisual
              class="services__proposal-mount"
              :locale="props.locale ?? 'en'"
              :active="proposalIsActive"
            />
          </ClientOnly>

          <ClientOnly v-if="card.hasDashboardVisual">
            <DashboardVisual
              class="services__dashboard-mount"
              :locale="props.locale ?? 'en'"
              :active="dashboardIsActive"
            />
          </ClientOnly>

        </article>
      </div>
    </div>
  </section>
</template>
