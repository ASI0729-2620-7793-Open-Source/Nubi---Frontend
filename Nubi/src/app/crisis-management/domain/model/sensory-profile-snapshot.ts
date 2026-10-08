import { SensoryTrigger } from './sos-session.enums';

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

const RANK: Readonly<Record<SensitivityLevel, number>> = {
  [SensitivityLevel.LOW]: 0,
  [SensitivityLevel.MEDIUM]: 1,
  [SensitivityLevel.HIGH]: 2,
};

/** Orden de desempate cuando dos sentidos tienen la misma sensibilidad. */
const SENSES = [SensoryTrigger.AUDITORY, SensoryTrigger.VISUAL, SensoryTrigger.TACTILE] as const;

/**
 * Value Object. Copia de solo lectura del perfil sensorial que este contexto obtiene
 * desde Perfil y Personalización a través de ProfileContextFacade.
 */
export class SensoryProfileSnapshot {
  constructor(
    public readonly profileId: number,
    public readonly auditorySensitivity: SensitivityLevel,
    public readonly visualSensitivity: SensitivityLevel,
    public readonly tactileSensitivity: SensitivityLevel,
  ) {}

  /** Sentido con la sensibilidad más alta; NONE si el perfil no registra ninguna. */
  highestSensitivity(): SensoryTrigger {
    let highest = SensoryTrigger.NONE;
    let highestRank = 0;
    for (const sense of SENSES) {
      const rank = RANK[this.levelOf(sense)];
      if (rank > highestRank) {
        highest = sense;
        highestRank = rank;
      }
    }
    return highest;
  }

  /** Sentidos con sensibilidad alta, para avisar al cuidador qué cuidar durante la guía. */
  highSensitivities(): SensoryTrigger[] {
    return SENSES.filter((sense) => this.levelOf(sense) === SensitivityLevel.HIGH);
  }

  /** Sin sensibilidades registradas se usa la guía genérica y se sugiere completar el perfil. */
  hasSensitivities(): boolean {
    return this.highestSensitivity() !== SensoryTrigger.NONE;
  }

  private levelOf(sense: (typeof SENSES)[number]): SensitivityLevel {
    switch (sense) {
      case SensoryTrigger.AUDITORY:
        return this.auditorySensitivity;
      case SensoryTrigger.VISUAL:
        return this.visualSensitivity;
      case SensoryTrigger.TACTILE:
        return this.tactileSensitivity;
    }
  }
}
