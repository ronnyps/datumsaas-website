<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

type InventoryPhase =
  | "rest"
  | "stock_inbound"
  | "variant_update"
  | "sale_outbound"
  | "low_stock_alert"
  | "settle";

type StockState = "healthy" | "watch" | "low";

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

type MutableInventoryProduct = Omit<InventoryProduct, "variants"> & {
  variants: InventoryVariant[];
};

const props = defineProps<{
  active?: boolean;
  locale?: "en" | "es";
  products: InventoryProduct[];
}>();

const PHASE_DURATION_MS: Record<InventoryPhase, number> = {
  rest: 980,
  stock_inbound: 1160,
  variant_update: 1040,
  sale_outbound: 1120,
  low_stock_alert: 1320,
  settle: 900,
};
const MAX_ANIMATED_ROWS = 8;

const rootEl = ref<HTMLElement | null>(null);
const phase = ref<InventoryPhase>("rest");
const inventory = ref<MutableInventoryProduct[]>([]);
const selectedProductId = ref<string>("");
const selectedVariantId = ref<string>("");
const eventCount = ref(1840);

let cycleToken = 0;
let isRunning = false;
let isReducedMotion = false;
const timeoutIds = new Set<number>();
const recentProductIds: string[] = [];

function cloneInventoryProducts(items: InventoryProduct[]): MutableInventoryProduct[] {
  return items.map((item) => ({
    ...item,
    variants: item.variants.map((variant) => ({ ...variant })),
  }));
}

function clearAllTimeouts() {
  timeoutIds.forEach((id) => {
    window.clearTimeout(id);
  });
  timeoutIds.clear();
}

function randomInt(min: number, max: number): number {
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDuration(phaseName: InventoryPhase): number {
  const base = PHASE_DURATION_MS[phaseName];
  if (isReducedMotion) return base;
  const jitter = randomInt(-110, 180);
  return Math.max(620, base + jitter);
}

function waitFor(ms: number, token: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIds.delete(timeoutId);
      resolve(token === cycleToken && isRunning);
    }, ms);
    timeoutIds.add(timeoutId);
  });
}

function getTotalStock(product: MutableInventoryProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

function getProductState(product: MutableInventoryProduct): StockState {
  const totalStock = getTotalStock(product);
  if (product.variants.some((variant) => variant.stock <= product.reorderPoint)) return "low";
  if (totalStock <= product.reorderPoint * product.variants.length + 8) return "watch";
  return "healthy";
}

function getProductInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
}

function resolveProduct(productId: string) {
  return inventory.value.find((item) => item.id === productId);
}

function setSelectedProduct(productId: string) {
  const product = resolveProduct(productId);
  if (!product) return;
  selectedProductId.value = product.id;
  selectedVariantId.value = product.variants[0]?.id ?? "";
}

function resetModel() {
  inventory.value = cloneInventoryProducts(props.products);
  if (inventory.value.length > 0) {
    const product = inventory.value[0];
    if (product) {
      selectedProductId.value = product.id;
      selectedVariantId.value = product.variants[0]?.id ?? "";
    }
  } else {
    selectedProductId.value = "";
    selectedVariantId.value = "";
  }
  phase.value = "rest";
}

function pickNextProduct(): MutableInventoryProduct | undefined {
  if (inventory.value.length === 0) return undefined;
  const visiblePool = inventory.value.slice(
    0,
    Math.min(MAX_ANIMATED_ROWS, inventory.value.length),
  );
  const pool = visiblePool.length > 0 ? visiblePool : inventory.value;

  const recentWindow = Math.min(3, Math.max(1, pool.length - 1));
  const blockedIds = new Set(recentProductIds.slice(-recentWindow));
  let candidates = pool.filter((item) => !blockedIds.has(item.id));
  if (candidates.length === 0) candidates = pool;

  const next = candidates[randomInt(0, candidates.length - 1)];
  if (!next) return undefined;

  recentProductIds.push(next.id);
  if (recentProductIds.length > 6) {
    recentProductIds.shift();
  }

  return next;
}

function updateVariant(productId: string, variantId: string, delta: number) {
  inventory.value = inventory.value.map((product) => {
    if (product.id !== productId) return product;

    return {
      ...product,
      variants: product.variants.map((variant) => {
        if (variant.id !== variantId) return variant;
        return {
          ...variant,
          stock: Math.max(0, variant.stock + delta),
        };
      }),
    };
  });
}

function runInboundStep(product: MutableInventoryProduct) {
  const firstVariant = product.variants[0];
  if (!firstVariant) return;
  selectedVariantId.value = firstVariant.id;
  for (const variant of product.variants) {
    updateVariant(product.id, variant.id, randomInt(1, 3));
  }
}

function runVariantRebalance(product: MutableInventoryProduct) {
  if (product.variants.length < 2) return;
  const sorted = [...product.variants].sort((a, b) => b.stock - a.stock);
  const high = sorted[0];
  const low = sorted[sorted.length - 1];
  if (!high || !low || high.id === low.id) return;
  const amount = randomInt(1, 3);
  updateVariant(product.id, high.id, -amount);
  updateVariant(product.id, low.id, amount);
  selectedVariantId.value = low.id;
}

function runSaleStep(product: MutableInventoryProduct) {
  const mediumVariant = product.variants.find((variant) => variant.id === "m");
  const randomVariant = product.variants[randomInt(0, product.variants.length - 1)];
  const target = randomInt(0, 100) < 62 ? (mediumVariant ?? randomVariant) : randomVariant;
  if (!target) return;
  updateVariant(product.id, target.id, -randomInt(3, 8));
  selectedVariantId.value = target.id;
}

function runLowStockStep(product: MutableInventoryProduct) {
  const target =
    product.variants.find((variant) => variant.stock > product.reorderPoint) ??
    product.variants[product.variants.length - 1];
  if (!target) return;
  const nextStock = Math.max(0, product.reorderPoint - 1);
  const delta = nextStock - target.stock;
  updateVariant(product.id, target.id, delta);
  selectedVariantId.value = target.id;
}

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      tableProduct: "Producto",
      tableStock: "Stock",
      tableState: "Estado",
      phaseLabel: {
        rest: "Sincronizando inventario",
        stock_inbound: "Entrada de stock registrada",
        variant_update: "Stock distribuido por variantes",
        sale_outbound: "Venta aplicada al inventario",
        low_stock_alert: "Alerta de stock bajo",
        settle: "Inventario estable",
      },
      badgeLabel: {
        rest: "Activo",
        stock_inbound: "Inbound",
        variant_update: "Sync",
        sale_outbound: "Sale",
        low_stock_alert: "Warning",
        settle: "Ready",
      },
      stateLabel: {
        healthy: "Estable",
        watch: "Monitoreo",
        low: "Bajo",
      },
      feedLabel: "Eventos",
      sidebarCategory: "Categoria",
      sidebarSku: "SKU base",
      sidebarWarehouse: "Almacen",
      sidebarReorder: "Reorder point",
      sidebarVariants: "Variantes",
      sidebarMedia: "Media",
    };
  }

  return {
    tableProduct: "Product",
    tableStock: "Stock",
    tableState: "State",
    phaseLabel: {
      rest: "Syncing inventory",
      stock_inbound: "Inbound stock recorded",
      variant_update: "Stock rebalanced by variants",
      sale_outbound: "Sale applied to inventory",
      low_stock_alert: "Low stock alert",
      settle: "Inventory settled",
    },
    badgeLabel: {
      rest: "Live",
      stock_inbound: "Inbound",
      variant_update: "Sync",
      sale_outbound: "Sale",
      low_stock_alert: "Warning",
      settle: "Ready",
    },
    stateLabel: {
      healthy: "Stable",
      watch: "Watch",
      low: "Low",
    },
    feedLabel: "Events",
    sidebarCategory: "Category",
    sidebarSku: "Base SKU",
    sidebarWarehouse: "Warehouse",
    sidebarReorder: "Reorder point",
    sidebarVariants: "Variants",
    sidebarMedia: "Media",
  };
});

const productRows = computed(() =>
  inventory.value.map((product) => ({
    id: product.id,
    name: product.name,
    initials: getProductInitials(product.name),
    stock: getTotalStock(product),
    state: getProductState(product),
  })),
);

const selectedProduct = computed(() => resolveProduct(selectedProductId.value) ?? inventory.value[0]);
const selectedVariantRows = computed(() => selectedProduct.value?.variants ?? []);
const phaseLabel = computed(() => copy.value.phaseLabel[phase.value]);
const phaseBadgeLabel = computed(() => copy.value.badgeLabel[phase.value]);

const isActive = computed(() => Boolean(props.active ?? true));
const hasInventory = computed(() => inventory.value.length > 0);

function stopCycle() {
  isRunning = false;
  cycleToken += 1;
  clearAllTimeouts();
}

function setReducedMotionState() {
  isReducedMotion = true;
  startCycle({ reducedMotion: true });
}

watch(
  () => props.products,
  () => {
    resetModel();
  },
  { deep: true, immediate: true },
);

async function runCycle(token: number) {
  while (isRunning && token === cycleToken) {
    if (inventory.value.length === 0) {
      if (!(await waitFor(randomDuration("rest"), token))) return;
      continue;
    }

    const currentProduct = pickNextProduct();
    if (!currentProduct) {
      if (!(await waitFor(randomDuration("rest"), token))) return;
      continue;
    }

    setSelectedProduct(currentProduct.id);
    phase.value = "rest";
    eventCount.value += 1;
    if (!(await waitFor(randomDuration("rest"), token))) return;

    phase.value = "stock_inbound";
    runInboundStep(currentProduct);
    eventCount.value += 1;
    if (!(await waitFor(randomDuration("stock_inbound"), token))) return;

    const inboundProduct = resolveProduct(currentProduct.id);
    if (!inboundProduct) return;

    phase.value = "variant_update";
    runVariantRebalance(inboundProduct);
    eventCount.value += 1;
    if (!(await waitFor(randomDuration("variant_update"), token))) return;

    const rebalancedProduct = resolveProduct(currentProduct.id);
    if (!rebalancedProduct) return;

    phase.value = "sale_outbound";
    runSaleStep(rebalancedProduct);
    eventCount.value += 1;
    if (!(await waitFor(randomDuration("sale_outbound"), token))) return;

    const soldProduct = resolveProduct(currentProduct.id);
    if (!soldProduct) return;

    phase.value = "low_stock_alert";
    runLowStockStep(soldProduct);
    eventCount.value += 1;
    if (!(await waitFor(randomDuration("low_stock_alert"), token))) return;

    phase.value = "settle";
    if (!(await waitFor(randomDuration("settle"), token))) return;
  }
}

function startCycle(options?: { reducedMotion?: boolean }) {
  if (isRunning || !hasInventory.value) return;
  isReducedMotion = Boolean(options?.reducedMotion);
  isRunning = true;
  cycleToken += 1;
  const token = cycleToken;
  void runCycle(token);
}

const { isInViewport, prefersReducedMotion } = useViewportAnimationGate({
  target: rootEl,
  active: isActive,
  threshold: 0.08,
  rootMargin: "0px 0px -8% 0px",
  onStart: () => {
    startCycle({ reducedMotion: false });
  },
  onStop: () => {
    stopCycle();
  },
  onReducedMotion: () => {
    setReducedMotionState();
  },
});

watch(
  [hasInventory, isActive, isInViewport, prefersReducedMotion],
  ([hasData, active, inViewport, reduced]) => {
    if (!hasData || !active || !inViewport) {
      stopCycle();
      return;
    }

    if (reduced) {
      setReducedMotionState();
      return;
    }

    startCycle({ reducedMotion: false });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopCycle();
});
</script>

<template>
  <article
    ref="rootEl"
    class="services-inventory-holder"
    :data-phase="phase"
    data-visual="inventory-holder"
  >
    <header class="services-inventory-holder__head">
      <div class="services-inventory-holder__mac-actions" aria-hidden="true">
        <span class="services-inventory-holder__mac-dot services-inventory-holder__mac-dot--red" />
        <span class="services-inventory-holder__mac-dot services-inventory-holder__mac-dot--yellow" />
        <span class="services-inventory-holder__mac-dot services-inventory-holder__mac-dot--green" />
      </div>
      <div class="services-inventory-holder__head-meta">
        <p class="services-inventory-holder__events">
          <span>{{ copy.feedLabel }}</span>
          <strong>#{{ eventCount }}</strong>
        </p>
        <span class="services-inventory-holder__phase-badge">{{ phaseBadgeLabel }}</span>
      </div>
    </header>

    <div class="services-inventory-holder__content-surface">
      <p class="services-inventory-holder__phase-line">{{ phaseLabel }}</p>

      <div class="services-inventory-holder__body">
        <section class="services-inventory-holder__panel" aria-label="Inventory table">
          <div class="services-inventory-holder__table-head">
            <span class="services-inventory-holder__head-product">{{ copy.tableProduct }}</span>
            <span class="services-inventory-holder__head-stock">{{ copy.tableStock }}</span>
            <span class="services-inventory-holder__head-state">{{ copy.tableState }}</span>
          </div>
          <ul class="services-inventory-holder__rows">
            <li
              v-for="row in productRows"
              :key="row.id"
              class="services-inventory-holder__row"
              :class="[
                `services-inventory-holder__row--${row.state}`,
                selectedProductId === row.id && 'services-inventory-holder__row--selected'
              ]"
            >
              <span class="services-inventory-holder__row-sku">
                <span class="services-inventory-holder__row-avatar" aria-hidden="true">{{ row.initials }}</span>
                <span class="services-inventory-holder__row-name">{{ row.name }}</span>
              </span>
              <strong class="services-inventory-holder__row-stock">{{ row.stock }}</strong>
              <span class="services-inventory-holder__row-state">
                <span class="services-inventory-holder__state-pill">
                  {{ copy.stateLabel[row.state] }}
                </span>
              </span>
            </li>
          </ul>
        </section>

        <aside class="services-inventory-holder__sidebar" aria-label="Product details">
          <template v-if="selectedProduct">
            <p class="services-inventory-holder__sidebar-name">{{ selectedProduct.name }}</p>
            <dl class="services-inventory-holder__meta-list">
              <div>
                <dt>{{ copy.sidebarCategory }}</dt>
                <dd>{{ selectedProduct.category }}</dd>
              </div>
              <div>
                <dt>{{ copy.sidebarSku }}</dt>
                <dd>{{ selectedProduct.baseSku }}</dd>
              </div>
              <div>
                <dt>{{ copy.sidebarWarehouse }}</dt>
                <dd>{{ selectedProduct.warehouse }}</dd>
              </div>
              <div>
                <dt>{{ copy.sidebarReorder }}</dt>
                <dd>{{ selectedProduct.reorderPoint }}</dd>
              </div>
            </dl>

            <div class="services-inventory-holder__variant-list">
              <p class="services-inventory-holder__variant-label">{{ copy.sidebarVariants }}</p>
              <div
                v-for="variant in selectedVariantRows"
                :key="`detail-${variant.sku}`"
                class="services-inventory-holder__variant-item"
                :class="selectedVariantId === variant.id && 'services-inventory-holder__variant-item--selected'"
              >
                <div>
                  <span>{{ variant.label }}</span>
                  <small>{{ variant.sku }}</small>
                </div>
                <span>${{ variant.price }}</span>
              </div>
            </div>

            <div class="services-inventory-holder__media">
              <span class="services-inventory-holder__media-kicker">{{ copy.sidebarMedia }}</span>
              <p class="services-inventory-holder__media-text">
                {{ selectedVariantRows.find((variant) => variant.id === selectedVariantId)?.imageLabel }}
              </p>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </article>
</template>
