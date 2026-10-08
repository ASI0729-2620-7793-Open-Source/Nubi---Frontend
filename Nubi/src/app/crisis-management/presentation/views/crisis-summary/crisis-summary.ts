import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SosModeStore } from '../../../application/sos-mode.store';
import { FINAL_INTENSITY_BY_STATE, ObservedState } from '../../../domain/model/sos-session.enums';

/** Tiempo que el aviso de episodio guardado queda a la vista antes de volver al inicio. */
const SAVED_NOTICE_MS = 2500;

/** Icono de Material para cada estado observado. */
const STATE_ICONS: Readonly<Record<ObservedState, string>> = {
  [ObservedState.CALM]: 'sentiment_satisfied_alt',
  [ObservedState.TIRED]: 'bedtime',
  [ObservedState.SENSITIVE]: 'hearing',
  [ObservedState.IRRITABLE]: 'sentiment_dissatisfied',
};

/**
 * Resumen de Crisis (US-11): al terminar la guía, o al darla por terminada, el cuidador
 * revisa la duración, las intensidades y los pasos, indica cómo se encuentra el usuario y
 * guarda el episodio en el historial.
 */
@Component({
  selector: 'app-crisis-summary',
  imports: [MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './crisis-summary.html',
  styleUrl: './crisis-summary.css',
})
export class CrisisSummary {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(SosModeStore);

  private readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly states = Object.values(ObservedState).map((state) => ({
    value: state,
    icon: STATE_ICONS[state],
  }));
  /** Cómo ve el cuidador al usuario; se guarda con el episodio. */
  protected readonly chosenState = signal<ObservedState | null>(null);
  protected readonly saved = signal(false);

  protected readonly session = computed(() => {
    const session = this.store.session();
    return session?.id === this.sessionId ? session : null;
  });
  protected readonly isFinished = computed(() => this.session()?.isInProgress() === false);
  protected readonly selectedState = computed(
    () => this.session()?.observedState ?? this.chosenState(),
  );
  /** Antes de guardar se muestra la intensidad que quedaría registrada con el estado elegido. */
  protected readonly finalIntensity = computed(() => {
    const state = this.selectedState();
    return this.session()?.finalIntensity ?? (state ? FINAL_INTENSITY_BY_STATE[state] : null);
  });

  constructor() {
    this.store.loadSession(this.sessionId);
    inject(DestroyRef).onDestroy(() => clearTimeout(this.leaveTimer));
  }

  protected choose(state: ObservedState): void {
    if (this.isFinished()) return;
    this.chosenState.set(state);
  }

  /** Comando "Finalizar episodio": se guarda y, tras el aviso, se vuelve al inicio. */
  protected save(): void {
    this.store.finishEpisode(this.chosenState()).subscribe(() => {
      this.saved.set(true);
      this.leaveTimer = setTimeout(() => this.router.navigate(['/inicio']), SAVED_NOTICE_MS);
    });
  }
}
