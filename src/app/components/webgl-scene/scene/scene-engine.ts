import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { createParticleMorph } from './particle-morph';
import { createGridBackdrop } from './grid-backdrop';
import { createParticles } from './particles';

/** Live state pulled from the host each frame (Angular signals under the hood). */
export interface SceneState {
  cursorX: number; // px
  cursorY: number; // px
  scroll: number; // 0..1 of document
}

/** Real renderer stats surfaced to the HUD. */
export interface SceneStats {
  fps: number;
  ms: number;
  triangles: number;
  calls: number;
  points: number;
}

export interface SceneOptions {
  /** 'high' = desktop (bloom, 256² sim, dense dust); 'low' = mobile/weak GPU (128²). */
  quality: 'high' | 'low';
  /** Called if the GL context is lost, so the host can restore the CSS fallback. */
  onLost?: () => void;
  /** Throttled live render stats for the HUD (~10 Hz). */
  onStats?: (s: SceneStats) => void;
}

export interface SceneHandle {
  dispose(): void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// Per-target-shape force weights (index order matches particle-morph shapes:
// 0 flow cloud · 1 "MARCOS" · 2 "AI ENGINEER" · 3 lattice). Text pulls hard with
// little turbulence so it stays legible; the cloud is loose and curl-dominated.
const ATTRACT = [0.55, 2.6, 2.6, 2.1];
const CURL = [1.25, 0.35, 0.35, 0.6];
const DAMP = [0.9, 0.86, 0.86, 0.88];

const HOLD = 4.2; // seconds a shape is held
const MORPH_T = 1.9; // seconds to morph to the next shape
const PERIOD = HOLD + MORPH_T;

/**
 * Builds the GPGPU particle-morph showpiece + grid backdrop + ambient dust and
 * starts the loop. Everything Three.js-related lives behind this module so it is
 * lazily imported as its own chunk — keeping the main bundle free of WebGL.
 */
export function createScene(
  canvas: HTMLCanvasElement,
  getState: () => SceneState,
  opts: SceneOptions,
): SceneHandle {
  THREE.ColorManagement.enabled = true;

  const high = opts.quality === 'high';
  const simSize = high ? 192 : 112; // ~37k / ~12.5k points (perf-tuned)
  const dustCount = high ? 220 : 90;
  const maxDpr = high ? 1.5 : 1;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  let renderer: THREE.WebGLRenderer | null = null;
  let morph: ReturnType<typeof createParticleMorph> | null = null;
  let grid: ReturnType<typeof createGridBackdrop> | null = null;
  let dust: ReturnType<typeof createParticles> | null = null;
  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;
  let outputPass: OutputPass | null = null;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // additive points don't benefit; bloom hides edges
      alpha: false,
      stencil: false,
      depth: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x07080a, 1);
    // Manual reset so the HUD stats accumulate the whole frame (all composer
    // passes), not just the last one read after composer.render().
    renderer.info.autoReset = false;

    morph = createParticleMorph(renderer, simSize);
    grid = createGridBackdrop(width, height);
    dust = createParticles(dustCount, dpr);

    scene.add(grid.mesh);
    scene.add(morph.points);
    scene.add(dust.points);

    if (high) {
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
      composer.addPass(new RenderPass(scene, camera));
      // strength, radius, threshold — glow the bright spectral points.
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.5, 0.2);
      composer.addPass(bloomPass);
      outputPass = new OutputPass();
      composer.addPass(outputPass);
    }
  } catch (err) {
    morph?.dispose();
    grid?.dispose();
    dust?.dispose();
    bloomPass?.dispose();
    outputPass?.dispose();
    composer?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    throw err;
  }

  const r = renderer;
  const theMorph = morph;
  const theGrid = grid;
  const theDust = dust;
  const shapeCount = theMorph.shapeCount;

  // ── Smoothed input + self-tracked time ──────────────────────
  let mx = 0.5;
  let my = 0.5;
  let smoothScroll = 0;
  let elapsed = 0; // accumulated from clamped dt — immune to tab-hide jumps
  let parity = 0;
  const clock = new THREE.Clock();
  const mouseWorld = new THREE.Vector3();
  const FOV_T = Math.tan((45 * Math.PI) / 180 / 2);

  // ── Stats (throttled) ───────────────────────────────────────
  let smFps = 60;
  let smMs = 16.7;
  let statTick = 0;

  function frame() {
    const state = getState();
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const time = elapsed;

    const targetMx = state.cursorX / Math.max(width, 1);
    const targetMy = state.cursorY / Math.max(height, 1);
    mx = lerp(mx, targetMx, 0.08);
    my = lerp(my, targetMy, 0.08);
    smoothScroll = lerp(smoothScroll, state.scroll, 0.08);

    const cx = mx - 0.5;
    const cy = my - 0.5;

    // Spectacle fades as the hero scrolls away, calming the bg under content.
    const fade = 1 - smoothstep(0.05, 0.24, smoothScroll);

    // Once invisible under content, halve the framerate (skip compute + render).
    parity++;
    if (fade < 0.015 && parity % 2 === 1) return;

    // ── Cursor → world point on the z=0 plane (for repulsion) ──
    const camDist = camera.position.z;
    const halfH = FOV_T * camDist;
    const halfW = halfH * (width / Math.max(height, 1));
    mouseWorld.set((mx - 0.5) * 2 * halfW, (0.5 - my) * 2 * halfH, 0);

    // ── Morph schedule: cycle shapes on a hold→morph timer ──
    const cyc = time / PERIOD;
    const from = Math.floor(cyc) % shapeCount;
    const to = (from + 1) % shapeCount;
    const local = time - Math.floor(cyc) * PERIOD; // 0..PERIOD
    const m = local <= HOLD ? 0 : smoothstep(0, 1, (local - HOLD) / MORPH_T);

    theMorph.update({
      dt,
      time,
      mouseWorld,
      from,
      to,
      morph: m,
      attract: lerp(ATTRACT[from], ATTRACT[to], m),
      curl: lerp(CURL[from], CURL[to], m),
      repel: 1.4,
      damping: lerp(DAMP[from], DAMP[to], m),
      noiseScale: 0.25,
      fade,
    });

    // Gentle global rotation + cursor tilt + scroll shrink of the point cloud.
    theMorph.points.rotation.y += dt * 0.05;
    theMorph.points.rotation.x = lerp(theMorph.points.rotation.x, -cy * 0.35, 0.04);
    theMorph.points.rotation.z = lerp(theMorph.points.rotation.z, cx * 0.22, 0.04);
    theMorph.points.scale.setScalar(Math.max(0.6, 1 - smoothScroll * 0.28));

    // ── Grid backdrop ──
    theGrid.uniforms['uTime'].value = time;
    (theGrid.uniforms['uMouse'].value as THREE.Vector2).set(mx, 1 - my);
    theGrid.uniforms['uScroll'].value = smoothScroll;
    theGrid.uniforms['uFade'].value = fade;

    // ── Dust ──
    theDust.uniforms['uTime'].value = time;
    (theDust.uniforms['uMouse'].value as THREE.Vector2).set(cx * 2, -cy * 2);
    theDust.uniforms['uScroll'].value = smoothScroll;
    theDust.uniforms['uFade'].value = fade;
    theDust.points.rotation.y = cx * 0.12;

    // Slight camera dolly-back as the page scrolls.
    camera.position.z = lerp(camera.position.z, 6 + smoothScroll * 2.2, 0.05);

    // GPUComputationRenderer restores the render target, but be explicit so the
    // non-composer (low) path always draws to the screen. Reset stats here so
    // they reflect the visible scene + post passes (not the GPGPU compute).
    r.info.reset();
    r.setRenderTarget(null);
    if (composer) composer.render();
    else r.render(scene, camera);

    // ── Stats (≈10 Hz) ──
    const instFps = dt > 0 ? 1 / dt : 60;
    smFps = lerp(smFps, instFps, 0.1);
    smMs = lerp(smMs, dt * 1000, 0.1);
    if (opts.onStats && ++statTick % 6 === 0) {
      const info = r.info.render;
      opts.onStats({
        fps: smFps,
        ms: smMs,
        triangles: info.triangles,
        calls: info.calls,
        points: info.points,
      });
    }
  }

  r.setAnimationLoop(frame);

  // ── Resize (rAF-coalesced) ──────────────────────────────────
  let resizeQueued = false;
  function applyResize() {
    resizeQueued = false;
    width = window.innerWidth;
    height = window.innerHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    r.setSize(width, height, false);
    (theGrid.uniforms['uResolution'].value as THREE.Vector2).set(width, height);
    composer?.setSize(width, height);
  }
  function onResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(applyResize);
  }
  window.addEventListener('resize', onResize, { passive: true });

  // ── Pause when the tab is hidden ────────────────────────────
  function onVisibility() {
    if (document.hidden) {
      r.setAnimationLoop(null);
    } else {
      clock.getDelta(); // discard the long pause
      r.setAnimationLoop(frame);
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  // ── Graceful degradation on GPU context loss ────────────────
  function onContextLost(e: Event) {
    e.preventDefault();
    r.setAnimationLoop(null);
    opts.onLost?.();
  }
  canvas.addEventListener('webglcontextlost', onContextLost, false);

  return {
    dispose() {
      r.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      theMorph.dispose();
      theGrid.dispose();
      theDust.dispose();
      bloomPass?.dispose();
      outputPass?.dispose();
      composer?.dispose();
      r.dispose();
      r.forceContextLoss();
    },
  };
}
