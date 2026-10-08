export enum SosSessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  FINISHED_EARLY = 'FINISHED_EARLY',
}

/** Escala de intensidad del episodio: Calma, Inquieto, Alterado y Crisis. */
export enum CrisisIntensity {
  CALM = 'CALM',
  RESTLESS = 'RESTLESS',
  ALTERED = 'ALTERED',
  CRISIS = 'CRISIS',
}

/** Sentido que dispara o agrava la crisis; NONE cuando el perfil no tiene una sensibilidad marcada. */
export enum SensoryTrigger {
  AUDITORY = 'AUDITORY',
  VISUAL = 'VISUAL',
  TACTILE = 'TACTILE',
  NONE = 'NONE',
}

/** Cómo ve el cuidador al usuario al cerrar el episodio. */
export enum ObservedState {
  CALM = 'CALM',
  TIRED = 'TIRED',
  SENSITIVE = 'SENSITIVE',
  IRRITABLE = 'IRRITABLE',
}

/** Intensidad final que se registra según el estado que el cuidador observa al terminar. */
export const FINAL_INTENSITY_BY_STATE: Readonly<Record<ObservedState, CrisisIntensity>> = {
  [ObservedState.CALM]: CrisisIntensity.CALM,
  [ObservedState.TIRED]: CrisisIntensity.RESTLESS,
  [ObservedState.SENSITIVE]: CrisisIntensity.RESTLESS,
  [ObservedState.IRRITABLE]: CrisisIntensity.ALTERED,
};
