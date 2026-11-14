import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CATEGORY_ICON, CommunicationBoard, Pictogram, pictogramVisual, speak } from '../../../communication/domain/model/board';
import { BoardApi } from '../../../communication/infrastructure/board-api';
import { ChildStore } from '../../../profile/application/child.store';

/**
 * Tablero grande para que el niño diga lo que necesita. Cada toque se lee en voz alta y
 * le llega al cuidador como un mensaje "por atender".
 */
@Component({
  selector: 'app-kid-talk',
  template: `
    @if (said(); as p) {
      <div class="bubble" (click)="repeat(p)">
        <span class="big">{{ visual(p).emoji ?? '🖼️' }}</span>
        <span>"{{ p.phrase }}"</span>
        <span class="icon fill">volume_up</span>
      </div>
    } @else {
      <h1>¿Qué quieres decir?</h1>
    }

    <div class="cats">
      <button type="button" [class.active]="category() === 'FAV'" (click)="category.set('FAV')">⭐</button>
      @for (cat of board()?.categories ?? []; track cat.id) {
        <button type="button" [class.active]="category() === cat.id" (click)="category.set(cat.id)">
          {{ categoryIcon[cat.type] }} <span>{{ cat.name }}</span>
        </button>
      }
    </div>

    <div class="grid">
      @for (pictogram of shown(); track pictogram.id) {
        <button type="button" class="picto" [class.pop]="said()?.id === pictogram.id" (click)="say(pictogram)">
          @if (visual(pictogram).image; as image) {
            <img [src]="image" alt="" />
          } @else {
            <span class="emoji">{{ visual(pictogram).emoji }}</span>
          }
          <strong>{{ pictogram.label }}</strong>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    h1 {
      text-align: center;
      font-size: clamp(1.8rem, 4.5vw, 2.6rem);
      font-weight: 800;
    }
    .bubble {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 0 auto;
      padding: 16px 28px;
      border-radius: 999px;
      background: #fff;
      box-shadow: var(--shadow-l);
      font-size: clamp(1.3rem, 3.5vw, 2rem);
      font-weight: 800;
      cursor: pointer;
      animation: rise 0.3s var(--ease);
    }
    .bubble .big {
      font-size: 2.6rem;
    }
    .bubble .icon {
      color: var(--teal-500);
      font-size: 32px;
    }
    .cats {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    .cats button {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 56px;
      padding: 0 20px;
      border: 3px solid transparent;
      border-radius: 999px;
      background: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: var(--shadow-s);
    }
    .cats button span {
      font-size: 1rem;
      font-weight: 800;
    }
    .cats button.active {
      border-color: var(--mint-400);
      background: var(--mint-50);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(170px, 44%), 1fr));
      gap: 14px;
    }
    .picto {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 22px 10px;
      border: 3px solid transparent;
      border-radius: var(--radius-xl);
      background: #fff;
      font-size: 1.3rem;
      cursor: pointer;
      box-shadow: var(--shadow-m);
      transition: transform 0.2s var(--ease);
    }
    .picto:active {
      transform: scale(0.95);
    }
    .picto.pop {
      border-color: var(--mint-400);
    }
    .emoji {
      font-size: clamp(3.4rem, 9vw, 4.6rem);
      line-height: 1.1;
    }
    .picto img {
      width: 90px;
      height: 90px;
      object-fit: contain;
    }
  `,
})
export class KidTalk implements OnInit {
  private readonly api = inject(BoardApi);
  private readonly childStore = inject(ChildStore);
  protected readonly visual = pictogramVisual;
  protected readonly categoryIcon = CATEGORY_ICON;
  protected readonly board = signal<CommunicationBoard | null>(null);
  protected readonly category = signal<number | 'FAV'>('FAV');
  protected readonly said = signal<Pictogram | null>(null);

  protected readonly shown = computed(() => {
    const board = this.board();
    if (!board) return [];
    const category = this.category();
    const list =
      category === 'FAV' ? board.pictograms.filter((p) => p.favorite) : board.pictograms.filter((p) => p.categoryId === category);
    return list.length || category !== 'FAV' ? list : board.pictograms.slice(0, 8);
  });

  ngOnInit(): void {
    this.api.board(this.childStore.childId()!).subscribe({ next: (board) => this.board.set(board), error: () => {} });
  }

  say(pictogram: Pictogram): void {
    this.said.set(pictogram);
    speak(pictogram.phrase || pictogram.label);
    this.api.select(this.childStore.childId()!, pictogram.id).subscribe({ error: () => {} });
  }

  repeat(pictogram: Pictogram): void {
    speak(pictogram.phrase || pictogram.label);
  }
}
