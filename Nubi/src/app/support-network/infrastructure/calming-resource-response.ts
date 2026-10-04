/** Recursos tal como los devuelve la API falsa (json-server). */
export interface CalmingResourceResource {
  id: number;
  code: string;
  name: string;
  type: string;
  mediaUrl: string;
  maxIntensity: number;
  availableOffline: boolean;
  active: boolean;
}

export interface FavoriteResourceResource {
  id: number;
  profileId: number;
  resourceId: number;
  markedAt: string;
}
