import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgxParticlesModule} from '@tsparticles/angular';
import {ISourceOptions, MoveDirection, OutMode} from '@tsparticles/engine';
import {loadSlim} from '@tsparticles/slim';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxParticlesModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('portfolio-dev');
  particlesOptions: ISourceOptions = {
    background: {
      color: "#0f172a" // Tu color de fondo oscuro
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab" // Modo para crear el rastro/grabación
        }
      },
      modes: {
        grab: {
          distance: 100,
          links: {
            opacity: 0.5
          }
        }
      }
    },
    particles: {
      color: {
        value: "#3b82f6" // El azul de Tailwind
      },
      links: {
        color: "#3b82f6",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1
      },
      move: {
        direction: MoveDirection.none,
        enable: true,
        outModes: {
          default: OutMode.bounce
        },
        random: true,
        speed: 1,
        straight: false
      },
      number: {
        density: {
          enable: true,
          width: 1920,
          height: 1080
        },
        value: 80
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 }
      }
    },
    detectRetina: true
  };

  async particlesInit(engine: any): Promise<void> {
    await loadSlim(engine); // Carga el preset ligero
  }

}
