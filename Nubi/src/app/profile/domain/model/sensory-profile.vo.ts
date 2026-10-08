import { SensitivityLevel } from './profile.enums';

/**
 * Value Object inmutable. Perfil sensorial completo de un perfil (US-03).
 * Se envía siempre el objeto completo, nunca parches parciales.
 */
export class SensoryProfile {
  constructor(
    public readonly auditory: SensitivityLevel,
    public readonly visual: SensitivityLevel,
    public readonly tactile: SensitivityLevel,
    public readonly lowStimulationEnabled: boolean,
    public readonly prioritizeVisuals: boolean,
    public readonly confirmAudio: boolean,
  ) {}

  /** Hay sensibilidad auditiva alta o muy alta: otros contextos filtran a visuales. */
  isAuditorySensitive(): boolean {
    return this.auditory === SensitivityLevel.HIGH || this.auditory === SensitivityLevel.VERY_HIGH;
  }

  /** Valores por defecto cuando el cuidador no registra ninguna (US-03). */
  static withDefaultValues(): SensoryProfile {
    return new SensoryProfile(
      SensitivityLevel.MEDIUM,
      SensitivityLevel.MEDIUM,
      SensitivityLevel.MEDIUM,
      false,
      false,
      false,
    );
  }

  /** Copia con cambios para trabajar con valores inmutables en los stores. */
  copy(changes: Partial<SensoryProfile>): SensoryProfile {
    return new SensoryProfile(
      changes.auditory ?? this.auditory,
      changes.visual ?? this.visual,
      changes.tactile ?? this.tactile,
      changes.lowStimulationEnabled ?? this.lowStimulationEnabled,
      changes.prioritizeVisuals ?? this.prioritizeVisuals,
      changes.confirmAudio ?? this.confirmAudio,
    );
  }
}
