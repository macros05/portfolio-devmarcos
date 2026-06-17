import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { MotionService } from '../../services/motion.service';

@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-track" aria-hidden="true">
      <div class="progress-bar" [style.transform]="'scaleX(' + scale() + ')'"></div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      pointer-events: none;
    }
    .progress-track {
      height: 2px;
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, rgb(0, 229, 255), rgb(122, 92, 255), rgb(255, 0, 229));
      transform-origin: left;
      transition: transform 0.1s ease-out;
    }
  `],
})
export class ScrollProgressComponent {
  private motion = inject(MotionService);
  protected scale = computed(() => this.motion.scrollProgress());
}
