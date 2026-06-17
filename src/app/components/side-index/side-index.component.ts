import {
  ChangeDetectionStrategy,
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
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../services/motion.service';

interface SectionEntry {
  id: string;
  num: string;
  key: 'index' | 'about' | 'work' | 'lab' | 'contact';
}

@Component({
  selector: 'app-side-index',
  standalone: true,
  imports: [],
  templateUrl: './side-index.component.html',
  styleUrl: './side-index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideIndexComponent implements OnInit, OnDestroy {
  readonly langService = inject(LanguageService);
  readonly t = this.langService.t;
  readonly motion = inject(MotionService);

  readonly activeSection = signal<string>('index');
  readonly menuOpen = signal(false);

  readonly sections: SectionEntry[] = [
    { id: 'index',   num: '00', key: 'index'   },
    { id: 'about',   num: '01', key: 'about'   },
    { id: 'work',    num: '02', key: 'work'     },
    { id: 'lab',     num: '03', key: 'lab'      },
    { id: 'contact', num: '04', key: 'contact'  },
  ];

  private observer: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    queueMicrotask(() => {
      this.sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el && this.observer) this.observer.observe(el);
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollTo(id: string): void {
    this.activeSection.set(id);
    this.menuOpen.set(false);

    if (!isPlatformBrowser(this.platformId)) return;

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: this.motion.reduced() ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  openMenu(): void {
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLang(): void {
    this.langService.toggle();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.menuOpen()) {
      this.closeMenu();
    }
  }
}
