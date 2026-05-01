<script setup lang="ts">
const locale = "en" as const;
const page = await getLegalPageContent(locale, "terms");
const homeContent = await getHomeContent(locale);

useLocalizedSeo({
  locale,
  path: "/terms",
  title: page.seo.title,
  description: page.seo.description,
  enPath: "/terms",
  esPath: "/es/terms",
});
</script>

<template>
  <main class="legal-shell">
    <LayoutSiteHeader :locale="locale" />
    <LegalPageView
      :title="page.title"
      :intro="page.intro"
      :updated-at="page.updatedAt"
      :sections="page.sections"
    />
    <LayoutSiteFooter :locale="locale" :copyright="homeContent.footer.copyright" />
  </main>
</template>

<style scoped>
.legal-shell {
  --page-max: 90rem;
  --page-gutter: clamp(1.5rem, 4vw, 4rem);
  --content-inset: clamp(0.5rem, 1.6vw, 1.5rem);
  --surface-border-subtle: var(--ink-a10);
  --surface-radius-card: var(--radius-card);
  --surface-radius-panel: var(--radius-lg);
  position: relative;
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow-x: clip;
}

.legal-shell::after {
  content: none;
}
</style>



