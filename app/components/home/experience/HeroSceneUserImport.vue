<script setup lang="ts">
import { computed } from "vue";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import HeroDashboardSidebar from "~/components/home/dashboard/HeroDashboardSidebar.vue";
import HeroDashboardTopbar from "~/components/home/dashboard/HeroDashboardTopbar.vue";

type MenuItem = {
  key: string;
  label: string;
  icon: string;
  active: boolean;
};

type ImportColumn = {
  key: "username" | "email" | "organization" | "status" | "firstName" | "lastName";
  label: string;
};

type ImportRow = {
  id: string;
  username: string;
  email: string;
  organization: string;
  status: string;
  firstName: string;
  lastName: string;
  role?: string;
};

const props = defineProps<{
  progress: number;
  brandName: string;
  searchAriaLabel: string;
  searchPlaceholder: string;
  navigationAriaLabel: string;
  menuItems: MenuItem[];
  breadcrumb: string;
  profileName: string;
  title: string;
  subtitle: string;
  filtersLabel: string;
  groupLabel: string;
  newUserLabel: string;
  progressLabel: string;
  userSearchPlaceholder: string;
  columns: ImportColumn[];
  rows: ImportRow[];
}>();

const importProgress = computed(() => {
  if (!Number.isFinite(props.progress)) return 0;
  if (props.progress <= 0) return 0;
  if (props.progress >= 1) return 1;
  return props.progress;
});

const stagedProgress = computed(() => {
  const start = 0.06;
  const end = 0.94;
  const normalized = (importProgress.value - start) / (end - start);
  if (normalized <= 0) return 0;
  if (normalized >= 1) return 1;
  return normalized;
});

const visibleColumnCount = computed(() => {
  const count = Math.ceil(stagedProgress.value * props.columns.length);
  return Math.max(props.columns.length, Math.min(props.columns.length, count));
});

const progressPercent = computed(() => Math.round(stagedProgress.value * 100));

const isColumnVisible = (columnIndex: number) => columnIndex < visibleColumnCount.value;

const visibleRowCount = computed(() => {
  const start = 0.08;
  const end = 0.7;
  const normalized = (stagedProgress.value - start) / (end - start);
  if (normalized <= 0) return 0;
  if (normalized >= 1) return props.rows.length;
  return Math.ceil(normalized * props.rows.length);
});

const isRowLoaded = (rowIndex: number) => rowIndex < visibleRowCount.value;

const getCellValue = (row: ImportRow, key: ImportColumn["key"]) => row[key];

const getStatusClass = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "active" || normalized === "activo") return "hero-import__status--active";
  return "hero-import__status--inactive";
};

const getUserInitials = (row: ImportRow) => {
  const first = (row.firstName || "").trim().charAt(0);
  const last = (row.lastName || "").trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || row.username.slice(0, 2).toUpperCase();
};
</script>

<template>
  <div class="dash-shot hero-experience-shell hero-experience-shell--import">
    <HeroDashboardSidebar
      :brand-name="brandName"
      :search-aria-label="searchAriaLabel"
      :search-placeholder="searchPlaceholder"
      :navigation-aria-label="navigationAriaLabel"
      :menu-items="menuItems"
    />

    <div class="dash-shot__main">
      <HeroDashboardTopbar :breadcrumb="breadcrumb" :profile-name="profileName" />

      <div class="hero-import__content">
        <div class="hero-import__toolbar">
          <div class="hero-import__toolbar-left">
            <h4 class="hero-import__title">{{ title }}</h4>
            <button class="hero-import__button" type="button">{{ newUserLabel }}</button>
          </div>
          <div class="hero-import__toolbar-right">
            <button class="hero-import__button hero-import__button--ghost" type="button">{{ filtersLabel }}</button>
            <button class="hero-import__button hero-import__button--ghost" type="button">{{ groupLabel }}</button>
            <div class="hero-import__search">{{ userSearchPlaceholder }}</div>
          </div>
        </div>

        <p class="hero-import__subtitle">{{ subtitle }}</p>

        <div class="hero-import__progress">
          <span>{{ progressLabel }}</span>
          <strong>{{ progressPercent }}%</strong>
        </div>

        <div class="hero-import__table-wrap">
          <table class="hero-import__table">
            <thead>
              <tr>
                <th class="hero-import__col hero-import__col--visible hero-import__col--checkbox">
                  <span class="hero-import__checkbox"></span>
                </th>
                <th class="hero-import__col hero-import__col--visible">Actions</th>
                <th
                  v-for="(column, columnIndex) in columns"
                  :key="`head-${column.key}`"
                  :class="[
                    'hero-import__col',
                    { 'hero-import__col--visible': isColumnVisible(columnIndex) }
                  ]"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in rows"
                :key="row.id"
                :class="['hero-import__row', { 'hero-import__row--loaded': isRowLoaded(rowIndex) }]"
              >
                <td class="hero-import__cell hero-import__cell--checkbox">
                  <span class="hero-import__checkbox"></span>
                </td>
                <td class="hero-import__cell hero-import__cell--actions">
                  <button class="hero-import__icon-btn" type="button" aria-label="Edit user">
                    <PencilSquareIcon />
                  </button>
                  <button class="hero-import__icon-btn" type="button" aria-label="View user">
                    <EyeIcon />
                  </button>
                  <button class="hero-import__icon-btn" type="button" aria-label="Delete user">
                    <TrashIcon />
                  </button>
                </td>
                <td
                  v-for="(column, columnIndex) in columns"
                  :key="`${row.id}-${column.key}`"
                  class="hero-import__cell"
                >
                  <template v-if="column.key === 'username'">
                    <span class="hero-import__user">
                      <span class="hero-import__avatar">{{ getUserInitials(row) }}</span>
                      <span class="hero-import__user-meta">
                        <span>{{ getCellValue(row, column.key) }}</span>
                        <small>{{ row.role }}</small>
                      </span>
                    </span>
                  </template>
                  <span
                    v-else-if="column.key === 'status'"
                    :class="[
                      'hero-import__status',
                      getStatusClass(getCellValue(row, column.key))
                    ]"
                  >
                    {{ getCellValue(row, column.key) }}
                  </span>
                  <span v-else>{{ getCellValue(row, column.key) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
