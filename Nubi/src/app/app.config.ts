import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-PE';
import { TitleStrategy, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { I18nStore } from './shared/application/i18n.store';
import { accountHeaderInterceptor } from './shared/infrastructure/account-header.interceptor';
import { TranslatedTitleStrategy } from './shared/presentation/translated-title-strategy';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([accountHeaderInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    // Traducciones en public/i18n/es.json y public/i18n/en.json; español por defecto
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'es',
    }),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    // Se espera a tener el idioma cargado para no mostrar las claves al abrir la app
    provideAppInitializer(() => inject(I18nStore).init()),
  ],
};
