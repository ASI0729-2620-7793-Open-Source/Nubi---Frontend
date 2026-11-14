import { t } from '../infrastructure/i18n-bridge';

/**
 * Escala de intensidad emocional compartida por varios Bounded Contexts del backend
 * (Comunicación Asistida, Gestión de Crisis): CALM, RESTLESS, ALTERED, CRISIS.
 * Las etiquetas son propiedades calculadas: cambian solas al cambiar el idioma.
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

function mood(level: MoodLevel, emoji: string, color: string, soft: string, score: number): MoodInfo {
  return {
    level,
    get label() {
      return t(`moods.${level}.label`);
    },
    get kidLabel() {
      return t(`moods.${level}.kid`);
    },
    emoji,
    color,
    soft,
    score,
  };
}

export const MOODS: readonly MoodInfo[] = [
  mood('CALM', '😌', 'var(--mood-calm)', 'var(--mint-100)', 0),
  mood('RESTLESS', '😕', 'var(--mood-restless)', 'var(--sun-100)', 1),
  mood('ALTERED', '😣', 'var(--mood-altered)', 'var(--peach-100)', 2),
  mood('CRISIS', '😭', 'var(--mood-crisis)', 'var(--coral-100)', 3),
];

export function moodInfo(level: string | null | undefined): MoodInfo {
  return MOODS.find((item) => item.level === level) ?? MOODS[0];
}
