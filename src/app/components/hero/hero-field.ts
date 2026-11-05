/**
 * One quiet object behind the hero. Loaded with a dynamic import so
 * `three` stays out of the main bundle. No postprocessing, no particles.
 */
export interface HeroField {
  destroy: () => void;
  setPointer: (x: number, y: number) => void;
}

export async function mountHeroField(canvas: HTMLCanvasElement): Promise<HeroField> {
  const THREE = await import('three');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 0.05, 4.1);

  const geometry = new THREE.IcosahedronGeometry(1.15, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2c2a28,
    metalness: 0.08,
    roughness: 0.78,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xf4f1ea, 0.85));
  const key = new THREE.DirectionalLight(0xfffaf3, 1.6);
  key.position.set(2.4, 2.2, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8ea0c8, 0.7);
  rim.position.set(-2.5, -1.2, -1);
  scene.add(rim);

  const pointer = { x: 0, y: 0 };
  let raf = 0;
  let running = true;
  let visible = true;
  const clock = new THREE.Clock();

  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible && running) {
      clock.getDelta();
      raf = requestAnimationFrame(loop);
    }
  });
  visibility.observe(canvas);

  const onHide = () => {
    if (document.hidden) visible = false;
  };
  document.addEventListener('visibilitychange', onHide);

  const loop = () => {
    if (!running || !visible || document.hidden) return;
    const t = clock.getElapsedTime();
    mesh.rotation.y = t * 0.22 + pointer.x * 0.45;
    mesh.rotation.x = 0.25 + Math.sin(t * 0.35) * 0.08 + pointer.y * 0.25;
    mesh.position.y = Math.sin(t * 0.6) * 0.06;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return {
    setPointer(x: number, y: number) {
      pointer.x = x;
      pointer.y = y;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onHide);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
