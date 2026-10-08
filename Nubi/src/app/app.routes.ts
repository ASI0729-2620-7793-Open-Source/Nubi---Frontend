import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'support-network',
    loadComponent: () =>
      import('./support-network/presentation/support-dashboard/support-dashboard').then(
        (component) => component.SupportDashboard,
      ),
  },
];
