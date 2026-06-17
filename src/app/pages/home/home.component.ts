import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProjectsGalleryComponent } from '../../components/projects-gallery/projects-gallery.component';
import { StatementComponent } from '../../components/statement/statement.component';
import { AboutComponent } from '../../components/about/about.component';
import { LabComponent } from '../../components/lab/lab.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactComponent } from '../../components/contact/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    ProjectsGalleryComponent,
    StatementComponent,
    AboutComponent,
    LabComponent,
    FooterComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
