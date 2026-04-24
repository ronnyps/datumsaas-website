<script setup lang="ts">
import { BellIcon, HomeIcon } from "@heroicons/vue/24/outline";

defineProps<{
  breadcrumb: string;
  profileName: string;
}>();
</script>

<template>
  <header class="topbar">
    <div class="crumbs">
      <HomeIcon class="crumbs__icon" />
      <span>{{ breadcrumb }}</span>
    </div>
    <div class="profile">
      <BellIcon class="profile__bell" />
      <div class="profile__avatar"></div>
      <span class="profile__name">{{ profileName }}</span>
    </div>
  </header>
</template>
