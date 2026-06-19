import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: 'entry', loadComponent: () => import('./features/dashboard/entry-modal.component').then(m => m.EntryModalComponent) },
    ],
  },
  { path: 'fixed', loadComponent: () => import('./features/fixed-costs/fixed-costs.component').then(m => m.FixedCostsComponent)},
  { path: 'entry', loadComponent: () => import('./features/entry-form/entry-form.component').then(m => m.EntryFormComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
