import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FILMS } from '../../data/film.data';
import { LanguageService } from '../../services/language.service';
import { MediaSlotComponent } from '../media-slot/media-slot.component';

@Component({
  selector: 'app-films',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaSlotComponent],
  templateUrl: './films.component.html',
  styleUrl: './films.component.css',
})
export class FilmsComponent {
  private readonly lang = inject(LanguageService);
  readonly t = this.lang.t;
  protected readonly films = FILMS;

  protected text(copy: { en: string; es: string }): string {
    return copy[this.lang.lang()];
  }
}
