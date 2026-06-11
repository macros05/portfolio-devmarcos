import { Component, HostListener, Inject, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { LiquidGlassDirective } from '../../directives/liquid-glass.directive';
import { MagneticDirective } from '../../directives/magnetic.directive';

interface NavLink { id: string; key: 'inicio' | 'about' | 'projects' | 'contact'; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LiquidGlassDirective, MagneticDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  readonly langService = inject(LanguageService);
  readonly t = this.langService.t;

  readonly isScrolled = signal(false);
  readonly isHidden = signal(false);
  readonly activeSection = signal<string>('inicio');
  readonly menuOpen = signal(false);

  private lastY = 0;

  readonly links: NavLink[] = [
    { id: 'inicio', key: 'inicio' },
    { id: 'about', key: 'about' },
    { id: 'proyectos', key: 'projects' },
    { id: 'contacto', key: 'contact' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) this.activeSection.set(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    queueMicrotask(() => {
      this.links.forEach(l => {
        const el = document.getElementById(l.id);
        if (el) observer.observe(el);
      });
    });
  }

  @HostListener('window:scroll') onScroll() {
    const y = window.scrollY;
    this.isScrolled.set(y > 40);

    // Hide when scrolling down, reappear on the slightest scroll up.
    const delta = y - this.lastY;
    if (y < 160 || this.menuOpen()) {
      this.isHidden.set(false);
    } else if (delta > 6) {
      this.isHidden.set(true);
    } else if (delta < -6) {
      this.isHidden.set(false);
    }
    this.lastY = y;
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu()  { this.menuOpen.set(false); }
}
