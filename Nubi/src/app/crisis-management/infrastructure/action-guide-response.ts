/** Recursos tal como los devuelve la API falsa (json-server). */
export interface AlternativeTechniqueResource {
  id: number;
  stepId: number;
  code: string;
}

export interface ContainmentStepResource {
  id: number;
  guideId: number;
  stepOrder: number;
  code: string;
  mandatory: boolean;
  relatedTrigger: string;
  alternativeTechniques: AlternativeTechniqueResource[];
}

export interface ActionGuideResource {
  id: number;
  version: number;
  active: boolean;
  steps: ContainmentStepResource[];
}
