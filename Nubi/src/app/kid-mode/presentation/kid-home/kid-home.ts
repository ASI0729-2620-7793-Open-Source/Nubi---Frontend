import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { WellbeingStore } from '../../../insights/application/wellbeing.store';
import { ChildStore } from '../../../profile/application/child.store';
import { nextStep } from '../../../routine/domain/model/routine-step';
import { CalmingResource, lookOf } from '../../../self-regulation/domain/model/calm';
import { CalmApi } from '../../../self-regulation/infrastructure/calm-api';
import { MoodLevel } from '../../../shared/domain/mood';
import { MoodPicker } from '../../../shared/presentation/mood-picker/mood-picker';

/**
 * Inicio del modo niño: "¿Cómo te sientes?" y, según la respuesta, lo que más le ayuda a
 * relajarse (sus favoritos primero). Pocas opciones, grandes y con dibujos.
 */
@Component({
  selector: 'app-kid-home',
  imports: [RouterLink, MoodPicker],
  templateUrl: './kid-home.html',
  styleUrl: './kid-home.css',
})
export class KidHome implements OnInit {
  private readonly calmApi = inject(CalmApi);
  protected readonly childStore = inject(ChildStore);
  protected readonly wellbeing = inject(WellbeingStore);

  protected readonly lookOf = lookOf;
  protected readonly resources = signal<CalmingResource[]>([]);
  protected readonly favoriteIds = signal<Set<number>>(new Set());
  protected readonly answered = signal<MoodLevel | null>(null);

  /** Favoritos primero; si está alterado, la respiración va al inicio. */
  protected readonly ordered = computed(() => {
    const favorites = this.favoriteIds();
    const hard = this.answered() === 'ALTERED' || this.answered() === 'CRISIS';
    return [...this.resources()]
      .sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)))
      .sort((a, b) => (hard ? Number(b.type === 'GUIDED_BREATHING') - Number(a.type === 'GUIDED_BREATHING') : 0))
      .slice(0, 6);
  });
  protected readonly next = computed(() => nextStep(this.wellbeing.routine()));
  protected readonly message = computed(() => {
    switch (this.answered()) {
      case 'CALM':
        return { emoji: '🌟', text: '¡Qué bien! ¿Jugamos a algo tranquilo?' };
      case 'RESTLESS':
        return { emoji: '🫧', text: 'Vamos a descansar un ratito.' };
      case 'ALTERED':
        return { emoji: '🎈', text: 'Respiremos juntos, despacito.' };
      case 'CRISIS':
        return { emoji: '💙', text: 'Estoy contigo. Llama a un adulto y respiremos.' };
      default:
        return null;
    }
  });

  ngOnInit(): void {
    this.wellbeing.load();
    const id = this.childStore.childId()!;
    forkJoin({ resources: this.calmApi.resources(id), favorites: this.calmApi.favorites(id) }).subscribe({
      next: ({ resources, favorites }) => {
        this.resources.set(resources);
        this.favoriteIds.set(new Set(favorites.map((favorite) => favorite.resourceId)));
      },
      error: () => {},
    });
  }

  feel(level: MoodLevel): void {
    this.answered.set(level);
    this.wellbeing.registerMood(level).subscribe({
      next: (mood) => this.wellbeing.addMood(mood),
      error: () => {},
    });
  }
}
