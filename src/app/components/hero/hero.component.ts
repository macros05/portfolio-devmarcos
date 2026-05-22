import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { LiquidGlassDirective } from '../../directives/liquid-glass.directive';
import { MotionService } from '../../services/motion.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, LiquidGlassDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  readonly t = inject(LanguageService).t;
  protected motion = inject(MotionService);

  protected readonly nameLetters = 'Marcos'.split('');

  // Light orb that lazily follows the cursor (vw/vh aware)
  protected orbX = computed(() => this.motion.cursor().x);
  protected orbY = computed(() => this.motion.cursor().y);
}
