import { AuditableEntity } from '../../../shared/domain/model/auditable.entity';
import { AccountRole, AuthProvider } from './account.enums';

/**
 * Aggregate Root. Cuenta de acceso de cuidador, docente o administrador.
 * Con Google, passwordHash queda vacío y se usa googleSubject.
 */
export class Account extends AuditableEntity {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly fullName: string,
    public readonly authProvider: AuthProvider,
    public readonly googleSubject: string | null,
    public readonly role: AccountRole,
    public readonly active: boolean,
    public readonly institutionId: number | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(createdAt, updatedAt);
  }

  /** Vincula la cuenta de Google (dejando passwordHash vacío en backend). */
  linkGoogleAccount(googleSubject: string): Account {
    return new Account(
      this.id,
      this.email,
      this.fullName,
      AuthProvider.GOOGLE,
      googleSubject,
      this.role,
      this.active,
      this.institutionId,
      this.createdAt,
      new Date(),
    );
  }

  /** El frontend solo pide el cambio; el hash lo genera el backend. */
  changePassword(): Account {
    return new Account(
      this.id,
      this.email,
      this.fullName,
      this.authProvider,
      this.googleSubject,
      this.role,
      this.active,
      this.institutionId,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): Account {
    return new Account(
      this.id,
      this.email,
      this.fullName,
      this.authProvider,
      this.googleSubject,
      this.role,
      false,
      this.institutionId,
      this.createdAt,
      new Date(),
    );
  }

  /** Decide si se muestran planes y vista institucional. */
  isInstitutional(): boolean {
    return this.role === AccountRole.INSTITUTION_ADMIN || this.role === AccountRole.TEACHER;
  }
}
