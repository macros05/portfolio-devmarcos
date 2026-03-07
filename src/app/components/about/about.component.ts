import { Component, inject } from '@angular/core';
import { TECH_ICONS } from '../../data/about.data';
import { LanguageService } from '../../services/language.service';
import {FadeInDirective} from '../../directives/fade-in.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [FadeInDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  private readonly langService = inject(LanguageService);
  readonly t = this.langService.t;
  readonly lang = this.langService.lang;
  techIcons = TECH_ICONS;
}
