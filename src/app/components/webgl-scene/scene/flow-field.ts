import * as THREE from 'three';
import { FIELD_VERTEX, FIELD_FRAGMENT } from './shaders';
import { PALETTE } from './palette';

export interface FlowField {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  dispose(): void;
}

/**
 * Fullscreen background quad. Pinned to the far plane in clip space with depth
 * writes off, so it always paints behind the orb and dust regardless of camera.
 */
export function createFlowField(width: number, height: number): FlowField {
  const geometry = new THREE.PlaneGeometry(2, 2);

  const uniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(width, height) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
    uFade: { value: 1 },
    uColorBg: { value: new THREE.Color(PALETTE.bg) },
    uColorDeep: { value: new THREE.Color(PALETTE.steelStrong).multiplyScalar(0.5) },
    uColorSteel: { value: new THREE.Color(PALETTE.steel) },
    uColorChamp: { value: new THREE.Color(PALETTE.champagne) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FIELD_VERTEX,
    fragmentShader: FIELD_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1; // draw first

  return {
    mesh,
    uniforms,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
