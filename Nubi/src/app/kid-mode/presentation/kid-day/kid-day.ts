import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { speak } from '../../../communication/domain/model/board';
import { ChildStore } from '../../../profile/application/child.store';
import { RoutineStep, nextStep, shortTime } from '../../../routine/domain/model/routine-step';
import { RoutineApi } from '../../../routine/infrastructure/routine-api';
import { TranslatePipe } from '@ngx-translate/core';
import { st, t } from '../../../shared/infrastructure/i18n-bridge';
import { ServerTextPipe } from '../../../shared/presentation/server-text.pipe';

/**
 * "Mi día": la rutina en tarjetas grandes. El paso actual se destaca; al tocarlo se marca como
 * hecho y se celebra con una estrella. Así el niño sabe qué viene después.
 */
@Component({
  selector: 'app-kid-day',
  imports: [TranslatePipe, ServerTextPipe],
  template: `
    <h1>{{ allDone() ? ('kidDay.terminasteTuDia' | translate) : ('common.miDia' | translate) }}</h1>
    <div class="stars" [attr.aria-label]="'kidDay.pasosHechos' | translate">
      @for (step of steps(); track step.id) {
        <span [class.on]="step.completedToday">⭐</span>
      }
    </div>

    @if (current(); as step) {
      <button type="button" class="now" (click)="toggle(step)">
        <span class="label">{{ 'kidDay.ahora' | translate }}</span>
        <span class="emoji">{{ step.icon }}</span>
        <strong>{{ step.title | serverText }}</strong>
        <span class="hint">{{ 'kidDay.tocaCuandoTermines' | translate }}</span>
      </button>
    }

    <ol class="strip">
      @for (step of steps(); track step.id) {
        <li>
          <button type="button" class="card-step" [class.done]="step.completedToday" [class.current]="current()?.id === step.id" (click)="toggle(step)">
            <span class="emoji">{{ step.icon }}</span>
            <span class="title">{{ step.title | serverText }}</span>
            <span class="time">{{ shortTime(step.scheduledTime) }}</span>
            @if (step.completedToday) {
              <span class="check">✔️</span>
            }
          </button>
        </li>
      }
    </ol>

    @if (celebrate()) {
      <div class="celebrate" aria-live="polite">🌟</div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      position: relative;
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      text-align: center;
    }
    h1 {
      text-align: center;
      font-size: clamp(1.8rem, 4.5vw, 2.6rem);
      font-weight: 800;
    }
    .stars {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
      font-size: 1.6rem;
    }
    .stars span {
      filter: grayscale(1);
      opacity: 0.3;
      transition: all 0.4s;
    }
    .stars span.on {
      filter: none;
      opacity: 1;
    }
    .now {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 0 auto;
      width: min(480px, 100%);
      padding: 30px;
      border: 4px solid var(--mint-400);
      border-radius: var(--radius-xl);
      background: #fff;
      box-shadow: var(--shadow-l);
      cursor: pointer;
    }
    .now .label {
      padding: 4px 14px;
      border-radius: 999px;
      background: var(--mint-100);
      color: var(--teal-700);
      font-weight: 800;
    }
    .now .emoji {
      font-size: clamp(5rem, 14vw, 7rem);
      line-height: 1.1;
    }
    .now strong {
      font-size: clamp(1.6rem, 4vw, 2.2rem);
    }
    .hint {
      color: var(--ink-3);
      font-weight: 700;
    }
    /* Todos los pasos a la vista, en filas centradas (sin desplazamiento lateral) */
    .strip {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .card-step {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: clamp(130px, 17vw, 160px);
      min-height: 150px;
      padding: 18px 10px;
      border: 3px solid transparent;
      border-radius: var(--radius-l);
      background: #fff;
      box-shadow: var(--shadow-s);
      cursor: pointer;
      scroll-snap-align: start;
    }
    .card-step.current {
      border-color: var(--mint-400);
    }
    .card-step.done {
      opacity: 0.55;
      background: var(--mint-50);
    }
    .card-step .emoji {
      font-size: 3rem;
      line-height: 1.1;
    }
    .card-step .title {
      font-size: 1.05rem;
    }
    @media (max-width: 520px) {
      .strip > li {
        width: calc(50% - 7px);
      }
      .card-step {
        width: 100%;
      }
    }
    .title {
      font-weight: 800;
      text-align: center;
      line-height: 1.2;
    }
    .time {
      font-size: 0.8rem;
      color: var(--ink-3);
      font-weight: 700;
    }
    .check {
      position: absolute;
      top: 6px;
      right: 8px;
    }
    .celebrate {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 10rem;
      pointer-events: none;
      animation: celebrate 1.2s var(--ease) forwards;
    }
    @keyframes celebrate {
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      40% {
        transform: scale(1.1);
        opacity: 1;
      }
      100% {
        transform: scale(1.4) translateY(-60px);
        opacity: 0;
      }
    }
  `,
})
export class KidDay implements OnInit {
  private readonly api = inject(RoutineApi);
  private readonly childStore = inject(ChildStore);
  protected readonly shortTime = shortTime;
  protected readonly steps = signal<RoutineStep[]>([]);
  protected readonly celebrate = signal(false);
  protected readonly current = computed(() => nextStep(this.steps()));
  protected readonly allDone = computed(() => this.steps().length > 0 && !this.current());

  ngOnInit(): void {
    this.api.steps(this.childStore.childId()!).subscribe({ next: (steps) => this.steps.set(steps), error: () => {} });
  }

  toggle(step: RoutineStep): void {
    this.api.complete(this.childStore.childId()!, step.id, !step.completedToday).subscribe({
      next: (updated) => {
        this.steps.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
        if (updated.completedToday) {
          this.celebrate.set(true);
          setTimeout(() => this.celebrate.set(false), 1200);
          const next = this.current();
          speak(next ? t('kidDay.wellDoneNext', { p0: st(next.title) }) : t('kidDay.allDoneSpeech'));
        }
      },
      error: () => {},
    });
  }
}
