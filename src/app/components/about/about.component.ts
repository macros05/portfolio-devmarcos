import { Component, inject } from '@angular/core';
import { TECH_ICONS } from '../../data/about.data';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  readonly t = inject(LanguageService).t;
  techIcons = TECH_ICONS;
}
