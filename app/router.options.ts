import type { RouterConfig } from "@nuxt/schema";

const CONTACT_PATHS = new Set(["/contact", "/es/contact"]);
const LEGAL_PATHS = new Set(["/terms", "/privacy", "/es/terms", "/es/privacy"]);

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (LEGAL_PATHS.has(to.path)) {
      return { left: 0, top: 0 };
    }

    if (savedPosition) return savedPosition;

    if (CONTACT_PATHS.has(to.path) || CONTACT_PATHS.has(from.path)) {
      return false;
    }

    return { left: 0, top: 0 };
  },
};
