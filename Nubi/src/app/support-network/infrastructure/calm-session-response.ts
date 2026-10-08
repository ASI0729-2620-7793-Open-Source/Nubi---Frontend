/** Recursos tal como los devuelve la API falsa (json-server). */
export interface CalmTimerResource {
  durationMinutes: number;
  remainingSeconds: number;
  running: boolean;
}

export interface CalmSessionResource {
  id: number;
  profileId: number;
  resourceId: number | null;
  status: string;
  intensity: number;
  lowStimulationActive: boolean;
  startedBySos: boolean;
  startedAt: string;
  endedAt: string | null;
  timer: CalmTimerResource | null;
}
