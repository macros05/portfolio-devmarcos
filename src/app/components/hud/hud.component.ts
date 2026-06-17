import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';

// ── Public interface consumed by the WebGL host ──────────────────────────────
export interface HudStats {
  fps: number;
  ms: number;
  triangles: number;
  calls: number;
  points: number;
}

// ── Number formatting helpers ─────────────────────────────────────────────────
function fmtThousands(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
function fmtFps(n: number): string {
  return Math.round(n).toString();
}
function fmtMs(n: number): string {
  return n.toFixed(1);
}

// ── Sparkline config ──────────────────────────────────────────────────────────
const HISTORY_LEN = 48;
const CANVAS_W = 176;
const CANVAS_H = 26;
const MOCK_TRIANGLES = 262144;
const MOCK_CALLS = 9;
const MOCK_POINTS = 262144;

// ── Section id → display label fallback ──────────────────────────────────────
// (resolved at runtime via t().nav.sections)

@Component({
  selector: 'app-hud',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css',
  host: {
    'aria-hidden': 'true',
  },
})
export class HudComponent implements OnDestroy {
  // ── Injected services ────────────────────────────────────────────────────
  private readonly lang = inject(LanguageService);
  readonly motion = inject(MotionService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elRef = inject(ElementRef);

  // ── Signal inputs ────────────────────────────────────────────────────────
  readonly stats = input<HudStats | null>(null);
  readonly section = input<string>('index');

  // ── Translated strings ───────────────────────────────────────────────────
  readonly t = this.lang.t;

  // ── Derived: section human label ─────────────────────────────────────────
  readonly sectionLabel = computed(() => {
    const id = this.section();
    const sections = this.t().nav?.sections as Record<string, string> | undefined;
    return (sections && sections[id]) ? sections[id] : id;
  });

  // ── Internal state signals (written each rAF, read by template) ──────────
  readonly displayFps   = signal('--');
  readonly displayMs    = signal('--');
  readonly displayTris  = signal('--');
  readonly displayCalls = signal('--');
  readonly displayPts   = signal('--');
  readonly displayScroll = signal('0%');
  readonly displayCursor = signal('0,0');

  // ── Sparkline canvas ref ─────────────────────────────────────────────────
  private sparkCanvas: HTMLCanvasElement | null = null;
  private sparkCtx: CanvasRenderingContext2D | null = null;
  private fpsHistory: number[] = [];

  // ── rAF bookkeeping ──────────────────────────────────────────────────────
  private rafId: number | null = null;
  private lastTs: number | null = null;
  private smoothedFps = 60;
  private smoothedMs  = 16.7;

  constructor() {
    // Reduced-motion: drive the readout reactively from signals (cursor / scroll
    // / stats) instead of a continuous 60 Hz rAF loop, which would defeat the
    // user's motion preference and churn change-detection every frame.
    effect(() => {
      if (!this.motion.reduced()) return;
      const s = this.stats();
      this.displayFps.set(fmtFps(s ? s.fps : 60));
      this.displayMs.set(fmtMs(s ? s.ms : 16.7));
      this.displayTris.set(fmtThousands(s ? s.triangles : MOCK_TRIANGLES));
      this.displayCalls.set((s ? s.calls : MOCK_CALLS).toString());
      this.displayPts.set(fmtThousands(s ? s.points : MOCK_POINTS));
      const cur = this.motion.cursor();
      this.displayCursor.set(`${Math.round(cur.x)},${Math.round(cur.y)}`);
      this.displayScroll.set(`${Math.round(this.motion.scrollProgress() * 100)}%`);
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.initSparkline();
      // Skip the continuous rAF loop under reduced-motion (the effect above
      // keeps the readout current without per-frame churn).
      if (!this.motion.reduced()) this.startLoop();
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ── Sparkline init ────────────────────────────────────────────────────────
  private initSparkline(): void {
    const canvas = this.elRef.nativeElement.querySelector('.hud-sparkline') as HTMLCanvasElement | null;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.sparkCanvas = canvas;
    this.sparkCtx = canvas.getContext('2d');
  }

  // ── Main rAF loop ─────────────────────────────────────────────────────────
  private startLoop(): void {
    const tick = (ts: number) => {
      this.rafId = requestAnimationFrame(tick);

      // Measure frame time
      const delta = this.lastTs !== null ? ts - this.lastTs : 16.7;
      this.lastTs = ts;
      const rawFps = 1000 / Math.max(delta, 1);
      const rawMs  = delta;

      // Smooth with EMA
      const alpha = 0.1;
      this.smoothedFps = this.smoothedFps * (1 - alpha) + rawFps * alpha;
      this.smoothedMs  = this.smoothedMs  * (1 - alpha) + rawMs  * alpha;

      // Resolve display values
      const provided = this.stats();
      const fps  = provided ? provided.fps       : this.smoothedFps;
      const ms   = provided ? provided.ms        : this.smoothedMs;
      const tris = provided ? provided.triangles : MOCK_TRIANGLES;
      const calls = provided ? provided.calls    : MOCK_CALLS;
      const pts  = provided ? provided.points    : MOCK_POINTS;

      this.displayFps.set(fmtFps(fps));
      this.displayMs.set(fmtMs(ms));
      this.displayTris.set(fmtThousands(tris));
      this.displayCalls.set(calls.toString());
      this.displayPts.set(fmtThousands(pts));

      // Cursor / scroll from MotionService
      const cur = this.motion.cursor();
      this.displayCursor.set(`${Math.round(cur.x)},${Math.round(cur.y)}`);
      const scroll = this.motion.scrollProgress();
      this.displayScroll.set(`${Math.round(scroll * 100)}%`);

      // Sparkline
      if (!this.motion.reduced()) {
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > HISTORY_LEN) {
          this.fpsHistory.shift();
        }
        this.drawSparkline();
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  // ── Sparkline draw ────────────────────────────────────────────────────────
  private drawSparkline(): void {
    const ctx = this.sparkCtx;
    const canvas = this.sparkCanvas;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const history = this.fpsHistory;
    if (history.length < 2) return;

    // Baseline grid hairline at y=60fps
    const maxFps = 120;
    const y60 = h - (60 / maxFps) * h;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, y60);
    ctx.lineTo(w, y60);
    ctx.stroke();

    // Build path
    const step = w / (HISTORY_LEN - 1);
    ctx.beginPath();
    history.forEach((v, i) => {
      const x = i * step;
      const y = h - Math.min(v / maxFps, 1) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Fill area under the line
    const lastX = (history.length - 1) * step;
    const lastY = h - Math.min(history[history.length - 1] / maxFps, 1) * h;
    ctx.lineTo(lastX, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,229,255,0.35)');
    grad.addColorStop(1, 'rgba(0,229,255,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke the line on top
    ctx.beginPath();
    history.forEach((v, i) => {
      const x = i * step;
      const y = h - Math.min(v / maxFps, 1) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(0,229,255,0.75)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
