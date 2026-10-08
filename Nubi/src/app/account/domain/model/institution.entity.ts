import { AuditableEntity } from '../../../shared/domain/model/auditable.entity';
import { AccountRole } from './account.enums';
import { Account } from './account.entity';

/**
 * Aggregate Root. Institución que emplea cuentas y gestiona perfiles.
 * Institution employs Account (0..*); Account pertenece a 0..1 institución.
 * Institution manages NeurodivergentProfile (0..*, solo referencia de id).
 */
export class Institution extends AuditableEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: string,
    public readonly contactEmail: string,
    public readonly memberIds: number[],
    public readonly profileIds: number[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(createdAt, updatedAt);
  }

  /** Agrega un miembro existente y activo (regla 4 se valida en el store). */
  addMember(account: Account): Institution {
    if (this.memberIds.includes(account.id)) return this;
    return new Institution(
      this.id,
      this.name,
      this.type,
      this.contactEmail,
      [...this.memberIds, account.id],
      this.profileIds,
      this.createdAt,
      new Date(),
    );
  }

  /** Asigna un perfil de estudiante (sigue visible para su familia, regla 3). */
  assignProfile(profileId: number): Institution {
    if (this.profileIds.includes(profileId)) return this;
    return new Institution(
      this.id,
      this.name,
      this.type,
      this.contactEmail,
      this.memberIds,
      [...this.profileIds, profileId],
      this.createdAt,
      new Date(),
    );
  }

  isTeacher(_role: AccountRole): boolean {
    return _role === AccountRole.TEACHER;
  }
}
