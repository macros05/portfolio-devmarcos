import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { LiquidGlassDirective } from '../../directives/liquid-glass.directive';
import { ScrubDirective } from '../../directives/scrub.directive';
import { MotionService } from '../../services/motion.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, LiquidGlassDirective, ScrubDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  readonly t = inject(LanguageService).t;
  protected motion = inject(MotionService);

  protected readonly nameLetters = 'Marcos M.'.split('');

  // Light orb that lazily follows the cursor — positioned via transform
  // (GPU compositing) instead of left/top (layout).
  protected orbTransform = computed(() => {
    const c = this.motion.cursor();
    return `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`;
  });
}
