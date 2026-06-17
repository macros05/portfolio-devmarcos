import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabComponent } from './lab.component';

describe('LabComponent', () => {
  let component: LabComponent;
  let fixture: ComponentFixture<LabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create without throwing (exercises no-WebGL fallback)', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the lab experiments list', () => {
    expect(Array.isArray(component.experiments)).toBe(true);
    expect(component.experiments.length).toBeGreaterThan(0);
  });
});
