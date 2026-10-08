import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AuthStore } from '../../../application/auth.store';
import { AccountStore } from '../../../application/account.store';
import { PaymentsTable } from '../../components/payments-table/payments-table';
import { SubscriptionPanel } from '../../components/subscription-panel/subscription-panel';
import { SupportPanel } from '../../components/support-panel/support-panel';

/**
 * Vista administrador: Resumen | Miembros | Perfiles | Suscripción | Soporte.
 * Solo muestra nombre, edad y estado de estudiantes (regla 6).
 */
@Component({
  imports: [
    FormsModule,
    RouterLink,
    AvatarModule,
    BreadcrumbModule,
    ButtonModule,
    DataViewModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    PanelModule,
    SkeletonModule,
    TableModule,
    TabsModule,
    TagModule,
    PaymentsTable,
    SubscriptionPanel,
    SupportPanel,
  ],
  selector: 'app-admin-account',
  styleUrl: './admin-account.css',
  templateUrl: './admin-account.html',
})
export class AdminAccount {
  protected readonly auth = inject(AuthStore);
  protected readonly store = inject(AccountStore);
  protected readonly memberOpen = signal(false);
  protected readonly memberEmail = signal('');
  protected readonly assignOpen = signal(false);
  protected readonly profileId = signal<number | null>(null);

  constructor() {
    if (!this.auth.account()) this.auth.load(2);
    this.store.loadAll(this.auth.account()?.id ?? 2);
  }

  protected addMember(): void {
    this.store.addMemberByEmail(this.memberEmail());
    this.memberOpen.set(false);
    this.memberEmail.set('');
  }

  protected assign(): void {
    if (this.profileId() !== null) this.store.assignProfile(this.profileId()!);
    this.assignOpen.set(false);
  }
}

