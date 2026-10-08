import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLanguage, I18nStore } from '../../../application/i18n.store';

/** Selector de idioma de la interfaz: es_419 / en_US. */
@Component({
  selector: 'app-language-switch',
  imports: [TranslatePipe],
  templateUrl: './language-switch.html',
  styleUrl: './language-switch.css',
})
export class LanguageSwitch {
  protected readonly i18n = inject(I18nStore);
  protected readonly languages: AppLanguage[] = ['es', 'en'];
}
