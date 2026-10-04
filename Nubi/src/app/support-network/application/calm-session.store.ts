import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { finalize, of, switchMap } from 'rxjs';
import { ProfileStore } from '../../shared/application/profile.store';
import { CalmSession } from '../domain/model/calm-session.entity';
import { CalmingResource } from '../domain/model/calming-resource.entity';
import { CalmSessionApi } from '../infrastructure/calm-session-api';

/** Cada cuántos segundos se guarda el tiempo restante mientras el temporizador corre. */
const TIMER_SAVE_EVERY_SECONDS = 15;

/**
 * Fuente única de verdad de la sesión de calma del perfil. Los comandos se aplican
 * primero en pantalla y luego se guardan en la API, así el temporizador y los
 * controles responden al instante.
 */
@Injectable({ providedIn: 'root' })
export class CalmSessionStore {
  private readonly sessionApi = inject(CalmSessionApi);
  private readonly profileStore = inject(ProfileStore);

  private readonly sessionState = signal<CalmSession | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  /** Última sesión del perfil, abierta o finalizada. */
  readonly session = computed(() => this.sessionState());
  /** Recurso usado en la última sesión: la galería lo muestra seleccionado. */
  readonly lastResourceId = computed(() => this.sessionState()?.resourceId ?? null);
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  constructor() {
    effect(() => {
      const profileId = this.profileStore.selectedProfileId();
      untracked(() => {
        if (profileId !== null) {
          this.loadLatest(profileId);
        }
      });
    });
  }

  loadLatest(profileId: number): void {
    this.sessionApi.getLatestByProfileId(profileId).subscribe({
      next: (session) => this.sessionState.set(session),
      error: () => this.errorState.set('session.loadError'),
    });
  }

  loadById(sessionId: number): void {
    if (this.sessionState()?.id === sessionId) return;

    this.loadingState.set(true);
    this.sessionApi
      .getById(sessionId)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (session) => this.sessionState.set(session),
        error: () => this.errorState.set('timer.loadError'),
      });
  }

  /**
   * Comando "Seleccionar recurso de calma": si el perfil tiene una sesión abierta la
   * continúa con este recurso; si no, inicia una sesión nueva.
   */
  openWithResource(resource: CalmingResource): void {
    const profileId = this.profileStore.selectedProfileId();
    if (profileId === null) return;

    this.loadingState.set(true);
    this.errorState.set(null);
    this.sessionApi
      .getLatestByProfileId(profileId)
      .pipe(
        switchMap((latest) => {
          if (!latest?.isOpen()) return this.sessionApi.start(profileId, resource);
          if (latest.resourceId === resource.id) return of(latest);
          return this.sessionApi.update(latest.selectResource(resource));
        }),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe({
        next: (session) => this.sessionState.set(session),
        error: () => this.errorState.set('session.loadError'),
      });
  }

  /** Mientras se arrastra el control solo cambia en pantalla; se guarda al soltarlo. */
  adjustIntensity(intensity: number, resource: CalmingResource): void {
    this.apply((session) => session.adjustIntensity(intensity, resource), false);
  }

  saveIntensity(): void {
    this.apply((session) => session);
  }

  setLowStimulation(active: boolean): void {
    this.apply((session) =>
      active ? session.activateLowStimulation() : session.deactivateLowStimulation(),
    );
  }

  /** Comando "Iniciar temporizador de calma". */
  startTimer(durationMinutes: number): void {
    this.apply((session) => session.startTimer(durationMinutes));
  }

  pauseTimer(): void {
    this.apply((session) => session.pauseTimer());
  }

  resumeTimer(): void {
    this.apply((session) => session.resumeTimer());
  }

  /** Avanza un segundo el temporizador en marcha. */
  tick(): void {
    const current = this.sessionState();
    if (!current?.isOpen() || !current.timer?.running) return;

    const next = current.tick(1);
    const remaining = next.timer?.remainingSeconds ?? 0;
    this.apply(() => next, next.timer?.isExpired() || remaining % TIMER_SAVE_EVERY_SECONDS === 0);
  }

  /** Comando "Finalizar sesión de calma". */
  finish(): void {
    this.apply((session) => session.finish());
  }

  private apply(command: (session: CalmSession) => CalmSession, save = true): void {
    const current = this.sessionState();
    if (!current?.isOpen()) return;

    const next = command(current);
    this.sessionState.set(next);
    if (save) {
      this.sessionApi.update(next).subscribe({
        error: () => this.errorState.set('session.loadError'),
      });
    }
  }
}
