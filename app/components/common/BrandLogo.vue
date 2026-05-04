<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    variant?: "square" | "dot";
    size?: "sm" | "md" | "lg";
    animated?: boolean;
  }>(),
  {
    variant: "square",
    size: "md",
    animated: false
  }
);

const logoClass = computed(() => [
  "ds-brand-logo",
  `ds-brand-logo--${props.variant}`,
  `ds-brand-logo--${props.size}`,
  props.animated ? "ds-brand-logo--animated" : ""
]);
const asset = useAssetPath();
</script>

<template>
  <div :class="logoClass">
    <img class="ds-brand-logo__asset" :src="asset('/logo-datumsaas.svg')" :alt="label" />
  </div>
</template>
