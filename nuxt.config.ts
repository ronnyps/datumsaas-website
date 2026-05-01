// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-04-17",
  devtools: { enabled: false },
  ssr: true,
  runtimeConfig: {
    public: {
      n8nContactWebhookUrl:
        "https://flow.codeupkeep.com/webhook-test/b870815f-6b8e-4f5b-bed4-be3c42039c5f",
    },
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/imago.svg" }],
    },
  },
  css: ["~/assets/css/main.css"],
  modules: [
    [
      "unplugin-vue-inspector/nuxt",
      {
        enabled: false,
        toggleButtonVisibility: "always",
        toggleButtonPos: "bottom-right",
        launchEditor: "code",
      },
    ],
    "@nuxtjs/sitemap",
  ],
  nitro: {
    prerender: {
      routes: ["/", "/es", "/sitemap.xml", "/robots.txt"],
    },
  },
  site: {
    url: "https://www.datumsaas.com",
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },
});
