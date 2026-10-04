import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/component/layout/layout';

/**
 * Rutas de la Web Application.
 *
 * Cada Bounded Context registra aquí sus propias rutas como hijas del layout. Las de la
 * barra lateral que todavía no existen (/inicio, /perfil, /comunicacion, /historial,
 * /ajustes y /modo-sos) las agrega el equipo responsable de cada contexto; mientras tanto
 * redirigen a Autocuidado.
 *
 * El `title` de cada ruta es una clave de public/i18n (ver TranslatedTitleStrategy).
 */
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'autocuidado', pathMatch: 'full' },

      // ---------- Red de Apoyo y Seguimiento ----------
      {
        path: 'autocuidado',
        title: 'gallery.title',
        loadComponent: () =>
          import('./support-network/presentation/stimulus-gallery/stimulus-gallery').then(
            (m) => m.StimulusGallery,
          ),
      },
      {
        path: 'autocuidado/estimulos/:resourceId',
        title: 'session.pageTitle',
        loadComponent: () =>
          import('./support-network/presentation/stimulus-session/stimulus-session').then(
            (m) => m.StimulusSession,
          ),
      },
    ],
  },

  // Pantalla de foco único: sin barra lateral, como en el mock-up del temporizador
  {
    path: 'autocuidado/temporizador/:sessionId',
    title: 'timer.title',
    loadComponent: () =>
      import('./support-network/presentation/calm-timer-page/calm-timer-page').then(
        (m) => m.CalmTimerPage,
      ),
  },

  { path: '**', redirectTo: 'autocuidado' },
];
