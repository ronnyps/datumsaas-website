<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import { computed, onBeforeUnmount, ref, watch } from "vue";

type AccessUser = {
  id: string;
  name: string;
  organization: string;
  role?: string;
};

const props = defineProps<{
  locale?: "en" | "es";
  active?: boolean;
}>();

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      title: "Access governance",
      subtitle: "Users and org access",
      tableUser: "Usuario",
      orgPrefix: "Organizacion",
    };
  }

  return {
    title: "Access governance",
    subtitle: "Users and org access",
    tableUser: "User",
    orgPrefix: "Organization",
  };
});

const users = ref<AccessUser[]>([
  { id: "u-olivia", name: "Olivia Bennett", organization: "Summit Property Care" },
  { id: "u-sofia", name: "Sofia Martinez", organization: "Vertex Home Services" },
  { id: "u-jason", name: "Jason Clark", organization: "Blue Harbor Medical" },
  { id: "u-emma", name: "Emma Rodriguez", organization: "Northstar Logistics" },
  { id: "u-daniel", name: "Daniel Kim", organization: "Atlas Security Group" },
]);

const activeUserIndex = ref(0);
const modalUser = computed(() => users.value[activeUserIndex.value] ?? null);

const pressedRowId = ref<string | null>(null);
let pressedRowTimer: number | null = null;

function pressRow(id: string) {
  pressedRowId.value = id;
  if (pressedRowTimer) window.clearTimeout(pressedRowTimer);
  pressedRowTimer = window.setTimeout(() => {
    pressedRowId.value = null;
    pressedRowTimer = null;
  }, 280);
}

const orgOptions = computed(() => [
  "Summit Property Care",
  "Vertex Home Services",
  "Blue Harbor Medical",
  "Northstar Logistics",
  "Atlas Security Group",
]);

const roleOptions = computed(() => {
  if (props.locale === "es") {
    return ["Administrador", "Manager", "Operaciones", "Ventas", "Solo lectura"];
  }
  return ["Admin", "Manager", "Operations", "Sales", "Read-only"];
});

const selectedOrg = ref<string | null>(null);
const selectedRole = ref<string | null>(null);
const orgOpen = ref(false);
const roleOpen = ref(false);
const orgPressing = ref(false);
const rolePressing = ref(false);
const orgHighlighted = ref<number | null>(null);
const roleHighlighted = ref<number | null>(null);
const orgMenuShowSelection = ref(false);
const roleMenuShowSelection = ref(false);
const savePressing = ref(false);
const modalOpen = ref(true);

const saveEnabled = computed(() => Boolean(selectedOrg.value && selectedRole.value));

function randIndex(max: number) {
  return Math.floor(Math.random() * Math.max(1, max));
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function animateArrowNavigation(options: {
  abort: { canceled: boolean };
  length: number;
  startIndex: number;
  targetIndex: number;
  setHighlight: (index: number) => void;
}) {
  const { abort, length, startIndex, targetIndex, setHighlight } = options;
  if (length <= 0) return;

  // Pick a direction (up/down) to mimic arrow navigation.
  const forwardSteps = (targetIndex - startIndex + length) % length;
  const backwardSteps = (startIndex - targetIndex + length) % length;
  const goForward = Math.random() > 0.5 ? forwardSteps <= backwardSteps : forwardSteps < backwardSteps;
  const steps = goForward ? forwardSteps : backwardSteps;
  const stepDelta = goForward ? 1 : -1;

  let current = startIndex;
  setHighlight(current);
  await sleep(140 + randIndex(120));
  if (abort.canceled) return;

  for (let i = 0; i < steps; i += 1) {
    current = (current + stepDelta + length) % length;
    setHighlight(current);
    await sleep(88 + randIndex(74));
    if (abort.canceled) return;
  }

  // Tiny settle so it doesn't feel like it "teleports" into selection.
  await sleep(160 + randIndex(120));
}

async function runSequence(abort: { canceled: boolean }) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    selectedOrg.value = orgOptions.value[0] ?? null;
    selectedRole.value = roleOptions.value[0] ?? null;
    return;
  }

  let hasOpenedOnce = false;

  while (!abort.canceled) {
    // First open should be instant on hover. Subsequent opens should give
    // the table a beat so the row press reads clearly before the modal returns.
    if (!hasOpenedOnce) {
      modalOpen.value = true;
      hasOpenedOnce = true;
      await sleep(220 + randIndex(140));
      if (abort.canceled) return;
    } else {
      modalOpen.value = false;
      const nextUser = users.value[activeUserIndex.value] ?? users.value[0];
      if (nextUser) pressRow(nextUser.id);
      await sleep(360 + randIndex(220));
      if (abort.canceled) return;
      modalOpen.value = true;
      await sleep(220 + randIndex(140));
      if (abort.canceled) return;
    }

    // "Click" organizations -> open -> highlight -> select.
    orgPressing.value = true;
    await sleep(260 + randIndex(120));
    orgPressing.value = false;
    orgMenuShowSelection.value = false;
    orgHighlighted.value = null;
    orgOpen.value = true;

    const orgPick = randIndex(orgOptions.value.length);
    await sleep(220 + randIndex(140));
    if (abort.canceled) return;

    const orgStart = randIndex(orgOptions.value.length);
    await animateArrowNavigation({
      abort,
      length: orgOptions.value.length,
      startIndex: orgStart,
      targetIndex: orgPick,
      setHighlight: (index) => {
        orgHighlighted.value = index;
      },
    });
    if (abort.canceled) return;

    selectedOrg.value = orgOptions.value[orgPick] ?? null;
    orgMenuShowSelection.value = true;
    await sleep(420 + randIndex(220));
    if (abort.canceled) return;

    orgOpen.value = false;
    orgHighlighted.value = null;

    await sleep(560 + randIndex(260));
    if (abort.canceled) return;

    // "Click" roles -> open -> highlight -> select.
    rolePressing.value = true;
    await sleep(260 + randIndex(120));
    rolePressing.value = false;
    roleMenuShowSelection.value = false;
    roleHighlighted.value = null;
    roleOpen.value = true;

    const rolePick = randIndex(roleOptions.value.length);
    await sleep(220 + randIndex(140));
    if (abort.canceled) return;

    const roleStart = randIndex(roleOptions.value.length);
    await animateArrowNavigation({
      abort,
      length: roleOptions.value.length,
      startIndex: roleStart,
      targetIndex: rolePick,
      setHighlight: (index) => {
        roleHighlighted.value = index;
      },
    });
    if (abort.canceled) return;

    selectedRole.value = roleOptions.value[rolePick] ?? null;
    roleMenuShowSelection.value = true;
    await sleep(420 + randIndex(220));
    if (abort.canceled) return;

    roleOpen.value = false;
    roleHighlighted.value = null;

    // Let the UI breathe, then "click" Save once both fields are set.
    await sleep(520 + randIndex(260));
    if (abort.canceled) return;

    if (saveEnabled.value) {
      savePressing.value = true;
      await sleep(220);
      savePressing.value = false;
    }

    // Close modal, then update table and move to next user.
    modalOpen.value = false;
    await sleep(520 + randIndex(260));
    if (abort.canceled) return;

    const current = users.value[activeUserIndex.value];
    if (current) {
      if (selectedOrg.value) current.organization = selectedOrg.value;
      if (selectedRole.value) current.role = selectedRole.value;

      // Move current user down so a new one appears "after the table" cycle.
      users.value = [
        ...users.value.slice(0, activeUserIndex.value),
        ...users.value.slice(activeUserIndex.value + 1),
        current,
      ];
      activeUserIndex.value = 0;
    }

    await sleep(720 + randIndex(420));
    if (abort.canceled) return;

    selectedOrg.value = null;
    selectedRole.value = null;
    orgMenuShowSelection.value = false;
    roleMenuShowSelection.value = false;
  }
}

let abortRef: { canceled: boolean } | null = null;

function resetUiState() {
  orgOpen.value = false;
  roleOpen.value = false;
  orgPressing.value = false;
  rolePressing.value = false;
  orgHighlighted.value = null;
  roleHighlighted.value = null;
  orgMenuShowSelection.value = false;
  roleMenuShowSelection.value = false;
  savePressing.value = false;
  modalOpen.value = true;
}

function stopSequence() {
  if (abortRef) abortRef.canceled = true;
  abortRef = null;
  resetUiState();
}

function startSequence() {
  stopSequence();
  const abort = { canceled: false };
  abortRef = abort;
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  runSequence(abort);
}

watch(
  () => props.active,
  (active) => {
    if (typeof window === "undefined") return;
    if (active) startSequence();
    else stopSequence();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopSequence();
  if (pressedRowTimer) window.clearTimeout(pressedRowTimer);
});

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarToneClass(seed: string) {
  const toneClasses = [
    "ui-app-avatar--tone-1",
    "ui-app-avatar--tone-2",
    "ui-app-avatar--tone-3",
    "ui-app-avatar--tone-4",
    "ui-app-avatar--tone-5",
    "ui-app-avatar--tone-6",
    "ui-app-avatar--tone-7",
    "ui-app-avatar--tone-8",
  ] as const;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % toneClasses.length;
  return toneClasses[index] ?? "ui-app-avatar--tone-1";
}
</script>

<template>
  <div
    class="services-users-access ui-glass-apple ui-app-view ui-app-table-scale-compact"
    :class="{ 'is-active': active, 'is-modal-open': modalOpen }"
    aria-hidden="true"
  >
    <header class="services-users-access__head">
      <div class="services-users-access__head-meta">
        <p class="services-users-access__mode-title ui-app-mode-title">
          {{ copy.title }}
        </p>
        <p class="services-users-access__mode-subtitle ui-app-micro-text">
          {{ copy.subtitle }}
        </p>
      </div>
      <div class="services-users-access__mac-actions" aria-hidden="true">
        <span class="services-users-access__mac-dot services-users-access__mac-dot--red" />
        <span class="services-users-access__mac-dot services-users-access__mac-dot--yellow" />
        <span class="services-users-access__mac-dot services-users-access__mac-dot--green" />
      </div>
    </header>

    <div class="services-users-access__surface ui-app-border-soft">
      <div class="services-users-access__table-head">
        <span class="ui-app-table-head-text ui-app-table-head-text--alt">{{ copy.tableUser }}</span>
      </div>
      <ul class="services-users-access__rows ui-list-reset">
        <li
          v-for="user in users"
          :key="user.id"
          class="services-users-access__row ui-app-pressable-row"
          :class="pressedRowId === user.id && 'ui-app-pressable-row--pressed'"
        >
          <span class="services-users-access__row-user">
            <span
              class="ui-app-avatar ui-app-avatar--md"
              :class="getAvatarToneClass(user.id)"
              aria-hidden="true"
            >
              {{ getInitials(user.name) }}
            </span>
            <span class="services-users-access__row-copy">
              <span class="services-users-access__row-name ui-app-table-row-text">{{ user.name }}</span>
              <span class="services-users-access__row-org ui-app-tag ui-app-tag--neutral ui-app-table-badge">
                {{ copy.orgPrefix }}: {{ user.organization }}
              </span>
            </span>
          </span>
        </li>
      </ul>
    </div>

    <div class="services-users-access__modal" aria-hidden="true">
      <div class="services-users-access__modal-backdrop" />
      <div class="services-users-access__modal-card ui-app-border-soft ui-app-shadow-modal">
        <div v-if="modalUser" class="services-users-access__modal-user">
          <span
            class="ui-app-avatar ui-app-avatar--lg"
            :class="getAvatarToneClass(modalUser.id)"
            aria-hidden="true"
          >
            {{ getInitials(modalUser.name) }}
          </span>
          <div class="services-users-access__modal-copy">
            <p class="services-users-access__modal-name ui-app-heading">{{ modalUser.name }}</p>
            <p class="services-users-access__modal-org ui-app-micro-text">
              {{ copy.orgPrefix }}: {{ modalUser.organization }}
            </p>
          </div>
        </div>

        <div class="services-users-access__modal-controls">
          <div class="services-users-access__select" :class="{ 'is-open': orgOpen }">
            <button
              type="button"
              class="services-users-access__modal-control ui-app-border-soft ui-app-pressable-control"
              :class="{ 'ui-app-pressable-control--pressed': orgPressing }"
            >
              <span class="ui-app-table-head-text services-users-access__select-label">
                {{ props.locale === "es" ? "Organizacion" : "Organization" }}
              </span>
              <span class="services-users-access__select-value ui-app-table-row-text">
                {{ selectedOrg ?? (props.locale === "es" ? "Selecciona" : "Select") }}
              </span>
              <ChevronDownIcon class="services-users-access__select-caret" aria-hidden="true" />
            </button>

            <div class="services-users-access__select-menu ui-app-shadow-md" aria-hidden="true">
              <button
                v-for="(org, index) in orgOptions"
                :key="`org-${org}`"
                type="button"
                class="services-users-access__select-item ui-app-pressable-row"
                :class="[
                  orgHighlighted === index && 'is-highlighted',
                  orgMenuShowSelection && selectedOrg === org && 'is-selected',
                ]"
              >
                <span class="ui-app-table-row-text">{{ org }}</span>
              </button>
            </div>
          </div>

          <div
            class="services-users-access__select services-users-access__select--role"
            :class="{ 'is-open': roleOpen }"
          >
            <button
              type="button"
              class="services-users-access__modal-control ui-app-border-soft ui-app-pressable-control"
              :class="{ 'ui-app-pressable-control--pressed': rolePressing }"
            >
              <span class="ui-app-table-head-text services-users-access__select-label">
                {{ props.locale === "es" ? "Rol" : "Role" }}
              </span>
              <span class="services-users-access__select-value ui-app-table-row-text">
                {{ selectedRole ?? (props.locale === "es" ? "Selecciona" : "Select") }}
              </span>
              <ChevronDownIcon class="services-users-access__select-caret" aria-hidden="true" />
            </button>

            <div class="services-users-access__select-menu ui-app-shadow-md" aria-hidden="true">
              <button
                v-for="(role, index) in roleOptions"
                :key="`role-${role}`"
                type="button"
                class="services-users-access__select-item ui-app-pressable-row"
                :class="[
                  roleHighlighted === index && 'is-highlighted',
                  roleMenuShowSelection && selectedRole === role && 'is-selected',
                ]"
              >
                <span class="ui-app-table-row-text">{{ role }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="services-users-access__modal-actions">
          <button type="button" class="ui-app-btn ui-app-btn--neutral">
            {{ props.locale === "es" ? "Cancelar" : "Cancel" }}
          </button>
          <button
            type="button"
            class="ui-app-btn ui-app-btn--primary"
            :class="{ 'is-pressing': savePressing, 'is-active': saveEnabled }"
            :disabled="!saveEnabled"
          >
            {{ props.locale === "es" ? "Guardar" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
