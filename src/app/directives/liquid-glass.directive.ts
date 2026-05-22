import { Directive, ElementRef, HostListener, Inject, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

let svgInjected = false;

/**
 * Adds a subtle "liquid glass" refraction layer to the host via SVG displacement.
 * The displacement scale eases up when the cursor is near the element, mimicking
 * the way Apple's liquid glass surfaces "respond" to proximity.
 *
 * Pair this with the .glass-strong / .glass-medium utility classes for full effect.
 */
@Directive({
  selector: '[liquidGlass]',
  standalone: true,
})
export class LiquidGlassDirective implements OnInit {
  @Input() liquidGlassMaxScale = 18;
  @Input() liquidGlassRadius = 280;

  private rafId = 0;
  private currentScale = 0;
  private targetScale = 0;
  private filterEl?: SVGFEDisplacementMapElement;
  private filterId = '';
  private motion = inject(MotionService);

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.motion.reduced()) return;

    LiquidGlassDirective.ensureSvg();
    this.filterId = `lg-${Math.random().toString(36).slice(2, 9)}`;
    this.attachIndividualFilter();
    this.animate();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.filterEl) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.max(0, 1 - dist / this.liquidGlassRadius);
    this.targetScale = proximity * this.liquidGlassMaxScale;
  }

  @HostListener('mouseenter') onEnter() {
    this.targetScale = this.liquidGlassMaxScale;
  }

  @HostListener('mouseleave') onLeave() {
    this.targetScale = 0;
  }

  private animate = () => {
    this.currentScale += (this.targetScale - this.currentScale) * 0.12;
    if (this.filterEl) {
      this.filterEl.setAttribute('scale', this.currentScale.toFixed(2));
    }
    this.rafId = requestAnimationFrame(this.animate);
  };

  private attachIndividualFilter() {
    const svg = document.getElementById('liquid-glass-defs') as unknown as SVGSVGElement | null;
    if (!svg) return;

    const xmlns = 'http://www.w3.org/2000/svg';
    const filter = document.createElementNS(xmlns, 'filter');
    filter.setAttribute('id', this.filterId);
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');

    const turb = document.createElementNS(xmlns, 'feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('baseFrequency', '0.012 0.018');
    turb.setAttribute('numOctaves', '2');
    turb.setAttribute('seed', String(Math.floor(Math.random() * 99)));
    turb.setAttribute('result', 'noise');

    const disp = document.createElementNS(xmlns, 'feDisplacementMap');
    disp.setAttribute('in', 'SourceGraphic');
    disp.setAttribute('in2', 'noise');
    disp.setAttribute('scale', '0');
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'G');

    filter.appendChild(turb);
    filter.appendChild(disp);
    svg.appendChild(filter);

    this.filterEl = disp as SVGFEDisplacementMapElement;
    this.el.nativeElement.style.filter = `url(#${this.filterId})`;
  }

  private static ensureSvg() {
    if (svgInjected) return;
    svgInjected = true;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'liquid-glass-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.pointerEvents = 'none';
    document.body.appendChild(svg);
  }
}
