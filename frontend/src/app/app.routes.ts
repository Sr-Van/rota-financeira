import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: 'entry', loadComponent: () => import('./features/dashboard/entry-modal.component').then(m => m.EntryModalComponent) },
    ],
  },
  { path: 'costs', loadComponent: () => import('./features/costs/costs.component').then(m => m.CostsComponent)},
  { path: 'entry', loadComponent: () => import('./features/entry-form/entry-form.component').then(m => m.EntryFormComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
