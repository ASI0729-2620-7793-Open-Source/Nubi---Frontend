import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NAVIGATION_LINKS } from '../../navigation-links';
import { LanguageSwitch } from '../language-switch/language-switch';

/**
 * Barra superior para pantallas sin barra lateral (sección 4.1.2.6 del informe):
 * - Tablet: navegación superior completa, con el acceso al Modo SOS.
 * - Mobile (compact): header compacto con menú hamburguesa.
 */
@Component({
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitch,
  ],
  selector: 'app-toolbar',
  styleUrl: './toolbar.css',
  templateUrl: './toolbar.html',
})
export class Toolbar {
  readonly compact = input(false);
  // Avisa al layout que se presionó el botón de menú.
  menuClick = output<void>();

  protected readonly links = NAVIGATION_LINKS;
}
