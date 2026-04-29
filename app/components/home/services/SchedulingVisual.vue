<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/vue/24/outline";
import type { SchedulingEvent, SchedulingLocale, SchedulingUser } from "~/data/scheduling";
import { schedulingEvents, schedulingUsers } from "~/data/scheduling";

const props = defineProps<{
  locale?: SchedulingLocale;
}>();

const locale = computed<SchedulingLocale>(() => props.locale ?? "en");

const copy = computed(() => {
  if (locale.value === "es") {
    return {
      assignedTo: "Asignado a",
      timeLabel: "Hora",
    };
  }

  return {
    assignedTo: "Assigned to",
    timeLabel: "Time",
  };
});

function capFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const rootRef = ref<HTMLElement | null>(null);
const prefersReducedMotion = ref(false);
const isHovered = ref(false);

const today = ref(new Date());
let todayTimer: number | undefined;

onMounted(() => {
  // Client-only render: keep labels synced with the real current day.
  today.value = new Date();
  prefersReducedMotion.value = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  todayTimer = window.setInterval(() => {
    const next = new Date();
    const prev = today.value;
    if (
      next.getFullYear() !== prev.getFullYear() ||
      next.getMonth() !== prev.getMonth() ||
      next.getDate() !== prev.getDate()
    ) {
      today.value = next;
    }
  }, 60_000);

});

onBeforeUnmount(() => {
  if (todayTimer) window.clearInterval(todayTimer);
  stopAnimations(scrollAnimations);
  stopAnimations(returnAnimations);
});

const monthLabel = computed(() => {
  const lang = locale.value === "es" ? "es-ES" : "en-US";
  const raw = new Intl.DateTimeFormat(lang, { month: "long" }).format(today.value);
  return capFirst(raw);
});

const dayNumber = computed(() => String(today.value.getDate()));

const weekdayLabel = computed(() => {
  const lang = locale.value === "es" ? "es-ES" : "en-US";
  const raw = new Intl.DateTimeFormat(lang, { weekday: "short" }).format(today.value);
  // en-US returns "Thu", es-ES returns "jue"; keep title-case.
  return capFirst(raw.replace(".", ""));
});

const usersById = computed(() => {
  const map = new Map<string, SchedulingUser>();
  for (const user of schedulingUsers) map.set(user.id, user);
  return map;
});

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

function parseTimeToMinutes(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  return hours * 60 + minutes;
}

function format12h(value: string) {
  const minutes = parseTimeToMinutes(value);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const am = h24 < 12;
  const h12 = ((h24 + 11) % 12) + 1;
  const mm = String(m).padStart(2, "0");
  return `${h12}:${mm} ${am ? "AM" : "PM"}`;
}

const sortedEvents = computed(() =>
  [...schedulingEvents].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start))
);

const scrollEvents = computed(() => {
  const base = sortedEvents.value;
  const head = base.slice(0, 3);
  return [...base, ...head];
});

const isAnimating = computed(() => isHovered.value && !prefersReducedMotion.value);

let scrollAnimations: Animation[] = [];
let returnAnimations: Animation[] = [];

function stopAnimations(list: Animation[]) {
  for (const anim of list) {
    try {
      anim.cancel();
    } catch {
      // noop
    }
  }
  list.length = 0;
}

function readTranslateY(transform: string) {
  if (!transform || transform === "none") return 0;

  const m2d = /^matrix\(([^)]+)\)$/.exec(transform);
  if (m2d) {
    const parts = m2d[1]?.split(",").map((s) => Number(s.trim())) ?? [];
    return Number.isFinite(parts[5]) ? (parts[5] as number) : 0;
  }

  const m3d = /^matrix3d\(([^)]+)\)$/.exec(transform);
  if (m3d) {
    const parts = m3d[1]?.split(",").map((s) => Number(s.trim())) ?? [];
    return Number.isFinite(parts[13]) ? (parts[13] as number) : 0;
  }

  return 0;
}

function getStepPx(root: HTMLElement) {
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".services-scheduling__row"));
  if (rows.length < 2) return 0;
  const a = rows[0]?.offsetTop ?? 0;
  const b = rows[1]?.offsetTop ?? 0;
  return Math.max(1, b - a);
}

function startScrollLoop() {
  const root = rootRef.value;
  if (!root || prefersReducedMotion.value) return;

  const count = sortedEvents.value.length;
  if (!count) return;

  const stepPx = getStepPx(root);
  if (!stepPx) return;

  const distance = stepPx * count;
  const durationMs = 22_000;

  const targets = Array.from(root.querySelectorAll<HTMLElement>(".services-scheduling__scroll-content"));
  stopAnimations(scrollAnimations);
  stopAnimations(returnAnimations);

  for (const el of targets) {
    const currentY = readTranslateY(getComputedStyle(el).transform);
    const progress = distance ? Math.min(1, Math.max(0, (-currentY) / distance)) : 0;

    const anim = el.animate(
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: `translate3d(0, ${-distance}px, 0)` },
      ],
      {
        duration: durationMs,
        iterations: Infinity,
        easing: "linear",
        fill: "both",
      }
    );

    // Resume from current position so hover-in feels continuous.
    anim.currentTime = progress * durationMs;
    anim.play();
    scrollAnimations.push(anim);
  }
}

function returnToStart() {
  const root = rootRef.value;
  if (!root) return;

  const targets = Array.from(root.querySelectorAll<HTMLElement>(".services-scheduling__scroll-content"));
  stopAnimations(scrollAnimations);
  stopAnimations(returnAnimations);

  for (const el of targets) {
    const fromTransform = getComputedStyle(el).transform;
    const anim = el.animate(
      [{ transform: fromTransform }, { transform: "translate3d(0, 0, 0)" }],
      {
        duration: 720,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        fill: "forwards",
      }
    );

    returnAnimations.push(anim);
  }
}

function assignedUsers(event: SchedulingEvent) {
  return event.assignedUserIds
    .map((id) => usersById.value.get(id))
    .filter(Boolean) as SchedulingUser[];
}

</script>

<template>
  <div
    ref="rootRef"
    class="services-scheduling ui-glass-apple ui-app-view ui-app-table-scale-compact"
    :class="isAnimating && 'is-animating'"
    :data-scroll-count="sortedEvents.length"
    aria-hidden="true"
    @pointerenter="isHovered = true; startScrollLoop()"
    @pointerleave="isHovered = false; returnToStart()"
  >
    <header class="services-scheduling__head">
      <div class="services-scheduling__head-nav" aria-hidden="true">
        <button type="button" class="services-scheduling__nav-btn ui-app-pressable-control">
          <ChevronLeftIcon class="ui-app-icon ui-app-icon--sm" />
        </button>
        <p class="services-scheduling__month ui-app-mode-title">{{ monthLabel }}</p>
        <button type="button" class="services-scheduling__nav-btn ui-app-pressable-control">
          <ChevronRightIcon class="ui-app-icon ui-app-icon--sm" />
        </button>
      </div>

      <div class="services-scheduling__day-pill ui-app-border-soft">
        <span class="services-scheduling__day-number ui-app-table-row-value">{{ dayNumber }}</span>
        <span class="services-scheduling__day-label ui-app-micro-text">{{ weekdayLabel }}</span>
      </div>
    </header>

    <div class="services-scheduling__surface ui-app-border-soft">
      <div class="services-scheduling__timeline">
        <div class="services-scheduling__times" aria-hidden="true">
          <span class="services-scheduling__time-kicker ui-app-table-head-text">{{ copy.timeLabel }}</span>
        </div>
        <div class="services-scheduling__events-kicker" aria-hidden="true" />

        <div class="services-scheduling__viewport" aria-hidden="true">
          <ol class="services-scheduling__rows services-scheduling__scroll-content">
            <li v-for="event in scrollEvents" :key="event.id" class="services-scheduling__row">
              <div class="services-scheduling__row-time">
                <span class="services-scheduling__time-start ui-app-micro-text">{{ format12h(event.start) }}</span>
                <span class="services-scheduling__time-end ui-app-micro-text">{{ format12h(event.end) }}</span>
              </div>

              <article
                class="services-scheduling__event ui-app-border-soft"
                :class="`services-scheduling__event--${event.tone}`"
              >
                <div class="services-scheduling__event-head">
                  <p class="services-scheduling__event-title ui-app-heading">{{ event.title[locale] }}</p>
                  <EllipsisHorizontalIcon class="services-scheduling__event-menu ui-app-icon ui-app-icon--sm" />
                </div>
                <p class="services-scheduling__event-time ui-app-micro-text">
                  {{ format12h(event.start) }} - {{ format12h(event.end) }}
                </p>

                <div class="services-scheduling__event-assignees">
                  <span class="services-scheduling__assigned-label ui-app-micro-text">{{ copy.assignedTo }}</span>
                  <div class="services-scheduling__avatars" aria-hidden="true">
                    <span
                      v-for="user in assignedUsers(event).slice(0, 3)"
                      :key="`a-${event.id}-${user.id}`"
                      class="ui-app-avatar ui-app-avatar--sm services-scheduling__avatar"
                      :class="getAvatarToneClass(user.id)"
                    >
                      {{ user.initials }}
                    </span>
                    <span
                      v-if="assignedUsers(event).length > 3"
                      class="ui-app-tag ui-app-tag--slate ui-app-table-badge services-scheduling__more"
                    >
                      +{{ assignedUsers(event).length - 3 }}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
