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

  it('renders all projects: featured title + grid thumb titles equals PROJECTS.length', () => {
    fixture.detectChanges();

    // Featured project title (h2.featured__title) + grid project titles (.thumb__title)
    const featuredTitles = fixture.nativeElement.querySelectorAll('.featured__title');
    const thumbTitles = fixture.nativeElement.querySelectorAll('.thumb__title');

    expect(featuredTitles.length + thumbTitles.length).toBe(PROJECTS.length);
  });
});
