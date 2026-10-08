import { ResourceType } from './calming-resource.enums';

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

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
    public readonly prioritizeVisuals: boolean,
  ) {}

  hasHighAuditorySensitivity(): boolean {
    return this.auditorySensitivity === SensitivityLevel.HIGH;
  }

  /** Tipo de estímulo que la galería muestra al abrirse; null muestra todos. */
  preferredResourceType(): ResourceType | null {
    return this.hasHighAuditorySensitivity() || this.prioritizeVisuals ? ResourceType.VISUAL : null;
  }
}
