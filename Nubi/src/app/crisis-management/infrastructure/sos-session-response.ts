/** Recursos tal como los devuelve la API falsa (json-server). */
export interface CompletedStepResource {
  stepId: number;
  skipped: boolean;
  completedAt: string;
}

export interface SosSessionResource {
  id: number;
  profileId: number;
  caregiverId: number;
  guideId: number;
  status: string;
  currentStepOrder: number;
  initialIntensity: string;
  finalIntensity: string | null;
  trigger: string;
  observedState: string | null;
  startedAt: string;
  finishedAt: string | null;
  completedSteps: CompletedStepResource[];
}
