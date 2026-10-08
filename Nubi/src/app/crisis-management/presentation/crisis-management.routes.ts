import { Routes } from '@angular/router';

const sosActivation = () =>
  import('./views/sos-activation/sos-activation').then((m) => m.SosActivation);
const sosGuide = () => import('./views/sos-guide/sos-guide').then((m) => m.SosGuide);
const crisisSummary = () =>
  import('./views/crisis-summary/crisis-summary').then((m) => m.CrisisSummary);

/**
 * Pantalla del Modo SOS que va dentro del layout, con la barra lateral. app.routes.ts la
 * registra como hija del layout.
 */
export const crisisManagementRoutes: Routes = [
  { path: 'modo-sos', title: 'sos.pageTitle', loadComponent: sosActivation },
];

/**
 * Pantallas de foco único (guía paso a paso y resumen): sin barra lateral para que el
 * cuidador no tenga nada más en pantalla durante la crisis. Se registran al nivel raíz.
 */
export const crisisManagementFocusRoutes: Routes = [
  { path: 'modo-sos/sesion/:sessionId', title: 'sos.guide.pageTitle', loadComponent: sosGuide },
  {
    path: 'modo-sos/sesion/:sessionId/resumen',
    title: 'sos.summary.pageTitle',
    loadComponent: crisisSummary,
  },
];
