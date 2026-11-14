/**
 * Escala de intensidad emocional compartida por varios Bounded Contexts del backend
 * (Comunicación Asistida, Gestión de Crisis): CALM, RESTLESS, ALTERED, CRISIS.
 */
export type MoodLevel = 'CALM' | 'RESTLESS' | 'ALTERED' | 'CRISIS';

export interface MoodInfo {
  level: MoodLevel;
  label: string;
  kidLabel: string;
  emoji: string;
  color: string;
  soft: string;
  score: number;
}

export const MOODS: readonly MoodInfo[] = [
  { level: 'CALM', label: 'En calma', kidLabel: 'Tranquilo', emoji: '😌', color: 'var(--mood-calm)', soft: 'var(--mint-100)', score: 0 },
  { level: 'RESTLESS', label: 'Inquieto', kidLabel: 'Inquieto', emoji: '😕', color: 'var(--mood-restless)', soft: 'var(--sun-100)', score: 1 },
  { level: 'ALTERED', label: 'Alterado', kidLabel: 'Enojado', emoji: '😣', color: 'var(--mood-altered)', soft: 'var(--peach-100)', score: 2 },
  { level: 'CRISIS', label: 'En crisis', kidLabel: 'Muy mal', emoji: '😭', color: 'var(--mood-crisis)', soft: 'var(--coral-100)', score: 3 },
];

export function moodInfo(level: string | null | undefined): MoodInfo {
  return MOODS.find((mood) => mood.level === level) ?? MOODS[0];
}
