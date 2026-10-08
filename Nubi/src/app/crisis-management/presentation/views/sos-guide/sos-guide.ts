import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SosModeStore } from '../../../application/sos-mode.store';

/** Paso con el círculo de respiración animado. */
const BREATHING_STEP_CODE = 'CALM_BREATHING';

type DotState = 'done' | 'current' | 'pending';

/**
 * Guía SOS (US-08, US-09 y US-10): pantalla de foco único que muestra un paso de contención
 * a la vez, avisa qué sensibilidades del perfil cuidar y permite completar u omitir cada paso.
 */
@Component({
  selector: 'app-sos-guide',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './sos-guide.html',
  styleUrl: './sos-guide.css',
})
export class SosGuide {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(SosModeStore);

  private readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));

  /** Se pidió omitir un paso obligatorio: falta la confirmación explícita del cuidador. */
  protected readonly confirmingSkip = signal(false);

  protected readonly isBreathing = computed(
    () => this.store.currentStep()?.code === BREATHING_STEP_CODE,
  );
  protected readonly notices = computed(
    () => this.store.sessionProfile()?.sensory.highSensitivities() ?? [],
  );
  /** Sin sensibilidades registradas se usa la guía genérica y se sugiere completar el perfil. */
  protected readonly suggestsProfile = computed(() => {
    const profile = this.store.sessionProfile();
    return profile !== null && !profile.sensory.hasSensitivities();
  });
  protected readonly progress = computed(() => {
    const total = this.store.steps().length;
    return total === 0 ? 0 : (this.store.currentPosition() / total) * 100;
  });
  protected readonly dots = computed<DotState[]>(() => {
    const session = this.store.session();
    const current = this.store.currentStep();
    return this.store.steps().map((step) => {
      if (step === current) return 'current';
      return session?.hasHandled(step) ? 'done' : 'pending';
    });
  });

  constructor() {
    this.store.loadSession(this.sessionId);

    // Una sesión que ya terminó no tiene guía que seguir: se muestra su resumen
    effect(() => {
      const session = this.store.session();
      untracked(() => {
        if (session?.id === this.sessionId && !session.isInProgress()) {
          this.goToSummary();
        }
      });
    });
  }

  protected next(): void {
    const wasLast = this.store.isLastStep();
    this.confirmingSkip.set(false);
    this.store.completeCurrentStep();
    if (wasLast) this.goToSummary();
  }

  protected skip(): void {
    if (this.store.currentStep()?.mandatory) {
      this.confirmingSkip.set(true);
      return;
    }
    this.applySkip(false);
  }

  protected confirmSkip(): void {
    this.applySkip(true);
  }

  protected keepStep(): void {
    this.confirmingSkip.set(false);
  }

  /** Salir no cierra el episodio: la sesión queda en el último paso y se puede retomar. */
  protected exit(): void {
    this.router.navigate(['/modo-sos']);
  }

  private applySkip(confirmed: boolean): void {
    const wasLast = this.store.isLastStep();
    this.confirmingSkip.set(false);
    this.store.skipCurrentStep(confirmed);
    if (wasLast) this.goToSummary();
  }

  private goToSummary(): void {
    this.router.navigate(['/modo-sos/sesion', this.sessionId, 'resumen']);
  }
}
