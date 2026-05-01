import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type Locale = "en" | "es";

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function useContactDrawerRoute(locale: Locale) {
  const contactPath = locale === "es" ? "/es/contact" : "/contact";
  const basePath = locale === "es" ? "/es" : "/";
  const isOpen = ref(false);

  function syncFromLocation() {
    if (typeof window === "undefined") return;
    isOpen.value = normalizePath(window.location.pathname) === contactPath;
  }

  function closeDrawer() {
    isOpen.value = false;
    if (typeof window === "undefined") return;
    const current = normalizePath(window.location.pathname);
    if (current !== basePath) {
      window.history.pushState({}, "", basePath);
    }
  }

  function onDocumentClick(event: MouseEvent) {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;

    const anchor = event.target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (href.startsWith("http") && !href.startsWith(window.location.origin)) return;

    const targetUrl = new URL(anchor.href, window.location.origin);
    const targetPath = normalizePath(targetUrl.pathname);
    if (targetPath !== contactPath) return;

    event.preventDefault();
    event.stopPropagation();
    // Prevent NuxtLink/router handlers from running and forcing scroll-to-top.
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
    if (normalizePath(window.location.pathname) !== contactPath) {
      window.history.pushState({}, "", contactPath);
    }
    isOpen.value = true;
  }

  onMounted(() => {
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("auxclick", onDocumentClick as EventListener, true);
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("popstate", syncFromLocation);
    document.removeEventListener("click", onDocumentClick, true);
    document.removeEventListener("auxclick", onDocumentClick as EventListener, true);
  });

  return {
    contactPath: computed(() => contactPath),
    basePath: computed(() => basePath),
    isOpen: computed(() => isOpen.value),
    closeDrawer,
  };
}
