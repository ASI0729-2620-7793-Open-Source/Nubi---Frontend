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
    children: [],
  },
];
