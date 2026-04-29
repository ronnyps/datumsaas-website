import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

/**
 * Activates when the target element is hovered.
 * On touch/non-hover devices, isActive is always true so animations
 * still play without requiring a hover interaction.
 */
export function useHoverActivation(target: Ref<HTMLElement | null>) {
  const isActive = ref(false);
  let usesHover = false;

  function onEnter() {
    isActive.value = true;
  }

  function onLeave() {
    isActive.value = false;
  }

  onMounted(() => {
    if (typeof window === "undefined") {
      isActive.value = true;
      return;
    }

    usesHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!usesHover) {
      isActive.value = true;
      return;
    }

    const el = target.value;
    if (!el) return;

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
  });

  onBeforeUnmount(() => {
    if (!usesHover) return;
    const el = target.value;
    if (!el) return;
    el.removeEventListener("mouseenter", onEnter);
    el.removeEventListener("mouseleave", onLeave);
  });

  return { isActive };
}
