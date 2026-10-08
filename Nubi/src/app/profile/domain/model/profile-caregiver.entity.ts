import { CaregiverRole, InvitationStatus } from './profile.enums';

/**
 * Entidad. Cuidador asociado a un perfil (US-06).
 * Nace PENDING con solo el correo y pasa a ACTIVE al aceptar.
 */
export class ProfileCaregiver {
  constructor(
    public readonly id: number,
    public readonly accountId: number | null,
    public readonly invitedEmail: string,
    public readonly role: CaregiverRole,
    public readonly status: InvitationStatus,
    public readonly invitedAt: Date,
    public readonly acceptedAt: Date | null,
  ) {}

  /** El principal creó el perfil y no se puede revocar (regla 1). */
  isPrincipal(): boolean {
    return this.role === CaregiverRole.PRIMARY;
  }

  /** Comando "Aceptar invitación": asocia la cuenta y activa el acceso. */
  accept(accountId: number): ProfileCaregiver {
    if (this.status !== InvitationStatus.PENDING) return this;
    return new ProfileCaregiver(
      this.id,
      accountId,
      this.invitedEmail,
      this.role,
      InvitationStatus.ACTIVE,
      this.invitedAt,
      new Date(),
    );
  }

  /** Comando "Revocar acceso": el principal nunca se revoca. */
  revoke(): ProfileCaregiver {
    if (this.isPrincipal()) return this;
    return new ProfileCaregiver(
      this.id,
      this.accountId,
      this.invitedEmail,
      this.role,
      InvitationStatus.REVOKED,
      this.invitedAt,
      this.acceptedAt,
    );
  }
}
