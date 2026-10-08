import { DeclaredDiagnosis } from '../domain/model/declared-diagnosis.vo';
import { NeurodivergentProfile } from '../domain/model/neurodivergent-profile.entity';
import { ProfileCaregiver } from '../domain/model/profile-caregiver.entity';
import { SensoryProfile } from '../domain/model/sensory-profile.vo';
import { TrustedContact } from '../domain/model/trusted-contact.entity';
import {
  DeclaredDiagnosisResource,
  NeurodivergentProfileResource,
  ProfileCaregiverResource,
  SensoryProfileResource,
  TrustedContactResource,
} from './profile-resources';

/**
 * Assembler del Bounded Context Perfil y Personalización.
 * Convierte entre recursos REST y entidades del dominio, en ambas direcciones.
 */
export class ProfileAssembler {
  toEntityFromResource(resource: NeurodivergentProfileResource): NeurodivergentProfile {
    return new NeurodivergentProfile(
      resource.id,
      resource.firstName,
      resource.lastName,
      resource.nickname,
      resource.age,
      resource.gender,
      resource.photoUrl,
      resource.communicativeNeed,
      resource.active,
      this.toSensory(resource.sensoryProfile),
      resource.diagnosis ? this.toDiagnosis(resource.diagnosis) : null,
      resource.caregivers.map((item) => this.toCaregiver(item)),
      resource.trustedContacts.map((item) => this.toContact(item)),
      new Date(resource.createdAt),
      new Date(resource.updatedAt),
    );
  }

  toResourceFromEntity(entity: NeurodivergentProfile): NeurodivergentProfileResource {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      nickname: entity.nickname,
      age: entity.age,
      gender: entity.gender,
      photoUrl: entity.photoUrl,
      communicativeNeed: entity.communicativeNeed,
      active: entity.active,
      sensoryProfile: this.fromSensory(entity.sensoryProfile),
      diagnosis: entity.diagnosis ? this.fromDiagnosis(entity.diagnosis) : null,
      caregivers: entity.caregivers.map((item) => this.fromCaregiver(item)),
      trustedContacts: entity.trustedContacts.map((item) => this.fromContact(item)),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toEntitiesFromResponse(response: NeurodivergentProfileResource[]): NeurodivergentProfile[] {
    return response.map((resource) => this.toEntityFromResource(resource));
  }

  private toSensory(resource: SensoryProfileResource): SensoryProfile {
    return new SensoryProfile(
      resource.auditory,
      resource.visual,
      resource.tactile,
      resource.lowStimulationEnabled,
      resource.prioritizeVisuals,
      resource.confirmAudio,
    );
  }

  private fromSensory(entity: SensoryProfile): SensoryProfileResource {
    return {
      auditory: entity.auditory,
      visual: entity.visual,
      tactile: entity.tactile,
      lowStimulationEnabled: entity.lowStimulationEnabled,
      prioritizeVisuals: entity.prioritizeVisuals,
      confirmAudio: entity.confirmAudio,
    };
  }

  private toDiagnosis(resource: DeclaredDiagnosisResource): DeclaredDiagnosis {
    return new DeclaredDiagnosis(
      resource.condition,
      resource.customDescription,
      resource.diagnosedBy,
      resource.diagnosisDate,
      resource.professionalNotes,
    );
  }

  private fromDiagnosis(entity: DeclaredDiagnosis): DeclaredDiagnosisResource {
    return {
      condition: entity.condition,
      customDescription: entity.customDescription,
      diagnosedBy: entity.diagnosedBy,
      diagnosisDate: entity.diagnosisDate,
      professionalNotes: entity.professionalNotes,
    };
  }

  private toCaregiver(resource: ProfileCaregiverResource): ProfileCaregiver {
    return new ProfileCaregiver(
      resource.id,
      resource.accountId,
      resource.invitedEmail,
      resource.role,
      resource.status,
      new Date(resource.invitedAt),
      resource.acceptedAt ? new Date(resource.acceptedAt) : null,
    );
  }

  private fromCaregiver(entity: ProfileCaregiver): ProfileCaregiverResource {
    return {
      id: entity.id,
      accountId: entity.accountId,
      invitedEmail: entity.invitedEmail,
      role: entity.role,
      status: entity.status,
      invitedAt: entity.invitedAt.toISOString(),
      acceptedAt: entity.acceptedAt ? entity.acceptedAt.toISOString() : null,
    };
  }

  private toContact(resource: TrustedContactResource): TrustedContact {
    return new TrustedContact(
      resource.id,
      resource.fullName,
      resource.phone,
      resource.email,
      resource.relationship,
      resource.priorityOrder,
    );
  }

  private fromContact(entity: TrustedContact): TrustedContactResource {
    return {
      id: entity.id,
      fullName: entity.fullName,
      phone: entity.phone,
      email: entity.email,
      relationship: entity.relationship,
      priorityOrder: entity.priorityOrder,
    };
  }
}
