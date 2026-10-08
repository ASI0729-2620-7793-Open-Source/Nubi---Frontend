/** Avance de una sesión: un registro por cada paso completado u omitido. */
export class CompletedStep {
  constructor(
    public readonly stepId: number,
    public readonly skipped: boolean,
    public readonly completedAt: Date,
  ) {}
}
