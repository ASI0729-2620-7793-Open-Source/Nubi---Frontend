import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLanguage, I18nStore } from '../../application/i18n.store';

/** Selector de idioma de la interfaz: español (ES) o inglés (EN). */
@Component({
  selector: 'app-language-switch',
  imports: [TranslatePipe],
  template: `
    <div class="segmented lang" role="group" [attr.aria-label]="'common.language' | translate">
      @for (lang of languages; track lang) {
        <button
          type="button"
          [class.active]="i18n.lang() === lang"
          [attr.aria-pressed]="i18n.lang() === lang"
          (click)="i18n.setLang(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: `
    .lang {
      padding: 3px;
      gap: 2px;
    }
    .lang button {
      min-height: 28px;
      padding: 0 11px;
      font-size: 0.78rem;
    }
  `,
})
export class LanguageSwitch {
  protected readonly i18n = inject(I18nStore);
  protected readonly languages: AppLanguage[] = ['es', 'en'];
}
