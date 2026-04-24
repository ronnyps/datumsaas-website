import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

type ViewportAnimationGateOptions = {
  target: Ref<HTMLElement | null>;
  active?: Ref<boolean>;
  threshold?: number;
  rootMargin?: string;
  onStart: () => void;
  onStop: () => void;
  onReducedMotion?: () => void;
};

export function useViewportAnimationGate(options: ViewportAnimationGateOptions) {
  const isInViewport = ref(false);
  const prefersReducedMotion = ref(false);
  let gateState: "run" | "stop" | "reduce" | null = null;

  let observer: IntersectionObserver | null = null;
  let reduceMotionMedia: MediaQueryList | null = null;
  let detachReduceMotionListener: (() => void) | null = null;

  function evaluate(force = false) {
    const isActive = options.active?.value ?? true;
    const shouldRun = isActive && isInViewport.value && !prefersReducedMotion.value;
    const shouldReduce = isActive && isInViewport.value && prefersReducedMotion.value;

    const nextState: "run" | "stop" | "reduce" = shouldRun
      ? "run"
      : shouldReduce
        ? "reduce"
        : "stop";

    if (!force && gateState === nextState) {
      return;
    }

    gateState = nextState;

    if (nextState === "run") {
      options.onStart();
      return;
    }

    options.onStop();
    if (nextState === "reduce") {
      options.onReducedMotion?.();
    }
  }

  function setupReduceMotionWatcher() {
    if (typeof window === "undefined") return;

    reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.value = reduceMotionMedia.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.value = event.matches;
      evaluate();
    };

    if (typeof reduceMotionMedia.addEventListener === "function") {
      reduceMotionMedia.addEventListener("change", handleChange);
      detachReduceMotionListener = () => {
        reduceMotionMedia?.removeEventListener("change", handleChange);
      };
      return;
    }

    reduceMotionMedia.addListener(handleChange);
    detachReduceMotionListener = () => {
      reduceMotionMedia?.removeListener(handleChange);
    };
  }

  onMounted(() => {
    setupReduceMotionWatcher();

    const root = options.target.value;
    if (!root || typeof IntersectionObserver === "undefined") {
      isInViewport.value = true;
      evaluate();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isInViewport.value = entry.isIntersecting;
        evaluate();
      },
      {
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? "0px",
      },
    );

    observer.observe(root);
    evaluate(true);
  });

  if (options.active) {
    watch(
      options.active,
      () => {
        evaluate();
      },
      { flush: "post" },
    );
  }

  onBeforeUnmount(() => {
    if (gateState !== "stop") {
      options.onStop();
      gateState = "stop";
    }
    observer?.disconnect();
    observer = null;
    detachReduceMotionListener?.();
    detachReduceMotionListener = null;
    reduceMotionMedia = null;
  });

  return {
    isInViewport,
    prefersReducedMotion,
  };
}
