/** Persistent abstract field. One plane, one shader, resolution capped. */

export interface FieldHandle {
  destroy: () => void;
  setChapter: (index: number) => void;
  setPointer: (x: number, y: number) => void;
  /** Freeze the frame while the page is scrolling fast. */
  setHold: (hold: boolean) => void;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uChapter;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.02 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  vec3 tone(float ch) {
    vec3 silver = vec3(0.62, 0.66, 0.74);
    vec3 copper = vec3(0.82, 0.40, 0.24);
    vec3 steel  = vec3(0.38, 0.52, 0.56);
    vec3 amber  = vec3(0.78, 0.58, 0.30);
    vec3 ash    = vec3(0.55, 0.54, 0.52);
    vec3 dusk   = vec3(0.42, 0.36, 0.48);
    float k = clamp(ch, 0.0, 5.0);
    if (k < 1.0) return mix(silver, copper, k);
    if (k < 2.0) return mix(copper, steel, k - 1.0);
    if (k < 3.0) return mix(steel, amber, k - 2.0);
    if (k < 4.0) return mix(amber, ash, k - 3.0);
    return mix(ash, dusk, k - 4.0);
  }

  void main() {
    float intro = smoothstep(0.0, 2.4, uTime);
    vec2 p = (vUv - 0.5);
    p.x *= uRes.x / max(uRes.y, 1.0);
    p *= mix(2.8, 1.0, intro);

    vec2 m = uMouse;
    vec2 delta = p - vec2(m.x * 0.9, m.y * 0.62);
    float wake = exp(-dot(delta, delta) * 3.2);
    float ang = wake * 2.6;
    float cs = cos(ang);
    float sn = sin(ang);
    p = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);

    float ch = clamp(uChapter, 0.0, 5.0);
    float scale = mix(0.85, 2.1, ch / 5.0);
    float warp = 1.35 + wake * 1.8;
    float drift = uTime * 0.055;
    vec2 q = p * scale + m * 0.65 + vec2(drift, drift * 0.4);
    vec2 d = vec2(fbm(q), fbm(q + vec2(5.2, 1.3)));
    vec2 r = vec2(
      fbm(q + d * warp + vec2(1.7, 9.2)),
      fbm(q + d * warp + vec2(8.3, 2.8))
    );
    float f = fbm(q + r * warp);

    vec3 base = vec3(0.015, 0.016, 0.02);
    vec3 ink = tone(ch);
    vec3 col = mix(base, ink * 0.95, smoothstep(0.12, 0.62, f));
    col += vec3(1.0, 0.96, 0.9) * pow(smoothstep(0.55, 0.94, f), 1.3) * (0.42 + wake * 0.85);
    col += ink * wake * 0.85;

    float rad = length(p);
    float ring = exp(-pow((rad - intro * 1.15) * 7.0, 2.0));
    col += vec3(1.0, 0.93, 0.84) * ring * (1.0 - smoothstep(1.4, 2.5, uTime));

    float g = hash(vUv * uRes + fract(uTime) * 40.0);
    col += (g - 0.5) * 0.04;
    col *= mix(0.2, 1.0, intro);
    col *= mix(1.0, 0.34, smoothstep(0.2, 1.1, ch));
    float vig = smoothstep(1.45, 0.12, length((vUv - 0.5) * vec2(uRes.x / max(uRes.y, 1.0), 1.0)));
    col *= mix(0.4, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export async function mountField(canvas: HTMLCanvasElement): Promise<FieldHandle> {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x070708, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uChapter: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  let chapter = 0;
  let chapterNow = 0;
  let running = true;
  let holding = false;
  let frozen = 0;
  let freezeAt = 0;
  let raf = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const scale = w < 800 ? 0.5 : 0.55;
    let bw = Math.max(2, Math.round(w * dpr * scale));
    let bh = Math.max(2, Math.round(h * dpr * scale));
    const cap = w < 800 ? 640 : 880;
    const edge = Math.max(bw, bh);
    if (edge > cap) {
      const fit = cap / edge;
      bw = Math.max(2, Math.round(bw * fit));
      bh = Math.max(2, Math.round(bh * fit));
    }
    renderer.setPixelRatio(1);
    renderer.setSize(bw, bh, false);
    uniforms.uRes.value.set(bw, bh);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const onHide = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onHide);

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!running || document.hidden || holding) return;
    const t = clock.getElapsedTime() - frozen;
    mouse.x += (targetMouse.x - mouse.x) * 0.18;
    mouse.y += (targetMouse.y - mouse.y) * 0.18;
    chapterNow += (chapter - chapterNow) * 0.04;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uChapter.value = chapterNow;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return {
    setChapter(index: number) {
      chapter = index;
    },
    setPointer(x: number, y: number) {
      targetMouse.x = x;
      targetMouse.y = y;
    },
    setHold(hold: boolean) {
      if (hold && !holding) {
        freezeAt = clock.getElapsedTime() - frozen;
        holding = true;
      } else if (!hold && holding) {
        frozen = clock.getElapsedTime() - freezeAt;
        holding = false;
      }
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onHide);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
