import { Component, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { ScrollProgressComponent } from './components/scroll-progress/scroll-progress.component';
import { LanguageService } from './services/language.service';
import { FieldComponent } from './components/field/field.component';
import { isProposalPath, skipTarget } from './proposal-path';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ScrollProgressComponent, FieldComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  protected readonly t = this.lang.t;
  private readonly navigation = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly skipHref = computed(() => skipTarget(this.navigation()));
  /** The home shader stays off proposal pages. They carry their own plate. */
  protected readonly showField = computed(() => !isProposalPath(this.navigation()));

  constructor() {
    effect(() => {
      this.doc.documentElement.lang = this.lang.lang();
    });
  }
}
