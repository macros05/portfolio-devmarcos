import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'proyecto/:id', component: ProjectDetailComponent },
  // Private proposals. Not linked from the nav. The page sets noindex, nofollow.
  // Leave `/propuestas/` out of any future sitemap.
  {
    path: 'propuestas/:slug',
    loadComponent: () =>
      import('./pages/proposal/proposal.component').then((m) => m.ProposalComponent),
  },
  { path: '**', redirectTo: '' },
];
