/**
 * Perfil del niño (Bounded Context Perfil y Personalización). Desde esta versión cada cuenta
 * acompaña a un único niño, y Nubi está pensada solo para niños con autismo (TEA).
 */
export type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
export type CommunicativeNeed = 'PICTOGRAMS' | 'TEXT' | 'VOICE';
export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type CaregiverRole = 'PRIMARY' | 'CAREGIVER' | 'THERAPIST';
export type InvitationStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export interface SensoryProfile {
  auditory: SensitivityLevel;
  visual: SensitivityLevel;
  tactile: SensitivityLevel;
  lowStimulationEnabled: boolean;
  prioritizeVisuals: boolean;
  confirmAudio: boolean;
}

export interface Diagnosis {
  condition: 'ASD';
  diagnosedBy: string | null;
  diagnosisDate: string | null;
  professionalNotes: string | null;
}

export interface Caregiver {
  id: number;
  invitedEmail: string;
  accountId: number | null;
  role: CaregiverRole;
  status: InvitationStatus;
  invitedAt: string;
  acceptedAt: string | null;
}

export interface TrustedContact {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  relationship: string | null;
  priorityOrder: number;
}

export interface ChildProfile {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string | null;
  displayName: string;
  age: number;
  gender: Gender | null;
  photoUrl: string | null;
  communicativeNeed: CommunicativeNeed | null;
  active: boolean;
  sensoryProfile: SensoryProfile | null;
  diagnosis: Diagnosis | null;
  caregivers: Caregiver[];
  trustedContacts: TrustedContact[];
  createdAt: string;
}

export interface ChildForm {
  firstName: string;
  lastName: string;
  nickname: string;
  age: number;
  gender: Gender;
  communicativeNeed: CommunicativeNeed;
}

export interface Subscription {
  id: number;
  plan: 'FREEMIUM' | 'FAMILY_PREMIUM' | 'INSTITUTIONAL';
  status: string;
  maxProfiles: number;
  maxCaregiversPerProfile: number;
  startedAt: string;
}

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'FEMALE', label: 'Niña' },
  { value: 'MALE', label: 'Niño' },
  { value: 'NON_BINARY', label: 'No binario' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decirlo' },
];

export const COMMUNICATION_NEEDS: { value: CommunicativeNeed; label: string; icon: string; hint: string }[] = [
  { value: 'PICTOGRAMS', label: 'Pictogramas', icon: 'grid_view', hint: 'Se comunica mejor con imágenes' },
  { value: 'TEXT', label: 'Texto', icon: 'text_fields', hint: 'Lee o escribe frases cortas' },
  { value: 'VOICE', label: 'Voz', icon: 'record_voice_over', hint: 'Usa palabras habladas' },
];

export const SENSITIVITY_LEVELS: { value: SensitivityLevel; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'VERY_HIGH', label: 'Muy alta' },
];

export const CAREGIVER_ROLES: Record<CaregiverRole, string> = {
  PRIMARY: 'Cuidador principal',
  CAREGIVER: 'Cuidador',
  THERAPIST: 'Terapeuta',
};

export const PLANS: Record<Subscription['plan'], { name: string; price: string; perks: string[] }> = {
  FREEMIUM: {
    name: 'Estándar',
    price: 'Gratis',
    perks: ['1 niño acompañado', 'Hasta 2 cuidadores', 'Rincón de calma y rutina visual'],
  },
  FAMILY_PREMIUM: {
    name: 'Familia',
    price: 'S/ 19.90 al mes',
    perks: ['1 niño acompañado', 'Hasta 5 cuidadores', 'Toda la familia y terapeutas conectados'],
  },
  INSTITUTIONAL: {
    name: 'Institución',
    price: 'A medida',
    perks: ['1 niño por cuenta', 'Hasta 50 cuidadores', 'Ideal para colegios y centros de terapia'],
  },
};

export function initials(profile: Pick<ChildProfile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
}

/** Avatares amigables: se guardan como `emoji:🦊` en photoUrl (o una URL de imagen). */
export const AVATARS = ['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦄', '🐳', '🦖', '🐝', '🚀', '🌈', '⚽', '🎨'];

export function avatarOf(child: Pick<ChildProfile, 'photoUrl' | 'firstName' | 'lastName'>): { emoji?: string; image?: string; text: string } {
  const url = child.photoUrl ?? '';
  if (url.startsWith('emoji:')) return { emoji: url.slice(6), text: '' };
  if (/^https?:/.test(url)) return { image: url, text: '' };
  return { text: initials(child) };
}
