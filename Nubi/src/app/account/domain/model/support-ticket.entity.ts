import { TicketStatus } from './account.enums';

/** Entidad. Ticket de soporte de una cuenta. */
export class SupportTicket {
  constructor(
    public readonly id: number,
    public readonly accountId: number,
    public readonly subject: string,
    public readonly description: string,
    public readonly status: TicketStatus,
    public readonly createdAt: Date,
    public readonly resolvedAt: Date | null,
  ) {}

  close(): SupportTicket {
    return new SupportTicket(
      this.id,
      this.accountId,
      this.subject,
      this.description,
      TicketStatus.CLOSED,
      this.createdAt,
      new Date(),
    );
  }
}
