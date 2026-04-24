<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  visible: boolean;
  locale?: "en" | "es";
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  action: [value: "rename" | "send" | "delete"];
}>();

const options = computed(() => {
  if (props.locale === "es") {
    return [
      { key: "rename" as const, label: "Renombrar" },
      { key: "send" as const, label: "Enviar" },
      { key: "delete" as const, label: "Eliminar" }
    ];
  }

  return [
    { key: "rename" as const, label: "Rename" },
    { key: "send" as const, label: "Send" },
    { key: "delete" as const, label: "Delete" }
  ];
});
</script>

<template>
  <div
    class="problem-file-options-dropdown"
    :class="[visible && 'problem-file-options-dropdown--visible']"
    role="menu"
    :aria-label="ariaLabel || 'File options'"
    :aria-hidden="!visible"
  >
    <ul class="problem-file-options-dropdown__list">
      <li v-for="option in options" :key="option.key" class="problem-file-options-dropdown__item">
        <button
          type="button"
          class="problem-file-options-dropdown__button"
          :data-action="option.key"
          @click="emit('action', option.key)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
