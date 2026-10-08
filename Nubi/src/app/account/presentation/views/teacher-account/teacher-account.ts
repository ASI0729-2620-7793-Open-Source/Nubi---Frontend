import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AuthStore } from '../../../application/auth.store';
import { AccountStore } from '../../../application/account.store';
import { SupportPanel } from '../../components/support-panel/support-panel';

/**
 * Vista docente: perfiles asignados (solo lectura) y soporte.
 * Sin Miembros ni Suscripción.
 */
@Component({
  imports: [
    RouterLink,
    AvatarModule,
    BreadcrumbModule,
    ButtonModule,
    DataViewModule,
    MessageModule,
    PanelModule,
    TabsModule,
    TagModule,
    SupportPanel,
  ],
  selector: 'app-teacher-account',
  templateUrl: './teacher-account.html',
})
export class TeacherAccount {
  protected readonly auth = inject(AuthStore);
  protected readonly store = inject(AccountStore);

  constructor() {
    this.store.loadAll(this.auth.account()?.id ?? 3);
  }
}

