import { Component, signal, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CursorComponent } from './components/cursor/cursor.component';
import { ScrollProgressComponent } from './components/scroll-progress/scroll-progress.component';
import { WebglSceneComponent } from './components/webgl-scene/webgl-scene.component';
import { SideIndexComponent } from './components/side-index/side-index.component';
import { HudComponent } from './components/hud/hud.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SideIndexComponent,
    HudComponent,
    ScrollProgressComponent,
    WebglSceneComponent,
    CursorComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  /** Active section id, mirrored to the HUD. side-index tracks its own copy. */
  protected readonly activeSection = signal('index');
  private readonly sectionIds = ['index', 'about', 'work', 'lab', 'contact'];

  constructor() {
    // afterNextRender only fires in the browser, after the first paint, so the
    // routed home sections exist by the time we look them up.
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        entries => {
          for (const e of entries) {
            if (e.isIntersecting) this.activeSection.set(e.target.id);
          }
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
      );
      for (const id of this.sectionIds) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    });
  }
}
