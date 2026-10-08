import { ConditionType } from './profile.enums';

/**
 * Value Object inmutable. Diagnóstico declarado por el cuidador (US-04).
 * Se declara, no se valida: nunca se pide verificación ni documentos.
 */
export class DeclaredDiagnosis {
  constructor(
    public readonly condition: ConditionType,
    public readonly customDescription: string | null,
    public readonly diagnosedBy: string | null,
    public readonly diagnosisDate: string | null,
    public readonly professionalNotes: string | null,
  ) {}

  /** La condición es "Otra": customDescription es obligatoria (US-04). */
  isCustomCondition(): boolean {
    return this.condition === ConditionType.OTHER;
  }

  /**
   * Supuesto "TEA nivel 1" del wireframe: el modelo solo tiene ASD, así que el
   * nivel se guarda en professionalNotes (ej. "Nivel 1") y la etiqueta ASD se
   * traduce como "TEA" en public/i18n.
   */
  displayLabel(conditionLabels: Record<ConditionType, string>): string {
    return conditionLabels[this.condition];
  }
}
