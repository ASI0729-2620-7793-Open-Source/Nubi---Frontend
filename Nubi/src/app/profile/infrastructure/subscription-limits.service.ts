import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccountStore } from '../../account/application/account.store';

/**
 * Límites del plan para el Bounded Context Perfil (RF-09, RF-10).
 * Consume la Subscription real cuando está cargada; si no, usa el mock
 * temporal. No duplica el dominio Subscription (es de la otra rama).
 */
export interface SubscriptionLimits {
  maxProfiles: number;
  maxCaregiversPerProfile: number;
  allowsAnotherProfile(currentProfiles: number): Observable<boolean>;
  allowsAnotherCaregiver(currentCaregivers: number): Observable<boolean>;
}

class MockSubscriptionLimits {
  maxProfiles = 3;
  maxCaregiversPerProfile = 4;

  allowsAnotherProfile(currentProfiles: number): boolean {
    return currentProfiles < this.maxProfiles;
  }

  allowsAnotherCaregiver(currentCaregivers: number): boolean {
    return currentCaregivers < this.maxCaregiversPerProfile;
  }
}

/** Servicio de límites: prefiere la suscripción real, si no el mock. */
@Injectable({ providedIn: 'root' })
export class SubscriptionLimitsService {
  private readonly accounts = inject(AccountStore, { optional: true });
  private readonly delegate = new MockSubscriptionLimits();

  get maxProfiles(): number {
    return this.accounts?.subscription()?.maxProfiles ?? this.delegate.maxProfiles;
  }

  get maxCaregiversPerProfile(): number {
    return (
      this.accounts?.subscription()?.maxCaregiversPerProfile ??
      this.delegate.maxCaregiversPerProfile
    );
  }

  allowsAnotherProfile(currentProfiles: number): Observable<boolean> {
    const subscription = this.accounts?.subscription();
    return of(
      subscription
        ? subscription.allowsAnotherProfile(currentProfiles)
        : this.delegate.allowsAnotherProfile(currentProfiles),
    );
  }

  allowsAnotherCaregiver(currentCaregivers: number): Observable<boolean> {
    const subscription = this.accounts?.subscription();
    return of(
      subscription
        ? subscription.allowsAnotherCaregiver(currentCaregivers)
        : this.delegate.allowsAnotherCaregiver(currentCaregivers),
    );
  }
}
