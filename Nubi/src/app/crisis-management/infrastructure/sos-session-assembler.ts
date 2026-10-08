import { Injectable } from '@angular/core';
import { CompletedStep } from '../domain/model/completed-step.entity';
import { SosSession } from '../domain/model/sos-session.entity';
import {
  CrisisIntensity,
  ObservedState,
  SensoryTrigger,
  SosSessionStatus,
} from '../domain/model/sos-session.enums';
import { SosSessionResource } from './sos-session-response';

/** Traduce entre los recursos de la API y el agregado SosSession, en ambos sentidos. */
@Injectable({ providedIn: 'root' })
export class SosSessionAssembler {
  toEntity(resource: SosSessionResource): SosSession {
    return new SosSession(
      resource.id,
      resource.profileId,
      resource.caregiverId,
      resource.guideId,
      resource.status as SosSessionStatus,
      resource.currentStepOrder,
      resource.initialIntensity as CrisisIntensity,
      resource.finalIntensity as CrisisIntensity | null,
      resource.trigger as SensoryTrigger,
      resource.observedState as ObservedState | null,
      new Date(resource.startedAt),
      resource.finishedAt ? new Date(resource.finishedAt) : null,
      resource.completedSteps.map(
        (step) => new CompletedStep(step.stepId, step.skipped, new Date(step.completedAt)),
      ),
    );
  }

  toResource(session: SosSession): SosSessionResource {
    return {
      id: session.id,
      profileId: session.profileId,
      caregiverId: session.caregiverId,
      guideId: session.guideId,
      status: session.status,
      currentStepOrder: session.currentStepOrder,
      initialIntensity: session.initialIntensity,
      finalIntensity: session.finalIntensity,
      trigger: session.trigger,
      observedState: session.observedState,
      startedAt: session.startedAt.toISOString(),
      finishedAt: session.finishedAt ? session.finishedAt.toISOString() : null,
      completedSteps: session.completedSteps.map((step) => ({
        stepId: step.stepId,
        skipped: step.skipped,
        completedAt: step.completedAt.toISOString(),
      })),
    };
  }
}
