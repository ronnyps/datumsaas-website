// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-04-17",
  devtools: { enabled: false },
  ssr: true,
  css: ["~/assets/css/main.css"],
  modules: [
    [
      "unplugin-vue-inspector/nuxt",
      {
        enabled: false,
        toggleButtonVisibility: "always",
        toggleButtonPos: "bottom-right",
        launchEditor: "code"
      }
    ],
    "@nuxtjs/sitemap"
  ],
  nitro: {
    prerender: {
      routes: ["/", "/es", "/sitemap.xml", "/robots.txt"]
    }
  },
  site: {
    url: "https://www.datumsaas.com"
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"]
  }
});
