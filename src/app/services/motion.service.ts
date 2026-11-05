import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly cursor = signal({ x: -100, y: -100 });
  readonly visible = signal(false);
  readonly overInteractive = signal(false);
  readonly reduced = signal(false);
  readonly scrollProgress = signal(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (!isPlatformBrowser(this.platformId)) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced.set(mq.matches);
    mq.addEventListener('change', e => this.reduced.set(e.matches));

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('mouseleave', () => this.visible.set(false));
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.publishScroll();
  }

  private scrollQueued = false;

  private onMouseMove = (e: MouseEvent) => {
    this.cursor.set({ x: e.clientX, y: e.clientY });
    if (!this.visible()) this.visible.set(true);
    const target = e.target as Element | null;
    const over = !!target?.closest('a, button, [role="button"], input, textarea, [data-magnetic]');
    if (over !== this.overInteractive()) this.overInteractive.set(over);
  };

  private onScroll = () => {
    if (this.scrollQueued) return;
    this.scrollQueued = true;
    requestAnimationFrame(() => {
      this.scrollQueued = false;
      this.publishScroll();
    });
  };

  private publishScroll(): void {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const next = max > 0 ? h.scrollTop / max : 0;
    if (Math.abs(next - this.scrollProgress()) < 0.004) return;
    this.scrollProgress.set(next);
  }
}
