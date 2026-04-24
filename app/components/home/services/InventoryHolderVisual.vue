<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useAnimatedNumber } from "~/composables/useAnimatedNumber";
import { usePressFeedback } from "~/composables/usePressFeedback";

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

const INVENTORY_TABLE_ROWS = 7;
const AUTO_DEMO_INITIAL_DELAY_MS = 1200;
const AUTO_DEMO_PRESS_MS = 300;
const AUTO_DEMO_MODAL_OPEN_MS = 3200;
const AUTO_DEMO_AFTER_CLOSE_PAUSE_MS = 2900;

const inventory = ref<MutableInventoryProduct[]>([]);
const selectedProductId = ref("");
const isModalOpen = ref(false);
const isModalMotionReady = ref(false);
const reportDateLabel = ref("");
const isAutoDemoRunning = ref(false);
const {
  isPressed: isRowPressed,
  startPress: startRowPress,
  endPress: endRowPress,
} = usePressFeedback<string>();
const {
  isPressed: isControlPressed,
  startPress: startControlPress,
  endPress: endControlPress,
} = usePressFeedback<string>();
const autoDemoTimeoutIds = ref<number[]>([]);
const lastAutoRowId = ref("");
let closeModalTimeoutId: number | undefined;

function cloneInventoryProducts(
  items: InventoryProduct[],
): MutableInventoryProduct[] {
  return items.map((item) => ({
    ...item,
    variants: item.variants.map((variant) => ({ ...variant })),
  }));
}

function randomInt(min: number, max: number): number {
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomProducts(
  items: InventoryProduct[],
  limit: number,
): InventoryProduct[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const current = copy[i];
    copy[i] = copy[j] as InventoryProduct;
    copy[j] = current as InventoryProduct;
  }
  return copy.slice(0, Math.max(0, limit));
}

function getTotalStock(product: MutableInventoryProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

function getProductState(product: MutableInventoryProduct): StockState {
  const totalStock = getTotalStock(product);
  if (product.variants.some((variant) => variant.stock <= product.reorderPoint))
    return "low";
  if (totalStock <= product.reorderPoint * product.variants.length + 8)
    return "watch";
  return "healthy";
}

function getProductInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

function resetModel() {
  const randomProducts = pickRandomProducts(props.products, INVENTORY_TABLE_ROWS);
  inventory.value = cloneInventoryProducts(randomProducts);
  selectedProductId.value = inventory.value[0]?.id ?? "";
  isModalOpen.value = false;
}

function getStateTagTone(state: StockState | string) {
  const normalized = String(state).trim().toLowerCase();
  if (normalized === "low") return "ui-app-tag--danger";
  if (normalized === "watch") return "ui-app-tag--warning";
  return "ui-app-tag--neutral";
}

const avatarToneClasses = [
  "ui-app-avatar--tone-1",
  "ui-app-avatar--tone-2",
  "ui-app-avatar--tone-3",
  "ui-app-avatar--tone-4",
  "ui-app-avatar--tone-5",
  "ui-app-avatar--tone-6",
  "ui-app-avatar--tone-7",
  "ui-app-avatar--tone-8",
] as const;

function getAvatarToneClass(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % avatarToneClasses.length;
  return avatarToneClasses[index] ?? "ui-app-avatar--tone-1";
}

function openProductModal(productId: string) {
  selectedProductId.value = productId;
  isModalOpen.value = true;
}

function onClosePressStart() {
  startControlPress("inventory-modal-close");
}

function onClosePressEnd() {
  endControlPress("inventory-modal-close");
}

function closeProductModalAnimated() {
  if (typeof window === "undefined") {
    closeProductModal();
    return;
  }

  if (closeModalTimeoutId !== undefined) {
    window.clearTimeout(closeModalTimeoutId);
  }

  closeModalTimeoutId = window.setTimeout(() => {
    closeProductModal();
    closeModalTimeoutId = undefined;
  }, 70);
}

function clearAutoDemoTimers() {
  if (typeof window === "undefined") return;
  autoDemoTimeoutIds.value.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });
  autoDemoTimeoutIds.value = [];
}

function scheduleAutoDemoStep(callback: () => void, delayMs: number) {
  if (typeof window === "undefined") return;
  const timeoutId = window.setTimeout(() => {
    autoDemoTimeoutIds.value = autoDemoTimeoutIds.value.filter((id) => id !== timeoutId);
    callback();
  }, delayMs);
  autoDemoTimeoutIds.value.push(timeoutId);
}

function runAutoDemoCycle() {
  if (!isAutoDemoRunning.value) return;

  const rows = productRows.value;
  if (!rows.length) {
    scheduleAutoDemoStep(runAutoDemoCycle, 1200);
    return;
  }

  const candidates = rows.filter((row) => row.id !== lastAutoRowId.value);
  const pool = candidates.length ? candidates : rows;
  const randomIndex = Math.floor(Math.random() * pool.length);
  const targetRow = pool[randomIndex];

  if (!targetRow) {
    scheduleAutoDemoStep(runAutoDemoCycle, 1200);
    return;
  }

  const targetId = targetRow.id;
  lastAutoRowId.value = targetId;

  startRowPress(targetId);

  scheduleAutoDemoStep(() => {
    endRowPress(targetId);
    openProductModal(targetId);

    scheduleAutoDemoStep(() => {
      closeProductModal();

      scheduleAutoDemoStep(() => {
        runAutoDemoCycle();
      }, AUTO_DEMO_AFTER_CLOSE_PAUSE_MS);
    }, AUTO_DEMO_MODAL_OPEN_MS);
  }, AUTO_DEMO_PRESS_MS);
}

function startAutoDemo() {
  if (isAutoDemoRunning.value) return;
  isAutoDemoRunning.value = true;
  clearAutoDemoTimers();
  scheduleAutoDemoStep(runAutoDemoCycle, AUTO_DEMO_INITIAL_DELAY_MS);
}

function stopAutoDemo() {
  isAutoDemoRunning.value = false;
  clearAutoDemoTimers();
  endRowPress();
}

function closeProductModal() {
  isModalOpen.value = false;
}

function onWindowKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isModalOpen.value) {
    closeProductModal();
  }
}

function formatReportDate() {
  if (typeof window === "undefined") return "";

  const formatter = new Intl.DateTimeFormat(props.locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return formatter.format(new Date());
}

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      tableProduct: "Producto",
      tableCategory: "Categoria",
      tableStock: "Stock",
      tableState: "Estado",
      inventoryModeLabel: "Inventory report",
      modalCategoryLabel: "Categoria",
      modalSkuLabel: "SKU base",
      modalWarehouseLabel: "Almacen",
      modalReorderLabel: "Punto de reposicion",
      modalVariantsLabel: "Variantes",
      modalTotalStockLabel: "Stock total",
      modalLowVariantsLabel: "Variantes criticas",
      modalPriceLabel: "Precio",
      modalCloseLabel: "Cerrar",
      stateLabel: {
        healthy: "Estable",
        watch: "Monitoreo",
        low: "Bajo",
      },
    };
  }

  return {
    tableProduct: "Product",
    tableCategory: "Category",
    tableStock: "Stock",
    tableState: "State",
    inventoryModeLabel: "Inventory report",
    modalCategoryLabel: "Category",
    modalSkuLabel: "Base SKU",
    modalWarehouseLabel: "Warehouse",
    modalReorderLabel: "Reorder point",
    modalVariantsLabel: "Variants",
    modalTotalStockLabel: "Total stock",
    modalLowVariantsLabel: "Critical variants",
    modalPriceLabel: "Price",
    modalCloseLabel: "Close",
    stateLabel: {
      healthy: "Stable",
      watch: "Watch",
      low: "Low",
    },
  };
});

const productRows = computed(() =>
  inventory.value.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    initials: getProductInitials(product.name),
    stock: getTotalStock(product),
    state: getProductState(product),
  })),
);

const selectedProduct = computed(
  () => inventory.value.find((product) => product.id === selectedProductId.value) ?? null,
);
const selectedProductState = computed<StockState>(() => {
  if (!selectedProduct.value) return "healthy";
  return getProductState(selectedProduct.value);
});
const selectedProductTotalStock = computed(() => {
  if (!selectedProduct.value) return 0;
  return getTotalStock(selectedProduct.value);
});
const selectedProductLowVariants = computed(() => {
  if (!selectedProduct.value) return 0;
  return selectedProduct.value.variants.filter(
    (variant) => variant.stock <= selectedProduct.value!.reorderPoint,
  ).length;
});
const selectedProductInitials = computed(() => {
  if (!selectedProduct.value) return "";
  return getProductInitials(selectedProduct.value.name);
});
const selectedProductPreviewLabel = computed(() => {
  if (!selectedProduct.value) return "";
  return selectedProduct.value.variants[0]?.imageLabel ?? "";
});
const {
  value: modalNumberProgressValue,
  set: setModalNumberProgress,
  animateTo: animateModalNumberProgressTo,
} = useAnimatedNumber(0);

function animateModalNumber(target: number) {
  return Math.round(target * modalNumberProgressValue.value);
}

function getVariantMeterClass(stock: number, reorderPoint: number) {
  if (stock <= reorderPoint) return "services-inventory-holder__variant-meter-fill--low";
  if (stock <= reorderPoint + 6) return "services-inventory-holder__variant-meter-fill--watch";
  return "services-inventory-holder__variant-meter-fill--healthy";
}

watch(
  () => props.products,
  () => {
    resetModel();
  },
  { deep: true, immediate: true },
);

watch(
  [isModalOpen, selectedProductId],
  ([open]) => {
    if (!open || typeof window === "undefined") {
      isModalMotionReady.value = false;
      setModalNumberProgress(0);
      return;
    }

    isModalMotionReady.value = false;
    setModalNumberProgress(0);

    window.requestAnimationFrame(() => {
      isModalMotionReady.value = true;
      animateModalNumberProgressTo(1, {
        duration: 520,
        easing: "easeOutQuint",
        precision: 3,
      });
    });
  },
  { immediate: true },
);

onMounted(() => {
  reportDateLabel.value = formatReportDate();
  window.addEventListener("keydown", onWindowKeydown);
  startAutoDemo();
});

onBeforeUnmount(() => {
  stopAutoDemo();
  if (typeof window !== "undefined" && closeModalTimeoutId !== undefined) {
    window.clearTimeout(closeModalTimeoutId);
    closeModalTimeoutId = undefined;
  }
  window.removeEventListener("keydown", onWindowKeydown);
});
</script>

<template>
  <article
    class="services-inventory-holder ui-glass-apple ui-app-view ui-app-table-scale-compact"
    data-visual="inventory-holder"
  >
    <header class="services-inventory-holder__head">
      <div class="services-inventory-holder__mac-actions" aria-hidden="true">
        <span
          class="services-inventory-holder__mac-dot services-inventory-holder__mac-dot--red"
        />
        <span
          class="services-inventory-holder__mac-dot services-inventory-holder__mac-dot--yellow"
        />
        <span
          class="services-inventory-holder__mac-dot services-inventory-holder__mac-dot--green"
        />
      </div>
      <div class="services-inventory-holder__head-meta">
        <p class="services-inventory-holder__mode-title ui-app-heading">
          {{ copy.inventoryModeLabel }}
        </p>
        <span
          v-if="reportDateLabel"
          class="ui-app-tag ui-app-tag--slate ui-app-table-badge"
        >
          {{ reportDateLabel }}
        </span>
      </div>
    </header>

    <div class="services-inventory-holder__content-surface ui-app-border-soft">
      <div class="services-inventory-holder__body ui-radius-panel">
        <section
          class="services-inventory-holder__panel"
          aria-label="Inventory table"
        >
          <div class="services-inventory-holder__table-head">
            <span class="ui-app-table-head-text">{{ copy.tableProduct }}</span>
            <span
              class="services-inventory-holder__head-category ui-app-table-head-text"
              >{{ copy.tableCategory }}</span
            >
            <span
              class="services-inventory-holder__head-stock ui-app-table-head-text"
              >{{ copy.tableStock }}</span
            >
            <span
              class="services-inventory-holder__head-state ui-app-table-head-text"
              >{{ copy.tableState }}</span
            >
          </div>
          <ul class="services-inventory-holder__rows ui-list-reset">
            <li
              v-for="row in productRows"
              :key="row.id"
              class="services-inventory-holder__row ui-app-pressable-row"
              :class="{ 'ui-app-pressable-row--pressed': isRowPressed(row.id) }"
            >
              <span class="services-inventory-holder__row-sku">
                <span
                  :class="[
                    'services-inventory-holder__row-avatar',
                    'ui-app-avatar',
                    'ui-app-avatar--lg',
                    'ui-app-border-soft',
                    getAvatarToneClass(row.id),
                  ]"
                  aria-hidden="true"
                  >{{ row.initials }}</span
                >
                <span
                  class="services-inventory-holder__row-name ui-app-table-row-text"
                  >{{ row.name }}</span
                >
              </span>
              <span
                class="services-inventory-holder__row-category ui-app-table-row-text"
                >{{ row.category }}</span
              >
              <span
                class="services-inventory-holder__row-stock ui-app-table-row-value"
                >{{ row.stock }}</span
              >
              <span class="services-inventory-holder__row-state">
                <span
                  class="services-inventory-holder__state-pill ui-app-table-badge ui-app-tag"
                  :class="getStateTagTone(row.state)"
                  :data-state="row.state"
                >
                  {{ copy.stateLabel[row.state] }}
                </span>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <Transition name="services-inventory-modal">
      <div
        v-if="isModalOpen && selectedProduct"
        class="services-inventory-holder__modal-backdrop"
        @click="closeProductModalAnimated"
      >
        <aside
          class="services-inventory-holder__modal ui-app-border-soft ui-app-shadow-modal"
          aria-label="Product details"
          @click.stop
        >
          <div class="services-inventory-holder__modal-head">
            <div class="services-inventory-holder__modal-head-main">
              <span
                class="services-inventory-holder__modal-photo ui-app-avatar ui-app-avatar--lg ui-app-border-soft"
                :class="getAvatarToneClass(selectedProduct.id)"
                aria-hidden="true"
                >{{ selectedProductInitials }}</span
              >
              <div class="services-inventory-holder__modal-head-copy">
                <p class="services-inventory-holder__modal-title ui-app-heading">
                  {{ selectedProduct.name }}
                </p>
                <p class="services-inventory-holder__modal-preview ui-app-micro-text">
                  {{ selectedProductPreviewLabel }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="services-inventory-holder__modal-close ui-app-exit-button ui-app-pressable-control"
              :class="{ 'ui-app-pressable-control--pressed': isControlPressed('inventory-modal-close') }"
              :aria-label="copy.modalCloseLabel"
              @click="closeProductModalAnimated"
              @pointerdown="onClosePressStart"
              @pointerup="onClosePressEnd"
              @pointercancel="onClosePressEnd"
              @pointerleave="onClosePressEnd"
            >
              <XMarkIcon class="ui-app-icon ui-app-icon--md ui-app-icon--muted" />
            </button>
          </div>

          <div class="services-inventory-holder__modal-tags">
            <span class="ui-app-tag ui-app-tag--info ui-app-table-badge">
              {{ selectedProduct.warehouse }}
            </span>
            <span
              class="ui-app-tag ui-app-table-badge"
              :class="getStateTagTone(selectedProductState)"
              :data-state="selectedProductState"
            >
              {{ copy.stateLabel[selectedProductState] }}
            </span>
          </div>

          <div class="services-inventory-holder__modal-layout">
            <div class="services-inventory-holder__modal-info">
              <dl class="services-inventory-holder__modal-kpis ui-list-reset">
                <div>
                  <dt class="ui-app-micro-text">{{ copy.modalTotalStockLabel }}</dt>
                  <dd class="ui-app-table-row-value">
                    {{ animateModalNumber(selectedProductTotalStock) }}
                  </dd>
                </div>
                <div>
                  <dt class="ui-app-micro-text">{{ copy.modalReorderLabel }}</dt>
                  <dd class="ui-app-table-row-value">
                    {{ animateModalNumber(selectedProduct.reorderPoint) }}
                  </dd>
                </div>
                <div>
                  <dt class="ui-app-micro-text">{{ copy.modalLowVariantsLabel }}</dt>
                  <dd class="ui-app-table-row-value">
                    {{ animateModalNumber(selectedProductLowVariants) }}
                  </dd>
                </div>
              </dl>

              <dl class="services-inventory-holder__modal-meta ui-list-reset">
                <div>
                  <dt class="ui-app-micro-text">{{ copy.modalCategoryLabel }}</dt>
                  <dd class="ui-app-table-row-text">{{ selectedProduct.category }}</dd>
                </div>
                <div>
                  <dt class="ui-app-micro-text">{{ copy.modalSkuLabel }}</dt>
                  <dd class="ui-app-table-row-text">{{ selectedProduct.baseSku }}</dd>
                </div>
              </dl>
            </div>

            <div class="services-inventory-holder__variants">
              <ul
                class="services-inventory-holder__variants-list ui-list-reset"
                :class="{ 'services-inventory-holder__variants-list--animated': isModalMotionReady }"
              >
                <li
                  v-for="variant in selectedProduct.variants"
                  :key="`${selectedProduct.id}-${variant.id}`"
                  class="services-inventory-holder__variant-row"
                >
                  <div class="services-inventory-holder__variant-main">
                    <p class="ui-app-table-row-text">{{ variant.label }}</p>
                    <p class="ui-app-micro-text">{{ variant.sku }}</p>
                  </div>
                  <div class="services-inventory-holder__variant-stats">
                    <span class="ui-app-table-row-value">
                      {{ animateModalNumber(variant.stock) }}
                    </span>
                    <span class="ui-app-micro-text">
                      ${{ animateModalNumber(variant.price) }}
                    </span>
                  </div>
                  <div class="services-inventory-holder__variant-meter">
                    <span
                      class="services-inventory-holder__variant-meter-fill"
                      :class="getVariantMeterClass(variant.stock, selectedProduct.reorderPoint)"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </article>
</template>
