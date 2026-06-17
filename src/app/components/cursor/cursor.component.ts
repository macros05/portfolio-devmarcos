import { Component, OnInit, OnDestroy, signal, computed, Inject, PLATFORM_ID, inject, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../../services/motion.service';

@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cursor.component.html',
  styleUrl: './cursor.component.css',
})
export class CursorComponent implements OnInit, OnDestroy {
  protected motion = inject(MotionService);

  protected x = signal(-100);
  protected y = signal(-100);
  protected width = signal(28);
  protected height = signal(28);
  protected radius = signal(14);
  protected snapped = signal(false);

  protected coordX = computed(() => Math.round(this.x()));
  protected coordY = computed(() => Math.round(this.y()));

  private currentX = -100;
  private currentY = -100;
  private targetX = -100;
  private targetY = -100;
  private animFrame = 0;
  private currentTarget: Element | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.addEventListener('mousemove', this.onMove, { passive: true });
    this.animate();
  }

  private onMove = (e: MouseEvent) => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;

    const target = (e.target as Element | null)?.closest('a, button, [role="button"], input, textarea');
    if (target instanceof HTMLElement || target instanceof Element) {
      this.currentTarget = target;
    } else {
      this.currentTarget = null;
    }
  };

  private animate = () => {
    // Snap-to-element behavior: when over an interactive element,
    // the cursor "settles" near its center & adopts its shape.
    if (this.currentTarget) {
      const rect = this.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Snap closer to the element's center, but with a slight follow on the cursor
      const settleX = centerX * 0.6 + this.targetX * 0.4;
      const settleY = centerY * 0.6 + this.targetY * 0.4;

      this.currentX += (settleX - this.currentX) * 0.28;
      this.currentY += (settleY - this.currentY) * 0.28;

      // Adopt loose dimensions from the element (clamped)
      const w = Math.min(Math.max(rect.width + 14, 40), 280);
      const h = Math.min(Math.max(rect.height + 14, 40), 80);
      const r = Math.min(w, h) / 2;

      this.width.set(w);
      this.height.set(h);
      this.radius.set(r);
      this.snapped.set(true);
    } else {
      // Free movement: tight follow with minor lag
      this.currentX += (this.targetX - this.currentX) * 0.42;
      this.currentY += (this.targetY - this.currentY) * 0.42;
      this.width.set(28);
      this.height.set(28);
      this.radius.set(14);
      this.snapped.set(false);
    }

    this.x.set(this.currentX);
    this.y.set(this.currentY);
    this.animFrame = requestAnimationFrame(this.animate);
  };

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.removeEventListener('mousemove', this.onMove);
    cancelAnimationFrame(this.animFrame);
  }
}
