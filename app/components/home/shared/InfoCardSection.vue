<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

defineProps<{
  sectionId: string;
  sectionClass: string;
  dataAida: string;
  title: string;
  description: string;
  items: { title: string; description: string; videoSrc?: string; videoPoster?: string }[];
  tone?: "default" | "confidence";
}>();
const asset = useAssetPath();

const videoRefs = ref<(HTMLVideoElement | null)[]>([]);

const setVideoRef = (el: Element | null, index: number) => {
  videoRefs.value[index] = (el as HTMLVideoElement | null) ?? null;
};

const pauseAllVideos = () => {
  videoRefs.value.forEach((video) => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  });
};

const playVideoAt = async (index: number) => {
  pauseAllVideos();
  const activeVideo = videoRefs.value[index];
  if (!activeVideo) return;

  try {
    await activeVideo.play();
  }
  catch {
    // Ignore autoplay policy or transient playback errors.
  }
};

onMounted(async () => {
  await nextTick();
  pauseAllVideos();
});
</script>

<template>
  <section :id="sectionId" class="section home-info-section section--dark-guides" :class="sectionClass" :data-aida="dataAida">
    <div class="container home-section__container">
      <HomeSharedSectionIntro :title="title" :description="description" />
      <div class="info-card-grid">
        <article
          v-for="(item, index) in items"
          :key="item.title"
          class="info-card"
          :class="{ 'info-card--confidence': tone === 'confidence' }"
          @mouseenter="playVideoAt(index)"
          @mouseleave="pauseAllVideos"
        >
          <div class="info-card__media" aria-hidden="true">
            <video
              v-if="item.videoSrc"
              :ref="(el) => setVideoRef(el, index)"
              class="info-card__media-video"
              :src="asset(item.videoSrc)"
              :poster="item.videoPoster ? asset(item.videoPoster) : undefined"
              muted
              loop
              playsinline
              preload="metadata"
            />
          </div>
          <h3 class="info-card__title typo-h3-sm">{{ item.title }}</h3>
          <p class="info-card__text typo-p-body-md-muted">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
