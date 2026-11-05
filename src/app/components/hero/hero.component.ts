import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
import type { GateHandle } from './gate-field';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnDestroy {
  private readonly lang = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly motion = inject(MotionService);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('field');
  private readonly rootRef = viewChild<ElementRef<HTMLElement>>('root');

  readonly t = this.lang.t;
  protected readonly showField = signal(false);
  protected readonly clock = signal('00:00:00:00');

  private readonly viewReady = signal(false);
  private gate: GateHandle | null = null;
  private starting = false;
  private raf = 0;
  private supportChecked = false;
  private supported = false;

  constructor() {
    afterNextRender(() => this.viewReady.set(true));

    effect(() => {
      const ready = this.viewReady();
      const reduced = this.motion.reduced();
      if (!ready || !isPlatformBrowser(this.platformId)) return;
      if (reduced || !this.webglOk()) {
        this.showField.set(false);
        this.teardown();
        return;
      }
      this.showField.set(true);
      void this.start();
      this.tickClock();
    });
  }

  ngOnDestroy(): void {
    this.teardown();
    cancelAnimationFrame(this.raf);
  }

  protected onPointer(event: PointerEvent): void {
    if (!this.gate || event.pointerType !== 'mouse') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this.gate.setPointer(x, y);
  }

  private tickClock(): void {
    const start = performance.now();
    const frame = (now: number) => {
      if (this.motion.reduced()) return;
      const ms = now - start;
      const frames = Math.floor((ms / 1000) * 24) % 24;
      const total = Math.floor(ms / 1000);
      const hh = String(Math.floor(total / 3600)).padStart(2, '0');
      const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
      const ss = String(total % 60).padStart(2, '0');
      const ff = String(frames).padStart(2, '0');
      this.clock.set(`${hh}:${mm}:${ss}:${ff}`);
      const root = this.rootRef()?.nativeElement;
      if (root && this.gate) {
        const h = root.offsetHeight || 1;
        this.gate.setScroll(Math.min(1, window.scrollY / h));
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  private webglOk(): boolean {
    if (this.supportChecked) return this.supported;
    this.supportChecked = true;
    try {
      this.supported = !!document.createElement('canvas').getContext('webgl2');
    } catch {
      this.supported = false;
    }
    return this.supported;
  }

  private async start(): Promise<void> {
    if (this.gate || this.starting) return;
    this.starting = true;
    try {
      await Promise.resolve();
      const canvas = this.canvasRef()?.nativeElement;
      if (!canvas || this.motion.reduced()) return;
      const { mountGate } = await import('./gate-field');
      if (this.motion.reduced() || !this.showField()) return;
      const handle = await mountGate(canvas);
      if (this.motion.reduced() || !this.showField()) {
        handle.destroy();
        return;
      }
      this.gate = handle;
    } finally {
      this.starting = false;
    }
  }

  private teardown(): void {
    this.gate?.destroy();
    this.gate = null;
  }
}
