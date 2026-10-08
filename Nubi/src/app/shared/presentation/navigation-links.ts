export interface NavigationLink {
  path: string;
  /** Clave de traducción en public/i18n. */
  labelKey: string;
  icon: string;
}

/**
 * Accesos a los módulos de Nubi, como en la barra lateral de los mock-ups. Los usan la
 * barra lateral (desktop) y la barra superior (tablet y mobile): cada equipo registra su
 * ruta en app.routes.ts y el enlace funciona igual en todos los tamaños de pantalla.
 */
export const NAVIGATION_LINKS: readonly NavigationLink[] = [
  { path: '/inicio', labelKey: 'nav.home', icon: 'home' },
  { path: '/perfil', labelKey: 'nav.profile', icon: 'person' },
  { path: '/autocuidado', labelKey: 'nav.selfcare', icon: 'favorite' },
  { path: '/comunicacion', labelKey: 'nav.communication', icon: 'sms' },
  { path: '/historial', labelKey: 'nav.history', icon: 'history' },
  { path: '/ajustes', labelKey: 'nav.settings', icon: 'settings' },
];
