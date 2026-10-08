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
    ],
  },

  // Las rutas de la barra lateral que todavía no existen vuelven a Inicio
  { path: '**', redirectTo: 'inicio' },
];
