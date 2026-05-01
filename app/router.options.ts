import type { RouterConfig } from "@nuxt/schema";

const CONTACT_PATHS = new Set(["/contact", "/es/contact"]);

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (CONTACT_PATHS.has(to.path) || CONTACT_PATHS.has(from.path)) {
      return false;
    }

    return { left: 0, top: 0 };
  },
};

