import * as THREE from 'three';
import { GRID_VERTEX, GRID_FRAGMENT } from './shaders';
import { PALETTE } from './palette';

export interface GridBackdrop {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  dispose(): void;
}

/**
 * Far-plane quad drawing a dim Tron-style perspective grid (floor + ceiling)
 * with a spectral horizon glow. Depth-coherent with the CSS blueprint chrome;
 * replaces the old noise flow-field as the scene backdrop.
 */
export function createGridBackdrop(width: number, height: number): GridBackdrop {
  const geometry = new THREE.PlaneGeometry(2, 2);

  const uniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(width, height) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
    uFade: { value: 1 },
    uBg: { value: new THREE.Color(PALETTE.bg) },
    uCyan: { value: new THREE.Color(PALETTE.cyan) },
    uMagenta: { value: new THREE.Color(PALETTE.magenta) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: GRID_VERTEX,
    fragmentShader: GRID_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1; // draw first, behind the particles

  return {
    mesh,
    uniforms,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
