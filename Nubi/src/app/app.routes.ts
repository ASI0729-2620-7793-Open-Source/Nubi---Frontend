import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/component/layout/layout';

/**
 * Rutas de la Web Application.
 *
 * Cada Bounded Context registra aquí sus propias rutas como hijas del layout.
 *
 * El `title` de cada ruta es una clave de public/i18n (ver TranslatedTitleStrategy).
 */
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      {
        path: 'perfil',
        loadChildren: () =>
          import('./profile/presentation/profile.routes').then((m) => m.profileRoutes),
      },
      {
        path: 'my-plan',
        loadChildren: () =>
          import('./account/presentation/account.routes').then((m) => m.accountRoutes),
      },
    ],
  },
  // US-46 y US-47: autenticación pública, fuera del shell con menú.
  {
    path: 'auth/sign-in',
    loadComponent: () =>
      import('./account/presentation/views/sign-in/sign-in').then((m) => m.SignIn),
    title: 'auth.signIn.title',
  },
  {
    path: 'auth/sign-up',
    loadComponent: () =>
      import('./account/presentation/views/sign-up/sign-up').then((m) => m.SignUp),
    title: 'auth.signUp.title',
  },
];
