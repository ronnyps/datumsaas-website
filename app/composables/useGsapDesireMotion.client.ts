import { onBeforeUnmount, onMounted, type Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useGsapDesireMotion(root: Ref<HTMLElement | null>): void {
  let ctx: gsap.Context | null = null;

  onMounted(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!root.value) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ctx = gsap.context(() => {
      const sticky = root.value?.querySelector<HTMLElement>(".why-us__sticky");
      if (sticky) {
        ScrollTrigger.create({
          trigger: root.value,
          start: "top top+=96",
          end: "bottom bottom-=96",
          pin: sticky,
          pinSpacing: false
        });
      }

      const panels = gsap.utils.toArray<HTMLElement>('[data-motion="desire-panel"]');
      panels.forEach((panel) => {
        gsap.fromTo(
          panel,
          { scale: 0.88, opacity: 0.55 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top 85%",
              end: "top 35%",
              scrub: true
            }
          }
        );

        gsap.to(panel, {
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "bottom 45%",
            end: "bottom 10%",
            scrub: true
          }
        });
      });
    }, root.value);
  });

  onBeforeUnmount(() => {
    ctx?.revert();
  });
}
