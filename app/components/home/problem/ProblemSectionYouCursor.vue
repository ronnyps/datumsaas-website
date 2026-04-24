<script setup lang="ts">
import { gsap } from "gsap";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import RolePointerTag from "~/components/shared/RolePointerTag.vue";

const props = defineProps<{
  locale: "en" | "es";
  targetEl: HTMLElement | null;
}>();

const emit = defineEmits<{
  activeChange: [value: boolean];
  enabledChange: [value: boolean];
}>();

const cursorEl = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const isEnabled = ref(false);

let attachedTarget: HTMLElement | null = null;
let mediaQuery: MediaQueryList | null = null;
let xTo: ((value: number) => void) | null = null;
let yTo: ((value: number) => void) | null = null;

function hasFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function hideCursor() {
  isVisible.value = false;
  emit("activeChange", false);
}

function handlePointerMove(event: PointerEvent) {
  if (!isEnabled.value || !attachedTarget || !xTo || !yTo) return;
  const targetRect = attachedTarget.getBoundingClientRect();
  const x = event.clientX - targetRect.left;
  const y = event.clientY - targetRect.top;
  xTo(x);
  yTo(y);
}

function handlePointerEnter(event: PointerEvent) {
  if (!isEnabled.value) return;
  isVisible.value = true;
  emit("activeChange", true);
  handlePointerMove(event);
}

function handlePointerLeave() {
  if (!isEnabled.value) return;
  hideCursor();
}

function unbindTarget() {
  if (!attachedTarget) return;
  attachedTarget.removeEventListener("pointerenter", handlePointerEnter);
  attachedTarget.removeEventListener("pointermove", handlePointerMove);
  attachedTarget.removeEventListener("pointerleave", handlePointerLeave);
  attachedTarget = null;
}

function bindTarget(element: HTMLElement | null) {
  unbindTarget();
  if (!element || !isEnabled.value) return;
  attachedTarget = element;
  attachedTarget.addEventListener("pointerenter", handlePointerEnter);
  attachedTarget.addEventListener("pointermove", handlePointerMove);
  attachedTarget.addEventListener("pointerleave", handlePointerLeave);
}

function updateEnabledState() {
  const nextEnabled = hasFinePointer();
  if (isEnabled.value === nextEnabled) return;
  isEnabled.value = nextEnabled;
  emit("enabledChange", nextEnabled);

  if (!nextEnabled) {
    hideCursor();
    unbindTarget();
    return;
  }

  bindTarget(props.targetEl);
}

function onMediaChange() {
  updateEnabledState();
}

watch(
  () => props.targetEl,
  (nextTarget) => {
    bindTarget(nextTarget);
  }
);

onMounted(() => {
  const cursorNode = cursorEl.value;
  if (cursorNode) {
    xTo = gsap.quickTo(cursorNode, "x", { duration: 0.18, ease: "power3.out" });
    yTo = gsap.quickTo(cursorNode, "y", { duration: 0.18, ease: "power3.out" });
  }

  if (typeof window !== "undefined") {
    mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    mediaQuery.addEventListener("change", onMediaChange);
  }

  updateEnabledState();
  bindTarget(props.targetEl);
});

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", onMediaChange);
    mediaQuery = null;
  }
  unbindTarget();
});
</script>

<template>
  <div class="problem-you-cursor" :class="{ 'problem-you-cursor--visible': isVisible }" aria-hidden="true">
    <div ref="cursorEl" class="problem-you-cursor__node">
      <RolePointerTag role-key="you" :lang="locale" variant="soft" size="sm" :pointer-rotation="0" />
    </div>
  </div>
</template>
