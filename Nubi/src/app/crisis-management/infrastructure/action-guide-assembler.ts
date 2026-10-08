import { Injectable } from '@angular/core';
import { ActionGuide } from '../domain/model/action-guide.entity';
import { AlternativeTechnique } from '../domain/model/alternative-technique.entity';
import { ContainmentStep } from '../domain/model/containment-step.entity';
import { SensoryTrigger } from '../domain/model/sos-session.enums';
import { ActionGuideResource } from './action-guide-response';

/** Traduce el recurso de la API en la guía de actuación. Las guías solo se leen. */
@Injectable({ providedIn: 'root' })
export class ActionGuideAssembler {
  toEntity(resource: ActionGuideResource): ActionGuide {
    return new ActionGuide(
      resource.id,
      resource.version,
      resource.active,
      resource.steps.map(
        (step) =>
          new ContainmentStep(
            step.id,
            step.guideId,
            step.stepOrder,
            step.code,
            step.mandatory,
            step.relatedTrigger as SensoryTrigger,
            step.alternativeTechniques.map(
              (technique) =>
                new AlternativeTechnique(technique.id, technique.stepId, technique.code),
            ),
          ),
      ),
    );
  }
}
