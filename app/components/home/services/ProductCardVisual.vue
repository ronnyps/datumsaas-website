<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { ProductCardItem, ProductVariant } from "~/types/product-variants";

const props = defineProps<{
  active?: boolean;
  locale?: "en" | "es";
  products: ProductCardItem[];
}>();
const rootElementRef = ref<HTMLElement | null>(null);
const isInViewport = ref(false);
const isMobileViewport = ref(false);
let viewportObserver: IntersectionObserver | null = null;

const isActive = computed(() => {
  const activeByProp = Boolean(props.active ?? true);
  if (!activeByProp) return false;
  if (!isMobileViewport.value) return true;
  return isInViewport.value;
});

// ── State ─────────────────────────────────────────────────────────────────

const productIndex = ref(0);
const variantIndex = ref(0);
const showCard = ref(true);

const currentProduct = computed<ProductCardItem | null>(
  () => props.products[productIndex.value] ?? null,
);

const currentVariant = computed<ProductVariant | null>(
  () => currentProduct.value?.variants[variantIndex.value] ?? null,
);

const previewImageByProductId: Record<string, Record<string, string>> = {
  "wireless-speaker": {
    slate: "/products/speakers/Studio-sound-speaker-silver.webp",
    ocean: "/products/speakers/Studio-sound-speaker-blue.webp",
    cream: "/products/speakers/Studio-sound-speaker-yellow.webp",
  },
  "artisan-blend": {
    "whole-bean": "/products/cofee/artisan-cofee-blend-gold.webp",
    ground: "/products/cofee/artisan-cofee-blend-brown.webp",
    capsules: "/products/cofee/artisan-cofee-blend-gray.webp",
  },
  "running-shoe": {
    "black-white": "/products/urban-runner/urban-runner-black.webp",
    "navy-white": "/products/urban-runner/urban-runner-blue.webp",
    coral: "/products/urban-runner/urban-runner-red.webp",
  },
  "ergo-chair": {
    "mesh-black": "/products/chair/ergo-chair-brawn.webp",
    "mesh-gray": "/products/chair/ergo-chair-silver.webp",
    leather: "/products/chair/ergo-chair-brawn.webp",
  },
  "chef-knife-set": {
    "3-piece": "/products/knife/knife-silver.webp",
    "5-piece": "/products/knife/knife-gray.webp",
    "7-piece": "/products/knife/knife-black.webp",
  },
};

const currentPreviewImage = computed<string | null>(() => {
  if (!currentProduct.value) return null;
  if (!currentVariant.value) return null;
  const productImages = previewImageByProductId[currentProduct.value.id];
  if (!productImages) return null;
  return productImages[currentVariant.value.id] ?? null;
});

function getBackdropRowImage(product: ProductCardItem): string | null {
  const productImages = previewImageByProductId[product.id];
  if (!productImages) return null;
  const firstVariantId = product.variants[0]?.id;
  if (!firstVariantId) return null;
  return productImages[firstVariantId] ?? null;
}

// ── Animated price ─────────────────────────────────────────────────────────

const displayedPrice = ref(0);
let priceRaf: number | null = null;
let priceFlashTimer: number | null = null;

function animatePriceTo(target: number, durationMs = 480) {
  if (priceRaf !== null) cancelAnimationFrame(priceRaf);
  const start = displayedPrice.value;
  const startTime = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - startTime) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    displayedPrice.value = start + (target - start) * eased;
    if (t < 1) {
      priceRaf = requestAnimationFrame(tick);
    } else {
      displayedPrice.value = target;
      priceRaf = null;
    }
  };

  priceRaf = requestAnimationFrame(tick);
}

const formattedPrice = computed(() => {
  return displayedPrice.value.toFixed(2);
});

const discountPercent = computed<number | null>(() => {
  const v = currentVariant.value;
  if (!v?.originalPrice) return null;
  return Math.round((1 - v.price / v.originalPrice) * 100);
});

// ── Cycling logic ──────────────────────────────────────────────────────────

const VARIANT_INTERVAL_MS = 2600;
const PRODUCT_SWITCH_MS = 260;

let variantTimer: number | null = null;
let productSwitchTimer: number | null = null;
let productPriceKickTimer: number | null = null;

function clearAllTimers() {
  if (variantTimer !== null) { clearTimeout(variantTimer); variantTimer = null; }
  if (productSwitchTimer !== null) { clearTimeout(productSwitchTimer); productSwitchTimer = null; }
  if (productPriceKickTimer !== null) { clearTimeout(productPriceKickTimer); productPriceKickTimer = null; }
  if (priceRaf !== null) { cancelAnimationFrame(priceRaf); priceRaf = null; }
}

function switchToNextProduct() {
  if (!isActive.value) return;
  if (!props.products.length) return;

  showCard.value = false;

  productSwitchTimer = window.setTimeout(() => {
    productIndex.value = (productIndex.value + 1) % props.products.length;
    variantIndex.value = 0;
    displayedPrice.value = 0;
    showCard.value = true;

    productPriceKickTimer = window.setTimeout(() => {
      animatePriceTo(currentVariant.value?.price ?? 0, 600);
      scheduleVariantsForCurrentProduct();
    }, 80);

    productSwitchTimer = null;
  }, PRODUCT_SWITCH_MS);
}

function scheduleVariantsForCurrentProduct() {
  if (!isActive.value) return;
  const product = currentProduct.value;
  if (!product) return;
  if (!product.variants.length) return;

  if (variantTimer !== null) {
    clearTimeout(variantTimer);
    variantTimer = null;
  }

  let step = 0;

  const tick = () => {
    if (!isActive.value) return;
    const activeProduct = currentProduct.value;
    if (!activeProduct) return;
    const count = activeProduct.variants.length;
    if (!count) return;

    const nextIndex = Math.min(step, count - 1);
    variantIndex.value = nextIndex;
    animatePriceTo(activeProduct.variants[nextIndex]?.price ?? 0);
    step += 1;

    if (step < count) {
      variantTimer = window.setTimeout(tick, VARIANT_INTERVAL_MS);
      return;
    }

    // Hold briefly on the last variant, then switch product.
    variantTimer = window.setTimeout(() => {
      variantTimer = null;
      switchToNextProduct();
    }, VARIANT_INTERVAL_MS);
  };

  tick();
}

function startCycle() {
  clearAllTimers();
  variantIndex.value = 0;
  animatePriceTo(currentVariant.value?.price ?? 0, 600);
  scheduleVariantsForCurrentProduct();
}

function stopCycle() {
  clearAllTimers();
}

watch(
  () => isActive.value,
  (active) => {
    if (active) {
      startCycle();
      return;
    }
    stopCycle();
  },
  { immediate: true },
);

function updateMobileViewportState() {
  if (typeof window === "undefined") return;
  isMobileViewport.value = window.matchMedia("(max-width: 760px)").matches;
}

onMounted(() => {
  updateMobileViewportState();
  if (typeof window !== "undefined" && rootElementRef.value) {
    viewportObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isInViewport.value = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.35 }
    );
    viewportObserver.observe(rootElementRef.value);
  }
  window.addEventListener("resize", updateMobileViewportState, { passive: true });
});

onBeforeUnmount(clearAllTimers);
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateMobileViewportState);
  if (viewportObserver) {
    viewportObserver.disconnect();
    viewportObserver = null;
  }
});

// ── Copy helpers ───────────────────────────────────────────────────────────

const discountLabel = computed(() => {
  const pct = discountPercent.value;
  if (!pct) return null;
  return props.locale === "es" ? `${pct}% desc.` : `${pct}% off`;
});

const backdropCopy = computed(() => {
  if (props.locale === "es") {
    return {
      title: "Catalogo de productos",
      product: "Producto",
      sku: "SKU",
      price: "Precio",
    };
  }

  return {
    title: "Product catalog",
    product: "Product",
    sku: "SKU",
    price: "Price",
  };
});

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
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

const backdropRows = computed(() =>
  props.products.map((product) => ({
    id: product.id,
    name: product.name,
    initials: getInitials(product.name),
    emoji: product.emoji,
    toneClass: getAvatarToneClass(product.id),
    imageSrc: getBackdropRowImage(product),
    sku: product.variants[0]?.sku ?? "—",
    price: product.variants[0]?.price ?? 0,
    active: product.id === currentProduct.value?.id,
  })),
);
</script>

<template>
  <div ref="rootElementRef" class="services__product-visual-mount" aria-hidden="true">
    <div class="pcard-scene ui-app-view">
      <section class="pcard-backdrop ui-app-view ui-app-table-scale-compact">
        <div class="pcard-backdrop__glass">
          <header class="pcard-backdrop__head">
            <div class="pcard-backdrop__mac-actions" aria-hidden="true">
              <span class="pcard-backdrop__mac-dot pcard-backdrop__mac-dot--red" />
              <span class="pcard-backdrop__mac-dot pcard-backdrop__mac-dot--yellow" />
              <span class="pcard-backdrop__mac-dot pcard-backdrop__mac-dot--green" />
            </div>
            <p class="pcard-backdrop__title ui-app-mode-title">{{ backdropCopy.title }}</p>
          </header>

          <div class="pcard-backdrop__surface">
            <div class="pcard-backdrop__table-head">
              <span class="ui-app-table-head-text">{{ backdropCopy.product }}</span>
              <span class="ui-app-table-head-text">{{ backdropCopy.sku }}</span>
              <span class="ui-app-table-head-text">{{ backdropCopy.price }}</span>
            </div>
            <ul class="pcard-backdrop__rows">
              <li
                v-for="row in backdropRows"
                :key="`backdrop-${row.id}`"
                class="pcard-backdrop__row"
                :class="{ 'is-active': row.active }"
              >
                <span class="pcard-backdrop__row-main">
                  <span
                    class="pcard-backdrop__avatar ui-app-avatar ui-app-avatar--sm"
                    :class="row.imageSrc ? ['ui-app-avatar--media', 'ui-app-border-soft'] : row.toneClass"
                    aria-hidden="true"
                  >
                    <img
                      v-if="row.imageSrc"
                      :src="row.imageSrc"
                      alt=""
                      class="ui-app-avatar-image"
                      decoding="async"
                      loading="eager"
                    >
                    <span v-else-if="row.emoji" class="pcard-backdrop__avatar-media">{{ row.emoji }}</span>
                    <span v-else>{{ row.initials }}</span>
                  </span>
                  <span class="ui-app-table-row-text pcard-backdrop__row-name">{{ row.name }}</span>
                </span>
                <span class="ui-app-micro-text pcard-backdrop__row-sku">{{ row.sku }}</span>
                <span class="ui-app-table-row-value pcard-backdrop__row-price">${{ row.price.toFixed(0) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Transition name="pcard-switch" mode="out-in">
        <div
          v-if="showCard && currentProduct"
          :key="currentProduct.id"
          class="pcard ui-app-view"
        >

          <!-- Preview image area -->
          <div
            class="pcard__preview ui-app-media-frame"
            :class="[
              `pcard__preview--${currentProduct.previewTheme}`,
              currentPreviewImage && 'pcard__preview--has-image',
            ]"
          >
            <span
              v-if="currentProduct.badge"
              class="pcard__preview-badge ui-app-tag ui-app-tag--slate ui-app-table-badge"
            >
              {{ currentProduct.badge }}
            </span>
            <Transition name="pcard-media" mode="out-in">
              <img
                v-if="currentPreviewImage"
                :key="currentPreviewImage"
                :src="currentPreviewImage"
                :alt="`${currentProduct.name} ${currentVariant?.label ?? ''}`"
                class="pcard__preview-image ui-app-media-image"
                loading="eager"
                decoding="async"
              >
              <span
                v-else
                :key="`emoji-${currentProduct.id}`"
                class="pcard__preview-emoji ui-app-media-fallback"
                role="img"
              >
                {{ currentProduct.emoji }}
              </span>
            </Transition>
          </div>

          <!-- Body -->
          <div class="pcard__body">

            <div class="pcard__headline-row">
              <p class="pcard__name ui-app-table-row-text">{{ currentProduct.name }}</p>
              <div class="pcard__swatches" role="list">
                <span
                  v-for="(variant, idx) in currentProduct.variants"
                  :key="variant.id"
                  role="listitem"
                  class="pcard__swatch"
                  :class="[
                    `pcard__swatch--${variant.swatchClass}`,
                    { 'is-selected': idx === variantIndex },
                  ]"
                />
              </div>
            </div>

            <!-- Meta -->
            <div class="pcard__meta">
              <span class="ui-app-micro-text">{{ currentProduct.category }}</span>
              <span class="pcard__meta-dot" aria-hidden="true" />
              <span class="pcard__sku ui-app-micro-text">{{ currentVariant?.sku }}</span>
            </div>

            <!-- Price row -->
            <div class="pcard__price-row">
              <span
                class="pcard__price"
              >
                ${{ formattedPrice }}
              </span>
              <span
                v-if="currentVariant?.originalPrice"
                class="pcard__original-price"
              >
                ${{ currentVariant.originalPrice.toFixed(2) }}
              </span>
              <span
                v-if="discountLabel"
                class="ui-app-tag ui-app-tag--success ui-app-table-badge"
              >
                {{ discountLabel }}
              </span>
            </div>

          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
