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
import {
  BuildingOffice2Icon as BuildingOffice2IconSolid,
  ChartBarSquareIcon as ChartBarSquareIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  CubeIcon as CubeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  IdentificationIcon as IdentificationIconSolid,
  KeyIcon as KeyIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  TruckIcon as TruckIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UsersIcon as UsersIconSolid
} from "@heroicons/vue/24/solid";
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

const menuIconMapSolid = {
  ChartBarSquareIcon: ChartBarSquareIconSolid,
  DocumentTextIcon: DocumentTextIconSolid,
  ClipboardDocumentListIcon: ClipboardDocumentListIconSolid,
  CubeIcon: CubeIconSolid,
  BuildingOffice2Icon: BuildingOffice2IconSolid,
  UsersIcon: UsersIconSolid,
  IdentificationIcon: IdentificationIconSolid,
  TruckIcon: TruckIconSolid,
  UserGroupIcon: UserGroupIconSolid,
  ShieldCheckIcon: ShieldCheckIconSolid,
  KeyIcon: KeyIconSolid
} as const;

const resolveMenuIcon = (iconName: string, active: boolean) => {
  if (active) {
    return menuIconMapSolid[iconName as keyof typeof menuIconMapSolid] ?? DocumentTextIconSolid;
  }
  return menuIconMap[iconName as keyof typeof menuIconMap] ?? DocumentTextIcon;
};
</script>

<template>
  <aside class="dash-shot__sidebar ui-app-view">
    <BrandLogo :label="brandName" size="sm" variant="dot" />

    <label class="search" :aria-label="searchAriaLabel">
      <MagnifyingGlassIcon class="search__icon ui-app-icon ui-app-icon--soft" />
      <span class="search__text ui-app-table-row-text">{{ searchPlaceholder }}</span>
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
          <component :is="resolveMenuIcon(item.icon, item.active)" class="menu__icon ui-app-icon ui-app-icon--soft" />
        </span>
        <span class="menu__label ui-app-table-row-text">{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>
