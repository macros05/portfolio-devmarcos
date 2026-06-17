import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MotionService } from '../../services/motion.service';
import { LanguageService } from '../../services/language.service';
import { LAB_EXPERIMENTS } from '../../data/lab.data';
import { RevealDirective } from '../../directives/reveal.directive';
import { createShaderToy, SHADER_MAP, ShaderToy } from './shader-toy';

interface LabItem {
  title: string;
  blurb: string;
}

@Component({
  selector: 'app-lab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.css',
  imports: [CommonModule, RevealDirective],
})
export class LabComponent implements OnDestroy {
  @ViewChildren('canvas') private canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  readonly t = inject(LanguageService).t;
  private readonly motion = inject(MotionService);
  readonly experiments = LAB_EXPERIMENTS;

  // Per-card state: index → status signals
  readonly cardRunning  = signal<Record<number, boolean>>({});
  readonly cardFailed   = signal<Record<number, boolean>>({});
  readonly cardActive   = signal<number>(-1);

  private readonly isBrowser: boolean;
  private toys        = new Map<number, ShaderToy>();
  private rafId       = 0;
  private startTime   = 0;
  private observer!:  IntersectionObserver;
  private intersections = new Map<number, number>(); // index → intersectionRatio

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    afterNextRender(() => {
      if (!this.isBrowser) return;
      if (this.motion.reduced()) return; // reduced-motion: no WebGL

      this.startTime = performance.now() / 1000;
      this.setupObserver();
      this.startLoop();
    });
  }

  // ── Public helpers for template ──────────────────────────────────────────

  /** Safe accessor for t().lab.items[id] — avoids TS index-signature error */
  labItem(id: string): LabItem {
    const items = this.t().lab.items as Record<string, LabItem>;
    return items[id] ?? { title: id, blurb: '' };
  }

  isRunning(index: number): boolean {
    return this.cardRunning()[index] ?? false;
  }
  hasFailed(index: number): boolean {
    return this.cardFailed()[index] ?? false;
  }
  isReduced(): boolean {
    return this.motion.reduced();
  }
  isActive(index: number): boolean {
    return this.cardActive() === index;
  }

  onPointerMove(event: PointerEvent, index: number): void {
    if (!this.isBrowser) return;
    const toy = this.toys.get(index);
    if (!toy) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    // y-up: invert Y
    const y = 1.0 - (event.clientY - rect.top) / rect.height;
    toy.setMouse(x, y);
  }

  // ── IntersectionObserver — pick most-visible card ────────────────────────

  private setupObserver(): void {
    const canvasEls = this.canvases.toArray();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = parseInt((entry.target as HTMLElement).dataset['idx'] ?? '-1', 10);
          if (idx < 0) continue;

          this.intersections.set(idx, entry.intersectionRatio);

          if (entry.intersectionRatio === 0) {
            // Scrolled out: pause this toy
            this.pauseToy(idx);
          }
        }
        this.pickMostVisible();
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] },
    );

    for (let i = 0; i < canvasEls.length; i++) {
      const el = canvasEls[i].nativeElement;
      el.dataset['idx'] = String(i);
      this.observer.observe(el);
    }
  }

  private pickMostVisible(): void {
    let bestIdx = -1;
    let bestRatio = 0;
    for (const [idx, ratio] of this.intersections) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIdx = idx;
      }
    }

    const prev = this.cardActive();
    if (bestIdx === prev) return;

    // Pause previous
    if (prev >= 0) this.pauseToy(prev);

    this.cardActive.set(bestIdx);

    if (bestIdx >= 0 && bestRatio > 0) {
      this.ensureToyStarted(bestIdx);
    }
  }

  private ensureToyStarted(idx: number): void {
    if (this.toys.has(idx)) {
      this.setRunning(idx, true);
      return;
    }

    const canvasEls = this.canvases.toArray();
    if (idx >= canvasEls.length) return;
    const canvas = canvasEls[idx].nativeElement;
    const experiment = this.experiments[idx];
    const fragSrc = SHADER_MAP[experiment.id];

    const toy = createShaderToy(canvas, fragSrc);
    if (!toy) {
      this.setFailed(idx, true);
      return;
    }
    this.toys.set(idx, toy);
    this.setRunning(idx, true);
  }

  private pauseToy(idx: number): void {
    this.setRunning(idx, false);
  }

  // ── Shared rAF loop ───────────────────────────────────────────────────────

  private startLoop(): void {
    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
      const now = performance.now() / 1000 - this.startTime;

      const activeIdx = this.cardActive();
      if (activeIdx < 0) return;
      if (!this.cardRunning()[activeIdx]) return;

      const toy = this.toys.get(activeIdx);
      toy?.render(now);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  // ── Signal helpers ────────────────────────────────────────────────────────

  private setRunning(idx: number, val: boolean): void {
    this.cardRunning.update(r => ({ ...r, [idx]: val }));
  }
  private setFailed(idx: number, val: boolean): void {
    this.cardFailed.update(r => ({ ...r, [idx]: val }));
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.observer?.disconnect();
    for (const toy of this.toys.values()) {
      toy.dispose();
    }
    this.toys.clear();
  }
}
