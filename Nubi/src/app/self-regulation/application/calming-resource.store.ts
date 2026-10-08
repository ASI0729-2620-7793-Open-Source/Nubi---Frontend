import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { ProfileStore } from '../../shared/application/profile.store';
import { CalmingResource } from '../domain/model/calming-resource.entity';
import { ResourceType } from '../domain/model/calming-resource.enums';
import { FavoriteResource } from '../domain/model/favorite-resource.entity';
import { SensoryProfileSnapshot } from '../domain/model/sensory-profile-snapshot';
import { CalmingResourceApi } from '../infrastructure/calming-resource-api';
import { ProfileContextFacade } from '../infrastructure/profile-context-facade';

/**
 * Catálogo de recursos de calma, favoritos del perfil y orden de la galería.
 * Se recarga solo al cambiar el perfil a cargo.
 */
@Injectable({ providedIn: 'root' })
export class CalmingResourceStore {
  private readonly resourceApi = inject(CalmingResourceApi);
  private readonly profileFacade = inject(ProfileContextFacade);
  private readonly profileStore = inject(ProfileStore);

  private readonly resourcesState = signal<CalmingResource[]>([]);
  private readonly favoritesState = signal<FavoriteResource[]>([]);
  private readonly sensoryProfileState = signal<SensoryProfileSnapshot | null>(null);
  private readonly typeFilterState = signal<ResourceType | null>(null);
  private readonly favoritesOnlyState = signal(false);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly resources = computed(() => this.resourcesState());
  readonly sensoryProfile = computed(() => this.sensoryProfileState());
  /** Tipo de estímulo que muestra la galería; null equivale a "Todos". */
  readonly typeFilter = computed(() => this.typeFilterState());
  readonly favoritesOnly = computed(() => this.favoritesOnlyState());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  private readonly favoriteIds = computed(
    () => new Set(this.favoritesState().map((favorite) => favorite.resourceId)),
  );

  /** Recursos de la galería: solo los del tipo elegido y, con "Favoritos", solo los marcados. */
  readonly galleryResources = computed(() => {
    const type = this.typeFilterState();
    const favorites = this.favoriteIds();
    return this.resourcesState().filter(
      (resource) =>
        (type === null || resource.type === type) &&
        (!this.favoritesOnlyState() || favorites.has(resource.id)),
    );
  });

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

  /** Política "Recursos de calma según el perfil sensorial". */
  load(profileId: number): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      resources: this.resourceApi.getActive(),
      favorites: this.resourceApi.getFavorites(profileId),
      sensoryProfile: this.profileFacade.getSensoryProfile(profileId),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ resources, favorites, sensoryProfile }) => {
          this.resourcesState.set(resources);
          this.favoritesState.set(favorites);
          this.sensoryProfileState.set(sensoryProfile);
          this.typeFilterState.set(sensoryProfile.preferredResourceType());
          this.favoritesOnlyState.set(false);
        },
        error: () => this.errorState.set('gallery.loadError'),
      });
  }

  findById(resourceId: number): CalmingResource | null {
    return this.resourcesState().find((resource) => resource.id === resourceId) ?? null;
  }

  isFavorite(resourceId: number): boolean {
    return this.favoriteIds().has(resourceId);
  }

  filterByType(type: ResourceType | null): void {
    this.typeFilterState.set(type);
  }

  toggleFavoritesOnly(): void {
    this.favoritesOnlyState.update((value) => !value);
  }

  /** Comando "Marcar recurso como favorito", o lo desmarca si ya lo era. */
  toggleFavorite(resource: CalmingResource): void {
    const profileId = this.profileStore.selectedProfileId();
    if (profileId === null) return;

    const favorite = this.favoritesState().find((item) => item.resourceId === resource.id);
    if (favorite) {
      this.resourceApi.removeFavorite(favorite.id).subscribe({
        next: () =>
          this.favoritesState.update((items) => items.filter((item) => item.id !== favorite.id)),
        error: () => this.errorState.set('gallery.loadError'),
      });
      return;
    }

    this.resourceApi.markFavorite(profileId, resource.id).subscribe({
      next: (created) => this.favoritesState.update((items) => [...items, created]),
      error: () => this.errorState.set('gallery.loadError'),
    });
  }
}
