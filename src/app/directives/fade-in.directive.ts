import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[fadeIn]',
  standalone: true,
})
export class FadeInDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;

    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.7s ease, transform 0.7s ease';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
  }
}
