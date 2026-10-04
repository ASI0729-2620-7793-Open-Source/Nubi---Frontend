import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * El `title` de cada ruta es una clave de public/i18n: así el título de la pestaña del
 * navegador sale en el idioma activo y se actualiza al cambiarlo.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private titleKey: string | undefined;

  constructor() {
    super();
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this.applyTitle());
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.titleKey = this.buildTitle(snapshot);
    this.applyTitle();
  }

  private applyTitle(): void {
    if (this.titleKey) {
      this.title.setTitle(`${this.translate.instant(this.titleKey)} · Nubi`);
    }
  }
}
