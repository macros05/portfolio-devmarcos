import { Component, HostListener, Inject, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';

interface NavLink { fragment: string; label: 'projects' | 'films' | 'contact'; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  readonly lang = inject(LanguageService);
  readonly t = this.lang.t;

  readonly menuOpen = signal(false);
  readonly active = signal('');

  readonly links: NavLink[] = [
    { fragment: 'work', label: 'projects' },
    { fragment: 'films', label: 'films' },
    { fragment: 'contact', label: 'contact' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.active.set(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );
    queueMicrotask(() => {
      for (const link of this.links) {
        const el = document.getElementById(link.fragment);
        if (el) observer.observe(el);
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  toggleLang(): void {
    this.lang.toggle();
  }
}
