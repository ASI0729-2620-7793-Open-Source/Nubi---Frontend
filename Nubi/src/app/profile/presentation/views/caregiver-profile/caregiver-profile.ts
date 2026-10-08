import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { AuthStore } from '../../../../account/application/auth.store';
import { AccountStore } from '../../../../account/application/account.store';
import { PaymentsTable } from '../../../../account/presentation/components/payments-table/payments-table';
import { SubscriptionPanel } from '../../../../account/presentation/components/subscription-panel/subscription-panel';
import { ProfileStore } from '../../../application/profile.store';

/**
 * Vista B: perfil del cuidador autenticado.
 * Mis invitaciones PENDING con botón Aceptar (accept -> ACTIVE),
 * mis perfiles y la sección Mi plan (suscripción y pagos).
 */
@Component({
  imports: [
    RouterLink,
    AvatarModule,
    BreadcrumbModule,
    ButtonModule,
    MessageModule,
    PanelModule,
    TagModule,
    PaymentsTable,
    SubscriptionPanel,
  ],
  selector: 'app-caregiver-profile',
  styleUrl: './caregiver-profile.css',
  templateUrl: './caregiver-profile.html',
})
export class CaregiverProfile {
  protected readonly store = inject(ProfileStore);
  protected readonly auth = inject(AuthStore);
  protected readonly plans = inject(AccountStore);
  protected readonly crumbs = [
    { label: 'Inicio', routerLink: '/inicio' },
    { label: 'Perfiles', routerLink: '/perfil' },
    { label: 'Mi perfil cuidador' },
  ];

  constructor() {
    this.plans.loadAll(this.auth.account()?.id ?? 1);
  }

  protected initials(value: string): string {
    return value
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
