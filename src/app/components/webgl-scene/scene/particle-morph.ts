import * as THREE from 'three';
import { createGpgpu, type Gpgpu } from './gpgpu';
import { sampleTextPoints } from './text-sampler';
import {
  GPGPU_POSITION_FRAG,
  GPGPU_VELOCITY_FRAG,
  POINTS_VERTEX,
  POINTS_FRAGMENT,
} from './shaders';
import { PALETTE } from './palette';

/** Per-frame simulation parameters fed by the scene engine. */
export interface ParticleMorphStep {
  dt: number;
  time: number;
  mouseWorld: THREE.Vector3;
  from: number; // current target shape index
  to: number; // next target shape index
  morph: number; // 0..1 blend from→to
  attract: number;
  curl: number;
  repel: number;
  damping: number;
  noiseScale: number;
  fade: number; // render opacity (1 in hero → 0 under content)
}

export interface ParticleMorph {
  points: THREE.Points;
  pointCount: number;
  shapeCount: number;
  update(step: ParticleMorphStep): void;
  dispose(): void;
}

// ── Morph-target shape generators (each returns a Float32Array of count*3) ──

/** Diffuse cloud filling a sphere volume — the "flow" resting state. */
function flowCloud(count: number): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.0 * Math.cbrt(Math.random());
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    a[i * 3] = r * s * Math.cos(th);
    a[i * 3 + 1] = r * s * Math.sin(th) * 0.82;
    a[i * 3 + 2] = r * u;
  }
  return a;
}

/** Evenly distributed Fibonacci sphere shell — the structured "lattice". */
function fibSphere(count: number, radius = 2.2): Float32Array {
  const a = new Float32Array(count * 3);
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    a[i * 3] = Math.cos(th) * r * radius;
    a[i * 3 + 1] = y * radius;
    a[i * 3 + 2] = Math.sin(th) * r * radius;
  }
  return a;
}

/** Pack a count*3 position array into a size×size RGBA float DataTexture. */
function positionsToTexture(src: Float32Array, size: number): THREE.DataTexture {
  const n = size * size;
  const data = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    data[i * 4] = src[i * 3] || 0;
    data[i * 4 + 1] = src[i * 3 + 1] || 0;
    data[i * 4 + 2] = src[i * 3 + 2] || 0;
    data[i * 4 + 3] = 1;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  tex.needsUpdate = true;
  return tex;
}

/**
 * GPGPU particle morph — the hero showpiece. `count` = size² points simulated
 * in FBO ping-pong, advected by curl noise and sprung toward a cycling set of
 * morph targets: flow cloud → "MARCOS" → "AI ENGINEER" → lattice.
 */
export function createParticleMorph(renderer: THREE.WebGLRenderer, size: number): ParticleMorph {
  const count = size * size;
  const dpr = renderer.getPixelRatio();

  // Target order matters — the scene engine cycles through these indices.
  const shapes: Float32Array[] = [
    flowCloud(count), // 0
    sampleTextPoints('MARCOS', count, { worldWidth: 5, fontWeight: 800 }), // 1
    sampleTextPoints('AI ENGINEER', count, { worldWidth: 6, fontWeight: 700 }), // 2
    fibSphere(count, 1.6), // 3
  ];
  const targetTex = shapes.map(s => positionsToTexture(s, size));

  const gpgpu: Gpgpu = createGpgpu(renderer, size, {
    positionShader: GPGPU_POSITION_FRAG,
    velocityShader: GPGPU_VELOCITY_FRAG,
    fillPosition: data => {
      const s = shapes[0]; // start as the flow cloud
      for (let i = 0; i < count; i++) {
        data[i * 4] = s[i * 3];
        data[i * 4 + 1] = s[i * 3 + 1];
        data[i * 4 + 2] = s[i * 3 + 2];
        data[i * 4 + 3] = 1;
      }
    },
    fillVelocity: data => data.fill(0),
    posUniforms: { uDt: { value: 0 } },
    velUniforms: {
      uTime: { value: 0 },
      uDt: { value: 0 },
      uCurl: { value: 1 },
      uAttract: { value: 1 },
      uRepel: { value: 1 },
      uDamping: { value: 0.9 },
      uNoiseScale: { value: 0.25 },
      uMouse: { value: new THREE.Vector3() },
      uMorph: { value: 0 },
      uTarget: { value: targetTex[0] },
      uTargetNext: { value: targetTex[1] },
    },
  });

  // Render geometry: one vertex per simulation texel, carrying its texel ref.
  const refs = new Float32Array(count * 2);
  const seeds = new Float32Array(count);
  const dummyPos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    refs[i * 2] = ((i % size) + 0.5) / size;
    refs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(dummyPos, 3));
  geometry.setAttribute('aRef', new THREE.BufferAttribute(refs, 2));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const renderUniforms: Record<string, THREE.IUniform> = {
    uPosTex: { value: gpgpu.getPosition() },
    uVelTex: { value: gpgpu.getVelocity() },
    uSize: { value: 1.0 },
    uPixelRatio: { value: dpr },
    uCyan: { value: new THREE.Color(PALETTE.cyan) },
    uViolet: { value: new THREE.Color(PALETTE.violet) },
    uMagenta: { value: new THREE.Color(PALETTE.magenta) },
    uFade: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: renderUniforms,
    vertexShader: POINTS_VERTEX,
    fragmentShader: POINTS_FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    pointCount: count,
    shapeCount: shapes.length,
    update(step) {
      const v = gpgpu.velUniforms;
      v['uTime'].value = step.time;
      v['uDt'].value = step.dt;
      v['uCurl'].value = step.curl;
      v['uAttract'].value = step.attract;
      v['uRepel'].value = step.repel;
      v['uDamping'].value = step.damping;
      v['uNoiseScale'].value = step.noiseScale;
      (v['uMouse'].value as THREE.Vector3).copy(step.mouseWorld);
      v['uMorph'].value = step.morph;
      v['uTarget'].value = targetTex[step.from];
      v['uTargetNext'].value = targetTex[step.to];
      gpgpu.posUniforms['uDt'].value = step.dt;

      gpgpu.compute();

      renderUniforms['uPosTex'].value = gpgpu.getPosition();
      renderUniforms['uVelTex'].value = gpgpu.getVelocity();
      renderUniforms['uFade'].value = step.fade;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      targetTex.forEach(t => t.dispose());
      gpgpu.dispose();
    },
  };
}
