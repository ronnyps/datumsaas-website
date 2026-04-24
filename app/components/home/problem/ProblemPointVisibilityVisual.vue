<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { gsap } from "gsap";
import DocFileGlyph from "~/components/home/problem/DocFileGlyph.vue";
import RolePointerTag from "~/components/shared/RolePointerTag.vue";
import type { RolePointerRoleKey } from "~/data/role-pointer-roles";

const props = defineProps<{
  active?: boolean;
  locale?: "en" | "es";
}>();

type FolderKey = "operations" | "sales" | "finance";
type ExplorerFolder = {
  key: FolderKey;
  iconType: "doc" | "ppt" | "xls";
  ownerRole: RolePointerRoleKey;
};

type EntrySide = "left" | "right" | "top";
type AttemptResult = "idle" | "denied" | "allowed";
type ModalPhase = "hidden" | "checking" | "denied" | "allowed";

const folders: ExplorerFolder[] = [
  { key: "operations", iconType: "doc", ownerRole: "ops" },
  { key: "sales", iconType: "ppt", ownerRole: "sales" },
  { key: "finance", iconType: "xls", ownerRole: "cfo" }
];

const roleCandidates: RolePointerRoleKey[] = ["ceo", "hr", "cfo", "coo", "cto", "sales", "legal", "ops"];
const DENIED_PROBABILITY = 0.8;
const LOOP_DELAY_MS = 300;
const CHECKING_PHASE_MS = 1800;
const RESULT_PHASE_MS = 2200;
const INTRO_START_DELAY_MS = 620;

const explorerRootEl = ref<HTMLElement | null>(null);
const pointerWrapEl = ref<HTMLElement | null>(null);
const pointerNodeEl = ref<HTMLElement | null>(null);
const folderEls = ref<HTMLElement[]>([]);

const introEntered = ref(false);
const pointerVisible = ref(false);
const pointerRole = ref<RolePointerRoleKey>("hr");
const selectedFolderIndex = ref(-1);
const attemptResult = ref<AttemptResult>("idle");
const modalPhase = ref<ModalPhase>("hidden");

let cycleTimeline: gsap.core.Timeline | null = null;
let cycleTimeoutId: number | null = null;
let modalTransitionTimeoutId: number | null = null;
let introStartTimeoutId: number | null = null;

function setFolderRef(el: Element | null, index: number) {
  if (!(el instanceof HTMLElement)) {
    folderEls.value[index] = undefined as unknown as HTMLElement;
    return;
  }
  folderEls.value[index] = el;
}

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      title: "Explorador de Archivos",
      subtitle: "Visibilidad limitada entre equipos",
      currentPath: "Empresa / Compartido",
      sidebarTitle: "Acceso rapido",
      sidebarItems: ["General", "Operaciones", "Ventas", "Finanzas"],
      folders: {
        operations: "Operaciones",
        sales: "Ventas",
        finance: "Finanzas"
      },
      permission: {
        operations: "@Operaciones",
        sales: "@Ventas",
        finance: "@Finanzas"
      },
      modal: {
        checkingTitle: "Verificando visibilidad",
        checkingText: "Validando permisos para esta carpeta...",
        deniedTitle: "Visibilidad limitada",
        deniedText: "No tienes visibilidad para este contenido.",
        allowedTitle: "Visibilidad disponible",
        allowedText: "Puedes visualizar el contenido de esta carpeta."
      }
    };
  }

  return {
    title: "File Explorer",
    subtitle: "Limited cross-team visibility",
    currentPath: "Company / Shared",
    sidebarTitle: "Quick access",
    sidebarItems: ["General", "Operations", "Sales", "Finance"],
    folders: {
      operations: "Operations",
      sales: "Sales",
      finance: "Finance"
    },
    permission: {
      operations: "@Operations",
      sales: "@Sales",
      finance: "@Finance"
    },
    modal: {
      checkingTitle: "Checking visibility",
      checkingText: "Validating permissions for this folder...",
      deniedTitle: "Limited visibility",
      deniedText: "You do not have visibility for this content.",
      allowedTitle: "Visibility available",
      allowedText: "You can view this folder content."
    }
  };
});

const isModalVisible = computed(() => modalPhase.value !== "hidden");

const modalTitle = computed(() => {
  if (modalPhase.value === "checking") return copy.value.modal.checkingTitle;
  if (modalPhase.value === "denied") return copy.value.modal.deniedTitle;
  if (modalPhase.value === "allowed") return copy.value.modal.allowedTitle;
  return "";
});

const modalText = computed(() => {
  if (modalPhase.value === "checking") return copy.value.modal.checkingText;
  if (modalPhase.value === "denied") return copy.value.modal.deniedText;
  if (modalPhase.value === "allowed") return copy.value.modal.allowedText;
  return "";
});

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pickRoleExcluding(excludedRole: RolePointerRoleKey): RolePointerRoleKey {
  const availableRoles = roleCandidates.filter((role) => role !== excludedRole);
  const role = availableRoles[randomInt(availableRoles.length)];
  return role ?? "hr";
}

function clearCycleTimeout() {
  if (cycleTimeoutId === null) return;
  window.clearTimeout(cycleTimeoutId);
  cycleTimeoutId = null;
}

function clearModalTransitionTimeout() {
  if (modalTransitionTimeoutId === null) return;
  window.clearTimeout(modalTransitionTimeoutId);
  modalTransitionTimeoutId = null;
}

function clearIntroStartTimeout() {
  if (introStartTimeoutId === null) return;
  window.clearTimeout(introStartTimeoutId);
  introStartTimeoutId = null;
}

function resetVisualState() {
  selectedFolderIndex.value = -1;
  attemptResult.value = "idle";
  modalPhase.value = "hidden";
}

function stopCycle() {
  clearCycleTimeout();
  clearModalTransitionTimeout();
  clearIntroStartTimeout();
  cycleTimeline?.kill();
  cycleTimeline = null;
  pointerVisible.value = false;
  introEntered.value = false;
  resetVisualState();
}

const isActive = computed(() => Boolean(props.active ?? true));
const { isInViewport, prefersReducedMotion } = useViewportAnimationGate({
  target: explorerRootEl,
  active: isActive,
  threshold: 0.25,
  rootMargin: "0px 0px -10% 0px",
  onStart: () => {
    startCycle();
  },
  onStop: () => {
    stopCycle();
  }
});

function resolveFolderCenter(index: number) {
  const wrap = pointerWrapEl.value;
  const folder = folderEls.value[index];
  if (!wrap || !folder) return null;

  const wrapRect = wrap.getBoundingClientRect();
  const folderRect = folder.getBoundingClientRect();

  return {
    x: folderRect.left - wrapRect.left + (folderRect.width * 0.5),
    y: folderRect.top - wrapRect.top + (folderRect.height * 0.42)
  };
}

function resolveEntryPoint(side: EntrySide, targetX: number, targetY: number) {
  if (side === "left") {
    return { x: -170, y: targetY + (Math.random() < 0.5 ? -34 : 30) };
  }

  if (side === "right") {
    return { x: (pointerWrapEl.value?.clientWidth ?? 0) + 170, y: targetY + (Math.random() < 0.5 ? -28 : 26) };
  }

  return { x: targetX + (Math.random() < 0.5 ? -96 : 92), y: -150 };
}

function resolveExitPoint(side: EntrySide, targetX: number, targetY: number) {
  if (side === "left") {
    return { x: -190, y: targetY + (Math.random() < 0.5 ? -56 : 56) };
  }

  if (side === "right") {
    return { x: (pointerWrapEl.value?.clientWidth ?? 0) + 180, y: targetY + (Math.random() < 0.5 ? -52 : 52) };
  }

  return { x: targetX + (Math.random() < 0.5 ? -116 : 116), y: -166 };
}

function shouldRunCycle() {
  return isActive.value && isInViewport.value && !prefersReducedMotion.value;
}

function triggerIntro() {
  if (prefersReducedMotion.value) {
    introEntered.value = true;
    return;
  }

  introEntered.value = false;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      introEntered.value = true;
    });
  });
}

function startCycle() {
  if (!shouldRunCycle()) return;
  clearIntroStartTimeout();
  triggerIntro();
  introStartTimeoutId = window.setTimeout(() => {
    introStartTimeoutId = null;
    void runCycle();
  }, INTRO_START_DELAY_MS);
}

function scheduleNextCycle() {
  clearCycleTimeout();
  cycleTimeoutId = window.setTimeout(() => {
    void runCycle();
  }, LOOP_DELAY_MS);
}

async function runCycle() {
  if (!shouldRunCycle()) return;

  await nextTick();

  const pointerNode = pointerNodeEl.value;
  if (!pointerNode) return;

  const folderIndex = randomInt(folders.length);
  const folder = folders[folderIndex];
  if (!folder) return;

  const target = resolveFolderCenter(folderIndex);
  if (!target) {
    scheduleNextCycle();
    return;
  }

  const isDenied = Math.random() < DENIED_PROBABILITY;
  const actorRole = isDenied ? pickRoleExcluding(folder.ownerRole) : folder.ownerRole;
  const entrySide: EntrySide = (["left", "right", "top"][randomInt(3)] as EntrySide) ?? "left";

  pointerRole.value = actorRole;
  selectedFolderIndex.value = -1;
  attemptResult.value = "idle";
  modalPhase.value = "hidden";
  pointerVisible.value = true;

  const start = resolveEntryPoint(entrySide, target.x, target.y);
  const exit = resolveExitPoint(entrySide, target.x, target.y);

  cycleTimeline?.kill();
  cycleTimeline = gsap.timeline({
    defaults: { overwrite: "auto" },
    onComplete: () => {
      pointerVisible.value = false;
      resetVisualState();
      scheduleNextCycle();
    }
  });

  cycleTimeline
    .set(pointerNode, {
      opacity: 1,
      x: start.x,
      y: start.y,
      rotate: -2,
      scale: 0.985
    })
    .to(pointerNode, {
      duration: 0.82,
      x: target.x + 10,
      y: target.y + 8,
      rotate: 0.6,
      ease: "power2.out"
    })
    .to(pointerNode, {
      duration: 0.38,
      x: target.x,
      y: target.y,
      rotate: 0,
      ease: "power1.out"
    })
    .to(pointerNode, {
      duration: 0.1,
      x: target.x + 1,
      y: target.y + 1,
      scale: 0.94,
      ease: "power2.out",
      onStart: () => {
        selectedFolderIndex.value = folderIndex;
        attemptResult.value = "idle";
        modalPhase.value = "checking";
        clearModalTransitionTimeout();
        modalTransitionTimeoutId = window.setTimeout(() => {
          attemptResult.value = isDenied ? "denied" : "allowed";
          modalPhase.value = isDenied ? "denied" : "allowed";
          modalTransitionTimeoutId = null;
        }, CHECKING_PHASE_MS);
      }
    })
    .to(pointerNode, {
      duration: 0.18,
      x: target.x,
      y: target.y,
      scale: 1,
      ease: "power2.inOut"
    })
    .to(pointerNode, {
      duration: (CHECKING_PHASE_MS + RESULT_PHASE_MS) / 1000,
      x: target.x + (Math.random() < 0.5 ? -6 : 6),
      y: target.y + (Math.random() < 0.5 ? -4 : 4),
      rotate: isDenied ? -0.35 : 0.2,
      ease: "power1.inOut"
    })
    .to(pointerNode, {
      onStart: () => {
        modalPhase.value = "hidden";
      },
      duration: 0.9,
      x: exit.x,
      y: exit.y,
      rotate: 0,
      scale: 0.985,
      ease: "power2.in"
    });
}

onBeforeUnmount(() => {
  stopCycle();
});
</script>

<template>
  <article class="problem-visual problem-visual--visibility surface-pastel" :class="{ 'is-active': active }">
    <div ref="explorerRootEl" class="problem-visibility-explorer" :class="{ 'problem-visibility-explorer--entered': introEntered }">
      <header class="problem-visibility-explorer__topbar">
        <div class="problem-visibility-explorer__app-meta">
          <p class="problem-visibility-explorer__title">{{ copy.title }}</p>
          <p class="problem-visibility-explorer__subtitle">{{ copy.subtitle }}</p>
        </div>
        <div class="problem-visibility-explorer__window-actions" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <div class="problem-visibility-explorer__body">
        <aside class="problem-visibility-explorer__sidebar">
          <p class="problem-visibility-explorer__sidebar-title">{{ copy.sidebarTitle }}</p>
          <ul class="problem-visibility-explorer__sidebar-list">
            <li v-for="item in copy.sidebarItems" :key="item" class="problem-visibility-explorer__sidebar-item">{{ item }}</li>
          </ul>
        </aside>

        <section class="problem-visibility-explorer__main">
          <div class="problem-visibility-explorer__pathbar">
            <span class="problem-visibility-explorer__path">{{ copy.currentPath }}</span>
            <span class="problem-visibility-explorer__path-icon" aria-hidden="true">Go</span>
          </div>

          <ul class="problem-visibility-explorer__folders">
            <li
              v-for="(folder, index) in folders"
              :key="folder.key"
              :ref="(el) => setFolderRef(el, index)"
              class="problem-visibility-explorer__folder"
              :class="[
                `problem-visibility-explorer__folder--${folder.key}`,
                selectedFolderIndex === index && 'problem-visibility-explorer__folder--active',
                selectedFolderIndex === index && attemptResult === 'allowed' && 'problem-visibility-explorer__folder--allowed',
                selectedFolderIndex === index && attemptResult === 'denied' && 'problem-visibility-explorer__folder--denied'
              ]"
            >
              <div class="problem-visibility-explorer__folder-glyph">
                <DocFileGlyph :type="folder.iconType" />
              </div>
              <p class="problem-visibility-explorer__folder-name">{{ copy.folders[folder.key] }}</p>
              <p class="problem-visibility-explorer__folder-owner">{{ copy.permission[folder.key] }}</p>
              <span
                v-if="selectedFolderIndex === index && attemptResult === 'allowed'"
                class="problem-visibility-explorer__granted-chip"
              >
                {{ copy.grantedText }}
              </span>
            </li>
          </ul>
        </section>
      </div>

      <div ref="pointerWrapEl" class="problem-visibility-explorer__pointer-wrap" aria-hidden="true">
        <div ref="pointerNodeEl" class="problem-visibility-explorer__pointer-node" :class="{ 'problem-visibility-explorer__pointer-node--visible': pointerVisible }">
          <RolePointerTag
            class="problem-visibility-explorer__pointer"
            :role-key="pointerRole"
            :lang="locale ?? 'en'"
            variant="soft"
            size="sm"
            :pointer-rotation="0"
          />
        </div>
      </div>

      <div
        class="problem-visibility-explorer__modal-overlay"
        :class="{ 'problem-visibility-explorer__modal-overlay--visible': isModalVisible }"
      />

      <div
        class="problem-visibility-explorer__denied-modal"
        :class="[
          isModalVisible && 'problem-visibility-explorer__denied-modal--visible',
          modalPhase !== 'hidden' && `problem-visibility-explorer__denied-modal--${modalPhase}`
        ]"
      >
        <p class="problem-visibility-explorer__denied-title">{{ modalTitle }}</p>
        <p class="problem-visibility-explorer__denied-text">{{ modalText }}</p>
        <div v-if="modalPhase === 'checking'" class="problem-visibility-explorer__checking-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  </article>
</template>
