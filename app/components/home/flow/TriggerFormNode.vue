<script setup lang="ts">
import { computed } from "vue";

type TriggerForm = {
  title: string;
  fields: {
    companyName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  productOptions: string[];
  submitLabel: string;
};

type WorkflowContactRecord = {
  companyName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  productService: string;
};

const props = defineProps<{
  locale?: "en" | "es";
  form: TriggerForm;
  stage: string;
  active?: boolean;
  record?: WorkflowContactRecord | null;
  typingProgress?: number;
}>();

const isTyping = computed(() => props.stage === "typing");
const isSubmitting = computed(() => props.stage === "submit");
const isSubmitted = computed(() => props.stage !== "typing" && props.stage !== "reset");

function asTypedText(value: string) {
  if (!isTyping.value) return value;
  const progress = Math.max(0, Math.min(1, props.typingProgress ?? 1));
  const length = Math.max(1, Math.floor(value.length * progress));
  return value.slice(0, length);
}

const companyValue = computed(() => asTypedText(props.record?.companyName ?? props.form.fields.companyName));
const fullNameValue = computed(() => asTypedText(props.record?.fullName ?? props.form.fields.fullName));
const emailValue = computed(() => asTypedText(props.record?.email ?? props.form.fields.email));
const phoneValue = computed(() => asTypedText(props.record?.phoneNumber ?? props.form.fields.phoneNumber));
const productValue = computed(() => asTypedText(props.record?.productService ?? props.form.productOptions[0] ?? ""));
</script>

<template>
  <article class="flow-node-shell flow-trigger-shell" :class="{ 'is-active': active }">
    <div class="flow-workflow-node flow-workflow-node--trigger" :class="{ 'is-active': active }">
      <p class="flow-trigger-form__title">{{ form.title }}</p>
      <div class="flow-trigger-form__grid">
        <div class="flow-trigger-form__field">
          <span class="flow-trigger-form__input" :class="{ 'is-typing': isTyping, 'is-filled': isSubmitted }">{{ companyValue }}</span>
        </div>
        <div class="flow-trigger-form__field">
          <span class="flow-trigger-form__input" :class="{ 'is-typing': isTyping, 'is-filled': isSubmitted }">{{ fullNameValue }}</span>
        </div>
        <div class="flow-trigger-form__field">
          <span class="flow-trigger-form__input" :class="{ 'is-typing': isTyping, 'is-filled': isSubmitted }">{{ emailValue }}</span>
        </div>
        <div class="flow-trigger-form__field">
          <span class="flow-trigger-form__input" :class="{ 'is-typing': isTyping, 'is-filled': isSubmitted }">{{ phoneValue }}</span>
        </div>
        <div class="flow-trigger-form__field flow-trigger-form__field--full">
          <span class="flow-trigger-form__input flow-trigger-form__input--select" :class="{ 'is-typing': isTyping, 'is-filled': isSubmitted }">
            {{ productValue }}
            <span class="flow-trigger-form__caret" aria-hidden="true">v</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        class="flow-trigger-form__submit"
        :class="{ 'is-submitted': isSubmitted, 'is-pressing': isSubmitting }"
      >
        {{ form.submitLabel }}
      </button>
    </div>
  </article>
</template>

