import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { createLiquidOrb } from './liquid-orb';
import { createFlowField } from './flow-field';
import { createParticles } from './particles';

/** Live state pulled from the host each frame (Angular signals under the hood). */
export interface SceneState {
  cursorX: number; // px
  cursorY: number; // px
  scroll: number; // 0..1 of document
}

export interface SceneOptions {
  /** 'high' = desktop (bloom, dense dust, detailed orb); 'low' = mobile/weak GPU. */
  quality: 'high' | 'low';
  /** Called if the GL context is lost, so the host can restore the CSS fallback. */
  onLost?: () => void;
}

export interface SceneHandle {
  dispose(): void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Creates the full liquid-metal scene on the given canvas and starts its loop.
 * Everything Three.js-related lives behind this module so it can be lazily
 * imported as a separate chunk — keeping the main bundle free of WebGL.
 */
export function createLiquidScene(
  canvas: HTMLCanvasElement,
  getState: () => SceneState,
  opts: SceneOptions,
): SceneHandle {
  THREE.ColorManagement.enabled = true;

  const high = opts.quality === 'high';
  const detail = high ? 5 : 4;
  const particleCount = high ? 420 : 150;
  const maxDpr = high ? 1.75 : 1;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Allocated inside the try so a partial init can release any GPU resources
  // it managed to create before re-throwing.
  let renderer: THREE.WebGLRenderer | null = null;
  let orb: ReturnType<typeof createLiquidOrb> | null = null;
  let field: ReturnType<typeof createFlowField> | null = null;
  let particles: ReturnType<typeof createParticles> | null = null;
  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;
  let outputPass: OutputPass | null = null;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: high,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x090a0c, 1);

    orb = createLiquidOrb(detail);
    field = createFlowField(width, height);
    particles = createParticles(particleCount, dpr);

    scene.add(field.mesh);
    scene.add(orb.mesh);
    scene.add(particles.points);

    // Post-processing (desktop only).
    if (high) {
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
      composer.addPass(new RenderPass(scene, camera));
      // strength, radius, threshold — restrained glow only on the brightest edge.
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.2, 0.4, 0.62);
      composer.addPass(bloomPass);
      outputPass = new OutputPass();
      composer.addPass(outputPass);
    }
  } catch (err) {
    orb?.dispose();
    field?.dispose();
    particles?.dispose();
    bloomPass?.dispose();
    outputPass?.dispose();
    composer?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    throw err;
  }

  const r = renderer;
  const theOrb = orb;
  const theField = field;
  const theDust = particles;

  // ── Smoothed input + self-tracked time ──────────────────────
  let mx = 0.5; // 0..1
  let my = 0.5;
  let smoothScroll = 0;
  let elapsed = 0; // accumulated from clamped dt — immune to tab-hide jumps
  let parity = 0;
  const clock = new THREE.Clock();

  function frame() {
    const state = getState();
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const time = elapsed;

    // Smooth the raw inputs for buttery motion (cached dims, no reflow).
    const targetMx = state.cursorX / Math.max(width, 1);
    const targetMy = state.cursorY / Math.max(height, 1);
    mx = lerp(mx, targetMx, 0.06);
    my = lerp(my, targetMy, 0.06);
    smoothScroll = lerp(smoothScroll, state.scroll, 0.08);

    const cx = mx - 0.5; // -0.5..0.5
    const cy = my - 0.5;

    // ── Orb choreography ──
    theOrb.uniforms['uTime'].value = time;
    const orbProgress = Math.min(smoothScroll / 0.16, 1); // hero zone
    theOrb.mesh.position.y = orbProgress * 4.8 + Math.sin(time * 0.5) * 0.05;
    theOrb.mesh.position.z = -orbProgress * 1.6;
    theOrb.mesh.scale.setScalar(1.55 * (1 - orbProgress * 0.3));
    theOrb.uniforms['uRim'].value = Math.max(0.12, 1 - orbProgress * 0.85);
    theOrb.mesh.rotation.y += dt * 0.03;
    theOrb.mesh.rotation.x = lerp(theOrb.mesh.rotation.x, -cy * 0.5, 0.04);
    theOrb.mesh.rotation.z = lerp(theOrb.mesh.rotation.z, cx * 0.35, 0.04);

    // Spectacle fades as the hero scrolls away, calming the bg under content.
    const fade = 1 - smoothstep(0.04, 0.2, smoothScroll);

    // ── Field ──
    theField.uniforms['uTime'].value = time;
    (theField.uniforms['uMouse'].value as THREE.Vector2).set(mx, 1 - my);
    theField.uniforms['uScroll'].value = smoothScroll;
    theField.uniforms['uFade'].value = fade;

    // ── Dust ──
    theDust.uniforms['uTime'].value = time;
    (theDust.uniforms['uMouse'].value as THREE.Vector2).set(cx * 2, -cy * 2);
    theDust.uniforms['uScroll'].value = smoothScroll;
    theDust.uniforms['uFade'].value = fade;
    theDust.points.rotation.y = cx * 0.15;
    theDust.points.rotation.x = cy * 0.15;

    // Once the orb has fully receded, nothing bright is on screen and the
    // slow-evolving field needs little refresh — drop to ~30fps to save GPU.
    parity++;
    if (orbProgress > 0.985 && parity % 2 === 1) return;

    if (composer) composer.render();
    else r.render(scene, camera);
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
    (theField.uniforms['uResolution'].value as THREE.Vector2).set(width, height);
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
      clock.getDelta(); // discard the long pause (elapsed is dt-clamped anyway)
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
      theOrb.dispose();
      theField.dispose();
      theDust.dispose();
      bloomPass?.dispose();
      outputPass?.dispose();
      composer?.dispose();
      r.dispose();
      r.forceContextLoss();
    },
  };
}
