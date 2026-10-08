import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';

export interface RequestSentData {
  caregiverName: string;
  profileName: string;
  /** Clave de traducción de la frase del pictograma. */
  phraseKey: string;
}

/** Aviso de que la necesidad comunicada en el tablero ya llegó al cuidador. */
@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel,
    TranslatePipe,
  ],
  selector: 'app-request-sent-snackbar',
  styleUrl: './request-sent-snackbar.css',
  templateUrl: './request-sent-snackbar.html',
})
export class RequestSentSnackbar {
  protected readonly data = inject<RequestSentData>(MAT_SNACK_BAR_DATA);
  protected readonly snackBarRef = inject(MatSnackBarRef);
}
