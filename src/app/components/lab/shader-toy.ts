/**
 * shader-toy.ts — Raw WebGL2 fragment-shader runner.
 * No three.js, no external deps. A fullscreen triangle quad + fragment shader.
 * Uniforms: uTime (float secs), uResolution (vec2 px), uMouse (vec2 0..1 y-up).
 */

export interface ShaderToy {
  render(timeSec: number): void;
  setMouse(x: number, y: number): void;
  resize(): void;
  dispose(): void;
}

const VERT_SRC = /* glsl */ `#version 300 es
void main() {
  // Fullscreen triangle: 3 vertices cover the whole NDC quad
  vec2 pos[3];
  pos[0] = vec2(-1.0, -1.0);
  pos[1] = vec2( 3.0, -1.0);
  pos[2] = vec2(-1.0,  3.0);
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile error:\n${log}`);
  }
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Program link error:\n${log}`);
  }
  return prog;
}

const MAX_DPR = 1.5;

export function createShaderToy(canvas: HTMLCanvasElement, fragmentSource: string): ShaderToy | null {
  const ctx = canvas.getContext('webgl2', { antialias: false, powerPreference: 'low-power' });
  if (!ctx) return null;
  const gl: WebGL2RenderingContext = ctx; // non-nullable binding for the closures below

  let prog: WebGLProgram;
  try {
    prog = linkProgram(gl, VERT_SRC, fragmentSource);
  } catch (e) {
    console.error('[ShaderToy]', e);
    return null;
  }

  // Dummy VAO required by WebGL2 for attribute-less draws
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const uTime       = gl.getUniformLocation(prog, 'uTime');
  const uResolution = gl.getUniformLocation(prog, 'uResolution');
  const uMouse      = gl.getUniformLocation(prog, 'uMouse');

  let mx = 0.5, my = 0.5;

  function resize() {
    const dpr = Math.min(devicePixelRatio, MAX_DPR);
    const w = Math.floor(canvas.clientWidth  * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  }

  function render(timeSec: number) {
    resize();
    gl.useProgram(prog);
    gl.uniform1f(uTime,       timeSec);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uMouse,      mx, my);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function setMouse(x: number, y: number) {
    mx = x; my = y;
  }

  function dispose() {
    gl.deleteProgram(prog);
    gl.deleteVertexArray(vao);
    const ext = gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();
  }

  resize();
  return { render, setMouse, resize, dispose };
}

// ─── Fragment Shader Sources ───────────────────────────────────────────────

// Shared GLSL preamble included in every shader
const PREAMBLE = /* glsl */ `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
out vec4 fragColor;

// Spectral palette constants
const vec3 CYAN    = vec3(0.0, 0.898, 1.0);
const vec3 MAGENTA = vec3(1.0, 0.0,  0.898);
const vec3 VIOLET  = vec3(0.478, 0.361, 1.0);

// --- Hash / value noise ---
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * valueNoise(p);
    p  = p * 2.1 + vec2(3.17, 1.91);
    a *= 0.5;
  }
  return v;
}
`;

// ─── 1. CURL NOISE FLOW ───────────────────────────────────────────────────
export const CURL_FRAG = PREAMBLE + /* glsl */ `
// Curl (divergence-free) from gradient of fbm
vec2 curl(vec2 p) {
  const float e = 0.002;
  float n0 = fbm(p);
  float nx = fbm(p + vec2(e, 0.0));
  float ny = fbm(p + vec2(0.0, e));
  float ddx = (nx - n0) / e;
  float ddy = (ny - n0) / e;
  return vec2(ddy, -ddx); // perpendicular gradient → curl
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution.xy);
  float asp = uResolution.x / uResolution.y;

  // Mouse-advected coordinate
  vec2 m = uMouse * vec2(asp, 1.0);
  vec2 p = uv * vec2(asp, 1.0);

  // Domain warp: advect by curl a few times for richness
  vec2 q = p + 0.1 * curl(p * 2.0 + uTime * 0.12);
  vec2 r = q + 0.08 * curl(q * 3.0 - uTime * 0.09 + m * 0.4);

  float n1 = fbm(r * 2.5 + uTime * 0.07);
  float n2 = fbm(r * 4.0 - uTime * 0.05 + vec2(1.3, 0.7));

  // Flow magnitude drives spectral mix
  vec2 cv = curl(r * 2.0);
  float mag = length(cv) * 8.0;
  mag = clamp(mag, 0.0, 1.0);

  // Mouse proximity brightens field
  float dist = length(p - m);
  float glow = exp(-dist * dist * 3.5);

  float brightness = n1 * 0.55 + n2 * 0.3 + glow * 0.25;
  brightness *= 0.75;

  vec3 col = mix(CYAN, MAGENTA, mag) * brightness;
  col += VIOLET * glow * 0.12;

  // Vignette
  float vig = 1.0 - smoothstep(0.5, 1.2, length(uv - 0.5) * 1.6);
  col *= vig;

  fragColor = vec4(col, 1.0);
}
`;

// ─── 2. RAYMARCHED SDF ────────────────────────────────────────────────────
export const SDF_FRAG = PREAMBLE + /* glsl */ `
// SDF primitives
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Rotation helpers
vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}
vec3 rotX(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

float scene(vec3 p) {
  float t = uTime * 0.4;
  vec3 q = rotY(p, t + uMouse.x * 3.14159);
  q       = rotX(q, t * 0.53 + uMouse.y * 1.8);
  float sphere = sdSphere(q, 0.55);
  float box    = sdBox(q, vec3(0.38));
  return smin(sphere, box, 0.28);
}

vec3 normal(vec3 p) {
  const float e = 0.001;
  return normalize(vec3(
    scene(p + vec3(e,0,0)) - scene(p - vec3(e,0,0)),
    scene(p + vec3(0,e,0)) - scene(p - vec3(0,e,0)),
    scene(p + vec3(0,0,e)) - scene(p - vec3(0,0,e))
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;

  // Ray setup
  vec3 ro = vec3(0.0, 0.0, 2.2);
  vec3 rd = normalize(vec3(uv, -1.4));

  float d = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 64; i++) {
    float s = scene(ro + rd * d);
    if (s < 0.001) { hit = d; break; }
    if (d > 8.0) break;
    d += s;
  }

  vec3 col = vec3(0.0);
  if (hit > 0.0) {
    vec3 p  = ro + rd * hit;
    vec3 n  = normal(p);
    vec3 ld = normalize(vec3(1.0, 1.5, 2.0));

    float diff  = max(dot(n, ld), 0.0) * 0.8;
    float spec  = pow(max(dot(reflect(-ld, n), -rd), 0.0), 28.0) * 0.6;
    // Spectral fresnel rim
    float fresnel = pow(1.0 - abs(dot(n, -rd)), 3.5);

    vec3 baseCol = mix(CYAN, MAGENTA, fresnel);
    col = baseCol * (diff * 0.7 + 0.08) + vec3(1.0) * spec * 0.5;
    col += mix(CYAN, MAGENTA, uTime * 0.05 + 0.5) * fresnel * 0.45;
  }

  // Background subtle noise
  float bg = fbm(uv * 2.5 + uTime * 0.03) * 0.03;
  col += bg;

  // Vignette
  float vig = 1.0 - smoothstep(0.6, 1.4, length(uv) * 0.8);
  col *= vig;

  fragColor = vec4(col, 1.0);
}
`;

// ─── 3. INSTANCED LATTICE ─────────────────────────────────────────────────
export const LATTICE_FRAG = PREAMBLE + /* glsl */ `
void main() {
  vec2 uv  = gl_FragCoord.xy / uResolution.xy;
  float asp = uResolution.x / uResolution.y;
  vec2 st  = uv * vec2(asp, 1.0);

  // Mouse as ripple origin
  vec2 origin = uMouse * vec2(asp, 1.0);
  float dist = length(st - origin);

  // Grid repeat — 20 cols
  const float COLS = 20.0;
  float cellSize = asp / COLS;
  vec2 cell = floor(st / cellSize);
  vec2 local = fract(st / cellSize) - 0.5; // -0.5..0.5

  // Wave phase per cell — emanating from origin
  vec2 cellCenter = (cell + 0.5) * cellSize;
  float d = length(cellCenter - origin);
  float wave = sin(d * 14.0 - uTime * 2.8) * 0.5 + 0.5;
  wave *= exp(-d * 1.2);

  // Add base drift noise for life even far from mouse
  float noise = fbm(cell * 0.3 + uTime * 0.06);
  float activation = clamp(wave + noise * 0.3, 0.0, 1.0);

  // Cell dot: circle, size driven by activation
  float radius = mix(0.06, 0.38, activation);
  float circle = 1.0 - smoothstep(radius - 0.02, radius + 0.02, length(local));

  // Hash per cell for spectral offset
  float h = hash21(cell);
  vec3 spectral = mix(CYAN, MAGENTA, h + activation * 0.4);

  // Connector lines (hairlines between cells)
  float lx = 1.0 - smoothstep(0.0, 0.015, abs(local.x));
  float ly = 1.0 - smoothstep(0.0, 0.015, abs(local.y));
  float line = max(lx, ly) * activation * 0.2;

  vec3 col = spectral * (circle * activation * 0.9 + line);

  // Vignette
  float vig = 1.0 - smoothstep(0.4, 0.9, length(uv - 0.5) * 1.4);
  col *= vig;

  fragColor = vec4(col, 1.0);
}
`;

// ─── 4. FEEDBACK TRAILS ───────────────────────────────────────────────────
export const FEEDBACK_FRAG = PREAMBLE + /* glsl */ `
// Layered decaying echoes simulate feedback trails
// Each iteration is a temporally-offset snapshot of a moving light point

vec3 glowAt(vec2 uv, vec2 center, float radius, vec3 colour, float strength) {
  float d = length(uv - center);
  return colour * strength * exp(-d * d / (radius * radius));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float asp = uResolution.x / uResolution.y;
  vec2 p = uv * vec2(asp, 1.0);

  // Primary animated point — Lissajous-style path influenced by mouse
  float t = uTime;
  vec2 mouse = uMouse * vec2(asp, 1.0);
  float mx = mix(asp * 0.5, mouse.x, 0.55);
  float my = mix(0.5,       mouse.y, 0.55);

  vec3 col = vec3(0.0);
  const int LAYERS = 10;

  for (int i = 0; i < LAYERS; i++) {
    float fi    = float(i);
    float frac  = fi / float(LAYERS);
    float tOff  = t - fi * 0.09; // time offset per echo

    // Point trajectory (offset in time)
    vec2 pt;
    pt.x = mx + 0.22 * asp * sin(tOff * 0.9 + 1.1) * sin(tOff * 0.37);
    pt.y = my + 0.22       * cos(tOff * 0.7 + 0.5) * cos(tOff * 0.53);

    // Micro jitter from noise
    pt += (hash22(vec2(fi, fi * 3.7)) - 0.5) * 0.015;

    float decay    = pow(1.0 - frac, 2.2);
    float radius   = mix(0.025, 0.08, frac);
    float spectralT = frac + sin(tOff * 0.4) * 0.3;
    vec3  c        = mix(CYAN, MAGENTA, clamp(spectralT, 0.0, 1.0));

    col += glowAt(p, pt, radius, c, decay * 0.9);
  }

  // Faint secondary orbit (inner ring), adds complexity
  {
    float tOff = t * 1.3;
    vec2 pt2;
    pt2.x = mx + 0.10 * asp * cos(tOff * 1.1);
    pt2.y = my + 0.10       * sin(tOff * 1.4);
    col += glowAt(p, pt2, 0.018, VIOLET, 0.5);
  }

  // Subtle background nebula
  float bg = fbm(uv * 3.0 + t * 0.04) * 0.04;
  col += bg * VIOLET;

  // Vignette
  float vig = 1.0 - smoothstep(0.5, 1.1, length(uv - 0.5) * 1.5);
  col *= vig;

  fragColor = vec4(col, 1.0);
}
`;

/** Map from experiment id to fragment shader source */
export const SHADER_MAP: Record<string, string> = {
  curl:     CURL_FRAG,
  sdf:      SDF_FRAG,
  lattice:  LATTICE_FRAG,
  feedback: FEEDBACK_FRAG,
};
