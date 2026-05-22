import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { MotionService } from '../../services/motion.service';

interface Particle { left: number; delay: number; duration: number; size: number; opacity: number; }

@Component({
  selector: 'app-aurora-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aurora-stage" aria-hidden="true"
         [style.transform]="parallaxTransform()">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
    </div>

    <!-- Slow ascending particles (constellation) -->
    <div class="particles" aria-hidden="true">
      @for (p of particles; track $index) {
        <span class="particle"
              [style.left.%]="p.left"
              [style.animation-delay.s]="p.delay"
              [style.animation-duration.s]="p.duration"
              [style.width.px]="p.size"
              [style.height.px]="p.size"
              [style.opacity]="p.opacity"></span>
      }
    </div>

    <!-- Periodic horizontal light sweep -->
    <div class="sweep" aria-hidden="true"></div>

    <!-- Grain + vignette over everything -->
    <div class="grain"></div>
    <div class="vignette"></div>
  `,
  styleUrls: ['./aurora-background.component.css'],
})
export class AuroraBackgroundComponent {
  protected motion = inject(MotionService);

  protected particles: Particle[] = Array.from({ length: 22 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 18 + Math.random() * 24,
    size: 1 + Math.random() * 2,
    opacity: 0.25 + Math.random() * 0.45,
  }));

  // Parallax: tiny offset based on cursor position
  protected parallaxTransform = computed(() => {
    const c = this.motion.cursor();
    if (typeof window === 'undefined') return 'translate3d(0,0,0)';
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const tx = ((c.x / w) - 0.5) * 30;
    const ty = ((c.y / h) - 0.5) * 30;
    return `translate3d(${tx}px, ${ty}px, 0)`;
  });
}
