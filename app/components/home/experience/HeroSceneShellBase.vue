<script setup lang="ts">
import HeroDashboardSidebar from "~/components/home/dashboard/HeroDashboardSidebar.vue";
import HeroDashboardTopbar from "~/components/home/dashboard/HeroDashboardTopbar.vue";

type MenuItem = {
  key: string;
  label: string;
  icon: string;
  active: boolean;
};

defineProps<{
  brandName: string;
  searchAriaLabel: string;
  searchPlaceholder: string;
  navigationAriaLabel: string;
  menuItems: MenuItem[];
  breadcrumb: string;
  profileName: string;
  variant?: "blank" | "connected";
  headline: string;
  subline: string;
}>();
</script>

<template>
  <div class="dash-shot hero-experience-shell" :class="`hero-experience-shell--${variant ?? 'blank'}`">
    <HeroDashboardSidebar
      :brand-name="brandName"
      :search-aria-label="searchAriaLabel"
      :search-placeholder="searchPlaceholder"
      :navigation-aria-label="navigationAriaLabel"
      :menu-items="menuItems"
    />

    <div class="dash-shot__main">
      <HeroDashboardTopbar :breadcrumb="breadcrumb" :profile-name="profileName" />

      <div class="hero-experience-shell__content">
        <div class="hero-experience-shell__center-copy">
          <h4>{{ headline }}</h4>
          <p>{{ subline }}</p>
        </div>

        <div v-if="(variant ?? 'blank') === 'connected'" class="hero-experience-shell__connection-grid" aria-hidden="true">
          <span class="hero-experience-shell__node hero-experience-shell__node--a"></span>
          <span class="hero-experience-shell__node hero-experience-shell__node--b"></span>
          <span class="hero-experience-shell__node hero-experience-shell__node--c"></span>
          <span class="hero-experience-shell__node hero-experience-shell__node--d"></span>
          <span class="hero-experience-shell__beam hero-experience-shell__beam--ab"></span>
          <span class="hero-experience-shell__beam hero-experience-shell__beam--bc"></span>
          <span class="hero-experience-shell__beam hero-experience-shell__beam--cd"></span>
          <span class="hero-experience-shell__beam hero-experience-shell__beam--ad"></span>
        </div>
      </div>
    </div>
  </div>
</template>
