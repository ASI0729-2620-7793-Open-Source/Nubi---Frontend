/** Bounded Context Rutina Visual (nuevo): los pasos del día del niño. */
export interface RoutineStep {
  id: number;
  profileId: number;
  title: string;
  icon: string;
  /** HH:mm:ss o null si el paso no tiene hora fija. */
  scheduledTime: string | null;
  position: number;
  completedToday: boolean;
  lastCompletedOn: string | null;
}

export interface RoutineStepForm {
  title: string;
  icon: string;
  scheduledTime: string | null;
}

export const ROUTINE_ICONS = [
  '☀️', '🧼', '🥣', '🪥', '👕', '🎒', '🏫', '🍽️', '🍎', '🧩', '🎨', '📚',
  '⚽', '🚌', '🧸', '🫧', '🛁', '🌙', '💊', '🗣️', '🎵', '🐶', '🌳', '⭐',
];

export function shortTime(time: string | null): string {
  return time ? time.slice(0, 5) : '';
}

/** El próximo paso pendiente del día (el primero sin marcar). */
export function nextStep(steps: RoutineStep[]): RoutineStep | null {
  return steps.find((step) => !step.completedToday) ?? null;
}
