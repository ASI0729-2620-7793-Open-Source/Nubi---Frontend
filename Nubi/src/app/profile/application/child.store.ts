import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { ChildProfile } from '../domain/model/child-profile';
import { ProfileApi } from '../infrastructure/profile-api';

/**
 * El niño que acompaña la cuenta. Hay uno solo: primero se busca el propio (cuidador
 * principal) y, si no hay, el de una familia que invitó a esta cuenta como cuidador.
 */
@Injectable({ providedIn: 'root' })
export class ChildStore {
  private readonly api = inject(ProfileApi);
  private readonly childState = signal<ChildProfile | null>(null);
  private readonly loadedState = signal(false);

  readonly child = this.childState.asReadonly();
  readonly loaded = this.loadedState.asReadonly();
  readonly childId = computed(() => this.childState()?.id ?? null);
  readonly name = computed(() => this.childState()?.displayName ?? '');
  /** El cuidador activó el modo de baja estimulación en el perfil sensorial. */
  readonly lowStimulation = computed(() => this.childState()?.sensoryProfile?.lowStimulationEnabled ?? false);

  constructor() {
    effect(() => document.documentElement.classList.toggle('low-stim', this.lowStimulation()));
  }

  /**
   * Carga (o recarga) al niño. Devuelve null si la cuenta todavía no registró ninguno y
   * undefined si el backend no respondió (no es lo mismo que "no tiene niño").
   */
  load(): Observable<ChildProfile | null | undefined> {
    return this.api.listOwned().pipe(
      switchMap((owned) =>
        owned.length > 0
          ? of(owned[0])
          : this.api.listAccessible().pipe(map((accessible) => accessible[0] ?? null)),
      ),
      catchError(() => of(undefined)),
      tap((child) => {
        if (child === undefined) return;
        this.childState.set(child);
        this.loadedState.set(true);
      }),
    );
  }

  ensureLoaded(): Promise<ChildProfile | null | undefined> {
    return this.loadedState() ? Promise.resolve(this.childState()) : firstValueFrom(this.load());
  }

  set(child: ChildProfile): void {
    this.childState.set(child);
    this.loadedState.set(true);
  }

  patch(change: Partial<ChildProfile>): void {
    this.childState.update((child) => (child ? { ...child, ...change } : child));
  }

  clear(): void {
    this.childState.set(null);
    this.loadedState.set(false);
  }
}
