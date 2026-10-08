import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AccountStore } from '../../../application/account.store';
import { PlanType } from '../../../domain/model/account.enums';

/**
 * Sección "Mis suscripciones" reutilizable (cuidador e institución).
 * RF-02 plan/estado/fechas, RF-03 límites y uso, RF-04 comparador,
 * RF-05 mejora, RF-06 rechazo sin culpa, RF-07 cancelación con
 * confirmación, RF-11 funciones no incluidas en el plan actual.
 */
@Component({
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    MessageModule,
    PanelModule,
    ProgressBarModule,
    TableModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  selector: 'app-subscription-panel',
  templateUrl: './subscription-panel.html',
})
export class SubscriptionPanel {
  protected readonly store = inject(AccountStore);
  private readonly confirm = inject(ConfirmationService);
  protected readonly PlanType = PlanType;

  /** Uso actual frente a los límites (RF-03, RF-09, RF-10). */
  readonly profilesUsed = input(0);
  readonly caregiversUsed = input(0);
  /** Oculta acciones de cuidador familiar en la vista institucional. */
  readonly institutional = input(false);

  protected readonly plans: { plan: PlanType; price: string; profiles: number; caregivers: number }[] = [
    { plan: PlanType.FREEMIUM, price: 'Gratis', profiles: 1, caregivers: 2 },
    { plan: PlanType.FAMILY_PREMIUM, price: 'USD 9.90', profiles: 3, caregivers: 4 },
    { plan: PlanType.INSTITUTIONAL, price: 'USD 49.90', profiles: 200, caregivers: 50 },
  ];

  protected usagePercent(used: number, max: number): number {
    return max <= 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  }

  /** RF-07: cancela explicando qué se pierde. */
  protected askCancel(): void {
    this.confirm.confirm({
      message:
        'Volverás al plan gratuito: solo 1 perfil, 2 cuidadores por perfil y sin reportes institucionales.',
      header: 'Cancelar suscripción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.cancelSubscription(),
    });
  }
}
