# Portfolio Marcos Morales — Claude Context

## Stack
- **Framework**: Angular 21 (standalone components, signals)
- **Lenguajes**: TypeScript 5, HTML, CSS
- **Estilos**: Tailwind CSS 3 + CSS modules por componente
- **i18n**: Sistema propio con `LanguageService` (signals), ES/EN
- **Routing**: Angular Router (home + project-detail)
- **Testing**: Vitest (no Karma)
- **3D/WebGL**: `three` (lazy-loaded) — fondo global de metal líquido

## Comandos
- `npm start` — dev server (Angular CLI, puerto 4200)
- `npm run build` — build de producción
- `npm test` — tests con Vitest
- `npm run watch` — build en watch mode

## Convenciones del proyecto

### Componentes
- **Standalone components** siempre (no NgModules)
- **Signals** sobre Observables para state local
- `inject()` sobre constructor injection
- Templates en archivo separado (`.html`), no inline
- CSS por componente en archivo separado

### i18n
- Toda string visible al usuario pasa por `t().seccion.clave`
- Añadir nuevas keys en **ambos** archivos: `src/app/i18n/es.ts` y `src/app/i18n/en.ts`
- El servicio expone signal `lang()` y método `toggle()`

### Estilos
- Tailwind first, CSS custom solo cuando Tailwind no llega
- Paleta: dark base + acentos azul/violeta/magenta/cian (estilo aurora liquid glass)
- Backdrop-filter para glassmorphism — siempre con fallback opaco
- Respetar `prefers-reduced-motion` en cualquier animación nueva

### Animaciones
- Directiva `[reveal]` para entradas en scroll (variantes: up/left/right/scale/blur)
- Directiva `[magnetic]` para botones que se atraen al cursor
- Directiva `[tilt]` para cards 3D
- Directiva `[liquidGlass]` para refracción glass-on-mouse
- Servicio `MotionService` centraliza prefers-reduced-motion

### WebGL (`components/webgl-scene/`)
- Fondo global liquid-metal: **un solo canvas/renderer/loop** en el root, detrás de todo
- Orbe de metal líquido (icosfera desplazada en vertex shader) + flow-field de fondo + polvo de partículas + bloom (solo desktop)
- Núcleo agnóstico de framework en `scene/` (`scene-engine.ts`, `liquid-orb.ts`, `flow-field.ts`, `particles.ts`, `shaders.ts`, `palette.ts`); el componente solo hace de host
- **Three.js se carga lazy** vía `import()` dinámico del engine → chunk aparte (el `main` no lleva WebGL). NO importar `three` fuera de `scene/`
- Init solo en browser con `afterNextRender`; un `effect` reactivo respeta `prefers-reduced-motion` en runtime (teardown/rebuild)
- Fallback: si reduced-motion o sin WebGL2, no se instancia y queda `<app-aurora-background>` (CSS). El handoff lo controla la clase `body.webgl-on`
- Paleta del shader espejada en `scene/palette.ts` — mantener en sync con los tokens de `styles.css`

## Estructura clave
```
src/app/
├── components/        # UI (header, hero, about, contact, footer, cursor, aurora-background, webgl-scene/)
├── pages/             # Routed pages (home, project-detail)
├── directives/        # Animation directives
├── services/          # LanguageService, MotionService
├── data/              # Project data, about data
├── models/            # TS interfaces
└── i18n/              # es.ts, en.ts
```

## Notas
- Cursor custom global: `cursor: none` en body, componente `<app-cursor>` lo dibuja
- **Proyectos**: home → **showcase cinemático** (`components/projects-showcase/`), paneles grandes alternados (zig-zag) con parallax de scroll (`[scrub]` → `--progress`), reveal, tilt 3D + glow al hover y número fantasma; detalle → **case study** (`pages/project-detail/`) con hero, media grande, sidebar sticky de stack/enlaces, secciones numeradas en paneles sólidos y CTA "siguiente proyecto". El antiguo deck apilado (`project-card` + directiva `deck`) queda como legacy sin usar
- `Project.category` (en `project.data.ts`) alimenta la etiqueta de disciplina en índice y detalle
- **Contraste corporativo**: el field WebGL se atenúa al salir del hero (uniform `uFade` por scroll) → fondo casi negro bajo el contenido; superficies de contenido sólidas, no glass translúcido
- El portfolio se despliega en `marcosmorales.dev`
- Proyectos destacados: SENTINEL, TECNOAMBIENTE, LEAD SCOUT
