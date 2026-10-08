import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanType } from '../domain/model/account.enums';
import { Payment } from '../domain/model/payment.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { AccountAssembler } from './account-assembler';
import { PaymentResource, SubscriptionResource } from './account-resources';

/**
 * Fachada HTTP del SubscriptionController (endpoints del diagrama).
 * getSubscription, upgradePlan, cancelSubscription. Los pagos se listan
 * por suscripción y cada cobro genera un Payment visible (regla 5).
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionApiEndpoint {
  private readonly http = inject(HttpClient);
  private readonly assembler = new AccountAssembler();
  private readonly base = `${environment.apiBaseUrl}${environment.myPlanEndpoint}`;

  getSubscription(accountId: number): Observable<Subscription | null> {
    return this.http
      .get<SubscriptionResource[] | SubscriptionResource>(
        `${this.base}?accountId=${accountId}`,
      )
      .pipe(
        map((response) => {
          const resource = Array.isArray(response) ? response[0] : response;
          return resource ? this.assembler.toSubscription(resource) : null;
        }),
      );
  }

  /** FREEMIUM inicial del registro (AccountCreatedEvent del backend). */
  createFreemium(accountId: number): Observable<Subscription> {
    const now = new Date().toISOString();
    return this.http
      .post<SubscriptionResource>(this.base, {
        accountId,
        plan: PlanType.FREEMIUM,
        status: 'ACTIVE',
        maxProfiles: 1,
        maxCaregiversPerProfile: 2,
        startedAt: now,
        endsAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .pipe(map((resource) => this.assembler.toSubscription(resource)));
  }

  upgradePlan(subscriptionId: number, plan: PlanType): Observable<Subscription> {
    return this.http
      .post<SubscriptionResource>(`${this.base}/${subscriptionId}/upgrade`, { plan })
      .pipe(map((resource) => this.assembler.toSubscription(resource)));
  }

  cancelSubscription(subscriptionId: number): Observable<Subscription> {
    return this.http
      .post<SubscriptionResource>(`${this.base}/${subscriptionId}/cancel`, {})
      .pipe(map((resource) => this.assembler.toSubscription(resource)));
  }

  listPayments(subscriptionId: number): Observable<Payment[]> {
    return this.http
      .get<PaymentResource[]>(
        `${environment.apiBaseUrl}${environment.paymentsEndpoint}?subscriptionId=${subscriptionId}`,
      )
      .pipe(map((resources) => resources.map((resource) => this.assembler.toPayment(resource))));
  }
}
