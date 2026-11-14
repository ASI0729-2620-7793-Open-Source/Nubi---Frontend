import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { MoodCheckIn } from '../../communication/domain/model/board';
import { BoardApi } from '../../communication/infrastructure/board-api';
import { SosSession } from '../../crisis/domain/model/sos';
import { SosApi } from '../../crisis/infrastructure/sos-api';
import { ChildStore } from '../../profile/application/child.store';
import { RoutineStep } from '../../routine/domain/model/routine-step';
import { RoutineApi } from '../../routine/infrastructure/routine-api';
import { CalmSession, CalmingResource } from '../../self-regulation/domain/model/calm';
import { CalmApi } from '../../self-regulation/infrastructure/calm-api';
import { MoodLevel } from '../../shared/domain/mood';
import { calmSessionsSince, calmStreak, moodsSince, routineProgress, sosSince, todayMood } from '../domain/insights';

/**
 * Reúne en un solo lugar los datos de bienestar del niño que viven en distintos Bounded
 * Contexts del backend. Lo usan el panel de inicio, la página de Progreso y el modo niño.
 */
@Injectable({ providedIn: 'root' })
export class WellbeingStore {
  private readonly childStore = inject(ChildStore);
  private readonly boardApi = inject(BoardApi);
  private readonly calmApi = inject(CalmApi);
  private readonly sosApi = inject(SosApi);
  private readonly routineApi = inject(RoutineApi);

  readonly moods = signal<MoodCheckIn[]>([]);
  readonly calmSessions = signal<CalmSession[]>([]);
  readonly sosSessions = signal<SosSession[]>([]);
  readonly routine = signal<RoutineStep[]>([]);
  /** Catálogo completo (sin filtrar) para poner nombre a las sesiones antiguas. */
  readonly resources = signal<CalmingResource[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);

  readonly todayMood = computed(() => todayMood(this.moods()));
  readonly weekCalm = computed(() => calmSessionsSince(this.calmSessions(), 7));
  readonly weekSos = computed(() => sosSince(this.sosSessions(), 7));
  readonly weekMoods = computed(() => moodsSince(this.moods(), 7));
  readonly streak = computed(() => calmStreak(this.calmSessions()));
  readonly routineToday = computed(() => routineProgress(this.routine()));
  readonly openSos = computed(() => this.sosSessions().find((session) => session.status === 'IN_PROGRESS') ?? null);

  load(): void {
    const id = this.childStore.childId();
    if (!id) return;
    this.loading.set(true);
    forkJoin({
      moods: this.boardApi.moods(id).pipe(catchError(() => of([] as MoodCheckIn[]))),
      calm: this.calmApi.sessions(id).pipe(catchError(() => of([] as CalmSession[]))),
      sos: this.sosApi.history(id).pipe(catchError(() => of([] as SosSession[]))),
      routine: this.routineApi.steps(id).pipe(catchError(() => of([] as RoutineStep[]))),
      resources: this.calmApi.resources().pipe(catchError(() => of([] as CalmingResource[]))),
    }).subscribe(({ moods, calm, sos, routine, resources }) => {
      this.moods.set(moods);
      this.calmSessions.set(calm);
      this.sosSessions.set(sos);
      this.routine.set(routine);
      this.resources.set(resources);
      this.loading.set(false);
      this.loaded.set(true);
    });
  }

  /** Registra cómo se siente el niño ahora y lo suma a la lista sin recargar todo. */
  registerMood(level: MoodLevel) {
    const id = this.childStore.childId()!;
    return this.boardApi.registerMood(id, level);
  }

  addMood(mood: MoodCheckIn): void {
    this.moods.update((list) => [...list, mood]);
  }

  replaceStep(step: RoutineStep): void {
    this.routine.update((list) => list.map((item) => (item.id === step.id ? step : item)));
  }

  setRoutine(steps: RoutineStep[]): void {
    this.routine.set(steps);
  }
}
