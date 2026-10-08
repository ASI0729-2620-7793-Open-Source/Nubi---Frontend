import { Routes } from '@angular/router';
import {
  crisisManagementFocusRoutes,
  crisisManagementRoutes,
} from './crisis-management/presentation/crisis-management.routes';
import { Layout } from './shared/presentation/component/layout/layout';

/**
 * Rutas de la Web Application.
 *
 * Cada Bounded Context registra aquí sus propias rutas como hijas del layout. Las de la
 * barra lateral que todavía no existen las agrega el equipo responsable de cada contexto;
 * mientras tanto redirigen a Inicio.
 *
 * El `title` de cada ruta es una clave de public/i18n (ver TranslatedTitleStrategy).
 */
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      // ---------- Comunicación Asistida ----------
      {
        path: 'inicio',
        title: 'home.title',
        loadComponent: () =>
          import('./assistive-comunication/presentation/home-overview/home-overview').then(
            (m) => m.HomeOverview,
          ),
      },
      {
        path: 'comunicacion',
        title: 'board.title',
        loadComponent: () =>
          import('./assistive-comunication/presentation/communication-board/communication-board').then(
            (m) => m.CommunicationBoard,
          ),
      },

      // ---------- Gestión de Crisis (Modo SOS) ----------
      ...crisisManagementRoutes,

      // ---------- Autorregulación ----------
      {
        path: 'autocuidado',
        title: 'gallery.title',
        loadComponent: () =>
          import('./self-regulation/presentation/stimulus-gallery/stimulus-gallery').then(
            (m) => m.StimulusGallery,
          ),
      },
      {
        path: 'autocuidado/estimulos/:resourceId',
        title: 'session.pageTitle',
        loadComponent: () =>
          import('./self-regulation/presentation/stimulus-session/stimulus-session').then(
            (m) => m.StimulusSession,
          ),
      },

      // ---------- Dashboard de Red de Apoyo y Seguimiento ----------
      {
        path: 'support-network',
        loadComponent: () =>
          import('./support-network/presentation/support-dashboard/support-dashboard').then(
            (component) => component.SupportDashboard,
          ),
      },

      // ---------- Perfil y Personalización ----------
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

  // Pantalla de foco único: sin barra lateral, como en el mock-up del temporizador
  {
    path: 'autocuidado/temporizador/:sessionId',
    title: 'timer.title',
    loadComponent: () =>
      import('./self-regulation/presentation/calm-timer-page/calm-timer-page').then(
        (m) => m.CalmTimerPage,
      ),
  },

  // Gestión de Crisis: guía paso a paso y resumen, también de foco único
  ...crisisManagementFocusRoutes,

  // Las rutas de la barra lateral que todavía no existen vuelven a Inicio
  { path: '**', redirectTo: 'inicio' },
];
