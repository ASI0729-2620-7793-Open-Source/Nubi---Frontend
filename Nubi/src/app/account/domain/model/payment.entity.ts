import { PaymentStatus } from './account.enums';

/** Entidad. Pago de una suscripción (Subscription 1 — 0..* Payment). */
export class Payment {
  constructor(
    public readonly id: number,
    public readonly subscriptionId: number,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly gatewayReference: string | null,
    public readonly paidAt: Date | null,
  ) {}
}
