import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecodeDirective } from './decode.directive';

@Component({
  template: '<p decode>HELLO WORLD</p>',
  imports: [DecodeDirective],
  standalone: true,
})
class HostComponent {}

describe('DecodeDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('should create the host component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not destroy the text content of the host element', () => {
    fixture.detectChanges();
    const p: HTMLParagraphElement = fixture.nativeElement.querySelector('p');
    // The directive may scramble then restore; after initial render the final
    // text must still be present (reduced-motion path leaves it unchanged).
    expect(p.textContent).toContain('HELLO WORLD');
  });
});
