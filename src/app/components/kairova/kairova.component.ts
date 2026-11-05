import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';

/** Live home of the agency. */
export const KAIROVA_URL = 'https://kairovahq.com';

@Component({
  selector: 'app-kairova',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './kairova.component.html',
  styleUrl: './kairova.component.css',
})
export class KairovaComponent {
  readonly t = inject(LanguageService).t;
  protected readonly url = KAIROVA_URL;
}
