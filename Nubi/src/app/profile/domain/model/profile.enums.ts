/**
 * Enumerados del Bounded Context Perfil y Personalización.
 * Los valores viajan tal cual a la API REST (mayúsculas con guion bajo).
 */
export enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  NON_BINARY = 'NON_BINARY',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum ConditionType {
  ASD = 'ASD',
  ADHD = 'ADHD',
  OCD = 'OCD',
  OTHER = 'OTHER',
}

export enum CommunicativeNeed {
  PICTOGRAMS = 'PICTOGRAMS',
  TEXT = 'TEXT',
  VOICE = 'VOICE',
}

export enum CaregiverRole {
  PRIMARY = 'PRIMARY',
  CAREGIVER = 'CAREGIVER',
  THERAPIST = 'THERAPIST',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

/** Mapeo Slider 1-4 del wireframe hacia el modelo (US-03). */
export const SENSITIVITY_TO_NUMBER: Record<SensitivityLevel, number> = {
  [SensitivityLevel.LOW]: 1,
  [SensitivityLevel.MEDIUM]: 2,
  [SensitivityLevel.HIGH]: 3,
  [SensitivityLevel.VERY_HIGH]: 4,
};

/** Mapeo inverso para pintar el Tag y el texto "nivel N/4" desde el slider. */
export const NUMBER_TO_SENSITIVITY: Record<number, SensitivityLevel> = {
  1: SensitivityLevel.LOW,
  2: SensitivityLevel.MEDIUM,
  3: SensitivityLevel.HIGH,
  4: SensitivityLevel.VERY_HIGH,
};
