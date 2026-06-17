import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProjectsShowcaseComponent } from '../../components/projects-showcase/projects-showcase.component';
import { StatementComponent } from '../../components/statement/statement.component';
import { AboutComponent } from '../../components/about/about.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactComponent } from '../../components/contact/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    ProjectsShowcaseComponent,
    StatementComponent,
    AboutComponent,
    HeaderComponent,
    FooterComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
