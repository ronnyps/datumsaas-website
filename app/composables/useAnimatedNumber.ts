import { onBeforeUnmount, ref } from "vue";

type AnimatedNumberEasing = "easeOutCubic" | "easeOutQuint" | "linear";

type AnimatedNumberOptions = {
  duration?: number;
  delay?: number;
  precision?: number;
  easing?: AnimatedNumberEasing;
};

const easingMap: Record<AnimatedNumberEasing, (t: number) => number> = {
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeOutQuint: (t) => 1 - (1 - t) ** 5,
  linear: (t) => t,
};

export function useAnimatedNumber(initialValue = 0) {
  const value = ref(initialValue);
  let rafId = 0;

  function cancel() {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function set(nextValue: number) {
    cancel();
    value.value = nextValue;
  }

  function animateTo(targetValue: number, options: AnimatedNumberOptions = {}) {
    if (typeof window === "undefined") {
      value.value = targetValue;
      return;
    }

    cancel();

    const fromValue = value.value;
    const duration = Math.max(1, options.duration ?? 360);
    const delay = Math.max(0, options.delay ?? 0);
    const precision = Math.max(0, options.precision ?? 0);
    const easing = easingMap[options.easing ?? "easeOutCubic"];
    const roundBase = 10 ** precision;

    const startAt = performance.now() + delay;

    const step = (now: number) => {
      if (now < startAt) {
        rafId = window.requestAnimationFrame(step);
        return;
      }

      const progress = Math.min(1, (now - startAt) / duration);
      const eased = easing(progress);
      const nextValue = fromValue + (targetValue - fromValue) * eased;
      value.value = Math.round(nextValue * roundBase) / roundBase;

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
        return;
      }

      value.value = Math.round(targetValue * roundBase) / roundBase;
      rafId = 0;
    };

    rafId = window.requestAnimationFrame(step);
  }

  onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
      cancel();
    }
  });

  return {
    value,
    set,
    animateTo,
  };
}

