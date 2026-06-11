import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { ScrubDirective } from '../../directives/scrub.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective, ScrubDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  readonly t = inject(LanguageService).t;
}
