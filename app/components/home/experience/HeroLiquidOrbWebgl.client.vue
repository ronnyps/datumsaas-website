<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  AdditiveBlending,
  BackSide,
  Color,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  ShaderMaterial,
  Vector2,
  WebGLRenderer
} from "three";

const props = withDefaults(
  defineProps<{
    progress: number;
  }>(),
  {
    progress: 0
  }
);

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const strokeDasharray = computed(() => {
  const normalized = Math.min(Math.max(props.progress, 0), 1);
  const circumference = 2 * Math.PI * 55;
  return `${circumference * normalized} ${circumference}`;
});

let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let orb: Mesh | null = null;
let glow: Mesh | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let startedAt = 0;

const uniforms = {
  uTime: { value: 0 },
  uProgress: { value: 0 },
  uResolution: { value: new Vector2(1, 1) }
};

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;

  void main() {
    vUv = uv;
    vec3 displaced = position;
    float waveA = sin(position.y * 5.0 + uTime * 1.6) * 0.045;
    float waveB = sin(position.x * 4.0 - uTime * 1.2) * 0.03;
    float waveC = sin((position.z + position.x) * 6.0 + uTime * 0.8) * 0.02;
    float pulse = 0.018 * sin(uTime * 2.4 + uProgress * 6.28318);
    displaced += normal * (waveA + waveB + waveC + pulse);

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;

  vec3 palette(float t) {
    vec3 colorA = vec3(1.00, 0.72, 0.78);
    vec3 colorB = vec3(0.94, 0.45, 0.93);
    vec3 colorC = vec3(0.50, 0.61, 1.00);
    vec3 colorD = vec3(0.43, 0.89, 0.99);
    vec3 colorE = vec3(1.00, 0.80, 0.64);

    vec3 gradient = mix(colorA, colorB, smoothstep(0.0, 0.3, t));
    gradient = mix(gradient, colorC, smoothstep(0.22, 0.58, t));
    gradient = mix(gradient, colorD, smoothstep(0.52, 0.82, t));
    gradient = mix(gradient, colorE, smoothstep(0.72, 1.0, t));
    return gradient;
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.1);

    float swirlA = sin(vUv.y * 9.8 + uTime * 1.9 + vUv.x * 5.0) * 0.2;
    float swirlB = cos(vUv.x * 8.6 - uTime * 1.4 + vUv.y * 4.2) * 0.2;
    float swirlC = sin((vUv.x + vUv.y) * 12.0 + uTime * 0.9) * 0.12;
    float t = clamp(0.5 + swirlA + swirlB + swirlC, 0.0, 1.0);

    vec3 liquid = palette(t);
    vec3 glass = vec3(0.98, 0.98, 1.0);
    float energy = 0.18 + 0.18 * sin(uTime * 2.0 + uProgress * 6.28318);
    vec3 color = mix(liquid, glass, 0.2 + fresnel * 0.42);
    color += liquid * (energy * 0.45);

    float alpha = 0.92;
    gl_FragColor = vec4(color, alpha);
  }
`;

const glowVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uProgress;
  void main() {
    float fresnel = pow(1.0 - abs(vNormal.z), 2.2);
    float pulse = 0.55 + 0.45 * sin(uTime * 2.2 + uProgress * 6.28318);
    vec3 glow = mix(vec3(0.47, 0.35, 1.0), vec3(0.28, 0.81, 1.0), 0.5 + 0.5 * sin(uTime * 0.7));
    gl_FragColor = vec4(glow, fresnel * 0.42 * pulse);
  }
`;

const resize = () => {
  if (!rootRef.value || !renderer || !camera) return;
  const rect = rootRef.value.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  uniforms.uResolution.value.set(width, height);
};

const animate = () => {
  if (!renderer || !scene || !camera || !orb || !glow) return;
  const now = performance.now() * 0.001;
  if (!startedAt) startedAt = now;
  const elapsed = now - startedAt;

  uniforms.uTime.value = elapsed;
  orb.rotation.y = elapsed * 0.42;
  orb.rotation.x = Math.sin(elapsed * 0.6) * 0.16;
  orb.position.y = Math.sin(elapsed * 1.1) * 0.04;

  glow.rotation.y = -elapsed * 0.3;
  glow.rotation.x = Math.cos(elapsed * 0.5) * 0.11;

  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
};

onMounted(() => {
  if (!canvasRef.value || !rootRef.value) return;

  scene = new Scene();
  scene.background = null;

  camera = new PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 0, 3.25);

  renderer = new WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(new Color(0x000000), 0);

  const geometry = new IcosahedronGeometry(1, 48);
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true
  });

  const glowMaterial = new ShaderMaterial({
    uniforms,
    vertexShader: glowVertexShader,
    fragmentShader: glowFragmentShader,
    transparent: true,
    blending: AdditiveBlending,
    side: BackSide,
    depthWrite: false
  });

  orb = new Mesh(geometry, material);
  glow = new Mesh(geometry, glowMaterial);
  glow.scale.setScalar(1.18);
  scene.add(orb);
  scene.add(glow);

  resize();
  resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(rootRef.value);
  frameId = requestAnimationFrame(animate);
});

watch(
  () => props.progress,
  (next) => {
    uniforms.uProgress.value = Math.min(Math.max(next, 0), 1);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId);
  if (resizeObserver) resizeObserver.disconnect();
  if (scene) {
    scene.clear();
  }
  if (orb) {
    const material = orb.material as ShaderMaterial;
    orb.geometry.dispose();
    material.dispose();
  }
  if (glow) {
    const material = glow.material as ShaderMaterial;
    material.dispose();
  }
  if (renderer) renderer.dispose();
});
</script>

<template>
  <div ref="rootRef" class="hero-liquid-orb" aria-hidden="true">
    <canvas ref="canvasRef" class="hero-liquid-orb__canvas"></canvas>
    <svg viewBox="0 0 140 140" class="hero-liquid-orb__progress">
      <circle cx="70" cy="70" r="55" class="hero-liquid-orb__progress-track" />
      <circle
        cx="70"
        cy="70"
        r="55"
        class="hero-liquid-orb__progress-value"
        :stroke-dasharray="strokeDasharray"
      />
    </svg>
    <span class="hero-liquid-orb__rim"></span>
    <span class="hero-liquid-orb__shadow"></span>
  </div>
</template>
