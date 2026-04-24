import { onBeforeUnmount, ref } from "vue";

type PressKey = string | number;

type UsePressFeedbackOptions = {
  duration?: number;
};

export function usePressFeedback<T extends PressKey = string>(
  options: UsePressFeedbackOptions = {},
) {
  const pressedId = ref<T | null>(null);
  let timeoutId: number | undefined;

  const baseDuration = Math.max(0, options.duration ?? 120);

  function clearTimer() {
    if (typeof window === "undefined") return;
    if (timeoutId === undefined) return;
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  function clearPressed() {
    pressedId.value = null;
  }

  function isPressed(id: T) {
    return pressedId.value === id;
  }

  function startPress(id: T) {
    clearTimer();
    pressedId.value = id;
  }

  function endPress(id?: T) {
    if (id === undefined || pressedId.value === id) {
      pressedId.value = null;
    }
  }

  function triggerPress(id: T, onAfterPress?: () => void, duration = baseDuration) {
    if (typeof window === "undefined") {
      onAfterPress?.();
      return;
    }

    clearTimer();
    pressedId.value = id;

    timeoutId = window.setTimeout(() => {
      pressedId.value = null;
      onAfterPress?.();
      timeoutId = undefined;
    }, Math.max(0, duration));
  }

  onBeforeUnmount(() => {
    clearTimer();
  });

  return {
    pressedId,
    startPress,
    endPress,
    triggerPress,
    isPressed,
    clearPressed,
  };
}
