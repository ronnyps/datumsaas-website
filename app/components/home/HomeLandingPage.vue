<script setup lang="ts">

const props = defineProps<{
  locale: "en" | "es";
}>();

const content = await getHomeContent(props.locale);
const productVariants = await getProductVariantsContent(props.locale);
const path = props.locale === "es" ? "/es" : "/";
const { isOpen: isContactDrawerOpen, closeDrawer: closeContactDrawer } = useContactDrawerRoute(props.locale);

useHomeDotsHover();
useLocalizedSeo({
  locale: props.locale,
  path,
  title: content.seo.title,
  description: content.seo.description
});

</script>

<template>
  <main
    :class="`home home--${props.locale} overflow-x-hidden w-full max-w-full`"
    data-page="home-aida"
  >
    <span class="home__dots-hover" aria-hidden="true" />
    <LayoutSiteHeader :locale="props.locale" />
    <HomeHeroSection :locale="props.locale" v-bind="content.hero" />
    <HomeBridgeSection v-bind="content.bridge" />
    <HomeProblemSection :locale="props.locale" v-bind="content.problem" />
    <HomeFlowSection :locale="props.locale" v-bind="content.flow" />
    <HomeServicesSection :locale="props.locale" v-bind="content.services" :product-variants="productVariants.products" />
    <HomeWhyUsSection v-bind="content.whyUs" />
    <HomeSupportSection v-bind="content.support" />
    <HomeFaqSection v-bind="content.faq" />
    <HomeCtaSection v-bind="content.cta" />
    <LayoutSiteFooter :locale="props.locale" v-bind="content.footer" />
    <LayoutSiteCookieNotice :locale="props.locale" />
    <LayoutSiteScrollCta :locale="props.locale" />
    <LayoutSiteContactDrawer
      :locale="props.locale"
      :open="isContactDrawerOpen"
      @close="closeContactDrawer"
    />
  </main>
</template>
