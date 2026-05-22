# Portfolio Marcos Morales — Claude Context

## Stack
- **Framework**: Angular 21 (standalone components, signals)
- **Lenguajes**: TypeScript 5, HTML, CSS
- **Estilos**: Tailwind CSS 3 + CSS modules por componente
- **i18n**: Sistema propio con `LanguageService` (signals), ES/EN
- **Routing**: Angular Router (home + project-detail)
- **Testing**: Vitest (no Karma)

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

## Estructura clave
```
src/app/
├── components/        # UI components (header, hero, about, projects, contact, footer, cursor)
├── pages/             # Routed pages (home, project-detail)
├── directives/        # Animation directives
├── services/          # LanguageService, MotionService
├── data/              # Project data, about data
├── models/            # TS interfaces
└── i18n/              # es.ts, en.ts
```

## Notas
- Cursor custom global: `cursor: none` en body, componente `<app-cursor>` lo dibuja
- El portfolio se despliega en `marcosmorales.dev`
- Proyectos destacados: SENTINEL, TECNOAMBIENTE, LEAD SCOUT
