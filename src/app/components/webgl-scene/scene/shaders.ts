/**
 * GLSL building blocks for the liquid-metal scene.
 *
 * Shaders are kept as plain template strings so no extra build tooling
 * (glslify / raw-loader) is required — Angular's esbuild bundles them as
 * part of the lazily-loaded scene chunk.
 *
 * All colours arriving in uniforms are LINEAR (THREE.Color with
 * ColorManagement enabled). The final OutputPass / renderer converts the
 * composited frame back to sRGB, so shader code works in linear space.
 */

/** Canonical Ashima/Stefan Gustavson simplex noise + fbm helper. */
export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// 4 octaves — used by the orb where the silhouette detail matters.
float fbm(vec3 p){
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++){
    value += amp * snoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return value;
}

// 3 octaves — cheaper variant for the fullscreen background field.
float fbmLite(vec3 p){
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++){
    value += amp * snoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return value;
}
`;

/* ────────────────────────────────────────────────────────────
   LIQUID-METAL ORB
   Icosphere (radius 1) displaced along its normal by fbm. Normals
   are recomputed via a tangent-basis finite difference so the
   specular/fresnel stays crisp on the morphing surface.
   ──────────────────────────────────────────────────────────── */
export const ORB_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uDisplace;
uniform float uFreq;
uniform float uSpeed;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDisp;

${NOISE_GLSL}

float getDisp(vec3 dir){
  return fbm(dir * uFreq + vec3(0.0, 0.0, uTime * uSpeed));
}

void main(){
  // For an icosphere the surface normal is just the normalised position.
  vec3 N = normalize(position);

  // Orthonormal tangent basis around N (T, B, N is right-handed).
  vec3 up = abs(N.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 T = normalize(cross(up, N));
  vec3 Bt = cross(N, T);

  float eps = 0.035;
  vec3 nO = N;
  vec3 nT = normalize(N + T * eps);
  vec3 nB = normalize(N + Bt * eps);

  float dO = getDisp(nO);
  float dT = getDisp(nT);
  float dB = getDisp(nB);

  // Displace each sample along its own outward normal.
  vec3 sO = nO + nO * dO * uDisplace;
  vec3 sT = nT + nT * dT * uDisplace;
  vec3 sB = nB + nB * dB * uDisplace;

  vec3 newNormal = normalize(cross(sT - sO, sB - sO));

  vec4 worldPos = modelMatrix * vec4(sO, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * newNormal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  vDisp = dO;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const ORB_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uRim;
uniform vec3 uColorDeep;
uniform vec3 uColorSteel;
uniform vec3 uColorChamp;
uniform vec3 uColorSoft;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying float vDisp;

void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.1);

  // Two virtual lights — a cool key and a warm champagne fill.
  vec3 keyL = normalize(vec3(0.45, 0.7, 0.55));
  vec3 fillL = normalize(vec3(-0.6, -0.2, 0.4));
  float keyDiff = clamp(dot(N, keyL), 0.0, 1.0);
  float fillDiff = clamp(dot(N, fillL), 0.0, 1.0);

  vec3 H = normalize(keyL + V);
  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 80.0);

  // Iridescent thin-film, but confined to the steel↔champagne palette.
  float irid = 0.5 + 0.5 * sin(fres * 5.5 + vDisp * 7.0 + uTime * 0.5);
  vec3 sheen = mix(uColorSteel, uColorChamp, irid);

  vec3 col = uColorDeep;
  col += uColorSteel * keyDiff * 0.22;
  col += uColorChamp * fillDiff * 0.07;
  col += sheen * fres * uRim * 0.55;          // restrained rim
  col += uColorSoft * spec * 0.4;             // restrained specular
  col = mix(col, uColorChamp, spec * 0.18);

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ────────────────────────────────────────────────────────────
   BACKGROUND FLOW-FIELD
   Fullscreen quad (drawn first, depth disabled). Domain-warped fbm
   in the steel & champagne palette, kept deliberately dark so the
   glass UI stays legible.
   ──────────────────────────────────────────────────────────── */
export const FIELD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = position.xy * 0.5 + 0.5;
  // Pin to clip space near the far plane; orb & particles draw over it.
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const FIELD_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;     // 0..1
uniform float uScroll;   // 0..1
uniform float uFade;     // 1 in hero, →0 once scrolled into content
uniform vec3 uColorBg;
uniform vec3 uColorDeep;
uniform vec3 uColorSteel;
uniform vec3 uColorChamp;

varying vec2 vUv;

${NOISE_GLSL}

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  vec2 p = (uv - 0.5);
  p.x *= aspect;

  float t = uTime * 0.04;

  // Single domain-warp pass of cheaper 3-octave fbm. Three evaluations
  // total (9 simplex calls/px) — the field is low-frequency and heavily
  // dimmed/vignetted, so the dropped detail is imperceptible.
  vec2 q = vec2(
    fbmLite(vec3(p * 1.4, t)),
    fbmLite(vec3(p * 1.4 + 5.2, t))
  );
  float n = fbmLite(vec3(p * 1.4 + q * 1.7, t));
  n = n * 0.5 + 0.5;

  // Soft glow trailing the cursor.
  vec2 m = (uMouse - 0.5);
  m.x *= aspect;
  float glow = smoothstep(0.55, 0.0, length(p - m)) * 0.14;

  vec3 col = uColorBg;
  col = mix(col, uColorDeep, smoothstep(0.25, 0.85, n));
  col = mix(col, uColorSteel * 0.42, smoothstep(0.55, 0.97, n + q.x * 0.2));
  col += uColorChamp * pow(smoothstep(0.72, 1.0, n), 3.0) * 0.22;  // champagne filaments
  col += uColorSteel * glow;

  // Scroll lifts the field very slightly as you travel down the page.
  col *= 0.92 + uScroll * 0.16;

  // Vignette toward the corners keeps focus centred.
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col *= mix(0.6, 0.92, vig);

  // Keep the field deep and moody so glass UI stays legible.
  col *= 0.8;

  // Concentrate the spectacle in the hero: once scrolled into content the
  // field calms to a faint texture so solid panels read on near-black.
  col *= mix(0.1, 1.0, uFade);

  // Hashed grain to defeat banding on the dark gradient.
  float g = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.018;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ────────────────────────────────────────────────────────────
   AMBIENT PARTICLE DUST
   Additive points drifting slowly with a touch of mouse parallax.
   ──────────────────────────────────────────────────────────── */
export const PARTICLE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform vec2 uMouse;     // -1..1
uniform float uScroll;
uniform float uFade;     // 1 in hero, →0 in content

attribute float aScale;
attribute float aSeed;

varying float vAlpha;

void main(){
  vec3 p = position;
  float s = aSeed * 6.2831853;

  // Lazy drift.
  p.x += cos(uTime * 0.08 + s) * 0.35;
  p.y += sin(uTime * 0.10 + s * 1.3) * 0.35;

  // Depth-aware mouse parallax — nearer dust reacts more.
  float depth = clamp((p.z + 6.0) / 12.0, 0.0, 1.0);
  p.xy += uMouse * mix(0.05, 0.6, depth);

  // The field scrolls gently upward with the page.
  p.y += uScroll * 2.0;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (260.0 / -mv.z);

  vAlpha = mix(0.05, 0.4, aScale) * uFade;
}
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

/* ════════════════════════════════════════════════════════════════════════
   PARTICLE-MORPH SHOWPIECE (GPGPU)
   A position/velocity simulation run in FBO ping-pong by GPUComputationRenderer.
   The velocity field = divergence-free curl noise (organic flow) + spring
   attraction toward a morph target + soft cursor repulsion. Targets cycle
   between an abstract cloud, text point-clouds, and a structured lattice.
   ════════════════════════════════════════════════════════════════════════ */

/** Curl (divergence-free) noise built from the simplex `snoise` above. */
export const CURL_GLSL = /* glsl */ `
vec3 snoiseVec3(vec3 x){
  float s  = snoise(x);
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}
vec3 curlNoise(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);
  float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
  float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
  float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);
  return normalize(vec3(x, y, z) / (2.0 * e) + 1e-6);
}
`;

/**
 * GPGPU position update. `texturePosition` / `textureVelocity` and `resolution`
 * are injected by GPUComputationRenderer — do NOT redeclare them.
 */
export const GPGPU_POSITION_FRAG = /* glsl */ `
uniform float uDt;
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  pos += vel * uDt;
  gl_FragColor = vec4(pos, 1.0);
}
`;

/** GPGPU velocity update: curl flow + target spring + cursor repulsion + damping. */
export const GPGPU_VELOCITY_FRAG = /* glsl */ `
${NOISE_GLSL}
${CURL_GLSL}
uniform float uTime;
uniform float uDt;
uniform float uCurl;
uniform float uAttract;
uniform float uRepel;
uniform float uDamping;
uniform float uNoiseScale;
uniform vec3  uMouse;       // world-space cursor on z=0 plane
uniform float uMorph;       // 0..1 blend between target A and B
uniform sampler2D uTarget;
uniform sampler2D uTargetNext;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec3 tA = texture2D(uTarget, uv).xyz;
  vec3 tB = texture2D(uTargetNext, uv).xyz;
  vec3 target = mix(tA, tB, uMorph);

  // Organic divergence-free flow.
  vec3 flow = curlNoise(pos * uNoiseScale + vec3(0.0, 0.0, uTime * 0.06)) * uCurl;

  // Spring toward the morph target.
  vec3 attract = (target - pos) * uAttract;

  // Soft inverse-square cursor repulsion.
  vec3 d = pos - uMouse;
  float dist2 = dot(d, d) + 0.25;
  vec3 repel = (d / sqrt(dist2)) * (uRepel / dist2);

  vel += (flow + attract + repel) * uDt;
  vel *= uDamping;

  gl_FragColor = vec4(vel, 1.0);
}
`;

/** Render the simulated points; colour mapped to the spectral gradient by speed/height. */
export const POINTS_VERTEX = /* glsl */ `
uniform sampler2D uPosTex;
uniform sampler2D uVelTex;
uniform float uSize;
uniform float uPixelRatio;

attribute vec2 aRef;   // this point's texel in the sim textures
attribute float aSeed;

varying float vSpeed;
varying float vSeed;
varying vec3 vPos;

void main(){
  vec3 pos = texture2D(uPosTex, aRef).xyz;
  vec3 vel = texture2D(uVelTex, aRef).xyz;
  vSpeed = length(vel);
  vSeed = aSeed;
  vPos = pos;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.55 + vSpeed * 6.0 + aSeed * 0.5);
  gl_PointSize = size * uPixelRatio * (170.0 / -mv.z);
}
`;

export const POINTS_FRAGMENT = /* glsl */ `
uniform vec3 uCyan;
uniform vec3 uMagenta;
uniform float uFade;

varying float vSpeed;
varying float vSeed;
varying vec3 vPos;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  if (a < 0.02) discard;

  float t = clamp(vSpeed * 4.0 + (vPos.y + 2.0) * 0.12, 0.0, 1.0);
  vec3 col = mix(uCyan, uMagenta, t);
  col += vec3(0.20) * pow(a, 2.0);   // hot core trending to white

  gl_FragColor = vec4(col, a * uFade);
}
`;

/* ════════════════════════════════════════════════════════════════════════
   GRID BACKDROP
   Fullscreen quad pinned to the far plane drawing a dim Tron-style perspective
   floor + ceiling grid with a spectral horizon glow — depth coherent with the
   CSS blueprint chrome. Replaces the old flow-field.
   ════════════════════════════════════════════════════════════════════════ */
export const GRID_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const GRID_FRAGMENT = /* glsl */ `
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;    // 0..1
uniform float uScroll;
uniform float uFade;    // 1 in hero, →0 in content
uniform vec3 uBg;
uniform vec3 uCyan;
uniform vec3 uMagenta;

varying vec2 vUv;

float gridLines(vec2 c){
  vec2 g = abs(fract(c) - 0.5);
  float line = min(g.x, g.y);
  return 1.0 - smoothstep(0.0, 0.045, line);
}

void main(){
  vec2 uv = (vUv * 2.0 - 1.0);
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  uv.x *= aspect;

  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = normalize(vec3(uv, -1.5));

  vec3 col = uBg;

  // Floor (i=0) + ceiling (i=1) perspective grids.
  for (int i = 0; i < 2; i++){
    float planeY = (i == 0) ? -2.4 : 2.4;
    float t = (planeY - ro.y) / rd.y;
    if (t > 0.0){
      vec3 p = ro + rd * t;
      vec2 cell = p.xz * 0.6 + vec2(0.0, uTime * 0.22);
      float g = gridLines(cell);
      float fade = exp(-t * 0.10);
      vec3 lc = mix(uCyan, uMagenta, clamp(p.x * 0.05 + 0.5, 0.0, 1.0));
      col += lc * g * fade * 0.06;
    }
  }

  // Spectral horizon glow band.
  float horizon = exp(-abs(uv.y) * 4.0);
  col += mix(uCyan, uMagenta, uv.x * 0.5 + 0.5) * horizon * 0.04;

  // Faint cursor lift.
  vec2 m = (uMouse * 2.0 - 1.0); m.x *= aspect;
  col += mix(uCyan, uMagenta, 0.5) * smoothstep(0.8, 0.0, length(uv - m)) * 0.02;

  // Calm under content.
  col *= mix(0.16, 1.0, uFade);

  // Hashed grain to defeat banding.
  float gn = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (gn - 0.5) * 0.014;

  gl_FragColor = vec4(col, 1.0);
}
`;
