import { Component, OnInit, inject, signal } from '@angular/core';
import { ToastStore } from '../../../shared/application/toast.store';
import { formatDate } from '../../../shared/domain/dates';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { ChildStore } from '../../application/child.store';
import { PLANS, Subscription } from '../../domain/model/child-profile';
import { ProfileApi } from '../../infrastructure/profile-api';

/** Suscripción de la cuenta (US-46 a US-48). Todos los planes acompañan a un solo niño. */
@Component({
  selector: 'app-plan',
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Mi plan</p>
          <h1>Un niño, toda su red</h1>
          <p class="lead">
            Cada cuenta acompaña a un único niño con autismo. Los planes cambian cuántas personas pueden cuidarlo
            contigo.
          </p>
        </div>
      </header>

      @if (subscription(); as current) {
        <div class="alert ok">
          <span class="icon">verified</span>
          Tienes el plan <strong>&nbsp;{{ plans[current.plan].name }}&nbsp;</strong> desde el {{ formatDate(current.startedAt) }}:
          {{ childStore.child()?.caregivers?.length ?? 0 }} de {{ current.maxCaregiversPerProfile }} cuidadores en uso.
        </div>
      }

      <div class="grid grid-3">
        @for (id of planIds; track id) {
          <article class="card plan" [class.current]="subscription()?.plan === id">
            <h2>{{ plans[id].name }}</h2>
            <p class="price">{{ plans[id].price }}</p>
            <ul>
              @for (perk of plans[id].perks; track perk) {
                <li><span class="icon">check_circle</span> {{ perk }}</li>
              }
            </ul>
            @if (subscription()?.plan === id) {
              <span class="chip mint">Tu plan actual</span>
            } @else {
              <button class="btn btn-primary" type="button" [disabled]="busy()" (click)="change(id)">Cambiar a {{ plans[id].name }}</button>
            }
          </article>
        }
      </div>
      <p class="muted small">Es una demostración: el cambio de plan no realiza cobros.</p>
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
      font-weight: 900;
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
  protected readonly plans = PLANS;
  protected readonly planIds = Object.keys(PLANS) as Subscription['plan'][];
  protected readonly subscription = signal<Subscription | null>(null);
  protected readonly busy = signal(false);
  protected readonly formatDate = formatDate;

  ngOnInit(): void {
    this.api.currentSubscription().subscribe({
      next: (subscription) => this.subscription.set(subscription),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  change(plan: Subscription['plan']): void {
    this.busy.set(true);
    this.api.changePlan(plan).subscribe({
      next: (subscription) => {
        this.subscription.set(subscription);
        this.busy.set(false);
        this.toast.ok(`Ahora tienes el plan ${PLANS[plan].name}.`);
      },
      error: (error) => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }
}
