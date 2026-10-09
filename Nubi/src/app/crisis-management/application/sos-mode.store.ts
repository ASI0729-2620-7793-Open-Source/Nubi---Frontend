import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { EMPTY, Observable, catchError, of, tap } from 'rxjs';
import { ProfileStore } from '../../shared/application/profile.store';
import { ActionGuide } from '../domain/model/action-guide.entity';
import { ContainmentStep } from '../domain/model/containment-step.entity';
import { SosProfile } from '../domain/model/sos-profile.entity';
import { SosSession } from '../domain/model/sos-session.entity';
import { ObservedState } from '../domain/model/sos-session.enums';
import { ActionGuideApi } from '../infrastructure/action-guide-api';
import { ProfileContextFacade } from '../infrastructure/profile-context-facade';
import { SosSessionApi } from '../infrastructure/sos-session-api';

/** Paso de la guía junto con lo que el cuidador hizo con él. */
export interface HandledStep {
  step: ContainmentStep;
  skipped: boolean;
}

/**
 * Fuente única de verdad del Modo SOS: la guía vigente, los perfiles que el cuidador puede
 * acompañar y la sesión en curso. Los comandos se aplican primero en pantalla y luego se
 * guardan en la API, así la guía responde al instante aunque la conexión sea lenta.
 */
@Injectable({ providedIn: 'root' })
export class SosModeStore {
  private readonly guideApi = inject(ActionGuideApi);
  private readonly sessionApi = inject(SosSessionApi);
  private readonly profileContext = inject(ProfileContextFacade);
  private readonly profileStore = inject(ProfileStore);

  private readonly guideState = signal<ActionGuide | null>(null);
  private readonly profilesState = signal<SosProfile[]>([]);
  private readonly selectedProfileIdState = signal<number | null>(null);
  /** Último perfil en uso de la app que ya se tomó como selección del Modo SOS. */
  private followedProfileId: number | null = null;
  private readonly sessionState = signal<SosSession | null>(null);
  private readonly inProgressState = signal<SosSession | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly profiles = computed(() => this.profilesState());
  readonly selectedProfileId = computed(() => this.selectedProfileIdState());
  readonly selectedProfile = computed(
    () => this.profilesState().find((p) => p.id === this.selectedProfileIdState()) ?? null,
  );
  /** Guía que el cuidador dejó a medias para el perfil elegido, si la hay. */
  readonly inProgress = computed(() => this.inProgressState());
  readonly session = computed(() => this.sessionState());
  readonly loading = computed(() => this.loadingState());
  /** Clave de public/i18n con el último error, o null. */
  readonly error = computed(() => this.errorState());

  /** Perfil al que pertenece la sesión que se está viendo. */
  readonly sessionProfile = computed(() => {
    const session = this.sessionState();
    return session ? (this.profilesState().find((p) => p.id === session.profileId) ?? null) : null;
  });

  /** Pasos de la sesión en el orden personalizado según las sensibilidades del perfil. */
  readonly steps = computed(() => {
    const guide = this.guideState();
    const profile = this.sessionProfile();
    return guide && profile ? guide.orderedStepsFor(profile.sensory) : [];
  });
  readonly currentStep = computed(() => {
    const session = this.sessionState();
    const steps = this.steps();
    return steps.find((s) => s.stepOrder === session?.currentStepOrder) ?? null;
  });
  /** Posición del paso actual empezando en 1, para "Paso 5 de 6". */
  readonly currentPosition = computed(() => {
    const step = this.currentStep();
    return step ? this.steps().indexOf(step) + 1 : 0;
  });
  readonly isLastStep = computed(
    () => this.currentPosition() > 0 && this.currentPosition() === this.steps().length,
  );
  /** Pasos atendidos, en el orden en que el cuidador los fue resolviendo. */
  readonly handledSteps = computed<HandledStep[]>(() => {
    const steps = this.steps();
    return (this.sessionState()?.completedSteps ?? []).flatMap((completed) => {
      const step = steps.find((s) => s.id === completed.stepId);
      return step ? [{ step, skipped: completed.skipped }] : [];
    });
  });

  constructor() {
    this.loadGuide();

    // Los perfiles a cargo se conocen cuando el cuidador termina de cargar
    effect(() => {
      const caregiver = this.profileStore.caregiver();
      untracked(() => {
        if (caregiver) {
          this.loadProfiles(caregiver.profileIds);
        }
      });
    });

    // Si cambia el perfil en uso de la app, el Modo SOS parte de ese perfil
    effect(() => {
      const preferred = this.profileStore.selectedProfileId();
      const profiles = this.profilesState();
      untracked(() => {
        const changed = preferred !== null && preferred !== this.followedProfileId;
        if (changed && profiles.some((profile) => profile.id === preferred)) {
          this.followedProfileId = preferred;
          this.selectedProfileIdState.set(preferred);
        }
      });
    });

    // Al cambiar de perfil se revisa si dejó una guía a medias
    effect(() => {
      const profileId = this.selectedProfileIdState();
      untracked(() => this.loadInProgress(profileId));
    });
  }

  selectProfile(profileId: number): void {
    this.errorState.set(null);
    this.selectedProfileIdState.set(profileId);
  }

  /**
   * Comando "Activar Modo SOS": crea la sesión con la guía vigente para el perfil elegido,
   * o retoma la que ya estaba abierta. Sin perfil seleccionado pide elegir uno.
   */
  activate(): Observable<SosSession> {
    const profile = this.selectedProfile();
    const caregiver = this.profileStore.caregiver();
    const guide = this.guideState();

    if (!profile) {
      this.errorState.set('sos.activation.selectProfile');
      return EMPTY;
    }
    if (!caregiver || !guide) {
      this.errorState.set('sos.loadError');
      return EMPTY;
    }

    const open = this.inProgressState();
    if (open) {
      this.sessionState.set(open);
      return of(open);
    }

    this.errorState.set(null);
    this.loadingState.set(true);
    const [firstStep] = guide.orderedStepsFor(profile.sensory);
    return this.sessionApi
      .start({
        profileId: profile.id,
        caregiverId: caregiver.id,
        guide,
        firstStepOrder: firstStep.stepOrder,
        trigger: profile.sensory.highestSensitivity(),
      })
      .pipe(
        tap((session) => {
          this.sessionState.set(session);
          this.inProgressState.set(session);
          this.loadingState.set(false);
        }),
        catchError(() => {
          this.errorState.set('sos.loadError');
          this.loadingState.set(false);
          return EMPTY;
        }),
      );
  }

  /** Abre una sesión por su identificador, por ejemplo al recargar la guía. */
  loadSession(sessionId: number): void {
    if (this.sessionState()?.id === sessionId) return;

    this.sessionState.set(null);
    this.sessionApi.getById(sessionId).subscribe({
      next: (session) => this.sessionState.set(session),
      error: () => this.errorState.set('sos.loadError'),
    });
  }

  /** Comando "Marcar paso como completado". */
  completeCurrentStep(): void {
    const step = this.currentStep();
    if (!step) return;
    this.apply((session) => session.completeStep(step, this.nextAfter(step)));
  }

  /** Omite el paso actual; si es obligatorio, `confirmed` debe venir de la confirmación del cuidador. */
  skipCurrentStep(confirmed: boolean): void {
    const step = this.currentStep();
    if (!step) return;
    this.apply((session) => session.skipStep(step, this.nextAfter(step), confirmed));
  }

  /** Comando "Finalizar episodio": calcula la duración y lo guarda en el historial. */
  finishEpisode(observedState: ObservedState | null): Observable<SosSession> {
    const session = this.sessionState();
    if (!session?.isInProgress()) return EMPTY;

    const finished = session.finish(this.steps().length, observedState);
    this.sessionState.set(finished);
    this.inProgressState.set(null);
    this.loadingState.set(true);
    return this.sessionApi.update(finished).pipe(
      tap(() => this.loadingState.set(false)),
      catchError(() => {
        this.errorState.set('sos.loadError');
        this.loadingState.set(false);
        return EMPTY;
      }),
    );
  }

  private loadGuide(): void {
    this.guideApi.getActive().subscribe({
      next: (guide) => this.guideState.set(guide),
      error: () => this.errorState.set('sos.loadError'),
    });
  }

  private loadProfiles(profileIds: number[]): void {
    this.profileContext.getProfiles(profileIds).subscribe({
      next: (profiles) => {
        this.profilesState.set(profiles);
        // Si la vista del Modo SOS todavía no eligió a nadie, se parte del perfil activo de la app
        if (this.selectedProfileIdState() === null) {
          const preferred = this.profileStore.selectedProfileId();
          const initial = profiles.find((p) => p.id === preferred) ?? profiles[0];
          this.selectedProfileIdState.set(initial?.id ?? null);
        }
      },
      error: () => this.errorState.set('sos.loadError'),
    });
  }

  private loadInProgress(profileId: number | null): void {
    if (profileId === null) {
      this.inProgressState.set(null);
      return;
    }
    this.sessionApi.getInProgressByProfileId(profileId).subscribe({
      next: (session) => this.inProgressState.set(session),
      error: () => this.errorState.set('sos.loadError'),
    });
  }

  private nextAfter(step: ContainmentStep): ContainmentStep | null {
    const steps = this.steps();
    return steps[steps.indexOf(step) + 1] ?? null;
  }

  private apply(command: (session: SosSession) => SosSession): void {
    const current = this.sessionState();
    if (!current?.isInProgress()) return;

    const next = command(current);
    this.sessionState.set(next);
    this.inProgressState.set(next);
    this.sessionApi.update(next).subscribe({
      error: () => this.errorState.set('sos.loadError'),
    });
  }
}
