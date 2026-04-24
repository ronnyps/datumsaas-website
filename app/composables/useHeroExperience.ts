const HERO_SCENE_COUNT = 3;

const clampSceneIndex = (index: number): number => {
  if (!Number.isFinite(index)) return 0;
  const normalized = Math.trunc(index) % HERO_SCENE_COUNT;
  return normalized < 0 ? normalized + HERO_SCENE_COUNT : normalized;
};

const clampProgress = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
};

export function useHeroExperience() {
  const activeIndex = useState<number>("hero-experience-active-index", () => 0);
  const progress = useState<number>("hero-experience-progress", () => 0);
  const userPaused = useState<boolean>("hero-experience-user-paused", () => false);
  const autoplayMs = useState<number>("hero-experience-autoplay-ms", () => 12000);

  const resetExperience = () => {
    activeIndex.value = 0;
    progress.value = 0;
    userPaused.value = false;
    autoplayMs.value = 12000;
  };

  const setProgress = (value: number) => {
    progress.value = clampProgress(value);
  };

  const setActiveIndex = (
    index: number,
    options: {
      pauseAutoplay?: boolean;
      resetProgress?: boolean;
    } = {}
  ) => {
    activeIndex.value = clampSceneIndex(index);
    if (options.pauseAutoplay) userPaused.value = true;
    if (options.resetProgress !== false) progress.value = 0;
  };

  const advanceToNextScene = () => {
    activeIndex.value = clampSceneIndex(activeIndex.value + 1);
    progress.value = 0;
  };

  const setAutoplayDuration = (milliseconds: number) => {
    if (!Number.isFinite(milliseconds) || milliseconds < 1500) return;
    autoplayMs.value = Math.trunc(milliseconds);
  };

  return {
    sceneCount: HERO_SCENE_COUNT,
    activeIndex,
    progress,
    userPaused,
    autoplayMs,
    resetExperience,
    setProgress,
    setActiveIndex,
    advanceToNextScene,
    setAutoplayDuration
  };
}
