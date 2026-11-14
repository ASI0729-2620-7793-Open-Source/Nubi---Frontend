import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nStore } from '../application/i18n.store';
import { st } from '../infrastructure/i18n-bridge';

/**
 * Traduce los textos que vienen del backend (catálogo de calma, guía SOS, pictogramas base...).
 * Lo que no tiene traducción, como un pictograma creado por la familia, se muestra tal cual.
 * Es impuro para volver a calcularse cuando cambia el idioma.
 */
@Pipe({ name: 'serverText', pure: false })
export class ServerTextPipe implements PipeTransform {
  private readonly i18n = inject(I18nStore);

  transform(value: string | null | undefined): string {
    this.i18n.lang();
    return st(value);
  }
}
