import { Directive, ElementRef, HostListener, Inject, Input, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

@Directive({
  selector: '[tilt]',
  standalone: true,
})
export class TiltDirective implements OnDestroy {
  @Input() tiltStrength = 10;
  @Input() tiltScale = 1.02;
  @Input() tiltGlare = true;

  private rafId = 0;
  private glareEl?: HTMLElement;
  private motion = inject(MotionService);

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(platformId)) {
      const host = this.el.nativeElement;
      host.style.transformStyle = 'preserve-3d';
      host.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  }

  @HostListener('mouseenter') onEnter() {
    if (this.shouldSkip()) return;
    const host = this.el.nativeElement;
    host.style.transition = 'transform 0.08s linear';
    if (this.tiltGlare && !this.glareEl) {
      this.glareEl = document.createElement('div');
      Object.assign(this.glareEl.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.18), transparent 50%)',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        mixBlendMode: 'overlay',
        zIndex: '1',
      });
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(this.glareEl);
      requestAnimationFrame(() => { if (this.glareEl) this.glareEl.style.opacity = '1'; });
    }
  }

  @HostListener('mousemove', ['$event']) onMove(e: MouseEvent) {
    if (this.shouldSkip()) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * this.tiltStrength * 2;
    const ry = (px - 0.5) * this.tiltStrength * 2;

    this.rafId = requestAnimationFrame(() => {
      host.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${this.tiltScale})`;
      if (this.glareEl) {
        host.style.setProperty('--gx', `${px * 100}%`);
        host.style.setProperty('--gy', `${py * 100}%`);
      }
    });
  }

  @HostListener('mouseleave') onLeave() {
    const host = this.el.nativeElement;
    host.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    host.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
    if (this.glareEl) {
      this.glareEl.style.opacity = '0';
      const g = this.glareEl;
      setTimeout(() => { g.remove(); }, 320);
      this.glareEl = undefined;
    }
  }

  private shouldSkip(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    if (this.motion.reduced()) return true;
    if (window.matchMedia('(hover: none)').matches) return true;
    return false;
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    this.glareEl?.remove();
  }
}
