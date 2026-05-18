import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'entry', loadComponent: () => import('./features/entry-form/entry-form.component').then(m => m.EntryFormComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
