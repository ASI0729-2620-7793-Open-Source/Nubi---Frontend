import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { AccountStore } from '../../../application/account.store';

/**
 * Panel de soporte reutilizable: reportar (reportIssue) y tickets
 * con Tag de estado (texto e ícono, no solo color).
 */
@Component({
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    PanelModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TextareaModule,
  ],
  selector: 'app-support-panel',
  templateUrl: './support-panel.html',
})
export class SupportPanel {
  protected readonly store = inject(AccountStore);
  protected readonly subject = signal('');
  protected readonly description = signal('');

  protected send(): void {
    this.store.report(this.subject(), this.description());
    this.subject.set('');
    this.description.set('');
  }

  protected severity(status: string): 'warn' | 'info' | 'success' {
    if (status === 'OPEN') return 'warn';
    if (status === 'IN_PROGRESS') return 'info';
    return 'success';
  }

  protected icon(status: string): string {
    if (status === 'OPEN') return 'pi pi-inbox';
    if (status === 'IN_PROGRESS') return 'pi pi-spin pi-spinner';
    return 'pi pi-check';
  }
}

