import { Component, model } from '@angular/core';
import { SENSITIVITY_LEVELS, SensitivityLevel, SensoryProfile } from '../../../domain/model/child-profile';
import { TranslatePipe } from '@ngx-translate/core';
import { withTexts } from '../../../../shared/infrastructure/i18n-bridge';

/**
 * Editor del perfil sensorial: cuánto le molesta el ruido, la luz y el contacto. El backend
 * usa estos datos para ocultar los estímulos que podrían alterarlo y para ordenar la guía SOS.
 */
@Component({
  selector: 'app-sensory-editor',
  imports: [TranslatePipe],
  template: `
    <div class="senses">
      @for (sense of senses; track sense.key) {
        <div class="sense">
          <div class="sense-head">
            <span class="emoji">{{ sense.emoji }}</span>
            <span>
              <strong>{{ sense.label }}</strong>
              <span class="hint">{{ sense.hint }}</span>
            </span>
          </div>
          <div class="levels" role="radiogroup" [attr.aria-label]="sense.label">
            @for (level of levels; track level.value; let i = $index) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="value()[sense.key] === level.value"
                [class.active]="value()[sense.key] === level.value"
                [style.--level]="i"
                (click)="set(sense.key, level.value)"
              >
                {{ level.label }}
              </button>
            }
          </div>
        </div>
      }
    </div>

    <div class="toggles">
      <label class="switch">
        <span>
          <strong>{{ 'common.bajaEstimulacion' | translate }}</strong><br />
          <span class="hint">{{ 'sensoryEditor.coloresMasSuavesY' | translate }}</span>
        </span>
        <input type="checkbox" [checked]="value().lowStimulationEnabled" (change)="toggle('lowStimulationEnabled')" />
      </label>
      <label class="switch">
        <span>
          <strong>{{ 'sensoryEditor.priorizarLoVisual' | translate }}</strong><br />
          <span class="hint">{{ 'sensoryEditor.masImagenesYMenos' | translate }}</span>
        </span>
        <input type="checkbox" [checked]="value().prioritizeVisuals" (change)="toggle('prioritizeVisuals')" />
      </label>
      <label class="switch">
        <span>
          <strong>{{ 'sensoryEditor.confirmarAntesDeReproducir' | translate }}</strong><br />
          <span class="hint">{{ 'sensoryEditor.utilSiLosSonidos' | translate }}</span>
        </span>
        <input type="checkbox" [checked]="value().confirmAudio" (change)="toggle('confirmAudio')" />
      </label>
    </div>
  `,
  styles: `
    .senses {
      display: grid;
      gap: 14px;
    }
    .sense {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
      border-radius: var(--radius-m);
      background: var(--surface-2);
      border: 1px solid var(--line);
    }
    .sense-head {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sense-head > span:last-child {
      display: flex;
      flex-direction: column;
    }
    .emoji {
      font-size: 1.8rem;
    }
    .levels {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .levels button {
      min-height: 36px;
      padding: 0 12px;
      border: 1.5px solid var(--line);
      border-radius: 999px;
      background: var(--surface);
      font-weight: 800;
      color: var(--ink-2);
      cursor: pointer;
    }
    .levels button.active {
      border-color: transparent;
      color: #fff;
      background: color-mix(in srgb, var(--mint-400), var(--coral-600) calc(var(--level) * 33%));
    }
    .toggles {
      margin-top: 10px;
    }
    .toggles .switch {
      border-bottom: 1px solid var(--line);
    }
    .toggles .switch:last-child {
      border-bottom: 0;
    }
  `,
})
export class SensoryEditor {
  readonly value = model.required<SensoryProfile>();
  protected readonly levels = SENSITIVITY_LEVELS;
  protected readonly senses: { key: 'auditory' | 'visual' | 'tactile'; label: string; hint: string; emoji: string }[] = [
    withTexts({ key: 'auditory' as const, emoji: '👂' }, { label: 'senses.auditory.label', hint: 'senses.auditory.hint' }),
    withTexts({ key: 'visual' as const, emoji: '👀' }, { label: 'senses.visual.label', hint: 'senses.visual.hint' }),
    withTexts({ key: 'tactile' as const, emoji: '✋' }, { label: 'senses.tactile.label', hint: 'senses.tactile.hint' }),
  ];

  set(key: 'auditory' | 'visual' | 'tactile', level: SensitivityLevel): void {
    this.value.update((current) => ({ ...current, [key]: level }));
  }

  toggle(key: 'lowStimulationEnabled' | 'prioritizeVisuals' | 'confirmAudio'): void {
    this.value.update((current) => ({ ...current, [key]: !current[key] }));
  }
}
