import { ResourceType } from './calming-resource.enums';

/**
 * Aggregate Root. Recurso de calma del catálogo: un estímulo visual o auditivo
 * que el usuario puede usar durante una sesión de calma.
 */
export class CalmingResource {
  constructor(
    public readonly id: number,
    /** Identificador estable del recurso; sus textos traducidos están en public/i18n. */
    public readonly code: string,
    public readonly name: string,
    public readonly type: ResourceType,
    public readonly mediaUrl: string,
    public readonly maxIntensity: number,
    public readonly availableOffline: boolean,
    public readonly active: boolean,
  ) {}

  isVisual(): boolean {
    return this.type === ResourceType.VISUAL;
  }

  isAuditory(): boolean {
    return this.type === ResourceType.AUDITORY;
  }
}
