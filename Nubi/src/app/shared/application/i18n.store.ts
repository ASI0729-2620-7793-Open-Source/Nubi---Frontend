import { Injectable, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { bindTranslator, setLocale } from '../infrastructure/i18n-bridge';

export type AppLanguage = 'es' | 'en';

const STORAGE_KEY = 'nubi.lang';

/**
 * Idioma activo de la interfaz: español latinoamericano (es) e inglés (en), como la landing page.
 * Los textos están en public/i18n/es.json y en.json y se cargan con ngx-translate; en las vistas
 * se usan con el pipe `translate`. La elección se recuerda en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class I18nStore {
  private readonly translate = inject(TranslateService);

  readonly lang = computed<AppLanguage>(() => (this.translate.currentLang() === 'en' ? 'en' : 'es'));

  constructor() {
    bindTranslator((key, params) => this.translate.instant(key, params) as string);
  }

  /** Carga el idioma guardado (o el del navegador) antes de mostrar la primera pantalla. */
  init(): Promise<unknown> {
    const lang = this.initialLanguage();
    this.applyToDocument(lang);
    return firstValueFrom(this.translate.use(lang));
  }

  setLang(lang: AppLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // sin almacenamiento disponible: el idioma solo vale durante la sesión
    }
    this.applyToDocument(lang);
    this.translate.use(lang);
  }

  private initialLanguage(): AppLanguage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'es' || stored === 'en') return stored;
    } catch {
      // se usa el idioma del navegador
    }
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
  }

  private applyToDocument(lang: AppLanguage): void {
    document.documentElement.lang = lang === 'es' ? 'es-419' : 'en-US';
    setLocale(lang === 'es' ? 'es-PE' : 'en-US');
  }
}
