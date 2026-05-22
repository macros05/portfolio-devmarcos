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
    this.onScroll();
  }

  private onMouseMove = (e: MouseEvent) => {
    this.cursor.set({ x: e.clientX, y: e.clientY });
    this.visible.set(true);
    const target = e.target as Element | null;
    this.overInteractive.set(!!target?.closest('a, button, [role="button"], input, textarea, [data-magnetic]'));
  };

  private onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    this.scrollProgress.set(max > 0 ? h.scrollTop / max : 0);
  };
}
