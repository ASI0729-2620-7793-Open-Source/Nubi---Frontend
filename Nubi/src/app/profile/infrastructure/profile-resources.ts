import {
  CaregiverRole,
  CommunicativeNeed,
  ConditionType,
  Gender,
  InvitationStatus,
  SensitivityLevel,
} from '../domain/model/profile.enums';

/** Recurso tal como lo expone la API REST falsa (server/db.json). */
export interface SensoryProfileResource {
  auditory: SensitivityLevel;
  visual: SensitivityLevel;
  tactile: SensitivityLevel;
  lowStimulationEnabled: boolean;
  prioritizeVisuals: boolean;
  confirmAudio: boolean;
}

export interface DeclaredDiagnosisResource {
  condition: ConditionType;
  customDescription: string | null;
  diagnosedBy: string | null;
  diagnosisDate: string | null;
  professionalNotes: string | null;
}

export interface ProfileCaregiverResource {
  id: number;
  accountId: number | null;
  invitedEmail: string;
  role: CaregiverRole;
  status: InvitationStatus;
  invitedAt: string;
  acceptedAt: string | null;
}

export interface TrustedContactResource {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  relationship: string;
  priorityOrder: number;
}

export interface NeurodivergentProfileResource {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string | null;
  age: number;
  gender: Gender;
  photoUrl: string | null;
  communicativeNeed: CommunicativeNeed;
  active: boolean;
  sensoryProfile: SensoryProfileResource;
  diagnosis: DeclaredDiagnosisResource | null;
  caregivers: ProfileCaregiverResource[];
  trustedContacts: TrustedContactResource[];
  createdAt: string;
  updatedAt: string;
}

/** Respuesta de colección del ProfileController (getProfiles). */
export interface ProfilesResponse {
  profiles: NeurodivergentProfileResource[];
}
