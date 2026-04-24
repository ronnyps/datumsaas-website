import { onBeforeUnmount, onMounted, type Ref } from "vue";

type HeroMotionRefs = {
  root: Ref<HTMLElement | null>;
  ribbon: Ref<HTMLElement | null>;
  visual: Ref<HTMLElement | null>;
};

export function useGsapHeroMotion({ root, ribbon, visual }: HeroMotionRefs): void {
  let cleanupMouseMove: (() => void) | null = null;
  let cleanupGsap: (() => void) | null = null;
  let disposed = false;

  onMounted(async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!root.value || !ribbon.value || !visual.value) {
      return;
    }

    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger")
    ]);

    if (disposed || !root.value || !ribbon.value || !visual.value) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [".hero__announce", ".hero__title", ".hero__subtitle", ".hero__actions", ".hero__micro-trust"],
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08
        }
      );

      gsap.fromTo(
        ribbon.value,
        { xPercent: 10, yPercent: 6, scale: 1.06, rotate: -17, opacity: 0.55 },
        {
          xPercent: 0,
          yPercent: 0,
          scale: 1,
          rotate: -14,
          opacity: 0.94,
          duration: 1.25,
          ease: "power3.out"
        }
      );

      gsap.to(ribbon.value, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: root.value,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      const xTo = gsap.quickTo(ribbon.value, "x", { duration: 0.8, ease: "power3.out" });
      const yTo = gsap.quickTo(ribbon.value, "y", { duration: 0.8, ease: "power3.out" });

      const onMouseMove = (event: MouseEvent) => {
        if (!visual.value) {
          return;
        }

        const rect = visual.value.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        xTo(x * 16);
        yTo(y * 12);
      };

      root.value?.addEventListener("mousemove", onMouseMove);
      cleanupMouseMove = () => root.value?.removeEventListener("mousemove", onMouseMove);
    }, root.value);

    cleanupGsap = () => ctx.revert();
  });

  onBeforeUnmount(() => {
    disposed = true;
    cleanupMouseMove?.();
    cleanupGsap?.();
  });
}
