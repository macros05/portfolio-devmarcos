---
name: liquid-glass-design
description: Use when adding or refining liquid-glass (Apple visionOS / iOS 18 / macOS Tahoe style) surfaces, refraction effects, aurora gradients, or magnetic glass UI in this Angular portfolio. Covers the technique recipe (SVG displacement + backdrop-filter + mouse warp) and when to apply each glass tier.
---

# Liquid Glass Design System

The portfolio uses an Apple-style liquid glass aesthetic. This skill captures the recipe so future sessions don't have to rediscover it.

## The Effect (4 layers)

Real liquid glass is the composition of these layers:

1. **Aurora background** — animated mesh gradient behind everything (blue → violet → magenta → cyan). Provides the color that the glass refracts.
2. **Backdrop blur** — `backdrop-filter: blur(20-40px) saturate(180%)`. The frosted layer.
3. **SVG displacement filter** — `<feDisplacementMap>` driven by a noise texture, warps the blurred backdrop to fake refraction. This is what makes it look liquid instead of just frosted.
4. **Light edge highlight** — top-left bright stroke, bottom-right subtle stroke. `box-shadow: inset` with two layered shadows, or a `::before` with a gradient border.

Mouse-reactive variants animate the displacement map's `scale` attribute based on cursor distance.

## Glass tiers (use the right one)

| Tier | Backdrop blur | BG opacity | Use case |
|---|---|---|---|
| `glass-strong` | 40px | 0.12 | Floating nav pill, modals — content behind heavily diffused |
| `glass-medium` | 24px | 0.08 | Cards, project tiles — clear sense of layers |
| `glass-subtle` | 12px | 0.04 | Form inputs, footer — barely-there frost |

All tiers always include:
- `border: 1px solid rgba(255,255,255,0.12)` — the light edge
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3)` — top highlight + depth

## The liquidGlass directive

`[liquidGlass]` directive (in `src/app/directives/liquid-glass.directive.ts`) handles:
- Injecting the SVG `<filter>` element with `feTurbulence` + `feDisplacementMap` once per app
- Applying `filter: url(#liquid-glass)` to the host
- Mouse listener that interpolates `feDisplacementMap.scale` from 0 → 30 based on distance to cursor (closer = more refraction)

Use it on hero buttons, project cards, the header pill, the cursor itself.

## Aurora background

`<app-aurora-background>` renders 3-4 radial gradients in absolute-positioned divs, each animated with `@keyframes` that translate them slowly in different directions. A noise texture overlay (SVG turbulence) at 4% opacity prevents banding on gradients.

Colors used: `#3b82f6` (blue-500), `#8b5cf6` (violet-500), `#ec4899` (pink-500), `#06b6d4` (cyan-500).

## When NOT to use liquid glass

- Plain text paragraphs — kills readability
- The mobile menu drawer at full coverage — performance tank on low-end Android
- Inside another glass surface (nested glass = muddy)

## Performance rules

- Always pair `backdrop-filter` with `-webkit-backdrop-filter` for Safari
- Set `will-change: transform, backdrop-filter` only on currently-animating elements, never globally
- Add `@supports not (backdrop-filter: blur(1px))` fallback with solid `rgba(15,23,42,0.85)`
- `contain: paint` on glass containers to limit repaint scope
- Test on a real iPhone — Safari is the canary, not Chrome
