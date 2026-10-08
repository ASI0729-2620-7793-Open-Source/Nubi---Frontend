/**
 * Entidad. Contacto de confianza con orden de prioridad para el reenvío
 * de alertas (baja prioridad, sin user story: OrderList o subir/bajar).
 */
export class TrustedContact {
  constructor(
    public readonly id: number,
    public readonly fullName: string,
    public readonly phone: string,
    public readonly email: string | null,
    public readonly relationship: string,
    public readonly priorityOrder: number,
  ) {}

  /** Este contacto avisa antes que el otro (menor número = mayor prioridad). */
  hasHigherPriorityThan(other: TrustedContact): boolean {
    return this.priorityOrder < other.priorityOrder;
  }
}
