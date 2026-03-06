import { Component, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import {FadeInDirective} from '../../directives/fade-in.directive';

@Component({
  selector: 'app-contact',
  imports: [FadeInDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  readonly t = inject(LanguageService).t;
}
