# Rediseño "three.js example HUD" — Portfolio Marcos Morales

**Fecha:** 2026-06-17
**Rama:** `feat/webgl-3d-overhaul`
**Estado:** Diseño aprobado pendiente de validación de spec

---

## 1. Objetivo

Rediseñar **por completo** la capa de diseño del portfolio (`marcosmorales.dev`) tomando como
referencia la estética de **threejs.org/examples** y **threejs.org/docs**: el sitio se presenta
como si fuera *una página de ejemplo de three.js viva* — chrome técnico (monospace, rejilla
blueprint, índice lateral, HUD de stats reales) envolviendo un showpiece WebGL espectacular.

El mensaje de marca: *"domino frontend a nivel gráfico, no solo apps de negocio"* — la señal que
distingue a un senior. El contenido sigue siendo el portfolio de un **AI engineer** (RAG / LLM /
agents).

Se construye **sobre el motor existente** (carga lazy de three.js, sistema de directivas de
animación, i18n ES/EN, custom cursor). No es un proyecto desde cero: es re-skin + re-coreografía +
una pieza WebGL nueva + chrome nuevo + dos secciones reconcebidas (work como galería, lab nueva).

### Decisiones tomadas (brainstorming)

| Decisión | Elección |
|---|---|
| Dirección estética | **three.js examples HUD** — el portfolio como página de ejemplo viva |
| Base | **Dark cinematic** (casi-negro) |
| Showpiece 3D | **Pieza nueva**: sistema de partículas GPGPU que muta de forma |
| Color | **Espectral**: UI estrictamente monocroma (blanco/negro); gradiente cian→magenta **solo** en WebGL y micro-señales |
| Work + Lab | **Galería de ejemplos + sección Lab nueva** con experimentos gráficos interactivos |
| Imágenes | **Todo procedural con three.js**; raster solo en media de detalle de proyecto (ver §11) |

---

## 2. No-objetivos (YAGNI)

- **No** rehacer el backend de datos ni el modelo de routing (home + project-detail se mantienen).
- **No** introducir un framework de animación externo (GSAP/Lenis) salvo que una fase lo justifique;
  se reutilizan las directivas propias.
- **No** internacionalizar a más idiomas que ES/EN.
- **No** soportar navegadores sin WebGL2 con la pieza GPGPU: degradan al fallback estático (§10).
- **No** crear un CMS ni panel de admin para los experimentos del Lab (datos hardcoded en `data/`).
- **No** stock photos ni librerías de imágenes: lo visual es procedural (§11).

---

## 3. Sistema visual (tokens)

UI **monocroma**. El color (gradiente espectral) se reserva al canvas WebGL y a micro-señales de
"vida" (punto de nav activo, dot REC del HUD, underline de link en hover).

### Tokens nuevos (`styles.css` `:root`)

```
/* Base */
--ink-0: 7 8 10;        /* casi negro, fondo raíz */
--ink-1: 12 13 16;      /* panel base */
--ink-2: 18 20 24;      /* panel elevado */
--paper: 244 245 247;   /* tinta blanco-papel (texto fuerte) */
--paper-soft: 150 154 160; /* texto secundario mono */
--line: 255 255 255;    /* hairlines (se usa con alpha 0.06–0.14) */

/* Espectral — SOLO WebGL + micro-señales */
--spectral-a: 0 229 255;   /* cian #00E5FF */
--spectral-b: 255 0 229;   /* magenta #FF00E5 */
--spectral-mid: 122 92 255; /* violeta de transición para UI micro-señales */
```

Se **eliminan** del uso general: `--accent`, `--accent-strong`, `--accent-soft`, `--warm-white`
(steel/champagne) y las clases `text-gradient-aurora`, `glow-chip`, `conic-border` en su forma
actual coloreada. Se conserva `noise-overlay` (grain anti-banding).

### Superficies

- **Fuera** el frosted-glass pesado (`glass-strong/medium/subtle`) como lenguaje dominante.
- **Dentro**: paneles técnicos de **borde hairline 1px** (`rgba(var(--line), 0.10)`), fondo
  `rgba(var(--ink-1), 0.72)` con `backdrop-filter: blur(8px)` opcional, esquinas con **ticks de
  registro** (pseudo-elementos en las 4 esquinas, 8px).
- **Panel lil-gui**: variante para controles (toggle idioma/tema, settings) imitando el panel de
  controles de los ejemplos three.js — filas con label mono a la izquierda y control a la derecha,
  separadores hairline.

---

## 4. Tipografía

- **Chrome / UI / labels / HUD / captions / números → mono**: `Geist Mono` (ya cargada). Tamaños
  pequeños (11–13px), `letter-spacing: 0.02em`, uppercase en labels de sección.
- **Titulares grandes → grotesca**: `Geist` 600–800. Se evalúa sustituir el display por una
  grotesca más técnica; por defecto se mantiene `Geist` para no añadir peso de fuente.
- Se retira `Clash Display` si no aporta al nuevo look (decisión en fase 1; por defecto se elimina
  el `@import` para reducir requests).

---

## 5. Chrome global (persistente en todas las rutas)

Vive en `app.component` (sobre el `router-outlet`), siempre visible.

### 5.1 Índice lateral (`components/side-index/`)
Reemplaza el `header` superior actual.
- Columna izquierda fija, mono, con índice de secciones:
  `00 / index · 01 / about · 02 / work · 03 / lab · 04 / contact`.
- Ítem activo resaltado (line marker + micro-dot espectral); sincronizado vía IntersectionObserver
  (reutiliza la lógica del header actual).
- En móvil: colapsa a un disclosure (botón hamburguesa mono) — overlay a pantalla completa.
- Incluye el wordmark `marcos.morales.dev` en estilo de "logo" de ejemplo y el toggle de idioma
  (panel lil-gui).

### 5.2 Stats HUD (`components/hud/`)
- Panel flotante (esquina, configurable) con:
  - **Stats.js real**: FPS + MS (mini-gráfica). Se puede usar el `Stats` de three/examples o un
    medidor propio ligero leyendo el rAF del engine.
  - Lecturas custom leídas de `renderer.info.render`: **triangles**, **draw calls**, **points**
    (nº de partículas activas), expuestas por el `SceneHandle` (§9.5).
  - Estado: sección actual, scroll %, coords del cursor `x,y`, dot `● LIVE`.
- Números **reales**, actualizados por rAF, formateados mono. Es el detalle de credibilidad senior.
- Respeta reduced-motion (sin mini-gráfica animada; valores estáticos/discretos).

### 5.3 Rejilla blueprint + marcas de registro
- Capa fija de fondo (bajo el contenido, sobre el canvas WebGL o integrada en él): rejilla de
  líneas hairline (`rgba(var(--line),0.04)`), crosshairs en esquinas, ticks de regla en los bordes.
- Implementación CSS (`background-image` con gradients repetidos) para que exista incluso sin WebGL.

### 5.4 Cursor (`components/cursor/` — reskin)
- Retícula/crosshair técnico con **readout de coordenadas** `x,y` mono junto al puntero.
- Snap-to-interactive: al hover sobre link/botón se transforma en un corchete `[ ]` que abraza el
  elemento. Mantiene la lógica de easing actual.

---

## 6. Secciones (narrativa conservada, chrome nuevo)

Orden y rutas se mantienen (home compone todo; project-detail aparte).

### 00 / index — Hero (`components/hero/` reskin)
- Canvas full-bleed con la **pieza GPGPU** (§9).
- Overlay: nombre enorme (grotesca), rol (mono), bio de una línea, chip `● available for work`,
  scroll cue. Captions técnicos alrededor imitando el bloque título/descripción de un ejemplo
  (`// webgl_gpgpu_morph — marcos morales`, contadores).
- El morph de partículas y la cámara se dirigen por scroll (`scrub` / uniforms).

### 01 / about — Spec sheet (`components/about/` reskin)
- Layout tipo **README / manual page**: bio en mono, TOC lateral opcional.
- Stack como **matriz/tabla técnica** (sustituye el grid de iconos actual): filas con tecnología +
  rol + años/uso, hover que resalta la fila. Los iconos Devicon se conservan en pequeño.
- Chips de especialización IA (RAG / LLM / agents / MCP) en estilo "tags" mono.

### 02 / work — Galería de ejemplos (`components/projects-gallery/` — nuevo)
- Reconcibe el showcase zig-zag como **galería de ejemplos three.js**:
  - Un panel **featured** grande arriba (proyecto destacado) con preview WebGL/animada.
  - **Grid de thumbnails** estilo ejemplo: cada card con título mono, tag de categoría
    (`Project.category`), índice `NN`, y un **mini-preview procedural** (canvas/shader o CSS
    animado) que reacciona al hover.
  - Click → case-study de detalle existente (`pages/project-detail/`), reskineado al look HUD.
- El showcase zig-zag actual (`components/projects-showcase/`) queda **legacy/no usado** (se conserva
  el archivo como referencia, no se enruta), siguiendo la convención del proyecto con el deck legacy.

### 03 / lab — Experiments (`components/lab/` — nuevo)
- Sección nueva: tira/grid de **experimentos gráficos interactivos** (shader toys). Cada item:
  - Un canvas WebGL pequeño con un efecto distinto (p. ej. curl-noise flow, raymarch SDF,
    instanced field, audio-react opcional). Reutiliza el motor `scene/`.
  - Título mono + descripción de 1 línea + tag. Interacción: hover/drag mueve un uniform de mouse.
- Datos en `data/lab.data.ts` (nuevo): `{ id, title, blurb, kind }`. 3–4 experimentos iniciales.
- **Presupuesto de performance**: máximo 1 canvas pesado activo a la vez (IntersectionObserver
  pausa los fuera de viewport); en `low`/reduced-motion se muestran como póster estático.

### 04 / contact — Consola (`components/contact/` reskin)
- Formulario con estética **terminal/CLI**: prompt mono (`marcos@dev:~$`), campos como input de
  consola, botón send como comando. Mantiene la funcionalidad actual del form.

### footer (`components/footer/` reskin)
- Marquee/watermark conservado, reskin mono + enlace **"view source"** a GitHub (como el pie de un
  ejemplo three.js). Watermark fill por scroll se mantiene.

---

## 7. i18n

Toda string nueva entra en `i18n/es.ts` **y** `i18n/en.ts`. Claves nuevas/afectadas:
- `nav`: índices `00/index`, `01/about`, `02/work`, `03/lab`, `04/contact`.
- `hud`: labels (`fps`, `ms`, `tris`, `calls`, `points`, `section`, `scroll`, `cursor`, `live`).
- `lab`: kicker, título, blurbs por experimento.
- `contact`: prompts de consola (placeholder, send, success/error).
- `work`: `featuredLabel`, labels de galería, tags.
- `hero`: caption técnica del ejemplo.
Se conservan las claves existentes que sigan aplicando (`about`, `projects.detailSections`, etc.).

---

## 8. Movimiento / directivas

Se **reutilizan** las directivas existentes, re-tuneadas a easing "de ingeniería" (más preciso y
snappy, menos orgánico):
- `reveal` — entradas en scroll (se añade variante `decode`/`draw` si hace falta).
- `scrub` — dirige `--progress` para parallax y para uniforms del morph.
- `tilt`, `magnetic` — se conservan, intensidad reducida (look más sobrio/técnico).
- `liquidGlass` — se **retira** del uso (no casa con el look HUD); el archivo queda legacy.

**Nuevas directivas/animaciones:**
- `decode` (`directives/decode.directive.ts`): efecto typewriter/scramble (glyph-shuffle) para
  titulares mono al entrar en viewport.
- Draw-on de líneas de rejilla (CSS `@property` + clip o stroke-dashoffset en SVG).
- Contadores numéricos del HUD (lógica interna del componente HUD, no directiva global).

Todo respeta `MotionService.reduced()` y `prefers-reduced-motion`.

---

## 9. WebGL — arquitectura técnica

Se conserva el patrón actual: **un solo canvas/renderer/loop** en el root, núcleo agnóstico en
`scene/`, three.js cargado **lazy** vía `import()` dinámico (el `main` no lleva WebGL), init solo en
browser con `afterNextRender`, `effect` reactivo que respeta reduced-motion (teardown/rebuild),
detección de calidad `high`/`low`.

### 9.1 Pieza estrella — Particle morph GPGPU (`scene/particle-morph.ts` — nuevo)
- **Simulación GPGPU** en FBO ping-pong. **Por defecto** se usa `GPUComputationRenderer` de
  three/examples (probado, soporta WebGL2 + float textures) envuelto en un helper propio
  `scene/gpgpu.ts`: texturas de posición/velocidad de partículas.
- Recuento: `high` ~ 130k–260k puntos (textura 512² / 512×512), `low` ~ 16k–32k (128²).
- **Comportamiento**: curl-noise para movimiento orgánico + fuerza de atracción hacia un **target**
  (morph). Targets cíclicos dirigidos por scroll/tiempo:
  1. Flujo abstracto curl-noise (reposo).
  2. Nube de puntos del texto **"MARCOS" / "AI ENGINEER"** (muestreo texto→puntos, §9.3).
  3. Lattice tipo red neuronal / icosfera wireframe.
- **Render**: `THREE.Points` con shader propio; color por velocidad/posición mapeado al **gradiente
  espectral** (cian→magenta); `AdditiveBlending`, depthWrite off.
- **Post**: `EffectComposer` → `RenderPass` → `UnrealBloomPass` (solo `high`) → `OutputPass`.

### 9.2 Backdrop (`scene/grid-backdrop.ts` — sustituye `flow-field.ts`)
- Quad pinneado al far plane con shader de **rejilla/perspectiva** (líneas que se desvanecen con la
  distancia) coherente con el HUD; reacciona suavemente a mouse/scroll. Reemplaza el flow-field de
  ruido como fondo.

### 9.3 Muestreo texto→puntos (`scene/text-sampler.ts` — nuevo)
- Renderiza el texto a un canvas 2D offscreen, lee píxeles, genera array de posiciones target para
  los puntos (sampling ponderado por densidad). Sin dependencias extra.

### 9.4 Lab toys (`scene/lab/` — nuevos, ligeros)
- Mini-efectos independientes para la sección Lab, cada uno un módulo que crea su propia escena
  mínima sobre un canvas pequeño (o comparten renderer con scissor — decisión de fase 4). Pausa por
  IntersectionObserver. Máx. 1 activo simultáneo.

### 9.5 Stats wiring
- `SceneHandle` expone un getter de stats: `{ fps, ms, triangles, calls, points }` leídos de
  `renderer.info.render` + medidor de rAF. El componente `hud/` los consume vía el
  `WebglSceneComponent` (signal).

### 9.6 Reemplazos
- `scene/liquid-orb.ts` → **reemplazado** por `particle-morph.ts` (se conserva como legacy sin uso).
- `scene/flow-field.ts` → **reemplazado** por `grid-backdrop.ts` (legacy sin uso).
- `scene/particles.ts` (dust) → **se conserva** como capa ambiental ligera (recoloreada al
  espectral), reforzando profundidad bajo la pieza GPGPU.
- `scene/palette.ts` → actualizado al gradiente espectral (sync con tokens de `styles.css`).
- `scene/shaders.ts` → añade shaders GPGPU (position/velocity), render de puntos, grid backdrop.

---

## 10. Reduced-motion / accesibilidad / performance

- **Reduced-motion / sin WebGL2**: no se instancia la pieza GPGPU. Fallback estático: rejilla CSS +
  nombre en mono + un póster (imagen o gradiente) del morph. El handoff sigue gobernado por
  `body.webgl-on` (sin la clase → fallbacks CSS visibles). El Lab muestra pósters estáticos.
- **Quality tiers**: `high` (desktop potente) vs `low` (coarse pointer / viewport pequeño / ≤2
  cores) — afecta recuento de partículas, DPR, bloom on/off.
- **Pausado**: loop pausa en `visibilitychange`; Lab toys pausan fuera de viewport.
- **Context loss**: callback `onLost` → restaura fallback CSS (lógica actual conservada).
- **Contraste**: UI monocroma sobre casi-negro garantiza AA; el canvas se atenúa bajo el contenido
  (uniform de fade por scroll, como el `uFade` actual) para legibilidad.
- **Accesibilidad**: nav y form navegables por teclado; HUD es decorativo (`aria-hidden`); foco
  visible en estilo mono.

---

## 11. Imágenes / assets

**Principio: todo lo visual es procedural con three.js / CSS.** No se necesitan stock photos:
- Hero, backdrop, Lab y micro-previews de la galería → WebGL/shaders.
- Iconografía → Devicons (CDN, ya en uso) + glifos mono.

**Único punto donde un raster aporta**: la **media del case-study de detalle** (mostrar la UI real
del producto). Opciones, por orden de preferencia:
1. **Screenshots reales** del producto aportados por el usuario (lo más honesto).
2. **Mockups generados** (nano-banana / Gemini image) si no hay screenshots — requiere API key.
3. **Representación estilizada WebGL/CSS** (mock de "ventana de app" procedural) — 0 assets.

Por defecto se implementa la opción 3 (mock procedural) para no bloquear; si el usuario aporta API
key o screenshots, se sustituye. **Claude no genera imágenes en este entorno**; cualquier raster
generado vendría de nano-banana con la key del usuario.

---

## 12. Estructura de archivos

**Nuevos:**
- `components/side-index/` (nav lateral) · `components/hud/` (stats) · `components/lab/` (sección)
- `components/projects-gallery/` (galería work)
- `directives/decode.directive.ts`
- `scene/particle-morph.ts` · `scene/gpgpu.ts` · `scene/grid-backdrop.ts` · `scene/text-sampler.ts`
  · `scene/lab/*`
- `data/lab.data.ts`

**Modificados:**
- `styles.css` (tokens, rejilla, mono chrome, lil-gui, retirada de glass dominante)
- `scene/palette.ts` · `scene/shaders.ts` · `scene/scene-engine.ts` (swap orb→morph, grid, stats)
- `webgl-scene.component.ts` (expone stats signal)
- `app.component.html/ts` (añade side-index + HUD + rejilla)
- `pages/home/*` (orden/nombres de secciones + lab)
- `components/{hero,about,contact,footer,cursor}/*` (reskin)
- `pages/project-detail/*` (reskin HUD + media mock)
- `i18n/en.ts` + `i18n/es.ts` (claves nuevas)
- `data/project.data.ts` / `models/project.model.ts` (si se añaden campos de preview)

**Legacy (conservados sin uso):**
- `components/header/` (sustituido por side-index) · `components/projects-showcase/`
- `scene/liquid-orb.ts` · `scene/flow-field.ts` · `directives/liquidGlass`, `directives/deck`

---

## 13. Fases de implementación

1. **Sistema + chrome global**: tokens/`styles.css`, rejilla blueprint, `side-index`, shell del
   `hud`, cursor reticle, panel lil-gui, i18n base. *(Sin WebGL nuevo aún; HUD con datos mock.)*
2. **Pieza GPGPU + hero**: `gpgpu.ts`, `particle-morph.ts`, `text-sampler.ts`, `grid-backdrop.ts`,
   shaders, swap en `scene-engine.ts`, wiring de stats reales al HUD, hero reskin.
3. **about (spec-sheet) + work (galería) + project-detail (reskin + media mock)**.
4. **lab (experiments) + contact (consola) + footer + i18n completo + reduced-motion/perf/tests
   + pulido**.

Cada fase deja la app compilando y navegable; el fallback CSS funciona en todas.

---

## 14. Testing

- **Vitest** (no Karma). Specs con stubs de `matchMedia`/`IntersectionObserver` y providers de
  router (patrón ya existente en el repo).
- Cubrir: render de `side-index` (ítem activo), `hud` (formateo de stats, aria-hidden), `decode`
  directive (no rompe en reduced-motion), `LanguageService` con claves nuevas, galería work
  (lista de proyectos), fallback de `webgl-scene` en reduced-motion.
- Build de producción (`npm run build`) verde y sin que `three` entre en el chunk `main`.

---

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| GPGPU + bloom + lab toys = coste GPU alto | Quality tiers, 1 toy activo máx., pausado por IO/visibility, fallback estático |
| Look "frío"/poco legible al ser monocromo | Espectral en micro-señales + bloom da calidez puntual; jerarquía tipográfica fuerte |
| Scope grande (5 fases) | Cada fase compila/navega; legacy conservado para rollback parcial |
| `GPUComputationRenderer` requiere WebGL2 + float textures | Detección de soporte → fallback; tier `low` reduce a 128² |
| Media de proyecto sin assets reales | Mock procedural por defecto (§11); sustituible con screenshots/API key |
| Banding en gradientes espectrales | `noise-overlay` grain conservado + dithering en shader |
```