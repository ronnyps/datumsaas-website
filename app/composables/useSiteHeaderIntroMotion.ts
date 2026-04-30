import { nextTick, onBeforeUnmount, onMounted, type Ref } from "vue";

type SiteHeaderIntroRefs = {
  root: Ref<HTMLElement | null>;
};

export function useSiteHeaderIntroMotion({ root }: SiteHeaderIntroRefs): void {
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
      const inner = root.value?.querySelector<HTMLElement>(".site-header__inner");
      const navItems = root.value?.querySelectorAll<HTMLElement>(".site-header__nav-link") ?? [];
      const actions = root.value?.querySelectorAll<HTMLElement>(".site-header__actions > *") ?? [];
      const brand = root.value?.querySelector<HTMLElement>(".site-header__brand");

      const timeline = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          if (root.value) root.value.dataset.intro = "ready";
        }
      });

      if (inner) {
        gsap.set(inner, { y: -14, autoAlpha: 0, willChange: "transform, opacity" });
        timeline.to(
          inner,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.48,
            ease: "power3.out",
            clearProps: "will-change"
          },
          0
        );
      }

      if (brand) {
        gsap.set(brand, { x: -8, autoAlpha: 0, willChange: "transform, opacity" });
        timeline.to(
          brand,
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "will-change"
          },
          0.1
        );
      }

      if (navItems.length) {
        gsap.set(navItems, { y: -8, autoAlpha: 0, willChange: "transform, opacity" });
        timeline.to(
          navItems,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.36,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "will-change"
          },
          0.14
        );
      }

      if (actions.length) {
        gsap.set(actions, { y: -8, autoAlpha: 0, willChange: "transform, opacity" });
        timeline.to(
          actions,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.34,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "will-change"
          },
          0.2
        );
      }

      if (!inner && !brand && !navItems.length && !actions.length && root.value) {
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

