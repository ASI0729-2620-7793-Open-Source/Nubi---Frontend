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
  FLOATING_BUBBLES: { emoji: '🫧', gradient: 'linear-gradient(135deg,#f8d77f,#f9ece4)', kidText: 'Mira las burbujas subir' },
  OCEAN_SOUNDS: { emoji: '🌊', gradient: 'linear-gradient(160deg,#d7e8f1,#6c9fbb)', kidText: 'Escucha el mar' },
  COLOR_WAVES: { emoji: '🌈', gradient: 'linear-gradient(160deg,#7fe0e6,#e7fbfa)', kidText: 'Olas de colores' },
  RELAXING_PIANO: { emoji: '🎹', gradient: 'linear-gradient(135deg,#ead7bd,#f8f0e6)', kidText: 'Música suave' },
  STARRY_SKY: { emoji: '✨', gradient: 'radial-gradient(ellipse at 30% 20%,#2b3a78,#090f27)', kidText: 'Mira las estrellas' },
  GENTLE_RAIN: { emoji: '🌧️', gradient: 'linear-gradient(180deg,#b9b3d9,#a9d3b5)', kidText: 'Lluvia tranquila' },
  BALLOON_BREATHING: { emoji: '🎈', gradient: 'linear-gradient(160deg,#ece9fb,#dff4ee)', kidText: 'Infla el globo' },
  CALM_DRAWING: { emoji: '🖍️', gradient: 'linear-gradient(160deg,#fdf1d8,#fde7df)', kidText: 'Dibuja tranquilo' },
};

export const RESOURCE_TYPES: Record<ResourceType, { label: string; icon: string }> = {
  VISUAL: { label: 'Visual', icon: 'visibility' },
  AUDITORY: { label: 'Sonido', icon: 'music_note' },
  GUIDED_BREATHING: { label: 'Respiración', icon: 'air' },
  DRAWING_CANVAS: { label: 'Dibujo', icon: 'brush' },
};

export function lookOf(code: string) {
  return RESOURCE_LOOK[code] ?? { emoji: '💙', gradient: 'linear-gradient(135deg,#dff4ee,#ece9fb)', kidText: 'Momento de calma' };
}
