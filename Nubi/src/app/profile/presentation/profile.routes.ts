import { Routes } from '@angular/router';

/**
 * Rutas del Bounded Context Perfil y Personalización.
 * Cuelgan del Layout como el resto de contextos (ver app.routes.ts).
 */
export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/profile-list/profile-list').then((m) => m.ProfileList),
    title: 'profile.list.title',
  },
  {
    path: 'cuidador',
    loadComponent: () =>
      import('./views/caregiver-profile/caregiver-profile').then((m) => m.CaregiverProfile),
    title: 'profile.caregiver.title',
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./views/profile-create/profile-create').then((m) => m.ProfileCreate),
    title: 'profile.create.heading',
  },
  {
    path: ':id/cuidadores',
    loadComponent: () =>
      import('./views/profile-caregivers/profile-caregivers').then((m) => m.ProfileCaregivers),
    title: 'profile.caregivers.title',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./views/profile-detail/profile-detail').then((m) => m.ProfileDetail),
    title: 'profile.detail.title',
  },
];
