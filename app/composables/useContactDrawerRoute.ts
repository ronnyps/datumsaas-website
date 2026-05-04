import { computed } from "vue";

type Locale = "en" | "es";

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function useContactDrawerRoute(locale: Locale) {
  const route = useRoute();
  const router = useRouter();
  const contactPath = locale === "es" ? "/es/contact" : "/contact";
  const basePath = locale === "es" ? "/es" : "/";
  const isOpen = computed(() => normalizePath(route.path) === contactPath);

  function closeDrawer() {
    if (normalizePath(route.path) === basePath) return;
    void router.replace(basePath);
  }

  return {
    contactPath: computed(() => contactPath),
    basePath: computed(() => basePath),
    isOpen,
    closeDrawer,
  };
}
