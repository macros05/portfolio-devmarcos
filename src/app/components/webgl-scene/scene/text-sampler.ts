/**
 * Renders a string to an offscreen 2D canvas, reads its filled pixels, and
 * samples them into a cloud of `count` 3D point positions — used as a morph
 * target for the GPGPU particle system. No extra dependencies.
 *
 * Returns a Float32Array of length count*3 (xyz), roughly centred on the
 * origin in the z≈0 plane. On the server / without a canvas it returns a
 * harmless zero cloud (the scene only ever runs in the browser).
 */
export function sampleTextPoints(
  text: string,
  count: number,
  opts: { worldWidth?: number; fontWeight?: number; depth?: number } = {},
): Float32Array {
  const worldWidth = opts.worldWidth ?? 6.5;
  const depth = opts.depth ?? 0.22;
  const out = new Float32Array(count * 3);

  if (typeof document === 'undefined') return out;

  const cw = 1024;
  const ch = 320;
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return out;

  const weight = opts.fontWeight ?? 700;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Fit the font so the text spans ~90% of the canvas width.
  let fontPx = 240;
  ctx.font = `${weight} ${fontPx}px 'Geist', system-ui, sans-serif`;
  const measured = ctx.measureText(text).width;
  const maxW = cw * 0.9;
  if (measured > maxW) {
    fontPx = Math.floor(fontPx * (maxW / measured));
    ctx.font = `${weight} ${fontPx}px 'Geist', system-ui, sans-serif`;
  }
  ctx.fillText(text, cw / 2, ch / 2);

  const img = ctx.getImageData(0, 0, cw, ch).data;

  // Collect filled pixels (white text on black → read the red channel).
  const pts: number[] = [];
  for (let y = 0; y < ch; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      if (img[(y * cw + x) * 4] > 128) pts.push(x, y);
    }
  }

  const aspect = ch / cw;
  const worldHeight = worldWidth * aspect;

  if (pts.length === 0) {
    // Never collapse to the origin — fall back to a flat random cloud.
    for (let i = 0; i < count; i++) {
      out[i * 3] = (Math.random() - 0.5) * worldWidth;
      out[i * 3 + 1] = (Math.random() - 0.5) * worldHeight;
      out[i * 3 + 2] = (Math.random() - 0.5) * depth;
    }
    return out;
  }

  const n = pts.length / 2;
  for (let i = 0; i < count; i++) {
    const j = (Math.random() * n) | 0;
    const px = pts[j * 2];
    const py = pts[j * 2 + 1];
    out[i * 3] = (px / cw - 0.5) * worldWidth + (Math.random() - 0.5) * 0.03;
    out[i * 3 + 1] = -(py / ch - 0.5) * worldHeight + (Math.random() - 0.5) * 0.03;
    out[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return out;
}
