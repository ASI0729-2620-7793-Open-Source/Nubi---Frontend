/**
 * Entidad base auditable compartida por los Bounded Contexts,
 * como el base-entity del proyecto de referencia (shared/domain).
 * Todos los agregados guardan cuándo se crearon y modificaron.
 */
export abstract class AuditableEntity {
  constructor(
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /** Copia las marcas de auditoría al crear una versión nueva del agregado. */
  protected touch(updatedAt: Date = new Date()): { createdAt: Date; updatedAt: Date } {
    return { createdAt: this.createdAt, updatedAt };
  }
}
