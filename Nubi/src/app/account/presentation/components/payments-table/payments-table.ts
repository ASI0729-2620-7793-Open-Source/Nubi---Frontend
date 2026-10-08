import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AccountStore } from '../../../application/account.store';

/**
 * Tabla de pagos reutilizable (cada intento del gateway es un Payment).
 * Tag con texto e ícono, no solo color.
 */
@Component({
  imports: [MessageModule, PanelModule, SkeletonModule, TableModule, TagModule],
  selector: 'app-payments-table',
  templateUrl: './payments-table.html',
})
export class PaymentsTable {
  protected readonly store = inject(AccountStore);

  protected severity(status: string): 'warn' | 'success' | 'danger' {
    if (status === 'PAID') return 'success';
    if (status === 'PENDING') return 'warn';
    return 'danger';
  }

  protected icon(status: string): string {
    if (status === 'PAID') return 'pi pi-check';
    if (status === 'PENDING') return 'pi pi-clock';
    return 'pi pi-times';
  }
}

