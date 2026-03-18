import { Component, OnInit, OnDestroy, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cursor',
  standalone: true,
  templateUrl: './cursor.component.html',
  styleUrl: './cursor.component.css'
})
export class CursorComponent implements OnInit, OnDestroy {
  dotX = signal(0);
  dotY = signal(0);
  ringX = signal(0);
  ringY = signal(0);
  isHovering = signal(false);
  isVisible = signal(false);

  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private animFrame = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private onMouseMove = (e: MouseEvent) => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
    this.dotX.set(e.clientX);
    this.dotY.set(e.clientY);
    this.isVisible.set(true);
    const target = e.target as Element;
    this.isHovering.set(!!target.closest('a, button, [role="button"]'));
  };

  private onMouseLeave = () => this.isVisible.set(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseleave', this.onMouseLeave);
    this.animate();
  }

  private animate() {
    this.currentX += (this.targetX - this.currentX) * 0.1;
    this.currentY += (this.targetY - this.currentY) * 0.1;
    this.ringX.set(this.currentX);
    this.ringY.set(this.currentY);
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseleave', this.onMouseLeave);
    cancelAnimationFrame(this.animFrame);
  }
}
