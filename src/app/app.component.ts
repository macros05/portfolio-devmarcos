import { Component, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ScrollProgressComponent } from './components/scroll-progress/scroll-progress.component';
import { LanguageService } from './services/language.service';
import { SmoothScrollService } from './services/smooth-scroll.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ScrollProgressComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly lang = inject(LanguageService);
  private readonly smooth = inject(SmoothScrollService);
  protected readonly t = this.lang.t;

  constructor() {
    effect(() => {
      this.doc.documentElement.lang = this.lang.lang();
    });
  }
}
