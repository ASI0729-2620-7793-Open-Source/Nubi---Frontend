import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

const API = 'https://api.arasaac.org/v1/pictograms';
const IMAGES = 'https://static.arasaac.org/pictograms';

/**
 * Servicio externo: buscador de pictogramas de ARASAAC (Gobierno de Aragón, licencia
 * CC BY-NC-SA, autor Sergio Palao). Solo se envía la palabra buscada.
 */
@Injectable({ providedIn: 'root' })
export class ArasaacApi {
  private readonly http = inject(HttpClient);

  search(term: string, language: string): Observable<string[]> {
    return this.http
      .get<{ _id: number }[]>(`${API}/${language}/search/${encodeURIComponent(term)}`)
      .pipe(map((found) => found.slice(0, 12).map((item) => `${IMAGES}/${item._id}/${item._id}_300.png`)));
  }
}
