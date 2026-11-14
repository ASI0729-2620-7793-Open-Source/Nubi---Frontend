import { t, withTexts } from '../../../shared/infrastructure/i18n-bridge';
/** Bounded Context Autorregulación: recursos de calma y sesiones de calma. */
export type ResourceType = 'VISUAL' | 'AUDITORY' | 'GUIDED_BREATHING' | 'DRAWING_CANVAS';
export type CalmSessionStatus = 'ACTIVE' | 'PAUSED' | 'FINISHED';

export interface CalmingResource {
  id: number;
  code: string;
  name: string;
  type: ResourceType;
  mediaUrl: string;
  maxIntensity: number;
  availableOffline: boolean;
  active: boolean;
}

export interface FavoriteResource {
  id: number;
  profileId: number;
  resourceId: number;
  markedAt: string;
}

export interface CalmTimer {
  durationMinutes: number;
  remainingSeconds: number;
  running: boolean;
}

export interface CalmSession {
  id: number;
  profileId: number;
  resourceId: number | null;
  status: CalmSessionStatus;
  intensity: number;
  lowStimulationActive: boolean;
  startedBySos: boolean;
  startedAt: string;
  endedAt: string | null;
  timer: CalmTimer | null;
  shouldSuggestHelp: boolean;
}

/** Presentación de cada recurso: emoji, color y una frase corta para el niño. */
export const RESOURCE_LOOK: Record<string, { emoji: string; gradient: string; kidText: string }> = {
  FLOATING_BUBBLES: { emoji: '🫧', gradient: 'linear-gradient(135deg,#f8d77f,#f9ece4)', get kidText() { return t('resources.FLOATING_BUBBLES.kid'); } },
  OCEAN_SOUNDS: { emoji: '🌊', gradient: 'linear-gradient(160deg,#d7e8f1,#6c9fbb)', get kidText() { return t('resources.OCEAN_SOUNDS.kid'); } },
  COLOR_WAVES: { emoji: '🌈', gradient: 'linear-gradient(160deg,#7fe0e6,#e7fbfa)', get kidText() { return t('resources.COLOR_WAVES.kid'); } },
  RELAXING_PIANO: { emoji: '🎹', gradient: 'linear-gradient(135deg,#ead7bd,#f8f0e6)', get kidText() { return t('resources.RELAXING_PIANO.kid'); } },
  STARRY_SKY: { emoji: '✨', gradient: 'radial-gradient(ellipse at 30% 20%,#2b3a78,#090f27)', get kidText() { return t('resources.STARRY_SKY.kid'); } },
  GENTLE_RAIN: { emoji: '🌧️', gradient: 'linear-gradient(180deg,#b9b3d9,#a9d3b5)', get kidText() { return t('resources.GENTLE_RAIN.kid'); } },
  BALLOON_BREATHING: { emoji: '🎈', gradient: 'linear-gradient(160deg,#ece9fb,#dff4ee)', get kidText() { return t('resources.BALLOON_BREATHING.kid'); } },
  CALM_DRAWING: { emoji: '🖍️', gradient: 'linear-gradient(160deg,#fdf1d8,#fde7df)', get kidText() { return t('resources.CALM_DRAWING.kid'); } },
};

export const RESOURCE_TYPES: Record<ResourceType, { label: string; icon: string }> = {
  VISUAL: withTexts({ icon: 'visibility' }, { label: 'resourceTypes.VISUAL' }),
  AUDITORY: withTexts({ icon: 'music_note' }, { label: 'resourceTypes.AUDITORY' }),
  GUIDED_BREATHING: withTexts({ icon: 'air' }, { label: 'resourceTypes.GUIDED_BREATHING' }),
  DRAWING_CANVAS: withTexts({ icon: 'brush' }, { label: 'resourceTypes.DRAWING_CANVAS' }),
};

export function lookOf(code: string) {
  return RESOURCE_LOOK[code] ?? { emoji: '💙', gradient: 'linear-gradient(135deg,#dff4ee,#ece9fb)', get kidText() { return t('resources.default.kid'); } };
}
