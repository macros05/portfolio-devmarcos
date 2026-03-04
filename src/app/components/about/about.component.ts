import { Component } from '@angular/core';
import { ABOUT_TEXT, TECH_ICONS } from '../../data/about.data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  aboutText = ABOUT_TEXT;
  techIcons = TECH_ICONS;
}
