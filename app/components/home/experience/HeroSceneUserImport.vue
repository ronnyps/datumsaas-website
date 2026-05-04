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
const asset = useAssetPath();

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

const getAvatarToneClass = (row: ImportRow) => {
  const seed = `${row.username}|${row.firstName}|${row.lastName}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const tone = (hash % 8) + 1;
  return `ui-app-avatar--tone-${tone}`;
};

const avatarByName: Record<string, string> = {
  "james-smith": asset("/users/james-smith.webp"),
  "olivia-johnson": asset("/users/Olivia-johnson.webp"),
  "liam-williams": asset("/users/Liam-Williams.webp"),
  "emma-brown": asset("/users/Emma-Brown.webp"),
  "noah-jones": asset("/users/Noah-Jones.webp"),
  "sophia-martinez": asset("/users/Sophia-Martinez.webp")
};

const getAvatarSrc = (row: ImportRow) => {
  const key = `${row.firstName}-${row.lastName}`.trim().toLowerCase().replace(/\s+/g, "-");
  return avatarByName[key] ?? null;
};
</script>

<template>
  <div class="dash-shot hero-experience-shell hero-experience-shell--import ui-app-view">
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
            <h4 class="hero-import__title ui-app-heading">{{ title }}</h4>
            <button class="hero-import__button ui-app-btn ui-app-btn--primary" type="button">{{ newUserLabel }}</button>
          </div>
          <div class="hero-import__toolbar-right">
            <button class="hero-import__button hero-import__button--ghost ui-app-btn ui-app-btn--neutral" type="button">{{ filtersLabel }}</button>
            <button class="hero-import__button hero-import__button--ghost ui-app-btn ui-app-btn--neutral" type="button">{{ groupLabel }}</button>
            <div class="hero-import__search ui-app-table-row-text">{{ userSearchPlaceholder }}</div>
          </div>
        </div>

        <p class="hero-import__subtitle ui-app-micro-text">{{ subtitle }}</p>

        <div class="hero-import__progress">
          <span class="ui-app-table-row-text">{{ progressLabel }}</span>
          <strong class="ui-app-table-row-value">{{ progressPercent }}%</strong>
        </div>

        <div class="hero-import__table-wrap">
          <table class="hero-import__table">
            <thead>
              <tr>
                <th class="hero-import__col hero-import__col--visible hero-import__col--checkbox">
                  <span class="hero-import__checkbox"></span>
                </th>
                <th class="hero-import__col hero-import__col--visible ui-app-table-head-text">Actions</th>
                <th
                  v-for="(column, columnIndex) in columns"
                  :key="`head-${column.key}`"
                  :class="[
                    'hero-import__col',
                    { 'hero-import__col--visible': isColumnVisible(columnIndex) }
                  ]"
                >
                  <span class="ui-app-table-head-text">{{ column.label }}</span>
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
                  <button class="hero-import__icon-btn ui-app-icon-button" type="button" aria-label="Edit user">
                    <PencilSquareIcon class="ui-app-icon ui-app-icon--primary" />
                  </button>
                  <button class="hero-import__icon-btn ui-app-icon-button" type="button" aria-label="View user">
                    <EyeIcon class="ui-app-icon ui-app-icon--primary" />
                  </button>
                  <button class="hero-import__icon-btn hero-import__icon-btn--danger ui-app-icon-button" type="button" aria-label="Delete user">
                    <TrashIcon class="ui-app-icon" />
                  </button>
                </td>
                <td
                  v-for="(column, columnIndex) in columns"
                  :key="`${row.id}-${column.key}`"
                  :class="['hero-import__cell', `hero-import__cell--${column.key}`]"
                >
                  <template v-if="column.key === 'username'">
                    <span class="hero-import__user">
                      <span :class="['hero-import__avatar', 'ui-app-avatar', 'ui-app-avatar--md', getAvatarSrc(row) ? 'ui-app-avatar--media' : getAvatarToneClass(row)]">
                        <img v-if="getAvatarSrc(row)" :src="getAvatarSrc(row) || undefined" :alt="`${row.firstName} ${row.lastName}`.trim()" class="ui-app-avatar-image" />
                        <template v-else>{{ getUserInitials(row) }}</template>
                      </span>
                      <span class="hero-import__user-meta">
                        <span class="ui-app-table-row-text">{{ getCellValue(row, column.key) }}</span>
                        <small class="ui-app-micro-text">{{ row.role }}</small>
                      </span>
                      <button class="hero-import__kebab ui-app-icon-button ui-app-icon-button--neutral" type="button" aria-label="User options">
                        <span aria-hidden="true">•••</span>
                      </button>
                    </span>
                  </template>
                  <span
                    v-else-if="column.key === 'status'"
                    :class="[
                      'hero-import__status ui-app-tag ui-app-table-badge',
                      getStatusClass(getCellValue(row, column.key))
                    ]"
                  >
                    {{ getCellValue(row, column.key) }}
                  </span>
                  <span v-else class="ui-app-table-row-text">{{ getCellValue(row, column.key) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
