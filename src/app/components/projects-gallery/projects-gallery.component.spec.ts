import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProjectsGalleryComponent } from './projects-gallery.component';
import { PROJECTS } from '../../data/project.data';

describe('ProjectsGalleryComponent', () => {
  let component: ProjectsGalleryComponent;
  let fixture: ComponentFixture<ProjectsGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsGalleryComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsGalleryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a card for every project, with the featured one set apart', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    const featured = PROJECTS.filter(project => project.featured);
    expect(cards.length).toBe(PROJECTS.length - featured.length);
    expect(fixture.nativeElement.querySelector('app-kairova')).toBeTruthy();
  });
});
