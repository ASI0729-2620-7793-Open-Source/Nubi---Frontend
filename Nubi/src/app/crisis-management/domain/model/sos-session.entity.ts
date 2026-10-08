import { CompletedStep } from './completed-step.entity';
import { ContainmentStep } from './containment-step.entity';
import {
  CrisisIntensity,
  FINAL_INTENSITY_BY_STATE,
  ObservedState,
  SensoryTrigger,
  SosSessionStatus,
} from './sos-session.enums';

/** Se lanza al intentar omitir un paso obligatorio sin la confirmación explícita del cuidador. */
export class MandatoryStepNotConfirmedError extends Error {
  constructor(stepId: number) {
    super(`Step ${stepId} is mandatory: skipping it requires explicit confirmation.`);
    this.name = 'MandatoryStepNotConfirmedError';
  }
}

type SosSessionChanges = Partial<
  Pick<
    SosSession,
    | 'status'
    | 'currentStepOrder'
    | 'finalIntensity'
    | 'observedState'
    | 'finishedAt'
    | 'completedSteps'
  >
>;

/**
 * Aggregate Root. Sesión guiada que acompaña al cuidador durante una crisis: la guía que
 * sigue, el paso en el que va y los pasos completados u omitidos. Cada comando devuelve
 * una sesión nueva, así el store trabaja con valores inmutables.
 */
export class SosSession {
  constructor(
    public readonly id: number,
    public readonly profileId: number,
    public readonly caregiverId: number,
    public readonly guideId: number,
    public readonly status: SosSessionStatus,
    /** `stepOrder` del paso en el que va el cuidador; permite retomar la guía si la abandona. */
    public readonly currentStepOrder: number,
    public readonly initialIntensity: CrisisIntensity,
    public readonly finalIntensity: CrisisIntensity | null,
    public readonly trigger: SensoryTrigger,
    public readonly observedState: ObservedState | null,
    public readonly startedAt: Date,
    public readonly finishedAt: Date | null,
    public readonly completedSteps: CompletedStep[],
  ) {}

  isInProgress(): boolean {
    return this.status === SosSessionStatus.IN_PROGRESS;
  }

  /** El paso ya se completó o se omitió. */
  hasHandled(step: ContainmentStep): boolean {
    return this.completedSteps.some((completed) => completed.stepId === step.id);
  }

  /** Comando "Marcar paso como completado": lo registra y avanza al siguiente. */
  completeStep(step: ContainmentStep, next: ContainmentStep | null): SosSession {
    return this.handle(step, next, false);
  }

  /** Omitir un paso obligatorio exige que el cuidador lo haya confirmado de forma explícita. */
  skipStep(step: ContainmentStep, next: ContainmentStep | null, confirmed: boolean): SosSession {
    if (step.mandatory && !confirmed) {
      throw new MandatoryStepNotConfirmedError(step.id);
    }
    return this.handle(step, next, true);
  }

  /**
   * Comando "Finalizar episodio": calcula la duración y cierra la sesión. Si quedaron pasos
   * sin atender queda como finalizada anticipadamente.
   */
  finish(totalSteps: number, observedState: ObservedState | null, now = new Date()): SosSession {
    if (!this.isInProgress()) return this;

    return this.copy({
      status:
        this.completedSteps.length >= totalSteps
          ? SosSessionStatus.FINISHED
          : SosSessionStatus.FINISHED_EARLY,
      observedState,
      finalIntensity: observedState ? FINAL_INTENSITY_BY_STATE[observedState] : null,
      finishedAt: now,
    });
  }

  /** Minutos del episodio, al menos 1; si sigue abierto cuenta hasta `now`. */
  durationMinutes(now = new Date()): number {
    const end = this.finishedAt ?? now;
    return Math.max(1, Math.round((end.getTime() - this.startedAt.getTime()) / 60000));
  }

  private handle(
    step: ContainmentStep,
    next: ContainmentStep | null,
    skipped: boolean,
  ): SosSession {
    if (!this.isInProgress() || this.hasHandled(step)) return this;

    return this.copy({
      currentStepOrder: next?.stepOrder ?? this.currentStepOrder,
      completedSteps: [...this.completedSteps, new CompletedStep(step.id, skipped, new Date())],
    });
  }

  private copy(changes: SosSessionChanges): SosSession {
    return new SosSession(
      this.id,
      this.profileId,
      this.caregiverId,
      this.guideId,
      changes.status ?? this.status,
      changes.currentStepOrder ?? this.currentStepOrder,
      this.initialIntensity,
      changes.finalIntensity === undefined ? this.finalIntensity : changes.finalIntensity,
      this.trigger,
      changes.observedState === undefined ? this.observedState : changes.observedState,
      this.startedAt,
      changes.finishedAt === undefined ? this.finishedAt : changes.finishedAt,
      changes.completedSteps ?? this.completedSteps,
    );
  }
}
