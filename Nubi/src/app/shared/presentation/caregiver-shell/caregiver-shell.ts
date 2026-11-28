import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionStore } from '../../../iam/application/session.store';
import { ChildStore } from '../../../profile/application/child.store';
import { avatarOf, initials } from '../../../profile/domain/model/child-profile';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitch } from '../language-switch/language-switch';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

/**
 * Marco del modo cuidador: barra lateral en escritorio y barra inferior en el celular.
 * Desde aquí siempre están a mano el Modo niño y el botón SOS.
 */
@Component({
  selector: 'app-caregiver-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitch],
  templateUrl: './caregiver-shell.html',
  styleUrl: './caregiver-shell.css',
})
export class CaregiverShell {
  protected readonly session = inject(SessionStore);
  protected readonly childStore = inject(ChildStore);
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly initials = initials;
  protected readonly avatarOf = avatarOf;

  protected readonly links: NavLink[] = [
    { path: '/inicio', label: 'nav.home', icon: 'home' },
    { path: '/rutina', label: 'nav.routine', icon: 'view_timeline' },
    { path: '/calma', label: 'nav.calm', icon: 'spa' },
    { path: '/comunicacion', label: 'nav.communication', icon: 'forum' },
    { path: '/progreso', label: 'nav.progress', icon: 'insights' },
    { path: '/seguimiento', label: 'nav.support', icon: 'diversity_1' },
    { path: '/perfil', label: 'nav.profile', icon: 'child_care' },
    { path: '/ayuda', label: 'nav.help', icon: 'help' },
  ];

  protected readonly mobileLinks: NavLink[] = [
    { path: '/inicio', label: 'nav.home', icon: 'home' },
    { path: '/rutina', label: 'nav.routineShort', icon: 'view_timeline' },
    { path: '/calma', label: 'nav.calmShort', icon: 'spa' },
    { path: '/comunicacion', label: 'nav.talkShort', icon: 'forum' },
  ];

  signOut(): void {
    this.session.signOut();
    this.childStore.clear();
    void this.router.navigate(['/ingresar']);
  }
}
