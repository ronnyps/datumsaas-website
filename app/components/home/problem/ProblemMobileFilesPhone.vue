<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { gsap } from "gsap";
import DocFileGlyph from "~/components/home/problem/DocFileGlyph.vue";
import RolePointerTag from "~/components/shared/RolePointerTag.vue";
import ProblemFileOptionsDropdown from "~/components/home/problem/ProblemFileOptionsDropdown.vue";
import ProblemFileSentModal from "~/components/home/problem/ProblemFileSentModal.vue";

type DocFileType = "pdf" | "doc" | "xls" | "ppt";
type OpenItemType = "folder" | "pdf" | "doc" | "xls";

type OpenItem = {
  type: OpenItemType;
  name: string;
  date: string;
  time: string;
};

const props = defineProps<{
  locale?: "en" | "es";
}>();
const asset = useAssetPath();

const rootEl = ref<HTMLElement | null>(null);
const pointerWrapEl = ref<HTMLElement | null>(null);
const pointerNodeEl = ref<HTMLElement | null>(null);
const backButtonEl = ref<HTMLElement | null>(null);
const folderEls = ref<HTMLElement[]>([]);
const openDotsEls = ref<HTMLElement[]>([]);

const hasEntered = ref(false);
const pointerVisible = ref(false);
const isFolderOpen = ref(false);
const clickedFolderIndex = ref(-1);
const activeFolderIndex = ref(0);
const activeDropdownRowIndex = ref(-1);
const dropdownVisible = ref(false);
const sendModalVisible = ref(false);
const sendModalPhase = ref<"loading" | "success">("loading");

let entryTimeoutId: number | null = null;
let openDotsTimeoutId: number | null = null;
let pointerTimeline: gsap.core.Timeline | null = null;
let sendModalPhaseTimeoutId: number | null = null;
let sendModalCloseTimeoutId: number | null = null;
let modalParkingTimeoutId: number | null = null;
let postSendActionTimeoutId: number | null = null;
let restartFlowTimeoutId: number | null = null;
let hasStarted = false;
const OPEN_VIEW_SETTLE_MS = 620;
const CLOSE_VIEW_SETTLE_MS = 680;
const SEND_LOADING_MS = 1300;
const SEND_SUCCESS_MS = 2400;
const POST_SEND_NEXT_ACTION_DELAY_MS = 360;

function setFolderRef(el: Element | null, index: number) {
  if (!(el instanceof HTMLElement)) {
    folderEls.value[index] = undefined as unknown as HTMLElement;
    return;
  }
  folderEls.value[index] = el;
}

function setOpenDotsRef(el: Element | null, index: number) {
  if (!(el instanceof HTMLElement)) {
    openDotsEls.value[index] = undefined as unknown as HTMLElement;
    return;
  }
  openDotsEls.value[index] = el;
}

function setBackButtonRef(el: Element | null) {
  if (!(el instanceof HTMLElement)) {
    backButtonEl.value = null;
    return;
  }
  backButtonEl.value = el;
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function clearRuntime() {
  if (entryTimeoutId !== null) {
    window.clearTimeout(entryTimeoutId);
    entryTimeoutId = null;
  }

  if (openDotsTimeoutId !== null) {
    window.clearTimeout(openDotsTimeoutId);
    openDotsTimeoutId = null;
  }

  if (sendModalPhaseTimeoutId !== null) {
    window.clearTimeout(sendModalPhaseTimeoutId);
    sendModalPhaseTimeoutId = null;
  }

  if (sendModalCloseTimeoutId !== null) {
    window.clearTimeout(sendModalCloseTimeoutId);
    sendModalCloseTimeoutId = null;
  }

  if (modalParkingTimeoutId !== null) {
    window.clearTimeout(modalParkingTimeoutId);
    modalParkingTimeoutId = null;
  }

  if (postSendActionTimeoutId !== null) {
    window.clearTimeout(postSendActionTimeoutId);
    postSendActionTimeoutId = null;
  }

  if (restartFlowTimeoutId !== null) {
    window.clearTimeout(restartFlowTimeoutId);
    restartFlowTimeoutId = null;
  }

  folderEls.value = [];
  openDotsEls.value = [];
  backButtonEl.value = null;

  pointerTimeline?.kill();
  pointerTimeline = null;
}

function pickRandomFolderIndex(total: number): number {
  if (total <= 1) return 0;
  return randomInt(total);
}

function resolveFolderTarget(index: number) {
  const wrap = pointerWrapEl.value;
  const folder = folderEls.value[index];
  if (!wrap || !folder) return null;

  const wrapRect = wrap.getBoundingClientRect();
  const glyph = folder.querySelector<HTMLElement>(".doc-file-glyph");
  const targetRect = (glyph ?? folder).getBoundingClientRect();

  return {
    x: targetRect.left - wrapRect.left + targetRect.width * 0.48,
    y: targetRect.top - wrapRect.top + targetRect.height * 0.44
  };
}

function openFolderView() {
  isFolderOpen.value = true;
}

function resolveOpenDotsTarget(index: number) {
  const wrap = pointerWrapEl.value;
  const dots = openDotsEls.value[index];
  if (!wrap || !dots) return null;

  const wrapRect = wrap.getBoundingClientRect();
  const targetRect = dots.getBoundingClientRect();

  return {
    x: targetRect.left - wrapRect.left + targetRect.width * 0.5,
    y: targetRect.top - wrapRect.top + targetRect.height * 0.5
  };
}

function openOptionsDropdown(index: number) {
  activeDropdownRowIndex.value = index;
  dropdownVisible.value = true;
}

function closeOptionsDropdown() {
  activeDropdownRowIndex.value = -1;
  dropdownVisible.value = false;
}

function closeFolderView() {
  isFolderOpen.value = false;
  clickedFolderIndex.value = -1;
  closeOptionsDropdown();
}

function resolveBackTarget() {
  const wrap = pointerWrapEl.value;
  const backButton = backButtonEl.value;
  if (!wrap || !backButton) return null;

  const wrapRect = wrap.getBoundingClientRect();
  const targetRect = backButton.getBoundingClientRect();

  return {
    x: targetRect.left - wrapRect.left + targetRect.width * 0.5,
    y: targetRect.top - wrapRect.top + targetRect.height * 0.5
  };
}

function resolveSendTarget(index: number) {
  const wrap = pointerWrapEl.value;
  const dots = openDotsEls.value[index];
  if (!wrap || !dots) return null;

  const row = dots.closest(".problem-mobile-files__open-row");
  const sendButton = row?.querySelector<HTMLElement>(".problem-file-options-dropdown__button[data-action='send']");
  if (!sendButton) return null;

  const wrapRect = wrap.getBoundingClientRect();
  const targetRect = sendButton.getBoundingClientRect();

  return {
    x: targetRect.left - wrapRect.left + targetRect.width * 0.5,
    y: targetRect.top - wrapRect.top + targetRect.height * 0.5
  };
}

function resolveModalParkingTarget() {
  const wrap = pointerWrapEl.value;
  const root = rootEl.value;
  if (!wrap || !root) return null;

  const modalCard = root.querySelector<HTMLElement>(".problem-file-sent-modal__card");
  if (!modalCard) return null;

  const wrapRect = wrap.getBoundingClientRect();
  const cardRect = modalCard.getBoundingClientRect();

  return {
    x: cardRect.left - wrapRect.left + cardRect.width * 0.72,
    y: cardRect.top - wrapRect.top + cardRect.height + 36
  };
}

function parkPointerUnderModal() {
  const pointerNode = pointerNodeEl.value;
  const target = resolveModalParkingTarget();
  if (!pointerNode || !target) return;

  gsap.to(pointerNode, {
    duration: 0.38,
    x: target.x,
    y: target.y,
    rotate: 0,
    scale: 1,
    ease: "power2.out",
    overwrite: "auto"
  });
}

function pickPostSendAction(): "send" | "back" {
  return randomInt(2) === 0 ? "send" : "back";
}

function runBackAndRestartSequence() {
  const pointerNode = pointerNodeEl.value;
  const target = resolveBackTarget();
  if (!pointerNode || !target) return;

  gsap.timeline({ defaults: { overwrite: "auto" } })
    .to(pointerNode, {
      duration: 0.52,
      x: target.x + 7,
      y: target.y + 5,
      rotate: 0.3,
      ease: "power2.inOut"
    })
    .to(pointerNode, {
      duration: 0.16,
      x: target.x,
      y: target.y,
      rotate: 0,
      ease: "power1.out"
    })
    .to(pointerNode, {
      duration: 0.09,
      x: target.x + 1,
      y: target.y + 1,
      scale: 0.94,
      ease: "power2.out",
      onStart: () => {
        closeFolderView();
      }
    })
    .to(pointerNode, {
      duration: 0.13,
      x: target.x,
      y: target.y,
      scale: 1,
      ease: "power2.inOut"
    })
    .add(() => {
      restartFlowTimeoutId = window.setTimeout(() => {
        runPointerSequence();
      }, CLOSE_VIEW_SETTLE_MS);
    });
}

function showSendModal() {
  closeOptionsDropdown();
  sendModalPhase.value = "loading";
  sendModalVisible.value = true;

  if (sendModalPhaseTimeoutId !== null) {
    window.clearTimeout(sendModalPhaseTimeoutId);
  }
  if (sendModalCloseTimeoutId !== null) {
    window.clearTimeout(sendModalCloseTimeoutId);
  }
  if (modalParkingTimeoutId !== null) {
    window.clearTimeout(modalParkingTimeoutId);
  }
  if (postSendActionTimeoutId !== null) {
    window.clearTimeout(postSendActionTimeoutId);
  }
  if (restartFlowTimeoutId !== null) {
    window.clearTimeout(restartFlowTimeoutId);
  }

  sendModalPhaseTimeoutId = window.setTimeout(() => {
    sendModalPhase.value = "success";
  }, SEND_LOADING_MS);

  modalParkingTimeoutId = window.setTimeout(() => {
    nextTick(() => {
      parkPointerUnderModal();
    });
  }, 160);

  sendModalCloseTimeoutId = window.setTimeout(() => {
    sendModalVisible.value = false;
    closeOptionsDropdown();

    postSendActionTimeoutId = window.setTimeout(() => {
      const nextAction = pickPostSendAction();
      if (nextAction === "send") {
        runOpenDotsSequence();
        return;
      }
      runBackAndRestartSequence();
    }, POST_SEND_NEXT_ACTION_DELAY_MS);
  }, SEND_LOADING_MS + SEND_SUCCESS_MS);
}

function handleFileAction(action: "rename" | "send" | "delete") {
  if (action !== "send") return;
  showSendModal();
}

function runOpenDotsSequence() {
  const pointerNode = pointerNodeEl.value;
  const rowCount = visibleOpenItems.value.length;
  if (!pointerNode || rowCount === 0) return;

  const activeRow = randomInt(rowCount);
  const target = resolveOpenDotsTarget(activeRow);
  if (!target) return;

  closeOptionsDropdown();

  const openDotsTimeline = gsap.timeline({
    defaults: { overwrite: "auto" }
  });

  openDotsTimeline
    .to(pointerNode, {
      duration: 0.66,
      x: target.x + 8,
      y: target.y + 8,
      rotate: 0.35,
      ease: "power2.inOut"
    })
    .to(pointerNode, {
      duration: 0.22,
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
        openOptionsDropdown(activeRow);
      }
    })
    .to(pointerNode, {
      duration: 0.14,
      x: target.x,
      y: target.y,
      scale: 1,
      ease: "power2.inOut"
    })
    .add(() => {
      nextTick(() => {
        const sendTarget = resolveSendTarget(activeRow);
        if (!sendTarget) return;

        gsap.timeline({ defaults: { overwrite: "auto" } })
          .to(pointerNode, {
            duration: 0.36,
            x: sendTarget.x,
            y: sendTarget.y,
            rotate: -0.2,
            ease: "power2.inOut"
          })
          .to(pointerNode, {
            duration: 0.09,
            x: sendTarget.x + 1,
            y: sendTarget.y + 1,
            scale: 0.94,
            ease: "power2.out",
            onStart: () => {
              handleFileAction("send");
            }
          })
          .to(pointerNode, {
            duration: 0.14,
            x: sendTarget.x,
            y: sendTarget.y,
            scale: 1,
            ease: "power2.inOut"
          });
      });
    });
}

function runPointerSequence() {
  if (prefersReducedMotion.value) {
    activeFolderIndex.value = 0;
    clickedFolderIndex.value = 0;
    isFolderOpen.value = true;
    openOptionsDropdown(0);
    return;
  }

  const folderCount = copy.value.folders.length;
  activeFolderIndex.value = pickRandomFolderIndex(folderCount);

  nextTick(() => {
    const pointerNode = pointerNodeEl.value;
    const target = resolveFolderTarget(activeFolderIndex.value);
    if (!pointerNode || !target) return;

    pointerVisible.value = true;
    clickedFolderIndex.value = -1;

    const startX = -140;
    const startY = target.y + (Math.random() < 0.5 ? -42 : 52);

    pointerTimeline?.kill();
    pointerTimeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        openFolderView();
        openDotsTimeoutId = window.setTimeout(() => {
          nextTick(() => {
            runOpenDotsSequence();
          });
        }, OPEN_VIEW_SETTLE_MS);
      }
    });

    pointerTimeline
      .set(pointerNode, {
        opacity: 1,
        x: startX,
        y: startY,
        rotate: -2,
        scale: 0.985
      })
      .to(pointerNode, {
        duration: 0.86,
        x: target.x + 8,
        y: target.y + 6,
        rotate: 0.45,
        scale: 1,
        ease: "power2.out"
      })
      .to(pointerNode, {
        duration: 0.44,
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
          clickedFolderIndex.value = activeFolderIndex.value;
        }
      })
      .to(pointerNode, {
        duration: 0.14,
        x: target.x,
        y: target.y,
        scale: 1,
        ease: "power2.inOut"
      });
  });
}

const { prefersReducedMotion } = useViewportAnimationGate({
  target: rootEl,
  threshold: 0.34,
  rootMargin: "0px 0px -8% 0px",
  onStart: () => {
    if (hasStarted) return;
    hasStarted = true;
    hasEntered.value = true;
    entryTimeoutId = window.setTimeout(() => {
      runPointerSequence();
    }, 980);
  },
  onStop: () => {},
  onReducedMotion: () => {
    if (hasStarted) return;
    hasStarted = true;
    hasEntered.value = true;
    entryTimeoutId = window.setTimeout(() => {
      runPointerSequence();
    }, 980);
  }
});

onBeforeUnmount(() => {
  clearRuntime();
});

const copy = computed(() => {
  if (props.locale === "es") {
    return {
      title: "Mis Archivos",
      subtitle: "Archivo personal en linea",
      search: "Buscar",
      tabs: ["Trabajo", "Vida diaria", "Estudio"],
      folders: [
        { type: "pdf" as DocFileType, label: "Proyecto largo" },
        { type: "doc" as DocFileType, label: "Proyecto diario" },
        { type: "xls" as DocFileType, label: "Proyecto importante" },
        { type: "ppt" as DocFileType, label: "Proyecto especial" }
      ],
      open: {
        title: "Mis trabajos",
        items: [
          { type: "folder" as OpenItemType, name: "Nuevo documento", date: "2026-04-23", time: "10:21" },
          { type: "pdf" as OpenItemType, name: "Notas de reunion.pdf", date: "2026-04-23", time: "10:24" },
          { type: "doc" as OpenItemType, name: "Brief producto.doc", date: "2026-04-23", time: "10:29" }
        ] as OpenItem[]
      }
    };
  }

  return {
    title: "My Files",
    subtitle: "Personal online file",
    search: "Search",
    tabs: ["Work", "Daily life", "Study"],
    folders: [
      { type: "pdf" as DocFileType, label: "Longtime project" },
      { type: "doc" as DocFileType, label: "Daily project" },
      { type: "xls" as DocFileType, label: "Important project" },
      { type: "ppt" as DocFileType, label: "Special project" }
    ],
    open: {
      title: "My works",
      items: [
        { type: "folder" as OpenItemType, name: "New Document", date: "2026-04-23", time: "10:21" },
        { type: "pdf" as OpenItemType, name: "Meeting notes.pdf", date: "2026-04-23", time: "10:24" },
        { type: "doc" as OpenItemType, name: "Product brief.doc", date: "2026-04-23", time: "10:29" }
      ] as OpenItem[]
    }
  };
});

const pointerLocale = computed(() => props.locale ?? "en");
const fileOptionsAriaLabel = computed(() => (props.locale === "es" ? "Opciones de archivo" : "File options"));
const visibleOpenItems = computed(() => copy.value.open.items);
</script>

<template>
  <section
    ref="rootEl"
    class="problem-mobile-files"
    :class="{ 'problem-mobile-files--active': hasEntered }"
    aria-label="Mobile files preview"
  >
    <div class="problem-mobile-files__phone">
      <header class="problem-mobile-files__header">
        <div class="problem-mobile-files__header-text">
          <h3 class="problem-mobile-files__title">{{ copy.title }}</h3>
          <p class="problem-mobile-files__subtitle">{{ copy.subtitle }}</p>
        </div>
        <img class="problem-mobile-files__avatar" :src="asset('/avatarCEO.webp')" alt="CEO avatar" />
      </header>

      <div class="problem-mobile-files__search">
        <span class="problem-mobile-files__search-icon" />
        <span class="problem-mobile-files__search-text">{{ copy.search }}</span>
      </div>

      <div class="problem-mobile-files__body" :class="{ 'problem-mobile-files__body--open': isFolderOpen }">
        <div class="problem-mobile-files__grid-view" :class="{ 'problem-mobile-files__grid-view--hidden': isFolderOpen }">
          <nav class="problem-mobile-files__tabs" aria-label="Files categories">
            <span class="problem-mobile-files__tab problem-mobile-files__tab--active">{{ copy.tabs[0] }}</span>
            <span class="problem-mobile-files__tab">{{ copy.tabs[1] }}</span>
            <span class="problem-mobile-files__tab">{{ copy.tabs[2] }}</span>
          </nav>

          <ul class="problem-mobile-files__grid">
            <li
              v-for="(folder, index) in copy.folders"
              :key="folder.type"
              :ref="(el) => setFolderRef(el, index)"
              class="problem-mobile-files__item"
              :class="[
                `problem-mobile-files__item--${folder.type}`,
                index === clickedFolderIndex && 'problem-mobile-files__item--clicked'
              ]"
            >
              <DocFileGlyph :type="folder.type" />
              <p class="problem-mobile-files__label">
                <span class="problem-mobile-files__dot" />
                {{ folder.label }}
              </p>
            </li>
          </ul>
        </div>

        <div class="problem-mobile-files__open-view" :class="{ 'problem-mobile-files__open-view--active': isFolderOpen }">
          <header class="problem-mobile-files__open-header">
            <button
              type="button"
              :ref="setBackButtonRef"
              class="problem-mobile-files__open-icon problem-mobile-files__open-back"
              aria-label="Back"
              @click="closeFolderView"
            >
              ‹
            </button>
            <h4 class="problem-mobile-files__open-title">{{ copy.open.title }}</h4>
            <span class="problem-mobile-files__open-icon" aria-hidden="true">≡</span>
          </header>

          <ul class="problem-mobile-files__open-list">
            <li v-for="(item, index) in visibleOpenItems" :key="item.name" class="problem-mobile-files__open-row">
              <span class="problem-mobile-files__doc-icon" :class="`problem-mobile-files__doc-icon--${item.type}`" />
              <div class="problem-mobile-files__open-meta">
                <p class="problem-mobile-files__open-name">{{ item.name }}</p>
                <p class="problem-mobile-files__open-date">{{ item.date }}<span>{{ item.time }}</span></p>
              </div>
              <button
                type="button"
                :ref="(el) => setOpenDotsRef(el, index)"
                class="problem-mobile-files__open-dots"
                :aria-label="fileOptionsAriaLabel"
                @click="openOptionsDropdown(index)"
              >
                ⋮
              </button>

              <ProblemFileOptionsDropdown
                :visible="dropdownVisible && activeDropdownRowIndex === index"
                :locale="pointerLocale"
                :aria-label="fileOptionsAriaLabel"
                @action="handleFileAction"
              />
            </li>
          </ul>
        </div>
      </div>

      <ProblemFileSentModal :visible="sendModalVisible" :locale="pointerLocale" :phase="sendModalPhase" />

    </div>

    <div
      ref="pointerWrapEl"
      class="problem-mobile-files__pointer-wrap"
      :class="{ 'problem-mobile-files__pointer-wrap--under-modal': sendModalVisible }"
      aria-hidden="true"
    >
      <div ref="pointerNodeEl" class="problem-mobile-files__pointer-node" :class="{ 'problem-mobile-files__pointer-node--visible': pointerVisible }">
        <RolePointerTag
          class="problem-mobile-files__pointer"
          role-key="ceo"
          :lang="pointerLocale"
          variant="soft"
          size="sm"
          :pointer-rotation="0"
        />
      </div>
    </div>
  </section>
</template>
