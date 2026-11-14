import { MoodLevel } from '../../../shared/domain/mood';
import { t, withTexts } from '../../../shared/infrastructure/i18n-bridge';

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
  { value: 'AUDITORY' as SensoryTrigger, emoji: '🔊' },
  { value: 'VISUAL' as SensoryTrigger, emoji: '💡' },
  { value: 'TACTILE' as SensoryTrigger, emoji: '✋' },
  { value: 'ROUTINE_CHANGE' as SensoryTrigger, emoji: '🔄' },
  { value: 'CROWD' as SensoryTrigger, emoji: '👥' },
  { value: 'OTHER' as SensoryTrigger, emoji: '❔' },
  { value: 'NONE' as SensoryTrigger, emoji: '🤷' },
].map((item) => withTexts(item, { label: `triggers.${item.value}` }));

export const OBSERVED_STATES: { value: ObservedState; label: string; emoji: string }[] = [
  { value: 'CALM' as ObservedState, emoji: '😌' },
  { value: 'TIRED' as ObservedState, emoji: '🥱' },
  { value: 'SENSITIVE' as ObservedState, emoji: '🥺' },
  { value: 'IRRITABLE' as ObservedState, emoji: '😤' },
].map((item) => withTexts(item, { label: `observed.${item.value}` }));

export const TOPICS: Record<RecommendationTopic, { label: string; chip: string; icon: string }> = {
  SENSORY: withTexts({ chip: 'lavender', icon: 'hearing' }, { label: 'topics.SENSORY' }),
  COMMUNICATIONAL: withTexts({ chip: 'sky', icon: 'forum' }, { label: 'topics.COMMUNICATIONAL' }),
  BEHAVIORAL: withTexts({ chip: 'sun', icon: 'psychology' }, { label: 'topics.BEHAVIORAL' }),
};

export function triggerLabel(trigger: string | null | undefined): string {
  return TRIGGERS.find((item) => item.value === trigger)?.label ?? t('triggers.unidentified');
}
