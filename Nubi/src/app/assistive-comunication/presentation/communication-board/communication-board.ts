import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileStore } from '../../../shared/application/profile.store';
import { CommunicationStore } from '../../application/communication.store';
import { Pictogram } from '../../domain/model/pictogram.entity';
import { PictogramCategory } from '../../domain/model/pictogram.enums';
import {
  RequestSentData,
  RequestSentSnackbar,
} from '../component/request-sent-snackbar/request-sent-snackbar';

/** Valor del filtro "Todos": el listbox de Material necesita un valor para cada opción. */
const ALL_CATEGORIES = 'ALL';

/**
 * Configurar tablero CAA: los pictogramas del perfil, filtrables por categoría, que se
 * pueden reordenar y marcar como favoritos. Al tocar uno se comunica esa necesidad y se
 * avisa al cuidador.
 */
@Component({
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    RouterLink,
    TranslatePipe,
  ],
  selector: 'app-communication-board',
  styleUrl: './communication-board.css',
  templateUrl: './communication-board.html',
})
export class CommunicationBoard {
  private readonly snackBar = inject(MatSnackBar);
  protected readonly store = inject(CommunicationStore);
  protected readonly profileStore = inject(ProfileStore);

  protected readonly filters = [
    { value: ALL_CATEGORIES, labelKey: 'board.all' },
    { value: PictogramCategory.BASIC_NEEDS, labelKey: 'pictogramCategories.BASIC_NEEDS' },
    { value: PictogramCategory.EMOTIONS, labelKey: 'pictogramCategories.EMOTIONS' },
    { value: PictogramCategory.ACTIVITIES, labelKey: 'pictogramCategories.ACTIVITIES' },
  ];

  protected readonly selectedFilter = computed(() => this.store.categoryFilter() ?? ALL_CATEGORIES);

  /** Pictograma de la necesidad que todavía espera la confirmación del cuidador. */
  protected readonly selectedCode = computed(() => {
    const request = this.store.latestRequest();
    return request?.isPending() ? request.pictogramCode : null;
  });

  protected filterBy(change: MatChipListboxChange): void {
    // Tocar el filtro activo lo desmarcaría: siempre queda uno elegido
    if (!change.value) {
      change.source.value = this.selectedFilter();
      return;
    }
    this.store.filterByCategory(change.value === ALL_CATEGORIES ? null : change.value);
  }

  protected drop(event: CdkDragDrop<unknown>): void {
    this.store.movePictogram(event.previousIndex, event.currentIndex);
  }

  protected select(pictogram: Pictogram): void {
    // Si falla, el store deja el error y la vista lo muestra
    this.store.communicate(pictogram)?.subscribe({
      next: () => this.notifySent(pictogram),
      error: () => undefined,
    });
  }

  private notifySent(pictogram: Pictogram): void {
    const data: RequestSentData = {
      caregiverName: this.profileStore.caregiver()?.fullName.split(' ')[0] ?? '',
      profileName: this.profileStore.selectedProfile()?.shortName ?? '',
      phraseKey: `pictograms.${pictogram.code}.phrase`,
    };

    this.snackBar.openFromComponent(RequestSentSnackbar, {
      data,
      duration: 6000,
      verticalPosition: 'top',
      panelClass: 'nubi-snackbar',
    });
  }
}
