import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TitleStrategy, provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { ProfileStore } from './shared/application/profile.store';
import { TranslatedTitleStrategy } from './shared/presentation/translated-title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(routes),
    // PrimeVue v4 con tema Aura: todos los componentes de UI del perfil lo usan
    providePrimeNG({ theme: { preset: Aura } }),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    // Traducciones en public/i18n/es.json y public/i18n/en.json; español por defecto (es_419)
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'es',
    }),
    // Se espera a tener el español cargado para no mostrar las claves al abrir la app
    provideAppInitializer(() => firstValueFrom(inject(TranslateService).use('es'))),
    // Cuidador y perfil a cargo: los necesitan todas las vistas, con o sin barra lateral
    provideAppInitializer(() => inject(ProfileStore).load()),
  ],
};
