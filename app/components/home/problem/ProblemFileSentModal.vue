<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  visible: boolean;
  locale?: "en" | "es";
  phase?: "loading" | "success";
}>();

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      loadingTitle: "Enviando archivo...",
      loadingMessage: "Validando permisos y destinatarios",
      title: "Archivo enviado",
      message: "Tu archivo fue enviado correctamente."
    };
  }

  return {
    loadingTitle: "Sending file...",
    loadingMessage: "Validating permissions and recipients",
    title: "File sent",
    message: "Your file was sent successfully."
  };
});
</script>

<template>
  <div
    class="problem-file-sent-modal"
    :class="[visible && 'problem-file-sent-modal--visible']"
    role="status"
    aria-live="polite"
    :aria-hidden="!visible"
  >
    <div class="problem-file-sent-modal__card">
      <template v-if="phase === 'loading'">
        <span class="problem-file-sent-modal__loader" aria-hidden="true" />
        <span class="problem-file-sent-modal__progress" aria-hidden="true">
          <span class="problem-file-sent-modal__progress-fill" />
        </span>
        <p class="problem-file-sent-modal__title">{{ copy.loadingTitle }}</p>
        <p class="problem-file-sent-modal__message">{{ copy.loadingMessage }}</p>
      </template>
      <template v-else>
        <p class="problem-file-sent-modal__title">{{ copy.title }}</p>
        <p class="problem-file-sent-modal__message">{{ copy.message }}</p>
      </template>
    </div>
  </div>
</template>
