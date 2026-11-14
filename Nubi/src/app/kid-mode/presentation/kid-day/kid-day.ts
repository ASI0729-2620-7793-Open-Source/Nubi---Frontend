import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { speak } from '../../../communication/domain/model/board';
import { ChildStore } from '../../../profile/application/child.store';
import { RoutineStep, nextStep, shortTime } from '../../../routine/domain/model/routine-step';
import { RoutineApi } from '../../../routine/infrastructure/routine-api';

/**
 * "Mi día": la rutina en tarjetas grandes. El paso actual se destaca; al tocarlo se marca como
 * hecho y se celebra con una estrella. Así el niño sabe qué viene después.
 */
@Component({
  selector: 'app-kid-day',
  template: `
    <h1>{{ allDone() ? '¡Terminaste tu día! 🌟' : 'Mi día' }}</h1>
    <div class="stars" aria-label="Pasos hechos">
      @for (step of steps(); track step.id) {
        <span [class.on]="step.completedToday">⭐</span>
      }
    </div>

    @if (current(); as step) {
      <button type="button" class="now" (click)="toggle(step)">
        <span class="label">Ahora</span>
        <span class="emoji">{{ step.icon }}</span>
        <strong>{{ step.title }}</strong>
        <span class="hint">Toca cuando termines ✔️</span>
      </button>
    }

    <ol class="strip">
      @for (step of steps(); track step.id) {
        <li>
          <button type="button" class="card-step" [class.done]="step.completedToday" [class.current]="current()?.id === step.id" (click)="toggle(step)">
            <span class="emoji">{{ step.icon }}</span>
            <span class="title">{{ step.title }}</span>
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
      gap: 20px;
      position: relative;
    }
    h1 {
      text-align: center;
      font-size: clamp(1.8rem, 4.5vw, 2.6rem);
      font-weight: 900;
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
      gap: 8px;
      margin: 0 auto;
      width: min(440px, 100%);
      padding: 26px;
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
      font-weight: 900;
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
    .strip {
      display: flex;
      gap: 12px;
      margin: 0;
      padding: 6px 4px 14px;
      overflow-x: auto;
      list-style: none;
      scroll-snap-type: x mandatory;
    }
    .card-step {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 130px;
      padding: 16px 8px;
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
      font-size: 2.6rem;
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
          speak(next ? `¡Muy bien! Ahora: ${next.title}` : '¡Terminaste tu día! ¡Muy bien!');
        }
      },
      error: () => {},
    });
  }
}
