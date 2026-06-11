import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { PROJECTS } from '../../data/project.data';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { StatementComponent } from '../../components/statement/statement.component';
import { AboutComponent } from '../../components/about/about.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { DeckDirective } from '../../directives/deck.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    ProjectCardComponent,
    StatementComponent,
    AboutComponent,
    HeaderComponent,
    FooterComponent,
    ContactComponent,
    RevealDirective,
    DeckDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly t = inject(LanguageService).t;
  protected projects = PROJECTS;
}
