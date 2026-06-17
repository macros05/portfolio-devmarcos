import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';
import { ScrubDirective } from '../../directives/scrub.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { DecodeDirective } from '../../directives/decode.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrubDirective, RevealDirective, DecodeDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  readonly t = inject(LanguageService).t;
  protected readonly motion = inject(MotionService);
}
