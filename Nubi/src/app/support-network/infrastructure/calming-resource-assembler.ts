import { Injectable } from '@angular/core';
import { CalmingResource } from '../domain/model/calming-resource.entity';
import { ResourceType } from '../domain/model/calming-resource.enums';
import { FavoriteResource } from '../domain/model/favorite-resource.entity';
import { CalmingResourceResource, FavoriteResourceResource } from './calming-resource-response';

/** Traduce los recursos de la API a entidades del dominio. */
@Injectable({ providedIn: 'root' })
export class CalmingResourceAssembler {
  toEntity(resource: CalmingResourceResource): CalmingResource {
    return new CalmingResource(
      resource.id,
      resource.code,
      resource.name,
      resource.type as ResourceType,
      resource.mediaUrl,
      resource.maxIntensity,
      resource.availableOffline,
      resource.active,
    );
  }

  toEntities(resources: CalmingResourceResource[]): CalmingResource[] {
    return resources.map((resource) => this.toEntity(resource));
  }

  toFavoriteEntity(resource: FavoriteResourceResource): FavoriteResource {
    return new FavoriteResource(
      resource.id,
      resource.profileId,
      resource.resourceId,
      new Date(resource.markedAt),
    );
  }

  toFavoriteEntities(resources: FavoriteResourceResource[]): FavoriteResource[] {
    return resources.map((resource) => this.toFavoriteEntity(resource));
  }
}
