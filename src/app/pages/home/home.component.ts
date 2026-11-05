import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ShowreelComponent } from '../../components/showreel/showreel.component';
import { ProjectsGalleryComponent } from '../../components/projects-gallery/projects-gallery.component';
import { FilmsComponent } from '../../components/films/films.component';
import { NoteComponent } from '../../components/note/note.component';
import { StatementComponent } from '../../components/statement/statement.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactComponent } from '../../components/contact/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    ShowreelComponent,
    ProjectsGalleryComponent,
    FilmsComponent,
    NoteComponent,
    StatementComponent,
    FooterComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
