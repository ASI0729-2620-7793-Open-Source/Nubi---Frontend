import { Component, input, output } from '@angular/core';
import { MOODS, MoodLevel } from '../../domain/mood';

/** Cuatro caras grandes para decir cómo se siente. Sirve para el cuidador y para el niño. */
@Component({
  selector: 'app-mood-picker',
  template: `
    <div class="moods" [class.kid]="kid()">
      @for (mood of moods; track mood.level) {
        <button
          type="button"
          class="mood"
          [class.selected]="selected() === mood.level"
          [style.--mood]="mood.color"
          [style.--soft]="mood.soft"
          [disabled]="disabled()"
          (click)="picked.emit(mood.level)"
        >
          <span class="face">{{ mood.emoji }}</span>
          <span class="label">{{ kid() ? mood.kidLabel : mood.label }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    .moods {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .mood {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 14px 6px;
      border: 2px solid transparent;
      border-radius: var(--radius-m);
      background: var(--soft);
      cursor: pointer;
      transition:
        transform 0.2s var(--ease),
        border-color 0.2s;
    }
    .mood:hover:not(:disabled) {
      transform: translateY(-3px);
    }
    .mood.selected {
      border-color: var(--mood);
      box-shadow: 0 6px 18px color-mix(in srgb, var(--mood) 30%, transparent);
    }
    .face {
      font-size: 2rem;
      line-height: 1;
    }
    .label {
      font-size: 0.82rem;
      font-weight: 800;
      color: var(--ink-2);
    }
    .kid .mood {
      padding: clamp(18px, 4vw, 34px) 8px;
      border-radius: var(--radius-xl);
    }
    .kid .face {
      font-size: clamp(3rem, 9vw, 5rem);
    }
    .kid .label {
      font-size: clamp(1rem, 2.4vw, 1.4rem);
    }
    @media (max-width: 520px) {
      .moods.kid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export class MoodPicker {
  readonly selected = input<MoodLevel | null>(null);
  readonly kid = input(false);
  readonly disabled = input(false);
  readonly picked = output<MoodLevel>();
  protected readonly moods = MOODS;
}
