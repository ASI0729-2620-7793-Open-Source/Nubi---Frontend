import { Component, inject } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { AuthStore } from '../../../application/auth.store';
import { AccountStore } from '../../../application/account.store';
import { ProfileStore } from '../../../../profile/application/profile.store';
import { PaymentsTable } from '../../components/payments-table/payments-table';
import { SubscriptionPanel } from '../../components/subscription-panel/subscription-panel';
import { SupportPanel } from '../../components/support-panel/support-panel';

/**
 * Vista cuidador: Datos de cuenta | Suscripción | Pagos | Soporte.
 * Sin pestañas de institución; si hay institución asociada, solo aviso.
 */
@Component({
  imports: [
    BreadcrumbModule,
    InputTextModule,
    MessageModule,
    PanelModule,
    TabsModule,
    PaymentsTable,
    SubscriptionPanel,
    SupportPanel,
  ],
  selector: 'app-caregiver-account',
  styleUrl: './caregiver-account.css',
  templateUrl: './caregiver-account.html',
})
export class CaregiverAccount {
  protected readonly auth = inject(AuthStore);
  protected readonly store = inject(AccountStore);
  protected readonly profiles = inject(ProfileStore);

  constructor() {
    this.store.loadAll(this.auth.account()?.id ?? 1);
  }
}

