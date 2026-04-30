import { nextTick, onBeforeUnmount, onMounted, type Ref } from "vue";

type HeroIntroMotionRefs = {
  root: Ref<HTMLElement | null>;
  visual: Ref<HTMLElement | null>;
};

export function useHeroIntroLinesMotion({ root, visual }: HeroIntroMotionRefs): void {
  let disposed = false;
  let cleanupGsap: (() => void) | null = null;

  onMounted(async () => {
    await nextTick();

    if (disposed || !root.value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.value.dataset.intro = "ready";
      return;
    }

    const { gsap } = await import("gsap");
    if (disposed || !root.value) return;

    const ctx = gsap.context(() => {
      const textBlocks = root.value?.querySelectorAll<HTMLElement>(
        ".hero__announce, .hero__title, .hero__subtitle, .hero__micro-trust"
      ) ?? [];
      const ctas = root.value?.querySelectorAll<HTMLElement>(".hero__actions .btn") ?? [];

      gsap.set(textBlocks, { y: 26, autoAlpha: 0, willChange: "transform, opacity" });
      gsap.set(ctas, { y: 14, autoAlpha: 0, willChange: "transform, opacity" });
      if (visual.value) {
        gsap.set(visual.value, { y: 22, autoAlpha: 0, scale: 0.982, willChange: "transform, opacity" });
      }

      const introTimeline = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          if (root.value) root.value.dataset.intro = "ready";
        }
      });

      if (textBlocks.length) {
        introTimeline.to(
          textBlocks,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.82,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "will-change"
          },
          0
        );
      }

      if (ctas.length) {
        introTimeline.to(
          ctas,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.58,
            ease: "power2.out",
            stagger: 0.06,
            clearProps: "will-change"
          },
          0.26
        );
      }

      if (visual.value) {
        introTimeline.to(
          visual.value,
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 1.02,
            ease: "power3.out",
            clearProps: "will-change"
          },
          0.16
        );
      }

      if (!textBlocks.length && !ctas.length && !visual.value && root.value) {
        root.value.dataset.intro = "ready";
      }
    }, root.value);

    cleanupGsap = () => ctx.revert();
  });

  onBeforeUnmount(() => {
    disposed = true;
    cleanupGsap?.();
  });
}
