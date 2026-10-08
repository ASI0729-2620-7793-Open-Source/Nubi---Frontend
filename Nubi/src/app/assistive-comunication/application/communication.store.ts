import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { ProfileStore } from '../../shared/application/profile.store';
import { CommunicationRequest } from '../domain/model/communication-request.entity';
import { PICTOGRAM_CATALOG } from '../domain/model/pictogram-catalog';
import { Pictogram } from '../domain/model/pictogram.entity';
import { PictogramCategory } from '../domain/model/pictogram.enums';
import { CommunicationApi } from '../infrastructure/communication-api';

/**
 * Tablero CAA del perfil a cargo (pictogramas, orden y favoritos) y las necesidades que
 * comunicó con él. Las solicitudes se recargan solas al cambiar el perfil a cargo.
 */
@Injectable({ providedIn: 'root' })
export class CommunicationStore {
  private readonly communicationApi = inject(CommunicationApi);
  private readonly profileStore = inject(ProfileStore);

  private readonly pictogramsState = signal<Pictogram[]>([...PICTOGRAM_CATALOG]);
  private readonly categoryFilterState = signal<PictogramCategory | null>(
    PictogramCategory.BASIC_NEEDS,
  );
  private readonly requestsState = signal<CommunicationRequest[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  /** Categoría que muestra el tablero; null equivale a "Todos". */
  readonly categoryFilter = computed(() => this.categoryFilterState());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  readonly boardPictograms = computed(() => {
    const category = this.categoryFilterState();
    return this.pictogramsState().filter(
      (pictogram) => category === null || pictogram.category === category,
    );
  });

  /** Lo último que comunicó el perfil: es lo que ve su cuidador en Inicio. */
  readonly latestRequest = computed(() =>
    this.requestsState().reduce<CommunicationRequest | null>(
      (latest, request) =>
        latest === null || request.requestedAt > latest.requestedAt ? request : latest,
      null,
    ),
  );

  readonly pendingCount = computed(
    () => this.requestsState().filter((request) => request.isPending()).length,
  );

  constructor() {
    effect(() => {
      const profileId = this.profileStore.selectedProfileId();
      untracked(() => {
        if (profileId !== null) {
          this.load(profileId);
        }
      });
    });
  }

  load(profileId: number): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.communicationApi
      .getRequests(profileId)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (requests) => this.requestsState.set(requests),
        error: () => this.errorState.set('board.loadError'),
      });
  }

  findByCode(code: string): Pictogram | null {
    return this.pictogramsState().find((pictogram) => pictogram.code === code) ?? null;
  }

  filterByCategory(category: PictogramCategory | null): void {
    this.categoryFilterState.set(category);
  }

  toggleFavorite(pictogram: Pictogram): void {
    this.pictogramsState.update((pictograms) =>
      pictograms.map((item) => (item.id === pictogram.id ? item.toggleFavorite() : item)),
    );
  }

  /** Mueve un pictograma dentro de lo que el tablero muestra, respetando el filtro activo. */
  movePictogram(previousIndex: number, currentIndex: number): void {
    const visible = this.boardPictograms();
    const moved = visible[previousIndex];
    const target = visible[currentIndex];
    if (!moved || !target || moved === target) return;

    this.pictogramsState.update((pictograms) => {
      const reordered = [...pictograms];
      const targetIndex = reordered.indexOf(target);
      reordered.splice(reordered.indexOf(moved), 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered;
    });
  }

  /** Comando "Comunicar necesidad": se emite cuando ya quedó guardada. */
  communicate(pictogram: Pictogram): Observable<CommunicationRequest> | null {
    const profileId = this.profileStore.selectedProfileId();
    if (profileId === null) return null;

    this.errorState.set(null);
    return this.communicationApi
      .createRequest(CommunicationRequest.create(profileId, pictogram))
      .pipe(
        tap({
          next: (created) => this.requestsState.update((requests) => [...requests, created]),
          error: () => this.errorState.set('board.sendError'),
        }),
      );
  }

  /** Comando "Confirmar recepción" sobre la última necesidad comunicada. */
  confirmLatest(): void {
    const request = this.latestRequest();
    const caregiver = this.profileStore.caregiver();
    if (!request || !request.isPending() || !caregiver) return;

    this.errorState.set(null);
    this.communicationApi.updateRequest(request.confirm(caregiver.id)).subscribe({
      next: (confirmed) =>
        this.requestsState.update((requests) =>
          requests.map((item) => (item.id === confirmed.id ? confirmed : item)),
        ),
      error: () => this.errorState.set('home.confirmError'),
    });
  }
}
