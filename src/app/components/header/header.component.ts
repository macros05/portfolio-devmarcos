import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LanguageService } from '../../services/language.service';

interface NavLink { fragment: string; label: 'projects' | 'films' | 'contact'; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  readonly t = this.lang.t;

  readonly menuOpen = signal(false);
  readonly active = signal('');
  /** Dark plate once a proposal has scrolled past its cover. Home stays clear. */
  readonly solid = signal(false);

  readonly links: NavLink[] = [
    { fragment: 'work', label: 'projects' },
    { fragment: 'films', label: 'films' },
    { fragment: 'contact', label: 'contact' },
  ];

  private scrollQueued = false;
  private navSub: Subscription | null = null;
  private readonly onScroll = () => {
    if (this.scrollQueued) return;
    this.scrollQueued = true;
    requestAnimationFrame(() => {
      this.scrollQueued = false;
      this.syncBar();
    });
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.syncBar();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => queueMicrotask(() => this.syncBar()));
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

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onScroll);
    this.navSub?.unsubscribe();
  }

  /** Solid only on a proposal, and only after its cover has left the bar. */
  private syncBar(): void {
    if (!document.body.classList.contains('proposal-doc')) {
      this.solid.set(false);
      return;
    }
    const cover = document.querySelector<HTMLElement>('#propuesta .cover');
    if (!cover) {
      this.solid.set(false);
      return;
    }
    this.solid.set(cover.getBoundingClientRect().bottom <= 72);
  }
}
