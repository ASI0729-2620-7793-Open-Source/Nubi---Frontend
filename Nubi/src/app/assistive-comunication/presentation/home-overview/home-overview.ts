import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, map } from 'rxjs';
import { ProfileStore } from '../../../shared/application/profile.store';
import { CommunicationStore } from '../../application/communication.store';

const MINUTE_MS = 60_000;

/**
 * Vista General (Inicio): lo último que el perfil comunicó con el tablero CAA, para que
 * su cuidador confirme que lo recibió.
 */
@Component({
  imports: [
    DatePipe,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    RouterLink,
    TranslatePipe,
  ],
  selector: 'app-home-overview',
  styleUrl: './home-overview.css',
  templateUrl: './home-overview.html',
})
export class HomeOverview {
  protected readonly store = inject(CommunicationStore);
  protected readonly profileStore = inject(ProfileStore);

  /**
   * Contactos de la Red de Apoyo, como en el mock-up. Son de otro Bounded Context: van
   * fijos aquí hasta que Red de Apoyo y Seguimiento los exponga.
   */
  protected readonly supportContacts = [
    { name: 'Dr. Arrieta', roleKey: 'home.contactNeurologist', icon: 'call' },
    { name: 'Roberto (Papá)', roleKey: 'home.contactPrimaryNetwork', icon: 'chat' },
  ];

  protected readonly caregiverName = computed(
    () => this.profileStore.caregiver()?.fullName.split(' ')[0] ?? '',
  );

  protected readonly requestIcon = computed(() => {
    const request = this.store.latestRequest();
    return (request && this.store.findByCode(request.pictogramCode)?.icon) || 'help_outline';
  });

  private readonly now = toSignal(interval(MINUTE_MS / 2).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });

  /** Hace cuánto se comunicó la última necesidad, como clave de traducción y su valor. */
  protected readonly elapsed = computed(() => {
    const request = this.store.latestRequest();
    if (!request) return null;

    const minutes = Math.floor((this.now() - request.requestedAt.getTime()) / MINUTE_MS);
    if (minutes < 1) return { key: 'home.justNow', count: 0 };
    if (minutes < 60) {
      return { key: minutes === 1 ? 'home.minuteAgo' : 'home.minutesAgo', count: minutes };
    }
    const hours = Math.floor(minutes / 60);
    return { key: hours === 1 ? 'home.hourAgo' : 'home.hoursAgo', count: hours };
  });
}
