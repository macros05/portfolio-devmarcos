# Liquid Glass Portfolio Redesign — Design Spec

**Date:** 2026-05-22
**Branch target:** main
**Status:** Approved, implementing

## Goal

Lift the Angular 21 portfolio from "decent dark theme with fade-ins" to "spectacular Apple-style liquid glass" without changing frameworks. Spectacular animations, polished aesthetic, all framework-agnostic techniques (CSS + SVG + JS) wrapped in Angular directives.

## Why not switch to React

The `liquid-glass-react` library uses backdrop-filter + SVG `<feDisplacementMap>` + mouse tracking — all framework-agnostic. Migrating costs 2-3 days for zero visual gain. Angular 21 signals are excellent for reactive mouse tracking. Stay in Angular.

## Architecture

### New abstractions

| Unit | Purpose | Interface |
|---|---|---|
| `MotionService` | Single source of truth for `prefers-reduced-motion` and global cursor position signal | `reduced()`, `cursor()` |
| `[liquidGlass]` directive | Apply SVG displacement filter + mouse-reactive refraction to any element | host element gets `filter: url(#liquid-glass)` |
| `[reveal]` directive | Scroll-triggered entrance with variants | `[reveal]="'up'|'left'|'right'|'scale'|'blur'"`, `[revealDelay]` |
| `[magnetic]` directive | Cursor-attractive translation for buttons | `[magneticStrength]` (default 0.3) |
| `[tilt]` directive | 3D perspective tilt on hover for cards | `[tiltStrength]` (default 8deg) |
| `<app-aurora-background>` | Animated mesh gradient layer | rendered once at app root |

### Component refactor

Each existing component gets:
- New animations via the directives above
- Liquid glass surface where appropriate (see `liquid-glass-design` skill for tiers)
- Aurora-aware color tweaks (lighten certain text for contrast over the gradient)

## Components in scope

1. **Aurora background** (new global layer) — 3 radial gradient blobs animating slowly, noise overlay 4% opacity
2. **Cursor** — upgraded with blend-mode difference, scale on hover, magnetic snap to interactive elements
3. **Header** — floating pill (glass-strong) centered top, animated active-section indicator that slides between links
4. **Hero** — kinetic typography (per-letter stagger reveal with blur), aurora cursor-following light orb, magnetic CTA buttons with liquid glass surface
5. **About** — tech tiles as glass-medium cards with directional radial glow based on cursor position
6. **Project cards** — 3D tilt, conic gradient animated border, video reveal mask on hover, large decorative project number
7. **Contact** — glass-subtle inputs, floating labels, animated submit button with morph states
8. **Footer** — marquee with stack tech, glass-subtle background
9. **Scroll progress bar** — top of viewport, gradient-filled

## Data flow

```
MotionService (singleton)
   ├── cursor: Signal<{x, y}>     ← updated by single global mousemove listener
   └── reduced: Signal<boolean>   ← matchMedia(prefers-reduced-motion)
        │
        ├──> CursorComponent (reads cursor, draws ring)
        ├──> [magnetic] directive (reads cursor, translates host)
        ├──> [tilt] directive (reads cursor on hover only)
        ├──> [liquidGlass] directive (reads cursor, updates SVG filter scale)
        └──> [reveal] directive (checks reduced, skips animation if true)
```

Single global mousemove listener instead of one per directive — important for perf with many magnetic/glass elements on screen.

## Implementation order

1. **Foundation** — MotionService, AuroraBackground component, Tailwind extensions, directives (`liquidGlass`, `reveal`, `magnetic`, `tilt`), global styles, scroll progress bar
2. **Cursor** — upgrade existing component to use MotionService + blend modes
3. **Header** — floating pill + active section detection
4. **Hero** — kinetic type, light orb, magnetic CTAs
5. **About** — glass tiles + directional glow
6. **Project cards** — tilt + conic border + video reveal
7. **Contact** — glass inputs + animated submit
8. **Footer** — marquee
9. **Polish** — smooth scroll, page transitions, reduced-motion verification, build check, browser visual check

## Error handling / fallbacks

- `@supports not (backdrop-filter: blur(1px))` → solid `rgba(15,23,42,0.85)` fallback
- `prefers-reduced-motion: reduce` → all directives become no-ops (instant final state)
- Touch devices (no hover) → magnetic/tilt directives disable themselves, liquid glass goes to static refraction
- Firefox (no `backdrop-filter` until recent) → already covered by `@supports` fallback

## Testing strategy

Visual verification, not unit tests:
- `npm run build` must pass (no TS errors)
- Manual: open in Chrome at 1440px, scroll through full page, verify each animation
- Manual: toggle `prefers-reduced-motion` in DevTools, confirm animations are disabled
- Manual: resize to mobile (375px), confirm layout holds

Skip unit tests for directives — they're pure DOM manipulation, easier to verify visually.

## What's out of scope

- Switching to React (analyzed and rejected)
- Replacing Tailwind 3 → 4 (works, leave it)
- Replacing routing or i18n (works, leave it)
- Lighthouse-perfect optimization (we'll keep things performant but not chase 100/100)
- New content / new projects / new copy — design only, content untouched
