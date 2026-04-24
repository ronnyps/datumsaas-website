Sí. Revisé todos los SKILL.md en .cortex/skills y esto hace cada uno:

design-taste-frontend: reglas estrictas para UI frontend premium (arquitectura, tipografía, color, motion, performance, anti-patrones).
Archivo: SKILL.md

full-output-enforcement: obliga a entregar salidas completas (sin recortes, sin “...”, sin placeholders).
Archivo: SKILL.md

gpt-taste: diseño “Awwwards-level” con AIDA, bento sin huecos y motion avanzado con GSAP.
Archivo: SKILL.md

high-end-visual-design: guía de diseño agencia high-end (tipografía, composición, microinteracciones, detalle visual).
Archivo: SKILL.md

industrial-brutalist-ui: estilo brutalista industrial/táctico (rejillas rígidas, tipografía extrema, estética blueprint/terminal).
Archivo: SKILL.md

minimalist-ui: estilo editorial minimalista (paleta neutra cálida, contraste tipográfico, sin gradientes pesados).
Archivo: SKILL.md

redesign-existing-projects: metodología para auditar y mejorar proyectos existentes sin reescribir todo.
Archivo: SKILL.md

stitch-design-taste: genera DESIGN.md para Google Stitch con reglas semánticas anti-genéricas.
Archivo: SKILL.md

Cómo usarlos (práctico):

Menciónalos explícitamente en tu prompt: usa $minimalist-ui o aplica design-taste-frontend.
Para rediseños reales: combina redesign-existing-projects + 1 estilo (minimalist-ui, high-end-visual-design, industrial-brutalist-ui o gpt-taste).
Si quieres entregables completos, añade full-output-enforcement.
Si el objetivo es Google Stitch, usa stitch-design-taste para producir DESIGN.md.
Ejemplos de prompt:

Aplica $redesign-existing-projects + $minimalist-ui a la home actual sin romper funcionalidad.
Usa $gpt-taste para una landing con GSAP y estructura AIDA.
Genera un DESIGN.md con $stitch-design-taste para un SaaS B2B.