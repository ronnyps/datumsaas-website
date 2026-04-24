# 2026-04-22 Problem Handoffs Pointer Animation Design (Level 1)

## Objetivo
Rediseñar la animación de `ProblemPointHandoffsVisual` para que dos punteros entren en paralelo hacia folders del grid, hagan click visible y salgan, cumpliendo reglas de separación entre targets.

## Alcance (Nivel 1)
- Componente objetivo: `app/components/home/problem/ProblemPointHandoffsVisual.vue`
- Estilos objetivo: `app/assets/css/components/problem-point-handoffs-visual.css`
- Reutiliza `RolePointerTag` sin rediseñar su API base.
- No introduce dependencias nuevas (sin GSAP para esta iteración).

## Requisitos funcionales
1. Deben animarse dos punteros simultáneamente en cada ciclo.
2. El puntero A entra desde arriba.
3. El puntero B entra desde abajo.
4. Ambos hacen click visible sobre su folder target.
5. Los targets de cada ciclo se seleccionan aleatoriamente.
6. Nunca pueden seleccionar el mismo folder.
7. Nunca pueden seleccionar folders adyacentes.
8. Los roles mostrados en cada puntero pueden seguir variando aleatoriamente.

## Definición de adyacencia
Para el grid `3x3`, dos celdas son adyacentes si su distancia de Chebyshev es `1`:
- adyacencia horizontal
- adyacencia vertical
- adyacencia diagonal

Regla válida: `distanceChebyshev >= 2` entre target A y target B.

## Arquitectura propuesta
### 1) Estado de targets en Vue
En `ProblemPointHandoffsVisual.vue`:
- Mantener una lista indexada de celdas del grid (`0..8`) con coordenadas `(row,col)`.
- Estado reactivo:
  - `pointerATargetIndex`
  - `pointerBTargetIndex`
  - `cycleTick` (opcional para reiniciar microanimaciones)

### 2) Selector aleatorio con reglas
Función `pickValidTargetPair()`:
- Selecciona target A aleatorio.
- Filtra candidatos para B por:
  - `candidate !== targetA`
  - `!isAdjacent(targetA, candidate)`
- Si no hay candidato (muy improbable en 3x3 con esta regla), reintenta.

### 3) Timeline por fases (simultánea)
Ciclo único de duración base aproximada `2800ms`:
1. Entrada (`0% -> 45%`): A baja desde arriba, B sube desde abajo.
2. Click (`45% -> 62%`):
   - micro-pause del puntero
   - pulse del puntero
   - pulse/ring del folder target
3. Salida (`62% -> 88%`): fade + desplazamiento corto.
4. Breve reposo (`88% -> 100%`) y nuevo sorteo de targets.

## Estrategia CSS/DOM
### 1) Posicionamiento de punteros
- `problem-handoffs__pointers` sigue en overlay absoluto.
- Cada puntero se posiciona con variables CSS:
  - `--target-x`
  - `--target-y`
- Origen vertical distinto:
  - A usa offset inicial negativo (`from top`).
  - B usa offset inicial positivo (`from bottom`).

### 2) Click visual del folder
- Cada tile recibe clase dinámica cuando es target activo:
  - `problem-handoffs__tile--target-a`
  - `problem-handoffs__tile--target-b`
- En CSS se agrega pulse corto (scale + glow suave) sincronizado con fase click.

### 3) Sincronización
- Un mismo reloj de ciclo controla ambos punteros para garantizar simultaneidad real.
- Roles pueden rotar al inicio de cada ciclo para mantener coherencia visual.

## Accesibilidad y motion safety
- En `prefers-reduced-motion: reduce`:
  - Sin trayectorias ni pulse.
  - Punteros y tiles quedan en estado estático.
  - Se mantiene layout sin parpadeos.

## Errores y robustez
- Si falla la selección de par válido tras `10` intentos, fallback a par estático válido `(0, 8)`. 
- Al desmontar componente: limpiar todos los timers (`setInterval` / `setTimeout`).

## Criterios de aceptación
1. En cada ciclo se ven dos entradas simultáneas (arriba/abajo).
2. Cada puntero hace click visual en su target.
3. Nunca coinciden targets.
4. Nunca hay targets adyacentes.
5. La animación se repite de forma continua y estable.
6. `npm run build` compila sin errores.
7. Respeta `prefers-reduced-motion`.

## Plan de implementación (alto nivel)
1. Añadir modelo de celdas 3x3 y utilidades de distancia.
2. Implementar selector aleatorio con regla anti-adyacencia.
3. Conectar estado de targets con clases/variables CSS.
4. Reemplazar keyframes actuales por timeline por fases (entrada/click/salida).
5. Añadir pulse en tiles target.
6. Ajustar reduced-motion.
7. Verificar build y ajustar timing fino.

## Fuera de alcance (Nivel 1)
- Curvas bezier complejas por path SVG personalizado.
- Colisiones avanzadas entre punteros.
- Sistema de eventos de click real (solo visual).

