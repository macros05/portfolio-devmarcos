/**
 * Scene palette — the exact "steel & champagne" tokens from styles.css,
 * mirrored here so the WebGL layer stays in lock-step with the CSS theme.
 */
export const PALETTE = {
  bg: '#090a0c',        // --bg-base
  surface: '#101216',   // --bg-surface
  steel: '#9ab1d1',     // --accent
  steelStrong: '#5a7ba6', // --accent-strong
  soft: '#cfdbeb',      // --accent-soft
  champagne: '#e6decc', // --warm-white
} as const;
