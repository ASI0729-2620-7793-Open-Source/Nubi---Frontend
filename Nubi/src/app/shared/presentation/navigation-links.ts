import { AccountRole } from '../../account/domain/model/account.enums';

export interface NavigationLink {
  path: string;
  /** Clave de traducción en public/i18n. */
  labelKey: string;
  icon: string;
  /** Roles que ven este enlace; vacío = todos (regla 1). */
  roles?: AccountRole[];
}

/**
 * Accesos a los módulos de Nubi, como en la barra lateral de los mock-ups. Los usan la
 * barra lateral (desktop) y la barra superior (tablet y mobile): cada equipo registra su
 * ruta en app.routes.ts y el enlace funciona igual en todos los tamaños de pantalla.
 *
 * En el modo niño no aparece nada de cuenta o administración: "Mi plan" vive
 * dentro de la vista del administrador (/my-plan/institution) y las rutas
 * siguen protegidas por guards.
 */
export const NAVIGATION_LINKS: readonly NavigationLink[] = [
  { path: '/inicio', labelKey: 'nav.home', icon: 'home' },
  { path: '/perfil', labelKey: 'nav.profile', icon: 'person' },
  { path: '/autocuidado', labelKey: 'nav.selfcare', icon: 'favorite' },
  { path: '/comunicacion', labelKey: 'nav.communication', icon: 'sms' },
  { path: '/support-network', labelKey: 'nav.support', icon: 'groups' },
];
