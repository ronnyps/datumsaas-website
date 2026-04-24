# DatumSaaS - Sistema de Buenas Practicas (v1)

## Objetivo

Definir un sistema operativo de trabajo para producto, copy y front-end que mantenga consistencia, calidad y velocidad de ejecucion en el sitio de DatumSaaS.

Este documento unifica criterios que ya aparecen en `AGENT.md`, specs de `docs/superpowers/specs` y lineamientos de marca.

---

## 1) Jerarquia de decisiones

1. Instruccion explicita del usuario.
2. Reglas de proyecto (`.agents/skills/AGENT.md`).
3. Brand guidelines (`docs/brand-guidelines.md`).
4. Specs/plans vigentes en `docs/superpowers/specs` y `docs/superpowers/plans`.
5. Preferencias tecnicas del agente/skills.

Si hay conflicto, se documenta la decision tomada en el PR/nota de cambio.

---

## 2) Flujo minimo obligatorio por tarea

1. Entender alcance y dejar plan corto antes de tocar codigo.
2. Aplicar cambios minimos necesarios (sin sobre-ingenieria).
3. Verificar resultado con build/check local.
4. Reportar que se cambio, por que, y que queda pendiente.

---

## 3) Estandar estricto de CSS (obligatorio)

### Regla principal

- No se permite CSS inline en ningun caso.
- Todo CSS debe declararse en archivos `.css` identificables y versionables.
- Se utilizaran exclusivamente tokens definidos en `assets/design-tokens.css`.
- Si se requiere crear o modificar tokens, se debe consultar y aprobar primero antes de implementarlo.

### Prohibiciones explicitas

- Prohibido `style=""` en templates HTML/Vue.
- Prohibido `:style="{ ... }"` en componentes Vue para estilos de presentacion.
- Prohibido inyectar estilos desde JS salvo casos tecnicos justificados (ej. calculo dinamico inevitable).
- Prohibido dejar estilos “sueltos” en componentes sin trazabilidad.

### Reglas de organizacion

- Ubicar estilos en archivos por dominio/componente (ejemplo):
  - `app/assets/styles/tokens.css`
  - `app/assets/styles/base.css`
  - `app/assets/styles/components/hero.css`
  - `app/assets/styles/components/bridge.css`
  - `app/assets/styles/components/dashboard-mock.css`
- Usar nombres de clase claros y consistentes por bloque/componente.
- Mantener estilos reutilizables y evitar duplicacion.

### Excepciones permitidas

- Variables CSS runtime para animacion o posiciones calculadas, siempre documentadas y minimas.
- Estados UI que dependan de datos dinamicos, priorizando clases condicionales sobre estilos inline.

---

## 4) Sistema de componentes y estructura visual

- Cada seccion debe tener estructura semantica clara (header, contenido, CTA).
- Mantener consistencia de spacing y alineaciones entre secciones.
- Evitar “bordes dentro de bordes” no intencionales.
- No introducir elementos decorativos que no esten alineados con el sistema visual acordado.

---

## 5) Copy y narrativa

- Tono: claro, profesional, directo, sin hype vacio.
- No hardcodear textos en componentes o vistas, salvo que el usuario lo pida de forma explicita.
- Todo texto de producto/marketing/UI debe venir de archivos de contenido o fuentes centralizadas del proyecto.
- Evitar lenguaje excesivamente tecnico para no excluir audiencias del mid-market.
- Mensajes orientados a:
  - operatividad real,
  - control,
  - velocidad de ejecucion,
  - confianza para agendar demo.
- Mantener coherencia EN/ES en mensaje principal.

---

## 6) SEO y contenido estatico

- Mantener arquitectura estatica y indexable.
- Toda pagina debe tener metadata localizada (title/description/canonical/hreflang cuando aplique).
- Evitar textos placeholder en produccion.
- Mantener consistencia entre copy visible y metas SEO.

---

## 7) Accesibilidad y UX

- Contraste minimo AA.
- Focus visible en elementos interactivos.
- Targets tactiles adecuados.
- Respetar `prefers-reduced-motion`.
- Evitar layout shifts y saltos visuales en hover/transiciones.

---

## 8) Verificacion antes de cerrar tareas

Checklist minimo:

- [ ] No hay CSS inline (`style=""` ni `:style` de presentacion).
- [ ] Estilos en archivos `.css` reconocibles.
- [ ] Solo se usan tokens existentes de `assets/design-tokens.css`.
- [ ] Cualquier token nuevo fue consultado y aprobado previamente.
- [ ] Build local correcta.
- [ ] Revisado en desktop y mobile.
- [ ] Copy final sin mezcla accidental de idioma.
- [ ] No hay textos hardcodeados fuera de la capa de contenido (salvo excepcion aprobada por usuario).
- [ ] CTA y jerarquia visual consistentes con brand.

---

## 9) Definicion de hecho (Definition of Done)

Una tarea se considera cerrada cuando:

1. Cumple el objetivo funcional y visual solicitado.
2. Respeta este sistema de buenas practicas.
3. Queda verificable y mantenible para iteraciones futuras.
