import { MoodLevel } from '../../../shared/domain/mood';

/** Bounded Context Gestión de Crisis (Modo SOS). */
export type SensoryTrigger = 'AUDITORY' | 'VISUAL' | 'TACTILE' | 'ROUTINE_CHANGE' | 'CROWD' | 'OTHER' | 'NONE';
export type ObservedState = 'CALM' | 'TIRED' | 'SENSITIVE' | 'IRRITABLE';
export type SosStatus = 'IN_PROGRESS' | 'FINISHED' | 'FINISHED_EARLY';
export type RecommendationTopic = 'SENSORY' | 'COMMUNICATIONAL' | 'BEHAVIORAL';

export interface AlternativeTechnique {
  id: number;
  stepId: number;
  code: string;
  title: string;
  description: string;
}

export interface ContainmentStep {
  id: number;
  stepOrder: number;
  code: string;
  title: string;
  description: string;
  mandatory: boolean;
  relatedTrigger: SensoryTrigger;
  alternativeTechniques: AlternativeTechnique[];
}

export interface ActionGuide {
  id: number;
  name: string;
  description: string;
  totalSteps: number;
  steps: ContainmentStep[];
}

export interface CompletedStep {
  stepId: number;
  skipped: boolean;
  completedAt: string;
}

export interface SosSession {
  id: number;
  profileId: number;
  caregiverAccountId: number;
  guideId: number;
  status: SosStatus;
  currentStepOrder: number;
  totalSteps: number;
  initialIntensity: MoodLevel;
  finalIntensity: MoodLevel | null;
  trigger: SensoryTrigger;
  observedState: ObservedState | null;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number;
  lastStep: boolean;
  completedSteps: CompletedStep[];
}

export interface CrisisRecommendation {
  id: number;
  profileId: number;
  topic: RecommendationTopic;
  title: string;
  content: string;
  generatedAt: string;
  preferences: { accountId: number; usefulnessRating: number | null; favorite: boolean }[];
}

export const TRIGGERS: { value: SensoryTrigger; label: string; emoji: string }[] = [
  { value: 'AUDITORY', label: 'Ruido', emoji: '🔊' },
  { value: 'VISUAL', label: 'Luz o imágenes', emoji: '💡' },
  { value: 'TACTILE', label: 'Contacto o texturas', emoji: '✋' },
  { value: 'ROUTINE_CHANGE', label: 'Cambio de rutina', emoji: '🔄' },
  { value: 'CROWD', label: 'Mucha gente', emoji: '👥' },
  { value: 'OTHER', label: 'Otro', emoji: '❔' },
  { value: 'NONE', label: 'No lo sé', emoji: '🤷' },
];

export const OBSERVED_STATES: { value: ObservedState; label: string; emoji: string }[] = [
  { value: 'CALM', label: 'Tranquilo', emoji: '😌' },
  { value: 'TIRED', label: 'Cansado', emoji: '🥱' },
  { value: 'SENSITIVE', label: 'Sensible', emoji: '🥺' },
  { value: 'IRRITABLE', label: 'Irritable', emoji: '😤' },
];

export const TOPICS: Record<RecommendationTopic, { label: string; chip: string; icon: string }> = {
  SENSORY: { label: 'Sensorial', chip: 'lavender', icon: 'hearing' },
  COMMUNICATIONAL: { label: 'Comunicación', chip: 'sky', icon: 'forum' },
  BEHAVIORAL: { label: 'Conducta', chip: 'sun', icon: 'psychology' },
};

export function triggerLabel(trigger: string | null | undefined): string {
  return TRIGGERS.find((item) => item.value === trigger)?.label ?? 'Sin identificar';
}
