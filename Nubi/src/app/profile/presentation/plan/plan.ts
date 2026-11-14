import { Component, OnInit, inject, signal } from '@angular/core';
import { ToastStore } from '../../../shared/application/toast.store';
import { formatDate } from '../../../shared/domain/dates';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { ChildStore } from '../../application/child.store';
import { PLAN_CATALOG, Subscription } from '../../domain/model/child-profile';
import { ProfileApi } from '../../infrastructure/profile-api';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';

/** Suscripción de la cuenta (US-46 a US-48). Todos los planes acompañan a un solo niño. */
@Component({
  selector: 'app-plan',
  imports: [TranslatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">{{ 'common.miPlan' | translate }}</p>
          <h1>{{ 'plan.unNinoTodaSu' | translate }}</h1>
          <p class="lead">
            {{ 'plan.cadaCuentaAcompanaA' | translate }}
          </p>
        </div>
      </header>

      @if (subscription(); as current) {
        <div class="alert ok">
          <span class="icon">verified</span>
          {{ 'plan.tienesElPlan' | translate }} <strong>&nbsp;{{ currentName(current.plan) | translate }}&nbsp;</strong> {{ 'plan.desdeElDeCuidadores' | translate: { p0: (formatDate(current.startedAt)), p1: (childStore.child()?.caregivers?.length ?? 0), p2: (current.maxCaregiversPerProfile) } }}
        </div>
      }

      <div class="grid grid-3">
        @for (item of catalog; track item.plan) {
          <article class="card plan" [class.current]="subscription()?.plan === item.plan">
            @if (item.featured) {
              <span class="chip sun">{{ 'plans.featured' | translate }}</span>
            }
            <h2>{{ 'plans.' + item.key + '.name' | translate }}</h2>
            <p class="price">{{ 'plans.' + item.key + '.price' | translate }}</p>
            <p class="muted">{{ 'plans.' + item.key + '.description' | translate }}</p>
            <ul>
              @for (n of perkNumbers; track n) {
                <li><span class="icon">check_circle</span> {{ 'plans.' + item.key + '.perk' + n | translate }}</li>
              }
            </ul>
            @if (subscription()?.plan === item.plan) {
              <span class="chip mint">{{ 'plan.tuPlanActual' | translate }}</span>
            } @else {
              <button class="btn btn-primary" type="button" [disabled]="busy()" (click)="change(item.plan)">{{ 'plan.cambiarA' | translate: { p0: ('plans.' + item.key + '.name' | translate) } }}</button>
            }
          </article>
        }
      </div>
      <p class="muted small">{{ 'plan.esUnaDemostracionEl' | translate }}</p>
    </div>
  `,
  styles: `
    .plan {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    .plan.current {
      border: 2px solid var(--mint-400);
      background: var(--mint-50);
    }
    .price {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--teal-700);
    }
    ul {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
      flex: 1;
    }
    li {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    li .icon {
      color: var(--mint-400);
      font-size: 20px;
    }
  `,
})
export class Plan implements OnInit {
  private readonly api = inject(ProfileApi);
  private readonly toast = inject(ToastStore);
  protected readonly childStore = inject(ChildStore);
  protected readonly catalog = PLAN_CATALOG;
  protected readonly perkNumbers = [1, 2, 3, 4];
  protected readonly subscription = signal<Subscription | null>(null);
  protected readonly busy = signal(false);
  protected readonly formatDate = formatDate;

  ngOnInit(): void {
    this.api.currentSubscription().subscribe({
      next: (subscription) => this.subscription.set(subscription),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  /** Clave del nombre traducido del plan según su código del backend. */
  protected currentName(plan: Subscription['plan']): string {
    return `plans.${PLAN_CATALOG.find((item) => item.plan === plan)?.key ?? 'standard'}.name`;
  }

  change(plan: Subscription['plan']): void {
    this.busy.set(true);
    this.api.changePlan(plan).subscribe({
      next: (subscription) => {
        this.subscription.set(subscription);
        this.busy.set(false);
        this.toast.ok(t('plan.ahoraTienesElPlan', { p0: t(this.currentName(plan)) }));
      },
      error: (error) => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }
}
