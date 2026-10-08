import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { Account } from '../domain/model/account.entity';
import { Institution } from '../domain/model/institution.entity';
import { Payment } from '../domain/model/payment.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SupportTicket } from '../domain/model/support-ticket.entity';
import { PlanType } from '../domain/model/account.enums';
import { InstitutionApiEndpoint } from '../infrastructure/institution-api-endpoint';
import { PaymentGatewayMock } from '../infrastructure/payment-gateway.mock';
import { SubscriptionApiEndpoint } from '../infrastructure/subscription-api-endpoint';
import { SupportApiEndpoint } from '../infrastructure/support-api-endpoint';
import { AccountApiEndpoint } from '../infrastructure/account-api-endpoint';
import { AuthStore } from './auth.store';

/**
 * Estado de la cuenta: institución, miembros, suscripción, pagos y tickets.
 * Las vistas por rol consumen estos signals; nunca llaman HttpClient directo.
 */
@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly auth = inject(AuthStore);
  private readonly institutions = inject(InstitutionApiEndpoint);
  private readonly subscriptions = inject(SubscriptionApiEndpoint);
  private readonly support = inject(SupportApiEndpoint);
  private readonly accounts = inject(AccountApiEndpoint);
  private readonly gateway = inject(PaymentGatewayMock);

  private readonly institutionState = signal<Institution | null>(null);
  private readonly membersState = signal<Account[]>([]);
  private readonly subscriptionState = signal<Subscription | null>(null);
  private readonly paymentsState = signal<Payment[]>([]);
  private readonly ticketsState = signal<SupportTicket[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly infoState = signal<string | null>(null);

  readonly institution = computed(() => this.institutionState());
  readonly members = computed(() => this.membersState());
  readonly subscription = computed(() => this.subscriptionState());
  readonly payments = computed(() => this.paymentsState());
  readonly tickets = computed(() => this.ticketsState());
  readonly openTickets = computed(() =>
    this.ticketsState().filter((ticket) => ticket.status !== 'CLOSED'),
  );
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly info = computed(() => this.infoState());

  /** Límites por plan para el mock local (RF-04). El backend los valida de verdad. */
  private static readonly planLimits: Record<PlanType, { profiles: number; caregivers: number }> =
    {
      [PlanType.FREEMIUM]: { profiles: 1, caregivers: 2 },
      [PlanType.FAMILY_PREMIUM]: { profiles: 3, caregivers: 4 },
      [PlanType.INSTITUTIONAL]: { profiles: 200, caregivers: 50 },
    };

  loadAll(accountId: number): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    forkJoin({
      subscription: this.subscriptions.getSubscription(accountId),
      tickets: this.support.listByAccount(accountId),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ subscription, tickets }) => {
          this.subscriptionState.set(subscription);
          this.ticketsState.set(tickets);
          if (subscription) {
            this.loadInstitutional(subscription.accountId);
            this.subscriptions
              .listPayments(subscription.id)
              .subscribe({ next: (payments) => this.paymentsState.set(payments) });
          }
        },
        error: () => this.errorState.set('account.errors.load'),
      });
  }

  private loadInstitutional(accountId: number): void {
    this.institutions.getByAccount(accountId).subscribe({
      next: (institution) => {
        this.institutionState.set(institution);
        this.institutions
          .listMembers(institution.id)
          .subscribe({ next: (members) => this.membersState.set(members) });
      },
      error: () => this.institutionState.set(null),
    });
  }

  /** addMember solo con cuentas existentes y activas (regla 4). */
  addMemberByEmail(email: string): void {
    const institution = this.institutionState();
    const selfId = this.auth.account()?.id;
    if (!institution) return;
    this.accounts.listAccounts().subscribe({
      next: (accounts) => {
        const found = accounts.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!found) {
          this.errorState.set('account.members.notFound');
          return;
        }
        if (!found.active) {
          this.errorState.set('account.members.inactive');
          return;
        }
        if (found.id === selfId) {
          this.errorState.set('account.members.self');
          return;
        }
        this.institutions.addMember(institution, found).subscribe({
          next: (updated) => {
            this.institutionState.set(updated);
            this.infoState.set('account.members.added');
          },
          error: () => this.errorState.set('account.errors.load'),
        });
      },
      error: () => this.errorState.set('account.errors.load'),
    });
  }

  /** assignProfile: el perfil sigue visible para su familia (regla 3). */
  assignProfile(profileId: number): void {
    const institution = this.institutionState();
    if (!institution) return;
    this.institutions.assignProfile(institution, profileId).subscribe({
      next: (updated) => {
        this.institutionState.set(updated);
        this.infoState.set('account.students.assigned');
      },
      error: () => this.errorState.set('account.errors.load'),
    });
  }

  /** Mejora de plan pasando por el mock de PaymentGateway (RF-05, RF-06). */
  upgrade(plan: PlanType, amount: number): void {
    const subscription = this.subscriptionState();
    if (!subscription) return;
    this.gateway.charge(subscription.id, amount, 'USD').subscribe((payment) => {
      this.paymentsState.update((items) => [payment, ...items]);
      if (payment.status !== 'PAID') {
        // RF-06: se mantiene el plan actual y se informa sin culpar al usuario.
        this.errorState.set('account.payments.failed');
        return;
      }
      const limits = AccountStore.planLimits[plan];
      // La API falsa no implementa /upgrade: se aplica en local y el backend lo confirma.
      this.subscriptions.upgradePlan(subscription.id, plan).subscribe({
        next: (updated) => {
          this.subscriptionState.set(updated);
          this.infoState.set('account.subscription.upgraded');
        },
        error: () =>
          this.subscriptionState.set(
            subscription.upgradeTo(plan, limits.profiles, limits.caregivers),
          ),
      });
      this.infoState.set('account.subscription.upgraded');
    });
  }

  /** Cambia al plan elegido: subida con cobro, bajada a FREEMIUM directa. */
  changePlan(plan: PlanType): void {
    const subscription = this.subscriptionState();
    if (!subscription) {
      this.infoState.set('account.subscription.none');
      return;
    }
    if (subscription.plan === plan) return;
    if (plan === PlanType.FREEMIUM) {
      const limits = AccountStore.planLimits[plan];
      this.subscriptions.upgradePlan(subscription.id, plan).subscribe({
        next: (updated) => this.subscriptionState.set(updated),
        // La API falsa no implementa /upgrade: se aplica en local.
        error: () =>
          this.subscriptionState.set(subscription.upgradeTo(plan, limits.profiles, limits.caregivers)),
      });
      this.infoState.set('account.subscription.upgraded');
      return;
    }
    this.upgrade(plan, plan === PlanType.INSTITUTIONAL ? 49.9 : 9.9);
  }

  /** Cancela con confirmación previa en la vista (RF-07). */
  cancelSubscription(): void {
    const subscription = this.subscriptionState();
    if (!subscription) return;
    this.subscriptions.cancelSubscription(subscription.id).subscribe({
      next: (updated) => {
        this.subscriptionState.set(updated);
        this.infoState.set('account.subscription.cancelled');
      },
      // La API falsa no implementa /cancel: se aplica en local.
      error: () => {
        this.subscriptionState.set(subscription.cancel());
        this.infoState.set('account.subscription.cancelled');
      },
    });
  }

  report(subject: string, description: string): void {
    const accountId = this.auth.account()?.id ?? 1;
    if (!subject.trim()) {
      this.errorState.set('account.support.required');
      return;
    }
    this.support.reportIssue(accountId, { subject, description }).subscribe({
      next: (ticket) => {
        this.ticketsState.update((items) => [ticket, ...items]);
        this.infoState.set('account.support.sent');
      },
      error: () => this.errorState.set('account.errors.load'),
    });
  }

  closeTicket(ticket: SupportTicket): void {
    this.support.closeTicket(ticket).subscribe({
      next: (closed) =>
        this.ticketsState.update((items) =>
          items.map((item) => (item.id === closed.id ? closed : item)),
        ),
      // La API falsa no implementa /close: se aplica en local.
      error: () =>
        this.ticketsState.update((items) =>
          items.map((item) => (item.id === ticket.id ? ticket.close() : item)),
        ),
    });
  }

  clear(): void {
    this.errorState.set(null);
    this.infoState.set(null);
  }
}
