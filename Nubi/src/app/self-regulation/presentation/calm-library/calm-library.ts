import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ChildStore } from '../../../profile/application/child.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { relative } from '../../../shared/domain/dates';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { CalmSession, CalmingResource, RESOURCE_TYPES, ResourceType, lookOf } from '../../domain/model/calm';
import { CalmApi } from '../../infrastructure/calm-api';
import { TranslatePipe } from '@ngx-translate/core';
import { st, t, withTexts } from '../../../shared/infrastructure/i18n-bridge';
import { ServerTextPipe } from '../../../shared/presentation/server-text.pipe';

/**
 * Catálogo de recursos de calma adecuados para el niño. El backend ya filtra los que no van
 * con su perfil sensorial; aquí se explica cuáles se ocultaron y por qué.
 */
@Component({
  selector: 'app-calm-library',
  imports: [RouterLink, TranslatePipe, ServerTextPipe],
  templateUrl: './calm-library.html',
  styleUrl: './calm-library.css',
})
export class CalmLibrary implements OnInit {
  private readonly api = inject(CalmApi);
  private readonly toast = inject(ToastStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly lookOf = lookOf;
  protected readonly types = RESOURCE_TYPES;
  protected readonly relative = relative;
  protected readonly suitable = signal<CalmingResource[]>([]);
  protected readonly catalog = signal<CalmingResource[]>([]);
  protected readonly favoriteIds = signal<Set<number>>(new Set());
  protected readonly sessions = signal<CalmSession[]>([]);
  protected readonly filter = signal<ResourceType | 'ALL' | 'FAV'>('ALL');
  protected readonly loading = signal(true);

  protected readonly hidden = computed(() =>
    this.catalog().filter((resource) => !this.suitable().some((item) => item.id === resource.id)),
  );
  protected readonly hiddenNames = computed(() => this.hidden().map((resource) => st(resource.name)).join(', '));
  protected readonly shown = computed(() => {
    const filter = this.filter();
    return this.suitable().filter((resource) =>
      filter === 'ALL' ? true : filter === 'FAV' ? this.favoriteIds().has(resource.id) : resource.type === filter,
    );
  });
  protected readonly usage = computed(() => {
    const counts = new Map<number, number>();
    for (const session of this.sessions()) {
      if (session.resourceId) counts.set(session.resourceId, (counts.get(session.resourceId) ?? 0) + 1);
    }
    return counts;
  });
  protected readonly recent = computed(() =>
    [...this.sessions()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 5),
  );
  protected readonly filters: { id: ResourceType | 'ALL' | 'FAV'; label: string }[] = [
    withTexts({ id: 'ALL' as const }, { label: 'filters.ALL' }),
    withTexts({ id: 'FAV' as const }, { label: 'filters.FAV' }),
    withTexts({ id: 'VISUAL' as const }, { label: 'filters.VISUAL' }),
    withTexts({ id: 'AUDITORY' as const }, { label: 'filters.AUDITORY' }),
    withTexts({ id: 'GUIDED_BREATHING' as const }, { label: 'filters.GUIDED_BREATHING' }),
    withTexts({ id: 'DRAWING_CANVAS' as const }, { label: 'filters.DRAWING_CANVAS' }),
  ];

  private get childId(): number {
    return this.childStore.childId()!;
  }

  ngOnInit(): void {
    forkJoin({
      suitable: this.api.resources(this.childId),
      catalog: this.api.resources(),
      favorites: this.api.favorites(this.childId),
      sessions: this.api.sessions(this.childId),
    }).subscribe({
      next: ({ suitable, catalog, favorites, sessions }) => {
        this.suitable.set(suitable);
        this.catalog.set(catalog);
        this.favoriteIds.set(new Set(favorites.map((favorite) => favorite.resourceId)));
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  resourceName(id: number | null): string {
    return st(this.catalog().find((resource) => resource.id === id)?.name) || t('home.sesionDeCalma');
  }

  resourceCode(id: number | null): string {
    return this.catalog().find((resource) => resource.id === id)?.code ?? '';
  }

  toggleFavorite(resource: CalmingResource, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const isFavorite = this.favoriteIds().has(resource.id);
    const request = isFavorite
      ? this.api.removeFavorite(this.childId, resource.id)
      : this.api.markFavorite(this.childId, resource.id);
    request.subscribe({
      next: () => {
        const next = new Set(this.favoriteIds());
        if (isFavorite) next.delete(resource.id);
        else next.add(resource.id);
        this.favoriteIds.set(next);
        this.toast.ok(isFavorite ? t('calmLibrary.removedFavorite') : t('calmLibrary.addedFavorite', { emoji: lookOf(resource.code).emoji }));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }
}
