import { CalmSessionStatus } from './calm-session.enums';
import { CalmTimer } from './calm-timer';
import { CalmingResource } from './calming-resource.entity';

type CalmSessionChanges = Partial<
  Pick<
    CalmSession,
    'resourceId' | 'status' | 'intensity' | 'lowStimulationActive' | 'endedAt' | 'timer'
  >
>;

/**
 * Aggregate Root. Sesión de calma de un perfil: el recurso que se está usando, su
 * intensidad, el modo de baja estimulación y el temporizador de calma opcional.
 * Cada comando devuelve una sesión nueva, así los stores trabajan con valores inmutables.
 */
export class CalmSession {
  constructor(
    public readonly id: number,
    public readonly profileId: number,
    public readonly resourceId: number | null,
    public readonly status: CalmSessionStatus,
    public readonly intensity: number,
    public readonly lowStimulationActive: boolean,
    public readonly startedBySos: boolean,
    public readonly startedAt: Date,
    public readonly endedAt: Date | null,
    public readonly timer: CalmTimer | null,
  ) {}

  isOpen(): boolean {
    return this.status !== CalmSessionStatus.FINISHED;
  }

  /** Comando "Seleccionar recurso de calma". */
  selectResource(resource: CalmingResource): CalmSession {
    return this.copy({
      resourceId: resource.id,
      intensity: Math.min(this.intensity, resource.maxIntensity),
    });
  }

  /** La intensidad va de 1 al máximo que admite el recurso, nunca más. */
  adjustIntensity(intensity: number, resource: CalmingResource): CalmSession {
    const value = Math.min(Math.max(1, Math.round(intensity)), resource.maxIntensity);
    return this.copy({ intensity: value });
  }

  activateLowStimulation(): CalmSession {
    return this.copy({ lowStimulationActive: true });
  }

  deactivateLowStimulation(): CalmSession {
    return this.copy({ lowStimulationActive: false });
  }

  /** Comando "Iniciar temporizador de calma". */
  startTimer(durationMinutes: number): CalmSession {
    return this.copy({ timer: CalmTimer.start(durationMinutes) });
  }

  pauseTimer(): CalmSession {
    return this.timer ? this.copy({ timer: this.timer.pause() }) : this;
  }

  resumeTimer(): CalmSession {
    return this.timer ? this.copy({ timer: this.timer.resume() }) : this;
  }

  tick(seconds: number): CalmSession {
    return this.timer ? this.copy({ timer: this.timer.tick(seconds) }) : this;
  }

  /** Comando "Finalizar sesión de calma". */
  finish(): CalmSession {
    return this.copy({
      status: CalmSessionStatus.FINISHED,
      endedAt: new Date(),
      timer: this.timer ? this.timer.pause() : null,
    });
  }

  /** Política: si el temporizador termina y la sesión sigue abierta, se sugiere pedir ayuda. */
  shouldSuggestHelp(): boolean {
    return this.isOpen() && (this.timer?.isExpired() ?? false);
  }

  private copy(changes: CalmSessionChanges): CalmSession {
    return new CalmSession(
      this.id,
      this.profileId,
      changes.resourceId === undefined ? this.resourceId : changes.resourceId,
      changes.status ?? this.status,
      changes.intensity ?? this.intensity,
      changes.lowStimulationActive ?? this.lowStimulationActive,
      this.startedBySos,
      this.startedAt,
      changes.endedAt === undefined ? this.endedAt : changes.endedAt,
      changes.timer === undefined ? this.timer : changes.timer,
    );
  }
}
