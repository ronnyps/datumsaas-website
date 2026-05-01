<script setup lang="ts">
import { BellIcon, HomeIcon } from "@heroicons/vue/24/outline";

defineProps<{
  breadcrumb: string;
  profileName: string;
}>();
</script>

<template>
  <header class="topbar ui-app-view">
    <div class="crumbs ui-app-table-row-text">
      <HomeIcon class="crumbs__icon ui-app-icon ui-app-icon--soft" />
      <span class="ui-app-table-row-text">{{ breadcrumb }}</span>
    </div>
    <div class="profile">
      <BellIcon class="profile__bell ui-app-icon ui-app-icon--soft" />
      <img
        class="profile__avatar profile__avatar--photo ui-app-avatar ui-app-avatar--md"
        src="/avatarCEO.webp"
        alt="CEO avatar"
      />
      <span class="profile__name ui-app-table-row-value">{{ profileName }}</span>
    </div>
  </header>
</template>
