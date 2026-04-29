import { onBeforeUnmount, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ProblemSceneMode = "pinned" | "compact" | "reduced";

let scrollPluginRegistered = false;

const resolveStep = (progress: number) => {
  if (progress < 0.43) return 0;
  if (progress < 0.79) return 1;
  return 2;
};

export const useProblemScrollScene = () => {
  const sceneMode = ref<ProblemSceneMode>("pinned");
  const activeBulletIndex = ref(0);

  let scrollTrigger: ScrollTrigger | null = null;
  let lastProgress = 0;
  let hoverIndex: number | null = null;

  const syncFromProgress = () => {
    if (hoverIndex !== null) {
      activeBulletIndex.value = hoverIndex;
      return;
    }
    activeBulletIndex.value = resolveStep(lastProgress);
  };

  const setHoverIndex = (index: number | null) => {
    hoverIndex = index;
    syncFromProgress();
  };

  const setActiveIndex = (index: number) => {
    hoverIndex = null;
    activeBulletIndex.value = index;
  };

  const initScene = (element: HTMLElement | null) => {
    scrollTrigger?.kill();
    scrollTrigger = null;
    lastProgress = 0;
    hoverIndex = null;
    sceneMode.value = "pinned";
    activeBulletIndex.value = 0;

    if (!element || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactScreen = window.matchMedia("(max-width: 980px)").matches;

    if (reducedMotion) {
      sceneMode.value = "reduced";
      activeBulletIndex.value = 2;
      return;
    }

    if (!scrollPluginRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      scrollPluginRegistered = true;
    }

    if (compactScreen) {
      sceneMode.value = "compact";
      activeBulletIndex.value = 0;
      return;
    }

    sceneMode.value = "pinned";
    scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: "top top",
      end: "+=168%",
      pin: true,
      scrub: 1.18,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        lastProgress = self.progress;
        syncFromProgress();
      }
    });
  };

  onBeforeUnmount(() => {
    scrollTrigger?.kill();
  });

  return {
    sceneMode,
    activeBulletIndex,
    initScene,
    setHoverIndex,
    setActiveIndex
  };
};
