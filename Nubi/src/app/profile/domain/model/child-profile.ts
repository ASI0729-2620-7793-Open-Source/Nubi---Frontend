import { t, withTexts } from '../../../shared/infrastructure/i18n-bridge';
/**
 * Perfil del niño (Bounded Context Perfil y Personalización). Desde esta versión cada cuenta
 * acompaña a un único niño, y Nubi está pensada solo para niños con autismo (TEA).
 */
export type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
export type CommunicativeNeed = 'PICTOGRAMS' | 'TEXT' | 'VOICE';
export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type CaregiverRole = 'PRIMARY' | 'CAREGIVER' | 'THERAPIST';
export type InvitationStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

/** Invitación pendiente para la cuenta que inició sesión. */
export interface Invitation {
  profileId: number;
  caregiverId: number;
  childName: string;
  role: string;
  invitedAt: string;
}

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

export const GENDERS: { value: Gender; label: string }[] = (
  ['FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'] as Gender[]
).map((value) => withTexts({ value }, { label: `genders.${value}` }));

export const COMMUNICATION_NEEDS: { value: CommunicativeNeed; label: string; icon: string; hint: string }[] = [
  { value: 'PICTOGRAMS' as CommunicativeNeed, icon: 'grid_view' },
  { value: 'TEXT' as CommunicativeNeed, icon: 'text_fields' },
  { value: 'VOICE' as CommunicativeNeed, icon: 'record_voice_over' },
].map((need) => withTexts(need, { label: `needs.${need.value}.label`, hint: `needs.${need.value}.hint` }));

export const SENSITIVITY_LEVELS: { value: SensitivityLevel; label: string }[] = (
  ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as SensitivityLevel[]
).map((value) => withTexts({ value }, { label: `levels.${value}` }));

export const CAREGIVER_ROLES: Record<CaregiverRole, string> = {
  get PRIMARY() {
    return t('roles.PRIMARY');
  },
  get CAREGIVER() {
    return t('roles.CAREGIVER');
  },
  get THERAPIST() {
    return t('roles.THERAPIST');
  },
};

/**
 * Planes de Nubi, con los mismos nombres, precios y beneficios que la landing page. Los textos
 * (plans.<key>.name, .price, .description, .perk1 a .perk4) están en public/i18n.
 */
export const PLAN_CATALOG: { plan: Subscription['plan']; key: 'standard' | 'premium' | 'institutions'; featured: boolean }[] = [
  { plan: 'FREEMIUM', key: 'standard', featured: false },
  { plan: 'FAMILY_PREMIUM', key: 'premium', featured: true },
  { plan: 'INSTITUTIONAL', key: 'institutions', featured: false },
];

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
