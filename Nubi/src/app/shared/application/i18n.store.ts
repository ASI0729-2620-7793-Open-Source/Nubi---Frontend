import { Injectable, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'es' | 'en';

/**
 * Idioma activo de la interfaz, con los idiomas base del enunciado: Latin American
 * Spanish (es_419) e English (en_US). Los textos están en public/i18n/es.json y en.json
 * y se cargan con ngx-translate; en las vistas se usan con el pipe `translate`.
 */
@Injectable({ providedIn: 'root' })
export class I18nStore {
  private readonly translate = inject(TranslateService);

  readonly lang = computed<AppLanguage>(() =>
    this.translate.currentLang() === 'en' ? 'en' : 'es',
  );

  setLang(lang: AppLanguage): void {
    this.translate.use(lang);
    document.documentElement.lang = lang === 'es' ? 'es-419' : 'en-US';
  }
}
