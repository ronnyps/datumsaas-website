<script setup lang="ts">
import {
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  DocumentTextIcon,
  IdentificationIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon
} from "@heroicons/vue/24/outline";
import BrandLogo from "~/components/common/BrandLogo.vue";

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
}>();

const menuIconMap = {
  ChartBarSquareIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  BuildingOffice2Icon,
  UsersIcon,
  IdentificationIcon,
  TruckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon
} as const;

const resolveMenuIcon = (iconName: string) =>
  menuIconMap[iconName as keyof typeof menuIconMap] ?? DocumentTextIcon;
</script>

<template>
  <aside class="dash-shot__sidebar">
    <BrandLogo :label="brandName" size="sm" variant="dot" />

    <label class="search" :aria-label="searchAriaLabel">
      <MagnifyingGlassIcon class="search__icon" />
      <span class="search__text">{{ searchPlaceholder }}</span>
    </label>

    <nav class="menu" :aria-label="navigationAriaLabel">
      <a
        v-for="item in menuItems"
        :key="item.key"
        class="menu__item"
        :class="{ 'menu__item--active': item.active }"
        href="#"
        @click.prevent
      >
        <span class="menu__icon-wrap">
          <component :is="resolveMenuIcon(item.icon)" class="menu__icon" />
        </span>
        <span class="menu__label">{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>
