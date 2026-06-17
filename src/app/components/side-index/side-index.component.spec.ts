import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideIndexComponent } from './side-index.component';

describe('SideIndexComponent', () => {
  let component: SideIndexComponent;
  let fixture: ComponentFixture<SideIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideIndexComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SideIndexComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a <nav> element', () => {
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav).not.toBeNull();
  });

  it('renders 5 section links in the desktop column', () => {
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.side-item__link');
    expect(links.length).toBe(5);
  });
});
