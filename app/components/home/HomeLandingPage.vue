<script setup lang="ts">
const props = defineProps<{
  locale: "en" | "es";
}>();

const content = await getHomeContent(props.locale);
const path = props.locale === "es" ? "/es" : "/";

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
    <HomeServicesSection :locale="props.locale" v-bind="content.services" />
    <HomeWhyUsSection v-bind="content.whyUs" />
    <HomeProofSection v-bind="content.proof" />
    <HomeSupportSection v-bind="content.support" />
    <HomeConfidenceSection v-bind="content.confidence" />
    <HomeDemoProcessSection v-bind="content.demoProcess" />
    <HomeFaqSection v-bind="content.faq" />
    <HomeCtaSection v-bind="content.cta" />
    <LayoutSiteFooter v-bind="content.footer" />
  </main>
</template>
