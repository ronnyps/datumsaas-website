<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{
  active?: boolean;
}>();

const wrapEl = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);

// ── Badge state ─────────────────────────────────────────────────────────

type BadgeColor = "blue" | "violet" | "indigo" | "pink";

interface Badge {
  id: number;
  initials: string;
  leadName: string;
  country: string;
  x: number;
  y: number;
  // Local-space 3D position on the globe — used to track rotation each frame
  lx: number; ly: number; lz: number;
  color: BadgeColor;
  entering: boolean;
  leaving: boolean;
}

const badges = ref<Badge[]>([]);
let badgeIdSeq = 0;
// Maps badge id → DOM element for direct position updates (no reactive overhead)
const badgeEls = new Map<number, HTMLElement>();

// ── Three.js state (untyped — dynamic import) ────────────────────────────

let T: any = null;
let renderer: any = null;
let scene: any = null;
let camera: any = null;
let globe: any = null;       // T.Points — particles only
let globeGroup: any = null;  // T.Group — rotates particles + badges together
let rafId: number | null = null;
let isRunning = false;
let lastTime = 0;
let nextBadgeTime = 0;
let resizeObs: ResizeObserver | null = null;

// ── Constants ────────────────────────────────────────────────────────────

const GLOBE_R = 1.0;
const CAM_Z = 2.5;
const ROT_SPEED = 0.0014;
const PARTICLE_COUNT = 18000;
const BADGE_SPAWN_MS = 1400;   // ms between new badge spawns
const MAX_BADGES = 5;          // max simultaneous badges on screen
const BADGE_HOLD_MS = 2800;    // how long badge stays fully visible
const BADGE_FADE_MS = 320;     // CSS fade in / fade out duration

// Brand color palette (channel values from design-tokens)
const PARTICLE_PALETTE: [number, number, number][] = [
  [148, 197, 255], // blue-300  — south
  [0, 146, 255],   // blue-400
  [96, 86, 255],   // indigo
  [112, 58, 255],  // violet   — equator
  [255, 92, 184],  // pink
  [0, 85, 255],    // blue-500 — north
];

const BADGE_COLORS: BadgeColor[] = ["blue", "violet", "indigo", "pink"];

const LEAD_POINTS = [
  { leadName: "Ava Martinez", country: "Mexico" },
  { leadName: "Sofia Rossi", country: "Italy" },
  { leadName: "Jacob Kim", country: "South Korea" },
  { leadName: "Tyler Wilson", country: "United States" },
  { leadName: "Camila Lopez", country: "Colombia" },
  { leadName: "Mateo Perez", country: "Spain" },
  { leadName: "Riley Scott", country: "Canada" },
  { leadName: "Daniel Brown", country: "United Kingdom" },
  { leadName: "Quinn Hall", country: "Australia" },
  { leadName: "Liam Vega", country: "Argentina" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LD";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

// ── World map helpers ─────────────────────────────────────────────────────

function isApproxLand(lat: number, lon: number): boolean {
  // ── Explicit ocean exclusions (checked first) ───────────────
  // Mediterranean Sea
  if (lat > 30 && lat < 46 && lon > -2 && lon < 37 && lat < 42 && lon > 6) {
    if (lat < 40 && lat > 32 && lon > 5 && lon < 35) return false;
  }
  // Black Sea
  if (lat > 41 && lat < 47 && lon > 28 && lon < 42) return false;
  // Caspian Sea
  if (lat > 37 && lat < 48 && lon > 49 && lon < 55) return false;
  // Hudson Bay
  if (lat > 51 && lat < 66 && lon > -95 && lon < -77) return false;
  // Baltic Sea
  if (lat > 54 && lat < 66 && lon > 10 && lon < 30 && lon > 14) {
    if (lat < 60 && lon > 18 && lon < 26) return false;
  }
  // Gulf of Mexico open water (lat < 27 avoids removing the US Gulf coast)
  if (lat > 18 && lat < 27 && lon > -97 && lon < -82) return false;
  // Bay of Bengal
  if (lat > 5 && lat < 23 && lon > 80 && lon < 98 && lat < 20 && lon > 84) return false;

  // ── North America ───────────────────────────────────────────
  if (lat > 50 && lat < 70 && lon > -141 && lon < -52) return true; // Canada
  if (lat > 54 && lat < 72 && lon > -168 && lon < -130) return true; // Alaska

  // Contiguous USA — split by region for accurate country shape
  if (lat > 32 && lat < 49 && lon > -124 && lon < -114) return true; // Pacific coast (WA/OR/CA)
  if (lat > 28 && lat < 49 && lon > -114 && lon < -104) return true; // Southwest/Rockies (NV/UT/CO/AZ/NM)
  if (lat > 36 && lat < 49 && lon > -104 && lon < -95)  return true; // Northern Great Plains (ND/SD/NE/KS)
  if (lat > 28 && lat < 36 && lon > -104 && lon < -93)  return true; // Texas + Oklahoma
  if (lat > 36 && lat < 49 && lon > -95  && lon < -82)  return true; // Midwest + Great Lakes (MN/WI/MI/OH/IN/IL/IA/MO)
  if (lat > 30 && lat < 36 && lon > -93  && lon < -77)  return true; // Deep South (AR/LA/MS/AL/GA/SC)
  if (lat > 35 && lat < 47 && lon > -82  && lon < -66)  return true; // Northeast (PA/NY/NE states)
  if (lat > 24 && lat < 31 && lon > -82  && lon < -79)  return true; // Florida peninsula

  if (lat > 14 && lat < 30 && lon > -118 && lon < -86) return true; // Mexico
  if (lat > 7  && lat < 18 && lon > -92  && lon < -77) return true; // Central America
  if (lat > 60 && lat < 84 && lon > -56  && lon < -17) return true; // Greenland
  if (lat > 10 && lat < 24 && lon > -85  && lon < -60) return true; // Caribbean islands

  // ── South America ───────────────────────────────────────────
  if (lat > 8   && lat < 14  && lon > -76 && lon < -59) return true; // Colombia/Venezuela N
  if (lat > -4  && lat < 8   && lon > -82 && lon < -50) return true; // Colombia/Ecuador/Peru N
  if (lat > -14 && lat < -4  && lon > -78 && lon < -34) return true; // Brazil W/NE
  if (lat > -24 && lat < -14 && lon > -73 && lon < -35) return true; // Brazil C/SE
  if (lat > -38 && lat < -24 && lon > -74 && lon < -48) return true; // S Brazil/Paraguay/Uruguay
  if (lat > -56 && lat < -38 && lon > -76 && lon < -62) return true; // Patagonia + Tierra del Fuego
  if (lat > -38 && lat < -17 && lon > -76 && lon < -68) return true; // Chile/Bolivia

  // ── Europe ──────────────────────────────────────────────────
  if (lat > 36 && lat < 60 && lon > -10 && lon < 20) return true;  // W/C Europe
  if (lat > 54 && lat < 72 && lon > 4   && lon < 30) return true;  // Scandinavia
  if (lat > 63 && lat < 67 && lon > -25 && lon < -12) return true; // Iceland
  if (lat > 50 && lat < 62 && lon > -8  && lon < 2)  return true;  // UK + Ireland
  if (lat > 36 && lat < 48 && lon > 19  && lon < 30) return true;  // Balkans/Greece
  if (lat > 44 && lat < 58 && lon > 22  && lon < 40) return true;  // Eastern Europe/Ukraine
  if (lat > 36 && lat < 43 && lon > 26  && lon < 45) return true;  // Turkey
  if (lat > 50 && lat < 70 && lon > 28  && lon < 62) return true;  // W Russia

  // ── Africa ──────────────────────────────────────────────────
  if (lat > 19 && lat < 38 && lon > -18 && lon < 37) return true;  // North Africa
  if (lat > 4  && lat < 19 && lon > -18 && lon < 40) return true;  // W + C Africa
  if (lat > -5 && lat < 4  && lon > 8   && lon < 42) return true;  // Equatorial Africa
  if (lat > -20 && lat < -5  && lon > 11 && lon < 42) return true; // E/C Africa south
  if (lat > -35 && lat < -20 && lon > 14 && lon < 37) return true; // Southern Africa
  if (lat > -26 && lat < -12 && lon > 43 && lon < 51) return true; // Madagascar
  if (lat > 8  && lat < 24  && lon > 40 && lon < 54) return true;  // Horn of Africa/Yemen

  // ── Middle East ─────────────────────────────────────────────
  if (lat > 12 && lat < 32 && lon > 36 && lon < 60) return true;   // Arabian Peninsula
  if (lat > 31 && lat < 42 && lon > 35 && lon < 48) return true;   // Levant/Iraq
  if (lat > 26 && lat < 40 && lon > 44 && lon < 66) return true;   // Iran

  // ── Asia ────────────────────────────────────────────────────
  if (lat > 8  && lat < 38 && lon > 66 && lon < 98)  return true;  // Indian subcontinent
  if (lat > 18 && lat < 54 && lon > 95 && lon < 135) return true;  // China/SE Asia/Korea
  if (lat > 30 && lat < 46 && lon > 128 && lon < 146) return true; // Japan
  if (lat > 53 && lat < 78 && lon > 60 && lon < 180) return true;  // Siberia
  if (lat > 38 && lat < 55 && lon > 55 && lon < 90)  return true;  // Kazakhstan/C Asia
  if (lat > 10 && lat < 25 && lon > 98 && lon < 110) return true;  // Indochina
  if (lat > -5 && lat < 10 && lon > 100 && lon < 108) return true; // Malay Peninsula
  if (lat > -8 && lat < 6  && lon > 95  && lon < 141) return true; // Indonesia
  if (lat > 5  && lat < 22 && lon > 116 && lon < 127) return true; // Philippines
  if (lat > 40 && lat < 56 && lon > 36  && lon < 56)  return true; // Caucasus/Turkey E

  // ── Australia & Oceania ─────────────────────────────────────
  if (lat > -39 && lat < -14 && lon > 113 && lon < 154) return true; // Australia
  if (lat > -47 && lat < -34 && lon > 166 && lon < 178) return true; // New Zealand
  if (lat > -9  && lat < -1  && lon > 131 && lon < 152) return true; // Papua New Guinea

  return false;
}

function latlonToVec3(lat: number, lon: number, r: number): any {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new T.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// ── Globe construction ───────────────────────────────────────────────────

function buildGlobePoints(): any {
  const positions: number[] = [];
  const colors: number[] = [];

  let placed = 0;
  let tries = 0;

  while (placed < PARTICLE_COUNT && tries < PARTICLE_COUNT * 14) {
    tries++;
    const lat = Math.random() * 180 - 90;
    const lon = Math.random() * 360 - 180;
    const land = isApproxLand(lat, lon);
    // Land: very dense to define country shapes. Ocean: very sparse for sphere depth.
    if (Math.random() > (land ? 0.97 : 0.05)) continue;

    const v = latlonToVec3(lat, lon, GLOBE_R);
    positions.push(v.x, v.y, v.z);

    const t = (lat + 90) / 180;
    const idx = t * (PARTICLE_PALETTE.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, PARTICLE_PALETTE.length - 1);
    const rgb = lerpRgb(PARTICLE_PALETTE[i0]!, PARTICLE_PALETTE[i1]!, idx - i0);

    // Subtle brightness variance per particle
    const jitter = (Math.random() - 0.5) * 18;
    colors.push(
      Math.max(0, Math.min(255, rgb[0] + jitter)) / 255,
      Math.max(0, Math.min(255, rgb[1] + jitter * 0.6)) / 255,
      Math.max(0, Math.min(255, rgb[2] + jitter * 0.5)) / 255,
    );
    placed++;
  }

  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new T.Float32BufferAttribute(colors, 3));

  // ShaderMaterial: depth-based opacity so back-facing particles are dim
  const mat = new T.ShaderMaterial({
    uniforms: {
      uSize:  { value: 0.022 },
      uScale: { value: 1.0 }, // updated after renderer is ready
    },
    vertexShader: /* glsl */`
      attribute vec3 color;
      varying   vec3 vColor;
      varying   float vOpacity;
      uniform   float uSize;
      uniform   float uScale;

      void main() {
        vColor = color;

        // Compute which side of the sphere this particle is on
        vec4  worldPos    = modelMatrix * vec4(position, 1.0);
        vec3  toCamera    = normalize(cameraPosition - worldPos.xyz);
        vec3  worldNormal = normalize((modelMatrix * vec4(normalize(position), 0.0)).xyz);
        float facing      = dot(worldNormal, toCamera); // +1 front, -1 back

        // Smooth ramp: back hemisphere nearly invisible, front hemisphere full
        vOpacity = mix(0.05, 1.0, smoothstep(-0.15, 0.85, facing));

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize    = uSize * (uScale / -mvPosition.z);
        gl_Position     = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */`
      varying vec3  vColor;
      varying float vOpacity;

      void main() {
        // Circular mask with soft anti-aliased edge
        vec2  pc   = gl_PointCoord - vec2(0.5);
        float dist = length(pc);
        if (dist > 0.5) discard;

        float alpha = vOpacity * smoothstep(0.5, 0.28, dist);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite:  false,
  });

  return new T.Points(geo, mat);
}

// ── Random point guaranteed to be on land ────────────────────────────────

function randomLandPoint(): any {
  for (let i = 0; i < 300; i++) {
    const lat = Math.random() * 180 - 90;
    const lon = Math.random() * 360 - 180;
    if (isApproxLand(lat, lon)) return latlonToVec3(lat, lon, GLOBE_R);
  }
  // Fallback: central Europe (always land)
  return latlonToVec3(51, 10, GLOBE_R);
}

// ── Screen projection ─────────────────────────────────────────────────────

function worldToScreen(localPos: any): [number, number] | null {
  if (!camera || !renderer || !globeGroup) return null;
  const p = localPos.clone().applyMatrix4(globeGroup.matrixWorld);
  p.project(camera);
  if (p.z > 1) return null; // behind camera
  const cx = ((p.x + 1) / 2) * 100;
  const cy = ((-p.y + 1) / 2) * 100;
  if (cx < 5 || cx > 95 || cy < 5 || cy > 92) return null;
  return [cx, cy];
}

// ── Badge DOM ref registration (direct style updates bypass Vue reactivity) ──

function registerBadgeEl(id: number, el: Element | null) {
  if (el instanceof HTMLElement) {
    badgeEls.set(id, el);
  } else {
    badgeEls.delete(id);
  }
}

// Update all badge screen positions from their 3D local coords each frame
function syncBadgePositions() {
  for (const badge of badges.value) {
    const el = badgeEls.get(badge.id);
    if (!el) continue;
    const lp = new T.Vector3(badge.lx, badge.ly, badge.lz);
    const screen = worldToScreen(lp);
    if (screen) {
      el.style.left = screen[0] + "%";
      el.style.top  = screen[1] + "%";
    }
  }
}

// ── Badge lifecycle ───────────────────────────────────────────────────────

function spawnBadge() {
  if (badges.value.length >= MAX_BADGES) return;

  const lp = randomLandPoint(); // T.Vector3 in globe local space
  const screen = worldToScreen(lp);
  if (!screen) return; // currently behind globe

  const id = ++badgeIdSeq;
  const leadPoint = LEAD_POINTS[(id - 1) % LEAD_POINTS.length]!;
  const badge: Badge = {
    id,
    initials: getInitials(leadPoint.leadName),
    leadName: leadPoint.leadName,
    country: leadPoint.country,
    x: screen[0],
    y: screen[1],
    lx: lp.x, ly: lp.y, lz: lp.z,
    color:    BADGE_COLORS[(id - 1) % BADGE_COLORS.length]!,
    entering: true,
    leaving:  false,
  };

  badges.value = [...badges.value, badge];

  // Trigger enter transition
  setTimeout(() => {
    const b = badges.value.find((item) => item.id === id);
    if (b) b.entering = false;
  }, 32);

  // Schedule leave
  setTimeout(() => {
    const b = badges.value.find((item) => item.id === id);
    if (!b) return;
    b.leaving = true;
    setTimeout(() => {
      badges.value = badges.value.filter((item) => item.id !== id);
    }, BADGE_FADE_MS + 40);
  }, BADGE_HOLD_MS);
}

// ── Renderer lifecycle ────────────────────────────────────────────────────

async function init() {
  const wrap = wrapEl.value;
  const canvas = canvasEl.value;
  if (!wrap || !canvas) return;

  T = await import("three");

  const w = wrap.clientWidth || 400;
  const h = wrap.clientHeight || 300;

  renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  scene = new T.Scene();

  camera = new T.PerspectiveCamera(52, w / h, 0.1, 100);
  camera.position.z = CAM_Z;

  globe = buildGlobePoints();
  globe.material.uniforms.uScale.value = renderer.getPixelRatio() * h * 0.5;

  globeGroup = new T.Group();
  globeGroup.rotation.y = -0.08; // Americas facing camera on load
  globeGroup.add(globe);
  scene.add(globeGroup);

  resizeObs = new ResizeObserver(() => {
    const w2 = wrap.clientWidth;
    const h2 = wrap.clientHeight;
    if (!w2 || !h2 || !renderer || !camera) return;
    renderer.setSize(w2, h2);
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
    if (globe) globe.material.uniforms.uScale.value = renderer.getPixelRatio() * h2 * 0.5;
  });
  resizeObs.observe(wrap);
}

function startAnimation() {
  if (isRunning || !T || !renderer) return;
  isRunning = true;
  lastTime = performance.now();
  nextBadgeTime = lastTime + 800;

  const loop = (now: number) => {
    if (!isRunning) return;
    rafId = requestAnimationFrame(loop);
    lastTime = now;

    globeGroup.rotation.y += ROT_SPEED;

    // Spawn new badge periodically
    if (props.active && now >= nextBadgeTime) {
      spawnBadge();
      nextBadgeTime = now + BADGE_SPAWN_MS + Math.random() * 400;
    }

    // Keep badge overlays anchored to their land positions as globe rotates
    syncBadgePositions();

    renderer.render(scene, camera);
  };

  rafId = requestAnimationFrame(loop);
}

function stopAnimation() {
  isRunning = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  badges.value = [];
  badgeEls.clear();
}

function dispose() {
  stopAnimation();
  resizeObs?.disconnect();
  resizeObs = null;
  if (globe) {
    globe.geometry.dispose();
    globe.material.dispose();
    globe = null;
  }
  if (globeGroup) {
    scene?.remove(globeGroup);
    globeGroup = null;
  }
  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  await init();
  startAnimation();
});

onBeforeUnmount(dispose);

watch(
  () => props.active,
  (active) => {
    if (!T) return;
    if (!active) {
      badges.value = [];
      badgeEls.clear();
    }
  },
);
</script>

<template>
  <div ref="wrapEl" class="crm-globe">
    <canvas ref="canvasEl" class="crm-globe__canvas" />
    <div class="crm-globe__badges" aria-hidden="true">
      <div
        v-for="badge in badges"
        :key="badge.id"
        :ref="(el) => registerBadgeEl(badge.id, el as Element | null)"
        class="crm-globe__badge"
        :class="[
          `crm-globe__badge--${badge.color}`,
          { 'crm-globe__badge--entering': badge.entering },
          { 'crm-globe__badge--leaving': badge.leaving },
        ]"
        :style="{ left: `${badge.x}%`, top: `${badge.y}%` }"
      >
        <span class="crm-globe__badge-avatar" aria-hidden="true">
          {{ badge.initials }}
        </span>
        <span class="crm-globe__badge-info">
          <span class="crm-globe__badge-name">{{ badge.leadName }}</span>
          <span class="crm-globe__badge-value">{{ badge.country }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
