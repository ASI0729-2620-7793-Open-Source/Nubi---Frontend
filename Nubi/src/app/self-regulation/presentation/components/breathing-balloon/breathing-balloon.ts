import { Component, OnDestroy, OnInit, computed, input, signal, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { t, withTexts } from '../../../../shared/infrastructure/i18n-bridge';
import { I18nStore } from '../../../../shared/application/i18n.store';

type Phase = 'inhale' | 'hold' | 'exhale';

interface Pattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
}

/**
 * Respiración guiada "del globo": el globo se infla al tomar aire y se desinfla al soltarlo.
 * Ritmo lento y predecible; el número de respiraciones se cuenta para el cuidador.
 */
@Component({
  selector: 'app-breathing-balloon',
  imports: [TranslatePipe],
  template: `
    <div class="stage keep-motion" [style.--scale]="scale()" [style.--secs]="phaseSeconds() + 's'">
      <div class="balloon-wrap">
        <div class="balloon" [class]="'balloon ' + color()"></div>
        <div class="string"></div>
      </div>
      <p class="phase">{{ phaseText() }}</p>
      <p class="count">{{ remaining() }}</p>
    </div>

    @if (!kid()) {
      <div class="patterns segmented">
        @for (option of patterns; track option.id) {
          <button type="button" [class.active]="pattern().id === option.id" (click)="choose(option)">{{ option.name }}</button>
        }
      </div>
    }
    <p class="breaths">🎈 {{ breaths() }} {{ (breaths() === 1 ? 'breathingBalloon.respiracion' : 'breathingBalloon.respiraciones') | translate }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    .balloon-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: clamp(290px, 52vh, 460px);
      justify-content: flex-end;
    }
    .balloon {
      width: min(220px, 60vw);
      height: min(264px, 72vw);
      border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
      background: radial-gradient(circle at 32% 28%, #ffffff 0 8%, transparent 9%),
        radial-gradient(circle at 40% 35%, var(--b1), var(--b2));
      box-shadow: inset -14px -18px 30px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0, 0, 0, 0.08);
      transform: scale(var(--scale));
      transform-origin: 50% 100%;
      transition: transform var(--secs) ease-in-out;
    }
    .balloon.lavender {
      --b1: #bdb8dc;
      --b2: #928bb8;
    }
    .balloon.mint {
      --b1: #a9d4cd;
      --b2: #5b9490;
    }
    .balloon.sun {
      --b1: #ecd6a8;
      --b2: #cfae72;
    }
    .string {
      width: 2px;
      height: 60px;
      background: linear-gradient(var(--ink-3), transparent);
    }
    .phase {
      font-size: clamp(1.4rem, 3.5vw, 2.2rem);
      font-weight: 800;
      color: var(--teal-700);
    }
    .count {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--ink-3);
      min-height: 1.5em;
    }
    .breaths {
      font-weight: 800;
      color: var(--ink-2);
    }
  `,
})
export class BreathingBalloon implements OnInit, OnDestroy {
  private readonly i18n = inject(I18nStore);
  readonly kid = input(false);
  readonly paused = input(false);

  protected readonly patterns: Pattern[] = [
    withTexts({ id: 'balloon', inhale: 4, hold: 2, exhale: 6 }, { name: 'breathing.balloon' }),
    withTexts({ id: 'square', inhale: 4, hold: 4, exhale: 4 }, { name: 'breathing.square' }),
    withTexts({ id: 'gentle', inhale: 3, hold: 1, exhale: 4 }, { name: 'breathing.gentle' }),
  ];
  protected readonly pattern = signal<Pattern>(this.patterns[0]);
  protected readonly phase = signal<Phase>('inhale');
  protected readonly remaining = signal(4);
  protected readonly breaths = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly scale = computed(() => (this.phase() === 'exhale' ? 0.45 : 1));
  protected readonly phaseSeconds = computed(() => this.pattern()[this.phase()]);
  protected readonly color = computed(() => ['lavender', 'mint', 'sun'][this.breaths() % 3]);
  protected readonly phaseText = computed(() =>
    {
      this.i18n.lang();
      return { inhale: t('breathing.inhale'), hold: t('breathing.hold'), exhale: t('breathing.exhale') }[this.phase()];
    },
  );

  ngOnInit(): void {
    this.restart();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  choose(pattern: Pattern): void {
    this.pattern.set(pattern);
    this.restart();
  }

  private restart(): void {
    if (this.timer) clearInterval(this.timer);
    this.phase.set('inhale');
    this.remaining.set(this.pattern().inhale);
    this.timer = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (this.paused()) return;
    const left = this.remaining() - 1;
    if (left > 0) {
      this.remaining.set(left);
      return;
    }
    const order: Phase[] = ['inhale', 'hold', 'exhale'];
    let next = order[(order.indexOf(this.phase()) + 1) % 3];
    if (next === 'hold' && this.pattern().hold === 0) next = 'exhale';
    if (next === 'inhale') this.breaths.update((count) => count + 1);
    this.phase.set(next);
    this.remaining.set(this.pattern()[next]);
  }
}
