import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * A short lerp on wheel only. Touch and reduced-motion keep native scroll.
 * Anchor jumps (header links) set the target directly.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  constructor(@Inject(PLATFORM_ID) platformId: object) {
    if (!isPlatformBrowser(platformId)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let target = window.scrollY;
    let current = target;
    let driving = false;
    const max = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const frame = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.4) current = target;
      driving = true;
      window.scrollTo(0, current);
      driving = false;
      if (Math.abs(target - current) > 0.4) requestAnimationFrame(frame);
    };

    window.addEventListener('wheel', (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      target = Math.min(max(), Math.max(0, target + event.deltaY));
      requestAnimationFrame(frame);
    }, { passive: false });

    window.addEventListener('scroll', () => {
      if (driving) return;
      target = window.scrollY;
      current = target;
    }, { passive: true });
  }
}
