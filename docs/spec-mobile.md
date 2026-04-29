# Spec Mobile — DatumSaaS Website

Guía operativa para llevar la web actual a una experiencia mobile optimizada, **priorizando estilos globales sobre microestilos por componente**. Cada tarea indica el archivo donde trabajar, el porqué, y los criterios de aceptación.

---

## 0. Filosofía y reglas de oro

### Regla #1 — Global primero, componente después

Antes de tocar una hoja de estilos de componente (`app/assets/css/components/*.css`), preguntarse:

1. ¿Esto se repite en >1 sección? → Va en `app/assets/css/main.css` o `app/assets/design-tokens.css` o `app/assets/css/ui-app-views.css`.
2. ¿Es un comportamiento condicional por viewport (oculto/visible/redistribuido)? → Va como **utility global** en `main.css`.
3. ¿Es un valor (espacio, radio, color, opacidad, blur)? → Va como **token** en `design-tokens.css`.
4. ¿Solo es microajuste único de ese componente? → Recién ahí entra a la hoja del componente.

### Regla #2 — Una sola fuente de verdad para breakpoints

Hoy conviven `60em`, `980px`, `760px`, `1100px`, `80em`. Vamos a unificar en **3 puntos canónicos** declarados como tokens y referenciados con `@media (width <= var(--bp-md))` (o reescritos a esos px exactos).

| Token        | Valor   | Uso                           |
| ------------ | ------- | ----------------------------- |
| `--bp-sm`    | `40em`  | Phone pequeño / portrait      |
| `--bp-md`    | `60em`  | Phone grande / tablet portrait|
| `--bp-lg`    | `80em`  | Tablet landscape / desktop    |

> Nota: las CSS Media Queries no aceptan `var()` directamente todavía en todos los navegadores; **usaremos los valores en píxeles equivalentes (640/960/1280)** y dejamos los tokens documentados aquí como referencia de equivalencia.

### Regla #3 — Mobile-first en lo que se modifique nuevo

Todo nuevo CSS escrito para esta migración nace en mobile y crece con `@media (min-width: ...)`. No tocamos los archivos viejos para invertirlos — solo **eliminamos overrides redundantes** cuando se globaliza una utilidad.

### Regla #4 — Touch != hover

Cualquier interacción que dependa de `:hover` se duplica con activación táctil (clic, intersección de viewport, o `:focus-visible`). Esto se resuelve **en composables, no en CSS**.

---

## 1. Mapa de archivos y dónde trabajar

| Archivo                                                                 | Qué vive aquí (después de esta migración)                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `app/assets/design-tokens.css`                                          | **Tokens nuevos**: breakpoints, blur móvil, safe-area, alturas mínimas táctiles.         |
| `app/assets/css/main.css`                                               | **Reset, utilidades, layout `.home`, `.section`, `.container`, tipografía global, media queries globales por breakpoint.** Es el archivo principal de esta migración. |
| `app/assets/css/ui-app-views.css`                                       | Tokens de tablas/badges internos. Solo se toca si algo de esto se usa en >1 sitio.       |
| `app/assets/css/components/*.css`                                       | **Solo microajustes finales del visual de ese componente.** No agregar nuevas reglas globales aquí. |
| `app/composables/useHoverActivation.ts`                                 | Lógica `hover ↔ viewport`. Cambio único que afecta a 5 visuales de Services.             |
| `app/composables/useProblemScrollScene.client.ts`                       | Refinar modos `pinned/compact/reduced` con los nuevos breakpoints.                       |
| `app/components/layout/SiteHeader.vue` + `site-header.css`              | Drawer/menú mobile (componente nuevo).                                                   |
| `app/components/home/FlowSection.vue` + `flow-section.css`              | Modo stepper mobile.                                                                     |
| `nuxt.config.ts` / plugin de Lenis                                      | Desactivar smooth scroll en `pointer: coarse`.                                           |

> ⚠️ Cuando una tarea diga "agregar regla global" y exista una equivalente repetida en CSS de componente, **hay que borrarla del componente** en el mismo cambio.

---

## 2. Fase 0 — Cimientos globales (obligatoria, primero)

**Archivos a tocar:** `app/assets/design-tokens.css`, `app/assets/css/main.css`.

### 2.1 Tokens de mobile (en `design-tokens.css`)

Agregar a `:root`:

- `--bp-sm: 640px;` `--bp-md: 960px;` `--bp-lg: 1280px;` (documentales).
- `--mobile-blur: 6px;` (vs `18px` desktop). Variable que se sobrescribe dentro de un `@media (max-width: 960px)` global.
- `--tap-target-min: 2.75rem;` (44px). Se usa en CTAs reales, no en visuales decorativos.
- `--safe-area-bottom: env(safe-area-inset-bottom, 0px);`
- `--safe-area-top: env(safe-area-inset-top, 0px);`

### 2.2 Reset y utilidades globales (en `main.css`)

- `body` y `html`: `overflow-x: clip;` (hoy solo está en `.home`).
- `body`: `-webkit-tap-highlight-color: transparent;` y `text-size-adjust: 100%;`.
- Añadir clase utilitaria `.touch-target` que aplica `min-height: var(--tap-target-min); min-width: var(--tap-target-min);` para reusar en CTAs.
- Añadir media `@media (hover: none) and (pointer: coarse)` global donde se desactiven:
  - `.home__dots-hover` (la máscara que sigue al puntero — inútil en touch).
  - cualquier `:hover { transform: translateY(-1px) }` (los `transform` de hover de header/btns no aplican en touch y solo agregan estilos sin disparo).
- Añadir media `@media (max-width: 960px)` global donde se reduzca:
  - `--mobile-blur` (token redefinido).
  - `--surface-padding-panel`, `--surface-padding-card` con `clamp` ya están — verificar que el límite inferior siga sirviendo.
  - Animaciones costosas: `.surface-pastel` y `.surface-pastel::before` → `animation: none` salvo que `prefers-reduced-motion: no-preference` y `(min-resolution: 2dppx)`.

### 2.3 Tipografía mobile (en `main.css`, dentro del `@media (max-width: 60em)` ya existente)

- Subir `typo-p-hero-subtitle` a `1.05rem` con `line-height: 1.55`.
- Subir `typo-p-micro-muted` a `0.92rem`.
- Reducir `letter-spacing` de `typo-h1-display` a `-0.02em` cuando `font-size < 2.5rem`.
- Garantizar `text-wrap: pretty` en párrafos largos.

### 2.4 Safe-area (en `main.css`)

- `.site-header { padding-top: max(var(--space-3), var(--safe-area-top)); }`
- `.footer__inner { padding-bottom: max(var(--space-6), var(--safe-area-bottom)); }`

### Criterios de aceptación Fase 0

- No se agregaron reglas nuevas en `app/assets/css/components/*.css`.
- `grep` por `980px`, `760px`, `1100px` y `80em` muestra rutas para deprecar (lista cerrada al final del PR).
- Lighthouse mobile en hero ≥ 92 en performance.

---

## 3. Fase 1 — Navegación mobile (P0)

**Archivos a tocar:** `app/components/layout/SiteHeader.vue`, `app/assets/css/components/site-header.css` (mínimo necesario), `main.css` (utilidad de drawer reusable).

### 3.1 Drawer reusable

Como puede repetirse a futuro (FAQ, Inventory modal mobile), las **estructuras del overlay/sheet/backdrop van en `main.css`** como utilities:

- `.ui-sheet` (panel deslizante desde la derecha).
- `.ui-sheet__backdrop` (`position: fixed; inset: 0; background: ...; backdrop-filter: blur(var(--mobile-blur));`).
- `.ui-sheet__panel` (`position: fixed; top: 0; right: 0; height: 100dvh; width: min(86vw, 22rem);`).
- Animaciones de entrada/salida con clases `.ui-sheet--open` y `prefers-reduced-motion: reduce` cubierto.

### 3.2 Botón hamburguesa en `SiteHeader.vue`

- Visible solo en `<60em` (ya hay regla; usar la misma).
- `aria-controls`, `aria-expanded`, foco bloqueado dentro del sheet, cierre con Esc / tap en backdrop / swipe horizontal (opcional).
- Contenido: links de `Services / Flow / Why us / FAQ / Contact`, selector de idioma, CTAs.

### 3.3 Microajustes en `site-header.css`

Solo lo imprescindible: ocultar nav desktop (ya existe), mostrar botón hamburguesa, alinear con `--tap-target-min`.

### Criterios de aceptación Fase 1

- En 360×640 puedo abrir el menú, navegar a cada sección por anchor, cerrar con tap fuera y con Esc.
- Lectura por VoiceOver/TalkBack anuncia el estado del menú.
- Sin warnings de accesibilidad en axe DevTools.

---

## 4. Fase 2 — Activación por viewport (P0)

**Archivo a tocar:** `app/composables/useHoverActivation.ts` (único cambio). **No se toca CSS.**

### 4.1 Cambio del composable

- Detectar capacidad: `window.matchMedia('(hover: hover) and (pointer: fine)')`.
- Si **hay hover** → comportamiento actual.
- Si **no hay hover** → activar/desactivar `isActive` con `IntersectionObserver` (`threshold: 0.45`, `rootMargin: '0px 0px -10% 0px'`).
- Mantener la misma API (`{ isActive }`) — los 5 consumidores en `ServicesSection.vue` no cambian.

### 4.2 Mismo patrón aplicado a `usersAccessIsActive`

Hoy es ref manual con `mouseenter/mouseleave` en `ServicesSection.vue`. Reemplazar por `useHoverActivation` para uniformizar.

### Criterios de aceptación Fase 2

- En mobile las 6 visuales de Services (Inventory, CRM Globe, Product card, Users access, Scheduling, Proposal, Dashboard) animan al entrar al viewport.
- En desktop el comportamiento sigue siendo idéntico.

---

## 5. Fase 3 — FlowSection mobile (P0)

**Archivos a tocar:** `app/components/home/FlowSection.vue` y, lo mínimo posible, `app/assets/css/components/flow-section.css`. **Las utilidades de stepper van en `main.css`** (apuntan a poder reutilizarlas en otras secciones tipo wizard).

### 5.1 Detectar mobile y bifurcar render

`FlowSection.vue` ya tiene `isMobile = matchMedia('(max-width: 60em)')`. Cuando sea `true`:

- **No** renderizar el canvas SVG ni los nodos absolutos.
- Renderizar un **stepper vertical**: cada nodo del workflow es una card a ancho completo, con una línea conectora a la siguiente (pseudo `::after` con `border-left`).
- El loop automático sigue corriendo, pero la **card activa hace scroll-into-view** (con `behavior: 'smooth'` salvo `prefers-reduced-motion`).
- Ocultar paquetes animados (los puntos viajeros) — en stepper no tienen sentido; reemplazar por una barra de progreso fina entre nodos.

### 5.2 Utilidades nuevas en `main.css`

- `.ui-stepper` (grid vertical).
- `.ui-stepper__item` (card + line hacia abajo).
- `.ui-stepper__item--active` (estado).
- `.ui-stepper__connector` (animación de fill).

### 5.3 Limpiar `flow-section.css`

Borrar el bloque `@media (max-width: 60em)` que reposiciona nodos absolutos (~líneas 800–845): ya no se usa.

### Criterios de aceptación Fase 3

- En 360×640 todo el flujo se entiende sin pinch-zoom.
- Sin uso de `getTotalLength` ni GSAP de paquetes en mobile (reducción medible de CPU en DevTools).
- Conservada la accesibilidad: el stepper anuncia paso N de M.

---

## 6. Fase 4 — Performance crítica (P1)

**Archivos a tocar:** `main.css` (la mayoría), plugin Lenis (`nuxt.config.ts` o `app/plugins/lenis.client.ts` según donde esté), `app/components/home/WhyUsSection.vue` (video).

### 6.1 Reducir `backdrop-filter` en mobile (en `main.css`)

Crear una regla global:

```text
@media (max-width: 960px) {
  .site-header__inner,
  .pcard-backdrop,
  .services-inventory-holder__modal-backdrop,
  .ui-glass-apple,
  .ui-sheet__backdrop {
    backdrop-filter: blur(var(--mobile-blur));
    -webkit-backdrop-filter: blur(var(--mobile-blur));
  }
}
```

> El cambio se hace **una vez en `main.css`**; en cada CSS de componente se respeta porque la regla móvil sobrescribe por especificidad de media-query + cascada (el componente define el valor desktop, la media global el móvil).

### 6.2 Lenis condicional

En el plugin de Lenis:

- Si `matchMedia('(pointer: coarse)').matches` → no inicializar.
- Si `prefers-reduced-motion: reduce` → no inicializar.

### 6.3 Video en Why-us

`why-us__bg-video`:

- `playsinline muted preload="none"`.
- IntersectionObserver: `play()` al entrar, `pause()` al salir.
- Si `navigator.connection?.saveData === true` o `(prefers-reduced-data: reduce)` → no cargar video, usar el `poster`.

### 6.4 Dot-grid global

En `main.css`, dentro de `@media (hover: none) and (pointer: coarse)`:

- `.home::after, .home__dots-hover, .dots-layer, .dots-layer--interactive { display: none; }` (libera 4 capas y un `mask-image`).

### 6.5 GSAP de hero/desire en mobile

`useGsapHeroMotion.ts` y `useGsapDesireMotion.client.ts`: detectar `(max-width: 960px)` y devolver early-return con estado final aplicado (sin scrub).

### Criterios de aceptación Fase 4

- En Pixel 5 (DevTools) FCP < 1.8s, LCP < 2.5s.
- DevTools Performance no muestra "Composite Layers" > 16ms en scroll del hero.

---

## 7. Fase 5 — Cards y secciones internas (P2)

**Archivo principal:** `main.css`. **Solo si es inevitable**, microajustes en hojas de componentes específicos.

### 7.1 Bento de Services en mobile

En `main.css` agregar utilidad `@media (max-width: 960px) { .services__bento { grid-auto-rows: auto; gap: var(--space-3); } }`. Eliminar la regla equivalente en `services-section.css` para evitar duplicación.

### 7.2 KPIs y grids internos

- `services-dashboard__kpis`, `services-inventory-holder__table-head`, `flow-output-node__stats`: cuando colapsan a 1 columna en mobile, asegurar `min-width: 0` para evitar ellipsis truncado raro.
- Estas reglas son **específicas del componente** (no se globalizan). Mantener en su CSS.

### 7.3 FAQ acordeón

Cambiar `FaqSection.vue` para usar `<details><summary>` nativo. Estilos en `home-info-sections.css` (componente legítimo). Agregar utility `.ui-accordion` en `main.css` solo si se reutiliza en otra sección.

### 7.4 ProblemScrollScene — modo tablet

En `useProblemScrollScene.client.ts`:

- `compactScreen` actual `(max-width: 980px)` → `(max-width: 960px)` (alinearse al `--bp-md`).
- Agregar branch tablet (`960–1280px`) con pin pero sin scrub agresivo (scrub: false, snap a steps).

---

## 8. Fase 6 — Accesibilidad final (P3)

**Archivos:** `main.css` (focus rings), componentes específicos para `aria-*`.

- Revisar que todo botón/link interactivo en mobile tenga `min-height: var(--tap-target-min)` aplicado por la utility `.touch-target` o por el botón base `.btn`.
- Trap-focus en sheet/modales (Sheet del header, modal de Inventory). Usar `inert` en el resto del DOM mientras estén abiertos.
- Restaurar foco al elemento que abrió el overlay al cerrar.
- Asegurar `prefers-reduced-motion` cubre todas las nuevas animaciones del stepper, sheet y skeleton del video.

---

## 9. Checklist de QA mobile

Probar en orden, dispositivos físicos o DevTools (`iPhone SE`, `iPhone 14 Pro`, `Pixel 7`, `iPad Mini`):

- [ ] Hero: el video-shell no produce overflow horizontal; subtítulo legible.
- [ ] Header: hamburguesa abre, cierra (Esc, backdrop), restaura foco.
- [ ] Problem: la pila vertical funciona sin pin; cada visual ocupa ancho completo y no escapa la card.
- [ ] Flow: stepper vertical avanza solo y el usuario puede dejarlo. Sin paquetes/SVG.
- [ ] Services: las 6 cards animan al entrar al viewport (no requieren hover).
- [ ] Why-us: si está sin red, no hay video pesado; el panel se ve nítido.
- [ ] FAQ: acordeones nativos abren/cierran con teclado y screen reader.
- [ ] CTA: panel respeta `safe-area-inset-bottom`.
- [ ] Footer: copyright + términos visibles, ambos con tap target ≥ 44×44.
- [ ] Idiomas: el switcher es alcanzable desde el menú móvil.
- [ ] No hay scroll horizontal en ningún breakpoint (640, 768, 960, 1024).
- [ ] `prefers-reduced-motion` desactiva todas las animaciones nuevas.
- [ ] Lighthouse mobile ≥ 90 en Performance, Accessibility, Best Practices.

---

## 10. Anti-patrones a evitar durante la migración

1. **Crear nuevas hojas de estilo de componente para "lo mobile"**. ❌ Se globaliza en `main.css`.
2. **Repetir `@media (max-width: ...)` con valores ad-hoc**. ❌ Solo `640/960/1280px`.
3. **Usar `:hover` para activar contenido importante**. ❌ Reemplazado por `useHoverActivation` actualizado.
4. **`100vh`** en mobile. ❌ Usar `100dvh` (ya se usa en algunos lugares; estandarizar).
5. **`backdrop-filter` con valores grandes (>10px) en mobile**. ❌ Usar `var(--mobile-blur)`.
6. **Animaciones `infinite` no pausadas al salir del viewport**. ❌ Pausar con IntersectionObserver.
7. **Crear utilities en CSS de componente y luego copiarlas**. ❌ Si se usa 2+ veces, sube a `main.css`.

---

## 11. Orden recomendado de PRs

1. **PR-1 — Cimientos (Fase 0)**: tokens, breakpoints, reset, tipografía, safe-area. Sin cambios visibles drásticos, prepara el terreno.
2. **PR-2 — Header mobile (Fase 1)** + drawer reusable.
3. **PR-3 — Activación por viewport (Fase 2)** — composable.
4. **PR-4 — FlowSection stepper (Fase 3)** + utilities `.ui-stepper` en `main.css`.
5. **PR-5 — Performance (Fase 4)**: blur móvil, Lenis, video, dot-grid, GSAP.
6. **PR-6 — Cards internos + FAQ + tablet de Problem (Fase 5)**.
7. **PR-7 — Accesibilidad y QA final (Fase 6)**.

Cada PR debe cerrarse con: lista de archivos modificados, reglas borradas en CSS de componente y captura mobile de la sección afectada.

---

## 12. Resumen ultra-corto

> Trabajamos **en `main.css` y `design-tokens.css` por defecto**. Solo bajamos a la hoja de un componente si el ajuste es exclusivo de ese componente y no se repite en ningún otro lugar. Cada nueva regla mobile en componentes debe poder justificarse con: "esto no aplica en ningún otro sitio".
