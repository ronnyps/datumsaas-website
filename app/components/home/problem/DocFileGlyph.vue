<script setup lang="ts">
defineProps<{
  type: "pdf" | "doc" | "xls" | "ppt" | "txt" | "csv" | "zip" | "json";
}>();
</script>

<template>
  <span class="doc-file-glyph" aria-hidden="true">
    <svg class="doc-file-glyph__svg" viewBox="0 0 252 144" role="presentation">
      <rect class="doc-file-glyph__back" x="47" y="-4" width="158" height="96" rx="15" />
      <rect class="doc-file-glyph__inner-cover" x="47" y="-24" width="158" height="106" rx="18" />

      <rect class="doc-file-glyph__sheet doc-file-glyph__sheet--a" x="77" y="0" width="96" height="90" rx="6" />
      <rect class="doc-file-glyph__sheet doc-file-glyph__sheet--b" x="85" y="8" width="90" height="84" rx="6" />
      <rect class="doc-file-glyph__line" x="97" y="20" width="52" height="5" rx="2.5" />
      <rect class="doc-file-glyph__line" x="97" y="31" width="44" height="5" rx="2.5" />
      <rect class="doc-file-glyph__line" x="97" y="42" width="36" height="5" rx="2.5" />

      <path
        class="doc-file-glyph__front"
        d="M194.88,129.53H59.75c-6.58,0-12.08-5.01-12.68-11.57l-8.32-90.53c-.69-7.46,5.19-13.9,12.68-13.9h46.12c2.62,0,5.05,1.37,6.41,3.6l5.96,9.79c1.01,1.65,2.8,2.66,4.74,2.66h86.26c7.44,0,13.29,6.35,12.69,13.76l-6.04,74.48c-.54,6.61-6.06,11.7-12.69,11.7Z"
      />
    </svg>
  </span>
</template>
