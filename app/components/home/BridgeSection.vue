<script setup lang="ts">
import { computed } from "vue";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useHeroExperience } from "~/composables/useHeroExperience";

const props = defineProps<{
  introTitle: string;
  introDescription: string;
  items: Array<{
    title: string;
    description: string;
  }>;
}>();

const { activeIndex, progress, setActiveIndex } = useHeroExperience();
const bridgeContainerRef = ref<HTMLElement | null>(null);

const sliderItems = computed(() => props.items.slice(0, 3));
const visibleItems = computed(() => {
  if (!isMobile.value) {
    return sliderItems.value.map((item, index) => ({ item, index }));
  }

  const safeIndex = Math.min(
    Math.max(activeIndex.value, 0),
    Math.max(sliderItems.value.length - 1, 0)
  );
  const currentItem = sliderItems.value[safeIndex];

  return currentItem ? [{ item: currentItem, index: safeIndex }] : [];
});
const isMobile = ref(false);

let mediaQuery: MediaQueryList | null = null;
let mediaQueryHandler: ((event: MediaQueryListEvent) => void) | null = null;
const touchStartX = ref<number | null>(null);
const touchStartY = ref<number | null>(null);

const isActive = (index: number) => activeIndex.value === index;

const getItemProgress = (index: number) =>
  isActive(index) ? progress.value : 0;

const onSelectStep = (index: number) => {
  setActiveIndex(index, { pauseAutoplay: false, resetProgress: true });
};

const onTouchStart = (event: TouchEvent) => {
  if (!isMobile.value || event.touches.length === 0) return;
  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const onTouchEnd = (event: TouchEvent) => {
  if (!isMobile.value || event.changedTouches.length === 0) return;
  if (touchStartX.value === null || touchStartY.value === null) return;

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;
  const swipeThreshold = 36;

  touchStartX.value = null;
  touchStartY.value = null;

  if (Math.abs(deltaX) < swipeThreshold) return;
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

  const direction = deltaX < 0 ? 1 : -1;
  onSelectStep(activeIndex.value + direction);
};

const onTouchCancel = () => {
  touchStartX.value = null;
  touchStartY.value = null;
};

const measureMobileCardHeight = async () => {
  if (!isMobile.value || !bridgeContainerRef.value) return;
  if (sliderItems.value.length === 0) return;

  await nextTick();

  const container = bridgeContainerRef.value;
  const width = container.clientWidth;
  if (width <= 0) return;

  const tempHost = document.createElement("div");
  tempHost.className = "bridge__mobile-measure";
  tempHost.setAttribute("aria-hidden", "true");
  container.appendChild(tempHost);

  let maxHeight = 0;

  for (const item of sliderItems.value) {
    const probe = document.createElement("button");
    probe.type = "button";
    probe.className = "bridge__item bridge__item--button bridge__mobile-probe";
    probe.innerHTML = `
      <span class="bridge__item-progress-wrap" aria-hidden="true">
        <progress class="bridge__item-progress" max="1" value="1"></progress>
      </span>
      <h3 class="bridge__item-title typo-h3-md">${item.title}</h3>
      <p class="bridge__item-description typo-p-lead-muted">${item.description}</p>
    `;

    probe.style.width = `${width}px`;
    tempHost.appendChild(probe);
    maxHeight = Math.max(maxHeight, Math.ceil(probe.getBoundingClientRect().height));
    probe.remove();
  }

  tempHost.remove();

  if (maxHeight > 0) {
    container.style.setProperty("--bridge-mobile-card-height", `${maxHeight}px`);
  }
};

onMounted(() => {
  mediaQuery = window.matchMedia("(max-width: 60em)");
  isMobile.value = mediaQuery.matches;

  mediaQueryHandler = (event: MediaQueryListEvent) => {
    isMobile.value = event.matches;
  };

  mediaQuery.addEventListener("change", mediaQueryHandler);
  void measureMobileCardHeight();
});

watch(isMobile, () => {
  void measureMobileCardHeight();
});

watch(
  () => sliderItems.value.map((item) => `${item.title}|${item.description}`).join("||"),
  () => {
    void measureMobileCardHeight();
  }
);

onBeforeUnmount(() => {
  if (mediaQuery && mediaQueryHandler) {
    mediaQuery.removeEventListener("change", mediaQueryHandler);
  }
});
</script>

<template>
  <section class="section bridge" data-aida="interest">
    <div ref="bridgeContainerRef" class="container bridge__container">
      <span class="bridge__accent" aria-hidden="true" />

      <article v-if="!isMobile" class="bridge__intro content-stack content-stack--3">
        <h2 class="section__title bridge__intro-title typo-h2-bridge">
          {{ props.introTitle }}
        </h2>
        <p class="bridge__intro-description typo-p-lead-muted">
          {{ props.introDescription }}
        </p>
      </article>

      <template v-if="isMobile">
        <Transition name="bridge-swap" mode="out-in">
          <button
            v-if="visibleItems[0]"
            :key="`${visibleItems[0].item.title}-${visibleItems[0].index}`"
            type="button"
            class="bridge__item bridge__item--button"
            :class="{ 'bridge__item--active': isActive(visibleItems[0].index) }"
            :aria-pressed="isActive(visibleItems[0].index)"
            @click="onSelectStep(visibleItems[0].index)"
            @touchstart.passive="onTouchStart"
            @touchend="onTouchEnd"
            @touchcancel="onTouchCancel"
          >
            <span class="bridge__item-progress-wrap" aria-hidden="true">
              <progress
                class="bridge__item-progress"
                max="1"
                :value="getItemProgress(visibleItems[0].index)"
              ></progress>
            </span>
            <h3 class="bridge__item-title typo-h3-md">{{ visibleItems[0].item.title }}</h3>
            <p class="bridge__item-description typo-p-lead-muted">
              {{ visibleItems[0].item.description }}
            </p>
          </button>
        </Transition>
      </template>

      <button
        v-else
        v-for="entry in visibleItems"
        :key="`${entry.item.title}-${entry.index}`"
        type="button"
        class="bridge__item bridge__item--button"
        :class="{ 'bridge__item--active': isActive(entry.index) }"
        :aria-pressed="isActive(entry.index)"
        @click="onSelectStep(entry.index)"
      >
        <span class="bridge__item-progress-wrap" aria-hidden="true">
          <progress
            class="bridge__item-progress"
            max="1"
            :value="getItemProgress(entry.index)"
          ></progress>
        </span>
        <h3 class="bridge__item-title typo-h3-md">{{ entry.item.title }}</h3>
        <p class="bridge__item-description typo-p-lead-muted">
          {{ entry.item.description }}
        </p>
      </button>
    </div>
  </section>
</template>
