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

  it('features three leads and keeps a plate for every other project', () => {
    fixture.detectChanges();
    const leads = fixture.nativeElement.querySelectorAll('.plate--lead');
    const rest = fixture.nativeElement.querySelectorAll('.plate--rest');
    expect(leads.length).toBe(PROJECTS.filter(project => project.lead).length);
    expect(rest.length).toBe(PROJECTS.filter(project => !project.lead).length);
    expect(leads.length).toBe(3);
    const titles = [...leads].map((el: Element) => el.querySelector('h3')?.textContent?.trim());
    expect(titles).toEqual(['Reels Factory', 'Trading desk', 'Kairova']);
  });
});
