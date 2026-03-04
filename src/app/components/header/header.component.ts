import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Variable que controla si la barra se ve o no
  isScrolled = false;

  // Escucha el evento de scroll de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Si bajamos más de 400 píxeles (cuando pasamos el Hero), se activa
    this.isScrolled = window.scrollY > 400;
  }
}
