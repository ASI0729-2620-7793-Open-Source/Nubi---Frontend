import { AuditableEntity } from '../../../shared/domain/model/auditable.entity';
import { DeclaredDiagnosis } from './declared-diagnosis.vo';
import { CaregiverRole, CommunicativeNeed, Gender, InvitationStatus } from './profile.enums';
import { ProfileCaregiver } from './profile-caregiver.entity';
import { SensoryProfile } from './sensory-profile.vo';
import { TrustedContact } from './trusted-contact.entity';

/**
 * Aggregate Root. Perfil de niño/adolescente neurodivergente (US-01 a US-06).
 * Cada comando devuelve un perfil nuevo, así los stores trabajan inmutables.
 */
export class NeurodivergentProfile extends AuditableEntity {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly nickname: string | null,
    public readonly age: number,
    public readonly gender: Gender,
    public readonly photoUrl: string | null,
    public readonly communicativeNeed: CommunicativeNeed,
    public readonly active: boolean,
    public readonly sensoryProfile: SensoryProfile,
    public readonly diagnosis: DeclaredDiagnosis | null,
    public readonly caregivers: ProfileCaregiver[],
    public readonly trustedContacts: TrustedContact[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(createdAt, updatedAt);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.nickname?.trim() ? this.nickname : this.firstName;
  }

  /** Comando "Editar datos generales" (US-02). */
  updateBasicInfo(firstName: string, lastName: string, age: number): NeurodivergentProfile {
    return this.copy({ firstName, lastName, age });
  }

  /** Comando "Editar ficha general": nombre, apodo, edad, género y necesidad. */
  updateGeneral(
    changes: Pick<
      NeurodivergentProfile,
      'firstName' | 'lastName' | 'nickname' | 'age' | 'gender' | 'communicativeNeed'
    >,
  ): NeurodivergentProfile {
    return this.copy({ ...changes });
  }

  /** Comando "Subir foto" (US-05): solo URL válida ya verificada por el servicio. */
  changePhoto(photoUrl: string): NeurodivergentProfile {
    return this.copy({ photoUrl });
  }

  /** Comando "Declarar diagnóstico" (US-04): reemplaza el Value Object completo. */
  declareDiagnosis(diagnosis: DeclaredDiagnosis): NeurodivergentProfile {
    return this.copy({ diagnosis });
  }

  /** Comando "Registrar sensibilidades" (US-03): reemplaza el Value Object completo. */
  registerSensitivities(sensoryProfile: SensoryProfile): NeurodivergentProfile {
    return this.copy({ sensoryProfile });
  }

  /** Comando "Invitar cuidador" (US-06): nace PENDING con solo el correo. */
  inviteCaregiver(email: string, role: CaregiverRole): NeurodivergentProfile {
    const nextId = Math.max(0, ...this.caregivers.map((item) => item.id)) + 1;
    const invited = new ProfileCaregiver(
      nextId,
      null,
      email,
      role,
      InvitationStatus.PENDING,
      new Date(),
      null,
    );
    return this.copy({ caregivers: [...this.caregivers, invited] });
  }

  /** Comando "Vincular contacto de confianza" (opcional, sin user story). */
  linkTrustedContact(contact: TrustedContact): NeurodivergentProfile {
    return this.copy({ trustedContacts: [...this.trustedContacts, contact] });
  }

  /** Esta cuenta ya es cuidadora del perfil. */
  isCaregiver(accountId: number): boolean {
    return this.caregivers.some(
      (item) => item.accountId === accountId && item.status === InvitationStatus.ACTIVE,
    );
  }

  private copy(changes: Partial<NeurodivergentProfile>): NeurodivergentProfile {
    const audit = this.touch();
    return new NeurodivergentProfile(
      changes.id ?? this.id,
      changes.firstName ?? this.firstName,
      changes.lastName ?? this.lastName,
      changes.nickname === undefined ? this.nickname : changes.nickname,
      changes.age ?? this.age,
      changes.gender ?? this.gender,
      changes.photoUrl === undefined ? this.photoUrl : changes.photoUrl,
      changes.communicativeNeed ?? this.communicativeNeed,
      changes.active ?? this.active,
      changes.sensoryProfile ?? this.sensoryProfile,
      changes.diagnosis === undefined ? this.diagnosis : changes.diagnosis,
      changes.caregivers ?? this.caregivers,
      changes.trustedContacts ?? this.trustedContacts,
      this.createdAt,
      audit.updatedAt,
    );
  }
}
