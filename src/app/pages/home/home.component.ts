import { Component, inject } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { PROJECTS } from '../../data/project.data';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { AboutComponent } from '../../components/about/about.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { LanguageService } from '../../services/language.service';
import {FadeInDirective} from '../../directives/fade-in.directive';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, ProjectCardComponent, AboutComponent, HeaderComponent, FooterComponent, ContactComponent, FadeInDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly t = inject(LanguageService).t;
  projects = PROJECTS;
}
