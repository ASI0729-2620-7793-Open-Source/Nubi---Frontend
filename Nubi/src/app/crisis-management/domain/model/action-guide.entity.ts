import { ContainmentStep } from './containment-step.entity';
import { SensoryProfileSnapshot } from './sensory-profile-snapshot';
import { SensoryTrigger } from './sos-session.enums';

/**
 * Guía de actuación vigente. Es un dato maestro compartido: las sesiones SOS la leen,
 * nunca la modifican.
 */
export class ActionGuide {
  constructor(
    public readonly id: number,
    public readonly version: number,
    public readonly active: boolean,
    public readonly steps: ContainmentStep[],
  ) {}

  /**
   * Pasos en el orden en que se mostrarán: primero los relacionados con la sensibilidad
   * más alta del usuario y después el resto, respetando `stepOrder` dentro de cada grupo.
   * Sin sensibilidades registradas devuelve la guía genérica.
   */
  orderedStepsFor(profile: SensoryProfileSnapshot): ContainmentStep[] {
    const sorted = [...this.steps].sort((a, b) => a.stepOrder - b.stepOrder);
    const priority = profile.highestSensitivity();
    if (priority === SensoryTrigger.NONE) return sorted;

    return [
      ...sorted.filter((step) => step.relatedTrigger === priority),
      ...sorted.filter((step) => step.relatedTrigger !== priority),
    ];
  }
}
