import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let activeCleanup: (() => void) | null = null;

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === "undefined") return;

  activeCleanup?.();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 0.95,
    touchMultiplier: 1
  });

  const onRaf = (time: number) => {
    // GSAP ticker time is in seconds, Lenis expects milliseconds.
    lenis.raf(time * 1000);
  };

  const onLenisScroll = () => {
    ScrollTrigger.update();
  };

  lenis.on("scroll", onLenisScroll);
  gsap.ticker.add(onRaf);
  gsap.ticker.lagSmoothing(0);

  nuxtApp.hook("page:finish", () => {
    ScrollTrigger.refresh();
  });

  const cleanup = () => {
    gsap.ticker.remove(onRaf);
    lenis.off("scroll", onLenisScroll);
    lenis.destroy();

    if (activeCleanup === cleanup) {
      activeCleanup = null;
    }
  };

  activeCleanup = cleanup;

  window.addEventListener("beforeunload", cleanup, { once: true });
});
