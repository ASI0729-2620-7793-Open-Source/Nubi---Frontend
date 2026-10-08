/** Técnica que se sugiere cuando un paso de contención no funciona. */
export class AlternativeTechnique {
  constructor(
    public readonly id: number,
    public readonly stepId: number,
    /** Identifica la técnica; la guía todavía no la muestra en pantalla. */
    public readonly code: string,
  ) {}
}
