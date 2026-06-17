/**
 * Scene palette — mirrors the spectral + ink tokens in styles.css so the WebGL
 * layer stays in lock-step with the CSS theme. The cyan → violet → magenta
 * spectral triad is the ONLY colour in the whole site; everything else is ink
 * and paper.
 *
 * The legacy steel/champagne keys are retained purely so the now-unused legacy
 * modules (liquid-orb, flow-field) still type-check during the transition.
 */
export const PALETTE = {
  // ── ink + paper ──
  bg: '#07080a', //      --ink-0  (root background / clear colour)
  surface: '#0c0d10', // --ink-1
  paper: '#f4f5f7', //   --paper

  // ── spectral (cyan → violet → magenta) ──
  cyan: '#00e5ff', //    --spectral-a
  violet: '#7a5cff', //  --spectral-mid
  magenta: '#ff00e5', // --spectral-b

  // ── legacy (kept only for the legacy liquid-orb / flow-field modules) ──
  steel: '#9ab1d1',
  steelStrong: '#5a7ba6',
  soft: '#cfdbeb',
  champagne: '#e6decc',
} as const;
