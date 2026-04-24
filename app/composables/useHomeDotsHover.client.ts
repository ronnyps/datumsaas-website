import { onBeforeUnmount, onMounted } from "vue";

type HoverState = {
  x: number;
  y: number;
  opacity: number;
};

export const useHomeDotsHover = () => {
  let root: HTMLElement | null = null;
  let hoverLayer: HTMLElement | null = null;
  let frameId = 0;

  const current: HoverState = { x: 0.5, y: 0.16, opacity: 0 };
  const target: HoverState = { x: 0.5, y: 0.16, opacity: 0 };

  const setVars = () => {
    if (!root) return;
    root.style.setProperty("--home-dots-hover-x", `${(current.x * 100).toFixed(2)}%`);
    root.style.setProperty("--home-dots-hover-y", `${(current.y * 100).toFixed(2)}%`);
    root.style.setProperty("--home-dots-hover-opacity", current.opacity.toFixed(3));
  };

  const animate = () => {
    const easing = 0.14;
    current.x += (target.x - current.x) * easing;
    current.y += (target.y - current.y) * easing;
    current.opacity += (target.opacity - current.opacity) * 0.16;
    setVars();

    const moving =
      Math.abs(target.x - current.x) > 0.001 ||
      Math.abs(target.y - current.y) > 0.001 ||
      Math.abs(target.opacity - current.opacity) > 0.001;

    if (moving) {
      frameId = requestAnimationFrame(animate);
      return;
    }

    frameId = 0;
  };

  const startAnimation = () => {
    if (frameId) return;
    frameId = requestAnimationFrame(animate);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!root || !hoverLayer) return;
    const hoverRect = hoverLayer.getBoundingClientRect();
    const x = (event.clientX - hoverRect.left) / Math.max(hoverRect.width, 1);
    const y = (event.clientY - hoverRect.top) / Math.max(hoverRect.height, 1);
    const inActiveArea =
      event.clientX >= hoverRect.left &&
      event.clientX <= hoverRect.right &&
      event.clientY >= hoverRect.top &&
      event.clientY <= hoverRect.bottom;

    if (!inActiveArea) {
      target.opacity = 0;
      startAnimation();
      return;
    }

    target.x = Math.min(Math.max(x, 0), 1);
    target.y = Math.min(Math.max(y, 0), 1);
    target.opacity = 1;
    startAnimation();
  };

  const onPointerLeave = () => {
    target.opacity = 0;
    startAnimation();
  };

  onMounted(() => {
    root = document.querySelector<HTMLElement>(".home[data-page='home-aida']");
    if (!root) return;
    hoverLayer = root.querySelector<HTMLElement>(".home__dots-hover");
    setVars();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    if (frameId) cancelAnimationFrame(frameId);
  });
};
