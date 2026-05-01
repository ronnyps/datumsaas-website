<script setup lang="ts">
import BrandLogo from "~/components/common/BrandLogo.vue";

withDefaults(
  defineProps<{
    locale?: "en" | "es";
    copyright: string;
  }>(),
  {
    locale: "en",
  },
);
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <NuxtLink class="footer__brand" :to="locale === 'es' ? '/es' : '/'">
        <BrandLogo label="DatumSaaS" size="md" variant="dot" />
      </NuxtLink>
      <div class="footer__legal">
        <small class="footer__copy">{{ copyright }}</small>
        <NuxtLink class="footer__terms" :to="locale === 'es' ? '/es/terms' : '/terms'">
          {{ locale === "es" ? "Terminos y condiciones" : "Terms and conditions" }}
        </NuxtLink>
        <NuxtLink class="footer__terms" :to="locale === 'es' ? '/es/privacy' : '/privacy'">
          {{ locale === "es" ? "Politica de privacidad" : "Privacy policy" }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
