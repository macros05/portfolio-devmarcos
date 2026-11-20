import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';

const proposalPage = () =>
  import('./pages/proposal/proposal.component').then((m) => m.ProposalComponent);

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'proyecto/:id', component: ProjectDetailComponent },
  // Private proposals. Not linked from the nav. The page sets noindex, nofollow.
  // Leave `/propuestas` out of any future sitemap. No slug uses the same
  // not-found state as an unknown slug, instead of falling through to home.
  { path: 'propuestas', loadComponent: proposalPage },
  { path: 'propuestas/:slug', loadComponent: proposalPage },
  { path: '**', redirectTo: '' },
];
