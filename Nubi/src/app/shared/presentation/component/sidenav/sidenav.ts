import { Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthStore } from '../../../../account/application/auth.store';
import { ProfileStore } from '../../../application/profile.store';
import { NAVIGATION_LINKS } from '../../navigation-links';
import { LanguageSwitch } from '../language-switch/language-switch';

/**
 * Barra lateral de navegación, tal como aparece en los mock-ups (sección 4.4.3).
 * En desktop queda fija a la izquierda; en mobile se abre como menú desde la
 * hamburguesa de la barra superior. Filtra enlaces según AccountRole (regla 1).
 */
@Component({
  imports: [MatIconModule, RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitch],
  selector: 'app-sidenav',
  styleUrl: './sidenav.css',
  templateUrl: './sidenav.html',
})
export class Sidenav {
  protected readonly profileStore = inject(ProfileStore);
  private readonly auth = inject(AuthStore);
  protected readonly links = computed(() =>
    NAVIGATION_LINKS.filter((link) => !link.roles || link.roles.includes(this.auth.role())),
  );

  /** Se emite al elegir un destino, para cerrar el menú en mobile. */
  readonly navigated = output<void>();
}
