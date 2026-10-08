import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalmingResource } from '../domain/model/calming-resource.entity';
import { FavoriteResource } from '../domain/model/favorite-resource.entity';
import { CalmingResourceAssembler } from './calming-resource-assembler';
import { CalmingResourceResource, FavoriteResourceResource } from './calming-resource-response';

/** Mismas operaciones que CalmingResourceController en el diagrama de clases. */
@Injectable({ providedIn: 'root' })
export class CalmingResourceApi {
  private readonly http = inject(HttpClient);
  private readonly assembler = inject(CalmingResourceAssembler);
  private readonly resourcesEndpoint = `${environment.apiBaseUrl}${environment.calmingResourcesEndpoint}`;
  private readonly favoritesEndpoint = `${environment.apiBaseUrl}${environment.favoriteResourcesEndpoint}`;

  /** Catálogo de recursos de calma vigentes. */
  getActive(): Observable<CalmingResource[]> {
    return this.http
      .get<CalmingResourceResource[]>(this.resourcesEndpoint, { params: { active: true } })
      .pipe(map((resources) => this.assembler.toEntities(resources)));
  }

  getFavorites(profileId: number): Observable<FavoriteResource[]> {
    return this.http
      .get<FavoriteResourceResource[]>(this.favoritesEndpoint, { params: { profileId } })
      .pipe(map((resources) => this.assembler.toFavoriteEntities(resources)));
  }

  /** Comando "Marcar recurso como favorito". */
  markFavorite(profileId: number, resourceId: number): Observable<FavoriteResource> {
    return this.http
      .post<FavoriteResourceResource>(this.favoritesEndpoint, {
        profileId,
        resourceId,
        markedAt: new Date().toISOString(),
      })
      .pipe(map((resource) => this.assembler.toFavoriteEntity(resource)));
  }

  removeFavorite(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${this.favoritesEndpoint}/${favoriteId}`);
  }
}
