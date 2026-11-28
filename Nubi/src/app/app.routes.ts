import { Routes } from '@angular/router';
import { adultGuard, authGuard, childGuard, guestGuard, noChildGuard } from './iam/application/guards';
import { CaregiverShell } from './shared/presentation/caregiver-shell/caregiver-shell';

/**
 * Nubi tiene dos formas de usarse:
 *  - Modo cuidador (con barra lateral): seguimiento, perfil, rutina, progreso...
 *  - Modo niño (/nino): pantalla completa, botones grandes y nada de configuración.
 * El reproductor de calma y el Modo SOS también son de pantalla completa.
 */
export const routes: Routes = [
  {
    path: 'ingresar',
    canActivate: [guestGuard],
    title: 'titles.signIn',
    loadComponent: () => import('./iam/presentation/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    title: 'titles.signUp',
    loadComponent: () => import('./iam/presentation/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: 'bienvenida',
    canActivate: [authGuard, noChildGuard],
    title: 'titles.welcome',
    loadComponent: () => import('./profile/presentation/onboarding/onboarding').then((m) => m.Onboarding),
  },
  {
    path: '',
    component: CaregiverShell,
    canActivate: [authGuard, childGuard, adultGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'titles.home',
        loadComponent: () => import('./dashboard/presentation/home/home').then((m) => m.Home),
      },
      {
        path: 'rutina',
        title: 'titles.routine',
        loadComponent: () => import('./routine/presentation/routine-editor/routine-editor').then((m) => m.RoutineEditor),
      },
      {
        path: 'calma',
        title: 'titles.calm',
        loadComponent: () => import('./self-regulation/presentation/calm-library/calm-library').then((m) => m.CalmLibrary),
      },
      {
        path: 'comunicacion',
        title: 'titles.communication',
        loadComponent: () =>
          import('./communication/presentation/communication-board/communication-board').then((m) => m.CommunicationBoardPage),
      },
      {
        path: 'progreso',
        title: 'titles.progress',
        loadComponent: () => import('./insights/presentation/progress/progress').then((m) => m.Progress),
      },
      {
        path: 'seguimiento',
        title: 'titles.support',
        loadComponent: () => import('./support-network/presentation/tracking/tracking').then((m) => m.Tracking),
      },
      {
        path: 'perfil',
        title: 'titles.profile',
        loadComponent: () => import('./profile/presentation/child-profile/child-profile').then((m) => m.ChildProfilePage),
      },
      {
        path: 'ayuda',
        title: 'titles.help',
        loadComponent: () => import('./shared/presentation/help/help').then((m) => m.Help),
      },
      {
        path: 'plan',
        title: 'titles.plan',
        loadComponent: () => import('./profile/presentation/plan/plan').then((m) => m.Plan),
      },
    ],
  },
  {
    path: 'sesion/:resourceId',
    canActivate: [authGuard, childGuard],
    title: 'titles.calmPlayer',
    loadComponent: () => import('./self-regulation/presentation/calm-player/calm-player').then((m) => m.CalmPlayer),
  },
  {
    path: 'sos',
    canActivate: [authGuard, childGuard],
    children: [
      {
        path: '',
        title: 'titles.sos',
        loadComponent: () => import('./crisis/presentation/sos-start/sos-start').then((m) => m.SosStart),
      },
      {
        path: ':sessionId',
        title: 'titles.sosGuide',
        loadComponent: () => import('./crisis/presentation/sos-guide/sos-guide').then((m) => m.SosGuide),
      },
    ],
  },
  {
    path: 'nino',
    canActivate: [authGuard, childGuard],
    loadComponent: () => import('./kid-mode/presentation/kid-shell/kid-shell').then((m) => m.KidShell),
    children: [
      {
        path: '',
        title: 'titles.kidHome',
        loadComponent: () => import('./kid-mode/presentation/kid-home/kid-home').then((m) => m.KidHome),
      },
      {
        path: 'hablar',
        title: 'titles.kidTalk',
        loadComponent: () => import('./kid-mode/presentation/kid-talk/kid-talk').then((m) => m.KidTalk),
      },
      {
        path: 'mi-dia',
        title: 'titles.kidDay',
        loadComponent: () => import('./kid-mode/presentation/kid-day/kid-day').then((m) => m.KidDay),
      },
    ],
  },
  {
    path: 'sin-conexion',
    title: 'titles.offline',
    loadComponent: () => import('./shared/presentation/offline/offline').then((m) => m.Offline),
  },
  { path: '**', redirectTo: 'inicio' },
];
