<script setup lang="ts">
const props = defineProps<{
  locale?: "en" | "es";
  label: string;
  active?: boolean;
  splitActive?: boolean;
}>();

const chips = props.locale === "es"
  ? ["Procesar payload", "Crear registros", "Enrutar acciones"]
  : ["Parse payload", "Create records", "Route actions"];
</script>

<template>
  <div class="flow-node-shell" :class="{ 'is-active': active }">
    <article class="flow-workflow-node flow-workflow-node--system" :class="{ 'is-active': active }">
      <p class="flow-workflow-node__title">{{ label }}</p>
      <div class="flow-system-node__chips" :class="{ 'is-split-active': splitActive }">
        <span v-for="chip in chips" :key="chip">{{ chip }}</span>
      </div>
    </article>
  </div>
</template>
