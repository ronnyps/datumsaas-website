<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{
  locale?: "en" | "es";
  label: string;
  variant?: string;
  active?: boolean;
  rows?: string[];
}>();

const rowsByVariant = computed<Record<string, string[]>>(() => {
  if (props.locale === "es") {
    return {
      customer: ["Nombre de empresa", "Nombre de empresa", "Nombre de empresa"],
      contact: [
        "Nombre completo   Correo   Telefono",
        "Nombre completo   Correo   Telefono",
        "Nombre completo   Correo   Telefono",
      ],
    };
  }

  return {
    customer: ["Company Name", "Company Name", "Company Name"],
    contact: [
      "Full Name   Email   Phone Number",
      "Full Name   Email   Phone Number",
      "Full Name   Email   Phone Number",
    ],
  };
});

const MAX_STACK_ITEMS = 3;
const enteringKey = ref<string | null>(null);
let enterResetTimer: number | null = null;
const BADGE_COLOR_VARIANTS = [
  "flow-entity-node__dot--blue",
  "flow-entity-node__dot--indigo",
  "flow-entity-node__dot--violet",
  "flow-entity-node__dot--pink",
  "flow-entity-node__dot--midnight"
] as const;

function resolveRows() {
  const source = props.rows?.length
    ? props.rows
    : (rowsByVariant.value[props.variant ?? "customer"] ??
      rowsByVariant.value.customer);
  return source.slice(0, MAX_STACK_ITEMS);
}

// Generates unique keys even when the same row content appears more than once.
// First occurrence uses the content string (stable across position shifts so
// Vue can reuse the element and fire CSS transitions). Subsequent duplicates
// get an occurrence suffix to avoid the "duplicate keys" warning.
const resolvedRows = computed(() => {
  const rows = resolveRows();
  const hasRealRows = Boolean(props.rows?.length);
  const seen = new Map<string, number>();
  return rows.map((row, index) => {
    if (!hasRealRows) return { row, key: String(index) };
    const count = seen.get(row) ?? 0;
    seen.set(row, count + 1);
    return { row, key: count === 0 ? row : `${row}__${count}` };
  });
});

function depthClass(index: number) {
  if (index === 0) return "flow-entity-node__stack-item--latest";
  if (index === 1) return "flow-entity-node__stack-item--mid";
  return "flow-entity-node__stack-item--oldest";
}

function rowParts(row: string) {
  if ((props.variant ?? "customer") !== "contact") return [row];
  const parts = row.split(/\s{2,}/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) return [parts[0] ?? "", parts[1] ?? "", parts[2] ?? ""];
  return [row];
}

function initialsSource(row: string) {
  return rowParts(row)[0] ?? row;
}

function rowInitials(row: string) {
  const source = initialsSource(row)
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim();
  if (!source) return "NA";
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]?.slice(0, 2).toUpperCase() ?? "NA";
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
}

function rowColorClass(row: string) {
  const hash = [...row].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return BADGE_COLOR_VARIANTS[hash % BADGE_COLOR_VARIANTS.length] ?? BADGE_COLOR_VARIANTS[0];
}

watch(
  () => props.rows?.[0] ?? null,
  (next, prev) => {
    if (!next || next === prev) return;
    enteringKey.value = next;
    if (enterResetTimer !== null) {
      window.clearTimeout(enterResetTimer);
    }
    enterResetTimer = window.setTimeout(() => {
      enteringKey.value = null;
      enterResetTimer = null;
    }, 920);
  }
);

onBeforeUnmount(() => {
  if (enterResetTimer !== null) {
    window.clearTimeout(enterResetTimer);
    enterResetTimer = null;
  }
});
</script>

<template>
  <div class="flow-node-shell surface-pastel" :class="{ 'is-active': active }">
    <article class="flow-workflow-node flow-workflow-node--entity" :class="{ 'is-active': active }">
      <p class="flow-workflow-node__title ui-app-mode-title">{{ label }}</p>
      <ul class="flow-entity-node__rows ui-list-reset" :class="{ 'flow-entity-node__rows--contact': (props.variant ?? 'customer') === 'contact' }">
        <li
          v-for="({ row, key }, index) in resolvedRows"
          :key="key"
          :class="[
            depthClass(index),
            index === 0 && row === enteringKey ? 'flow-entity-node__stack-item--entering' : '',
          ]"
        >
          <span class="flow-entity-node__dot" :class="rowColorClass(row)" aria-hidden="true">{{ rowInitials(row) }}</span>
          <span class="flow-entity-node__text-lines">
            <span v-for="(part, partIndex) in rowParts(row)" :key="`${row}-${partIndex}`" class="flow-entity-node__line ui-app-table-row-text">{{ part }}</span>
          </span>
        </li>
      </ul>
    </article>
  </div>
</template>
