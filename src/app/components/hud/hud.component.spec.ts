import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HudComponent } from './hud.component';

describe('HudComponent', () => {
  let component: HudComponent;
  let fixture: ComponentFixture<HudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HudComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HudComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('host element has aria-hidden="true"', () => {
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders without error when stats input is set', () => {
    fixture.componentRef.setInput('stats', {
      fps: 60,
      ms: 16.7,
      triangles: 1000,
      calls: 5,
      points: 65000,
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
