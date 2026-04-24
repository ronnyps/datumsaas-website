<script setup lang="ts">
import { computed } from "vue";
import {
  ROLE_POINTER_ROLES,
  type RolePointerLocale,
  type RolePointerRoleKey,
  type RolePointerRoleLabels
} from "~/data/role-pointer-roles";

const props = withDefaults(defineProps<{
  roleKey?: RolePointerRoleKey;
  labels?: RolePointerRoleLabels;
  lang?: RolePointerLocale;
  tone?: "blue" | "green" | "orange" | "violet" | "pink" | "teal" | "slate" | "red";
  variant?: "soft" | "solid";
  size?: "sm" | "md" | "lg";
  pointerRotation?: 0 | -90;
}>(), {
  roleKey: "ceo",
  lang: "es",
  variant: "soft",
  size: "md",
  pointerRotation: 0
});

const resolvedLabels = computed<RolePointerRoleLabels>(() => {
  if (props.labels) return props.labels;
  return ROLE_POINTER_ROLES[props.roleKey];
});

const labelText = computed(() => {
  const value = resolvedLabels.value[props.lang];
  return value.startsWith("@") ? value : `@${value}`;
});

const pointerSide = computed<"left" | "right">(() => {
  return props.pointerRotation === -90 ? "right" : "left";
});

const pointerRotationClass = computed(() => {
  return props.pointerRotation === -90
    ? "role-pointer-tag--rotation-minus-90"
    : "role-pointer-tag--rotation-0";
});
</script>

<template>
  <div
    class="role-pointer-tag"
    :class="[
      `role-pointer-tag--role-${roleKey}`,
      tone && `role-pointer-tag--tone-${tone}`,
      `role-pointer-tag--variant-${variant}`,
      `role-pointer-tag--size-${size}`,
      `role-pointer-tag--pointer-${pointerSide}`,
      pointerRotationClass
    ]"
  >
    <svg
      class="role-pointer-tag__pointer"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2120 1000"
      role="presentation"
      aria-hidden="true"
    >
      <path
        class="role-pointer-tag__pointer-path"
        d="M981.7,869.49l-88.83-256.56c-1.03-2.97-3.36-5.3-6.33-6.33l-256.67-88.93c-8.94-3.1-9.26-15.62-.5-19.17l602.8-244.55c8.39-3.4,16.75,4.96,13.34,13.35l-244.65,602.7c-3.56,8.76-16.08,8.44-19.17-.5Z"
      />
    </svg>

    <span class="role-pointer-tag__label">
      {{ labelText }}
    </span>
  </div>
</template>
