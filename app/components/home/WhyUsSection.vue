<script setup lang="ts">
const activeRole = ref(0);

defineProps<{
  title: string;
  description: string;
  points: string[];
  roles: { role: string; value: string }[];
}>();
</script>

<template>
  <section
    id="why-us"
    class="section why-us"
    data-aida="hierarchy"
  >
    <div class="container why-us__panel">
      <div class="why-us__sticky content-stack content-stack--3" data-motion="desire-pin-root">
        <p class="why-us__eyebrow">Hierarchy and governance</p>
        <h2 class="section__title section__title--light">{{ title }}</h2>
        <p class="why-us__summary typo-p-panel-muted">{{ description }}</p>
      </div>
      <ul class="why-us__list">
        <li
          v-for="point in points"
          :key="point"
          class="why-us__item"
          data-motion="desire-panel"
        >
          {{ point }}
        </li>
      </ul>
    </div>

    <div class="container role-value content-stack content-stack--4" data-aida="role-value">
      <h3 class="role-value__title typo-h3-md">Built for cross-functional decisions</h3>
      <div class="role-value__tabs">
        <button
          v-for="(role, index) in roles"
          :key="role.role"
          type="button"
          class="role-value__tab"
          :class="{ 'role-value__tab--active': activeRole === index }"
          @click="activeRole = index"
        >
          {{ role.role }}
        </button>
      </div>
      <p class="role-value__content typo-p-body-muted">{{ roles[activeRole]?.value }}</p>
    </div>
  </section>
</template>
