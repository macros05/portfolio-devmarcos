import { Directive, ElementRef, HostListener, Inject, Input, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

@Directive({
  selector: '[magnetic]',
  standalone: true,
  host: { 'data-magnetic': '' },
})
export class MagneticDirective implements OnDestroy {
  @Input() magneticStrength = 0.35;
  @Input() magneticRadius = 140;

  private rafId = 0;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private active = false;
  private motion = inject(MotionService);

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  @HostListener('mouseenter') onEnter() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.motion.reduced()) return;
    if (window.matchMedia('(hover: none)').matches) return;
    this.active = true;
    this.animate();
  }

  @HostListener('mouseleave') onLeave() {
    this.active = false;
    this.targetX = 0;
    this.targetY = 0;
  }

  @HostListener('mousemove', ['$event']) onMove(e: MouseEvent) {
    if (!this.active) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const falloff = Math.max(0, 1 - dist / (this.magneticRadius * 2));
    this.targetX = dx * this.magneticStrength * falloff;
    this.targetY = dy * this.magneticStrength * falloff;
  }

  private animate = () => {
    this.currentX += (this.targetX - this.currentX) * 0.18;
    this.currentY += (this.targetY - this.currentY) * 0.18;
    this.el.nativeElement.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;

    if (Math.abs(this.currentX) > 0.05 || Math.abs(this.currentY) > 0.05 || this.active) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      this.el.nativeElement.style.transform = '';
    }
  };

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
  }
}
