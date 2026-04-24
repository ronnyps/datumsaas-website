<script setup lang="ts">
import InventoryHolderVisual from "./services/InventoryHolderVisual.vue";

type CoreItem = { label: string; title: string; description: string };
type ModuleItem = { label: string; title: string; description: string; chip: string };
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
}>();

const coreCardClassByIndex = [
  "services__card--a",
  "services__card--b"
];

const moduleCardClassByIndex = [
  "services__card--c",
  "services__card--d",
  "services__card--e",
  "services__card--f",
  "services__card--g"
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
    cardClass: coreCardClassByIndex[index] ?? "services__card--a"
  }));

  const moduleCards = props.modules.slice(0, 5).map((module, index) => ({
    id: `module-${index}-${module.title}`,
    kind: "module" as const,
    label: module.label,
    title: module.title,
    description: module.description,
    chip: module.chip,
    hasInventoryVisual: false,
    cardClass: moduleCardClassByIndex[index] ?? "services__card--c"
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

      <div class="services__bento grid-flow-dense" data-layout="12-col" data-tier="unified">
        <article
          v-for="card in unifiedCards"
          :key="card.id"
          class="services__card"
          :class="[
            card.cardClass,
            { 'services__card--module': card.kind === 'module' },
            { 'services__card--with-holder': card.hasInventoryVisual }
          ]"
        >
          <svg
            v-if="card.hasInventoryVisual"
            class="services__card-wave-bg"
            viewBox="0 0 1200 900"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="services-wave-gradient-primary" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgb(var(--color-accent-indigo-ch))" stop-opacity="0.32" />
                <stop offset="40%" stop-color="rgb(var(--color-accent-violet-ch))" stop-opacity="0.26" />
                <stop offset="72%" stop-color="rgb(var(--color-accent-pink-ch))" stop-opacity="0.24" />
                <stop offset="100%" stop-color="rgb(var(--color-blue-400-ch))" stop-opacity="0.28" />
              </linearGradient>
              <linearGradient id="services-wave-gradient-secondary" x1="8%" y1="100%" x2="92%" y2="8%">
                <stop offset="0%" stop-color="rgb(var(--color-accent-indigo-ch))" stop-opacity="0.22" />
                <stop offset="55%" stop-color="rgb(var(--color-accent-violet-ch))" stop-opacity="0.18" />
                <stop offset="100%" stop-color="rgb(var(--color-blue-400-ch))" stop-opacity="0.24" />
              </linearGradient>
              <filter id="services-wave-blur-soft" x="-20%" y="-30%" width="140%" height="190%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
              <filter id="services-wave-blur-wide" x="-24%" y="-36%" width="148%" height="196%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>
            <path
              class="services__card-wave-path services__card-wave-path--primary"
              d="M0 660C62 636 122 620 186 604C266 584 350 568 448 568C548 568 640 572 724 568C804 564 874 546 932 512C988 480 1032 438 1068 386C1098 344 1124 304 1200 262V900H0V660Z"
              filter="url(#services-wave-blur-soft)"
              fill="url(#services-wave-gradient-primary)"
            />
            <path
              class="services__card-wave-path services__card-wave-path--secondary"
              d="M0 708C78 680 156 664 240 648C326 632 420 622 512 622C614 622 706 626 794 620C886 614 966 590 1028 548C1084 510 1128 460 1166 410C1180 392 1190 378 1200 362V900H0V708Z"
              filter="url(#services-wave-blur-wide)"
              fill="url(#services-wave-gradient-secondary)"
            />
          </svg>
          <p class="services__card-kicker">{{ card.label }}</p>
          <h3 class="services__card-title typo-h3-xl">{{ card.title }}</h3>
          <p class="services__card-text typo-p-body-md-muted">{{ card.description }}</p>
          <InventoryHolderVisual
            v-if="card.hasInventoryVisual"
            class="services__inventory-holder-mount"
            :locale="props.locale ?? 'en'"
            :products="props.inventoryProducts"
          />
          <p v-if="card.kind === 'module'" class="services__module-chip">{{ card.chip }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
