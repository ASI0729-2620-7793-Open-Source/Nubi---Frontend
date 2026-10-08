import { AlternativeTechnique } from './alternative-technique.entity';
import { SensoryTrigger } from './sos-session.enums';

/**
 * Paso de una guía de actuación. Se muestra de uno en uno y en orden; si es obligatorio,
 * omitirlo exige confirmación explícita del cuidador.
 */
export class ContainmentStep {
  constructor(
    public readonly id: number,
    public readonly guideId: number,
    public readonly stepOrder: number,
    /** Identifica el texto del paso en public/i18n (crisisSteps.<CODE>). */
    public readonly code: string,
    public readonly mandatory: boolean,
    /** Sensibilidad con la que se relaciona; permite priorizar el paso en la personalización. */
    public readonly relatedTrigger: SensoryTrigger,
    public readonly alternativeTechniques: AlternativeTechnique[],
  ) {}
}
