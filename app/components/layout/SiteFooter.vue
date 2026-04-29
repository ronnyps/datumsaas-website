<script setup lang="ts">
import BrandLogo from "~/components/common/BrandLogo.vue";

defineProps<{
  copyright: string;
}>();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <a class="footer__brand" href="/">
        <BrandLogo label="DatumSaaS" size="md" variant="dot" />
      </a>
      <div class="footer__legal">
        <small class="footer__copy">{{ copyright }}</small>
        <a class="footer__terms" href="#contact">Terms and conditions</a>
      </div>
    </div>
  </footer>
</template>
