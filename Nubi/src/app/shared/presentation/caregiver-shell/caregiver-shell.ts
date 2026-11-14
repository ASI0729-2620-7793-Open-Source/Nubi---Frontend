import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionStore } from '../../../iam/application/session.store';
import { ChildStore } from '../../../profile/application/child.store';
import { avatarOf, initials } from '../../../profile/domain/model/child-profile';

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
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
    { path: '/inicio', label: 'Inicio', icon: 'home' },
    { path: '/rutina', label: 'Rutina visual', icon: 'view_timeline' },
    { path: '/calma', label: 'Rincón de calma', icon: 'spa' },
    { path: '/comunicacion', label: 'Comunicación', icon: 'forum' },
    { path: '/progreso', label: 'Progreso', icon: 'insights' },
    { path: '/seguimiento', label: 'Red de apoyo', icon: 'diversity_1' },
    { path: '/perfil', label: 'Perfil del niño', icon: 'child_care' },
  ];

  protected readonly mobileLinks: NavLink[] = [
    { path: '/inicio', label: 'Inicio', icon: 'home' },
    { path: '/rutina', label: 'Rutina', icon: 'view_timeline' },
    { path: '/calma', label: 'Calma', icon: 'spa' },
    { path: '/comunicacion', label: 'Hablar', icon: 'forum' },
  ];

  signOut(): void {
    this.session.signOut();
    this.childStore.clear();
    void this.router.navigate(['/ingresar']);
  }
}
