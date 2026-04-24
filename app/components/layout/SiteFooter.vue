<script setup lang="ts">
defineProps<{
  copyright: string;
}>();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <small class="footer__copy">{{ copyright }}</small>
    </div>
  </footer>
</template>
