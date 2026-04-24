import { onBeforeUnmount, onMounted, type Ref } from "vue";

type HoverState = { x: number; y: number; opacity: number };

export const useDotsHover = (rootRef: Ref<HTMLElement | null>) => {
  let hoverLayer: HTMLElement | null = null;
  let frameId = 0;

  const current: HoverState = { x: 0.5, y: 0.5, opacity: 0 };
  const target: HoverState = { x: 0.5, y: 0.5, opacity: 0 };

  const setVars = () => {
    const root = rootRef.value;
    if (!root) return;
    root.style.setProperty("--dots-hover-x", `${(current.x * 100).toFixed(2)}%`);
    root.style.setProperty("--dots-hover-y", `${(current.y * 100).toFixed(2)}%`);
    root.style.setProperty("--dots-hover-opacity", current.opacity.toFixed(3));
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
    if (!rootRef.value || !hoverLayer) return;
    const rect = hoverLayer.getBoundingClientRect();
    const inArea =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inArea) {
      target.opacity = 0;
      startAnimation();
      return;
    }

    target.x = Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1);
    target.y = Math.min(Math.max((event.clientY - rect.top) / Math.max(rect.height, 1), 0), 1);
    target.opacity = 1;
    startAnimation();
  };

  const onPointerLeave = () => {
    target.opacity = 0;
    startAnimation();
  };

  onMounted(() => {
    const root = rootRef.value;
    if (!root) return;
    hoverLayer = root.querySelector<HTMLElement>(".dots-layer--interactive");
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
