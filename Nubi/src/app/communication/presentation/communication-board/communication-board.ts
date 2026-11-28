import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ChildStore } from '../../../profile/application/child.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { relative } from '../../../shared/domain/dates';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import {
  CATEGORY_ICON,
  CommunicationBoard,
  Pictogram,
  PictogramSelection,
  SELECTION_STATUS,
  pictogramVisual,
  speak,
} from '../../domain/model/board';
import { BoardApi } from '../../infrastructure/board-api';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';
import { ArasaacApi } from '../../infrastructure/arasaac-api';
import { I18nStore } from '../../../shared/application/i18n.store';
import { ServerTextPipe } from '../../../shared/presentation/server-text.pipe';

/**
 * Tablero de pictogramas del niño. El cuidador lo prueba, marca favoritos (acceso rápido en el
 * modo niño), crea pictogramas propios y atiende los mensajes que el niño envió.
 */
@Component({
  selector: 'app-communication-board',
  imports: [FormsModule, RouterLink, TranslatePipe, ServerTextPipe],
  templateUrl: './communication-board.html',
  styleUrl: './communication-board.css',
})
export class CommunicationBoardPage implements OnInit {
  private readonly api = inject(BoardApi);
  private readonly toast = inject(ToastStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly visual = pictogramVisual;
  protected readonly categoryIcon = CATEGORY_ICON;
  protected readonly statuses = SELECTION_STATUS;
  protected readonly relative = relative;

  protected readonly board = signal<CommunicationBoard | null>(null);
  protected readonly selections = signal<PictogramSelection[]>([]);
  protected readonly categoryId = signal<number | 'FAV' | null>(null);
  protected readonly dialog = signal<'pictogram' | 'category' | null>(null);
  protected readonly loading = signal(true);
  protected newCategory = '';
  protected newPictogram = { label: '', phrase: '', emoji: '🍪', image: '', categoryId: 0 };
  protected readonly arasaac = signal<string[]>([]);
  protected readonly searching = signal(false);
  private readonly arasaacApi = inject(ArasaacApi);
  private readonly i18n = inject(I18nStore);
  protected readonly emojiChoices = ['🍪', '🥤', '🍌', '🍕', '🛝', '📺', '🎮', '🐱', '🚗', '🖍️', '🧦', '🤗', '😴', '🤒', '🙅', '👍', '🏠', '🌳', '🧃', '🎧'];

  protected readonly favorites = computed(() => this.board()?.pictograms.filter((p) => p.favorite) ?? []);
  protected readonly shown = computed(() => {
    const board = this.board();
    const category = this.categoryId();
    if (!board) return [];
    if (category === 'FAV') return this.favorites();
    return board.pictograms
      .filter((pictogram) => pictogram.categoryId === category)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });
  protected readonly pending = computed(() =>
    this.selections().filter((s) => s.status === 'PENDING_DELIVERY' || s.status === 'DELIVERED'),
  );
  protected readonly history = computed(() =>
    [...this.selections()].sort((a, b) => b.selectedAt.localeCompare(a.selectedAt)).slice(0, 12),
  );
  protected readonly understoodShare = computed(() => {
    const answered = this.selections().filter((s) => s.status === 'UNDERSTOOD' || s.status === 'NOT_UNDERSTOOD');
    return answered.length ? Math.round((answered.filter((s) => s.status === 'UNDERSTOOD').length / answered.length) * 100) : null;
  });

  private get childId(): number {
    return this.childStore.childId()!;
  }

  ngOnInit(): void {
    forkJoin({ board: this.api.board(this.childId), selections: this.api.selections(this.childId) }).subscribe({
      next: ({ board, selections }) => {
        this.board.set(board);
        this.selections.set(selections);
        this.categoryId.set(board.categories[0]?.id ?? null);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  pictogram(id: number): Pictogram | undefined {
    return this.board()?.pictograms.find((pictogram) => pictogram.id === id);
  }

  say(pictogram: Pictogram): void {
    speak(pictogram.phrase || pictogram.label);
    this.api.select(this.childId, pictogram.id).subscribe({
      next: (selection) => this.selections.update((list) => [...list, selection]),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  toggleFavorite(pictogram: Pictogram, event: Event): void {
    event.stopPropagation();
    this.api.favorite(this.childId, pictogram.id, !pictogram.favorite).subscribe({
      next: (updated) => this.replace(updated),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  mark(selection: PictogramSelection, step: 'delivered' | 'understood' | 'not-understood'): void {
    const chain =
      step !== 'delivered' && selection.status === 'PENDING_DELIVERY'
        ? this.api.markSelection(this.childId, selection.id, 'delivered')
        : null;
    const run = () =>
      this.api.markSelection(this.childId, selection.id, step).subscribe({
        next: (updated) => this.selections.update((list) => list.map((s) => (s.id === updated.id ? updated : s))),
        error: (error) => this.toast.error(apiErrorMessage(error)),
      });
    if (chain) chain.subscribe({ next: () => run(), error: (error) => this.toast.error(apiErrorMessage(error)) });
    else run();
  }

  openPictogram(): void {
    const category = this.categoryId();
    this.newPictogram = {
      label: '',
      phrase: '',
      emoji: '🍪',
      image: '',
      categoryId: typeof category === 'number' ? category : (this.board()?.categories[0]?.id ?? 0),
    };
    this.arasaac.set([]);
    this.dialog.set('pictogram');
  }

  searchArasaac(): void {
    const term = this.newPictogram.label.trim();
    if (!term) {
      this.toast.error(t('communicationBoard.escribeUnaPalabraPara'));
      return;
    }
    this.searching.set(true);
    this.arasaacApi.search(term, this.i18n.lang() === 'en' ? 'en' : 'es').subscribe({
      next: (images) => {
        this.arasaac.set(images);
        this.searching.set(false);
        if (!images.length) this.toast.error(t('arasaac.empty'));
      },
      error: () => {
        this.searching.set(false);
        this.toast.error(t('arasaac.empty'));
      },
    });
  }

  createPictogram(): void {
    const { label, phrase, emoji, image, categoryId } = this.newPictogram;
    if (!label.trim()) {
      this.toast.error(t('communicationBoard.escribeUnaPalabraPara'));
      return;
    }
    this.api
      .createPictogram(this.childId, { label: label.trim(), phrase: phrase.trim() || label.trim(), imageUrl: image || `emoji:${emoji}`, categoryId: Number(categoryId) })
      .subscribe({
        next: (pictogram) => {
          this.board.update((board) => (board ? { ...board, pictograms: [...board.pictograms, pictogram] } : board));
          this.categoryId.set(pictogram.categoryId);
          this.dialog.set(null);
          this.toast.ok(t('communicationBoard.yaEstaEnSu', { p0: emoji, p1: pictogram.label }));
        },
        error: (error) => this.toast.error(apiErrorMessage(error)),
      });
  }

  createCategory(): void {
    if (!this.newCategory.trim()) return;
    this.api.createCategory(this.childId, this.newCategory.trim()).subscribe({
      next: (category) => {
        this.board.update((board) => (board ? { ...board, categories: [...board.categories, category] } : board));
        this.categoryId.set(category.id);
        this.newCategory = '';
        this.dialog.set(null);
        this.toast.ok(t('communicationBoard.categoriaCreada'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  private replace(pictogram: Pictogram): void {
    this.board.update((board) =>
      board ? { ...board, pictograms: board.pictograms.map((p) => (p.id === pictogram.id ? pictogram : p)) } : board,
    );
  }
}
