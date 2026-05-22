import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CursorComponent } from './components/cursor/cursor.component';
import { AuroraBackgroundComponent } from './components/aurora-background/aurora-background.component';
import { ScrollProgressComponent } from './components/scroll-progress/scroll-progress.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CursorComponent, AuroraBackgroundComponent, ScrollProgressComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly title = signal('portfolio-dev');
}
